from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .forms import CourseForm, ProfileForm
from .models import Course, User


# Create your views here.
#view for user registaration
class UserRegisterView(TemplateView):
    template_name = 'mywebapp/register.html'

class IndexView(TemplateView):
    template_name = 'mywebapp/index.html'

class CourseListView(ListView):
    model = Course
    template_name = 'mywebapp/course_list.html'
    context_object_name = 'courses'

#view for listing courses
class CourseDetailView(DetailView):
    model = Course
    template_name = 'mywebapp/course_detail.html'
    context_object_name = 'course'
    pk_url_kwarg = 'course_id'

#view for creating a course
class CourseCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Course
    form_class = CourseForm
    template_name = 'mywebapp/create_course.html'

    def test_func(self):
        return self.request.user.role == 'instructor'

    def handle_no_permission(self):
        if self.request.user.is_authenticated:
            return redirect('course_list')
        return super().handle_no_permission()

    def form_valid(self, form):
        form.instance.instructor = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('course_detail', kwargs={'course_id': self.object.id})

#show user info i.e role, bio, profile picture
class UserProfileView(DetailView):
    model = User
    template_name = 'mywebapp/user_profile.html'
    context_object_name = 'user'
    pk_url_kwarg = 'user_id'

#view for editing user profile
class ProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = ProfileForm
    template_name = 'mywebapp/edit_profile.html'

    def get_object(self):
        return self.request.user

    def get_success_url(self):
        return reverse('user_profile', kwargs={'user_id': self.request.user.id})