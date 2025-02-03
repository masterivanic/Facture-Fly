from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation
from django.utils.http import urlsafe_base64_decode as uid_decoder
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from flyauth.models import FlyUser

UserModel = get_user_model()


class ObtainTokenSerializer(TokenObtainPairSerializer):
    username_field = UserModel.EMAIL_FIELD


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
        read_only_fields = ["id", "password2"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if password != password2:
            raise serializers.ValidationError(
                "Password and Confirm Password doesn't match"
            )

        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError(e)
        return attrs


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
