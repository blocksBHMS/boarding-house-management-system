from django.urls import path
from .views import *

urlpatterns = [
    path('login/', AccountLogin.as_view()),
<<<<<<< HEAD
    path('register/', AccountRegister.as_view()),
=======
>>>>>>> 2b8615d (feat(server): remove register on homepage backend)
    path('accounts/', AccountListCreate.as_view()),
    path('accounts/<int:pk>/delete/', AccountDelete.as_view()),
]