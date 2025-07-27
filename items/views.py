from django.shortcuts import render
from django.http import JsonResponse
from django.core.management import call_command

def index(request):
    return render(request, 'index.html')

def item_master(request):
    return render(request, 'item_master.html')

def order_delivery_confirmation(request):
    return render(request, 'order_delivery_confirmation.html')

def item_registration(request):
    return render(request, 'item_registration.html')

def order_entry(request):
    return render(request, 'order_entry.html')

def deleted_items(request):
    return render(request, 'deleted_items.html')

def trigger_excel_backup(request):
    try:
        call_command('backup_excel')
        return JsonResponse({'status': 'success', 'message': 'Excel backup initiated successfully.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .filters import OrderFilter, DeliveredOrderFilter
from .models import Item, ManagementMethod, Order, DeliveredOrder
from .serializers import ItemSerializer, ManagementMethodSerializer, OrderSerializer, DeliveredOrderSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.filter(is_deleted=False)
    serializer_class = ItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['id', 'management_method']
    search_fields = ['name', 'supplier']

    @action(detail=True, methods=['post'])
    def delete_item(self, request, pk=None):
        item = self.get_object()
        item.is_deleted = True
        item.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        item = Item.objects.filter(pk=pk).first()
        if item:
            item.is_deleted = False
            item.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def deleted(self, request):
        queryset = Item.objects.filter(is_deleted=True)
        # DjangoFilterBackendを明示的に適用
        filter_backend = DjangoFilterBackend()
        filtered_queryset = filter_backend.filter_queryset(request, queryset, self)

        # SearchFilterを明示的に適用
        search_filter = filters.SearchFilter()
        filtered_queryset = search_filter.filter_queryset(request, filtered_queryset, self)

        serializer = self.get_serializer(filtered_queryset, many=True)
        return Response(serializer.data)

class ManagementMethodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ManagementMethod.objects.all()
    serializer_class = ManagementMethodSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrderFilter

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        order = self.get_object()
        DeliveredOrder.objects.create(
            item=order.item,
            order_date=order.order_date,
            order_quantity=order.order_quantity,
            delivery_date=request.data.get('delivery_date')
        )
        order.delete()
        return Response(status=status.HTTP_200_OK)

class DeliveredOrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeliveredOrder.objects.all()
    serializer_class = DeliveredOrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DeliveredOrderFilter

    @action(detail=True, methods=['post'])
    def revert(self, request, pk=None):
        delivered_order = self.get_object()
        Order.objects.create(
            item=delivered_order.item,
            order_date=delivered_order.order_date,
            order_quantity=delivered_order.order_quantity
        )
        delivered_order.delete()
        return Response(status=status.HTTP_200_OK)