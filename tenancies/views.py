from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Tenancy
from tenancies.serializers import TenancySerializer
from accounts.permissions import isLandlord

# Create your views here.


def _bed_is_occupied(bed_id):
    return Tenancy.objects.filter(bed_id=bed_id).exists()


# can be accessed by landlord only
class TenancyCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        bed_id = request.data.get('bed')
        if bed_id and _bed_is_occupied(bed_id):
            return Response(
                {'detail': 'This bed is already occupied.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = TenancySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        try:
            tenancy.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Cannot delete this tenancy because it has related invoices.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
