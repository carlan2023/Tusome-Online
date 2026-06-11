from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ConsultantApplication
from .serializers import (
    AdminApplicationSerializer,
    AdminUserSerializer,
    ConsultantApplicationSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class IsAdminRole(permissions.BasePermission):
    """Allows access only to authenticated users with the admin role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsConsultant(permissions.BasePermission):
    """Allows access only to authenticated consultants."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CONSULTANT
        )


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
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


# --------------------------------------------------------------------------
# Consultant: identity & credentials verification
# --------------------------------------------------------------------------
class ConsultantApplicationView(APIView):
    """GET  /api/consultant/application/  — own application status.
    POST /api/consultant/application/  — submit documents (multipart)."""

    permission_classes = [IsConsultant]

    def get(self, request):
        application = getattr(request.user, "consultant_application", None)
        if application is None:
            return Response({"status": "none"})
        return Response(ConsultantApplicationSerializer(application).data)

    def post(self, request):
        if hasattr(request.user, "consultant_application"):
            return Response(
                {"detail": "You have already submitted an application."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ConsultantApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# --------------------------------------------------------------------------
# Admin: dashboard data & approvals
# --------------------------------------------------------------------------
class AdminStatsView(APIView):
    """GET /api/admin/stats/ — live counts for the dashboard cards."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        week_ago = timezone.now() - timezone.timedelta(days=7)
        return Response(
            {
                "total_users": User.objects.count(),
                "students": User.objects.filter(role=User.Role.STUDENT).count(),
                "consultants": User.objects.filter(role=User.Role.CONSULTANT).count(),
                "verified_consultants": User.objects.filter(
                    role=User.Role.CONSULTANT, is_verified=True
                ).count(),
                "pending_applications": ConsultantApplication.objects.filter(
                    status=ConsultantApplication.Status.PENDING
                ).count(),
                "new_this_week": User.objects.filter(date_joined__gte=week_ago).count(),
            }
        )


class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/ — all registered users, newest first."""

    permission_classes = [IsAdminRole]
    serializer_class = AdminUserSerializer
    queryset = User.objects.order_by("-date_joined")


class AdminApplicationListView(generics.ListAPIView):
    """GET /api/admin/applications/?status=pending — review queue."""

    permission_classes = [IsAdminRole]
    serializer_class = AdminApplicationSerializer

    def get_queryset(self):
        qs = ConsultantApplication.objects.select_related("user")
        status_param = self.request.query_params.get("status", "pending")
        if status_param != "all":
            qs = qs.filter(status=status_param)
        return qs


class ApplicationDecisionView(APIView):
    """POST /api/admin/applications/<pk>/approve|reject/ — admin decision."""

    permission_classes = [IsAdminRole]

    def post(self, request, pk, decision):
        if decision not in ("approve", "reject"):
            return Response(
                {"detail": "Decision must be 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            application = ConsultantApplication.objects.select_related("user").get(pk=pk)
        except ConsultantApplication.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if decision == "approve":
            application.status = ConsultantApplication.Status.APPROVED
            application.user.is_verified = True
        else:
            application.status = ConsultantApplication.Status.REJECTED
            application.user.is_verified = False
        application.reviewed_at = timezone.now()
        application.save()
        application.user.save(update_fields=["is_verified"])
        return Response(AdminApplicationSerializer(application).data)
