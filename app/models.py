from django.db import models
from django.contrib.auth.models import User
from phone_field import PhoneField


class StageAppeal(models.Model):
    """ Этапы воронки обращений"""
    stage = models.CharField(max_length=20, verbose_name='этап обращения')

    class Meta:
        verbose_name = 'Этап воронки обращений'
        verbose_name_plural = 'Этапы воронки обращений'


class StageDeal(models.Model):
    """ Этапы воронки сделок"""
    stage = models.CharField(max_length=20, verbose_name='этап сделки')

    class Meta:
        verbose_name = 'Этап воронки сделок'
        verbose_name_plural = 'Этапы воронки сделок'


class Source(models.Model):
    """Источники прихода"""
    name = models.CharField(max_length=100, verbose_name='источник')
    phone = PhoneField(blank=True, help_text='привязанный номер')

    class Meta:
        verbose_name = 'Источник'
        verbose_name_plural = 'Источники'


class UserAdvanced(models.Model):
    """Расширенная модель пользователя"""
    user_ono = models.OneToOneField(User, models.CASCADE)
    status_work = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Расширенная модель пользователя'
        verbose_name_plural = 'Расширенная модель пользователя'
