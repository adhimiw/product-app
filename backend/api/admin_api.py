"""Secured CRUD API for the react-admin panel. Staff-only (IsAdminUser), JWT."""
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from .models import Product, Banner, Coupon, Order, SiteConfig
from .serializers import (
    ProductAdminSerializer, BannerAdminSerializer, CouponAdminSerializer,
    OrderAdminSerializer, SiteConfigAdminSerializer,
)


class AdminPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'  # react-admin sends perPage → this
    max_page_size = 200


class _AdminBase(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # multipart = image upload
    pagination_class = AdminPagination
    filter_backends = [OrderingFilter, SearchFilter]


class ProductAdminViewSet(_AdminBase):
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    search_fields = ['name', 'id', 'description']
    ordering_fields = '__all__'


class BannerAdminViewSet(_AdminBase):
    queryset = Banner.objects.all()
    serializer_class = BannerAdminSerializer
    search_fields = ['title', 'subtitle', 'description']
    ordering_fields = '__all__'


class CouponAdminViewSet(_AdminBase):
    queryset = Coupon.objects.all()
    serializer_class = CouponAdminSerializer
    search_fields = ['code']
    ordering_fields = '__all__'


class OrderAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [OrderingFilter, SearchFilter]
    queryset = Order.objects.all()
    serializer_class = OrderAdminSerializer
    search_fields = ['name', 'mobile', 'coupon_code']
    ordering_fields = '__all__'


class SiteConfigAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    serializer_class = SiteConfigAdminSerializer

    def get_queryset(self):
        SiteConfig.get_solo()  # ensure the singleton exists
        return SiteConfig.objects.all()
