from rest_framework import serializers
from .models import Product, Coupon, Order, ActivityLog, SiteConfig, Banner


def _abs_media_url(image_field, context):
    """Absolute URL for an uploaded image (media is served by the backend, so a
    relative path would wrongly resolve against the frontend origin)."""
    if not image_field:
        return None
    url = image_field.url
    request = context.get('request')
    return request.build_absolute_uri(url) if request else url


class ProductSerializer(serializers.ModelSerializer):
    # Frontend reads `image`; prefer the uploaded WebP, fall back to legacy path.
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        if obj.image_upload:
            return _abs_media_url(obj.image_upload, self.context)
        return obj.image


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'description', 'image', 'badge',
                  'cta_text', 'cta_page', 'placement', 'order_weight']

    def get_image(self, obj):
        return _abs_media_url(obj.image_upload, self.context)


# --- Admin (writable) serializers for the react-admin panel ---

class ProductAdminSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image_upload:
            return _abs_media_url(obj.image_upload, self.context)
        return obj.image


class BannerAdminSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Banner
        fields = '__all__'

    def get_image_url(self, obj):
        return _abs_media_url(obj.image_upload, self.context)


class CouponAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class OrderAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class SiteConfigAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = '__all__'


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['whatsapp_sent', 'whatsapp_error']


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'


class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['announcement_text', 'logo_title', 'logo_subtitle', 'free_shipping_threshold']
