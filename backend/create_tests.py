import os

os.makedirs('tests', exist_ok=True)
open('tests/__init__.py', 'w').close()

with open('conftest.py', 'w') as f:
    f.write('import pytest\n')
    f.write('from rest_framework.test import APIClient\n')
    f.write('from django.contrib.auth import get_user_model\n\n')
    f.write('User = get_user_model()\n\n')
    f.write('@pytest.fixture\ndef api_client():\n    return APIClient()\n\n')
    f.write('@pytest.fixture\ndef student_user(db):\n    return User.objects.create_user(\n        email="student@tusome.ug",\n        password="SecurePass123!",\n        full_name="Test Student",\n        role=User.Role.STUDENT,\n        phone="+256701000001",\n    )\n\n')
    f.write('@pytest.fixture\ndef consultant_user(db):\n    return User.objects.create_user(\n        email="consultant@tusome.ug",\n        password="SecurePass123!",\n        full_name="Test Consultant",\n        role=User.Role.CONSULTANT,\n        phone="+256701000002",\n    )\n\n')
    f.write('@pytest.fixture\ndef admin_user(db):\n    return User.objects.create_user(\n        email="admin@tusome.ug",\n        password="SecurePass123!",\n        full_name="Test Admin",\n        role=User.Role.ADMIN,\n        is_staff=True,\n        phone="+256701000003",\n    )\n\n')
    f.write('@pytest.fixture\ndef auth_client(student_user):\n    client = APIClient()\n    client.force_authenticate(user=student_user)\n    return client\n\n')
    f.write('@pytest.fixture\ndef valid_student_payload():\n    return {"email": "newstudent@tusome.ug", "full_name": "New Student", "phone": "+256701999001", "password": "StrongPass456!", "role": "student"}\n\n')
    f.write('@pytest.fixture\ndef valid_consultant_payload():\n    return {"email": "newconsultant@tusome.ug", "full_name": "New Consultant", "phone": "+256701999002", "password": "StrongPass456!", "role": "consultant"}\n')

with open('tests/test_registration.py', 'w') as f:
    f.write('import pytest\n')
    f.write('from django.contrib.auth import get_user_model\n\n')
    f.write('User = get_user_model()\n\n')
    f.write('@pytest.mark.django_db\nclass TestUserRegistration:\n\n')
    f.write('    def test_student_can_register(self, api_client, valid_student_payload):\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 201\n\n')
    f.write('    def test_consultant_can_register(self, api_client, valid_consultant_payload):\n        response = api_client.post("/api/auth/register/", valid_consultant_payload)\n        assert response.status_code == 201\n\n')
    f.write('    def test_password_is_hashed(self, api_client, valid_student_payload):\n        api_client.post("/api/auth/register/", valid_student_payload)\n        user = User.objects.get(email=valid_student_payload["email"])\n        assert user.password != valid_student_payload["password"]\n        assert user.check_password(valid_student_payload["password"])\n\n')
    f.write('    def test_response_does_not_include_password(self, api_client, valid_student_payload):\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert "password" not in response.data\n\n')
    f.write('    def test_full_name_is_saved(self, api_client, valid_student_payload):\n        api_client.post("/api/auth/register/", valid_student_payload)\n        user = User.objects.get(email=valid_student_payload["email"])\n        assert user.full_name == valid_student_payload["full_name"]\n\n')
    f.write('    def test_duplicate_email_is_rejected(self, api_client, student_user, valid_student_payload):\n        valid_student_payload["email"] = student_user.email\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 400\n\n')
    f.write('    def test_weak_password_is_rejected(self, api_client, valid_student_payload):\n        valid_student_payload["password"] = "123"\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 400\n\n')
    f.write('    def test_missing_email_is_rejected(self, api_client, valid_student_payload):\n        valid_student_payload.pop("email")\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 400\n\n')
    f.write('    def test_invalid_role_is_rejected(self, api_client, valid_student_payload):\n        valid_student_payload["role"] = "supervillain"\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 400\n\n')
    f.write('    def test_admin_role_cannot_self_register(self, api_client, valid_student_payload):\n        valid_student_payload["role"] = "admin"\n        response = api_client.post("/api/auth/register/", valid_student_payload)\n        assert response.status_code == 400\n')

with open('tests/test_authentication.py', 'w') as f:
    f.write('import pytest\nfrom django.contrib.auth import get_user_model\n\nUser = get_user_model()\n\n')
    f.write('@pytest.mark.django_db\nclass TestLogin:\n\n')
    f