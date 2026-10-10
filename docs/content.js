/* Original learning content written for this site (MIT licence, like the code).
   Dates are approximate; scholars disagree on many of them. */
window.LESSONS = [
  { id: "letters", keys: "ezhuthu eluttu alphabet letters uyir mei uyirmei aytham aaytham vowels consonants how many letters 247", ta: "எழுத்து", en: "The Tamil alphabet",
    body: `<p>Tamil has <strong>12 vowels</strong> (உயிர் எழுத்து, "life letters"), <strong>18 consonants</strong> (மெய் எழுத்து, "body letters") and one special letter, the <strong>āytam ஃ</strong>.</p>
<p>Each consonant combines with each vowel to make <strong>216 vowel-consonants</strong> (உயிர்மெய் எழுத்து): for example க் + அ = க, க் + ஆ = கா, க் + இ = கி. Altogether 12 + 18 + 216 + 1 = <strong>247 letters</strong>.</p>
<p>Vowels: அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ. Consonants: க் ங் ச் ஞ் ட் ண் த் ந் ப் ம் ய் ர் ல் வ் ழ் ள் ற் ன்.</p>` },
  { id: "kuril-nedil", keys: "kuril nedil short long vowel maathirai matra length", ta: "குறில், நெடில்", en: "Short and long vowels",
    body: `<p><strong>குறில்</strong> (short) vowels take one beat (மாத்திரை): அ இ உ எ ஒ. <strong>நெடில்</strong> (long) vowels take two beats: ஆ ஈ ஊ ஏ ஐ ஓ ஔ.</p>
<p>The length changes meaning: <em>கல்</em> (kal, stone) and <em>கால்</em> (kāl, leg); <em>விடு</em> (viṭu, leave) and <em>வீடு</em> (vīṭu, house).</p>` },
  { id: "consonant-classes", keys: "vallinam mellinam idaiyinam hard soft medium consonant nasal", ta: "வல்லினம், மெல்லினம், இடையினம்", en: "Hard, soft and medium consonants",
    body: `<p>The 18 consonants fall into three groups of six:</p>
<ul><li><strong>வல்லினம்</strong> (hard): க் ச் ட் த் ப் ற்</li><li><strong>மெல்லினம்</strong> (soft, nasal): ங் ஞ் ண் ந் ம் ன்</li><li><strong>இடையினம்</strong> (medium): ய் ர் ல் வ் ழ் ள்</li></ul>
<p>Each hard consonant has a matching nasal (க–ங, ச–ஞ, ட–ண, த–ந, ப–ம, ற–ன), which is why words like <em>தங்கம்</em>, <em>பஞ்சு</em>, <em>வண்டு</em> pair them.</p>` },
  { id: "five-grammars", keys: "ainthilakkanam five grammar ezhuthu sol porul yaappu ani tholkappiyam nannool", ta: "ஐந்திலக்கணம்", en: "The five parts of Tamil grammar",
    body: `<p>Traditional Tamil grammar has five parts:</p>
<ol><li><strong>எழுத்து</strong>: letters and sounds</li><li><strong>சொல்</strong>: words and their forms</li><li><strong>பொருள்</strong>: subject matter, such as அகம் (inner life, love) and புறம் (public life, war, ethics)</li><li><strong>யாப்பு</strong>: prosody, the rules of verse</li><li><strong>அணி</strong>: figures of speech</li></ol>
<p>The oldest surviving grammar, <strong>தொல்காப்பியம்</strong> (Tolkāppiyam), covers the first three; later works such as <strong>நன்னூல்</strong> (Naṉṉūl, by Pavaṇanti, around the 13th century) became standard school grammars.</p>` },
  { id: "parts-of-speech", keys: "peyarchol vinaichol idaichol urichol noun verb particle adjective parts of speech", ta: "சொல் வகைகள்", en: "Four kinds of words",
    body: `<p>Tamil grammar groups words into four kinds:</p>
<ul><li><strong>பெயர்ச்சொல்</strong> (noun): மரம் (tree), கண்ணன்</li><li><strong>வினைச்சொல்</strong> (verb): ஓடு (run), படி (read)</li><li><strong>இடைச்சொல்</strong> (particle): forms that cannot stand alone, such as -உம் ("and, also") or -ஓ (question)</li><li><strong>உரிச்சொல்</strong> (qualifier): describes a quality, such as சால (very), மா (great)</li></ul>` },
  { id: "tense", keys: "kaalam tense past present future iranthakaalam nigazhkaalam ethirkaalam", ta: "காலம்", en: "Tense",
    body: `<p>Verbs show three tenses through a tense marker between the stem and the personal ending:</p>
<ul><li><strong>இறந்தகாலம்</strong> (past): படித்தேன், "I read"</li><li><strong>நிகழ்காலம்</strong> (present): படிக்கிறேன், "I am reading"</li><li><strong>எதிர்காலம்</strong> (future): படிப்பேன், "I will read"</li></ul>
<p>The ending -ஏன் marks "I"; compare படிக்கிறாய் (you), படிக்கிறான் (he), படிக்கிறாள் (she).</p>` },
  { id: "cases", keys: "vetrumai case endings cases noun suffix accusative dative", ta: "வேற்றுமை", en: "Cases (noun endings)",
    body: `<p>Tamil marks the role of a noun with endings. Traditional grammar counts eight cases:</p>
<ol><li>எழுவாய் (subject): ராமன்</li><li>ஐ (object): ராமனை</li><li>ஆல், ஒடு, உடன் (by, with): ராமனால், ராமனோடு</li><li>கு (to, for): ராமனுக்கு</li><li>இன், இல் (from, than): ஊரிலிருந்து</li><li>அது, உடைய (of): ராமனுடைய</li><li>கண், இல் (in, at): வீட்டில்</li><li>விளி (calling someone): ராமா!</li></ol>` },
  { id: "sandhi", keys: "punarchi sandhi joining words doubling", ta: "புணர்ச்சி", en: "Joining words (sandhi)",
    body: `<p>When two words join, sounds can change. A common rule doubles a hard consonant: பூ + கடை → <strong>பூக்கடை</strong> (flower shop), தமிழ் + பாட்டு → <strong>தமிழ்ப்பாட்டு</strong>.</p>
<p>In other cases a glide is added (மணி + அடி → மணியடி) or a sound changes (பல் + பொடி → பற்பொடி). These rules keep speech smooth and are why classical verse can look like one long word.</p>` },
  { id: "prosody", keys: "yaappu yappu prosody metre meter venba kural venba seer asai thalai adi", ta: "யாப்பு", en: "Prosody: how a kural is built",
    body: `<p>Verse is built from small units: <strong>எழுத்து</strong> (letters) form <strong>அசை</strong> (syllable groups, நேர் or நிரை), these form <strong>சீர்</strong> (metrical feet), feet are linked by <strong>தளை</strong>, and feet make an <strong>அடி</strong> (line).</p>
<p>A kural is a <strong>குறள் வெண்பா</strong>: two lines, four feet in the first and three in the second, seven feet in all. Try counting them in குறள் 1: அகர | முதல | எழுத்தெல்லாம் | ஆதி // பகவன் | முதற்றே | உலகு.</p>` },
  { id: "figures", keys: "ani uvamai uruvagam simile metaphor figure of speech", ta: "அணி", en: "Figures of speech",
    body: `<p><strong>உவமை அணி</strong> (simile) compares two things with words like போல, அன்ன. Kural 1 is a classic example: as அ is first of letters, God is first of the world.</p>
<p>Other figures include <strong>உருவக அணி</strong> (metaphor, where the comparison is direct) and <strong>வேற்றுமை அணி</strong> (contrast after a comparison).</p>` },
  { id: "thinai", keys: "thinai tinai uyarthinai akrinai kurinji mullai marutham neythal paalai landscape", ta: "திணை", en: "Thinai: two meanings",
    body: `<p>In grammar, <strong>உயர்திணை</strong> covers humans and gods and <strong>அஃறிணை</strong> covers everything else; verbs agree with this (அவன் வந்தான், அது வந்தது).</p>
<p>In Sangam love poetry, a <strong>திணை</strong> is a landscape that sets the mood: குறிஞ்சி (mountains, union), முல்லை (forest, waiting), மருதம் (farmland, quarrels), நெய்தல் (seashore, longing) and பாலை (wasteland, separation).</p>` },
];

