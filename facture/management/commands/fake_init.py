from datetime import date
from datetime import datetime
from decimal import Decimal
from typing import Optional

from django.core.management.base import BaseCommand

from facture.models import Article
from facture.models import Invoice
from flyauth.models import Customer
from flyauth.models import FlyUser


class Command(BaseCommand):
    help = "Help us create data for fast and go test"

    def handle(self, *args, **options) -> Optional[str]:
        current_user = FlyUser.objects.first()
        art_1 = Article.objects.create(
            label="PS5",
            quantity=1,
            price=Decimal(500.50),
            description="None",
            user=current_user,
        )
        art_2 = Article.objects.create(
            label="Call of duty",
            quantity=1,
            price=Decimal(59.5),
            description="None",
            user=current_user,
        )
        customer = Customer.objects.create(
            username="John",
            first_name="doe",
            email="john.d@gmail.com",
            adress="12 rue marechar petain, 76001 Ville",
            user=current_user,
        )
        invoice = Invoice.objects.create(
            label="Invoice_003",
            emission_date=datetime.now(),
            due_date=datetime.today().strftime("%Y-%m-%d"),
            amount=Decimal(600),
            discount=Decimal(0),
            taxe=Decimal(20.15),
            paid_amount=Decimal(600),
            user=current_user,
            customer=customer,
        )
        invoice.article.add(art_1)
        invoice.article.add(art_2)
        invoice.save()
        self.stdout.write(
            self.style.SUCCESS("successfully init fake data for testing 🚀")
        )
