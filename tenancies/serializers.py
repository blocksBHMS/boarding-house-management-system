from rest_framework import serializers

from .models import Tenancy


class TenancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenancy
        fields = ['id', 'tenant', 'bed', 'room', 'check_in_date', 'agreed_rate']
        extra_kwargs = {
            'room': {'required': False},
        }

    def validate(self, attrs):
        if attrs.get('room') is None:
            bed = attrs.get('bed')
            if bed is None:
                raise serializers.ValidationError(
                    {'room': 'This field is required when bed is not provided.'}
                )
            attrs['room'] = bed.room_id
        return attrs