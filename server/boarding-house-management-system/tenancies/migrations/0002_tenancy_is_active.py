from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenancies', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenancy',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
