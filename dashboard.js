// تم وضع بيانات مشروعك هنا تلقائياً
const SUPABASE_URL = "https://fzaybeajxtvtxoxaqfzn.supabase.co";
const SUPABASE_KEY = "sb_publishable_gc0ubfcTs0aIaq9wrvA0IA_7afEDykA";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let userProfile = null;

async function initDashboard() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "index.html";
    return;
  }

  currentUser = session.user;
  await fetchUserProfile();
  loadLeaderboard();
}

async function fetchUserProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (error || !data) return;

  userProfile = data;
  document.getElementById('nav-user-name').innerText = userProfile.full_name;
  document.getElementById('nav-user-score').innerText = userProfile.score;

  if (userProfile.role === 'admin') {
    document.getElementById('admin-tab').classList.remove('hidden');
  }
}

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.remove('hidden');
  btnElement.classList.add('active');

  if (tabId === 'leaderboard') loadLeaderboard();
  if (tabId === 'admin') loadAdminPanel();
}

async function loadLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('full_name, score')
    .order('score', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="3" class="loading">حدث خطأ أثناء تحميل السكور</td></tr>`;
    return;
  }

  tbody.innerHTML = profiles.map((p, index) => {
    let rankBadge = index + 1;
    if (index === 0) rankBadge = '🥇 1';
    if (index === 1) rankBadge = '🥈 2';
    if (index === 2) rankBadge = '🥉 3';

    return `
      <tr>
        <td><strong>${rankBadge}</strong></td>
        <td>${p.full_name}</td>
        <td><strong style="color: #fbbf24;">${p.score}</strong> نقطة</td>
      </tr>
    `;
  }).join('');
}

async function loadAdminPanel() {
  const tbody = document.getElementById('admin-users-body');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="3" class="loading">حدث خطأ أثناء تحميل الحسابات</td></tr>`;
    return;
  }

  tbody.innerHTML = profiles.map(p => `
    <tr>
      <td>${p.full_name} (${p.role === 'admin' ? 'هوست' : 'مشارك'})</td>
      <td><strong>${p.score}</strong> نقطة</td>
      <td>
        <button class="btn-score-ctrl" onclick="changeScore('${p.id}', ${p.score + 5})">+5</button>
        <button class="btn-score-ctrl" onclick="changeScore('${p.id}', ${p.score + 10})">+10</button>
        <button class="btn-score-ctrl" onclick="changeScore('${p.id}', ${p.score - 5})">-5</button>
      </td>
    </tr>
  `).join('');
}

async function changeScore(userId, newScore) {
  if (newScore < 0) newScore = 0;

  const { error } = await supabase
    .from('profiles')
    .update({ score: newScore })
    .eq('id', userId);

  if (!error) {
    loadAdminPanel();
    if (userId === currentUser.id) {
      document.getElementById('nav-user-score').innerText = newScore;
    }
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

initDashboard();
