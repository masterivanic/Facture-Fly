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
    article = ArticleCreateOrUpdateSerializer(many=True, required=True)

    class Meta:
        model = Invoice
        exclude = ["user", "created_at", "updated_at", "is_paid"]

    def create(self, validated_data):
        articles_list = validated_data.pop("article")
        invoice = Invoice.objects.create(**validated_data)
        for article in articles_list:
            article_obj = Article.objects.create(**article)
            invoice.article.add(article_obj)
        return invoice

    def update(self, instance, validated_data):
        articles_data = validated_data.pop("article")

        instance.label = validated_data.get("label", instance.label)
        instance.emission_date = validated_data.get(
            "emission_date", instance.emission_date
        )
        instance.amount = validated_data.get("amount", instance.amount)
        instance.discount = validated_data.get("discount", instance.discount)
        instance.taxe = validated_data.get("taxe", instance.taxe)
        instance.paid_amount = validated_data.get("paid_amount", instance.paid_amount)
        instance.signature = validated_data.get("signature", instance.signature)
        instance.due_date = validated_data.get("due_date", instance.due_date)
        instance.customer = validated_data.get("customer", instance.customer)
        instance.save()

        instance.article.clear()
        for article_data in articles_data:
            article = Article.objects.create(**article_data)
            instance.article.add(article)

        return instance


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
