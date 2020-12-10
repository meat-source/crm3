import distutils.util

import channels.layers
from asgiref.sync import async_to_sync
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core import serializers
from django.db.models import Q
from django.http import HttpResponse
import json
from notification.models import UserChat

LIST_STATUS_NOTIFICATION = ['danger', 'error', 'warning', 'info', 'success']


def send_notification_user(user_pk, message, status='info', auto_close=True):
    """ Отправляет уведомление по socket. В базу не записывается если юзверь не активен то
     сообщение проппадает """
    channel_layer = channels.layers.get_channel_layer()
    room_group_name = 'notification_user_pk_' + str(user_pk)
    if not status in LIST_STATUS_NOTIFICATION:
        raise ValueError('status must be from the list ' + str(LIST_STATUS_NOTIFICATION))

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'send.message',
            'message': message,
            'status': status,
            'auto_close': auto_close,
            'typeof': 'notification'
        }
    )


def send_notification_call(user_pk, message):
    """ Отправляет звонок ждем данных принять или нет"""
    channel_layer = channels.layers.get_channel_layer()
    room_group_name = 'notification_user_pk_' + str(user_pk)

    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'send.message',
            'message': message,
            'auto_close': False,
            'typeof': 'call'
        }
    )


def send_notification_chat(user_from, user_to, message):
    """ Отправляет в consumers (по socket) сообщение чата
        Вызывается из сигнала post_save
    """
    channel_layer = channels.layers.get_channel_layer()
    room_group_name = 'notification_user_pk_' + str(user_to.pk)
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'send.message',
            'message': message,
            'typeof': 'chat',
            'user_from': user_from.username,
            'user_from_pk': user_from.pk
        }
    )


@login_required
def get_users(request):
    """ Получить всех юзверей для чата """
    obj = list(User.objects.all().values('id', 'username'))
    data = json.dumps(obj)
    return HttpResponse(data, 'json')


@login_required
def save_chat(request, pk_user_to):
    """  Сохранить сообщение в базу.Отправляется после сохранения сигналом """
    if request.method == 'POST':
        user_from = User.objects.get(pk=request.user.pk)
        user_to = User.objects.get(pk=pk_user_to)
        data = json.loads(request.body)

        UserChat.objects.create(user_from=user_from, user_to=user_to, message=data['message'])
        return HttpResponse(status=201)


@login_required
def get_chat(request, pk_user_from, pk_user_to):
    """ Получает последние N сообщений с чата меж двумя юзверями"""
    user_from = User.objects.get(pk=pk_user_from)
    user_to = User.objects.get(pk=pk_user_to)
    obj = UserChat.objects.filter(Q(user_from=user_from, user_to=user_to) | Q(user_from=user_to, user_to=user_from))
    obj = obj.order_by('-date_create')[:10]
    data = serializers.serialize('json', obj)
    return HttpResponse(data, 'json')
