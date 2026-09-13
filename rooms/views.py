from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Room
from rooms.serializers import RoomSerializer
from accounts.permissions import isLandlord


# Create your views here.

# can be accessed by landlord only
class RoomCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by any authenticated user
class RoomListView(APIView):
    def get(self, request):
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)


# can be accessed by landlord only
class RoomUpdate(APIView):
    permission_classes = [isLandlord]

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response(
                {'detail': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = RoomSerializer(room, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by landlord only
class RoomDelete(APIView):
    permission_classes = [isLandlord]

    def delete(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
        except Room.DoesNotExist:
            return Response(
                {'detail': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            room.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Cannot delete this room because it has related beds or tenancies.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)