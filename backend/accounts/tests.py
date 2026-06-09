from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login_student(self):
        register = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Test Student",
                "email": "student@example.com",
                "password": "StrongPass123!",
                "role": "student",
            },
            format="json",
        )
        self.assertEqual(register.status_code, 201)
        self.assertTrue(User.objects.filter(email="student@example.com").exists())

        login = self.client.post(
            "/api/auth/login/",
            {"email": "student@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.data)
        self.assertEqual(login.data["user"]["role"], "student")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["email"], "student@example.com")

    def test_public_register_rejects_admin_role(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Bad Actor",
                "email": "bad@example.com",
                "password": "StrongPass123!",
                "role": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
