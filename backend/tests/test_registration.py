import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestUserRegistration:

    def test_learner_can_register(self, api_client, valid_learner_payload):
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert response.status_code == 201

    def test_consultant_can_register(self, api_client, valid_consultant_payload):
        response = api_client.post("/api/auth/register/", valid_consultant_payload)
        assert response.status_code == 201

    def test_password_is_hashed(self, api_client, valid_learner_payload):
        api_client.post("/api/auth/register/", valid_learner_payload)
        user = User.objects.get(email="newlearner@tusome.ug")
        assert user.password != "StrongPass456!"
        assert user.check_password("StrongPass456!")

    def test_response_does_not_include_password(self, api_client, valid_learner_payload):
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert "password" not in response.data

    def test_phone_number_is_saved(self, api_client, valid_learner_payload):
        api_client.post("/api/auth/register/", valid_learner_payload)
        user = User.objects.get(email="newlearner@tusome.ug")
        assert user.phone == "+256701999001"

    def test_full_name_is_saved(self, api_client, valid_learner_payload):
        api_client.post("/api/auth/register/", valid_learner_payload)
        user = User.objects.get(email="newlearner@tusome.ug")
        assert user.full_name == "New Learner"

    def test_duplicate_email_is_rejected(self, api_client, learner_user, valid_learner_payload):
        valid_learner_payload["email"] = learner_user.email
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert response.status_code == 400

    def test_weak_password_is_rejected(self, api_client, valid_learner_payload):
        valid_learner_payload["password"] = "123"
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert response.status_code == 400

    def test_missing_email_is_rejected(self, api_client, valid_learner_payload):
        payload = valid_learner_payload.copy()
        del payload["email"]
        response = api_client.post("/api/auth/register/", payload)
        assert response.status_code == 400

    def test_invalid_role_is_rejected(self, api_client, valid_learner_payload):
        valid_learner_payload["role"] = "supervillain"
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert response.status_code == 400

    def test_invalid_email_format_is_rejected(self, api_client, valid_learner_payload):
        valid_learner_payload["email"] = "not-an-email"
        response = api_client.post("/api/auth/register/", valid_learner_payload)
        assert response.status_code == 400
