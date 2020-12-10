import os, django

os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()
from channels.routing import get_default_application

application = get_default_application()
