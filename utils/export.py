import csv
from typing import Any

from django.db.models import QuerySet
from django.http import HttpResponse


class ExportCsvMixin:
    def export_as_csv(self, request: object, queryset: QuerySet[Any]) -> HttpResponse:
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f"attachment; filename={meta.model_name}.csv"
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])

        return response

    export_as_csv.short_description = "Export Selected"
