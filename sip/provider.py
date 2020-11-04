from django.http import HttpResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from braces.views import CsrfExemptMixin
from django.contrib import messages


class WebhookZadarma(CsrfExemptMixin, View):

    # def get(self, request, *args, **kwargs):
    #     return HttpResponse('Hello, World!')

    def post(self, request, *args, **kwargs):
        # print(kwargs)
        # print(args)
        # print(request.GET)
        event = request.POST.get('event')  # событие
        call_start = request.POST.get('call_start')  # время начала звонка;
        pbx_call_id = request.POST.get('pbx_call_id')  # id звонка в zadarma
        caller_id = request.POST.get('caller_id')  # номер звонящего
        called_did = request.POST.get('called_did')  # номер, на который позвонили
        internal = request.POST.get('internal')  # (опциональный) внутренний номер

        # начало входящего звонка на внутренний номер АТС.
        if event == 'NOTIFY_INTERNAL':
            pass

        messages.add_message(request, messages.INFO, 'Hello world.')
        return HttpResponse('201', status=201)


class Zadarma:
    def webhook_start_call(self):
        pass

    def webhook_end_call(self):
        pass


@csrf_exempt
def zadarma2(request):
    print(request.POST)
    return HttpResponse(status=201)
