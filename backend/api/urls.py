from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import admin_api

# react-admin CRUD API (staff-only, JWT)
router = DefaultRouter()
router.register('products', admin_api.ProductAdminViewSet, basename='admin-products')
router.register('banners', admin_api.BannerAdminViewSet, basename='admin-banners')
router.register('coupons', admin_api.CouponAdminViewSet, basename='admin-coupons')
router.register('orders', admin_api.OrderAdminViewSet, basename='admin-orders')
router.register('site-config', admin_api.SiteConfigAdminViewSet, basename='admin-siteconfig')

urlpatterns = [
    # Public storefront endpoints
    path('products/', views.get_products, name='get_products'),
    path('banners/', views.get_banners, name='get_banners'),
    path('site-config/', views.get_site_config, name='get_site_config'),
    path('coupons/validate/', views.validate_coupon, name='validate_coupon'),
    path('orders/create/', views.create_order, name='create_order'),
    path('activity/log/', views.log_activity, name='log_activity'),

    # Admin panel: JWT auth + CRUD
    path('admin/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('admin/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', include(router.urls)),
]
