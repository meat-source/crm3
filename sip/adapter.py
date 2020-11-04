#!/usr/bin/python3

KEY = 'a713eb1b9da3e55fbf04'
SECRET = '08bbe9a73f9f31605e1b'

from zadarma import api




# /v1/request/callback/

def rrr():
    z_api = api.ZadarmaAPI(key=KEY, secret=SECRET)
    # get tariff information
    # z_api.call('/v1/tariff/')
    # звонок
    z_api.call('/v1/request/callback/', {'from': '100', 'to': '89858530977'}, 'GET')
    # get information about coast
    # z_api.call('/v1/info/price/', {'number': '71234567891', 'caller_id': '71234567890'})


rrr()