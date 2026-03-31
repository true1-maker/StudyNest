/* =============================================
   StudyNest — js/main.js
   Core utilities, data layer, UI components
   ============================================= */

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','ICT','English','Bangla','History','Economics','Geography'];
const SUBJ_ICONS = { Mathematics:'📐', Physics:'⚛️', Chemistry:'🧪', Biology:'🔬', ICT:'💻', English:'📖', Bangla:'✍️', History:'📜', Economics:'📊', Geography:'🌍' };
const AVATAR_COLORS = ['#2563EB','#DC2626','#059669','#D97706','#7C3AED','#DB2777','#0891B2','#EA580C'];

/* ─── DATA LAYER ─────────────────────────────── */

function getUsers()         { return JSON.parse(localStorage.getItem('sn_users')   || '[]'); }
function saveUsers(d)       { localStorage.setItem('sn_users', JSON.stringify(d)); }

function getNotes()         { return JSON.parse(localStorage.getItem('sn_notes')   || '[]'); }
function saveNotes(d)       { localStorage.setItem('sn_notes', JSON.stringify(d)); }

function getQuestions()     { return JSON.parse(localStorage.getItem('sn_questions') || '[]'); }
function saveQuestions(d)   { localStorage.setItem('sn_questions', JSON.stringify(d)); }

function getQuizzes()       { return JSON.parse(localStorage.getItem('sn_quizzes') || '[]'); }
function saveQuizzes(d)     { localStorage.setItem('sn_quizzes', JSON.stringify(d)); }

function getNotices()       { return JSON.parse(localStorage.getItem('sn_notices') || '[]'); }
function saveNotices(d)     { localStorage.setItem('sn_notices', JSON.stringify(d)); }

function getQuizResults()   { return JSON.parse(localStorage.getItem('sn_qresults') || '[]'); }
function saveQuizResults(d) { localStorage.setItem('sn_qresults', JSON.stringify(d)); }

function getCurrentUser() {
  const id = localStorage.getItem('sn_current');
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

function updateUser(updates) {
  const id = localStorage.getItem('sn_current');
  if (!id) return;
  const users = getUsers();
  const i = users.findIndex(u => u.id === id);
  if (i >= 0) { users[i] = { ...users[i], ...updates }; saveUsers(users); }
}

function addPoints(userId, pts) {
  const users = getUsers();
  const i = users.findIndex(u => u.id === userId);
  if (i >= 0) { users[i].points = (users[i].points || 0) + pts; saveUsers(users); }
}

function addNote(note)         { const d = getNotes();     d.unshift(note); saveNotes(d); }
function addQuestion(q)        { const d = getQuestions(); d.unshift(q);    saveQuestions(d); }
function addNotice(n)          { const d = getNotices();   d.unshift(n);    saveNotices(d); }

function updateQuestion(id, fn) {
  const qs = getQuestions();
  const i = qs.findIndex(q => q.id === id);
  if (i >= 0) { fn(qs[i]); saveQuestions(qs); }
}

/* ─── UTILITIES ──────────────────────────────── */

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(ts) {
  const d = new Date(ts), now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return Math.floor(diff/60)   + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600)  + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return d.toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' });
}

function getUrlParam(p)   { return new URLSearchParams(location.search).get(p); }

function avatarColor(id)  {
  const n = (id||'').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initial(name)    { return name ? name.charAt(0).toUpperCase() : '?'; }

/* ─── TOAST ──────────────────────────────────── */

function toast(msg, type = 'success') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||''}</span><span>${escHtml(msg)}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 320);
  }, 3000);
}

/* ─── MODAL HELPERS ──────────────────────────── */

