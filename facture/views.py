from django.db.models import QuerySet
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet

from facture.models import Article
from facture.permisssions import IsUserIsAuthenticatedAndAble
from facture.serializers import ArticleCreateOrUpdateSerializer
from facture.serializers import ArticleDetailSerializer


class ArticleViewSet(ModelViewSet):
    serializer_class = ArticleCreateOrUpdateSerializer
    permission_classes = (IsUserIsAuthenticatedAndAble,)

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_serializer_class(self) -> Serializer:
        if self.action in ("list", "retrieve"):
            return ArticleDetailSerializer
        return self.serializer_class

    def get_queryset(self) -> QuerySet[Article]:
        queryset = Article.objects.select_related("user")
        if self.request.user.roles.__eq__("admin"):
            return queryset.all()
        return queryset.filter(user=self.request.user)
