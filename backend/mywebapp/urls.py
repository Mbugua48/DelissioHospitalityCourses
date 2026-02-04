from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.CustomLoginView.as_view(), name="login"),
    path("courses/", views.CourseListCreateView.as_view(), name="course_list_create"),
    path("courses/<int:pk>/", views.CourseDetailView.as_view(), name="course_detail"),
    path("profile/<int:pk>/", views.UserProfileView.as_view(), name="user_profile"),
    path("edit-profile/", views.ProfileUpdateView.as_view(), name="edit_profile"),
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset-confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]