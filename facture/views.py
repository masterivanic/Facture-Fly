from django.db.models import QuerySet
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from pyreportjasper import PyReportJasper

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
