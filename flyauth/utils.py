from typing import Dict

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from flyauth.models import FlyUser


def send_email(data: Dict[str, str]) -> None:
    subject: str = data["subject"]
    email: str = data["to_email"]
    user: FlyUser = FlyUser.objects.get(email=email)
    message = render_to_string(
        template_name="email/reset_password.html",
        context={
            "user": user,
            "link": data["link"],
            "email_for_reply": settings.EMAIL_FOR_REPLY,
        },
    )
    email_from = settings.DEFAULT_FROM_EMAIL
    send_mail(
        subject=subject,
        message=message,
        from_email=email_from,
        recipient_list=[email],
        fail_silently=False,
        html_message=message,
    )


def send_verification_code(email: str) -> None:
    subject: str = "[Code OTP] Email verification"
    user: FlyUser = FlyUser.objects.get(email=email)
    user.set_totp_instance()
    message = render_to_string(
        template_name="email/verify_email.html",
        context={
            "user": user,
            "code": user.confirm_number,
            "email_for_reply": settings.EMAIL_FOR_REPLY,
        },
    )
    email_from = settings.DEFAULT_FROM_EMAIL
    send_mail(
        subject=subject,
        message=message,
        from_email=email_from,
        recipient_list=[email],
        fail_silently=False,
        html_message=message,
    )
