from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from flyauth.models import Customer
from flyauth.models import FlyUser


class Article(models.Model):
    label = models.CharField(_("article label"), max_length=150, null=True)
    quantity = models.SmallIntegerField(default=0)
    price = models.DecimalField(
        _("article or prestation price"), decimal_places=2, max_digits=15, default=0.0
    )
    description = models.CharField(
        _("Prestation description"), max_length=500, blank=True
    )
    user = models.ForeignKey(
        FlyUser,
        on_delete=models.CASCADE,
        related_name="user_article",
        verbose_name=_("user"),
        default=1,
    )

    class Meta:
        verbose_name = _("Article or Prestation")
        verbose_name_plural = _("Articles or Prestations")

    def __str__(self):
        return self.label if self.label else str(self.pk)


class Invoice(models.Model):
    label = models.CharField(_("invoice label"), null=True, max_length=150)
    emission_date = models.DateTimeField(_("invoice date due"))
    amount = models.DecimalField(
        _("total amount"), max_digits=15, decimal_places=2, default=0.0
    )
    discount = models.DecimalField(
        _("discount amount"), max_digits=15, decimal_places=2, default=0.0
    )
    taxe = models.DecimalField(_("taxes"), max_digits=15, decimal_places=2, default=0.0)
    paid_amount = models.DecimalField(
        _("Paid amount"), max_digits=15, decimal_places=2, default=0.0
    )
    signature = models.CharField(
        _("invoice signature"), max_length=500, null=True, blank=True
    )
    due_date = models.DateField(_("final date"), null=True, blank=True)
    is_paid = models.BooleanField(default=True)
    user = models.ForeignKey(
        FlyUser,
        on_delete=models.CASCADE,
        related_name="user_invoice",
        verbose_name=_("user"),
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        related_name="customer_invoice_attributed",
    )
    article = models.ManyToManyField(
        Article, related_name="invoice_article", verbose_name=_("article"), null=True
    )
    created_at = models.DateTimeField(_("created at"), default=timezone.now)
    updated_at = models.DateTimeField(_("updated at"), default=timezone.now)

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")

    def __str__(self):
        return self.label + " cost " + str(self.amount)
