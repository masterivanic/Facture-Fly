from django.contrib import admin

from facture.models import Article
from facture.models import Invoice


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("label", "quantity", "price")
    search_fields = ("label",)
    list_per_page = 50


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("label", "amount", "taxe", "due_date", "user", "customer")
    search_fields = ("label", "user", "customer")
    list_filter = ("user", "customer")
    list_per_page = 10
