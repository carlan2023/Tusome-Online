from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ForgotPasswordView,
    LoginView,
    MeView,
    RegisterView,
    ResendVerificationView,
    ResetPasswordView,
    VerifyEmailView,
    VerifyOtpView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("verify/email/", VerifyEmailView.as_view(), name="verify-email"),
    path("verify/otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("verify/resend/", ResendVerificationView.as_view(), name="verify-resend"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="password-forgot"),
    path("password/reset/", ResetPasswordView.as_view(), name="password-reset"),
]
