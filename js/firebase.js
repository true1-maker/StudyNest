// =============================================
// StudyNest — js/firebase.js
// Firebase configuration & initialization
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyA4ceXvyKye0PaufhOTt_eeqsJvCtkQdpc",
  authDomain: "studynest-3dbc2.firebaseapp.com",
  projectId: "studynest-3dbc2",
  storageBucket: "studynest-3dbc2.firebasestorage.app",
  messagingSenderId: "456173443651",
  appId: "1:456173443651:web:e74509981f0629531c92f6"
};

// ---- Initialize ----
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// ---- Collections ----
const usersCol     = collection(db, 'users');
const notesCol     = collection(db, 'notes');
const questionsCol = collection(db, 'questions');
const quizzesCol   = collection(db, 'quizzes');
const noticesCol   = collection(db, 'notices');
const resultsCol   = collection(db, 'quizResults');

// ---- Auth Helpers ----
async function fbSignup(name, email, password, institution, cls) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await addDoc(usersCol, {
    uid: cred.user.uid, name, email,
    institution: institution || '',
    class: cls || '',
    points: 0,
    photoUrl: '',
    joined: serverTimestamp()
  });
  return cred.user;
}

async function fbLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function fbLogout() {
  await signOut(auth);
  location.href = 'index.html';
}

function onAuthChange(cb) {
  onAuthStateChanged(auth, cb);
}

