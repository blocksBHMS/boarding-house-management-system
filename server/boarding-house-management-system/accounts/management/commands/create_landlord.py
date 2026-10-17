from django.core.management.base import BaseCommand
from accounts.models import Accounts

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)
        parser.add_argument("--password", required=True)

    def handle(self, *args, **opts):
        if Accounts.objects.filter(role="landlord").exists():
            self.stdout.write("Landlord already exists, skipping.")
            return
        Accounts.objects.create_user(
            username=opts["username"],
            password=opts["password"],
            role="landlord",
        )
        self.stdout.write("Landlord created.")