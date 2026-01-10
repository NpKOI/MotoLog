import sqlite3

conn = sqlite3.connect('moto_log.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('SELECT latitude, longitude, speed, timestamp FROM gps_points LIMIT 1')
row = cur.fetchone()
conn.close()

print('Type of row:', type(row))
print('isinstance(row, dict):', isinstance(row, dict))
print('hasattr(row, "keys"):', hasattr(row, 'keys'))
print('row.keys():', list(row.keys()) if hasattr(row, 'keys') else 'No keys method')
print('row.get:', hasattr(row, 'get'))

# Test the .get() call
try:
    result = row.get('latitude')
    print('row.get() works:', result)
except AttributeError as e:
    print('row.get() fails:', e)