from django.core.management.base import BaseCommand
from shop.models import Product

SAMPLE_PRODUCTS = [
    ("Everyday Backpack", "A lightweight backpack with padded straps and a roomy main compartment.", "Accessories", "1299.00", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", 18, True),
    ("Minimal Sneakers", "Comfortable everyday sneakers with a clean, versatile design.", "Footwear", "2199.00", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", 24, True),
    ("Classic Watch", "A timeless everyday watch with a minimalist face.", "Accessories", "1799.00", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", 12, True),
    ("Cotton T-Shirt", "Soft cotton T-shirt designed for daily comfort.", "Clothing", "599.00", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", 40, False),
    ("Ceramic Coffee Mug", "A durable ceramic mug for your favourite hot drinks.", "Home", "349.00", "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80", 30, False),
    ("Wireless Headphones", "Over-ear headphones for music, calls, and everyday listening.", "Electronics", "2499.00", "https://images.unsplash.com/photo-150】?auto=format&fit=crop&w=900&q=80", 15, False),
]
# Replace a potentially unsupported image URL with a stable public image.
SAMPLE_PRODUCTS[-1] = ("Wireless Headphones", "Over-ear headphones for music, calls, and everyday listening.", "Electronics", "2499.00", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", 15, False)

class Command(BaseCommand):
    help = "Load demo products into the database"

    def handle(self, *args, **options):
        created = 0
        for name, description, category, price, image_url, stock, featured in SAMPLE_PRODUCTS:
            _, was_created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "description": description, "category": category, "price": price,
                    "image_url": image_url, "stock": stock, "featured": featured,
                },
            )
            created += int(was_created)
        self.stdout.write(self.style.SUCCESS(f"Seeded products. {created} new product(s) added."))
