from django.urls import path
from .provider import *

urlpatterns = [
    path('webhook-zadarma/', WebhookZadarma.as_view(), name='webhook_zadarma'),
    path('zadarma2/', zadarma2),
]