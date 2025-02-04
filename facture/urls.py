from django.urls import path, include
from rest_framework.routers import DefaultRouter

from facture.views import ArticleViewSet

app_name = "facture"

router = DefaultRouter()
router.register("", ArticleViewSet, basename="article")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "article/generate-pdf/",
        ArticleViewSet.as_view({"get": "generate_pdf"}),
        name="generate_pdf",
    ),
]
