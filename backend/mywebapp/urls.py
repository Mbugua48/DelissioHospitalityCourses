from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.UserRegisterView.as_view(), name="register"),
    path("login/", views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("courses/", views.CourseListCreateView.as_view(), name="course_list_create"),
    path("courses/<int:pk>/", views.CourseDetailView.as_view(), name="course_detail"),
    path("profile/<int:pk>/", views.UserProfileView.as_view(), name="user_profile"),
    path("edit-profile/", views.ProfileUpdateView.as_view(), name="edit_profile"),
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset-confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]