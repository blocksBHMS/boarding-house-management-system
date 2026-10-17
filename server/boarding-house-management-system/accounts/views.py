<<<<<<< HEAD
import hmac

from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.permissions import isLandlord

from accounts.models import Accounts
=======
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Accounts
from accounts.permissions import isLandlord
>>>>>>> 2b8615d (feat(server): remove register on homepage backend)
from accounts.serializers import AccountSerializer


class AccountLogin(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                data={'message': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        account = authenticate(username=username, password=password)

        if account is None:
            return Response(
                data={'message': 'Username or password is invalid'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(account)
        serializer = AccountSerializer(account)
        return Response(
            data={
                'message': 'Login Successful',
                'account': serializer.data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            },
            status=status.HTTP_200_OK
        )


<<<<<<< HEAD
class AccountRegister(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # a stale token can't cause 401s on signup

    ALLOWED_FIELDS = [
        'username', 'first_name', 'middle_name',
        'last_name', 'contact_number', 'password',
    ]

    def post(self, request):
        # Whitelist fields so clients can't set is_staff / is_superuser, etc.
        data = {f: request.data[f] for f in self.ALLOWED_FIELDS if f in request.data}

        role = request.data.get('role', 'tenant')
        if role not in ('tenant', 'landlord'):
            return Response(
                {'role': ['Invalid role.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role == 'landlord':
            passcode = str(request.data.get('passcode', ''))
            if not hmac.compare_digest(passcode, settings.LANDLORD_PASSCODE):
                return Response(
                    {'passcode': ['Invalid landlord passcode.']},
                    status=status.HTTP_403_FORBIDDEN
                )

        data['role'] = role
        serializer = AccountSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


=======
>>>>>>> 2b8615d (feat(server): remove register on homepage backend)
class AccountListCreate(APIView):
    permission_classes = [isLandlord]

    def get(self, request):
        accounts = Accounts.objects.all()
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
<<<<<<< HEAD
        return Response(
            data=serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
=======
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


>>>>>>> 2b8615d (feat(server): remove register on homepage backend)
class AccountDelete(APIView):
    permission_classes = [isLandlord]

    def delete(self, request, pk):
        try:
            account = Accounts.objects.get(pk=pk)
            account.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Accounts.DoesNotExist:
            return Response(
<<<<<<< HEAD
                data={'detail': 'Account not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Catches ProtectedError if the user is tied to existing tenancies/invoices
            return Response(
                data={'detail': 'Cannot delete this account. It is currently assigned to a bed or invoice.'},
                status=status.HTTP_400_BAD_REQUEST
            )
class AccountLogin(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                data={'message': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Check if the account actually exists first
        if not Accounts.objects.filter(username=username).exists():
            return Response(
                data={'message': 'Account does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. If it exists, check the password
        account = authenticate(username=username, password=password)

        if account is None:
            return Response(
                data={'message': 'Incorrect password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(account)
        serializer = AccountSerializer(account)
        return Response(
            data={
                'message': 'Login Successful',
                'account': serializer.data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            },
            status=status.HTTP_200_OK
        )
=======
                data={'detail': 'Account not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception:
            return Response(
                data={'detail': 'Cannot delete this account. It is currently assigned to a bed or invoice.'},
                status=status.HTTP_400_BAD_REQUEST
            )
>>>>>>> 2b8615d (feat(server): remove register on homepage backend)
