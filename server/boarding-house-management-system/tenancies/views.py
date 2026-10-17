from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from beds.models import Bed
from .models import Tenancy
from tenancies.serializers import TenancySerializer
from accounts.permissions import isLandlord

# Create your views here.

# can be accessed by landlord only
class TenancyCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = TenancySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tenant = serializer.validated_data['tenant']
        bed = serializer.validated_data['bed']
        with transaction.atomic():
            get_user_model().objects.select_for_update().get(pk=tenant.pk)
            bed = Bed.objects.select_for_update().get(pk=bed.pk)
            if Tenancy.objects.filter(bed=bed, is_active=True).exists():
                return Response(
                    {'detail': 'This bed is already occupied.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Tenancy.objects.filter(tenant=tenant, is_active=True).update(is_active=False)
            tenancy = serializer.save(room=bed.room_id, is_active=True)

        return Response(
            TenancySerializer(tenancy).data,
            status=status.HTTP_201_CREATED,
        )


# can be accessed by any authenticated user
class TenancyListView(APIView):
    def get(self, request):
        if request.user.role == 'landlord':
            tenancies = Tenancy.objects.all()
        else:
            tenancies = Tenancy.objects.filter(tenant=request.user)
        serializer = TenancySerializer(tenancies, many=True)
        return Response(serializer.data)


# can be accessed by landlord only
class TenancyDelete(APIView):
    permission_classes = [isLandlord]

    def delete(self, request, pk):
        try:
            tenancy = Tenancy.objects.get(pk=pk)
        except Tenancy.DoesNotExist:
            return Response(
                {'detail': 'Tenancy not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        updated = Tenancy.objects.filter(pk=pk, is_active=True).update(is_active=False)
        if not updated:
            return Response(
                {'detail': 'This tenancy has already ended.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
