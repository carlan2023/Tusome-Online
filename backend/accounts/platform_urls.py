"""Consultant and admin endpoints, mounted at /api/ in config.urls."""
from django.urls import path

from .views import (
    AdminApplicationListView,
    AdminStatsView,
    AdminUserListView,
    ApplicationDecisionView,
    ConsultantApplicationView,
)

urlpatterns = [
    path("consultant/application/", ConsultantApplicationView.as_view(), name="consultant-application"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/applications/", AdminApplicationListView.as_view(), name="admin-applications"),
    path(
        "admin/applications/<int:pk>/<str:decision>/",
        ApplicationDecisionView.as_view(),
        name="admin-application-decision",
    ),
]
