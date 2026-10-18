from django.db import migrations


def keep_latest_tenancy_active(apps, schema_editor):
    Tenancy = apps.get_model('tenancies', 'Tenancy')
    db_alias = schema_editor.connection.alias
    ended_ids = []
    active_tenants = set()

    tenancies = Tenancy.objects.using(db_alias).order_by(
        'tenant_id', '-check_in_date', '-id'
    ).only('id', 'tenant_id').iterator()

    for tenancy in tenancies:
        if tenancy.tenant_id in active_tenants:
            ended_ids.append(tenancy.id)
            if len(ended_ids) == 500:
                Tenancy.objects.using(db_alias).filter(pk__in=ended_ids).update(is_active=False)
                ended_ids.clear()
        else:
            active_tenants.add(tenancy.tenant_id)

    if ended_ids:
        Tenancy.objects.using(db_alias).filter(pk__in=ended_ids).update(is_active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('tenancies', '0002_tenancy_is_active'),
    ]

    operations = [
        migrations.RunPython(keep_latest_tenancy_active, migrations.RunPython.noop),
    ]
