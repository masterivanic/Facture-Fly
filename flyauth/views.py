from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenBlacklistSerializer
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView

from facture.permisssions import IsUserIsAuthenticatedAndAble
from flyauth.models import Customer
from flyauth.models import UserCompany
from flyauth.permissions import IsUserEnabled
from flyauth.serializers import CustomerCreateOrUpdateSerializer
from flyauth.serializers import CustomerDetailSerializer
from flyauth.serializers import ObtainTokenSerializer
from flyauth.serializers import UserChangePasswordSerializer
from flyauth.serializers import UserCompanyDetailSerializer
from flyauth.serializers import UserCompanySerializer
from flyauth.serializers import UserProfileSerializer
from flyauth.serializers import UserRegistrationSerializer
from flyauth.serializers import UserSerializer


class ObtainTokenView(TokenObtainPairView):
    serializer_class = ObtainTokenSerializer


class FlyUserViewSet(viewsets.GenericViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = ()

    def get_serializer_class(self):
        action = self.action
        match action:
            case "register":
                return UserRegistrationSerializer
            case "change_password":
                return UserChangePasswordSerializer
            case "me":
                return UserProfileSerializer
            case "logout":
                return TokenBlacklistSerializer
            case _:
                return self.serializer_class

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=(AllowAny,),
    )
    def register(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "username": user.username,
                "email": user.email,
                "message": "Registration Successful.",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["POST"],
        permission_classes=(IsAuthenticated, IsUserEnabled),
        url_path="password/change",
    )
    def change_password(self, request: Request) -> Response:
        serializer = self.get_serializer(
            data=request.data, context={"user": request.user}
        )
        serializer.is_valid(raise_exception=True)
        return Response(
            {"message": "Password Changed Successfully"}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=("GET",),
        authentication_classes=(JWTAuthentication,),
        permission_classes=(IsAuthenticated, IsUserEnabled),
    )
    def me(self, request: Request) -> Response:
        serializer = self.get_serializer(instance=request.user)
        return Response(serializer.data)

    @action(detail=False, methods=("POST",), permission_classes=(IsAuthenticated,))
    def logout(self, request: Request) -> Response:
        logout_view = TokenBlacklistView.as_view()
        response = logout_view(request._request)
        return response


class UserCompanyViewSet(ModelViewSet):
    permission_classes = (IsUserIsAuthenticatedAndAble,)
    serializer_class = UserCompanySerializer
    queryset = UserCompany.objects.select_related("user")

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return UserCompanyDetailSerializer
        return self.serializer_class

    def get_queryset(self) -> QuerySet[UserCompany]:
        if self.request.user.roles.__eq__("admin"):
            return self.queryset.all()
        return self.queryset.filter(user=self.request.user)


class CustomerViewSet(ModelViewSet):
    permission_classes = (IsUserIsAuthenticatedAndAble,)
    queryset = Customer.objects.select_related("user")
    serializer_class = CustomerDetailSerializer

    def get_serializer_class(self):
        if self.action in ("create", "update"):
            return CustomerCreateOrUpdateSerializer
        return self.serializer_class

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_queryset(self) -> QuerySet[UserCompany]:
        if self.request.user.roles.__eq__("admin"):
            return self.queryset.all()
        return self.queryset.filter(user=self.request.user)
