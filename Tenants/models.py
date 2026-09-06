from django.db import models

# Create your models here.
class Tenant(models.Model):
    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=15)

    def __str__(self):
        return self.full_name