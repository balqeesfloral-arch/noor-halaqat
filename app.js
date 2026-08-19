const SUPABASE_URL = "https://mdkhklotknuseilyrvqe.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_bcUxs6kzHTz4nSli1l3w1A_E1tr8HOE";

let supabaseClient = null;

const state = {
  role: null,
  profile: null,
  page: "dashboard"
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

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error(error);
    toast("بيانات الدخول غير صحيحة");
    return;
  }

  if (!data?.user) {
    toast("تعذر تسجيل الدخول");
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
    state.page = "dashboard";
    await renderSupervisor();
    return;
  }

  if (data.role === "teacher") {
    showSimpleRolePage("المعلم");
    return;
  }

  if (data.role === "student") {
    showSimpleRolePage("الطالب");
    return;
  }

  toast("نوع الحساب غير معروف");
}

const navItems = [
  ["dashboard", "الرئيسية"],
  ["halaqat", "الحلقات"],
  ["teachers", "المعلمون"],
  ["students", "الطلاب"],
  ["points", "النقاط"],
  ["attendance", "التحضير والغياب"],
  ["competitions", "المسابقات"],
  ["badges", "الأوسمة"],
  ["reports", "التقارير"],
  ["settings", "الإعدادات"]
];

function supervisorShell(content) {
  return `
    <div class="shell">

      <header class="top">

        <div class="brand">
          <div class="mark">ن</div>
          <span>نور</span>
          <span class="muted">حلقات التحفيظ</span>
        </div>

        <div class="top-actions">
          <button
            class="btn light"
            onclick="logout()">
            تسجيل الخروج
          </button>
        </div>

      </header>

      <div class="layout">

        <aside>
          <div class="nav">

            ${navItems.map(item => `
              <button
                class="${state.page === item[0] ? "active" : ""}"
                onclick="goSupervisorPage('${item[0]}')">
                ${item[1]}
              </button>
            `).join("")}

          </div>
        </aside>

        <main>
          ${content}
        </main>

      </div>

    </div>
  `;
}

async function goSupervisorPage(page) {
  state.page = page;

  if (page === "dashboard") {
    await renderSupervisor();
    return;
  }

  const titles = {
    halaqat: "الحلقات",
    teachers: "المعلمون",
    students: "الطلاب",
    points: "النقاط",
    attendance: "التحضير والغياب",
    competitions: "المسابقات",
    badges: "الأوسمة",
    reports: "التقارير",
    settings: "الإعدادات"
  };

  document.getElementById("app").innerHTML =
    supervisorShell(`
      <div class="section-title">
        <h2>${titles[page]}</h2>
      </div>

      <div class="card">
        <h2>${titles[page]}</h2>

        <p class="muted">
          هذا القسم سيتم تجهيزه وربطه بقاعدة البيانات في الخطوة القادمة.
        </p>
      </div>
    `);
}

async function getCount(table) {
  const { count, error } =
    await supabaseClient
      .from(table)
      .select("id", {
        count: "exact",
        head: true
      });

  if (error) {
    console.error(`Count error: ${table}`, error);
    return 0;
  }

  return count || 0;
}

async function renderSupervisor() {
  document.getElementById("app").innerHTML =
    supervisorShell(`
      <div class="card">
        <h2>جاري تحميل لوحة المشرف...</h2>
        <p class="muted">لحظات...</p>
      </div>
    `);

  const [
    studentsCount,
    halaqatCount,
    competitionsCount
  ] = await Promise.all([
    getCount("students"),
    getCount("halaqat"),
    getCount("competitions")
  ]);

  const teachersResult =
    await supabaseClient
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("role", "teacher");

  const teachersCount =
    teachersResult.error
      ? 0
      : (teachersResult.count || 0);

  const name =
    state.profile?.full_name || "المشرف";

  document.getElementById("app").innerHTML =
    supervisorShell(`
      <section class="hero">

        <div>
          <h1>مرحبًا بك يا ${escapeHtml(name)}</h1>

          <p>
            لوحة التحكم الرئيسية لنظام نور
          </p>
        </div>

        <button
          class="btn gold"
          onclick="goSupervisorPage('students')">
          إدارة الطلاب
        </button>

      </section>

      <div class="grid">

        <div class="stat">
          <small>إجمالي الطلاب</small>
          <strong>${studentsCount}</strong>
        </div>

        <div class="stat">
          <small>الحلقات</small>
          <strong>${halaqatCount}</strong>
        </div>

        <div class="stat">
          <small>المعلمون</small>
          <strong>${teachersCount}</strong>
        </div>

        <div class="stat">
          <small>المسابقات</small>
          <strong>${competitionsCount}</strong>
        </div>

      </div>

      <div class="section-title">
        <h2>الوصول السريع</h2>
      </div>

      <div class="cards">

        <div class="card">
          <h3>👨‍🎓 الطلاب</h3>
          <p class="muted">
            إدارة الطلاب وبياناتهم وحلقاتهم.
          </p>

          <button
            class="btn"
            onclick="goSupervisorPage('students')">
            فتح الطلاب
          </button>
        </div>

        <div class="card">
          <h3>📚 الحلقات</h3>
          <p class="muted">
            إدارة الحلقات وربط المعلمين بها.
          </p>

          <button
            class="btn"
            onclick="goSupervisorPage('halaqat')">
            فتح الحلقات
          </button>
        </div>

        <div class="card">
          <h3>🏆 المسابقات</h3>
          <p class="muted">
            إدارة المسابقات والنتائج والترتيب.
          </p>

          <button
            class="btn"
            onclick="goSupervisorPage('competitions')">
            فتح المسابقات
          </button>
        </div>

      </div>
    `);
}

function showSimpleRolePage(roleName) {
  document.getElementById("app").innerHTML =
    supervisorShell(`
      <section class="hero">
        <div>
          <h1>مرحبًا بك</h1>
          <p>لوحة ${roleName}</p>
        </div>
      </section>

      <div class="card">
        <h2>تم تسجيل الدخول بنجاح 🎉</h2>
        <p class="muted">
          سيتم تجهيز لوحة ${roleName} في خطوات لاحقة.
        </p>
      </div>
    `);
}

async function logout() {
  await supabaseClient.auth.signOut();

  state.role = null;
  state.profile = null;
  state.page = "dashboard";

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
  if (!initSupabase()) return;

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
