from django.contrib import admin
from .models import *


class StageAppealAdmin(admin.ModelAdmin):
    list_display = ['stage']


class StageDealAdmin(admin.ModelAdmin):
    list_display = ['stage']


class SourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone']


class UserAdvancedAdmin(admin.ModelAdmin):
    list_display = ['user_ono']


admin.site.register(StageAppeal, StageAppealAdmin)
admin.site.register(StageDeal, StageDealAdmin)
admin.site.register(Source, SourceAdmin)
admin.site.register(UserAdvanced, UserAdvancedAdmin)