window.HISTORY = [
  { id: "brahmi", keys: "tamil brahmi inscriptions oldest script caves keezhadi", when: "c. 3rd–2nd century BCE", title: "Tamil-Brahmi inscriptions",
    body: "Short inscriptions in Tamil-Brahmi script are carved in natural caves around Madurai and elsewhere, often recording gifts of rock beds to monks. Excavations such as Keezhadi have prompted debate about even earlier dates." },
  { id: "sangam", keys: "sangam age literature ettuthokai pattuppattu chera chola pandya", when: "c. 3rd century BCE – 3rd century CE", title: "Sangam literature",
    body: "The poems later collected as Ettuthokai (Eight Anthologies) and Pattuppattu (Ten Idylls) describe love (akam) and public life (puram) under the Chera, Chola and Pandya kings." },
  { id: "tolkappiyam", keys: "tholkappiyam grammar oldest", when: "early centuries BCE/CE (debated)", title: "Tolkappiyam",
    body: "The oldest surviving Tamil grammar, covering letters, words and poetic subject matter. Parts of it may have been written at different times." },
  { id: "kural", keys: "thirukkural valluvar thiruvalluvar", when: "c. 1st century BCE – 5th century CE (debated)", title: "Thirukkural",
    body: "Thiruvalluvar's 1,330 couplets in three books: Aram (virtue), Porul (wealth and statecraft) and Inbam (love). It is one of the most translated works of Indian literature." },
  { id: "epics", keys: "silappatikaram silapathikaram manimekalai kannagi epics", when: "c. 5th–6th century CE", title: "Silappatikaram and Manimekalai",
    body: "The 'twin epics': Ilango Adigal's story of Kannagi and Kovalan, and Seethalai Saathanar's sequel about their daughter Manimekalai, who becomes a Buddhist nun." },
  { id: "bhakti", keys: "bhakti nayanmars alvars azhwars tevaram thevaram", when: "c. 6th–9th century CE", title: "Bhakti poets",
    body: "Shaiva Nayanmars (Tevaram) and Vaishnava Alvars (Nalayira Divya Prabandham) wrote devotional hymns that are still sung in temples." },
  { id: "pallava", keys: "pallavas pallava mamallapuram mahabalipuram", when: "c. 6th–9th century CE", title: "Pallavas and Mamallapuram",
    body: "Pallava kings such as Mahendravarman I and Narasimhavarman I built rock-cut temples and monuments at Mamallapuram. Their inscriptions use Grantha and early Tamil scripts." },
  { id: "chola", keys: "cholas chola rajaraja rajendra thanjavur big temple brihadeeswarar", when: "c. 850–1279 CE", title: "The Chola empire",
    body: "Rajaraja I (reigned 985–1014) completed the Brihadeeswarar temple at Thanjavur around 1010, its walls covered with Tamil inscriptions. His son Rajendra I extended Chola power overseas." },
  { id: "kamban", keys: "kamban kambaramayanam ramayana avvaiyar aathichudi", when: "c. 12th century CE", title: "Kamba Ramayanam and Avvaiyar",
    body: "Kamban retold the Ramayana in Tamil verse. The Avvaiyar who wrote Aathichudi, a set of one-line maxims for children, is usually placed around this period." },
  { id: "print", keys: "first printed book printing cartilha thambiran vanakkam", when: "1554 and 1578", title: "First printed Tamil books",
    body: "A Tamil prayer book in Roman letters (Cartilha) was printed in Lisbon in 1554; Thambiran Vanakkam (1578) is usually cited as the first book printed in Tamil script." },
  { id: "bharati", keys: "bharathi bharathiyar bharati subramania poet", when: "1882–1921", title: "Subramania Bharati",
    body: "Poet and freedom fighter whose simple, powerful Tamil modernised the language of poetry. His Puthiya Aathichudi updates Avvaiyar's maxims with calls for courage and equality." },
  { id: "classical", keys: "classical language status 2004", when: "2004", title: "Classical language status",
    body: "The Government of India declared Tamil a classical language in 2004, the first language to receive the status." },
];
