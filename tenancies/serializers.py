from rest_framework import serializers

from .models import Tenancy


class TenancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenancy
        fields = ['id', 'tenant', 'bed', 'check_in_date', 'agreed_rate']