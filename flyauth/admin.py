from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

from flyauth.forms import CompanyForm
from flyauth.models import Customer
from flyauth.models import FlyUser
from flyauth.models import UserCompany
from utils.export import ExportCsvMixin

export_call = ExportCsvMixin.export_as_csv


@admin.register(FlyUser)
class FlyUserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "disabled", "roles")
    search_fields = ("first_name", "last_name", "username", "email")
    list_filter = ("disabled", "roles")
    list_per_page = 50
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "first_name",
                    "last_name",
                    "roles",
                    "disabled",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            _("Personal info"),
            {"fields": ("first_name", "last_name", "roles")},
        ),
        (
            _("Permissions"),
            {"fields": ("disabled", "confirm_number", "is_staff", "is_superuser")},
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )


@admin.register(UserCompany)
class UserCompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "sector")
    search_fields = ("user__email", "user__email__username")
    list_filter = ("sector",)
    list_per_page = 50
    form = CompanyForm
    actions = [export_call]


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("email", "username")
    search_fields = ("first_name", "email")
    list_per_page = 50
    actions = [export_call]


admin.site.unregister(OutstandingToken)

admin.site.unregister(BlacklistedToken)
