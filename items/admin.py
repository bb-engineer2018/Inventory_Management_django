from django.contrib import admin
from .models import ManagementMethod, Item, Order, DeliveredOrder

# Register your models here.
admin.site.register(ManagementMethod)
admin.site.register(Item)
admin.site.register(Order)
admin.site.register(DeliveredOrder)
