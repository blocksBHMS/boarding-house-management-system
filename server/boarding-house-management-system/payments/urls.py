from django.urls import path
from .views import *

urlpatterns = [
    path('payments/', PaymentListView.as_view()),
    path('payments/create/', PaymentCreate.as_view()),
    path('payments/<int:pk>/review/', PaymentReview.as_view()),
]