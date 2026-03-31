# 📚 StudyNest — Student Collaboration Platform

A free, fully functional student collaboration platform built for Bangladeshi students. No backend required — runs entirely on HTML, CSS, JavaScript and localStorage.

---

## ✨ Features

- 📚 **Notes Sharing** — Upload text notes or external links (Google Drive, etc.)
- ❓ **Q&A System** — Ask questions, answer others, upvote best answers
- 📝 **Self-Test Quizzes** — Timed MCQ quizzes with score & review
- 📢 **Notice Board** — Post and view important announcements
- 👤 **User Profiles** — Points system, leaderboard, quiz history
- 🔍 **Search & Filter** — Search by subject, keyword across notes and Q&A
- ⭐ **Points & Leaderboard** — Earn points for every contribution

---

## 📁 File Structure

```
StudyNest/
│
├── index.html          ← Home page
├── login.html          ← Login & Signup
├── notes.html          ← Browse & upload notes
├── questions.html      ← Q&A page
├── quiz.html           ← Self-test quizzes
├── notice.html         ← Notice board
├── profile.html        ← User profile & settings
│
├── css/
│   └── style.css       ← All styles
│
└── js/
    ├── main.js         ← Core data layer & utilities
    └── auth.js         ← Login, signup, logout
```

---

## 🚀 How to Upload to GitHub Pages

### Step 1 — Create a GitHub Account
Go to [https://github.com](https://github.com) and create a free account if you don't have one.

---

### Step 2 — Create a New Repository

1. Click the **+** button (top right) → **New repository**
2. Repository name: `studynest` (or any name you like)
3. Set it to **Public**
4. Click **Create repository**

---

### Step 3 — Upload Your Files

#### Option A — Upload via GitHub Website (Easiest)

1. Open your new repository
2. Click **Add file** → **Upload files**
3. Upload ALL files and folders:
   - `index.html`
   - `login.html`
   - `notes.html`
   - `questions.html`
   - `quiz.html`
   - `notice.html`
   - `profile.html`
   - `css/` folder (with `style.css` inside)
   - `js/` folder (with `main.js` and `auth.js` inside)
4. Scroll down → Click **Commit changes**

> ⚠️ **Important:** When uploading folders, make sure to keep the folder structure intact.  
> The `css/` and `js/` folders must be uploaded as folders, not as loose files.

---

#### Option B — Upload via Git (For Advanced Users)

```bash
# Clone your empty repo
git clone https://github.com/YOUR_USERNAME/studynest.git

# Copy all StudyNest files into the folder
# Then run:
cd studynest
git add .
git commit -m "Initial commit - StudyNest"
git push origin main
```

---

### Step 4 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source** → Select branch: **main**
5. Select folder: **/ (root)**
6. Click **Save**

GitHub will show you your live URL:
```
https://YOUR_USERNAME.github.io/studynest/
```

Wait 1–2 minutes, then open the URL in your browser. 🎉

---

## 🎯 Demo Login

You can log in with the pre-loaded demo account:

| Field    | Value             |
|----------|-------------------|
| Email    | rahim@demo.com    |
| Password | demo123           |

Or create your own account from the Signup page.

---

## 💾 Data Storage

StudyNest uses **localStorage** — all data is saved in the browser.

| What it means |
|---|
| ✅ No server or backend needed |
| ✅ Works completely offline after first load |
| ✅ Free to host on GitHub Pages |
| ⚠️ Data is saved per browser/device |
| ⚠️ Clearing browser data will reset the app |

---

## 🎨 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| HTML       | Semantic HTML5          |
| CSS        | Custom CSS + Variables  |
| JavaScript | Vanilla JS (ES6+)       |
| Fonts      | Google Fonts (Plus Jakarta Sans) |
| Storage    | Browser localStorage    |
| Hosting    | GitHub Pages (Free)     |

---

## ⭐ Points System

| Action                  | Points |
|-------------------------|--------|
| Upload a note           | +10    |
| Create a quiz           | +10    |
| Ask a question          | +5     |
| Answer a question       | +3     |
| Your answer gets upvoted| +1     |
| Your note gets liked    | +1     |

---

## 🔮 Future Ideas

- [ ] Firebase backend for shared data across devices
- [ ] PDF file upload support
- [ ] Dark mode toggle
- [ ] Study groups / rooms
- [ ] AI-powered question answering
- [ ] Mobile app (PWA)

---

## 🇧🇩 Made for Bangladeshi Students

StudyNest is designed with Bangladeshi students in mind — SSC, HSC, and University level. All subjects covered: Mathematics, Physics, Chemistry, Biology, ICT, English, Bangla, and more.

---

*Built with ❤️ — Free forever*
