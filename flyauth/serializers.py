from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode as uid_decoder
from django.utils.translation import gettext_lazy as _
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from flyauth.models import Customer
from flyauth.models import FlyUser
from flyauth.models import UserCompany


class ObtainTokenSerializer(TokenObtainPairSerializer):
    username_field = get_user_model().EMAIL_FIELD


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlyUser
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "disabled",
            "roles",
            "confirm_number",
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={"input_type": "password"}, write_only=True)

    class Meta:
        model = FlyUser
        fields = [
            "email",
            "username",
            "password",
            "password2",
        ]
        # read_only_fields = ["id", "password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if len(password) < 8:
            raise serializers.ValidationError(
                _("Password is too weak, must be at least 8 characters")
            )
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password doesn't match"
            )

        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError(e)
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        user = FlyUser.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlyUser
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "roles",
            "disabled",
        ]
        read_only_fields = ["id", "email"]


class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    new_password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )
    confirm_password = serializers.CharField(
        max_length=255, style={"input_type": "password"}, write_only=True
    )

    class Meta:
        fields = ["password", "password2"]

    def validate(self, attrs):
        old_password = attrs.get("old_password")
        password = attrs.get("new_password")
        password2 = attrs.get("confirm_password")

        user = self.context.get("user")
        if not user.check_password(old_password):
            raise serializers.ValidationError("Old Password is not Correct")

        if password != password2:
            raise serializers.ValidationError(
                "New Password and Confirm Password doesn't match"
            )
        user.set_password(password)
        user.save()
        return attrs


class SendPasswordResetEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)

    class Meta:
        fields = ["email"]


class VerificationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    confirm_number = serializers.CharField()

    def validate(self, attrs):
        user = FlyUser.objects.get(email=attrs.get("email"), is_confirmed=False)
        if user:
            is_verify = user.verify_totp(attrs.get("confirm_number"))
            if not is_verify:
                raise serializers.ValidationError(
                    _("otp code entered is incorrect or expired")
                )
            else:
                user.is_confirmed = True
                user.save()
        else:
            raise serializers.ValidationError(
                _("user with email {email} dont exist or already confirm")
            )
        return attrs


class ResendActivationCodeSerializer(SendPasswordResetEmailSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        try:
            FlyUser.objects.get(email=email, is_confirmed=False)
        except FlyUser.DoesNotExist:
            raise serializers.ValidationError(
                "User does not exists or is already confirmed"
            )

        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)
    uid = serializers.CharField()
    token = serializers.CharField()

    set_password_form_class = SetPasswordForm

    def validate(self, attrs):
        self._errors = {}

        try:
            uid = force_str(uid_decoder(attrs["uid"]))
            self.user = get_user_model()._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
            raise ValidationError({"uid": ["Invalid value"]})

        self.set_password_form = self.set_password_form_class(
            user=self.user, data=attrs
        )
        if not self.set_password_form.is_valid():
            raise serializers.ValidationError(self.set_password_form.errors)
        if not default_token_generator.check_token(self.user, attrs["token"]):
            raise ValidationError({"token": ["Invalid value"]})

        return attrs

    def save(self):
        return self.set_password_form.save()


class UserCompanySerializer(serializers.ModelSerializer):
    phone = PhoneNumberField(region="FR")

    class Meta:
        model = UserCompany
        exclude = ["user"]


class UserCompanyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCompany
        fields = "__all__"
        read_only_fields = ["user", "id"]


class CustomerDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["user", "id"]


class CustomerCreateOrUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        exclude = ("date_joined",)
