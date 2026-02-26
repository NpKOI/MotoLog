# Database Migrations

All one-off SQLite migration scripts are organized here.

## Run a migration
From the project root:

- `python scripts/migrations/migrate_db.py`
- `python scripts/migrations/migrate_add_ride_columns.py`
- `python scripts/migrations/migrate_add_ride_photos.py`
- `python scripts/migrations/migrate_add_groups.py`
- `python scripts/migrations/migrate_fix_groups.py`
- `python scripts/migrations/migrate_add_last_read.py`
- `python scripts/migrations/migrate_add_events.py`
- `python scripts/migrations/migrate_add_events_local.py`
- `python scripts/migrations/migrate_events_optional_coords.py`
- `python scripts/migrations/migrate_make_coords_nullable.py`
- `python scripts/migrations/migrate_add_city_notifications.py`
- `python scripts/migrations/migrate_add_additional_photos.py`

## Notes
- Run migrations against your current `moto_log.db` in the workspace root.
- Keep new migration scripts in this folder.
