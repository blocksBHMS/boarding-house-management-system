from django.urls import path
from .views import *

urlpatterns = [
    path('beds/', BedListView.as_view()),
    path('beds/create/', BedCreate.as_view()),
    path('beds/<int:pk>/update/', BedUpdate.as_view()),
    path('beds/<int:pk>/delete/', BedDelete.as_view()),
]