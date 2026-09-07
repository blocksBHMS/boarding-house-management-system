from rest_framework import serializers

from beds.models import Bed

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = '__all__'
        