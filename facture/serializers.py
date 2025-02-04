from rest_framework import serializers

from facture.models import Article


class ArticleCreateOrUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        exclude = ["user"]


class ArticleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"
