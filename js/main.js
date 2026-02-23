// =========================================
// ABAY Centro Multidisciplinar — Main JS
// =========================================

// --- Custom cursor ---
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX - 6 + 'px';
  cursor.style.top  = e.clientY - 6 + 'px';
  ring.style.left   = e.clientX - 18 + 'px';
  ring.style.top    = e.clientY - 18 + 'px';
});

// --- Scroll reveal ---
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

reveals.forEach(r => observer.observe(r));

// --- Classes schedule data ---
const schedule = {
  lun: [
    { time: '07:30', name: 'Yoga Flow',              trainer: 'Sandra M.',  duration: '60 min', spots: 8,  total: 12 },
    { time: '09:00', name: 'Pilates Core',            trainer: 'Ana L.',     duration: '50 min', spots: 5,  total: 10 },
    { time: '11:00', name: 'Entrenamiento Funcional', trainer: 'Carlos P.',  duration: '60 min', spots: 3,  total: 8  },
    { time: '17:00', name: 'Zumba',                   trainer: 'Laura R.',   duration: '55 min', spots: 10, total: 15 },
    { time: '19:00', name: 'Fútbol Técnico',          trainer: 'Marcos T.',  duration: '90 min', spots: 6,  total: 12 },
    { time: '20:30', name: 'Yoga Nocturno',           trainer: 'Sandra M.',  duration: '60 min', spots: 9,  total: 12 },
  ],
  mar: [
    { time: '08:00', name: 'HIIT Mañana',          trainer: 'Carlos P.', duration: '45 min', spots: 4, total: 10 },
    { time: '10:00', name: 'Pilates Suelo',         trainer: 'Ana L.',    duration: '60 min', spots: 7, total: 10 },
    { time: '18:00', name: 'Entrenamiento Personal',trainer: 'Carlos P.', duration: '60 min', spots: 2, total: 4  },
    { time: '20:00', name: 'Fútbol Resistencia',    trainer: 'Marcos T.', duration: '75 min', spots: 8, total: 12 },
  ],
  mie: [
    { time: '07:00', name: 'Yoga Dinámico',        trainer: 'Sandra M.', duration: '60 min', spots: 6,  total: 12 },
    { time: '09:30', name: 'Zumba Fitness',        trainer: 'Laura R.',  duration: '55 min', spots: 11, total: 15 },
    { time: '11:00', name: 'Rehabilitación Grupal',trainer: 'Dr. García',duration: '50 min', spots: 4,  total: 6  },
    { time: '17:30', name: 'Pilates Avanzado',     trainer: 'Ana L.',    duration: '60 min', spots: 3,  total: 10 },
    { time: '19:30', name: 'Funcional Intenso',    trainer: 'Carlos P.', duration: '60 min', spots: 5,  total: 8  },
  ],
  jue: [
    { time: '08:00', name: 'Pilates Reformer',  trainer: 'Ana L.',    duration: '60 min', spots: 4, total: 8  },
    { time: '10:00', name: 'Yoga Restaurativo', trainer: 'Sandra M.', duration: '75 min', spots: 8, total: 12 },
    { time: '18:00', name: 'Zumba Cardio',      trainer: 'Laura R.',  duration: '55 min', spots: 9, total: 15 },
    { time: '20:00', name: 'Fútbol Táctica',    trainer: 'Marcos T.', duration: '90 min', spots: 7, total: 12 },
  ],
  vie: [
    { time: '07:30', name: 'HIIT & Core',           trainer: 'Carlos P.', duration: '45 min', spots: 3,  total: 10 },
    { time: '09:00', name: 'Yoga Flow',              trainer: 'Sandra M.', duration: '60 min', spots: 7,  total: 12 },
    { time: '11:00', name: 'Zumba Party',            trainer: 'Laura R.',  duration: '60 min', spots: 12, total: 15 },
    { time: '17:00', name: 'Entrenamiento Deportivo',trainer: 'Marcos T.', duration: '75 min', spots: 5,  total: 10 },
    { time: '19:30', name: 'Pilates & Stretching',   trainer: 'Ana L.',    duration: '60 min', spots: 6,  total: 10 },
  ],
  sab: [
    { time: '09:00', name: 'Yoga Weekend',     trainer: 'Sandra M.', duration: '75 min', spots: 10, total: 15 },
    { time: '10:30', name: 'Zumba Especial',   trainer: 'Laura R.',  duration: '60 min', spots: 8,  total: 15 },
    { time: '12:00', name: 'Funcional Outdoor',trainer: 'Carlos P.', duration: '60 min', spots: 6,  total: 12 },
  ],
};

// --- Render class cards ---
function renderClasses(day) {
  const grid = document.getElementById('classesGrid');
  const classes = schedule[day] || [];

  grid.innerHTML = classes.map(c => {
    const pct  = Math.round((c.spots / c.total) * 100);
    const avail = c.total - c.spots;
    return `
      <div class="class-card">
        <div class="class-time">${c.time}</div>
        <div class="class-name">${c.name}</div>
        <div class="class-meta">
          <span>${c.trainer}</span>
          <span>·</span>
          <span>${c.duration}</span>
        </div>
        <div class="class-spots">
          <div class="spots-bar">
            <div class="spots-fill" style="width:${pct}%"></div>
          </div>
          <span class="spots-text">${avail} plazas</span>
        </div>
        <button class="btn-reserve">Reservar</button>
      </div>
    `;
  }).join('');
}

// --- Switch day tab ---
function setDay(btn, day) {
  document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderClasses(day);
}

// --- Contact form handler ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: conectar con backend o servicio de email (EmailJS, Formspree, etc.)
    alert('¡Gracias! Te responderemos en menos de 24h.');
    contactForm.reset();
  });
}

// --- Init ---
renderClasses('lun');
