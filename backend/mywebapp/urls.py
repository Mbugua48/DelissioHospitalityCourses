from django.urls import path
from . import views

urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path("register/", views.UserRegisterView.as_view(), name="register"),
    path("courses/", views.CourseListView.as_view(), name="course_list"),
    path("courses/<int:course_id>/", views.CourseDetailView.as_view(), name="course_detail"),
    path("create-course/", views.CourseCreateView.as_view(), name="create_course"),
    path("profile/<int:user_id>/", views.UserProfileView.as_view(), name="user_profile"),
    path("edit-profile/", views.ProfileUpdateView.as_view(), name="edit_profile"),
]