from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'invoice',
            'payment_date',
            'amount_paid',
            'method',
            'status',
            'rejection_reason',
            'reviewed_at',
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'reviewed_at']

    def validate_amount_paid(self, amount):
        if amount <= 0:
            raise serializers.ValidationError('Payment amount must be greater than zero.')
        return amount

    def validate(self, attrs):
        request = self.context.get('request')
        invoice = attrs.get('invoice')
        if (
            request
            and request.user.role == 'tenant'
            and invoice
            and invoice.tenancy_id.tenant_id != request.user.id
        ):
            raise serializers.ValidationError({
                'invoice': 'You can only submit payments for your own invoices.'
            })
        return attrs