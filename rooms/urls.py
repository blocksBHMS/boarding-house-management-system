from django.urls import path
from .views import *

urlpatterns = [
    path('rooms/', RoomListView.as_view()),
    path('rooms/create/', RoomCreate.as_view()),
]