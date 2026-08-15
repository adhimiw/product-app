from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from .throttles import OrderRateThrottle, ActivityRateThrottle, CouponRateThrottle
from .models import Product, Coupon, Order, ActivityLog, SiteConfig, Banner
from .serializers import ProductSerializer, CouponSerializer, OrderSerializer, SiteConfigSerializer, BannerSerializer
from .whatsapp import send_whatsapp_order_notification
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def populate_default_products():
    """Helper to populate the database with default products if empty."""
    if Product.objects.exists():
        return

    defaults = [
        {
            "id": "health-mix-300g",
            "name": "Amutham Sprouted Health Mix (300g)",
            "category": "Sprouted Millets & Grains",
            "description": "Our signature sprouted ancient grain mix. Crafted with Pearl Millet, Finger Millet, Sorghum, and legumes — hygienically processed and enriched with green cardamom. 100% natural, no chemicals or preservatives.",
            "price": 110.00,
            "badge": "Flagship Pouch",
            "tag": "Starter",
            "details_badge": "Sprouted Millets & Grains",
            "lead": "Our signature sprouted ancient grain mix. Crafted with nine sprouted grains, hygienically processed and enriched with green cardamom. 100% natural, no chemicals or preservatives.",
            "ingredients": "Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), Bengal Gram (Pottukadalai), Black Gram (Ulundhu), Green Gram (Pasi Payaru), Wheat (Godhumai), Sprouted Roasted Gram, Cardamom.",
            "about": "Selected premium ancient grains are thoroughly sprout-activated, hygienically processed, and ground to create a complete nutritious elixir. 100% natural, no chemical preservatives or artificial elements added.",
            "order_weight": 1
        },
        {
            "id": "health-mix-500g",
            "name": "Amutham Sprouted Health Mix (500g)",
            "category": "Sprouted Millets & Grains",
            "description": "Our signature sprouted ancient grain mix in a larger family-size pack. High protein, high fiber, 100% natural — perfect for daily nutrition.",
            "price": 160.00,
            "badge": "Family Pack",
            "tag": "Family",
            "details_badge": "Sprouted Millets & Grains",
            "lead": "Our signature sprouted ancient grain mix. Crafted with nine sprouted grains, hygienically processed and enriched with green cardamom. 100% natural, no chemicals or preservatives.",
            "ingredients": "Pearl Millet (Kambu), Finger Millet (Ragi), Sorghum (Cholam), Bengal Gram (Pottukadalai), Black Gram (Ulundhu), Green Gram (Pasi Payaru), Wheat (Godhumai), Sprouted Roasted Gram, Cardamom.",
            "about": "Selected premium ancient grains are thoroughly sprout-activated, hygienically processed, and ground to create a complete nutritious elixir. 100% natural, no chemical preservatives or artificial elements added.",
            "order_weight": 2
        },
        {
            "id": "uluntham-300g",
            "name": "Mangalam Uluntham Mix (300g)",
            "category": "Traditional Uluntham Mix",
            "description": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). A wholesome traditional blend for daily nutrition.",
            "price": 115.00,
            "badge": "Traditional Special",
            "tag": "Starter",
            "details_badge": "Traditional Uluntham Mix",
            "lead": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). A wholesome traditional blend for daily nutrition — prepared with care using traditional methods.",
            "ingredients": "Mapillai Samba Rice, Black Gram (Ulundhu), traditional spices.",
            "about": "Our Mangalam Uluntham Mix is prepared using traditional methods with premium Mapillai Samba rice, known for its rich nutritional profile and health benefits.",
            "order_weight": 3
        },
        {
            "id": "uluntham-500g",
            "name": "Mangalam Uluntham Mix (500g)",
            "category": "Traditional Uluntham Mix",
            "description": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). A wholesome traditional blend for daily nutrition — family size.",
            "price": 180.00,
            "badge": "Traditional Special",
            "tag": "Family",
            "details_badge": "Traditional Uluntham Mix",
            "lead": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). A wholesome traditional blend for daily nutrition — prepared with care using traditional methods.",
            "ingredients": "Mapillai Samba Rice, Black Gram (Ulundhu), traditional spices.",
            "about": "Our Mangalam Uluntham Mix is prepared using traditional methods with premium Mapillai Samba rice, known for its rich nutritional profile and health benefits.",
            "order_weight": 4
        },
        {
            "id": "uluntham-1kg",
            "name": "Mangalam Uluntham Mix (1kg)",
            "category": "Traditional Uluntham Mix",
            "description": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). Best value bulk pack for the whole family.",
            "price": 350.00,
            "badge": "Best Value",
            "tag": "Premium",
            "details_badge": "Traditional Uluntham Mix",
            "lead": "Made with premium Mapillai Samba rice and traditional Uluntham (black gram). A wholesome traditional blend for daily nutrition — prepared with care using traditional methods.",
            "ingredients": "Mapillai Samba Rice, Black Gram (Ulundhu), traditional spices.",
            "about": "Our Mangalam Uluntham Mix is prepared using traditional methods with premium Mapillai Samba rice, known for its rich nutritional profile and health benefits.",
            "order_weight": 5
        }
    ]

    for item in defaults:
        Product.objects.get_or_create(id=item["id"], defaults=item)


