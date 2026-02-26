import app as app_module


def _login(client, user_id=1, username="alice"):
    with client.session_transaction() as session_data:
        session_data["user_id"] = user_id
        session_data["username"] = username


def test_group_edit_name_change_logs_system_message(monkeypatch):
    state = {"updates": [], "messages": []}

    def fake_query_db(query, args=(), one=False):
        normalized = " ".join(query.split())

        if normalized.startswith("SELECT * FROM groups WHERE id = ?"):
            return {"id": 5, "name": "Old Group", "owner_id": 1, "profile_pic": None}

        if normalized.startswith("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"):
            return {"id": 100}

        if normalized.startswith("SELECT id FROM users WHERE id = 0"):
            return {"id": 0}

        if normalized.startswith("UPDATE groups SET name = ? WHERE id = ?"):
            state["updates"].append(args)
            return 1

        if normalized.startswith("INSERT INTO group_messages"):
            state["messages"].append(args)
            return 1

        raise AssertionError(f"Unexpected query: {query}")

    monkeypatch.setattr(app_module, "query_db", fake_query_db)

    client = app_module.app.test_client()
    _login(client, user_id=1, username="alice")

    response = client.post("/groups/5/edit", data={"name": "New Group"}, follow_redirects=False)

    assert response.status_code == 302
    assert state["updates"] == [("New Group", 5)]
    assert len(state["messages"]) == 1
    group_id, sender_id, content = state["messages"][0]
    assert group_id == 5
    assert sender_id == 0
    assert "changed the group name" in content


def test_group_edit_requires_membership(monkeypatch):
    def fake_query_db(query, args=(), one=False):
        normalized = " ".join(query.split())

        if normalized.startswith("SELECT * FROM groups WHERE id = ?"):
            return {"id": 9, "name": "Team", "owner_id": 2, "profile_pic": None}

        if normalized.startswith("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"):
            return None

        raise AssertionError(f"Unexpected query: {query}")

    monkeypatch.setattr(app_module, "query_db", fake_query_db)

    client = app_module.app.test_client()
    _login(client, user_id=1, username="alice")

    response = client.post("/groups/9/edit", data={"name": "Should Fail"}, follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["Location"].endswith("/messages")
