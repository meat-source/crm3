from django.contrib import admin
from .models import Bind_sip_user


class Bind_sip_userAdmin(admin.ModelAdmin):
    actions = None
    list_display = ['operator_fk', 'zadarma']


admin.site.register(Bind_sip_user, Bind_sip_userAdmin)
