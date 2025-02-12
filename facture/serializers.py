from decimal import Decimal
from typing import Any
from typing import Dict

from django.utils import timezone
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

    def validate(self, attrs) -> Dict[str, Any]:
        amount = attrs.get("amount", 0)
        discount = attrs.get("discount", 0)
        taxe = (attrs.get("taxe", 0),)
        paid_amount = attrs.get("paid_amount", 0)

        if discount > amount:
            raise serializers.ValidationError(
                "Discount cannot be greater than total amount"
            )

        total_after_discount = amount * (1 - discount / 100)
        total_with_tax = total_after_discount * (1 + taxe / 100)
        if paid_amount > total_with_tax:
            raise serializers.ValidationError(
                {"paid_amount": "Paid amount cannot exceed total invoice amount"}
            )
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Invoice:
        articles_list = validated_data.pop("article")
        invoice = Invoice.objects.create(**validated_data)
        for article in articles_list:
            article_obj = Article.objects.create(**article)
            invoice.article.add(article_obj)
        return invoice

    def update(self, instance: Invoice, validated_data: Dict[str, Any]) -> Invoice:
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
    total_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"

    def get_total_amount(self, obj) -> Decimal:
        amount = float(obj.amount)
        discount = float(obj.discount)
        tax = float(obj.taxe)
        amount_after_discount = amount * (1 - discount / 100)
        final_amount = amount_after_discount + (1 + tax / 100)
        return Decimal(final_amount)

    def get_remaining_amount(self, obj) -> Decimal:
        total = self.get_total_amount(obj)
        paid = float(obj.paid_amount)
        return Decimal(total - paid)

    def get_status(self, obj) -> str:
        remaining = self.get_remaining_amount(obj)
        if remaining <= 0:
            return "PAID"
        elif obj.due_date and obj.due_date < timezone.now().date():
            return "OVERDUE"
        else:
            return "PENDING"
