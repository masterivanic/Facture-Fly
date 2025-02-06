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
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from facture.permisssions import IsUserIsAuthenticatedAndAble
from flyauth.models import UserCompany
from flyauth.permissions import IsUserEnabled
from flyauth.serializers import ObtainTokenSerializer
from flyauth.serializers import UserChangePasswordSerializer
from flyauth.serializers import UserCompanyDetailSerializer
from flyauth.serializers import UserCompanySerializer
from flyauth.serializers import UserProfileSerializer
from flyauth.serializers import UserRegistrationSerializer
from flyauth.serializers import UserSerializer


@extend_schema(tags=["Authentication"])
class ObtainTokenView(TokenObtainPairView):
    serializer_class = ObtainTokenSerializer


@extend_schema_view(
    register=extend_schema(
        summary="Inscription d'un nouvel utilisateur",
        description="Permet de créer un nouveau compte utilisateur",
        tags=["Authentication"],
    ),
    change_password=extend_schema(
        summary="Changer le mot de passe",
        description="Permet à l'utilisateur connecté de changer son mot de passe",
        tags=["Authentication"],
    ),
    me=extend_schema(
        summary="Profil utilisateur",
        description="Retourne les informations du profil de l'utilisateur connecté",
        tags=["Authentication"],
    ),
    logout=extend_schema(
        summary="Déconnexion",
        description="Déconnecte l'utilisateur en révoquant son token",
        tags=["Authentication"],
    ),
)
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


@extend_schema_view(
    list=extend_schema(
        summary="Liste des entreprises",
        description="Retourne la liste des entreprises de l'utilisateur",
        tags=["Entreprises"],
    ),
    create=extend_schema(
        summary="Créer une entreprise",
        description="Crée une nouvelle entreprise pour l'utilisateur",
        tags=["Entreprises"],
    ),
    retrieve=extend_schema(
        summary="Détails d'une entreprise",
        description="Retourne les détails d'une entreprise spécifique",
        tags=["Entreprises"],
    ),
    update=extend_schema(
        summary="Mettre à jour une entreprise",
        description="Met à jour les informations d'une entreprise",
        tags=["Entreprises"],
    ),
    partial_update=extend_schema(
        summary="Mise à jour partielle d'une entreprise",
        description="Met à jour partiellement les informations d'une entreprise",
        tags=["Entreprises"],
    ),
    destroy=extend_schema(
        summary="Supprimer une entreprise",
        description="Supprime une entreprise",
        tags=["Entreprises"],
    ),
)
class UserCompanyViewSet(ModelViewSet):
    permission_classes = (IsUserIsAuthenticatedAndAble,)
    serializer_class = UserCompanySerializer

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return UserCompanyDetailSerializer
        return self.serializer_class

    def get_queryset(self) -> QuerySet[UserCompany]:
        queryset = UserCompany.objects.select_related("user")
        if self.request.user.roles.__eq__("admin"):
            return queryset.all()
        return queryset.filter(user=self.request.user)
