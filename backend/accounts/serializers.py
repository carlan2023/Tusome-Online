from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ConsultantApplication

User = get_user_model()

ALLOWED_DOC_EXTENSIONS = (".pdf", ".png", ".jpg", ".jpeg")
MAX_DOC_SIZE = 5 * 1024 * 1024  # 5 MB


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "phone",
            "is_verified",
            "email_verified",
            "phone_verified",
        ]
        read_only_fields = ["id", "role", "is_verified", "email_verified", "phone_verified"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    # Public sign-up is limited to these two roles; admins are created internally.
    role = serializers.ChoiceField(
        choices=[User.Role.STUDENT, User.Role.CONSULTANT],
        default=User.Role.STUDENT,
    )
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "password", "role", "phone"]

    def validate_email(self, value):
        value = (value or "").strip().lower() or None
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        value = (value or "").strip().replace(" ", "") or None
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate(self, attrs):
        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError(
                {"email": "Provide an email address or a phone number."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


def validate_document(file):
    name = file.name.lower()
    if not name.endswith(ALLOWED_DOC_EXTENSIONS):
        raise serializers.ValidationError(
            "Upload a PDF, PNG, or JPG file."
        )
    if file.size > MAX_DOC_SIZE:
        raise serializers.ValidationError("File must be 5 MB or smaller.")
    return file


class ConsultantApplicationSerializer(serializers.ModelSerializer):
    id_document = serializers.FileField(validators=[validate_document])
    certificate = serializers.FileField(validators=[validate_document])

    class Meta:
        model = ConsultantApplication
        fields = [
            "id",
            "id_document",
            "certificate",
            "reference_name",
            "reference_contact",
            "status",
            "submitted_at",
            "reviewed_at",
        ]
        read_only_fields = ["id", "status", "submitted_at", "reviewed_at"]


class AdminApplicationSerializer(serializers.ModelSerializer):
    """Application + applicant identity, for the admin review queue."""

    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ConsultantApplication
        fields = [
            "id",
            "email",
            "full_name",
            "id_document",
            "certificate",
            "reference_name",
            "reference_contact",
            "status",
            "submitted_at",
            "reviewed_at",
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "full_name",
            "role",
            "is_verified",
            "is_active",
            "date_joined",
        ]


def find_user_by_identifier(identifier):
    """Looks a user up by email (case-insensitive) or phone number."""
    identifier = (identifier or "").strip()
    if not identifier:
        return None
    return User.objects.filter(
        Q(email__iexact=identifier) | Q(phone=identifier.replace(" ", ""))
    ).first()


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    refresh["full_name"] = user.full_name
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class LoginSerializer(serializers.Serializer):
    """Login with email OR phone + password.

    Accepts the identifier in either `identifier` or `email` (the latter keeps
    older clients working). Returns {access, refresh, user}.
    """

    identifier = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier") or attrs.get("email")
        user = find_user_by_identifier(identifier)
        if (
            user is None
            or not user.check_password(attrs["password"])
            or not user.is_active
        ):
            raise AuthenticationFailed(
                "No active account found with the given credentials"
            )
        data = tokens_for_user(user)
        data["user"] = UserSerializer(user).data
        return data
