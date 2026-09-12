const synth = window.speechSynthesis;
const textInput = document.querySelector('#textInput');
const languageSelect = document.querySelector('#language');
const voiceSelect = document.querySelector('#voice');
const speedInput = document.querySelector('#speed');
const speedValue = document.querySelector('#speedValue');
const spokenText = document.querySelector('#spokenText');
const readerStatus = document.querySelector('#readerStatus');
const progress = document.querySelector('#progress');
const wordCount = document.querySelector('#wordCount');
const themeButton = document.querySelector('#themeButton');

let voices = [];
let sections = [];
let wordElements = [];
let sectionIndex = 0;
let sessionId = 0;
let reading = false;
let paused = false;
let readingSize = 24;

function loadVoices() {
  voices = synth?.getVoices() || [];
  const selected = voiceSelect.value;
  voiceSelect.innerHTML = '<option value="auto">Automatic voice</option>';
  voices
    .filter(voice => /^(el|en)(-|_)/i.test(voice.lang))
    .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name))
    .forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = String(voices.indexOf(voice));
      option.textContent = `${voice.name} · ${voice.lang}${voice.default ? ' · Default' : ''}`;
      voiceSelect.append(option);
    });
  if ([...voiceSelect.options].some(option => option.value === selected)) voiceSelect.value = selected;
}

function detectLanguage(text) {
  const chosen = languageSelect.value;
  if (chosen !== 'auto') return chosen;
  const greek = (text.match(/[\u0370-\u03ff\u1f00-\u1fff]/g) || []).length;
  const latin = (text.match(/[a-z]/gi) || []).length;
  return greek > latin ? 'el-GR' : 'en-GB';
}

