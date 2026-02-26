# MotoLogv2 Project Structure

## Organized folders

- `docs/`
  - `GPX_PROCESSING_README.md`
  - `PROJECT_STRUCTURE.md`
- `samples/gpx/`
  - `gpx file with high speeds and good accuracy.gpx`
  - `gpx with high speed.gpx`
  - `simulated_ride.gpx`
- `tests/`
  - `test_pytest_smoke.py`
  - `test_group_edit.py`
  - `test_sqlite.py`

## Notes

- Runtime-critical files remain in project root (`app.py`, `moto_log.db`, `requirements.txt`, `Procfile`).
- Sample data and docs were moved out of root to reduce clutter.
- `pytest.ini` is configured to discover tests in `tests/`.
