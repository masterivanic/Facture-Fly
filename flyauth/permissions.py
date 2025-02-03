from rest_framework import permissions

from flyauth.models import FlyUser


def user_authentication_rule(user: FlyUser) -> bool:
    return user is not None and not user.disabled


class IsUserEnabled(permissions.BasePermission):
    message = "user is disabled, you cant have access"

    def has_permission(self, request, view):
        return user_authentication_rule(user=request.user)
