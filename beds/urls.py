from django.urls import path
from .views import *

urlpatterns = [
    path('beds/', BedListView.as_view()),
    path('beds/create/', BedCreate.as_view())
]