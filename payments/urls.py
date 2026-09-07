from django.urls import path
from .views import *

urlpatterns = [
    path('payments/', PaymentListView.as_view()),
    path('payments/create/', PaymentCreate.as_view())
]