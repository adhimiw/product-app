"""Image upload helpers: convert any uploaded raster image to optimized WebP.

Synchronous conversion is fine at this site's volume (a handful of admin
uploads). ponytail: move to a thread/Celery only if bulk uploads ever make
the request block noticeably.
"""
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from django.core.files.base import ContentFile
import os

WEBP_QUALITY = 82
# Cap huge originals — nothing on the site is shown wider than this.
MAX_DIMENSION = 1600


def to_webp(uploaded_file, quality=WEBP_QUALITY):
    """Return a Django ContentFile (.webp) from an uploaded image, or None if
    the file isn't a decodable image. Preserves transparency, downscales
    oversized images. Never raises on bad input — caller keeps the original."""
    try:
        img = Image.open(uploaded_file)
        img.load()
    except (UnidentifiedImageError, OSError, ValueError):
        return None

    has_alpha = img.mode in ("RGBA", "LA", "P")
    img = img.convert("RGBA" if has_alpha else "RGB")

    if max(img.size) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    buffer = BytesIO()
    img.save(buffer, format="WEBP", quality=quality, method=6)

    base = os.path.splitext(os.path.basename(getattr(uploaded_file, "name", "image")))[0]
    return ContentFile(buffer.getvalue(), name=f"{base}.webp")


def convert_field_to_webp(instance, field_name):
    """If the given ImageField holds a freshly uploaded non-webp image, replace
    it in place with a WebP version. Idempotent — skips files already .webp."""
    field = getattr(instance, field_name, None)
    if not field:
        return
    name = getattr(field, "name", "") or ""
    if name.lower().endswith(".webp"):
        return
    webp = to_webp(field)
    if webp is not None:
        # save=False: caller is mid-save; avoids recursion.
        field.save(webp.name, webp, save=False)
