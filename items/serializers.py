
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

    def validate(self, data):
        # 新規作成時のみ重複チェックを行う
        if self.instance is None:
            item = data.get('item')
            order_date = data.get('order_date')

            if Order.objects.filter(item=item, order_date=order_date).exists():
                raise serializers.ValidationError('同じ物品が同じ日付で既に注文されています。')
        return data

class DeliveredOrderSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = DeliveredOrder
        fields = '__all__'
