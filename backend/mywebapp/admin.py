from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import Course

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

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at')
    search_fields = ('title', 'instructor__username')
    list_filter = ('created_at',)

admin.site.register(Course, CourseAdmin)
    

