/* =============================================
   StudyNest — js/auth.js
   Authentication helpers
   ============================================= */

function login(email, password) {
  const user = getUsers().find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, err: 'Invalid email or password.' };
  localStorage.setItem('sn_current', user.id);
  return { ok: true, user };
}

function signup(name, email, password, institution, cls) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, err: 'Email is already registered.' };
  if (name.trim().length < 2)
    return { ok: false, err: 'Name must be at least 2 characters.' };
  if (password.length < 6)
    return { ok: false, err: 'Password must be at least 6 characters.' };

  const user = {
    id: genId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    institution: institution || '',
    class: cls || '',
    points: 0,
    joined: Date.now(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem('sn_current', user.id);
  return { ok: true, user };
}

function logout() {
  localStorage.removeItem('sn_current');
  location.href = 'index.html';
}

function requireAuth() {
  if (!getCurrentUser()) {
    location.href = 'login.html?next=' + encodeURIComponent(location.href);
    return false;
  }
  return true;
}
