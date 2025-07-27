import django_filters
from .models import Order, DeliveredOrder, Item

class OrderFilter(django_filters.FilterSet):
    order_date__gte = django_filters.DateFilter(field_name='order_date', lookup_expr='gte')
    order_date__lte = django_filters.DateFilter(field_name='order_date', lookup_expr='lte')

    class Meta:
        model = Order
        fields = ['item', 'order_date']

class DeliveredOrderFilter(django_filters.FilterSet):
    delivery_date__gte = django_filters.DateFilter(field_name='delivery_date', lookup_expr='gte')
    delivery_date__lte = django_filters.DateFilter(field_name='delivery_date', lookup_expr='lte')

    class Meta:
        model = DeliveredOrder
        fields = ['item', 'delivery_date']

class ItemFilter(django_filters.FilterSet):
    class Meta:
        model = Item
        fields = ['id', 'management_method']
