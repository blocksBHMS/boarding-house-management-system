from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Payment
from payments.serializers import PaymentSerializer
from accounts.permissions import isLandlord

# Create your views here.

# can be accessed by landlord only (landlord records payments on behalf of tenants)
class PaymentCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by any authenticated user
class PaymentListView(APIView):
    def get(self, request):
        if request.user.role == 'landlord':
            payments = Payment.objects.all()
        else:
            payments = Payment.objects.filter(invoice__tenancy_id__tenant=request.user)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
