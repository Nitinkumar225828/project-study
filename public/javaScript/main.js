// ------- DOM Element Shortcuts -------
const subjectsList = document.getElementById('subjects-list');
const addSubjectBtn = document.getElementById('add-subject-btn');
const availabilityList = document.getElementById('availability-list');
const addAvailabilityBtn = document.getElementById('add-availability-btn');
const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const timetableSection = document.getElementById('timetable-section');
const timetableOutput = document.getElementById('timetable-output');

// ------- State -------
let subjects = [];
let availabilities = [];

// ------- Subject Handlers -------
function renderSubjects() {
  subjectsList.innerHTML = '';
  subjects.forEach((subj, i) => {
    const row = document.createElement('div');
    row.className = 'subject-item';
    row.innerHTML = `
      <label>Subject: <input type="text" value="${subj.name}" data-type="name" data-i="${i}" required placeholder="e.g. Math" /></label>
      <label>Priority:
        <select data-type="priority" data-i="${i}">
          <option value="3"${subj.priority==3?' selected':''}>High</option>
          <option value="2"${subj.priority==2?' selected':''}>Medium</option>
          <option value="1"${subj.priority==1?' selected':''}>Low</option>
        </select>
      </label>
      <label>Exam: <input type="date" value="${subj.exam}" data-type="exam" data-i="${i}" required /></label>
      <button class="remove-btn" type="button" data-rm="${i}">Remove</button>
    `;
    subjectsList.appendChild(row);
  });

  subjectsList.querySelectorAll('input,select').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.i);
      const type = e.target.dataset.type;
      if (type === 'name') subjects[idx].name = e.target.value;
      if (type === 'priority') subjects[idx].priority = +e.target.value;
      if (type === 'exam') subjects[idx].exam = e.target.value;
    });
  });

  subjectsList.querySelectorAll('.remove-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(e.target.dataset.rm);
      subjects.splice(idx, 1);
      renderSubjects();
    });
  });
}
addSubjectBtn.addEventListener('click', () => {
  subjects.push({ name: '', priority: 2, exam: '' });
  renderSubjects();
});
if (!subjects.length) {
  subjects.push({ name: '', priority: 2, exam: '' });
}
renderSubjects();

// ------- Availability Handlers -------
const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function renderAvailabilities() {
  availabilityList.innerHTML = '';
  availabilities.forEach((av, i) => {
    const row = document.createElement('div');
    row.className = 'availability-item';
    row.innerHTML = `
      <label>Day:
      <select data-type="day" data-i="${i}">
        ${dayOptions.map(d => `<option${av.day === d ? ' selected' : ''}>${d}</option>`).join('')}
      </select></label>
      <label>Start: <input type="time" value="${av.start}" data-type="start" data-i="${i}" required /></label>
      <label>End: <input type="time" value="${av.end}" data-type="end" data-i="${i}" required /></label>
      <button class="remove-btn" type="button" data-rm="${i}">Remove</button>
    `;
    availabilityList.appendChild(row);
  });

  availabilityList.querySelectorAll('input,select').forEach(el => {
    el.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.i);
      const type = e.target.dataset.type;
      if (type === 'day') availabilities[idx].day = e.target.value;
      if (type === 'start') availabilities[idx].start = e.target.value;
      if (type === 'end') availabilities[idx].end = e.target.value;
    });
  });

  availabilityList.querySelectorAll('.remove-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = Number(e.target.dataset.rm);
      availabilities.splice(idx, 1);
      renderAvailabilities();
    });
  });
}
addAvailabilityBtn.addEventListener('click', () => {
  availabilities.push({ day: 'Monday', start: '16:00', end: '18:00' });
  renderAvailabilities();
});
if (!availabilities.length) {
  availabilities.push({ day: 'Monday', start: '16:00', end: '18:00' });
}
renderAvailabilities();

// ------- Timetable Generation Logic -------
function getAllDatesWithinAvail(days, fromDate, toDate) {
  let slots = [];
  let startD = new Date(fromDate), endD = new Date(toDate);
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    let dayName = dayOptions[d.getDay() === 0 ? 6 : d.getDay() - 1];
    days.forEach(av => {
      if (av.day === dayName) {
        slots.push({ date: d.toISOString().slice(0, 10), weekday: av.day, start: av.start, end: av.end });
      }
    });
  }
  return slots;
}

