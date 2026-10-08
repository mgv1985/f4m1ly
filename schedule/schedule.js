const PASSWORD_HASH = '483029d526219f816e8e8f6a9de07b422633dba180ffc26faac22862a017519f';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['8:15–9:00', '9:00–9:40', '10:00–10:45', '10:45–11:30', '11:45–12:25', '12:35–1:15', '1:15–2:00', '2:00–3:00'];

const schedules = [
  {
    id: 'lucas', name: 'Lucas', greekName: 'Λουκάς', note: 'School lessons, robotics, English and climbing.',
    lessons: [
      ['Γλώσσα','Θρησκευτικά','Μαθηματικά','Αγγλικά','Γλώσσα'],
      ['Γλώσσα','Γλώσσα','Αγγλικά','Μαθηματικά','Μαθηματικά'],
      ['Αγγλικά','Γλώσσα','Γλώσσα','Εργ. Δεξιοτήτων','Γερμανικά'],
      ['Μαθηματικά','Γυμναστική','Γλώσσα','Φυσική','Γερμανικά'],
      ['ΤΠΕ','Εικαστικά','Γεωγραφία','Κοιν. & Πολιτική Αγωγή','Φυσική'],
      ['Ιστορία','Φυσική','Μουσική','Γυμναστική','Ιστορία'],
      ['','','','Ρομποτική',''],
      ['','','','Ρομποτική','']
    ],
    activities: {
      Monday: [], Tuesday: [['3:00–4:50','Αγγλικά']], Wednesday: [['5:00–6:00','Αναρρίχηση']],
      Thursday: [['3:00–4:50','Αγγλικά']], Friday: [['4:00–5:00','Αναρρίχηση']]
    }
  },
  {
    id: 'thanos', name: 'Thanos', greekName: 'Θάνος', note: 'School lessons, English, speech therapy and football.',
    lessons: [
      ['Εικαστικά','Μαθηματικά','Πληροφορική','Γλώσσα','Γλώσσα'],
      ['Γλώσσα','Μουσική','Γλώσσα','Γυμναστική','Γυμναστική'],
      ['Γλώσσα','Ιστορία','Αγγλικά','Μαθηματικά','Ιστορία'],
      ['Αγγλικά','Εργ. Δεξιοτήτων','Μαθηματικά','Θεατρική Αγωγή','Αγγλικά'],
      ['Μελέτη Περιβάλλοντος','Θρησκευτικά','Μελέτη Περιβάλλοντος','Εργ. Δεξιοτήτων','Θρησκευτικά'],
      ['','','','Επιτραπέζια',''],
      ['','','','Επιτραπέζια',''],
      ['','','','','']
    ],
    activities: {
      Monday: [['4:00–5:00','Λογοθεραπεία'],['5:15–6:15','Ποδόσφαιρο']], Tuesday: [['2:50–4:30','Αγγλικά']],
      Wednesday: [['5:15–6:20','Ποδόσφαιρο']], Thursday: [['4:15–5:45','Αγγλικά']], Friday: [['6:15–7:20','Ποδόσφαιρο']]
    }
  }
];

const gate = document.querySelector('#accessGate');
const protectedContent = document.querySelector('#protectedContent');
const passwordInput = document.querySelector('#schedulePassword');
const accessError = document.querySelector('#accessError');

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function unlock() {
  sessionStorage.setItem('familyScheduleAccess', 'granted');
  gate.hidden = true;
  protectedContent.hidden = false;
  document.title = 'Our weekly Schedule 2026–2027 · F4M1LY';
}

function renderSchedule(schedule) {
  const section = document.createElement('section');
  section.id = schedule.id;
  section.className = `child-schedule ${schedule.id}`;
  const rows = TIMES.map((time, rowIndex) => `<tr><th scope="row">${time}</th>${schedule.lessons[rowIndex].map(lesson => `<td>${lesson ? `<span class="lesson">${lesson}</span>` : ''}</td>`).join('')}</tr>`).join('');
  const mobileDays = DAYS.map((day, dayIndex) => {
    const lessons = schedule.lessons.map((row, rowIndex) => row[dayIndex] ? `<div class="mobile-lesson"><time>${TIMES[rowIndex]}</time><strong>${row[dayIndex]}</strong></div>` : '').join('');
    return `<article class="mobile-day"><h3>${day}</h3>${lessons || '<p class="no-activity">No school lessons</p>'}</article>`;
  }).join('');
  const activities = DAYS.map(day => {
    const items = schedule.activities[day].map(([time, activity]) => `<div class="activity-item"><time>${time}</time><strong>${activity}</strong></div>`).join('');
    return `<article class="activity-day"><h3>${day}</h3>${items || '<p class="no-activity">No afternoon activity</p>'}</article>`;
  }).join('');
  section.innerHTML = `
    <header class="child-heading"><div><p class="eyebrow">${schedule.greekName}</p><h2>${schedule.name}</h2></div><p>${schedule.note}</p></header>
    <h3 class="schedule-label">School timetable</h3>
    <div class="table-shell"><table class="week-table"><thead><tr><th scope="col">Time</th>${DAYS.map(day => `<th scope="col">${day}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    <div class="mobile-week">${mobileDays}</div>
    <h3 class="schedule-label">Afternoon activities</h3>
    <div class="activity-list">${activities}</div>`;
  return section;
}

document.querySelector('#scheduleSections').replaceChildren(...schedules.map(renderSchedule));

document.querySelector('#accessForm').addEventListener('submit', async event => {
  event.preventDefault();
  accessError.hidden = true;
  try {
    if (await hashPassword(passwordInput.value) === PASSWORD_HASH) {
      passwordInput.value = '';
      unlock();
      return;
    }
  } catch {}
  accessError.hidden = false;
  passwordInput.select();
});

document.querySelector('#lockButton').addEventListener('click', () => {
  sessionStorage.removeItem('familyScheduleAccess');
  location.reload();
});

const localPreview = location.protocol === 'file:' && new URLSearchParams(location.search).has('preview');
if (sessionStorage.getItem('familyScheduleAccess') === 'granted' || localPreview) unlock();
