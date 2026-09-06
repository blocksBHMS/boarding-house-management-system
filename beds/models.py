from django.db import models

# Create your models here.

class Bed(models.Model):
    id = models.AutoField(primary_key=True)
    room_id = models.ForeignKey("rooms.Room", 
                                on_delete=models.CASCADE, 
                                related_name="beds"
                                )
    
    bed_label = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.room_id.room_number} - {self.bed_label}"