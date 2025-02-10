from rest_framework import serializers

from facture.models import Article
from facture.models import Invoice


class ArticleCreateOrUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        exclude = ["user"]


class ArticleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"


class InvoiceCreateOrUpdateSerializer(serializers.ModelSerializer):
    articles = ArticleCreateOrUpdateSerializer(many=True, source="user_article")

    class Meta:
        model = Invoice
        exclude = ["user", "created_at", "updated_at", "is_paid"]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
