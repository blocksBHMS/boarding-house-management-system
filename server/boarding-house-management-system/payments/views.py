from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import isLandlord


class PaymentCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ('landlord', 'tenant'):
            return Response(
                {'detail': 'Only landlords and tenants can create payments.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PaymentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            is_landlord = request.user.role == 'landlord'
            serializer.save(
                status='paid' if is_landlord else 'pending',
                reviewed_at=timezone.now() if is_landlord else None,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentListView(APIView):
    def get(self, request):
        if request.user.role == 'landlord':
            payments = Payment.objects.select_related('invoice').all()
        else:
            payments = Payment.objects.select_related('invoice').filter(
                invoice__tenancy_id__tenant=request.user
            )
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class PaymentReview(APIView):
    permission_classes = [isLandlord]

    def patch(self, request, pk):
        next_status = request.data.get('status')
        if next_status not in ('paid', 'rejected'):
            return Response(
                {'status': 'Choose either paid or rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rejection_reason = str(request.data.get('rejection_reason', '')).strip()
        if next_status == 'rejected' and not rejection_reason:
            return Response(
                {'rejection_reason': 'A reason is required when rejecting a payment.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                payment = Payment.objects.select_for_update().get(pk=pk)
            except Payment.DoesNotExist:
                return Response(
                    {'detail': 'Payment not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if payment.status != 'pending':
                return Response(
                    {'detail': 'Only pending payments can be reviewed.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment.status = next_status
            payment.rejection_reason = rejection_reason if next_status == 'rejected' else ''
            payment.reviewed_at = timezone.now()
            payment.save(update_fields=['status', 'rejection_reason', 'reviewed_at'])

        return Response(PaymentSerializer(payment).data)
