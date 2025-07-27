
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.ItemViewSet)
router.register(r'management-methods', views.ManagementMethodViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'delivered-orders', views.DeliveredOrderViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("", views.index, name="index"),
    path("item-master/", views.item_master, name="item_master"),
    path("order-delivery-confirmation/", views.order_delivery_confirmation, name="order_delivery_confirmation"),
    path("register/", views.item_registration, name="item_registration"),
    path("order/", views.order_entry, name="order_entry"),
    path("deleted/", views.deleted_items, name="deleted_items"),
    path("api/trigger-excel-backup/", views.trigger_excel_backup, name="trigger_excel_backup"),
]
