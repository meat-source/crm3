from django.apps import AppConfig


class NotificationConfig(AppConfig):

    name = 'notification'
    verbose_name = 'уведомления'

    def ready(self):
        import notification.signals
