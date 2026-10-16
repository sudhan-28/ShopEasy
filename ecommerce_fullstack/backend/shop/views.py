from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Product, Order, OrderItem
from .serializers import ProductSerializer, OrderSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.all()
        search = self.request.query_params.get("search", "").strip()
        category = self.request.query_params.get("category", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if category and category.lower() != "all":
            qs = qs.filter(category__iexact=category)
        return qs

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryListView(APIView):
    def get(self, request):
        categories = Product.objects.order_by("category").values_list("category", flat=True).distinct()
        return Response(list(categories))

class CreateOrderView(APIView):
    @transaction.atomic
    def post(self, request):
        name = str(request.data.get("customer_name", "")).strip()
        email = str(request.data.get("email", "")).strip()
        address = str(request.data.get("address", "")).strip()
        items = request.data.get("items", [])

        if not name or not email or not address:
            return Response({"detail": "Name, email, and address are required."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(items, list) or not items:
            return Response({"detail": "Add at least one item to your cart."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order(customer_name=name, email=email, address=address, total=Decimal("0.00"))
        order.save()
        total = Decimal("0.00")

        for item in items:
            try:
                product_id = int(item.get("product_id"))
                quantity = int(item.get("quantity"))
            except (TypeError, ValueError, AttributeError):
                transaction.set_rollback(True)
                return Response({"detail": "Each item must have a valid product_id and quantity."}, status=status.HTTP_400_BAD_REQUEST)
            if quantity < 1 or quantity > 100:
                transaction.set_rollback(True)
                return Response({"detail": "Quantity must be between 1 and 100."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                product = Product.objects.select_for_update().get(pk=product_id)
            except Product.DoesNotExist:
                transaction.set_rollback(True)
                return Response({"detail": f"Product {product_id} was not found."}, status=status.HTTP_400_BAD_REQUEST)
            if product.stock < quantity:
                transaction.set_rollback(True)
                return Response({"detail": f"Not enough stock for {product.name}."}, status=status.HTTP_400_BAD_REQUEST)

            line_total = product.price * quantity
            total += line_total
            OrderItem.objects.create(
                order=order, product=product, product_name=product.name,
                unit_price=product.price, quantity=quantity
            )
            product.stock -= quantity
            product.save(update_fields=["stock"])

        order.total = total
        order.save(update_fields=["total"])
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
