from django.urls import path
from .views import *

urlpatterns = [
    path('rooms/', RoomListView.as_view()),
    path('rooms/create/', RoomCreate.as_view()),
    path('rooms/<int:pk>/update/', RoomUpdate.as_view()),
    path('rooms/<int:pk>/delete/', RoomDelete.as_view()),
]