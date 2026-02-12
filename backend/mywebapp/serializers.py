from rest_framework import serializers
from .models import User, Course, Lesson, LessonCompletion, Quiz, Question, Certificate
import random

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile_picture', 'bio', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'learner'),
        )
        return user

class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option1', 'option2', 'option3']

class QuizSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'passing_score', 'questions']

    def get_questions(self, obj):
        # Shuffle the questions for the quiz
        questions = list(obj.questions.all())
        random.shuffle(questions)
        return QuestionSerializer(questions, many=True, context=self.context).data

class CertificateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'user_name', 'course_title', 'issued_at', 'course_id']

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    quiz = QuizSerializer(read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'course', 'title', 'content', 'order', 'image', 'video', 'is_completed', 'quiz']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LessonCompletion.objects.filter(user=request.user, lesson=obj).exists()
        return False