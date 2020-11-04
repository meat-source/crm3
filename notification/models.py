from django.db import models
from django.contrib.auth.models import User


class UserChat(models.Model):
    user_from = models.ForeignKey(User, models.CASCADE, related_name='related_user_from')
    user_to = models.ForeignKey(User, models.CASCADE, related_name='related_user_to')
    message = models.CharField(max_length=1500)
    date_create = models.DateTimeField(verbose_name='дата создания', auto_now_add=True)
