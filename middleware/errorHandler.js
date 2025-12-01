/**
 * Express error handler
 */
module.exports = (err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};

// Example usage: call when user enters their name in the app
async function loginAndSync(username) {
  // call login endpoint (create-or-get)
  const res = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  // data contains: user, tasks, sessions
  // overwrite localStorage for the user
  localStorage.setItem('username', data.user.username);
  localStorage.setItem(`momentum-tasks-${data.user.username}`, JSON.stringify(data.tasks));
  localStorage.setItem(`momentum-history-${data.user.username}`, JSON.stringify(data.sessions));
  return data;
}

async function syncLocalToServer(username) {
  const localTasks = JSON.parse(localStorage.getItem(`momentum-tasks-${username}`) || '[]');
  const localHistory = JSON.parse(localStorage.getItem(`momentum-history-${username}`) || '[]');
  const res = await fetch(`http://localhost:5000/api/sync/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks: localTasks, sessions: localHistory })
  });
  if (!res.ok) throw new Error('Sync failed');
  const data = await res.json();
  // server returns user, tasks, sessions canonical lists
  localStorage.setItem(`momentum-tasks-${data.user.username}`, JSON.stringify(data.tasks));
  localStorage.setItem(`momentum-history-${data.user.username}`, JSON.stringify(data.sessions));
  return data;
}

// create single task for username
async function createTaskForUser(username, title) {
  const res = await fetch(`http://localhost:5000/api/tasks/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  return res.json(); // { task } or error
}

async function replaceTasksForUser(username, allTasksArray) {
  const res = await fetch(`http://localhost:5000/api/tasks/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allTasksArray) // server interprets array as replace
  });
  return res.json(); // { tasks }
}

async function addSessionForUser(username, durationMinutes) {
  const res = await fetch(`http://localhost:5000/api/sessions/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration: durationMinutes })
  });
  return res.json(); // { session }
}