import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer


class NotificationConsumer(WebsocketConsumer):
    """ Консьюмер для всего принмает уведомления звонков, простые от сервера,chat
    имя комнаты берется по id юзера
    ждет ответа только от звонка (взять или нет)
    """
    def connect(self):
        if self.scope["user"].is_anonymous:
            self.close()
        else:
            self.room_group_name = 'notification_user_pk_' + str(self.scope["user"].pk)
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            self.accept()

    def disconnect(self, close_code):
        if self.scope["user"].is_anonymous:
            self.close()
        else:
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name
            )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print(message)

    # Receive message from room group
    def send_message(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'status': event.get('status', None),
            'auto_close': event.get('auto_close', True),
            'typeof': event['typeof'],
            'id': event.get('id', None),  # id операции или элемента (не юзверя)
            'user_from': event.get('user_from', None),
            'user_from_pk': event.get('user_from_pk', None)
        }))
