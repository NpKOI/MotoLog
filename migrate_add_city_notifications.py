#!/usr/bin/env python3
"""
Migration: Add city column to users table and create notifications table.

Run: python migrate_add_city_notifications.py
"""

import sqlite3

def migrate():
    conn = sqlite3.connect('moto_log.db')
    c = conn.cursor()
    try:
        c.execute('PRAGMA foreign_keys = OFF')

        # 1. Add city column to users if it doesn't exist
        c.execute("PRAGMA table_info(users)")
        cols = [row[1] for row in c.fetchall()]
        if 'city' not in cols:
            c.execute("ALTER TABLE users ADD COLUMN city TEXT")
            print("✅ Added city column to users table")
        else:
            print("ℹ️ city column already exists in users table")

        # 2. Create notifications table
        c.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                actor_id INTEGER,
                event_id INTEGER,
                message TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        ''')
        print("✅ Created notifications table")

        c.execute('PRAGMA foreign_keys = ON')
        conn.commit()
        print("✅ Migration completed successfully!")
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
