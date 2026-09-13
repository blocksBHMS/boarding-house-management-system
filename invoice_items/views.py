from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from invoice_items.models import InvoiceItem

from accounts.permissions import isLandlord
from invoice_items.serializers import InvoiceItemSerializer

# Create your views here.

# can be accessed by landlord only
class InvoiceItemCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = InvoiceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by any authenticated user
class InvoiceItemListView(APIView):
    def get(self, request):
        if request.user.role == 'landlord':
            invoice_items = InvoiceItem.objects.all()
        else:
            invoice_items = InvoiceItem.objects.filter(
                invoice_id__tenancy_id__tenant=request.user
            )
        serializer = InvoiceItemSerializer(invoice_items, many=True)
        return Response(serializer.data)


# can be accessed by landlord only
class InvoiceItemUpdate(APIView):
    permission_classes = [isLandlord]

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        try:
            item = InvoiceItem.objects.get(pk=pk)
        except InvoiceItem.DoesNotExist:
            return Response(
                {'detail': 'Invoice item not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = InvoiceItemSerializer(item, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by landlord only
class InvoiceItemDelete(APIView):
    permission_classes = [isLandlord]

    def delete(self, request, pk):
        try:
            item = InvoiceItem.objects.get(pk=pk)
        except InvoiceItem.DoesNotExist:
            return Response(
                {'detail': 'Invoice item not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)