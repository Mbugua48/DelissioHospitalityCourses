from django import forms
from .models import User, Course

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['profile_picture', 'bio']  # editable fields
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Tell us about yourself...'}),
        }


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['title', 'description']  # instructor is set automatically in views
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Course Title'}),
            'description': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Course Description'}),
        }