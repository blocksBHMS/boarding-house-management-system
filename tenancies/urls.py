from django.urls import path
from .views import *

urlpatterns = [
    path('tenancies/', TenancyListView.as_view()),
    path('tenancies/create/', TenancyCreate.as_view()),
]