from django.db.models import Exists, OuterRef, ProtectedError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from beds.models import Bed
from beds.serializers import BedSerializer
from tenancies.models import Tenancy
from accounts.permissions import isLandlord


# Create your views here.

def _beds_with_occupied():
    return Bed.objects.annotate(
        is_occupied=Exists(
            Tenancy.objects.filter(bed_id=OuterRef('pk'))
        )
    )


# can be accessed by any authenticated user
class BedListView(APIView):
    def get(self, request):
        beds = _beds_with_occupied()
        serializer = BedSerializer(beds, many=True)
        return Response(serializer.data)


# can be accessed by landlord only
class BedCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = BedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(
            data=serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# can be accessed by landlord only
class BedUpdate(APIView):
    permission_classes = [isLandlord]

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        try:
            bed = Bed.objects.get(pk=pk)
        except Bed.DoesNotExist:
            return Response(
                {'detail': 'Bed not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = BedSerializer(bed, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            data=serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# can be accessed by landlord only
class BedDelete(APIView):
    permission_classes = [isLandlord]

    def delete(self, request, pk):
        try:
            bed = Bed.objects.get(pk=pk)
        except Bed.DoesNotExist:
            return Response(
                {'detail': 'Bed not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            bed.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Cannot delete this bed because it has related tenancies.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)