def populate_default_coupons():
    """Helper to populate the database with default coupons if empty."""
    if Coupon.objects.exists():
        return

    defaults = [
        {
            "code": "WELCOME10",
            "discount_type": "PERCENTAGE",
            "value": Decimal("10.00"),
            "min_subtotal": Decimal("0.00"),
            "active": True
        },
        {
            "code": "MANGALAM50",
            "discount_type": "FIXED",
            "value": Decimal("50.00"),
            "min_subtotal": Decimal("300.00"),
            "active": True
        }
    ]
    for item in defaults:
        Coupon.objects.get_or_create(code=item["code"], defaults=item)


@api_view(['GET'])
def get_site_config(request):
    """Fetch public site configurations."""
    config = SiteConfig.get_solo()
    serializer = SiteConfigSerializer(config)
    return Response(serializer.data)


@api_view(['GET'])
def get_products(request):
    """Fetch all active products (automatically populates if empty)."""
    populate_default_products()
    products = Product.objects.filter(is_active=True)
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def get_banners(request):
    """Fetch active banners, optionally filtered by ?placement=hero."""
    banners = Banner.objects.filter(active=True)
    placement = request.query_params.get('placement')
    if placement:
        banners = banners.filter(placement=placement)
    serializer = BannerSerializer(banners, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@throttle_classes([CouponRateThrottle])
def validate_coupon(request):
    """Validate a coupon code and calculate discount."""
    populate_default_coupons()
    code = request.data.get('code', '').strip().upper()
    subtotal_val = request.data.get('subtotal', 0)

    try:
        subtotal = Decimal(str(subtotal_val))
    except Exception:
        return Response({'valid': False, 'message': 'Invalid subtotal value.'}, status=status.HTTP_400_BAD_REQUEST)

    if not code:
        return Response({'valid': False, 'message': 'Coupon code is required.'})

    try:
        coupon = Coupon.objects.get(code=code)
    except Coupon.DoesNotExist:
        return Response({'valid': False, 'message': 'Coupon code does not exist.'})

    # Validate active state and date range
    now = timezone.now()
    if not coupon.active:
        return Response({'valid': False, 'message': 'This coupon is no longer active.'})
    
    if coupon.valid_from and now < coupon.valid_from:
        return Response({'valid': False, 'message': 'This coupon is not active yet.'})
        
    if coupon.valid_to and now > coupon.valid_to:
        return Response({'valid': False, 'message': 'This coupon has expired.'})

    if subtotal < coupon.min_subtotal:
        return Response({'valid': False, 'message': f'Minimum subtotal of ₹{coupon.min_subtotal} required to use this coupon.'})

    # Calculate discount
    if coupon.discount_type == 'PERCENTAGE':
        discount = (subtotal * coupon.value) / Decimal('100.00')
    else:  # FIXED
        discount = coupon.value

    # Discount cannot be larger than the subtotal
    discount = min(discount, subtotal)

    # Format values for response
    discount = round(discount, 2)
    final_total = subtotal - discount

    return Response({
        'valid': True,
        'code': coupon.code,
        'discount_type': coupon.discount_type,
        'value': float(coupon.value),
        'discount': float(discount),
        'final_total': float(final_total),
        'message': f'Coupon {coupon.code} applied successfully!'
    })


@api_view(['POST'])
@throttle_classes([OrderRateThrottle])
def create_order(request):
    """Create a new order, trigger WhatsApp alert, log user activity, and return details."""
    data = request.data
    name = (data.get('name') or '').strip()
    mobile = (data.get('mobile') or '').strip()
    address = (data.get('address') or '').strip()
    items = data.get('items') or []
    coupon_code = (data.get('coupon_code') or '').strip().upper()
    session_id = data.get('session_id', 'unknown_session')

    if not name or not mobile or not address:
        return Response({'error': 'Name, Mobile, and Address are required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    if not items:
        return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    # Calculate subtotal based on backend product prices
    subtotal = Decimal('0.00')
    verified_items = []
    
    # Pre-populate default products if somehow they aren't loaded
    populate_default_products()

    for item in items:
        prod_id = item.get('id')
        qty = int(item.get('quantity', 1))
        option = item.get('option', 'one-time')

        try:
            product = Product.objects.get(id=prod_id)
            price = product.price
            
            # Apply 10% discount for subscription
            if option == 'subscribe':
                price = price * Decimal('0.90')

            price = round(price, 2)
            item_total = price * qty
            subtotal += item_total

            verified_items.append({
                'id': prod_id,
                'name': product.name,
                'price': float(price),
                'quantity': qty,
                'option': option,
                'total': float(item_total)
            })
        except Product.DoesNotExist:
            return Response({'error': f'Product {prod_id} is not valid.'}, status=status.HTTP_400_BAD_REQUEST)

    # Apply Coupon
    discount = Decimal('0.00')
    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code)
            now = timezone.now()
            
            # Check basic conditions
            if (coupon.active and 
                (not coupon.valid_from or now >= coupon.valid_from) and 
                (not coupon.valid_to or now <= coupon.valid_to) and 
                subtotal >= coupon.min_subtotal):
                
                if coupon.discount_type == 'PERCENTAGE':
                    discount = (subtotal * coupon.value) / Decimal('100.00')
                else:
                    discount = coupon.value
                
                discount = min(discount, subtotal)
                discount = round(discount, 2)
        except Coupon.DoesNotExist:
            coupon_code = None  # ignore invalid coupon

    total = subtotal - discount

    # Create Order object
    order = Order.objects.create(
        name=name,
        mobile=mobile,
        address=address,
        items=verified_items,
        subtotal=subtotal,
        discount=discount,
        coupon_code=coupon_code if coupon_code else None,
        total=total
    )

    # Trigger WhatsApp notification using OpenWA
    config = SiteConfig.get_solo()
    whatsapp_sent, whatsapp_error = send_whatsapp_order_notification(order, config)
    
    order.whatsapp_sent = whatsapp_sent
    order.whatsapp_error = whatsapp_error
    order.save()

    # Log Checkout Activity
    ActivityLog.objects.create(
        session_id=session_id,
        event_type="CHECKOUT_SUBMIT",
        payload={
            "order_id": order.id,
            "name": name,
            "mobile": mobile,
            "total": float(total),
            "whatsapp_sent": whatsapp_sent,
            "whatsapp_error": whatsapp_error
        },
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    serializer = OrderSerializer(order)
    return Response({
        'success': True,
        'order': serializer.data,
        'whatsapp_sent': whatsapp_sent
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@throttle_classes([ActivityRateThrottle])
def log_activity(request):
    """Log arbitrary client-side activities (page views, cart additions, etc.)."""
    session_id = request.data.get('session_id')
    event_type = request.data.get('event_type')
    payload = request.data.get('payload', {})

    if not session_id or not event_type:
        return Response({'error': 'session_id and event_type are required.'}, status=status.HTTP_400_BAD_REQUEST)

    log_entry = ActivityLog.objects.create(
        session_id=session_id,
        event_type=event_type,
        payload=payload,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    return Response({
        'logged': True,
        'id': log_entry.id
    }, status=status.HTTP_201_CREATED)