function openModal(id)  {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ─── NAVBAR ─────────────────────────────────── */

function renderNavbar(active) {
  const u = getCurrentUser();
  const links = [
    { href:'index.html',     label:'🏠 Home',     id:'home'      },
    { href:'notes.html',     label:'📚 Notes',    id:'notes'     },
    { href:'questions.html', label:'❓ Q&A',      id:'questions' },
    { href:'quiz.html',      label:'📝 Quiz',     id:'quiz'      },
    { href:'notice.html',    label:'📢 Notice',   id:'notice'    },
  ];

  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="nav-link ${active===l.id?'active':''}">${l.label}</a>`
  ).join('');

  const rightHtml = u
    ? `<a href="profile.html" class="nav-avatar" style="background:${avatarColor(u.id)}" title="${escHtml(u.name)}">${initial(u.name)}</a>
       <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>`
    : `<a href="login.html" class="btn btn-primary btn-sm">Login / Signup</a>`;

  const el = document.getElementById('navbar');
  if (!el) return;
  el.innerHTML = `
  <nav class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">📚 StudyNest</a>
      <div class="nav-links" id="navlinks">${linksHtml}</div>
      <div class="nav-right">
        <div class="nav-search">
          <span class="nav-search-icon">🔍</span>
          <input id="gsearch" type="text" placeholder="Search notes & Q&A…" autocomplete="off"/>
        </div>
        ${rightHtml}
      </div>
      <button class="hamburger" id="hbg">☰</button>
    </div>
  </nav>`;

  document.getElementById('hbg').onclick = () =>
    document.getElementById('navlinks').classList.toggle('open');

  document.getElementById('gsearch').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim())
      location.href = `notes.html?q=${encodeURIComponent(e.target.value.trim())}`;
  });
}

/* ─── SCROLL-TO-TOP ──────────────────────────── */

function initScrollTop() {
  const btn = Object.assign(document.createElement('button'), {
    className: 'scroll-top', innerHTML: '↑', title: 'Back to top'
  });
  btn.onclick = () => scrollTo({ top:0, behavior:'smooth' });
  document.body.appendChild(btn);
  addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 300));
}

/* ─── SEED DATA ──────────────────────────────── */

function seedData() {
  if (localStorage.getItem('sn_seeded_v2')) return;

  saveUsers([
    { id:'u1', name:'Rahim Ahmed',    email:'rahim@demo.com',  password:'demo123', institution:'Dhaka College',           class:'Class 12', points:450, joined: Date.now()-864e6 },
    { id:'u2', name:'Karim Hossain',  email:'karim@demo.com',  password:'demo123', institution:'Notre Dame College',       class:'Class 11', points:380, joined: Date.now()-720e6 },
    { id:'u3', name:'Sadia Islam',    email:'sadia@demo.com',  password:'demo123', institution:'Viqarunnisa Noon School',  class:'Class 10', points:290, joined: Date.now()-432e6 },
  ]);

  saveNotes([
    { id:'n1', title:"Physics — Newton's Laws of Motion", subject:'Physics',
      description:'Complete notes on Newton\'s 3 laws with examples, free body diagrams, and solved numericals for HSC students.',
      type:'text',
      content:`Newton's First Law (Law of Inertia):
An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.

Newton's Second Law:
F = ma  →  Force = mass × acceleration

Example: A 5 kg block pushed with 20 N force.
  a = F/m = 20/5 = 4 m/s²

Newton's Third Law:
For every action, there is an equal and opposite reaction.
Example: When you jump, you push the ground down; the ground pushes you up.

Important formulas:
• Weight: W = mg  (g = 9.8 m/s²)
• Momentum: p = mv
• Impulse: J = F·t = Δp

Practice Problems:
1. A car of mass 1200 kg accelerates at 3 m/s². Find the net force.
   Ans: F = 1200 × 3 = 3600 N

2. A 60 kg person stands on a scale in an elevator accelerating upward at 2 m/s².
   Normal force = m(g+a) = 60(9.8+2) = 708 N`,
      uploaderId:'u1', uploaderName:'Rahim Ahmed', date: Date.now()-172800e3, likes:['u2','u3'], views:34 },

    { id:'n2', title:'Mathematics — Integration Formulas & Techniques', subject:'Mathematics',
      description:'All HSC-level integration formulas, integration by parts, substitution, and trick questions with solutions.',
      type:'text',
      content:`Basic Integration Formulas:
1.  ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ -1)
2.  ∫ eˣ dx = eˣ + C
3.  ∫ 1/x dx = ln|x| + C
4.  ∫ sin(x) dx = -cos(x) + C
5.  ∫ cos(x) dx = sin(x) + C
6.  ∫ sec²(x) dx = tan(x) + C
7.  ∫ aˣ dx = aˣ/ln(a) + C

Integration by Parts:
∫ u dv = uv - ∫ v du

LIATE Rule (choose u in this order):
L - Logarithmic
I - Inverse trig
A - Algebraic
T - Trigonometric
E - Exponential

Example: ∫ x·eˣ dx
  u = x   →   du = dx
  dv = eˣ dx  →  v = eˣ
  = x·eˣ - ∫ eˣ dx = x·eˣ - eˣ + C = eˣ(x-1) + C

Substitution Method:
∫ f(g(x))·g'(x) dx  →  let u = g(x)

Example: ∫ 2x·(x²+1)⁵ dx
  u = x²+1,  du = 2x dx
  = ∫ u⁵ du = u⁶/6 + C = (x²+1)⁶/6 + C`,
      uploaderId:'u2', uploaderName:'Karim Hossain', date: Date.now()-86400e3, likes:['u1'], views:21 },

    { id:'n3', title:'ICT — Database & SQL Basics', subject:'ICT',
      description:'DBMS concepts, SQL commands, ER diagrams for ICT Chapter 4. Very useful for SSC/HSC exam preparation.',
      type:'text',
      content:`Database Concepts:
• Database: Organized collection of structured data
• DBMS: Software to manage databases (MySQL, Oracle, SQLite, PostgreSQL)
• Table: 2D structure with rows (records) and columns (fields)
• Primary Key: Unique identifier for each row
• Foreign Key: Links two tables together

SQL Commands:

SELECT (Read data):
  SELECT * FROM students;
  SELECT name, age FROM students WHERE class = '12';
  SELECT * FROM students ORDER BY name ASC;

INSERT (Add data):
  INSERT INTO students (id, name, age) VALUES (1, 'Rahim', 18);

UPDATE (Modify data):
  UPDATE students SET age = 19 WHERE id = 1;

DELETE (Remove data):
  DELETE FROM students WHERE id = 1;

Aggregate Functions:
  SELECT COUNT(*) FROM students;
  SELECT AVG(marks) FROM results WHERE subject = 'Math';
  SELECT MAX(marks), MIN(marks) FROM results;

JOIN Example:
  SELECT s.name, r.marks
  FROM students s
  JOIN results r ON s.id = r.student_id;

ER Diagram Components:
  Rectangle → Entity (e.g., Student)
  Oval → Attribute (e.g., name, age)
  Diamond → Relationship (e.g., "Enrolls")`,
      uploaderId:'u1', uploaderName:'Rahim Ahmed', date: Date.now()-43200e3, likes:['u2','u3'], views:47 },

    { id:'n4', title:'Chemistry — Organic Reaction Summary', subject:'Chemistry',
      description:'HSC organic chemistry: reaction types, mechanisms, Markovnikov rule, functional groups summary table.',
      type:'text',
      content:`Key Organic Reactions:

1. Addition Reaction:
   Alkene + HBr → Alkyl Halide
   CH₂=CH₂ + HBr → CH₃CH₂Br

2. Substitution Reaction (Free Radical):
   Alkane + Cl₂ → Chloroalkane + HCl  (UV light)
   CH₄ + Cl₂ → CH₃Cl + HCl

3. Elimination Reaction:
   Alcohol + H₂SO₄ (conc.) → Alkene + H₂O  (heat)
   CH₃CH₂OH → CH₂=CH₂ + H₂O

4. Esterification:
   Carboxylic Acid + Alcohol ⇌ Ester + Water  (reversible)
   RCOOH + R'OH ⇌ RCOOR' + H₂O

Markovnikov's Rule:
In addition of HX to an unsymmetrical alkene:
H adds to carbon with MORE hydrogen atoms.
Example: CH₃-CH=CH₂ + HBr → CH₃-CHBr-CH₃ (major product)

Functional Groups:
-OH    → Alcohol
-COOH  → Carboxylic Acid
-CHO   → Aldehyde
-CO-   → Ketone
-NH₂   → Amine
-COOR  → Ester

Homologous Series: Each member differs by CH₂ unit
Alkane: CₙH₂ₙ₊₂  |  Alkene: CₙH₂ₙ  |  Alkyne: CₙH₂ₙ₋₂`,
      uploaderId:'u3', uploaderName:'Sadia Islam', date: Date.now()-21600e3, likes:[], views:18 },
  ]);

  saveQuestions([
    { id:'q1',
      title:"What is Ohm's Law and how is it applied in circuit problems?",
      description:`I'm confused about Ohm's Law. Can someone explain it with clear examples?\n\n- How do we use it when there are multiple resistors?\n- What are its limitations?\n- Any trick to remember when to use series vs parallel?`,
      subject:'Physics', tags:["Ohm's Law","Circuits","Electric Current"],
      askerId:'u2', askerName:'Karim Hossain', date: Date.now()-259200e3, views:45,
      answers:[
        { id:'a1',
          text:`Ohm's Law: V = IR\n\nWhere:\n• V = Voltage (Volts)\n• I = Current (Amperes)\n• R = Resistance (Ohms)\n\nMemory trick — use the triangle:\n     [V]\n  [I] [R]\nCover what you want to find!\n\nExample: 12V battery, 4Ω resistor:\n  I = V/R = 12/4 = 3 Amperes\n\nSeries circuit (resistors in a line):\n  Rtotal = R1 + R2 + R3\n  Same current flows through all\n\nParallel circuit (resistors side by side):\n  1/Rtotal = 1/R1 + 1/R2 + 1/R3\n  Same voltage across all\n\nLimitations:\n• Only applies to ohmic conductors (at constant temperature)\n• Doesn't work for semiconductors, diodes, or vacuum tubes`,
          userId:'u1', userName:'Rahim Ahmed', date: Date.now()-172800e3, votes:['u2','u3'], isBest:true },
        { id:'a2',
          text:`Great answer above! Just to add:\n\nFor power calculations:\n  P = VI = I²R = V²/R\n\nPractice example:\n  Two resistors 6Ω and 3Ω in parallel:\n  1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6\n  R = 2Ω\n\nAlways draw the circuit diagram first — it makes problems much easier!`,
          userId:'u3', userName:'Sadia Islam', date: Date.now()-86400e3, votes:['u1'], isBest:false },
      ]
    },
    { id:'q2',
      title:'Difference between stack and queue data structures?',
      description:`Can someone explain stack vs queue with real-life examples?\n\nI understand the basic definitions but I'm confused about when to use which one, and what operations each supports.`,
      subject:'ICT', tags:['Data Structure','Stack','Queue'],
      askerId:'u3', askerName:'Sadia Islam', date: Date.now()-86400e3, views:28,
      answers:[
        { id:'a3',
          text:`Stack = LIFO (Last In, First Out)\nLike a stack of plates — you take the last plate placed first.\n\nQueue = FIFO (First In, First Out)\nLike a queue at a shop — first person in line is served first.\n\nStack Operations:\n• push(x)  → add to top\n• pop()    → remove from top\n• peek()   → look at top without removing\n\nQueue Operations:\n• enqueue(x) → add to rear\n• dequeue()  → remove from front\n\nReal-world uses:\nStack: Browser back button, Undo/Redo in editors, function call stack in programs\nQueue: Print spooler, CPU task scheduling, WhatsApp message delivery order\n\nCode example (Python):\nstack = []\nstack.append(1)  # push\nstack.pop()      # pop\n\nfrom collections import deque\nq = deque()\nq.append(1)    # enqueue\nq.popleft()    # dequeue`,
          userId:'u1', userName:'Rahim Ahmed', date: Date.now()-43200e3, votes:['u3'], isBest:true },
      ]
    },
    { id:'q3',
      title:'How to solve integration by parts? Tips for choosing u and dv?',
      description:`I keep getting confused when solving integration by parts problems.\n\nMy main issue is choosing which part to call "u" and which to call "dv".\n\nCan someone explain with step-by-step examples? Especially for ∫ x·ln(x) dx and ∫ x·sin(x) dx`,
      subject:'Mathematics', tags:['Integration','Calculus','HSC Math'],
      askerId:'u1', askerName:'Rahim Ahmed', date: Date.now()-43200e3, views:19,
      answers:[]
    },
    { id:'q4',
      title:'What is the difference between mitosis and meiosis?',
      description:`I always mix up mitosis and meiosis in exams. Can someone give a clear comparison with a table or key points?\n\nEspecially:\n1. Number of divisions\n2. Cells produced\n3. Where they occur in the body`,
      subject:'Biology', tags:['Cell Division','Mitosis','Meiosis','Biology'],
      askerId:'u2', askerName:'Karim Hossain', date: Date.now()-21600e3, views:12,
      answers:[
        { id:'a4',
          text:`Great question! Here's a clear comparison:\n\nMITOSIS:\n• Purpose: Growth & repair\n• Divisions: 1\n• Cells produced: 2 daughter cells\n• Chromosome number: Same as parent (diploid → diploid)\n• Occurs in: Somatic (body) cells\n• Daughter cells are genetically IDENTICAL to parent\n\nMEIOSIS:\n• Purpose: Sexual reproduction\n• Divisions: 2 (Meiosis I + Meiosis II)\n• Cells produced: 4 daughter cells\n• Chromosome number: Half of parent (diploid → haploid)\n• Occurs in: Reproductive organs (testes/ovaries)\n• Daughter cells are genetically DIFFERENT (due to crossing over)\n\nMemory trick:\n  Mitosis = Makes identical copies (like photocopying)\n  Meiosis = Makes eggs/sperm (for sexual reproduction)\n\nCrossing over in Meiosis I is very important — it creates genetic variation!`,
          userId:'u3', userName:'Sadia Islam', date: Date.now()-10800e3, votes:['u2'], isBest:true },
      ]
    },
  ]);

  saveQuizzes([
    { id:'qz1', title:'Physics Fundamentals', subject:'Physics',
      creatorId:'u1', creatorName:'Rahim Ahmed', date: Date.now()-259200e3, timeLimitSecs: 300,
      questions:[
        { q:'What is the SI unit of force?', opts:['Joule','Newton','Watt','Pascal'], correct:1 },
        { q:"Newton's Second Law states:", opts:['For every action there is an equal and opposite reaction','F = ma','An object at rest stays at rest','Energy is conserved'], correct:1 },
        { q:'Speed of light in vacuum is approximately:', opts:['3×10⁸ m/s','3×10⁶ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], correct:0 },
        { q:'The unit of electric resistance is:', opts:['Ampere','Volt','Ohm','Watt'], correct:2 },
        { q:'Kinetic energy formula is:', opts:['mgh','½mv²','Fs','mv'], correct:1 },
        { q:'Which of these is a scalar quantity?', opts:['Velocity','Force','Speed','Displacement'], correct:2 },
        { q:'1 Joule equals:', opts:['1 N·m','1 N/m','1 kg·m/s','1 W·h'], correct:0 },
      ]
    },
    { id:'qz2', title:'ICT & Computer Basics', subject:'ICT',
      creatorId:'u2', creatorName:'Karim Hossain', date: Date.now()-172800e3, timeLimitSecs: 240,
      questions:[
        { q:'What does HTML stand for?', opts:['Hyper Text Markup Language','High Text Making Language','Hyper Transfer Markup Language','Home Tool Markup Language'], correct:0 },
        { q:'Which of these is NOT a programming language?', opts:['Python','HTML','Java','C++'], correct:1 },
        { q:'1 Kilobyte = how many bytes?', opts:['100','512','1024','2048'], correct:2 },
        { q:'Which protocol is used for web browsing?', opts:['FTP','SMTP','HTTP','POP3'], correct:2 },
        { q:'Binary number 1010 equals which decimal number?', opts:['8','10','12','14'], correct:1 },
        { q:'RAM stands for:', opts:['Read Access Memory','Random Access Memory','Read And Modify','Runtime Allocation Memory'], correct:1 },
      ]
    },
    { id:'qz3', title:'HSC Mathematics MCQ', subject:'Mathematics',
      creatorId:'u3', creatorName:'Sadia Islam', date: Date.now()-86400e3, timeLimitSecs: 300,
      questions:[
        { q:'Derivative of sin(x) is:', opts:['-cos(x)','cos(x)','-sin(x)','tan(x)'], correct:1 },
        { q:'∫ eˣ dx = ?', opts:['eˣ + C','eˣ/x + C','xeˣ + C','e⁻ˣ + C'], correct:0 },
        { q:'Value of sin(90°) is:', opts:['0','1','-1','√2/2'], correct:1 },
        { q:'If f(x) = x³, then f\'(x) = ?
