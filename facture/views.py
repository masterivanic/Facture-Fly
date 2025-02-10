import os
from pathlib import Path

from django.db.models import QuerySet
from django.http import HttpResponse
from pyreportjasper import PyReportJasper
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from facture.models import Article
from facture.models import Invoice
from facture.permisssions import IsUserIsAuthenticatedAndAble
from facture.serializers import ArticleCreateOrUpdateSerializer
from facture.serializers import ArticleDetailSerializer
from facture.serializers import InvoiceCreateOrUpdateSerializer
from facture.serializers import InvoiceSerializer
from flyauth.permissions import IsUserEnabled


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


class InvoiceViewSet(ModelViewSet):
    serializer_class = InvoiceCreateOrUpdateSerializer
    permission_classes = (IsUserIsAuthenticatedAndAble,)
    queryset = Invoice.objects.select_related("user")

    def perform_create(self, serializer: Serializer) -> None:
        user = self.request.user
        serializer.save(user=user)

    def get_serializer_class(self) -> Serializer:
        if self.action in ("list", "retrieve"):
            return InvoiceSerializer
        return self.serializer_class

    def get_queryset(self) -> QuerySet[Article]:
        if self.request.user.roles.__eq__("admin"):
            return self.queryset.all()
        return self.queryset.filter(user=self.request.user)

    @action(
        detail=False,
        methods=("GET",),
        url_path="preview/(?P<pk>.+)",
        authentication_classes=(JWTAuthentication,),
        permission_classes=(IsAuthenticated, IsUserEnabled),
    )
    def preview_invoice(self, request: Request, pk: int) -> HttpResponse:
        invoice = self.get_object()
        data = {
            "label": invoice.label,
            "emission_date": invoice.emission_date,
            "amount": float(invoice.amount),
            "discount": float(invoice.discount),
            "taxe": float(invoice.taxe),
            "paid_amount": float(invoice.paid_amount),
            "due_date": invoice.due_date,
            "customer_name": invoice.customer.username,
            "articles": [
                {
                    "article_label": article.label,
                    "article_quantity": article.quantity,
                    "article_price": float(article.price),
                    "article_description": article.description,
                }
                for article in invoice.article.all()
            ],
        }
        REPORTS_DIR = Path(__file__).resolve().parent.parent / "jasper_template"
        input_file = os.path.join(REPORTS_DIR, "invoice.jrxml")
        output_file = os.path.join(REPORTS_DIR, "invoice_{invoice.label}.pdf")

        pyreportjasper = PyReportJasper()
        pyreportjasper.config(
            input_file, output_file, parameters=data, output_formats=["pdf", "rtf"]
        )
        pyreportjasper.compile(write_jasper=True)
        pyreportjasper.process_report()
        with open(output_file, "rb") as pdf_file:
            response = HttpResponse(pdf_file.read(), content_type="application/pdf")
            response[
                "Content-Disposition"
            ] = 'attachment; filename="invoice_{invoice.label}.pdf"'
            return response

    @action(
        detail=False,
        methods=("GET",),
        url_path="sign_invoice/(?P<pk>.+)",
        authentication_classes=(JWTAuthentication,),
        permission_classes=(IsAuthenticated, IsUserEnabled),
    )
    def sign_pdf(self, request: Request, pk: int) -> Response:
        # TODO implement signing pdf if necessary
        return Response()
