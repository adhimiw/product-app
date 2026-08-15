from django.contrib import admin, messages
from django.utils.html import format_html, format_html_join
import json
from .models import Product, Coupon, Order, ActivityLog, SiteConfig, Banner, SeoAudit
from .services.seo import run_and_store


def _thumb(image_field, size=60):
    """Small preview <img> for an ImageField, or a dash when empty."""
    if image_field:
        return format_html(
            '<img src="{}" style="height:{}px;width:{}px;object-fit:cover;'
            'border-radius:6px;border:1px solid #ddd;" />',
            image_field.url, size, size,
        )
    return format_html('<span style="color:#999;">—</span>')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('preview', 'name', 'id', 'category', 'price', 'inr_price', 'tag', 'is_active', 'order_weight')
    list_display_links = ('name',)
    list_filter = ('category', 'tag', 'is_active')
    search_fields = ('name', 'id', 'description')
    ordering = ('order_weight', 'name')
    list_editable = ('price', 'is_active', 'order_weight')
    readonly_fields = ('preview_large',)

    def preview(self, obj):
        return _thumb(obj.image_upload)
    preview.short_description = "Image"

    def preview_large(self, obj):
        return _thumb(obj.image_upload, size=180)
    preview_large.short_description = "Current image preview"


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('preview', 'title', 'placement', 'badge', 'cta_text', 'active', 'order_weight')
    list_display_links = ('title',)
    list_filter = ('placement', 'active')
    search_fields = ('title', 'subtitle', 'description', 'badge')
    list_editable = ('active', 'order_weight')
    readonly_fields = ('preview_large',)

    def preview(self, obj):
        return _thumb(obj.image_upload)
    preview.short_description = "Image"

    def preview_large(self, obj):
        return _thumb(obj.image_upload, size=180)
    preview_large.short_description = "Current image preview"


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'value', 'active', 'min_subtotal', 'valid_from', 'valid_to')
    list_filter = ('discount_type', 'active')
    search_fields = ('code',)
    ordering = ('code',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'event_type', 'session_id', 'ip_address', 'short_payload')
    list_filter = ('event_type', 'created_at')
    search_fields = ('session_id', 'event_type', 'ip_address', 'payload')
    readonly_fields = ('created_at', 'event_type', 'session_id', 'payload', 'ip_address', 'user_agent')

    def short_payload(self, obj):
        try:
            return json.dumps(obj.payload)[:100] + '...' if len(json.dumps(obj.payload)) > 100 else json.dumps(obj.payload)
        except Exception:
            return str(obj.payload)
    short_payload.short_description = "Payload"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'mobile', 'total', 'coupon_code', 'whatsapp_status', 'created_at')
    list_filter = ('whatsapp_sent', 'created_at')
    search_fields = ('name', 'mobile', 'address', 'coupon_code')
    readonly_fields = ('id', 'created_at', 'name', 'mobile', 'address', 'items', 'subtotal', 'discount', 'coupon_code', 'total', 'whatsapp_sent', 'whatsapp_error', 'display_items')

    def whatsapp_status(self, obj):
        if obj.whatsapp_sent:
            return format_html('<span style="color: green; font-weight: bold;">✔️ Sent</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">❌ Failed: {}</span>', obj.whatsapp_error or "Unknown error")
    whatsapp_status.short_description = "WhatsApp Status"

    def display_items(self, obj):
        items_data = obj.items
        if isinstance(items_data, str):
            try:
                items_data = json.loads(items_data)
            except Exception:
                pass
        
        html = '<table style="width:100%; border-collapse: collapse; border: 1px solid #ccc;">'
        html += '<tr style="background:#eee; text-align:left;"><th style="padding:6px; border: 1px solid #ccc;">Item Name</th><th style="padding:6px; border: 1px solid #ccc;">Quantity</th><th style="padding:6px; border: 1px solid #ccc;">Plan</th><th style="padding:6px; border: 1px solid #ccc;">Unit Price</th><th style="padding:6px; border: 1px solid #ccc;">Total</th></tr>'
        
        if isinstance(items_data, list):
            for item in items_data:
                html += f'<tr><td style="padding:6px; border: 1px solid #ccc;">{item.get("name")}</td><td style="padding:6px; border: 1px solid #ccc;">{item.get("quantity")}</td><td style="padding:6px; border: 1px solid #ccc; text-transform:capitalize;">{item.get("option")}</td><td style="padding:6px; border: 1px solid #ccc;">₹{item.get("price")}</td><td style="padding:6px; border: 1px solid #ccc;">₹{item.get("total")}</td></tr>'
        else:
            html += f'<tr><td colspan="5" style="padding:6px;">{items_data}</td></tr>'
        
        html += '</table>'
        return format_html(html)
    display_items.short_description = "Order Items Detail"


