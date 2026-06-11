"""
BDD-style API tests for the accounts app.

Each test reads as Given / When / Then and covers one behaviour of the
auth API that the frontend depends on.
"""
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class ApiTestCase(TestCase):
    """Base case: resets the throttle cache so rate limits don't leak
    between tests (they accumulate in the shared cache otherwise)."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()


VALID_STUDENT = {
    "full_name": "Test Student",
    "email": "student@example.com",
    "password": "StrongPass123!",
    "role": "student",
}


class RegisterScenarios(ApiTestCase):
    """Feature: visitors can create an account."""

    def register(self, **overrides):
        payload = {**VALID_STUDENT, **overrides}
        return self.client.post("/api/auth/register/", payload, format="json")

    def test_valid_student_registration_creates_account(self):
        """Given valid details, when registering, then the account exists
        and the password is stored hashed (never plaintext)."""
        response = self.register()
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email=VALID_STUDENT["email"])
        self.assertEqual(user.role, "student")
        self.assertNotEqual(user.password, VALID_STUDENT["password"])
        self.assertTrue(user.check_password(VALID_STUDENT["password"]))

    def test_consultant_registration_is_allowed(self):
        """Given the consultant role, when registering, then it succeeds."""
        response = self.register(email="cons@example.com", role="consultant")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["role"], "consultant")

    def test_duplicate_email_is_rejected_with_field_error(self):
        """Given an email already in use, when registering again,
        then a 400 with an email field error is returned."""
        self.register()
        response = self.register(full_name="Someone Else")
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_weak_password_is_rejected_with_field_error(self):
        """Given a too-short/common password, when registering,
        then a 400 with a password field error is returned."""
        response = self.register(password="123")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_admin_role_cannot_be_self_assigned(self):
        """Given a visitor claiming the admin role, when registering,
        then the API refuses (admins are created internally only)."""
        response = self.register(email="bad@example.com", role="admin")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email="bad@example.com").exists())


class LoginScenarios(ApiTestCase):
    """Feature: registered users can log in and receive JWT tokens."""

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email=VALID_STUDENT["email"],
            password=VALID_STUDENT["password"],
            full_name=VALID_STUDENT["full_name"],
        )

    def login(self, email=None, password=None):
        return self.client.post(
            "/api/auth/login/",
            {
                "email": email or VALID_STUDENT["email"],
                "password": password or VALID_STUDENT["password"],
            },
            format="json",
        )

    def test_valid_credentials_return_tokens_and_user(self):
        """Given valid credentials, when logging in, then the response carries
        access + refresh tokens and the user object the frontend routes on."""
        response = self.login()
        self.assertEqual(response.status_code, 200)
        for key in ("access", "refresh", "user"):
            self.assertIn(key, response.data)
        self.assertEqual(response.data["user"]["email"], VALID_STUDENT["email"])
        self.assertEqual(response.data["user"]["role"], "student")

    def test_access_token_carries_role_and_name_claims(self):
        """Given a successful login, then the JWT itself embeds role and
        full_name so services can authorize without a DB hit."""
        token = AccessToken(self.login().data["access"])
        self.assertEqual(token["role"], "student")
        self.assertEqual(token["full_name"], VALID_STUDENT["full_name"])

    def test_wrong_password_is_rejected(self):
        """Given a wrong password, when logging in, then a 401 with a
        'detail' message is returned (frontend shows it under the field)."""
        response = self.login(password="WrongPass123!")
        self.assertEqual(response.status_code, 401)
        self.assertIn("detail", response.data)

    def test_unknown_email_is_rejected(self):
        """Given an email that doesn't exist, then login fails with 401."""
        response = self.login(email="ghost@example.com")
        self.assertEqual(response.status_code, 401)

    def test_refresh_token_mints_new_access_token(self):
        """Given a refresh token, when posted to /refresh/, then a new
        access token is issued (keeps users logged in past 60 minutes)."""
        refresh = self.login().data["refresh"]
        response = self.client.post(
            "/api/auth/refresh/", {"refresh": refresh}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)


class ProfileScenarios(ApiTestCase):
    """Feature: authenticated users can view and edit their own profile."""

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            email=VALID_STUDENT["email"],
            password=VALID_STUDENT["password"],
            full_name=VALID_STUDENT["full_name"],
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_profile_requires_authentication(self):
        """Given no token, when requesting /me/, then access is denied."""
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 401)

    def test_profile_returns_own_data(self):
        """Given a valid token, when requesting /me/, then the caller's
        own profile is returned."""
        response = self.client.get("/api/auth/me/", **self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], VALID_STUDENT["email"])

    def test_profile_fields_can_be_updated(self):
        """Given a valid token, when patching name/phone, then they persist."""
        response = self.client.patch(
            "/api/auth/me/",
            {"full_name": "Renamed Student", "phone": "+256700000000"},
            format="json",
            **self.auth,
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, "Renamed Student")

    def test_role_cannot_be_escalated_via_profile(self):
        """Given a student token, when patching role=admin, then the role
        is ignored (read-only) and stays student."""
        self.client.patch(
            "/api/auth/me/", {"role": "admin"}, format="json", **self.auth
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "student")


class ThrottleScenarios(ApiTestCase):
    """Feature: public auth endpoints are rate-limited against abuse."""

    def test_register_is_throttled_after_five_attempts_per_minute(self):
        """Given five registration attempts from one client, when a sixth
        arrives within the minute, then it is rejected with 429."""
        for i in range(5):
            self.client.post(
                "/api/auth/register/",
                {**VALID_STUDENT, "email": f"user{i}@example.com"},
                format="json",
            )
        sixth = self.client.post(
            "/api/auth/register/",
            {**VALID_STUDENT, "email": "user6@example.com"},
            format="json",
        )
        self.assertEqual(sixth.status_code, 429)
