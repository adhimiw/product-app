"""Self-hosted analytics + click-heatmap dashboard (Django admin, staff-only).

All data comes from ActivityLog / Order in our own DB — no third-party tracker.
"""
from datetime import timedelta
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.shortcuts import render
from django.utils import timezone
from .models import ActivityLog, Order

WINDOW_DAYS = 30
FUNNEL_STEPS = [
    ('PAGE_VIEW', 'Page views'),
    ('VIEW_PRODUCT', 'Product views'),
    ('ADD_TO_CART', 'Add to cart'),
    ('CHECKOUT_INIT', 'Checkout started'),
    ('CHECKOUT_SUCCESS', 'Checkout success'),
]


@staff_member_required
def analytics_view(request):
    since = timezone.now() - timedelta(days=WINDOW_DAYS)
    logs = ActivityLog.objects.filter(created_at__gte=since)

    by_type = dict(logs.values_list('event_type').annotate(n=Count('id')))

    kpis = {
        'visitors': logs.values('session_id').distinct().count(),
        'page_views': by_type.get('PAGE_VIEW', 0),
        'events': logs.count(),
        'add_to_cart': by_type.get('ADD_TO_CART', 0),
    }

    # Funnel (absolute counts + % of the first step)
    top = by_type.get(FUNNEL_STEPS[0][0], 0) or 1
    funnel = [
        {'label': label, 'count': by_type.get(evt, 0),
         'pct': round(100 * by_type.get(evt, 0) / top)}
        for evt, label in FUNNEL_STEPS
    ]

    # Visitors per day
    daily_qs = (logs.annotate(d=TruncDate('created_at'))
                .values('d')
                .annotate(sessions=Count('session_id', distinct=True), events=Count('id'))
                .order_by('d'))
    daily = [{'date': r['d'].strftime('%b %d'), 'sessions': r['sessions'], 'events': r['events']} for r in daily_qs]
    max_sessions = max([d['sessions'] for d in daily], default=1)

    # Top pages (from PAGE_VIEW payload.page_name)
    pages_qs = (logs.filter(event_type='PAGE_VIEW')
                .values('payload__page_name')
                .annotate(n=Count('id')).order_by('-n')[:10])
    top_pages = [{'page': r['payload__page_name'] or '(unknown)', 'n': r['n']} for r in pages_qs]
    max_page = max([p['n'] for p in top_pages], default=1)

    # Coupons + orders
    coupon = {
        'success': by_type.get('COUPON_SUCCESS', 0),
        'failure': by_type.get('COUPON_FAILURE', 0),
        'attempt': by_type.get('COUPON_ATTEMPT', 0),
    }
    orders = Order.objects.filter(created_at__gte=since)
    order_stats = {
        'count': orders.count(),
        'revenue': orders.aggregate(t=Sum('total'))['t'] or 0,
    }

    # Click points for the heatmap
    clicks = list(logs.filter(event_type='CLICK').values_list('payload', flat=True)[:5000])
    click_points = [
        {'x': c.get('x'), 'y': c.get('y'), 'vw': c.get('vw'), 'dh': c.get('dh'), 'page': c.get('page')}
        for c in clicks if isinstance(c, dict) and c.get('x') is not None and c.get('vw')
    ]
    click_pages = sorted({p['page'] for p in click_points if p['page']})

    return render(request, 'admin/analytics.html', {
        'title': 'Analytics & Heatmap',
        'window_days': WINDOW_DAYS,
        'kpis': kpis,
        'funnel': funnel,
        'daily': daily, 'max_sessions': max_sessions,
        'top_pages': top_pages, 'max_page': max_page,
        'coupon': coupon,
        'order_stats': order_stats,
        'click_points': click_points,
        'click_pages': click_pages,
    })
