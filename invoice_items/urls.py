from django.urls import path
from .views import *

urlpatterns = [
    path('invoice-items/', InvoiceItemListView.as_view()),
    path('invoice-items/create/', InvoiceItemCreate.as_view()),
    path('invoice-items/<int:pk>/update/', InvoiceItemUpdate.as_view()),
    path('invoice-items/<int:pk>/delete/', InvoiceItemDelete.as_view()),
]