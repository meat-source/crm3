from django.urls import path
from django.views.generic import TemplateView
from . import views
from django.conf import settings

urlpatterns = [
    path('get_users/', views.get_users, name='notification_get_users'),
    path('save_chat/<pk_user_to>', views.save_chat, name='notification_save_chat'),
    path('get_chat/<pk_user_from>/<pk_user_to>/', views.get_chat, name='notification_get_chat'),

]

apipatterns = [
    path('api/accept/notification/<pk_user_to>/<status>/<auto_close>/<message>/', views.api_notification),
    path('api/accept/chat/<pk_user_from>/<pk_user_to>/<message>/', views.api_chat),
    path("example", TemplateView.as_view(template_name="notification_example.html")),
]

try:
    if settings.NOTIFICATION_API:
        urlpatterns = urlpatterns + apipatterns
except AttributeError:
    pass
