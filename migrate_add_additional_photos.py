import sqlite3

def migrate_add_additional_photos():
    conn = sqlite3.connect('moto_log.db')
    c = conn.cursor()
    try:
        c.execute('ALTER TABLE bikes ADD COLUMN additional_photos TEXT')
        print('Column additional_photos added to bikes table.')
    except sqlite3.OperationalError as e:
        if 'duplicate column name' in str(e):
            print('Column additional_photos already exists.')
        else:
            raise
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate_add_additional_photos()
