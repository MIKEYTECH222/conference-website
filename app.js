// استبدل بالقيم الخاصة بمشروعك من Supabase
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// التنقل بين التبويبات
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');
  clearMessage();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
  }
}

// إنشاء حساب جديد
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const btn = document.getElementById('reg-btn');

  btn.disabled = true;
  btn.innerText = "جاري التسجيل...";
  clearMessage();

  // 1. التسجيل في نظام الحسابات
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    showMessage(error.message, 'error');
    btn.disabled = false;
    btn.innerText = "إنشاء الحساب";
    return;
  }

  // 2. إضافة اسم الشخص والسكور في جدول profiles
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: data.user.id,
        full_name: name,
        score: 0,
        role: 'user'
      }
    ]);

    if (profileError) {
      showMessage(profileError.message, 'error');
    } else {
      showMessage("تم إنشاء الحساب بنجاح! جاري تحويلك...", 'success');
      setTimeout(() => {
        // التوجيه إلى الصفحة الرئيسية
        window.location.href = "dashboard.html";
      }, 1500);
    }
  }

  btn.disabled = false;
  btn.innerText = "إنشاء الحساب";
}

// تسجيل الدخول
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.innerText = "جاري الدخول...";
  clearMessage();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage("البريد الإلكتروني أو كلمة السر غير صحيحة", 'error');
    btn.disabled = false;
    btn.innerText = "دخول";
  } else {
    showMessage("تم تسجيل الدخول بنجاح!", 'success');
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  }
}

function showMessage(msg, type) {
  const box = document.getElementById('auth-message');
  box.innerText = msg;
  box.className = `message ${type}`;
}

function clearMessage() {
  const box = document.getElementById('auth-message');
  box.className = 'message';
  box.innerText = '';
}
