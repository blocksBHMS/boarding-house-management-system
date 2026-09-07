from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Tenancy
from tenancies.serializers import TenancySerializer

# Create your views here.


def _bed_is_occupied(bed_id):
    return Tenancy.objects.filter(bed_id=bed_id).exists()


class TenancyCreate(APIView):
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


class TenancyListView(APIView):
    def get(self, request):
        tenancies = Tenancy.objects.all()
        serializer = TenancySerializer(tenancies, many=True)
        return Response(serializer.data)


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
