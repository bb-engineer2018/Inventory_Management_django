from django.db import models

class ManagementMethod(models.Model):
    method_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.method_name

class Item(models.Model):
    name = models.CharField(max_length=255, unique=True)
    supplier = models.CharField(max_length=255, blank=True, null=True)
    standard = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=50, blank=True, null=True)
    quantity_per_pack = models.IntegerField(blank=True, null=True)
    storage_location = models.CharField(max_length=255, blank=True, null=True)
    management_method = models.ForeignKey(ManagementMethod, on_delete=models.SET_NULL, null=True)
    delivery_price = models.FloatField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Order(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    order_date = models.DateField()
    order_quantity = models.IntegerField()

    def __str__(self):
        return f"Order for {self.item.name} on {self.order_date}"

class DeliveredOrder(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    order_date = models.DateField()
    order_quantity = models.IntegerField()
    delivery_date = models.DateField()

    def __str__(self):
        return f"Delivery for {self.item.name} on {self.delivery_date}"