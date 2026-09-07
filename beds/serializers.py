from rest_framework import serializers

from beds.models import Bed

class BedSerializer(serializers.ModelSerializer):
    is_occupied = serializers.BooleanField(read_only=True)

    class Meta:
        model = Bed
        fields = ['id', 'room_id', 'bed_label', 'is_occupied']
        