function chooseVoice(lang) {
  if (voiceSelect.value !== 'auto') return voices[Number(voiceSelect.value)];
  const exact = voices.find(voice => voice.lang.toLowerCase() === lang.toLowerCase());
  return exact || voices.find(voice => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
}

function splitIntoSections(text) {
  const matches = [...text.matchAll(/[^.!?;·\n]+(?:[.!?;·]+|\n+|$)/g)];
  if (!matches.length && text.trim()) return [{ text: text.trim(), start: text.indexOf(text.trim()) }];
  return matches
    .map(match => ({ text: match[0].trim(), start: match.index + match[0].indexOf(match[0].trim()) }))
    .filter(section => section.text);
}

function renderReadingText(text) {
  spokenText.innerHTML = '';
  wordElements = [];
  if (!text.trim()) {
    spokenText.innerHTML = '<p>Your text will appear here while it is being read.</p>';
    progress.textContent = '0 / 0';
    return;
  }
  sections.forEach((section, sentenceIndex) => {
    const sentence = document.createElement('span');
    sentence.className = 'sentence';
    sentence.dataset.sentence = sentenceIndex;
    const words = [...section.text.matchAll(/\S+/g)];
    words.forEach((match, index) => {
      const word = document.createElement('button');
      word.type = 'button';
      word.className = 'word';
      word.textContent = match[0];
      word.dataset.sentence = sentenceIndex;
      word.dataset.start = section.start + match.index;
      word.dataset.end = section.start + match.index + match[0].length;
      sentence.append(word);
      wordElements.push(word);
      if (index < words.length - 1) sentence.append(' ');
    });
    spokenText.append(sentence, ' ');
  });
  progress.textContent = `0 / ${sections.length}`;
}

function highlight(globalIndex, currentSection) {
  document.querySelectorAll('.active,.active-sentence').forEach(element => element.classList.remove('active', 'active-sentence'));
  const sentence = document.querySelector(`[data-sentence="${currentSection}"]`);
  sentence?.classList.add('active-sentence');
  const word = wordElements.find(element => globalIndex >= Number(element.dataset.start) && globalIndex < Number(element.dataset.end));
  if (word) {
    word.classList.add('active');
    word.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function speakSection(id) {
  if (!reading || id !== sessionId || sectionIndex >= sections.length) {
    if (reading && sectionIndex >= sections.length) finishReading();
    return;
  }
  const section = sections[sectionIndex];
  const lang = detectLanguage(section.text);
  const utterance = new SpeechSynthesisUtterance(section.text);
  utterance.lang = lang;
  utterance.rate = Number(speedInput.value);
  const voice = chooseVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.onstart = () => {
    readerStatus.textContent = `Reading ${lang.startsWith('el') ? 'Greek' : 'English'} · section ${sectionIndex + 1} of ${sections.length}`;
    progress.textContent = `${sectionIndex + 1} / ${sections.length}`;
    highlight(section.start, sectionIndex);
  };
  utterance.onboundary = event => {
    if (event.name === 'word' || event.charLength) highlight(section.start + event.charIndex, sectionIndex);
  };
  utterance.onend = () => {
    if (!reading || id !== sessionId) return;
    sectionIndex += 1;
    speakSection(id);
  };
  utterance.onerror = event => {
    if (event.error === 'canceled' || event.error === 'interrupted') return;
    reading = false;
    readerStatus.textContent = 'This device could not read that section. Try another available voice.';
  };
  synth.speak(utterance);
}

function startReading() {
  const text = textInput.value;
  if (!text.trim()) {
    textInput.focus();
    readerStatus.textContent = 'Write or paste some text first.';
    return;
  }
  if (!synth) {
    readerStatus.textContent = 'Speech synthesis is not available in this browser.';
    return;
  }
  sections = splitIntoSections(text);
  renderReadingText(text);
  beginReadingAt(0);
}

function beginReadingAt(startIndex) {
  if (!synth || !sections.length) {
    readerStatus.textContent = 'There is no readable text available.';
    return;
  }
  sessionId += 1;
  synth.cancel();
  sectionIndex = Math.max(0, Math.min(startIndex, sections.length - 1));
  reading = true;
  paused = false;
  readerStatus.textContent = `Starting from section ${sectionIndex + 1}.`;
  speakSection(sessionId);
}

function pauseReading() {
  if (!reading || paused) return;
  synth.pause();
  paused = true;
  readerStatus.textContent = 'Paused.';
}

function resumeReading() {
  if (!reading || !paused) return;
  synth.resume();
  paused = false;
  readerStatus.textContent = 'Reading resumed.';
}

function stopReading(message = 'Stopped.') {
  sessionId += 1;
  reading = false;
  paused = false;
  synth?.cancel();
  document.querySelectorAll('.active,.active-sentence').forEach(element => element.classList.remove('active', 'active-sentence'));
  readerStatus.textContent = message;
}

function finishReading() {
  reading = false;
  paused = false;
  readerStatus.textContent = 'Finished reading.';
  progress.textContent = `${sections.length} / ${sections.length}`;
}

function updateTextMeta() {
  if (reading) stopReading('Text changed. Choose Read or select a word to continue.');
  const count = (textInput.value.trim().match(/\S+/g) || []).length;
  wordCount.textContent = `${count.toLocaleString()} ${count === 1 ? 'word' : 'words'}`;
  if (!reading) {
    sections = splitIntoSections(textInput.value);
    renderReadingText(textInput.value);
  }
}

document.querySelector('#playButton').addEventListener('click', startReading);
document.querySelector('#pauseButton').addEventListener('click', pauseReading);
document.querySelector('#resumeButton').addEventListener('click', resumeReading);
document.querySelector('#stopButton').addEventListener('click', () => stopReading());
document.querySelector('#clearButton').addEventListener('click', () => {
  stopReading('Text cleared.');
  textInput.value = '';
  updateTextMeta();
  textInput.focus();
});
textInput.addEventListener('input', updateTextMeta);
spokenText.addEventListener('click', event => {
  const word = event.target.closest('.word[data-sentence]');
  if (!word || !spokenText.contains(word) || !textInput.value.trim()) return;
  beginReadingAt(Number(word.dataset.sentence));
});
speedInput.addEventListener('input', () => { speedValue.textContent = `${Number(speedInput.value).toFixed(1)}×`; });
document.querySelector('#smallerText').addEventListener('click', () => {
  readingSize = Math.max(18, readingSize - 2);
  document.documentElement.style.setProperty('--reading-size', `${readingSize}px`);
});
document.querySelector('#largerText').addEventListener('click', () => {
  readingSize = Math.min(44, readingSize + 2);
  document.documentElement.style.setProperty('--reading-size', `${readingSize}px`);
});
themeButton.addEventListener('click', () => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  themeButton.setAttribute('aria-pressed', String(light));
  themeButton.innerHTML = light ? '<span aria-hidden="true">☾</span> Dark mode' : '<span aria-hidden="true">☀</span> Light mode';
  document.querySelector('meta[name="theme-color"]').content = light ? '#f3ead8' : '#111715';
});

if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
} else {
  readerStatus.textContent = 'Speech synthesis is not available in this browser.';
  document.querySelectorAll('.transport button').forEach(button => { button.disabled = true; });
}
updateTextMeta();
