from django.db import migrations

def create_initial_management_methods(apps, schema_editor):
    ManagementMethod = apps.get_model('items', 'ManagementMethod')
    ManagementMethod.objects.get_or_create(method_name='SPD')
    ManagementMethod.objects.get_or_create(method_name='個別注文')

class Migration(migrations.Migration):

    dependencies = [
        ('items', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_management_methods),
    ]
