from django.urls import path
from .views import *

urlpatterns = [
    path('invoices/', InvoiceListView.as_view()),
    path('invoices/create/', InvoiceCreate.as_view()),
]