from rest_framework.routers import DefaultRouter

from facture.views import ArticleViewSet

app_name = "facture"

router = DefaultRouter()
router.register("", ArticleViewSet, basename="article")

urlpatterns = router.urls
