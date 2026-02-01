from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import Course, User
from .serializers import CourseSerializer, UserSerializer, CustomTokenObtainPairSerializer


# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow instructors to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'instructor'

#view for user registaration
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# List all courses or create a new one (if instructor)
class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

# Retrieve, update or delete a course
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]

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