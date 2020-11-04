from django.db import models
from django.contrib.auth.models import User
from phone_field import PhoneField
from app.models import Source, StageAppeal


class Appeal(models.Model):
    """
    Модель для обращений
    """
    operator_ono = models.OneToOneField(User, on_delete=models.PROTECT, verbose_name='ответственный сотрудник КЦ',
                                        related_name='operator')
    temp_operator_ono = models.OneToOneField(User, on_delete=models.SET_NULL, verbose_name='временный ответственный',
                                             related_name='temp_operator', null=True)
    date_create = models.DateTimeField(verbose_name='дата создания', auto_now_add=True)
    date_modify = models.DateTimeField(verbose_name='дата изменения', auto_now=True)
    client = models.CharField(max_length=50, verbose_name='клиент', null=True, blank=True)
    phone = PhoneField(blank=True, help_text='номер клиента')
    phone2 = PhoneField(blank=True, help_text='номер клиента')
    comment_client = models.CharField(max_length=50, verbose_name='комментарий клиента', null=True, blank=True)
    source_ono = models.OneToOneField(Source, models.DO_NOTHING, null=True)
    stage_ono = models.OneToOneField(StageAppeal, models.DO_NOTHING)  # TODO по умолчанию первый из таблицы
    date_step = models.DateTimeField(verbose_name='дата шага', null=True, blank=True)

    # def __str__(self):
    #     return "%s" % (self.)

    class Meta:
        verbose_name = 'обращение'
        verbose_name_plural = 'обращения'
        ordering = ['-date_create']


class LogAppeal(models.Model):
    deal_fk = models.ForeignKey(Appeal, models.CASCADE)
    date_create = models.DateTimeField(verbose_name='дата создания', auto_now_add=True)
    message = models.CharField(max_length=1500, verbose_name='сообщение')

    class Meta:
        verbose_name = 'Лог обращения'
        verbose_name_plural = 'Логи обращений'
        ordering = ['-date_create']
