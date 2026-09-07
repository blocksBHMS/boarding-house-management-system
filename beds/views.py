from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from beds.serializers import BedSerializer
from rest_framework.response import Response

from beds.models import Bed


# Create your views here.

class BedCreate(APIView):
    def get(self, request):
        beds = Bed.objects.all()
        serializer = BedSerializer(beds, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            data = serializer.errors,
            status = status.HTTP_400_BAD_REQUEST
        )

class BedListView(APIView):
    def get(self, request):
        beds = Bed.objects.all()
        serializer = BedSerializer(beds, many=True)
        return Response(serializer.data)