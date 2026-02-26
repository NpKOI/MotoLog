import app as app_module


def test_allowed_file_validation():
    assert app_module.allowed_file("photo.jpg")
    assert app_module.allowed_file("cover.avif")
    assert not app_module.allowed_file("notes.txt")
    assert not app_module.allowed_file("no_extension")


def test_core_routes_registered():
    routes = {rule.rule for rule in app_module.app.url_map.iter_rules()}
    assert "/login" in routes
    assert "/dashboard" in routes
    assert "/track_ride" in routes


def test_get_system_sender_id_returns_existing(monkeypatch):
    def fake_query_db(query, args=(), one=False):
        normalized = " ".join(query.split())
        if normalized.startswith("SELECT id FROM users WHERE id = 0"):
            return {"id": 0} if one else [{"id": 0}]
        raise AssertionError(f"Unexpected query: {query}")

    monkeypatch.setattr(app_module, "query_db", fake_query_db)

    assert app_module.get_system_sender_id(fallback_user_id=123) == 0


def test_get_system_sender_id_falls_back(monkeypatch):
    state = {"select_calls": 0}

    def fake_query_db(query, args=(), one=False):
        normalized = " ".join(query.split())
        if normalized.startswith("SELECT id FROM users WHERE id = 0"):
            state["select_calls"] += 1
            return None if one else []
        if normalized.startswith("INSERT OR IGNORE INTO users"):
            raise Exception("insert failed")
        return None

    monkeypatch.setattr(app_module, "query_db", fake_query_db)

    assert app_module.get_system_sender_id(fallback_user_id=7) == 7
    assert state["select_calls"] == 2
