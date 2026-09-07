from rest_framework import serializers

from .models import InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice_id', 'line_no', 'charge_type', 'amount']