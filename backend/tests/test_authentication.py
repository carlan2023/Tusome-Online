import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestLogin:

    def test_valid_credentials_return_tokens(self, api_client, learner_user):
        response = api_client.post("/api/auth/login/", {
            "email": "learner@tusome.ug",
            "password": "SecurePass123!",
        })
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_wrong_password_is_rejected(self, api_client, learner_user):
        response = api_client.post("/api/auth/login/", {
            "email": "learner@tusome.ug",
            "password": "WrongPassword!",
        })
        assert response.status_code == 401

    def test_nonexistent_user_is_rejected(self, api_client):
        response = api_client.post("/api/auth/login/", {
            "email": "ghost@tusome.ug",
            "password": "SomePassword123!",
        })
        assert response.status_code == 401

    def test_login_response_does_not_expose_password(self, api_client, learner_user):
        response = api_client.post("/api/auth/login/", {
            "email": "learner@tusome.ug",
            "password": "SecurePass123!",
        })
        assert "password" not in response.data

    def test_response_includes_user_role(self, api_client, learner_user):
        response = api_client.post("/api/auth/login/", {
            "email": "learner@tusome.ug",
            "password": "SecurePass123!",
        })
        assert response.status_code == 200
        assert response.data["user"]["role"] == "student"

    def test_empty_credentials_are_rejected(self, api_client):
        response = api_client.post("/api/auth/login/", {
            "email": "",
            "password": "",
        })
        assert response.status_code == 400

@pytest.mark.django_db
class TestTokenRefresh:

    def test_valid_refresh_token_returns_new_access_token(self, api_client, learner_user):
        login = api_client.post("/api/auth/login/", {
            "email": "learner@tusome.ug",
            "password": "SecurePass123!",
        })
        response = api_client.post("/api/auth/refresh/", {
            "refresh": login.data["refresh"]
        })
        assert response.status_code == 200
        assert "access" in response.data

    def test_invalid_refresh_token_is_rejected(self, api_client):
        response = api_client.post("/api/auth/refresh/", {
            "refresh": "this.is.not.a.real.token"
        })
        assert response.status_code == 401

@pytest.mark.django_db
class TestMeEndpoint:

    def test_authenticated_user_can_access_profile(self, auth_client):
        response = auth_client.get("/api/auth/me/")
        assert response.status_code == 200
        assert response.data["email"] == "learner@tusome.ug"

    def test_unauthenticated_user_cannot_access_profile(self, api_client):
        response = api_client.get("/api/auth/me/")
        assert response.status_code == 401

    def test_user_can_update_full_name(self, auth_client):
        response = auth_client.patch("/api/auth/me/", {"full_name": "Updated Name"})
        assert response.status_code == 200
        assert response.data["full_name"] == "Updated Name"
