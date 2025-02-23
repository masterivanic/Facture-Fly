from django.contrib import admin
from django.urls import include
from django.urls import path
from django.utils.translation import gettext_lazy as _
from drf_spectacular.views import SpectacularAPIView
from drf_spectacular.views import SpectacularRedocView
from drf_spectacular.views import SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("flyauth.urls")),
    path("api/facturation/", include("facture.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]


admin.site.site_header = _("Facture Fly admin")
admin.site.site_title = _("Facture Fly Portal")
admin.site.index_title = _("Facture Fly dashboard")
