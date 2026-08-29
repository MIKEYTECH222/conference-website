// 1. تسجيل حساب جديد
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const btn = document.getElementById('reg-btn');

  btn.disabled = true;
  btn.innerText = "جاري إنشاء الحساب...";

  // إنشاء الحساب في Supabase
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("خطأ في التسجيل: " + error.message);
    btn.disabled = false;
    btn.innerText = "إنشاء الحساب";
    return;
  }

  // إضافة بيانات المستخدم في جدول profiles
  if (data.user) {
    await supabase.from('profiles').insert([
      { id: data.user.id, full_name: name, score: 0, role: 'user' }
    ]);
  }

  // التحويل المباشر لصفحة الداشبورد
  window.location.assign("./dashboard.html");
}

// 2. تسجيل الدخول
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.innerText = "جاري الدخول...";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("بيانات الدخول غير صحيحة");
    btn.disabled = false;
    btn.innerText = "دخول";
  } else {
    // التحويل المباشر لصفحة الداشبورد
    window.location.assign("./dashboard.html");
  }
}
