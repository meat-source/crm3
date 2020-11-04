from django.db import models
from django.contrib.auth.models import User


class Bind_sip_user(models.Model):
    operator_fk = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='оператор')
    zadarma = models.CharField(max_length=100, verbose_name='Внутрений номер АТС (zadarma)')

    class Meta:
        verbose_name = 'Связь юзера voip и юзера crm'
        verbose_name_plural = 'Связь юзера voip и юзера crm'
