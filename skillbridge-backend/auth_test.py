import json
import traceback
import urllib.request
import urllib.error

base = 'http://localhost:5000'

def safe_request(req):
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            return resp.status, body
    except urllib.error.HTTPError as he:
        body = he.read().decode()
        print(f'HTTP ERROR {he.code}')
        print(body)
        return he.code, body
    except Exception as e:
        print('REQUEST ERROR:', e)
        traceback.print_exc()
        return None, None

print('Health:')
status, body = safe_request(urllib.request.Request(f'{base}/'))
print(status)
print(body)

print('\nLogin:')
login_data = None
try:
    data = json.dumps({'email': 'admin@skillbridge.test', 'password': 'Password123!'}).encode('utf-8')
    req = urllib.request.Request(f'{base}/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
    status, body = safe_request(req)
    print(status)
    print(body)
    if status == 200:
        login_data = json.loads(body)
except Exception as e:
    print('Login exception:')
    traceback.print_exc()

print('\nMe:')
if not login_data or 'token' not in login_data:
    print('NO TOKEN RECEIVED')
else:
    token = login_data['token']
    req = urllib.request.Request(f'{base}/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    status, body = safe_request(req)
    print(status)
    print(body)
