import sqlite3

"""
Make `latitude` and `longitude` columns in `events` nullable.

This migration will:
 - create a new temporary table `events_new` with the same columns but
   without NOT NULL on latitude/longitude
 - copy all data from `events` into `events_new`
 - replace the old table

Run: python scripts/migrations/migrate_make_coords_nullable.py
"""

def migrate():
    conn = sqlite3.connect('moto_log.db')
    c = conn.cursor()
    try:
        c.execute('PRAGMA foreign_keys = OFF')
        c.execute('BEGIN TRANSACTION')

        # Inspect existing columns
        c.execute("PRAGMA table_info(events)")
        cols = c.fetchall()
        if not cols:
            print('No events table found; nothing to do.')
            return

        col_names = [r[1] for r in cols]

        # Build new table definition: relax NOT NULL for latitude/longitude
        defs = []
        for r in cols:
            name = r[1]
            ctype = r[2] or 'TEXT'
            notnull = bool(r[3])
            pk = bool(r[5])
            part = f"{name} {ctype}"
            if pk:
                part += ' PRIMARY KEY'
                if ctype.upper() == 'INTEGER':
                    part += ' AUTOINCREMENT'
            # remove NOT NULL for latitude/longitude
            if not (name in ('latitude', 'longitude')) and notnull:
                part += ' NOT NULL'
            if r[4] is not None:
                part += f" DEFAULT {r[4]}"
            defs.append(part)

        # Try to preserve creator FK if present
        if 'creator_id' in col_names:
            defs.append('FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE CASCADE')

        create_sql = 'CREATE TABLE events_new ( ' + ', '.join(defs) + ' )'
        c.execute(create_sql)

        # Copy data over (use explicit column list)
        cols_csv = ', '.join(col_names)
        c.execute(f'INSERT INTO events_new ({cols_csv}) SELECT {cols_csv} FROM events')

        c.execute('DROP TABLE events')
        c.execute('ALTER TABLE events_new RENAME TO events')

        c.execute('COMMIT')
        c.execute('PRAGMA foreign_keys = ON')
        conn.commit()
        print('✅ Migration completed: latitude/longitude are now nullable.')
    except Exception as e:
        conn.rollback()
        print('❌ Migration failed:', e)
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
