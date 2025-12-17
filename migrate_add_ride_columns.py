#!/usr/bin/env python3
"""
Migration: Add missing columns to rides table (title, description, public, avg_speed)
"""

import sqlite3
import os

DB_PATH = 'moto_log.db'

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database {DB_PATH} not found")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute('PRAGMA foreign_keys = ON')
    cur = conn.cursor()
    
    columns_to_add = {
        'title': 'TEXT DEFAULT "My Ride"',
        'description': 'TEXT DEFAULT ""',
        'public': 'INTEGER DEFAULT 0',
        'avg_speed': 'REAL DEFAULT 0',
        'top_speed': 'REAL DEFAULT 0'
    }
    
    for col_name, col_def in columns_to_add.items():
        try:
            cur.execute(f'ALTER TABLE rides ADD COLUMN {col_name} {col_def}')
            print(f'✅ Added column "{col_name}" to rides table')
        except sqlite3.OperationalError as e:
            if 'duplicate column' in str(e).lower():
                print(f'⏭️  Column "{col_name}" already exists')
            else:
                print(f'❌ Error adding column "{col_name}": {e}')
    
    conn.commit()
    conn.close()
    print('✅ Migration complete!')
    return True

if __name__ == '__main__':
    migrate()
