from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Invoice
from accounts.permissions import isLandlord
from invoices.serializers import InvoiceSerializer

# Create your views here.

# can be accessed by landlord only
class InvoiceCreate(APIView):
    permission_classes = [isLandlord]

    def post(self, request):
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# can be accessed by any authenticated user
class InvoiceListView(APIView):
    def get(self, request):
        if request.user.role == 'landlord':
            invoices = Invoice.objects.all()
        else:
            invoices = Invoice.objects.filter(tenancy_id__tenant=request.user)
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)


# can be accessed by landlord only
class InvoiceUpdate(APIView):
    permission_classes = [isLandlord]

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response(
                {'detail': 'Invoice not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = InvoiceSerializer(invoice, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
