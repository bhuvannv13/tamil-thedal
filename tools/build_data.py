"""Build docs/data/texts.json from public-domain sources.

Sources
  * Thirukkural Tamil text, G. U. Pope's 1886 English verse and prose translations, chapter
    names and transliteration: github.com/tk120404/thirukkural (Apache-2.0), pinned commit.
    Modern commentaries in that repository (still under copyright) are deliberately not used.
  * Avvaiyar's Aathichudi with Tamil meanings, and Bharathiyar's Puthiya Aathichudi:
    Tamil Wikisource (text CC BY-SA 4.0), saved in tools/wikisource_raw.json.

Run:  python tools/build_data.py   (add --offline DIR to read thirukkural JSON from a local folder)
"""
import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "data" / "texts.json"
KURAL_COMMIT = "cf3ff6c5a73c23b4092913156830457caab65fd4"
KURAL_BASE = f"https://raw.githubusercontent.com/tk120404/thirukkural/{KURAL_COMMIT}/"

THEMES = {
    "spirituality": ["ஆன்மிகம்", "Spirituality and God"],
    "nature": ["இயற்கை", "Nature, rain and land"],
    "virtue": ["அறம்", "Virtue and ethics"],
    "family": ["குடும்பம்", "Family and home"],
    "kindness": ["அன்பு", "Love, kindness and gratitude"],
    "giving": ["ஈகை", "Giving and hospitality"],
    "speech": ["சொல்", "Speech"],
    "self_control": ["ஒழுக்கம்", "Self-control and conduct"],
    "knowledge": ["கல்வி", "Learning and knowledge"],
    "friendship": ["நட்பு", "Friendship"],
    "enmity": ["பகை", "Enmity and conflict"],
    "leadership": ["ஆட்சி", "Leadership and governance"],
    "effort": ["முயற்சி", "Effort, work and wealth"],
    "courage": ["வீரம்", "Courage"],
    "health": ["உடல்நலம்", "Health and food"],
    "fame": ["புகழ்", "Renown"],
    "romance": ["காதல்", "Romantic love"],
}

# Thirukkural chapter (adhikaram) number -> themes. Chapters 109-133 (Inbam) are all romance.
CHAPTER_THEMES = {
    "spirituality": [1, 3, 27, 34, 35, 36, 37, 38], "nature": [2, 74, 104],
    "virtue": [4, 12, 21, 22, 28, 29, 30, 32, 33, 96, 97, 98, 99, 102, 108],
    "family": [5, 6, 7, 103], "kindness": [8, 11, 25, 26, 58], "giving": [9, 23, 101],
    "speech": [10, 19, 20, 65, 100], "self_control": [13, 14, 15, 16, 17, 18, 31, 91, 92, 93, 94],
    "knowledge": [40, 41, 42, 43, 44, 84, 85], "friendship": [45, 46, 79, 80, 81, 82, 83, 90],
    "enmity": [86, 87, 88, 89],
    "leadership": [39, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 64, 66, 67, 68, 69, 70, 71, 72, 73, 75],
    "effort": [60, 61, 62, 63, 76, 104, 105, 106, 107], "courage": [77, 78], "health": [95], "fame": [24],
    "romance": list(range(109, 134)),
}

