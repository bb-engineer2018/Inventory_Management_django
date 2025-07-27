
from rest_framework import serializers
from .models import Item, ManagementMethod, Order, DeliveredOrder

class ManagementMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagementMethod
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    management_method_name = serializers.CharField(source='management_method.method_name', read_only=True)

    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['is_deleted']

class OrderSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class DeliveredOrderSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = DeliveredOrder
        fields = '__all__'
