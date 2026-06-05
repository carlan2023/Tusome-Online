from django.test import TestCase

from .models import User


class AuthApiTests(TestCase):
    def test_register_and_login_learner(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'learner1',
                'email': 'learner1@example.com',
                'password': 'StrongPass123',
                'role': 'learner',
            },
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='learner1').exists())

        login_response = self.client.post(
            '/api/auth/login/',
            {
                'username': 'learner1',
                'password': 'StrongPass123',
            },
            content_type='application/json',
        )
        self.assertEqual(login_response.status_code, 200)

        me_response = self.client.get('/api/auth/me/')
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['user']['role'], 'learner')

    def test_register_admin_role_creates_staff_user(self):
        response = self.client.post(
            '/api/auth/register/',
            {
                'username': 'admin1',
                'email': 'admin1@example.com',
                'password': 'AdminPass123',
                'role': 'admin',
            },
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='admin1')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
