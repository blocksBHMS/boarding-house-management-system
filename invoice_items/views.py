from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from invoice_items.models import InvoiceItem

from invoice_items.serializers import InvoiceItemSerializer

# Create your views here.


class InvoiceItemCreate(APIView):
    def post(self, request):
        serializer = InvoiceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InvoiceItemListView(APIView):
    def get(self, request):
        invoice_items = InvoiceItem.objects.all()
        serializer = InvoiceItemSerializer(invoice_items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InvoiceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)