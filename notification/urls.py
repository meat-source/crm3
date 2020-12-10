from django.urls import path
from django.views.generic import TemplateView
from . import views
from django.conf import settings

urlpatterns = [
    path('get_users/', views.get_users, name='notification_get_users'),
    path('save_chat/<pk_user_to>', views.save_chat, name='notification_save_chat'),
    path('get_chat/<pk_user_from>/<pk_user_to>/', views.get_chat, name='notification_get_chat'),

]

# For Example
try:
    if settings.NOTIFICATION_EXAMPLE:
        from .example import example_send_notification, example_send_chat, example_call

        examplepatterns = [
            path('example_send_notification/', example_send_notification),
            path('example_send_chat/', example_send_chat),
            path('example_call', example_call),
            path("example/", TemplateView.as_view(template_name="notification_example.html")),
        ]
        urlpatterns = urlpatterns + examplepatterns
except AttributeError:
    pass
