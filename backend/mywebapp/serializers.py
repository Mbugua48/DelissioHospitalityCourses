from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Course

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile_picture', 'bio', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'created_at']