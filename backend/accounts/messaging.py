"""
Token issuing and delivery for verification & password reset.

Email goes through Django's EMAIL_BACKEND (console in dev, Brevo SMTP in
production via env vars). SMS is a console stub — swap `send_sms` for an
Africa's Talking / Twilio call when an SMS provider is configured.
"""
import logging
import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import VerificationToken

logger = logging.getLogger(__name__)

OTP_LIFETIME_MINUTES = 10
EMAIL_LINK_LIFETIME_HOURS = 24
RESET_LIFETIME_HOURS = 1


def _issue(user, kind, token, lifetime):
    # Invalidate previous active tokens of the same kind.
    VerificationToken.objects.filter(user=user, kind=kind, used=False).update(used=True)
    return VerificationToken.objects.create(
        user=user, kind=kind, token=token, expires_at=timezone.now() + lifetime
    )


def issue_email_token(user, kind=VerificationToken.Kind.EMAIL):
    lifetime = (
        timezone.timedelta(hours=RESET_LIFETIME_HOURS)
        if kind == VerificationToken.Kind.RESET
        else timezone.timedelta(hours=EMAIL_LINK_LIFETIME_HOURS)
    )
    return _issue(user, kind, secrets.token_urlsafe(32), lifetime)


def issue_otp(user, kind=VerificationToken.Kind.OTP):
    code = f"{secrets.randbelow(1_000_000):06d}"
    return _issue(user, kind, code, timezone.timedelta(minutes=OTP_LIFETIME_MINUTES))


def send_sms(phone, message):
    """Console stub. Replace the body with an SMS provider call to go live."""
    logger.info("SMS to %s: %s", phone, message)
    print(f"[SMS to {phone}] {message}")  # visible in runserver / DO runtime logs


def send_verification_email(user):
    token = issue_email_token(user)
    link = f"{settings.FRONTEND_URL}/verify-account?token={token.token}"
    send_mail(
        subject="Confirm your Tusome Online account",
        message=(
            f"Welcome to Tusome Online!\n\n"
            f"Confirm your email address by opening this link:\n{link}\n\n"
            f"The link expires in {EMAIL_LINK_LIFETIME_HOURS} hours."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return token


def send_verification_otp(user):
    token = issue_otp(user)
    send_sms(user.phone, f"Your Tusome Online verification code is {token.token}. "
                         f"It expires in {OTP_LIFETIME_MINUTES} minutes.")
    return token


def send_password_reset(user):
    """Email users get a reset link; phone-only users get a reset OTP."""
    if user.email:
        token = issue_email_token(user, kind=VerificationToken.Kind.RESET)
        link = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"
        send_mail(
            subject="Reset your Tusome Online password",
            message=(
                f"We received a request to reset your password.\n\n"
                f"Open this link to choose a new one:\n{link}\n\n"
                f"The link expires in {RESET_LIFETIME_HOURS} hour. "
                f"If you didn't ask for this, you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        return token
    token = issue_otp(user, kind=VerificationToken.Kind.RESET_OTP)
    send_sms(user.phone, f"Your Tusome Online password reset code is {token.token}. "
                         f"It expires in {OTP_LIFETIME_MINUTES} minutes.")
    return token
