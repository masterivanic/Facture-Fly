from django.urls import path, include
from rest_framework.routers import DefaultRouter

from facture.views import ArticleViewSet, InvoiceViewSet

app_name = "facture"

router = DefaultRouter()
router.register("articles", ArticleViewSet, basename="article")
router.register("invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
]