// ---- User Helpers ----
async function getUser(uid) {
  const q = query(usersCol, where('uid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

async function updateUserData(uid, updates) {
  const q = query(usersCol, where('uid', '==', uid));
  const snap = await getDocs(q);
  if (!snap.empty) await updateDoc(snap.docs[0].ref, updates);
}

async function addPoints(uid, pts) {
  const q = query(usersCol, where('uid', '==', uid));
  const snap = await getDocs(q);
  if (!snap.empty) await updateDoc(snap.docs[0].ref, { points: increment(pts) });
}

async function getLeaderboard() {
  const q = query(usersCol, orderBy('points', 'desc'), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---- Notes Helpers ----
async function addNote(note) {
  return await addDoc(notesCol, { ...note, date: serverTimestamp() });
}

async function getNotes(subj = '', search = '') {
  let q = query(notesCol, orderBy('date', 'desc'));
  if (subj) q = query(notesCol, where('subject', '==', subj), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (search) {
    const s = search.toLowerCase();
    docs = docs.filter(n =>
      n.title?.toLowerCase().includes(s) ||
      n.description?.toLowerCase().includes(s) ||
      n.subject?.toLowerCase().includes(s)
    );
  }
  return docs;
}

async function getNote(id) {
  const d = await getDoc(doc(db, 'notes', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

async function likeNote(noteId, uid) {
  const ref = doc(db, 'notes', noteId);
  const d = await getDoc(ref);
  if (!d.exists()) return;
  const likes = d.data().likes || [];
  if (likes.includes(uid)) {
    await updateDoc(ref, { likes: arrayRemove(uid) });
  } else {
    await updateDoc(ref, { likes: arrayUnion(uid) });
    await addPoints(d.data().uploaderId, 1);
  }
}

async function incrementNoteViews(noteId) {
  await updateDoc(doc(db, 'notes', noteId), { views: increment(1) });
}

async function deleteNote(noteId) {
  await deleteDoc(doc(db, 'notes', noteId));
}

// ---- Questions Helpers ----
async function addQuestion(q) {
  return await addDoc(questionsCol, { ...q, date: serverTimestamp(), answers: [], views: 0 });
}

async function getQuestions(subj = '') {
  let q = query(questionsCol, orderBy('date', 'desc'));
  if (subj) q = query(questionsCol, where('subject', '==', subj), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getQuestion(id) {
  const d = await getDoc(doc(db, 'questions', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

async function addAnswer(questionId, answer) {
  const ref = doc(db, 'questions', questionId);
  await updateDoc(ref, { answers: arrayUnion(answer) });
}

async function upvoteAnswer(questionId, answerId, uid) {
  const ref = doc(db, 'questions', questionId);
  const d = await getDoc(ref);
  if (!d.exists()) return;
  const answers = d.data().answers || [];
  const updated = answers.map(a => {
    if (a.id !== answerId) return a;
    const votes = a.votes || [];
    if (votes.includes(uid)) {
      return { ...a, votes: votes.filter(v => v !== uid) };
    } else {
      addPoints(a.userId, 1);
      return { ...a, votes: [...votes, uid] };
    }
  });
  await updateDoc(ref, { answers: updated });
}

async function markBestAnswer(questionId, answerId, askerId, uid) {
  if (askerId !== uid) return;
  const ref = doc(db, 'questions', questionId);
  const d = await getDoc(ref);
  if (!d.exists()) return;
  const answers = d.data().answers.map(a => ({ ...a, isBest: a.id === answerId }));
  await updateDoc(ref, { answers });
}

async function incrementQuestionViews(questionId) {
  await updateDoc(doc(db, 'questions', questionId), { views: increment(1) });
}

async function deleteQuestion(questionId) {
  await deleteDoc(doc(db, 'questions', questionId));
}

// ---- Quiz Helpers ----
async function addQuiz(quiz) {
  return await addDoc(quizzesCol, { ...quiz, date: serverTimestamp() });
}

async function getQuizzes(subj = '') {
  let q = query(quizzesCol, orderBy('date', 'desc'));
  if (subj) q = query(quizzesCol, where('subject', '==', subj), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function saveQuizResult(result) {
  return await addDoc(resultsCol, { ...result, date: serverTimestamp() });
}

async function getMyQuizResults(uid) {
  const q = query(resultsCol, where('userId', '==', uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---- Notice Helpers ----
async function addNotice(notice) {
  return await addDoc(noticesCol, { ...notice, date: serverTimestamp() });
}

async function getNotices() {
  const q = query(noticesCol, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function deleteNotice(id) {
  await deleteDoc(doc(db, 'notices', id));
}

// ---- Stats ----
async function getStats() {
  const [n, q, u] = await Promise.all([
    getDocs(query(notesCol, limit(100))),
    getDocs(query(questionsCol, limit(100))),
    getDocs(query(usersCol, limit(100)))
  ]);
  return { notes: n.size, questions: q.size, users: u.size };
}

// ---- Seed Notices (first time) ----
async function seedNoticesIfEmpty() {
  const snap = await getDocs(query(noticesCol, limit(1)));
  if (!snap.empty) return;
  const notices = [
    { title: 'Welcome to StudyNest! 🎓', content: 'StudyNest is a free platform for Bangladeshi students to share notes, ask questions, and practice with quizzes. Upload your class notes to earn points!', type: 'info', postedBy: 'StudyNest Team', postedById: 'system' },
    { title: 'Points & Leaderboard System Active ⭐', content: 'Upload notes → 10 pts | Ask question → 5 pts | Answer → 3 pts | Get upvote → 1 pt. Top contributors shown on leaderboard!', type: 'info', postedBy: 'StudyNest Team', postedById: 'system' },
  ];
  for (const n of notices) await addDoc(noticesCol, { ...n, date: serverTimestamp() });
}

export {
  db, auth,
  fbSignup, fbLogin, fbLogout, onAuthChange,
  getUser, updateUserData, addPoints, getLeaderboard,
  addNote, getNotes, getNote, likeNote, incrementNoteViews, deleteNote,
  addQuestion, getQuestions, getQuestion, addAnswer, upvoteAnswer, markBestAnswer, incrementQuestionViews, deleteQuestion,
  addQuiz, getQuizzes, saveQuizResult, getMyQuizResults,
  addNotice, getNotices, deleteNotice,
  getStats, seedNoticesIfEmpty,
  serverTimestamp
};
                                 
