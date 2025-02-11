from rest_framework import serializers
from django.utils import timezone

from facture.models import Article, Invoice
from flyauth.serializers import UserSerializer


class ArticleCreateOrUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        exclude = ["user"]


class ArticleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = "__all__"


class InvoiceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        exclude = ["user", "created_at", "updated_at"]

    def validate(self, attrs):
        # Validate amounts are positive
        amount = attrs.get("amount", 0)
        discount = attrs.get("discount", 0)
        taxe = attrs.get("taxe", 0)
        paid_amount = attrs.get("paid_amount", 0)

        if amount < 0:
            raise serializers.ValidationError({"amount": "Amount cannot be negative"})
        if discount < 0:
            raise serializers.ValidationError(
                {"discount": "Discount cannot be negative"}
            )
        if taxe < 0:
            raise serializers.ValidationError({"taxe": "Tax cannot be negative"})
        if paid_amount < 0:
            raise serializers.ValidationError(
                {"paid_amount": "Paid amount cannot be negative"}
            )

        # Validate discount is not greater than amount
        if discount > amount:
            raise serializers.ValidationError(
                {"discount": "Discount cannot be greater than total amount"}
            )

        # Validate paid amount is not greater than total amount after tax and discount
        total_after_discount = amount * (1 - discount / 100)
        total_with_tax = total_after_discount * (1 + taxe / 100)
        if paid_amount > total_with_tax:
            raise serializers.ValidationError(
                {"paid_amount": "Paid amount cannot exceed total invoice amount"}
            )

        # Validate dates
        emission_date = attrs.get("emission_date")
        due_date = attrs.get("due_date")

        if emission_date and emission_date < timezone.now():
            raise serializers.ValidationError(
                {"emission_date": "Emission date cannot be in the past"}
            )

        if due_date and due_date < emission_date.date():
            raise serializers.ValidationError(
                {"due_date": "Due date must be after emission date"}
            )

        return attrs


class InvoiceDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"

    def get_total_amount(self, obj):
        """Calculate total amount after discount and taxes"""
        amount = float(obj.amount)
        discount = float(obj.discount)
        tax = float(obj.taxe)

        # Apply discount
        amount_after_discount = amount * (1 - discount/100)
        # Apply tax
        final_amount = amount_after_discount + (1 +  tax / 100)

        return round(final_amount, 2)

    def get_remaining_amount(self, obj):
        """Calculate remaining amount to be paid"""
        total = self.get_total_amount(obj)
        paid = float(obj.paid_amount)
        return round(total - paid, 2)

    def get_status(self, obj):
        """Get invoice payment status"""
        remaining = self.get_remaining_amount(obj)
        if remaining <= 0:
            return "PAID"
        elif obj.due_date and obj.due_date < timezone.now().date():
            return "OVERDUE"
        else:
            return "PENDING"
