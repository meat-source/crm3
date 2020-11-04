from django.db.models.signals import post_save
from django.dispatch import receiver
from notification.models import UserChat
from notification.views import send_notification_chat


@receiver(post_save, sender=UserChat)
def notification_after_save_chat(sender, instance, **kwargs):
    send_notification_chat(instance.user_from, instance.user_to, instance.message)
