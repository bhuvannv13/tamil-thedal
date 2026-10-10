import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import build_data  # noqa: E402

OFFLINE = os.environ.get("KURAL_OFFLINE_DIR")  # optional local copy of the source JSON


def payload():
    if not hasattr(payload, "cache"):
        payload.cache = build_data.main(["--offline", OFFLINE] if OFFLINE else [])
    return payload.cache


def test_transliteration():
    assert build_data.transliterate("அறம்") == "aṟam"
    assert build_data.transliterate("கல்வி") == "kalvi"
    assert build_data.transliterate("ஔவை") == "auvai"


def test_counts():
    items = payload()["items"]
    assert sum(i["work"] == "kural" for i in items) == 1330
    assert sum(i["work"] == "aathichudi" for i in items) == 109
    assert sum(i["work"] == "puthiya" for i in items) == 110


def test_only_public_domain_fields_from_kural_source():
    allowed = {"id", "work", "num", "lines", "translit", "en", "en_prose", "category", "section", "chapter", "themes"}
    for item in payload()["items"]:
        if item["work"] == "kural":
            assert set(item) == allowed  # modern commentaries (mv, sp, mk) must never be included


def test_every_chapter_has_a_theme_and_themes_are_known():
    themes = set(build_data.THEMES)
    chapters = {n for numbers in build_data.CHAPTER_THEMES.values() for n in numbers}
    assert chapters == set(range(1, 134))
    for item in payload()["items"]:
        assert item["themes"] and set(item["themes"]) <= themes


def test_first_kural():
    first = payload()["items"][0]
    assert first["lines"][0].startswith("அகர முதல")
    assert first["chapter"] == 1 and first["category"] == 1
    assert "first of letters" in first["en"]
