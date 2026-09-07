from django.db.models import Exists, OuterRef
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from beds.models import Bed
from beds.serializers import BedSerializer
from tenancies.models import Tenancy


# Create your views here.

def _beds_with_occupied():
    return Bed.objects.annotate(
        is_occupied=Exists(
            Tenancy.objects.filter(bed_id=OuterRef('pk'))
        )
    )

class BedCreate(APIView):
    def get(self, request):
        beds = _beds_with_occupied()
        serializer = BedSerializer(beds, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            data=serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class BedListView(APIView):
    def get(self, request):
        beds = _beds_with_occupied()
        serializer = BedSerializer(beds, many=True)
        return Response(serializer.data)