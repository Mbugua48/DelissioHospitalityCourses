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
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Course, User, Lesson, LessonCompletion, Quiz, Certificate, Enrollment, Coupon
from .serializers import CourseSerializer, UserSerializer, LessonSerializer, CertificateSerializer
from .serializers import EmailAuthTokenSerializer # Import the new serializer
import requests
import base64
from datetime import datetime


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
    serializer_class = EmailAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'role': user.role,
            'email': user.email
        })


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
        course_pk = self.kwargs['course_pk']
        user = self.request.user
        course = get_object_or_404(Course, pk=course_pk)

        # Check if user is enrolled or is the instructor
        is_enrolled = Enrollment.objects.filter(user=user, course=course, paid=True).exists()
        
        queryset = Lesson.objects.filter(course_id=course_pk).order_by('order')

        if not is_enrolled and course.instructor != user:
            # Allow access to the first lesson only (Free Preview)
            return queryset[:1]

        return queryset

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
            data = serializer.data
            # Inherit the Lead Instructor's name from the Course model
            data['instructor_name'] = course.instructor.get_full_name() or course.instructor.username
            return Response(data)
        
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

# Validate Coupon View
class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
             return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code, active=True)
            now = timezone.now()
            if coupon.valid_from <= now <= coupon.valid_to:
                return Response({
                    'valid': True,
                    'discount_percent': coupon.discount_percent,
                    'code': coupon.code
                })
            else:
                return Response({'error': 'Coupon is expired'}, status=status.HTTP_400_BAD_REQUEST)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_400_BAD_REQUEST)

class MpesaSTKPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        phone_number = request.data.get('phone_number')
        
        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Format phone number to 254...
        phone_number = str(phone_number).strip()
        if phone_number.startswith('+'):
            phone_number = phone_number[1:]
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
            
        # 1. Generate Access Token
        consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', None)
        consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', None)
        
        if not consumer_key or not consumer_secret:
            return Response({'error': 'M-Pesa configuration missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Determine environment (sandbox or production)
        mpesa_env = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')
        base_url = "https://sandbox.safaricom.co.ke" if mpesa_env == 'sandbox' else "https://api.safaricom.co.ke"
        api_url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        try:
            r = requests.get(api_url, auth=(consumer_key, consumer_secret))
            r.raise_for_status()
            access_token = r.json().get('access_token')
        except requests.RequestException as e:
            return Response({'error': f'Failed to get access token: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # 2. Prepare STK Push
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        business_short_code = getattr(settings, 'MPESA_SHORTCODE', None)
        passkey = getattr(settings, 'MPESA_PASSKEY', None)
        
        if not business_short_code or not passkey:
            return Response({'error': 'M-Pesa shortcode/passkey missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        password = base64.b64encode((str(business_short_code) + passkey + timestamp).encode('ascii')).decode('utf-8')
        
        process_request_url = f"{base_url}/mpesa/stkpush/v1/processrequest"
        callback_url = getattr(settings, 'MPESA_CALLBACK_URL', "https://mydomain.com/api/mywebapp/webhook/mpesa/")
        
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(course.price), # Ensure integer
            "PartyA": phone_number,
            "PartyB": business_short_code,
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": settings.SITE_NAME[:12].replace(" ", ""),
            "TransactionDesc": f"Payment to {settings.SITE_NAME}"
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(process_request_url, json=payload, headers=headers)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('ResponseCode') == '0':
                # NOTE: Optimistically enroll for demo purposes. In production, wait for callback.
                Enrollment.objects.get_or_create(user=request.user, course=course, paid=True)
                return Response(response_data)
            else:
                return Response({'error': response_data.get('errorMessage', 'STK Push failed'), 'details': response_data}, status=status.HTTP_400_BAD_REQUEST)
        except requests.RequestException as e:
            return Response({'error': f'STK Push request failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MpesaCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        # print("M-Pesa Callback:", data) # Uncomment for debugging
        
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')

        if result_code == 0:
            # Payment Successful
            metadata_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
            metadata = {item['Name']: item.get('Value') for item in metadata_items}
            
            phone_number = metadata.get('PhoneNumber')
            amount = metadata.get('Amount')
            receipt_number = metadata.get('MpesaReceiptNumber')
            # checkout_request_id = stk_callback.get('CheckoutRequestID')
            
            # Logic to update Enrollment/Transaction in DB goes here
            print(f"Payment Confirmed: {amount} from {phone_number} Ref: {receipt_number}")
        else:
            # Payment Failed or Cancelled
            result_desc = stk_callback.get('ResultDesc')
            print(f"Payment Failed: {result_desc}")

        return Response({"status": "success"}, status=status.HTTP_200_OK)

# Mock Payment View to enroll a user
class EnrollCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        # In a real app, you would verify payment here (e.g., Stripe webhook)
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        enrollment.paid = True
        enrollment.save()
        return Response({'status': 'enrolled', 'message': f'Successfully enrolled in {course.title}'})

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
    authentication_classes = []
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
                f'{settings.SITE_NAME} - Password Reset Request',
                f'Click the link to reset your password: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
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