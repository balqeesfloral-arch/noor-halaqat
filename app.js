const students=[
{name:"محمد أحمد",age:12,school:"سادس ابتدائي",type:"القرآن الكريم",hall:"النور",points:580},
{name:"عبدالله خالد",age:14,school:"ثالث متوسط",type:"القرآن الكريم",hall:"الفرقان",points:550},
{name:"سعد علي",age:10,school:"رابع ابتدائي",type:"القاعدة النورانية",hall:"الهدى",points:520},
{name:"أحمد محمد",age:16,school:"ثاني ثانوي",type:"القرآن الكريم",hall:"النور",points:510},
{name:"خالد سالم",age:13,school:"ثاني متوسط",type:"القرآن الكريم",hall:"الفرقان",points:495},
{name:"عمر حسن",age:11,school:"خامس ابتدائي",type:"القرآن الكريم",hall:"الهدى",points:480},
{name:"يوسف سعد",age:15,school:"أول ثانوي",type:"القرآن الكريم",hall:"النور",points:460}
];

const titles={dashboard:"نظرة عامة",students:"الطلاب",attendance:"التحضير",points:"النقاط",competitions:"المسابقات",reports:"التقارير",hall:"لوحة الشرف"};
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));

function showView(id){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
 document.getElementById(id).classList.add("active-view");
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
 document.getElementById("pageTitle").textContent=titles[id];
 if(id==="students")renderStudents();
 if(id==="hall")renderPodium();
}
function renderStudents(){
 const q=(document.getElementById("studentSearch")?.value||"").trim();
 const body=document.getElementById("studentsBody");
 if(!body)return;
 body.innerHTML=students.filter(s=>s.name.includes(q)).map(s=>`<tr><td><b>${s.name}</b></td><td>${s.age}</td><td>${s.school}</td><td>${s.type}</td><td>${s.hall}</td><td><b>${s.points}</b></td><td><span class="status active">مستمر</span></td></tr>`).join("");
}
function renderTop(){
 const box=document.getElementById("topStudents");
 [...students].sort((a,b)=>b.points-a.points).slice(0,5).forEach((s,i)=>{
   box.insertAdjacentHTML("beforeend",`<div class="student-row"><div class="rank-avatar">${i+1}</div><div><b>${s.name}</b><small>${s.hall}</small></div><span class="points-badge">${s.points} نقطة</span></div>`);
 });
}
function renderPodium(){
 const sorted=[...students].sort((a,b)=>b.points-a.points);
 const html=`<div class="podium"><div class="podium-card"><div class="podium-medal">🥈</div><strong>${sorted[1].name}</strong><span>${sorted[1].points} نقطة</span></div><div class="podium-card first"><div class="podium-medal">🥇</div><strong>${sorted[0].name}</strong><span>${sorted[0].points} نقطة</span></div><div class="podium-card"><div class="podium-medal">🥉</div><strong>${sorted[2].name}</strong><span>${sorted[2].points} نقطة</span></div></div>`;
 document.getElementById("podium").innerHTML=html;
}
function renderAttendance(){
 const box=document.getElementById("attendanceList");
 students.forEach(s=>box.insertAdjacentHTML("beforeend",`<div class="attendance-row"><b>${s.name}</b><div class="attendance-actions"><button class="selected">✓ حاضر</button><button>غياب</button><button>تأخر</button></div></div>`));
}
function openStudentModal(){document.getElementById("studentModal").classList.add("open")}
function openCompetitionModal(){document.getElementById("competitionModal").classList.add("open")}
function closeModal(id){document.getElementById(id).classList.remove("open")}
function addStudent(){
 const name=document.getElementById("newName").value.trim();
 const age=Number(document.getElementById("newAge").value)||0;
 if(!name)return alert("اكتب اسم الطالب");
 students.push({name,age,school:"آخر",type:"القرآن الكريم",hall:"النور",points:0});
 closeModal("studentModal");renderStudents();renderTop();
 document.getElementById("newName").value="";document.getElementById("newAge").value="";
 alert("تمت إضافة الطالب بنجاح");
}
document.querySelectorAll(".point-buttons button").forEach(btn=>btn.addEventListener("click",()=>{
 const pts=Number(btn.dataset.points), name=document.getElementById("pointStudent").value;
 const s=students.find(x=>x.name===name); if(s)s.points+=pts;
 alert(`تم تسجيل ${pts} نقطة لـ ${name}`);
 renderTop();renderPodium();
}));
function openHall(){
 document.getElementById("tvMode").classList.add("open");
 const sorted=[...students].sort((a,b)=>b.points-a.points);
 const p=document.getElementById("tvPodium");
 p.className="tv-podium";
 p.innerHTML=sorted.slice(0,3).map((s,i)=>`<div class="tv-card ${i===0?"first":""}"><div class="medal">${["🥇","🥈","🥉"][i]}</div><strong>${s.name}</strong><div>${s.hall}</div><div class="tv-points">${s.points} نقطة</div></div>`).join("");
 document.getElementById("tvRows").className="tv-rows";
 document.getElementById("tvRows").innerHTML=sorted.slice(3,10).map((s,i)=>`<div class="tv-row"><b>${i+4}</b><span>${s.name}</span><span>${s.hall}</span><b>${s.points}</b></div>`).join("");
}
function closeTv(){document.getElementById("tvMode").classList.remove("open")}
renderTop();renderStudents();renderAttendance();renderPodium();