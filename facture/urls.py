from rest_framework.routers import DefaultRouter

from facture.views import ArticleViewSet
from facture.views import InvoiceViewSet

app_name = "facture"

router = DefaultRouter()
router.register("article", ArticleViewSet, basename="article")
router.register("invoice", InvoiceViewSet, basename="invoice")

urlpatterns = router.urls
