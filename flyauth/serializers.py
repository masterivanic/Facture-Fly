from django.contrib.auth import get_user_model
from django.contrib.auth import password_validation
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from flyauth.models import FlyUser, Customer
from flyauth.models import UserCompany

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
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = FlyUser
        fields = [
            "email",
            "username",
            "password",
            "password2",
        ]

    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        if password != password2:
            raise serializers.ValidationError(
                {"password": "Les mots de passe ne correspondent pas"}
            )

        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        # Remove password2 from the data as it's not needed for user creation
        validated_data.pop("password2", None)
        password = validated_data.pop("password", None)

        # Create user instance
        user = FlyUser.objects.create(
            username=validated_data.get("username"),
            email=validated_data.get("email"),
        )

        # Set password properly using set_password
        if password:
            user.set_password(password)
            user.save()

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
        fields = ["old_password", "new_password", "confirm_password"]

    def validate(self, attrs):
        old_password = attrs.get("old_password")
        password = attrs.get("new_password")
        password2 = attrs.get("confirm_password")

        user = self.context.get("user")
        if not user.check_password(old_password):
            raise serializers.ValidationError(
                {"old_password": "Le mot de passe actuel est incorrect"}
            )

        if password != password2:
            raise serializers.ValidationError(
                {
                    "new_password": "Le nouveau mot de passe et sa confirmation ne correspondent pas"
                }
            )

        try:
            password_validation.validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        user.set_password(password)
        user.save()
        return attrs


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


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "username", "first_name", "last_name", "email", "user"]
        read_only_fields = ["user"]
