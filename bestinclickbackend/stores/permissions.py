"""
Store Management Permissions
Custom permissions for store management functionality.
"""

from rest_framework import permissions


class IsStoreOwner(permissions.BasePermission):
    """
    Permission to check if user is a store owner.
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a store owner."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_store_owner
        )


class IsAdminUser(permissions.BasePermission):
    """
    Permission to check if user is an admin.
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is an admin."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )


class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow store owners to edit their own content,
    and read-only access for others.
    """
    
    def has_permission(self, request, view):
        """Allow read access to all, write access to store owners only."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_store_owner
        )
    
    def has_object_permission(self, request, view, obj):
        """Check if user owns the store or related object."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user owns the store
        if hasattr(obj, 'store'):
            return obj.store.owner == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow owners to edit their own content,
    and read-only access for others.
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if user owns the object."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check various owner relationships
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'applicant'):
            return obj.applicant == request.user
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user
        
        return False


class IsStoreOwnerOfProduct(permissions.BasePermission):
    """
    Permission to check if user owns the store that contains the product.
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a store owner."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_store_owner
        )
    
    def has_object_permission(self, request, view, obj):
        """Check if user owns the store that contains the product."""
        if hasattr(obj, 'product'):
            return obj.product.store.owner == request.user
        elif hasattr(obj, 'store'):
            return obj.store.owner == request.user
        
        return False


class CanCreateStoreFeedback(permissions.BasePermission):
    """
    Permission to check if user can create feedback for a store.
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a customer."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_customer
        )


class CanViewStoreAnalytics(permissions.BasePermission):
    """
    Permission to check if user can view store analytics.
    """
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a store owner or admin."""
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_store_owner or request.user.is_admin)
        )
    
    def has_object_permission(self, request, view, obj):
        """Check if user can view specific store analytics."""
        if request.user.is_admin:
            return True
        
        # Store owners can only view their own analytics
        if hasattr(obj, 'store'):
            return obj.store.owner == request.user
        
        return False