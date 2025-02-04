from rest_framework import permissions


class IsUserIsAuthenticatedAndAble(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and not request.user.disabled
            and request.user.roles in ["client", "admin"]
        )
