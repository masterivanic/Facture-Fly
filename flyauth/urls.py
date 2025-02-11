from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenVerifyView

from flyauth.views import CustomerViewSet
from flyauth.views import FlyUserViewSet
from flyauth.views import ObtainTokenView
from flyauth.views import UserCompanyViewSet

router = DefaultRouter()
router.register("", FlyUserViewSet, basename="users")
router.register("company", UserCompanyViewSet, basename="users-company")
router.register("customer", CustomerViewSet, basename="users-customer")


urlpatterns = [
    path("login/", ObtainTokenView.as_view(), name="token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("", include(router.urls)),
]
