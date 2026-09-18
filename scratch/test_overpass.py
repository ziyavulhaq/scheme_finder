import urllib.request
import urllib.parse
import json

query = """
[out:json][timeout:20];
node["amenity"="bank"](around:10000, 11.01515, 76.976618);
out body 30;
"""

url = 'https://overpass-api.de/api/interpreter'
data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'User-Agent': 'SahayaSetu-SIH26092/1.0'})

try:
    with urllib.request.urlopen(req, timeout=25) as resp:
        res = json.loads(resp.read().decode())
        elements = res.get('elements', [])
        print(f'Found {len(elements)} banks around Coimbatore')
        for el in elements[:10]:
            name = el.get('tags', {}).get('name', 'Unnamed')
            print(f"- {name} ({el.get('lat')}, {el.get('lon')})")
except Exception as e:
    print('Overpass error:', e)
