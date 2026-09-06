from django.db import models

# Create your models here.

class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank_transfer", "Bank Transfer"),
        ("gcash", "GCash"),
        ("other", "Other"),
    ]

    invoice = models.ForeignKey("invoices.Invoice", on_delete=models.CASCADE, related_name="payments")
    payment_date = models.DateField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)

    def __str__(self):
        return f"Payment {self.amount_paid} on {self.payment_date}"