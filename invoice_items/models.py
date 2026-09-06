from django.db import models

# Create your models here.
class Invoiceitem(models.Model):
    id = models.AutoField(primary_key=True)
    
    CHARGE_CHOICES = [
        ("rent", "Rent"),
        ("electricity", "Electricity"),
        ("water", "Water"),
        ("penalty", "Penalty"),
        ("other", "Other"),
    ]

    invoice_id = models.ForeignKey("invoices.Invoice", on_delete=models.CASCADE, related_name="items")
    line_no = models.PositiveIntegerField()
    charge_type = models.CharField(max_length=20, choices=CHARGE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.charge_type} - {self.amount}"