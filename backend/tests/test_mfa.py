import pytest

# ── MFA / OTP tests ────────────────────────────────────────────────────────────
# These tests cover OTP/SMS verification via Africa's Talking.
# The OTPCode model and services.py have not been built in the real project yet.
# These tests are skipped until Sprint 2 when MFA is implemented.
# To re-enable: remove the @pytest.mark.skip decorator from each class.

@pytest.mark.skip(reason="MFA not yet implemented in accounts app — coming in Sprint 2")
class TestOTPGeneration:

    def test_otp_is_sent_after_login(self):
        pass

    def test_otp_endpoint_sends_code_to_phone(self):
        pass


@pytest.mark.skip(reason="MFA not yet implemented in accounts app — coming in Sprint 2")
class TestOTPVerification:

    def test_correct_otp_verifies_successfully(self):
        pass

    def test_wrong_otp_is_rejected(self):
        pass

    def test_expired_otp_is_rejected(self):
        pass

    def test_otp_cannot_be_used_twice(self):
        pass