function getTimeDiffHrs(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = (eh + em / 60) - (sh + sm / 60);
  return diff > 0 ? diff : 0;
}

function generateTimetable() {
  const cleanSubs = subjects.filter(s => s.name.trim() && s.exam);
  if (!cleanSubs.length) return alert('Add at least one subject with a name and exam date.');
  if (!availabilities.length) return alert('Add at least one study availability.');

  let today = new Date(); today.setHours(0, 0, 0, 0);
  let minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  let maxDate = new Date(Math.max(...cleanSubs.map(s => new Date(s.exam).getTime())));
  const slots = getAllDatesWithinAvail(availabilities, minDate.toISOString().slice(0, 10), maxDate.toISOString().slice(0, 10));

  let slotMap = {};
  slots.forEach(slot => {
    slotMap[slot.date] = (slotMap[slot.date] || 0) + getTimeDiffHrs(slot.start, slot.end);
  });

  let subjectPlans = [];
  let totalWeights = 0;
  cleanSubs.forEach(s => {
    let dats = [], dt = new Date(minDate);
    let examDate = new Date(s.exam);
    while (dt <= examDate) {
      let ds = dt.toISOString().slice(0, 10);
      if (slotMap[ds]) dats.push(ds);
      dt.setDate(dt.getDate() + 1);
    }
    let hours = dats.reduce((acc, ds) => acc + slotMap[ds], 0);
    subjectPlans.push({ subject: s.name, hours, dailySlots: dats });
    totalWeights += s.priority;
  });

  let daily = {};
  for (let date in slotMap) daily[date] = { slots: [] };

  cleanSubs.forEach(subj => {
    let availableDates = Object.keys(slotMap).filter(d => (d <= subj.exam));
    let sumAvail = availableDates.reduce((acc, ds) => acc + slotMap[ds], 0);
    let thisWeight = subj.priority / totalWeights;
    let intendedHours = Math.round(thisWeight * sumAvail * 10) / 10;
    let perDay = intendedHours / availableDates.length;
    availableDates.forEach(d => {
      daily[d].slots.push({ subject: subj.name, duration: Math.round(perDay * 10) / 10 });
    });
  });

  for (let d in daily) {
    let ttl = daily[d].slots.reduce((acc, el) => acc + el.duration, 0);
    if (ttl > slotMap[d]) {
      daily[d].slots.forEach(s => s.duration = Math.round(s.duration * slotMap[d] / ttl * 10) / 10);
    }
    daily[d].slots = daily[d].slots.filter(s => s.duration >= 0.25);
  }

  showTimetable(daily, slotMap);
}

function showTimetable(daily, slotMap) {
  timetableOutput.innerHTML = '';
  const sortedDates = Object.keys(daily).sort();
  let html = `<table class="timetable-table"><tr><th>Date</th><th>Subjects & Duration</th></tr>`;
  for (let date of sortedDates) {
    let sessions = daily[date].slots.map(s =>
      `<span class="subject-label">${s.subject}</span> ${s.duration}h`
    ).join('<br/>');
    html += `<tr><td>${date}</td><td>${sessions || '<i>Rest/No Study</i>'}</td></tr>`;
  }
  html += '</table>';
  timetableOutput.innerHTML = html;
  timetableSection.style.display = '';
  resetBtn.style.display = 'inline-block';
  document.getElementById('subjects-section').style.display = 'none';
  document.getElementById('availability-section').style.display = 'none';
  generateBtn.style.display = 'none';
}

// ------- Regenerate/Edit -------
resetBtn.addEventListener('click', () => {
  timetableSection.style.display = 'none';
  document.getElementById('subjects-section').style.display = '';
  document.getElementById('availability-section').style.display = '';
  generateBtn.style.display = '';
  resetBtn.style.display = 'none';
});

generateBtn.addEventListener('click', generateTimetable);
