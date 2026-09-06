from django.db import models

# Create your models here.
class Room(models.Model):
    id = models.AutoField(primary_key=True)
    room_number = models.CharField(max_length=20)

    def __str__(self):
        return self.room_number