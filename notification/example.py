from django.contrib.auth.models import User
from django.http import HttpResponse
from .views import send_notification_chat, send_notification_user, send_notification_call
import random


def example_send_notification(request):
    example = [
        ('error', 'ошибки', False),
        ('info', 'уведомления', True),
        ('warning', 'предупреждения', True),
        ('success', 'успешного выполнения', True),

    ]
    status, message, auto_close = random.choice(example)
    send_notification_user(request.user.pk, 'пример уведомления ' + message.upper(), status, auto_close)
    return HttpResponse(status=201)


def example_send_chat(request):
    send_notification_chat(request.user, request.user, 'пример сообщения в чат')
    return HttpResponse(status=201)


def example_call(request):
    send_notification_call(request.user.pk, 'пример звонка')
    return HttpResponse(status=200)
