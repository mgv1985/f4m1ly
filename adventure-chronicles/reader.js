const synth = window.speechSynthesis;
const story = document.querySelector('.story');
const paragraphs = [...document.querySelectorAll('.story-paragraph p')];
const oldButtons = [...document.querySelectorAll('.listen-button')];
let sentences = [], sentenceIndex = 0, isReading = false, activeUtterance = null;

function splitIntoSentences(text) {
  if ('Segmenter' in Intl) {
    return [...new Intl.Segmenter('el', { granularity: 'sentence' }).segment(text)]
      .map(part => part.segment.trim()).filter(Boolean);
  }
  return (text.match(/[^.!?;]+(?:[.!?;]+[\u00bb\u201d"]?|$)/g) || [text])
    .map(sentence => sentence.trim()).filter(Boolean);
}

function greekVoice() {
  return synth.getVoices().find(voice => voice.lang.toLowerCase().startsWith('el')) || null;
}

oldButtons.slice(1).forEach(button => button.remove());
const button = oldButtons[0] || document.createElement('button');
button.className = 'listen-button chapter-listen-button';
button.type = 'button';
button.textContent = '▶ ΑΚΡΟΑΣΗ ΚΕΦΑΛΑΙΟΥ';
button.setAttribute('aria-pressed', 'false');

const status = document.createElement('span');
status.className = 'chapter-listen-status';
status.setAttribute('role', 'status');
status.textContent = 'ΑΝΑΓΝΩΣΗ ΠΡΟΤΑΣΗ ΠΡΟΣ ΠΡΟΤΑΣΗ';
const controls = document.createElement('div');
controls.className = 'chapter-listen-controls';
controls.append(button, status);
story?.before(controls);

const style = document.createElement('style');
style.textContent = `
  .story-paragraph { display: block; }
  .chapter-listen-controls { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin:1.25rem 0 2rem; padding:.8rem; border:1px solid rgba(86,189,255,.42); background:rgba(3,13,28,.78); box-shadow:inset 0 0 22px rgba(31,133,207,.1); }
  .chapter-listen-controls .chapter-listen-button { margin:0; white-space:nowrap; }
  .chapter-listen-status { color:#92cce9; font:600 .7rem/1.4 "Courier New",monospace; letter-spacing:.13em; }
  @media (max-width:620px) { .chapter-listen-controls { align-items:stretch; } .chapter-listen-controls .chapter-listen-button { width:100%; } }
`;
document.head.append(style);

function resetReader(message = 'ΑΝΑΓΝΩΣΗ ΠΡΟΤΑΣΗ ΠΡΟΣ ΠΡΟΤΑΣΗ') {
  isReading = false; activeUtterance = null; sentenceIndex = 0;
  button.classList.remove('speaking');
  button.textContent = '▶ ΑΚΡΟΑΣΗ ΚΕΦΑΛΑΙΟΥ';
  button.setAttribute('aria-pressed', 'false');
  status.textContent = message;
}

function speakNextSentence() {
  if (!isReading) return;
  if (sentenceIndex >= sentences.length) {
    resetReader('Η ΑΚΡΟΑΣΗ ΟΛΟΚΛΗΡΩΘΗΚΕ');
    return;
  }
  status.textContent = `ΠΡΟΤΑΣΗ ${sentenceIndex + 1} / ${sentences.length}`;
  const utterance = new SpeechSynthesisUtterance(sentences[sentenceIndex]);
  utterance.lang = 'el-GR'; utterance.rate = .92;
  const voice = greekVoice(); if (voice) utterance.voice = voice;
  utterance.onend = () => { if (!isReading || utterance !== activeUtterance) return; sentenceIndex += 1; speakNextSentence(); };
  utterance.onerror = () => { if (utterance === activeUtterance) resetReader('Η ΑΝΑΓΝΩΣΗ ΔΙΑΚΟΠΗΚΕ'); };
  activeUtterance = utterance;
  synth.speak(utterance);
}

button.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) { status.textContent = 'Η ΑΚΡΟΑΣΗ ΔΕΝ ΕΙΝΑΙ ΔΙΑΘΕΣΙΜΗ'; return; }
  if (isReading) { synth.cancel(); resetReader('Η ΑΚΡΟΑΣΗ ΔΙΑΚΟΠΗΚΕ'); return; }
  sentences = paragraphs.flatMap(paragraph => splitIntoSentences(paragraph.innerText.trim()));
  if (!sentences.length) return;
  sentenceIndex = 0; isReading = true;
  button.classList.add('speaking'); button.textContent = '■ ΔΙΑΚΟΠΗ'; button.setAttribute('aria-pressed', 'true');
  speakNextSentence();
});

window.addEventListener('beforeunload', () => synth?.cancel());
