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


def _register_throttle_limit():
    """Reads the configured register rate, e.g. '5/min' -> 5."""
    from django.conf import settings

    rate = settings.REST_FRAMEWORK.get("DEFAULT_THROTTLE_RATES", {}).get("register")
    if not rate:
        return None
    return int(rate.split("/")[0])


class ThrottleScenarios(ApiTestCase):
    """Feature: public auth endpoints are rate-limited against abuse."""

    def test_register_is_throttled_past_the_configured_limit(self):
        """Given <limit> registration attempts from one client, when one more
        arrives within the window, then it is rejected with 429."""
        limit = _register_throttle_limit()
        if not limit or limit > 20:
            self.skipTest(
                "register throttle is disabled or set too high to exercise in tests"
            )
        for i in range(limit):
            self.client.post(
                "/api/auth/register/",
                {**VALID_STUDENT, "email": f"user{i}@example.com"},
                format="json",
            )
        over_limit = self.client.post(
            "/api/auth/register/",
            {**VALID_STUDENT, "email": "overlimit@example.com"},
            format="json",
        )
        self.assertEqual(over_limit.status_code, 429)


# ---------------------------------------------------------------------------
# Consultant verification & admin dashboard features
# ---------------------------------------------------------------------------
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

from .models import ConsultantApplication

TEMP_MEDIA = tempfile.mkdtemp(prefix="tusome-test-media-")


def make_doc(name="doc.pdf"):
    return SimpleUploadedFile(name, b"%PDF-1.4 test", content_type="application/pdf")


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class ConsultantApplicationScenarios(ApiTestCase):
    """Feature: consultants submit identity & credential documents."""

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA, ignore_errors=True)

    def setUp(self):
        super().setUp()
        self.consultant = User.objects.create_user(
            email="cons@example.com", password="StrongPass123!", role="consultant"
        )
        token = AccessToken.for_user(self.consultant)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def submit(self, **auth):
        return self.client.post(
            "/api/consultant/application/",
            {
                "id_document": make_doc("id.pdf"),
                "certificate": make_doc("cert.png"),
                "reference_name": "Dr. Jane Doe",
                "reference_contact": "jane@university.ac.ug",
            },
            format="multipart",
            **(auth or self.auth),
        )

    def test_consultant_can_submit_documents(self):
        """Given a consultant with documents, when they submit,
        then the application is created in pending state."""
        response = self.submit()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "pending")
        self.assertTrue(
            ConsultantApplication.objects.filter(user=self.consultant).exists()
        )

    def test_second_submission_is_rejected(self):
        """Given an existing application, when submitting again,
        then the API refuses with a clear message."""
        self.submit()
        response = self.submit()
        self.assertEqual(response.status_code, 400)
        self.assertIn("already submitted", response.data["detail"])

    def test_students_cannot_submit_applications(self):
        """Given a student token, when submitting, then access is denied."""
        student = User.objects.create_user(
            email="stud@example.com", password="StrongPass123!", role="student"
        )
        token = AccessToken.for_user(student)
        response = self.submit(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(response.status_code, 403)

    def test_unsupported_file_type_is_rejected(self):
        """Given an .exe upload, when submitting, then validation fails."""
        response = self.client.post(
            "/api/consultant/application/",
            {
                "id_document": SimpleUploadedFile("malware.exe", b"MZ"),
                "certificate": make_doc(),
                "reference_name": "Dr. Jane Doe",
                "reference_contact": "jane@university.ac.ug",
            },
            format="multipart",
            **self.auth,
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("id_document", response.data)

    def test_consultant_sees_own_application_status(self):
        """Given no application yet, status is 'none'; after submitting,
        the same endpoint reports 'pending'."""
        before = self.client.get("/api/consultant/application/", **self.auth)
        self.assertEqual(before.data["status"], "none")
        self.submit()
        after = self.client.get("/api/consultant/application/", **self.auth)
        self.assertEqual(after.data["status"], "pending")


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class AdminDashboardScenarios(ApiTestCase):
    """Feature: admins see live platform data and approve consultants."""

    def setUp(self):
        super().setUp()
        self.admin = User.objects.create_superuser(
            email="admin@example.com", password="StrongPass123!"
        )
        self.consultant = User.objects.create_user(
            email="cons@example.com", password="StrongPass123!", role="consultant"
        )
        User.objects.create_user(
            email="stud@example.com", password="StrongPass123!", role="student"
        )
        self.application = ConsultantApplication.objects.create(
            user=self.consultant,
            id_document=make_doc("id.pdf"),
            certificate=make_doc("cert.pdf"),
            reference_name="Dr. Jane Doe",
            reference_contact="jane@university.ac.ug",
        )
        token = AccessToken.for_user(self.admin)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_admin_endpoints_reject_non_admins(self):
        """Given a student token, when calling admin endpoints,
        then every one of them denies access."""
        student_token = AccessToken.for_user(
            User.objects.get(email="stud@example.com")
        )
        auth = {"HTTP_AUTHORIZATION": f"Bearer {student_token}"}
        for url in ("/api/admin/stats/", "/api/admin/users/", "/api/admin/applications/"):
            self.assertEqual(self.client.get(url, **auth).status_code, 403, url)

    def test_stats_reflect_database_counts(self):
        """Given users and one pending application in the DB, when the admin
        loads stats, then the counts match reality."""
        response = self.client.get("/api/admin/stats/", **self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_users"], 3)
        self.assertEqual(response.data["students"], 1)
        self.assertEqual(response.data["consultants"], 1)
        self.assertEqual(response.data["pending_applications"], 1)
        self.assertEqual(response.data["new_this_week"], 3)

    def test_admin_can_list_registered_users(self):
        """Given registered users, when listed, then each appears with
        role and verification state."""
        response = self.client.get("/api/admin/users/", **self.auth)
        self.assertEqual(response.status_code, 200)
        emails = {u["email"] for u in response.data}
        self.assertEqual(
            emails, {"admin@example.com", "cons@example.com", "stud@example.com"}
        )

    def test_pending_queue_includes_applicant_identity(self):
        """Given a pending application, when the admin opens the queue,
        then the applicant's email and documents are visible."""
        response = self.client.get("/api/admin/applications/", **self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "cons@example.com")
        self.assertIn("id_document", response.data[0])

    def test_approving_marks_consultant_verified(self):
        """Given a pending application, when the admin approves it,
        then the application and the consultant both reflect it."""
        response = self.client.post(
            f"/api/admin/applications/{self.application.pk}/approve/", **self.auth
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "approved")
        self.consultant.refresh_from_db()
        self.assertTrue(self.consultant.is_verified)

    def test_rejecting_keeps_consultant_unverified(self):
        """Given a pending application, when the admin rejects it,
        then the consultant remains unverified."""
        response = self.client.post(
            f"/api/admin/applications/{self.application.pk}/reject/", **self.auth
        )
        self.assertEqual(response.data["status"], "rejected")
        self.consultant.refresh_from_db()
        self.assertFalse(self.consultant.is_verified)

    def test_invalid_decision_is_rejected(self):
        """Given a nonsense decision word, then the API returns 400."""
        response = self.client.post(
            f"/api/admin/applications/{self.application.pk}/maybe/", **self.auth
        )
        self.assertEqual(response.status_code, 400)
