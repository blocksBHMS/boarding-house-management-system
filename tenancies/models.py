from django.conf import settings
from django.db import models

# Create your models here.

class Tenancy(models.Model):
    id = models.AutoField(primary_key=True)

    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenancies",
    )
    
    bed = models.ForeignKey("beds.Bed", 
                            on_delete=models.CASCADE, 
                            related_name="tenancies"
                            )
    
    check_in_date = models.DateField()
    
    agreed_rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.tenant.full_name} - {self.bed.bed_label}"