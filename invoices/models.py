from django.db import models

# Create your models here.

class Invoice(models.Model):
    id = models.AutoField(primary_key=True)
    
    tenancy_id = models.ForeignKey("tenancies.Tenancy", 
                                   on_delete=models.PROTECT, 
                                   related_name="invoices"
                                   )
    
    billing_month = models.DateField()

    def __str__(self):
        return f"Invoice {self.id} for Tenancy {self.billing_month} - Tenant: {self.tenancy_id.tenant_id.full_name}"