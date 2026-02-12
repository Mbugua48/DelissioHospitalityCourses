from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from .models import Course, User, Lesson, LessonCompletion, Quiz, Certificate
from .serializers import CourseSerializer, UserSerializer, LessonSerializer, CertificateSerializer


# Create your views here.

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'instructor'

class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'role': user.role,
            'email': user.email
        })

#view for user registaration
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


# List all courses or create a new one (if instructor)
class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

# Retrieve, update or delete a course
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]

# List lessons for a specific course or create a new one
class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs['course_pk']).order_by('order')

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.kwargs['course_pk'])
        if self.request.user != course.instructor:
            raise permissions.PermissionDenied("You can only add lessons to your own courses.")
        serializer.save(course=course)

# Mark a lesson as complete
class MarkLessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        LessonCompletion.objects.get_or_create(user=request.user, lesson=lesson)
        return Response({'status': 'completed'}, status=status.HTTP_200_OK)

# Submit quiz answers and mark lesson complete if passed
class SubmitQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if not hasattr(lesson, 'quiz'):
             return Response({'error': 'No quiz found for this lesson'}, status=400)
        
        quiz = lesson.quiz
        user_answers = request.data.get('answers')
        if not isinstance(user_answers, dict):
            user_answers = {}

        score = 0
        total = quiz.questions.count()
        results = {}

        for question in quiz.questions.all():
            ans = user_answers.get(str(question.id))
            is_correct = False
            try:
                if ans is not None and int(ans) == question.correct_answer:
                    score += 1
                    is_correct = True
            except (ValueError, TypeError):
                pass
            
            results[question.id] = {'is_correct': is_correct, 'correct_answer': question.correct_answer}
        
        passed = False
        if total > 0 and (score / total) * 100 >= quiz.passing_score:
            passed = True
            LessonCompletion.objects.get_or_create(user=request.user, lesson=lesson)
        
        return Response({'passed': passed, 'score': score, 'total': total, 'results': results})

class CertificateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_pk):
        course = get_object_or_404(Course, pk=course_pk)
        user = request.user

        total_lessons = course.lesson_set.count()
        completed_lessons = LessonCompletion.objects.filter(
            user=user,
            lesson__course=course
        ).count()

        if total_lessons > 0 and total_lessons == completed_lessons:
            certificate, created = Certificate.objects.get_or_create(user=user, course=course)
            serializer = CertificateSerializer(certificate)
            return Response(serializer.data)
        
        return Response({'status': 'not_eligible', 'message': 'You have not completed all lessons for this course.'}, status=status.HTTP_403_FORBIDDEN)

# List all certificates for the authenticated user
class UserCertificatesView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).order_by('-issued_at')

# List courses with progress for the authenticated user
class UserCourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        courses = Course.objects.all()
        data = []
        
        for course in courses:
            total_lessons = course.lesson_set.count()
            if total_lessons == 0:
                continue
                
            completed_lesson_ids = LessonCompletion.objects.filter(user=user, lesson__course=course).values_list('lesson_id', flat=True)
            completed_lessons = len(completed_lesson_ids)
            progress = (completed_lessons / total_lessons) * 100
            
            if progress > 0:
                next_lesson = course.lesson_set.exclude(id__in=completed_lesson_ids).order_by('order').first()
                data.append({
                    'id': course.id,
                    'title': course.title,
                    'progress': int(progress),
                    'completed_lessons': completed_lessons,
                    'total_lessons': total_lessons,
                    'next_lesson_id': next_lesson.id if next_lesson else None
                })
        
        return Response(data)

#show user info i.e role, bio, profile picture
class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

#view for editing user profile
class ProfileUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response({
            "message": "Registration successful! Please log in.",
            "user": serializer.data
        },
        status=status.HTTP_201_CREATED,
        headers=headers)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # This link points to your React Frontend route
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"
            
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_link}',
                'noreply@delissio.com',
                [email],
                fail_silently=False,
            )
            
        return Response({'message': 'If an account exists with this email, a password reset link has been sent.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not uid or not token or not new_password:
            return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)