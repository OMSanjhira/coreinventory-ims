import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/api/v1/auth/login',
    data=b'{"email":"admin@freshflow.com","password":"Admin@123"}',
    headers={'Content-Type':'application/json'}
)
res = json.loads(urllib.request.urlopen(req).read())
token = res['data']['access_token']

req2 = urllib.request.Request(
    'http://localhost:8000/api/v1/dashboard/stats',
    headers={'Authorization': f'Bearer {token}'}
)
response = urllib.request.urlopen(req2).read().decode()
j = json.loads(response)
print(json.dumps(j, indent=2))