_SEO_COLOR = {'pass': '#1b7a34', 'warn': '#b8860b', 'fail': '#c0392b'}


@admin.register(SeoAudit)
class SeoAuditAdmin(admin.ModelAdmin):
    list_display = ('score_badge', 'target_url', 'summary', 'created_at')
    list_display_links = ('target_url',)
    readonly_fields = ('score', 'http_status', 'counts', 'created_at', 'error', 'results_table')
    exclude = ('results',)
    actions = ['rerun_audit']

    def score_badge(self, obj):
        color = '#1b7a34' if obj.score >= 80 else '#b8860b' if obj.score >= 50 else '#c0392b'
        return format_html('<b style="color:{}">{}/100</b>', color, obj.score)
    score_badge.short_description = "Score"

    def summary(self, obj):
        c = obj.counts or {}
        return format_html('✅ {} &nbsp; ⚠️ {} &nbsp; ❌ {}', c.get('pass', 0), c.get('warn', 0), c.get('fail', 0))
    summary.short_description = "Checks"

    def results_table(self, obj):
        rows = format_html_join(
            '',
            '<tr><td style="padding:4px 10px;color:{}">●</td>'
            '<td style="padding:4px 10px;"><b>{}</b></td>'
            '<td style="padding:4px 10px;color:{}">{}</td>'
            '<td style="padding:4px 10px;color:#555;">{}</td></tr>',
            (
                (_SEO_COLOR.get(r.get('status'), '#555'), r.get('label', ''),
                 _SEO_COLOR.get(r.get('status'), '#555'), r.get('status', '').upper(), r.get('detail', ''))
                for r in (obj.results or [])
            ),
        )
        return format_html('<table style="border-collapse:collapse;">{}</table>', rows)
    results_table.short_description = "Check results"

    @admin.action(description="Re-run SEO audit on the selected page(s)")
    def rerun_audit(self, request, queryset):
        for old in queryset:
            audit = run_and_store(old.target_url)
            if audit.error:
                messages.error(request, f"SEO audit failed for {old.target_url}: {audit.error}")
            else:
                messages.success(request, f"SEO audit for {old.target_url}: {audit.score}/100")


@admin.register(SiteConfig)
class SiteConfigAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'owner_whatsapp_number', 'openwa_api_url', 'openwa_session_id', 'free_shipping_threshold')
    
    fieldsets = (
        ('WhatsApp Gateway Settings (OpenWA)', {
            'fields': ('owner_whatsapp_number', 'openwa_api_url', 'openwa_api_key', 'openwa_session_id'),
            'description': 'Configure the OpenWA Gateway connection parameters and the recipient WhatsApp number.'
        }),
        ('Frontend Website Content & CMS', {
            'fields': ('announcement_text', 'logo_title', 'logo_subtitle', 'free_shipping_threshold'),
            'description': 'Change layout-wide values that display dynamically in the frontend client.'
        }),
    )

    def has_add_permission(self, request):
        # Only allow adding if no settings instance exists
        return not SiteConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Do not allow deleting settings, only editing
        return False
