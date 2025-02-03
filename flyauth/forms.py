from django import forms
from phonenumber_field.formfields import PhoneNumberField

from flyauth.models import UserCompany


class CompanyForm(forms.ModelForm):
    phone = PhoneNumberField(region="FR")

    class Meta:
        model = UserCompany
        fields = "__all__"
