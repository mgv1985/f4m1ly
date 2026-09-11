const game = document.querySelector('#game');
const toast = document.querySelector('#wordToast');
const concepts = {
  1: { word: 'μονάδα', lesson: 'μονάδα', option: 'Μονάδα', className: 'one' },
  10: { word: 'δεκάδα', lesson: 'δεκάδα', option: 'Δεκάδα', className: 'ten' },
  100: { word: 'εκατοντάδα', lesson: 'εκατοντάδες', option: 'Εκατοντάδα', className: 'hundred' },
  1000: { word: 'χιλιάδα', lesson: 'χιλιάδες', option: 'Χιλιάδα', className: 'thousand' }
};
const lessonOrder = [1, 10, 100, 1000];
let toastTimer;
let quizOrder = [];
let questionIndex = 0;
let score = 0;
let answering = false;

function speak(word) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'el-GR';
  utterance.rate = .82;
  const greekVoice = speechSynthesis.getVoices().find(voice => voice.lang.toLowerCase().startsWith('el'));
  if (greekVoice) utterance.voice = greekVoice;
  speechSynthesis.speak(utterance);
}

function revealWord(word) {
  clearTimeout(toastTimer);
  toast.textContent = word;
  toast.classList.add('show');
  speak(word);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 850);
}

function bricks(count, interactive = false) {
  const concept = concepts[count];
  const images = count === 1000
    ? Array.from({ length: 10 }, (_, index) => `<span class="hundred-layer" style="--layer:${index}" aria-hidden="true"></span>`).join('')
    : Array.from({ length: count }, () => '<img src="brick.png" alt="" draggable="false" />').join('');
  const content = `<span class="brick-group ${concept.className}" aria-hidden="true">${images}</span>`;
  return interactive ? `<button class="brick-target" type="button" data-word="${concept.lesson}" aria-label="${concept.lesson}">${content}</button>` : content;
}

function bindSpokenTargets(selector = '[data-word]') {
  document.querySelectorAll(selector).forEach(element => {
    element.addEventListener('pointerenter', () => revealWord(element.dataset.word));
    element.addEventListener('focus', () => revealWord(element.dataset.word));
    element.addEventListener('click', () => speak(element.dataset.word));
  });
}

function showIntro() {
  game.innerHTML = `<section class="screen intro-screen"><div><p class="eyebrow">Μαθαίνω παίζοντας</p><h1>Μονάδες, δεκάδες, εκατοντάδες και χιλιάδες.</h1><p class="screen-copy">Μαθαίνω τις μονάδες, δεκάδες, εκατοντάδες και χιλιάδες.</p><div class="intro-actions"><button class="primary-action" id="beginLesson" type="button">Ξεκινάμε</button></div></div><div class="intro-art"><img src="castle.png" alt="Κόκκινο κάστρο φτιαγμένο από τουβλάκια" /></div></section>`;
  document.querySelector('#beginLesson').addEventListener('click', () => showLesson(0));
}

function showLesson(index) {
  const count = lessonOrder[index];
  game.innerHTML = `<section class="screen lesson-screen single-lesson"><div class="lesson-title"><p class="eyebrow">${index + 1} / ${lessonOrder.length}</p><h1>${concepts[count].lesson}</h1></div><div class="single-brick-stage">${bricks(count, true)}</div><button class="next-action" id="lessonNext" type="button">${index === lessonOrder.length - 1 ? 'Πάμε στο τεστ' : 'Επόμενο'} →</button></section>`;
  bindSpokenTargets();
  document.querySelector('#lessonNext').addEventListener('click', () => index < lessonOrder.length - 1 ? showLesson(index + 1) : startQuiz());
}

function shuffle(values) {
  return values.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(item => item.value);
}

function startQuiz() {
  quizOrder = shuffle(lessonOrder);
  questionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  answering = false;
  const correct = quizOrder[questionIndex];
  game.innerHTML = `<section class="screen quiz-screen"><div class="quiz-title"><p class="quiz-progress">${questionIndex + 1} / ${quizOrder.length}</p><h1>Τι βλέπεις;</h1></div><div class="quiz-visual">${bricks(correct)}</div><div class="answer-options">${lessonOrder.map(value => `<button type="button" data-answer="${value}" data-word="${concepts[value].word}">${concepts[value].option}</button>`).join('')}</div></section>`;
  bindSpokenTargets('.answer-options [data-word]');
  document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => chooseAnswer(button, correct)));
}

function chooseAnswer(button, correct) {
  if (answering) return;
  answering = true;
  const answer = Number(button.dataset.answer);
  if (answer === correct) { score += 1; button.classList.add('correct'); }
  else {
    button.classList.add('wrong');
    document.querySelector(`[data-answer="${correct}"]`).classList.add('correct');
  }
  setTimeout(() => {
    questionIndex += 1;
    if (questionIndex < quizOrder.length) showQuestion(); else showResults();
  }, 650);
}

function resultText() {
  if (score === 4) return { title: 'Μπράβο, πέτυχες και τα τέσσερα!', copy: '' };
  if (score === 3) return { title: '3/4, τα πήγες πολύ καλά.', copy: 'Δοκίμασε ξανά για να τα πετύχεις όλα.' };
  if (score === 2) return { title: '2/4, τα πήγες καλά.', copy: 'Ξαναδοκίμασε για να τα πας καλύτερα.' };
  if (score === 1) return { title: '1/4 Καλή προσπάθεια.', copy: 'Ξαναδοκίμασε για να τα πας καλύτερα.' };
  return { title: '0/4 Καλή προσπάθεια.', copy: 'Προσπάθησε ξανά για να τα πας καλύτερα.' };
}

function showResults() {
  const result = resultText();
  game.innerHTML = `<section class="screen result-screen"><div class="result-art"><img src="all-good-hero.png" alt="Χαρούμενος ήρωας φτιαγμένος από κόκκινα τουβλάκια" /></div><div class="result-card"><p class="eyebrow">Αποτέλεσμα</p><h1>${result.title}</h1>${result.copy ? `<p>${result.copy}</p>` : '<p>Τα κατάφερες υπέροχα!</p>'}<div class="result-actions"><button class="primary-action" id="startOver" type="button">Από την αρχή</button><button class="secondary-action" id="testAgain" type="button">Ξανά το τεστ</button></div></div></section>`;
  document.querySelector('#startOver').addEventListener('click', showIntro);
  document.querySelector('#testAgain').addEventListener('click', startQuiz);
}

window.speechSynthesis?.getVoices();
showIntro();
