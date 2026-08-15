from django.db import models
from django.core.exceptions import ValidationError
from .services.images import convert_field_to_webp
from .validators import validate_image_upload
import json

class Product(models.Model):
    id = models.CharField(max_length=100, primary_key=True, help_text="Unique product slug e.g. health-mix-300g")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    inr_price = models.CharField(max_length=50, blank=True, help_text="e.g. ₹110. Leave blank to generate automatically from price.")
    image = models.CharField(max_length=255, default="refence image/image.png", help_text="Legacy image path. Prefer uploading via the Image field below.")
    image_upload = models.ImageField(upload_to='products/', blank=True, null=True, validators=[validate_image_upload], help_text="Upload a product image (auto-converted to WebP). Overrides the legacy path above.")
    badge = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Flagship Pouch, Family Pack")
    tag = models.CharField(max_length=100, help_text="e.g. Starter, Family, Premium")
    
    # Detail fields
    details_badge = models.CharField(max_length=200, blank=True, help_text="e.g. Sprouted Millets & Grains")
    lead = models.TextField(blank=True, help_text="Short leading description on detail page")
    ingredients = models.TextField(blank=True, help_text="Ingredients list")
    about = models.TextField(blank=True, help_text="Detailed about section")
    
    is_active = models.BooleanField(default=True)
    order_weight = models.IntegerField(default=0, help_text="Ordering weight for list rendering (lower is first)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.inr_price:
            self.inr_price = f"₹{int(self.price)}"
        if not self.details_badge:
            self.details_badge = self.category
        convert_field_to_webp(self, 'image_upload')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.id})"

    class Meta:
        ordering = ['order_weight', 'name']


class Banner(models.Model):
    PLACEMENTS = (
        ('hero', 'Hero deck'),
        ('promo', 'Promo strip'),
        ('popup', 'Popup'),
    )
    title = models.CharField(max_length=200, help_text="Main heading shown on the banner")
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image_upload = models.ImageField(upload_to='banners/', blank=True, null=True, validators=[validate_image_upload], help_text="Banner image (auto-converted to WebP)")
    badge = models.CharField(max_length=120, blank=True, help_text="Small eyebrow/badge text")
    cta_text = models.CharField(max_length=80, blank=True, help_text="Button label e.g. 'Shop the mix'")
    cta_page = models.CharField(max_length=80, blank=True, help_text="Frontend page key e.g. shop, science, about")
    placement = models.CharField(max_length=20, choices=PLACEMENTS, default='hero')
    active = models.BooleanField(default=True)
    order_weight = models.IntegerField(default=0, help_text="Lower shows first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        convert_field_to_webp(self, 'image_upload')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.placement})"

    class Meta:
        ordering = ['order_weight', '-created_at']


class Coupon(models.Model):
    DISCOUNT_TYPES = (
        ('PERCENTAGE', 'Percentage Discount'),
        ('FIXED', 'Fixed Amount Discount'),
    )
    code = models.CharField(max_length=50, unique=True, help_text="Coupon code e.g. WELCOME10")
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='PERCENTAGE')
    value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Percentage (e.g. 10 for 10%) or fixed amount (e.g. 50 for ₹50)")
    active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    min_subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Minimum subtotal required to use this coupon")

    def __str__(self):
        type_str = "%" if self.discount_type == 'PERCENTAGE' else "INR"
        return f"{self.code} (-{self.value}{type_str})"


class ActivityLog(models.Model):
    session_id = models.CharField(max_length=255, db_index=True)
    event_type = models.CharField(max_length=100, help_text="e.g. PAGE_VIEW, ADD_TO_CART, REMOVE_FROM_CART, APPLY_COUPON, CHECKOUT_SUBMIT")
    payload = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.session_id[:8]} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"

    class Meta:
        ordering = ['-created_at']


class Order(models.Model):
    name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=50)
    address = models.TextField()
    items = models.JSONField(help_text="JSON representation of cart items")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    whatsapp_sent = models.BooleanField(default=False)
    whatsapp_error = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.name} - Total: ₹{self.total}"

    class Meta:
        ordering = ['-created_at']


class SeoAudit(models.Model):
    target_url = models.URLField(max_length=500, help_text="Page URL that was audited")
    score = models.IntegerField(default=0, help_text="0–100 on-page SEO score")
    http_status = models.IntegerField(null=True, blank=True)
    counts = models.JSONField(default=dict, blank=True, help_text="{pass, warn, fail}")
    results = models.JSONField(default=list, blank=True, help_text="Per-check results")
    error = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SEO {self.score}/100 — {self.target_url} ({self.created_at:%Y-%m-%d %H:%M})"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "SEO Audit"


class SiteConfig(models.Model):
    owner_whatsapp_number = models.CharField(max_length=50, default="919876543210", help_text="WhatsApp number of the owner (include country code, e.g. 919876543210 for India)")
    openwa_api_url = models.URLField(max_length=255, default="http://localhost:2785", help_text="Base URL of the OpenWA Gateway")
    openwa_api_key = models.CharField(max_length=255, blank=True, null=True, help_text="API key for OpenWA authorization (if any)")
    openwa_session_id = models.CharField(max_length=100, default="default", help_text="Active WhatsApp session ID on the gateway")
    
    # CMS / Design customization settings
    announcement_text = models.CharField(max_length=255, default="FREE SHIPPING ON ORDERS OVER ₹999 / $40 • SAVE 10% ON SUBSCRIPTIONS")
    logo_title = models.CharField(max_length=100, default="MANGALAM")
    logo_subtitle = models.CharField(max_length=100, default="HEALTHY FOODS")
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=999.00)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def clean(self):
        if SiteConfig.objects.exists() and not self.pk:
            raise ValidationError("You can only create one SiteConfig instance. Please edit the existing one instead.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Mangalam Site Configuration"
