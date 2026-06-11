from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ConsultantApplication

User = get_user_model()

ALLOWED_DOC_EXTENSIONS = (".pdf", ".png", ".jpg", ".jpeg")
MAX_DOC_SIZE = 5 * 1024 * 1024  # 5 MB


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "phone", "is_verified"]
        read_only_fields = ["id", "role", "is_verified"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    # Public sign-up is limited to these two roles; admins are created internally.
    role = serializers.ChoiceField(
        choices=[User.Role.STUDENT, User.Role.CONSULTANT],
        default=User.Role.STUDENT,
    )

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "password", "role", "phone"]

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
            "full_name",
            "role",
            "is_verified",
            "is_active",
            "date_joined",
        ]


class LoginSerializer(TokenObtainPairSerializer):
    """Adds role/name to the JWT claims and returns the user object in the body."""

    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
