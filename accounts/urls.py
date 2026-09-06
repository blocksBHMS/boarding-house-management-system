from django.urls import path
from .views import *

urlpatterns = [
    path('login/', AccountLogin.as_view()),
    path('register/landlord/', AccountRegisterLandlord.as_view()),
    path('register/tenant/', AccountRegisterTenant.as_view())
]