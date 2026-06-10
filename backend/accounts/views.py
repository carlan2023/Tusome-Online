from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/  — open sign-up for students & consultants."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "register"


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/  — returns {access, refresh, user}."""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/  — the authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
