from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # If response is None, it means it's a standard Python exception (500)
    if response is None:
        return Response({
            'message': 'Internal Server Error',
            'detail': str(exc)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response