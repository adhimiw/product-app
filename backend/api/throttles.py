"""Per-endpoint rate limits (rates configured in settings DEFAULT_THROTTLE_RATES)."""
from rest_framework.throttling import AnonRateThrottle


class OrderRateThrottle(AnonRateThrottle):
    scope = 'orders'


class ActivityRateThrottle(AnonRateThrottle):
    scope = 'activity'


class CouponRateThrottle(AnonRateThrottle):
    scope = 'coupons'
