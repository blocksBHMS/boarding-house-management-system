from django.db import models
from django.contrib import AbstractUser

# Create your models here.


class Accounts(AbstractUser):
    ROLE_CHOICES = [
        ('landlord', 'Landlord'),
        ('tenant', 'Tenant'),
    ]

    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    password = models.CharField(max_length=128)

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='tenant',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username