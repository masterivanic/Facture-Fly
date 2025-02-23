from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from pyotp import TOTP


class UserRole(models.TextChoices):
    ADMIN = "admin", "Administrateur"
    CLIENT = "client", "Client"


class FlyUser(AbstractUser):
    id = models.UUIDField(_("user ID"), unique=True, primary_key=True)
    username = models.CharField(
        _("username"),
        max_length=150,
        validators=[ASCIIUsernameValidator()],
        help_text=_(
            "Required. 150 characters or fewer. Lowercase a-z "
            "and uppercase A-Z letters, numbers"
        ),
        null=True,
    )
    email = models.EmailField(_("email"), unique=True)
    confirm_number = models.CharField(_("confirm number"), max_length=1000, null=True)
    disabled = models.BooleanField(_("is disabled"), default=False)
    is_confirmed = models.BooleanField(_("is disabled"), default=False)
    roles = models.CharField(
        max_length=50,
        choices=UserRole.choices,
        default=UserRole.CLIENT,
        verbose_name=_("role"),
    )
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "confirm_number",
                ],
                name="confirm_number_unique",
            ),
        ]
        indexes = [
            models.Index(
                fields=[
                    "email",
                ]
            ),
        ]
        verbose_name = "User"

    def __str__(self):
        return self.email + " (" + ("not " if not self.disabled else "") + "confirmed)"

    def clean(self):
        super().clean()
        self.email = self.email.lower()

    def verify_totp(self, code: str = None) -> bool:
        otp: TOTP = TOTP(
            s=settings.SECRET_KEY,
            digits=4,
            interval=settings.INTERVAL_OTP_TIME,
            issuer=self.email,
        )
        return otp.verify(code)

    def set_totp_instance(self) -> None:
        otp: TOTP = TOTP(
            s=settings.SECRET_KEY, digits=4, interval=settings.INTERVAL_OTP_TIME
        )
        self.confirm_number = otp.now()
        self.save()


class UserCompany(models.Model):
    name = models.CharField(_("company name"), max_length=150)
    address = models.CharField(_("company adsress"), max_length=150, blank=True)
    sector = models.CharField(
        _("company activity sector"), max_length=150, blank=True, null=True
    )
    phone = PhoneNumberField(blank=True)
    user = models.ForeignKey(
        FlyUser,
        on_delete=models.CASCADE,
        related_name="user_company",
        verbose_name=_("user"),
    )

    class Meta:
        verbose_name = _("Company")
        verbose_name_plural = _("Company management")
        indexes = [models.Index(fields=["user"], name="company_by_user")]

    def __str__(self):
        return self.name


class Customer(AbstractUser):
    groups = None
    user_permissions = None
    password = None
    is_staff = None
    is_active = None
    is_superuser = None
    last_login = None
    adress = models.CharField(_("customer adress"), max_length=152, blank=True)
    phone = PhoneNumberField(_("customer phone"), blank=True)
    user = models.ForeignKey(
        FlyUser,
        on_delete=models.CASCADE,
        related_name="user_customer",
        verbose_name=_("user"),
        default=1,
    )

    class Meta:
        verbose_name = _("Customer")

    def __str__(self):
        return self.email + " " + self.username
