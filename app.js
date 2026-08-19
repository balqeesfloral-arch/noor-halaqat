const SUPABASE_URL = "https://mdkhklotknuseilyrvqe.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_bcUxs6kzHTz4nSli1l3w1A_E1tr8HOE";

let supabaseClient = null;

const state = {
  role: null,
  profile: null
};

function toast(message) {
  document.querySelector(".toast")?.remove();

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 2500);
}

function initSupabase() {
  if (!window.supabase) {
    toast("تعذر تحميل نظام الاتصال");
    console.error("Supabase library was not loaded.");
    return false;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  return true;
}

function login() {
  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="login-box">

        <div class="login-logo">
          <div class="mark">ن</div>

          <h1>نور</h1>

          <p class="muted">
            نظام إدارة حلقات تحفيظ القرآن الكريم
          </p>
        </div>

        <div class="role-tabs">

          <button
            class="active"
            onclick="selectRole(this,'supervisor')">
            مشرف
          </button>

          <button
            onclick="selectRole(this,'teacher')">
            معلم
          </button>

          <button
            onclick="selectRole(this,'student')">
            طالب
          </button>

        </div>

        <div class="field">
          <label>البريد الإلكتروني</label>

          <input
            id="loginEmail"
            type="email"
            placeholder="أدخل البريد الإلكتروني"
            autocomplete="email">
        </div>

        <div class="field">
          <label>كلمة المرور</label>

          <input
            id="loginPassword"
            type="password"
            placeholder="أدخل كلمة المرور"
            autocomplete="current-password">
        </div>

        <button
          class="btn"
          style="width:100%"
          onclick="doLogin()">
          تسجيل الدخول
        </button>

        <p
          class="muted"
          style="text-align:center;margin-top:15px">
          نظام نور لإدارة حلقات التحفيظ
        </p>

      </div>
    </div>
  `;
}

function selectRole(button, role) {
  document
    .querySelectorAll(".role-tabs button")
    .forEach(btn => btn.classList.remove("active"));

  button.classList.add("active");

  state.role = role;
}

async function doLogin() {
  const email =
    document.getElementById("loginEmail")?.value.trim();

  const password =
    document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    toast("أدخل البريد الإلكتروني وكلمة المرور");
    return;
  }

  if (!supabaseClient) {
    toast("الاتصال بقاعدة البيانات غير جاهز");
    return;
  }

  const button =
    document.querySelector(".login-box .btn");

  if (button) {
    button.disabled = true;
    button.textContent = "جاري الدخول...";
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error(error);

    toast("بيانات الدخول غير صحيحة");

    if (button) {
      button.disabled = false;
      button.textContent = "تسجيل الدخول";
    }

    return;
  }

  if (!data?.user) {
    toast("تعذر تسجيل الدخول");

    if (button) {
      button.disabled = false;
      button.textContent = "تسجيل الدخول";
    }

    return;
  }

  await loadProfile(data.user.id);
}

async function loadProfile(userId) {
  const { data, error } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

  if (error || !data) {
    console.error(error);

    await supabaseClient.auth.signOut();

    toast("لم يتم العثور على بيانات الحساب");
    login();

    return;
  }

  state.profile = data;
  state.role = data.role;

  if (data.role === "supervisor") {
    showSupervisorHome();
    return;
  }

  if (data.role === "teacher") {
    showTeacherHome();
    return;
  }

  if (data.role === "student") {
    showStudentHome();
    return;
  }

  await supabaseClient.auth.signOut();

  toast("نوع الحساب غير معروف");
  login();
}

function baseShell(content) {
  return `
    <div class="shell">

      <header class="top">

        <div class="brand">
          <div class="mark">ن</div>

          <span>نور</span>

          <span class="muted">
            حلقات التحفيظ
          </span>
        </div>

        <div class="top-actions">

          <button
            class="btn light"
            onclick="logout()">
            تسجيل الخروج
          </button>

        </div>

      </header>

      <main>
        ${content}
      </main>

    </div>
  `;
}

function showSupervisorHome() {
  const name =
    state.profile?.full_name || "المشرف";

  document.getElementById("app").innerHTML =
    baseShell(`
      <section class="hero">

        <div>

          <h1>
            مرحبًا بك يا ${escapeHtml(name)}
          </h1>

          <p>
            لوحة المشرف في نظام نور
          </p>

        </div>

      </section>

      <div class="grid">

        <div class="stat">
          <small>نوع الحساب</small>
          <strong>مشرف</strong>
        </div>

        <div class="stat">
          <small>حالة الحساب</small>
          <strong>
            ${state.profile.is_active ? "نشط" : "غير نشط"}
          </strong>
        </div>

      </div>

      <div class="card">

        <h2>
          تم تسجيل الدخول بنجاح 🎉
        </h2>

        <p class="muted">
          الاتصال بقاعدة بيانات نور يعمل.
        </p>

      </div>
    `);
}

function showTeacherHome() {
  const name =
    state.profile?.full_name || "المعلم";

  document.getElementById("app").innerHTML =
    baseShell(`
      <section class="hero">

        <div>

          <h1>
            مرحبًا بك يا ${escapeHtml(name)}
          </h1>

          <p>
            لوحة المعلم
          </p>

        </div>

      </section>

      <div class="card">

        <h2>
          لوحة المعلم
        </h2>

        <p class="muted">
          سيتم تجهيز صلاحيات المعلم في الخطوات القادمة.
        </p>

      </div>
    `);
}

function showStudentHome() {
  const name =
    state.profile?.full_name || "الطالب";

  document.getElementById("app").innerHTML =
    baseShell(`
      <section class="hero">

        <div>

          <h1>
            مرحبًا بك يا ${escapeHtml(name)}
          </h1>

          <p>
            لوحة الطالب
          </p>

        </div>

      </section>

      <div class="card">

        <h2>
          لوحة الطالب
        </h2>

        <p class="muted">
          سيتم تجهيز لوحة الطالب في الخطوات القادمة.
        </p>

      </div>
    `);
}

async function logout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  state.role = null;
  state.profile = null;

  login();
  toast("تم تسجيل الخروج");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function startApp() {
  if (!initSupabase()) {
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    await loadProfile(session.user.id);
  } else {
    login();
  }
}

startApp();
