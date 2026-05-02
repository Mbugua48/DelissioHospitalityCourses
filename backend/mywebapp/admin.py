from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import Course, Lesson, Quiz, Question, Certificate, Enrollment, Coupon

# Register your models here.

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'profile_picture', 'bio')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'profile_picture', 'bio')}),
    )

admin.site.register(User, CustomUserAdmin)

class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

class QuizAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at')
    search_fields = ('title', 'instructor__username')
    list_filter = ('created_at',)
    inlines = [LessonInline]

admin.site.register(Course, CourseAdmin)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Certificate)
admin.site.register(Enrollment)
admin.site.register(Coupon)

admin.site.site_header = "APTITUDE ACADEMY Admin"
admin.site.site_title = "APTITUDE ACADEMY Portal"
admin.site.index_title = "Welcome to APTITUDE ACADEMY"
    
