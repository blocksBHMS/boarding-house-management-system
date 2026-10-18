from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('paid', 'Paid'),
                    ('rejected', 'Rejected'),
                ],
                default='paid',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='payment',
            name='rejection_reason',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
