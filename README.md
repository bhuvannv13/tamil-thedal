# Tamil Thedal (தமிழ் தேடல்)

[![Tests](https://github.com/bhuvannv13/tamil-thedal/actions/workflows/ci.yml/badge.svg)](https://github.com/bhuvannv13/tamil-thedal/actions/workflows/ci.yml)

**Live site: https://bhuvannv13.github.io/tamil-thedal/**

A search engine and study companion for Tamil literature, grammar and history that runs entirely in the browser: no server, no API keys and no running costs.

## Features

- **Verse search** across 1,549 verses: all 1,330 Thirukkural couplets, Avvaiyar's Aathichudi (109 lines) and Bharathiyar's Puthiya Aathichudi (110 lines). Search in Tamil script, English, or romanised Tamil ("kalvi", "natpu"); a sound-alike key means "seya", "ceya" and "cheya" all match.
- **Filters** by work, author, category (Thirukkural's three books) and 17 themes such as friendship, learning, leadership, rain and nature, and romantic love. Results are shareable links.
- **Thirukkural browser** by book, part and chapter with G. U. Pope's 1886 English verse and prose translations.
- **Grammar lessons** (letters, consonant classes, cases, tense, sandhi, prosody, figures of speech, thinai) and a **history timeline**, written for this site.
- **Inscription reader (experimental)** using OpenCV.js: enhances a photo of a stone inscription (CLAHE, adaptive threshold, morphology), boxes letter-like shapes, and compares their Hu-moment shape signatures with Tamil-Brahmi, Grantha and modern Tamil reference letters to suggest the closest script and its approximate era. Modern Tamil text can be read with Tesseract.js OCR. Photos never leave the browser.
- **Thozhan (தோழன்)**, a chat helper that finds verses by theme or number and answers grammar and history questions from the site's own content, using a small TF-IDF retriever written in plain JavaScript.

## How it is built

| Part | Files |
|---|---|
| Data build (ETL) | `tools/build_data.py` downloads the Thirukkural source at a pinned commit, keeps only public-domain fields, joins chapter metadata and themes, and adds the Wikisource texts. A GitHub Actions workflow rebuilds `docs/data/texts.json` when the tools change. |
| Tests | `tests/test_build_data.py` checks counts, transliteration, theme coverage and that modern copyrighted commentaries are never included. |
| Site | `docs/index.html`, `docs/app.js` (search, filters, browser, chat), `docs/inscription.js` (OpenCV.js), `docs/content.js` (lessons and timeline), `docs/chat.js` (shared chat widget). |

```bash
pip install pytest && python -m pytest
python tools/build_data.py
python -m http.server -d docs 8000
```

## Honest limits

- Theme tags are this project's own. Tags on Avvaiyar and Bharathiyar lines are assigned automatically by keyword, so some are imperfect.
- The inscription reader cannot read Tamil-Brahmi, Vatteluttu or Grantha word by word, and cannot date a stone. It compares letter shapes only, and Vatteluttu has no standard font to compare with. For real dating, consult an epigraphist.
- Dates in the timeline are approximate and several are debated.

## Sources and licences

- Thirukkural Tamil text and G. U. Pope's translations (1886): public domain. Taken from [tk120404/thirukkural](https://github.com/tk120404/thirukkural) (Apache-2.0). That repository also contains modern commentaries, which are still under copyright and are **not** used here.
- Aathichudi (Avvaiyar) and Puthiya Aathichudi (Bharathiyar): public-domain texts, transcribed on [Tamil Wikisource](https://ta.wikisource.org/). The Tamil meanings shown for Aathichudi are Wikisource contributors' work under CC BY-SA 4.0.
- OpenCV.js (Apache-2.0) and Tesseract.js (Apache-2.0) are loaded from their public CDNs; fonts are Noto Sans Tamil, Brahmi and Grantha (SIL Open Font License) from Google Fonts.
- Code and original lesson text: MIT licence.

## Author

Bhuvann Vinodh Ram · [Portfolio](https://bhuvannv13.github.io/) · [LinkedIn](https://www.linkedin.com/in/bhuvann-vinodh-ram-5545b3210/)
