from django.contrib import admin

from facture.models import Article
from facture.models import Invoice
from utils.export import ExportCsvMixin

export_call = ExportCsvMixin.export_as_csv


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("label", "quantity", "price")
    search_fields = ("label",)
    list_per_page = 50
    actions = [export_call]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = ("label", "amount", "taxe", "due_date", "user", "customer")
    search_fields = ("label", "user", "customer")
    list_filter = ("user", "customer")
    list_per_page = 10
    actions = [export_call]
