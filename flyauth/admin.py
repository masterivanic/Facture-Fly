from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from flyauth.forms import CompanyForm
from flyauth.models import FlyUser
from flyauth.models import UserCompany


@admin.register(FlyUser)
class FlyUserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "disabled", "roles")
    search_fields = ("first_name", "last_name", "username", "email")
    list_filter = ("disabled", "roles")
    list_per_page = 50


@admin.register(UserCompany)
class UserCompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "sector")
    search_fields = ("user__email", "user__email__username")
    list_filter = ("sector",)
    list_per_page = 50
    form = CompanyForm
