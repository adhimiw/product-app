"""Upload validation — image uploads are a classic attack surface."""
from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB


def validate_image_upload(f):
    """Reject oversized files and anything Pillow can't decode as an image."""
    if f.size and f.size > MAX_UPLOAD_BYTES:
        raise ValidationError(f"Image too large (max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB).")
    try:
        Image.open(f).verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise ValidationError("Upload a valid image file.")
    finally:
        if hasattr(f, 'seek'):
            f.seek(0)
