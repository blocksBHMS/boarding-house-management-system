from django.urls import path
from .views import *

urlpatterns = [
    path('login/', AccountLogin.as_view()),
    path('accounts/', AccountListCreate.as_view()),
    path('accounts/<int:pk>/delete/', AccountDelete.as_view()),
]