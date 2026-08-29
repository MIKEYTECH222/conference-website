// استبدل بالقيم الخاصة بمشروعك في Supabase
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let userProfile = null;

// التحقق من تسجيل الدخول فور فتح الصفحة
async function initDashboard() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // إرجاع للمستخدم لصفحة الدخول لو لم يكن مسجلاً
    window.location.href = "index.html";
    return;
  }

  currentUser = session.user;
  await fetchUserProfile();
  loadLeaderboard();
}

// جلب بيانات بروفايل المستخدم الحالي
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

  // إظهار تبويبة الهوست فقط إذا كان المستخدم أدمن
  if (userProfile.role === 'admin') {
    document.getElementById('admin-tab').classList.remove('hidden');
  }
}

// التنقل بين الأقسام
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.remove('hidden');
  btnElement.classList.add('active');

  if (tabId === 'leaderboard') loadLeaderboard();
  if (tabId === 'admin') loadAdminPanel();
}

// تحميل وترتيب الليدربورد
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

// تحميل لوحة الهوست لتعديل السكور
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

// تعديل النقاط من الهوست
async function changeScore(userId, newScore) {
  if (newScore < 0) newScore = 0;

  const { error } = await supabase
    .from('profiles')
    .update({ score: newScore })
    .eq('id', userId);

  if (!error) {
    loadAdminPanel();
    // تحديث الهيدر لو الأدمن بيعدل لنفسه
    if (userId === currentUser.id) {
      document.getElementById('nav-user-score').innerText = newScore;
    }
  }
}

// تسجيل الخروج
async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// بدء التشغيل
initDashboard();