# Keyword rules for the short Avvaiyar and Bharathiyar lines (Tamil stems, checked against line + meaning).
KEYWORD_THEMES = [
    ("knowledge", ["கல்", "கற்", "நூல்", "ஓது", "வித்தை", "எண் எழுத்து", "கேள்வி", "சரித்திர", "பகுத்து", "அறிவு"]),
    ("speech", ["பேச", "சொல்", "உரை", "மொழி", "வாது", "கூறேல்"]),
    ("friendship", ["நட்பு", "இணங்", "சேர்", "பழகு", "பிரியேல்", "இனத்து", "துணை"]),
    ("family", ["தந்தை", "தாய்", "மனைவி", "தையல்", "வீடு எடே", "நல்லாள்"]),
    ("giving", ["ஈவது", "ஈகை", "ஐயம்", "தானம்", "இயல்வது கரவேல்"]),
    ("spirituality", ["தெய்வம்", "திருமால்", "வீடு பெற", "தவ", "மந்திரம்", "மோனம்", "வேதம்"]),
    ("courage", ["அச்ச", "அஞ்சே", "போர்", "வீர", "சீறு", "சூர", "ரௌத்திர", "நிமிர்ந்து", "துணிந்து", "கலங்கே", "சௌரிய", "முனை"]),
    ("health", ["உண்", "ஊண்", "நோய்", "உடல", "ஔடத", "மீதூண்", "துயில்", "யௌவன", "மூப்பி"]),
    ("nature", ["பயிர்", "பூமி", "மேழி", "நெற்", "ஞாயிறு", "நீர் விளை", "அரவம்", "பாம்"]),
    ("effort", ["தொழில்", "வினை", "முயற்சி", "சோம்ப", "பணத்", "பொருள்", "ஊக்கம", "ஓய்த", "சுமை"]),
    ("self_control", ["சினம்", "கோப", "சூது", "கொள்ளை", "பொய்", "வஞ்சக", "ஒழுகு", "மனம் தடுமா"]),
    ("kindness", ["நன்றி", "அன்பு", "இரக்க"]),
]

VOWELS = {"அ": "a", "ஆ": "ā", "இ": "i", "ஈ": "ī", "உ": "u", "ஊ": "ū", "எ": "e", "ஏ": "ē", "ஐ": "ai", "ஒ": "o", "ஓ": "ō", "ஔ": "au"}
SIGNS = {"ா": "ā", "ி": "i", "ீ": "ī", "ு": "u", "ூ": "ū", "ெ": "e", "ே": "ē", "ை": "ai", "ொ": "o", "ோ": "ō", "ௌ": "au", "்": ""}
CONSONANTS = {"க": "k", "ங": "ṅ", "ச": "c", "ஞ": "ñ", "ட": "ṭ", "ண": "ṇ", "த": "t", "ந": "n", "ப": "p", "ம": "m",
              "ய": "y", "ர": "r", "ல": "l", "வ": "v", "ழ": "ḻ", "ள": "ḷ", "ற": "ṟ", "ன": "ṉ",
              "ஜ": "j", "ஷ": "ṣ", "ஸ": "s", "ஹ": "h"}


def transliterate(text):
    """ISO 15919-style romanisation of Tamil script (good enough for search and reading aloud)."""
    out, i = [], 0
    while i < len(text):
        ch = text[i]
        if ch in CONSONANTS:
            nxt = text[i + 1] if i + 1 < len(text) else ""
            if nxt in SIGNS:
                out.append(CONSONANTS[ch] + SIGNS[nxt])
                i += 2
                continue
            out.append(CONSONANTS[ch] + "a")
        elif ch in VOWELS:
            out.append(VOWELS[ch])
        elif ch == "ஃ":
            out.append("ḵ")
        elif ch == "•":
            out.append(".")
        else:
            out.append(ch)
        i += 1
    return "".join(out)


def keyword_themes(*texts):
    joined = " ".join(texts)
    found = [theme for theme, words in KEYWORD_THEMES if any(w in joined for w in words)]
    return found or ["virtue"]


