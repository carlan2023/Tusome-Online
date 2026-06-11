import os
os.environ.setdefault("TESTING", "true")

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client(learner_user):
    client = APIClient()
    client.force_authenticate(user=learner_user)
    return client

@pytest.fixture
def learner_user(db):
    return User.objects.create_user(
        email="learner@tusome.ug",
        password="SecurePass123!",
        full_name="Test Learner",
        role="student",
        phone="+256701000001",
    )

@pytest.fixture
def consultant_user(db):
    return User.objects.create_user(
        email="consultant@tusome.ug",
        password="SecurePass123!",
        full_name="Test Consultant",
        role="consultant",
        phone="+256701000002",
    )

@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@tusome.ug",
        password="SecurePass123!",
        full_name="Test Admin",
        role="admin",
        is_staff=True,
        phone="+256701000003",
    )

@pytest.fixture
def valid_learner_payload():
    return {
        "email": "newlearner@tusome.ug",
        "full_name": "New Learner",
        "phone": "+256701999001",
        "password": "StrongPass456!",
        "role": "student",
    }

@pytest.fixture
def valid_consultant_payload():
    return {
        "email": "newconsultant@tusome.ug",
        "full_name": "New Consultant",
        "phone": "+256701999002",
        "password": "StrongPass456!",
        "role": "consultant",
    }
