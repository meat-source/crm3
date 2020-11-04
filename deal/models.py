from django.db import models
from django.contrib.auth.models import User
from appeal.models import Appeal


class Deal(models.Model):
    """
    Модель для сделок
    """
    appeal_ono = models.OneToOneField(to=Appeal, on_delete=models.PROTECT, verbose_name='обращение')
    lawyer = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='юрист первичного приема',
                               related_name='lawyer')
    performer = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='исполнитель', blank=True, null=True,
                                  related_name='performer')
    files = models.FileField(verbose_name='файлы', blank=True, null=True)
    images = models.ImageField(upload_to='link_image/%Y/%m/%d/', verbose_name="изображения", blank=True, null=True)
    # file_field = forms.FileField(widget=forms.ClearableFileInput(attrs={'multiple': True}))
    price = models.PositiveIntegerField(verbose_name='сумма к оплате')
    paid = models.CharField('оплачено', max_length=400)
    date_create = models.DateTimeField(verbose_name='дата создания', auto_now_add=True)
    date_modify = models.DateTimeField(verbose_name='дата изменения', auto_now=True)

    def save(self, *args, **kwargs):
        if self.url:
            self.url = self.url.replace(' ', '-')

        super(Deal, self).save(*args, **kwargs)

    # def __str__(self):
    #     return "%s" % (self.url)

    class Meta:
        verbose_name = 'Сделка'
        verbose_name_plural = 'Сделки'
        ordering = ['-date_modify']


class LogDeal(models.Model):
    deal_fk = models.ForeignKey(Deal, models.CASCADE)
    date_create = models.DateTimeField(verbose_name='дата создания', auto_now_add=True)
    message = models.CharField(max_length=1500, verbose_name='сообщение')

    class Meta:
        verbose_name = 'Лог сделки'
        verbose_name_plural = 'Логи сделок'
        ordering = ['-date_create']
