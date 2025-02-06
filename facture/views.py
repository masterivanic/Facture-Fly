from django.db.models import QuerySet
from django.conf import settings
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse
import os
import json
from datetime import datetime
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from pyreportjasper import PyReportJasper

from facture.models import Article, Invoice
from facture.permisssions import IsUserIsAuthenticatedAndAble
from facture.serializers import (
    ArticleCreateOrUpdateSerializer,
    ArticleDetailSerializer,
    InvoiceCreateUpdateSerializer,
    InvoiceDetailSerializer,
)


@extend_schema_view(
    list=extend_schema(
        summary="Liste tous les articles",
        description="Retourne la liste de tous les articles disponibles pour l'utilisateur connecté",
        tags=["Articles"],
    ),
    create=extend_schema(
        summary="Créer un article",
        description="Crée un nouvel article avec les informations fournies",
        tags=["Articles"],
    ),
    retrieve=extend_schema(
        summary="Détails d'un article",
        description="Retourne les détails d'un article spécifique",
        tags=["Articles"],
    ),
    update=extend_schema(
        summary="Mettre à jour un article",
        description="Met à jour toutes les informations d'un article existant",
        tags=["Articles"],
    ),
    partial_update=extend_schema(
        summary="Mise à jour partielle d'un article",
        description="Met à jour partiellement les informations d'un article",
        tags=["Articles"],
    ),
    destroy=extend_schema(
        summary="Supprimer un article",
        description="Supprime un article existant",
        tags=["Articles"],
    ),
)
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

    @extend_schema(
        summary="Générer un PDF des articles",
        description="Génère un PDF contenant la liste des articles",
        tags=["Articles"],
        responses={200: OpenApiTypes.BINARY},
    )
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def generate_pdf(self, request):
        """Génère un PDF contenant tous les articles sans Jaspersoft Studio"""

        # 📌 Définition des chemins pour JasperReports
        reports_dir = os.path.join(settings.BASE_DIR, "facture/reports")
        jasper_template = os.path.join(reports_dir, "facture_template.jrxml")
        compiled_template = os.path.join(reports_dir, "facture_template.jasper")
        output_pdf = os.path.join(reports_dir, "facture_output")

        # 📌 Compilation du fichier JRXML en Jasper
        jasper = PyReportJasper()
        jasper.config(input_file=jasper_template, output_file=compiled_template)
        jasper.compile()

        # 📌 Extraction des articles et transformation en JSON
        articles = Article.objects.values("id", "title", "price")
        json_data_path = os.path.join(reports_dir, "articles.json")

        with open(json_data_path, "w", encoding="utf-8") as json_file:
            json.dump({"articles": list(articles)}, json_file, indent=4)

        # 📌 Génération du PDF avec JasperReports
        jasper.config(
            input_file=compiled_template,
            output_file=output_pdf,
            output_formats=["pdf"],
            parameters={"REPORT_LOCALE": "fr_FR"},
            data_file=json_data_path,
        )
        jasper.process_report()

        # 📌 Retourner le fichier PDF généré
        pdf_file_path = f"{output_pdf}.pdf"
        return FileResponse(
            open(pdf_file_path, "rb"),
            as_attachment=True,
            content_type="application/pdf",
        )


@extend_schema_view(
    list=extend_schema(
        summary="Liste toutes les factures",
        description="Retourne la liste de toutes les factures de l'utilisateur connecté",
        tags=["Factures"],
    ),
    create=extend_schema(
        summary="Créer une facture",
        description="Crée une nouvelle facture avec les informations fournies",
        tags=["Factures"],
    ),
    retrieve=extend_schema(
        summary="Détails d'une facture",
        description="Retourne les détails d'une facture spécifique",
        tags=["Factures"],
    ),
    update=extend_schema(
        summary="Mettre à jour une facture",
        description="Met à jour toutes les informations d'une facture existante",
        tags=["Factures"],
    ),
    partial_update=extend_schema(
        summary="Mise à jour partielle d'une facture",
        description="Met à jour partiellement les informations d'une facture",
        tags=["Factures"],
    ),
    destroy=extend_schema(
        summary="Supprimer une facture",
        description="Supprime une facture existante",
        tags=["Factures"],
    ),
)
class InvoiceViewSet(ModelViewSet):
    serializer_class = InvoiceCreateUpdateSerializer
    permission_classes = (IsUserIsAuthenticatedAndAble,)

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_serializer_class(self) -> Serializer:
        if self.action in ("list", "retrieve"):
            return InvoiceDetailSerializer
        return self.serializer_class

    def get_queryset(self) -> QuerySet[Invoice]:
        queryset = Invoice.objects.select_related("user")
        if self.request.user.roles.__eq__("admin"):
            return queryset.all()
        return queryset.filter(user=self.request.user)

    @extend_schema(
        summary="Générer un PDF de facture",
        description="Génère un PDF pour une facture spécifique",
        tags=["Factures"],
        responses={200: OpenApiTypes.BINARY},
    )
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def generate_pdf(self, request, pk=None):
        """Generate PDF invoice using JasperReports"""
        invoice = self.get_object()

        # Define paths for JasperReports
        reports_dir = os.path.join(settings.BASE_DIR, "facture/reports")
        jasper_template = os.path.join(reports_dir, "invoice_template.jrxml")
        compiled_template = os.path.join(reports_dir, "invoice_template.jasper")
        output_pdf = os.path.join(
            reports_dir,
            f"invoice_{invoice.pk}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        )

        # Compile JRXML to Jasper
        jasper = PyReportJasper()
        jasper.config(input_file=jasper_template, output_file=compiled_template)
        jasper.compile()

        # Prepare invoice data
        invoice_data = {
            "invoice": {
                "number": invoice.pk,
                "label": invoice.label,
                "emission_date": invoice.emission_date.strftime("%Y-%m-%d"),
                "due_date": (
                    invoice.due_date.strftime("%Y-%m-%d") if invoice.due_date else ""
                ),
                "amount": float(invoice.amount),
                "discount": float(invoice.discount),
                "taxe": float(invoice.taxe),
                "paid_amount": float(invoice.paid_amount),
                "user": {
                    "username": invoice.user.username,
                    "first_name": invoice.user.first_name,
                    "last_name": invoice.user.last_name,
                    "email": invoice.user.email,
                },
            }
        }

        # Save data to JSON
        json_data_path = os.path.join(reports_dir, f"invoice_{invoice.pk}.json")
        with open(json_data_path, "w", encoding="utf-8") as json_file:
            json.dump(invoice_data, json_file, indent=4)

        # Generate PDF
        jasper.config(
            input_file=compiled_template,
            output_file=output_pdf,
            output_formats=["pdf"],
            parameters={
                "REPORT_LOCALE": "fr_FR",
                "INVOICE_LOGO": os.path.join(reports_dir, "logo.png"),
            },
            data_file=json_data_path,
        )
        jasper.process_report()

        # Return generated PDF
        pdf_file_path = f"{output_pdf}.pdf"
        return FileResponse(
            open(pdf_file_path, "rb"),
            as_attachment=True,
            filename=f"invoice_{invoice.pk}.pdf",
            content_type="application/pdf",
        )