def fetch_json(name, offline_dir=None):
    if offline_dir:
        return json.loads((Path(offline_dir) / name).read_text(encoding="utf-8"))
    with urllib.request.urlopen(KURAL_BASE + name, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def build_kural(offline_dir=None):
    kurals = fetch_json("thirukkural.json", offline_dir)["kural"]
    detail = fetch_json("detail.json", offline_dir)[0]
    chapter_of, theme_of = {}, {}
    for theme, numbers in CHAPTER_THEMES.items():
        for n in numbers:
            theme_of.setdefault(n, []).append(theme)
    for paal in detail["section"]["detail"]:
        for iyal in paal["chapterGroup"]["detail"]:
            for ch in iyal["chapters"]["detail"]:
                for number in range(ch["start"], ch["end"] + 1):
                    chapter_of[number] = (paal, iyal, ch)
    items = []
    for k in kurals:
        paal, iyal, ch = chapter_of[k["Number"]]
        items.append({
            "id": f"kural-{k['Number']}", "work": "kural", "num": k["Number"],
            "lines": [k["Line1"].strip(), k["Line2"].strip()],
            "translit": f"{k['transliteration1'].strip()} / {k['transliteration2'].strip()}",
            "en": re.sub(r"([a-z,;])([A-Z])", r"\1 / \2", k["couplet"].strip()), "en_prose": k["explanation"].strip(),
            "category": paal["number"], "section": iyal["number"], "chapter": ch["number"],
            "themes": theme_of.get(ch["number"], ["virtue"]),
        })
    structure = [{
        "number": p["number"], "ta": p["name"], "en": p["translation"],
        "sections": [{
            "number": s["number"], "ta": s["name"], "en": s["translation"],
            "chapters": [{"number": c["number"], "ta": c["name"], "en": c["translation"],
                          "translit": c["transliteration"], "start": c["start"], "end": c["end"]}
                         for c in s["chapters"]["detail"]],
        } for s in p["chapterGroup"]["detail"]],
    } for p in detail["section"]["detail"]]
    return items, structure


def build_wikisource():
    raw = json.loads((ROOT / "tools" / "wikisource_raw.json").read_text(encoding="utf-8"))
    items = []
    for number, line, group, meaning in raw["avvai"]:
        line = line.strip().rstrip("<").strip()
        items.append({
            "id": f"aathichudi-{number}", "work": "aathichudi", "num": number, "lines": [line],
            "translit": transliterate(line), "meaning_ta": meaning.strip(), "group": group,
            "themes": keyword_themes(line, meaning),
        })
    for number, line in enumerate(raw["bharathi"], start=1):
        line = line.replace("•", ".").strip()
        items.append({
            "id": f"puthiya-{number}", "work": "puthiya", "num": number, "lines": [line],
            "translit": transliterate(line), "themes": keyword_themes(line),
        })
    return items


WORKS = {
    "kural": {"ta": "திருக்குறள்", "en": "Thirukkural", "author": "valluvar",
              "period": "c. 1st century BCE – 5th century CE (dates debated)",
              "category_en": "Ethics and life (Patinenkilkanakku)", "licence": "Public domain text; Pope translation (1886) public domain"},
    "aathichudi": {"ta": "ஆத்திசூடி", "en": "Aathichudi", "author": "avvai",
                   "period": "c. 12th century CE", "category_en": "Ethical maxims for children",
                   "licence": "Public domain text; Tamil meanings from Tamil Wikisource, CC BY-SA 4.0"},
    "puthiya": {"ta": "புதிய ஆத்திசூடி", "en": "Puthiya Aathichudi", "author": "bharathi",
                "period": "early 20th century", "category_en": "Modern maxims",
                "licence": "Public domain (Bharathiyar's works were nationalised in 1949); text from Tamil Wikisource"},
}
AUTHORS = {
    "valluvar": {"ta": "திருவள்ளுவர்", "en": "Thiruvalluvar"},
    "avvai": {"ta": "ஔவையார்", "en": "Avvaiyar"},
    "bharathi": {"ta": "பாரதியார்", "en": "Subramania Bharati"},
}


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", help="folder containing thirukkural.json and detail.json")
    args = parser.parse_args(argv)
    kural, structure = build_kural(args.offline)
    items = kural + build_wikisource()
    payload = {"works": WORKS, "authors": AUTHORS, "themes": THEMES, "kural_structure": structure, "items": items}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(items)} verses to {OUT}")
    return payload


if __name__ == "__main__":
    sys.exit(0 if main() else 1)
