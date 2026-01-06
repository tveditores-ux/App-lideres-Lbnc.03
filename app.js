const S={key:k=>`vida_${k}`,get(k,f){try{return JSON.parse(localStorage.getItem(this.key(k)))??f}catch{return f}},set(k,v){localStorage.setItem(this.key(k),JSON.stringify(v));toast("Guardado")}};
let toastTimer=null;function toast(m){const t=document.querySelector(".toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),1500)}
function show(p){document.querySelectorAll(".view").forEach(v=>v.classList.add("hide"));document.getElementById(p).classList.remove("hide");document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));document.querySelector(`.tab[data-target='${p}']`).classList.add("active");history.replaceState({}, "", `#${p}`)}
window.addEventListener("load",()=>{const h=location.hash?.replace("#","")||"home";show(h);if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js")}
initLessons();initBitacora();initTasks();initReminders();initFs();initRecursos();initLogos();initLayoutSwitch()});
document.addEventListener("click",e=>{const tab=e.target.closest(".tab");if(tab){e.preventDefault();show(tab.dataset.target)}});

/* Layout switcher */
function initLayoutSwitch(){
  const saved=S.get("layout","auto");
  if(saved!=="auto"){document.body.setAttribute("data-layout",saved)}
  document.querySelectorAll(".layout-switch button[data-layout]").forEach(b=>{
    b.addEventListener("click",()=>{
      const mode=b.getAttribute("data-layout");
      document.body.setAttribute("data-layout",mode);
      S.set("layout",mode);
      toast(`Vista: ${mode}`);
    });
  });
}

/* Font size controls */
function initFs(){
  const minus=document.getElementById("fs_minus");
  const plus=document.getElementById("fs_plus");
  function set(fs){document.documentElement.style.setProperty("--fs",fs);S.set("fs",fs)}
  let fs=S.get("fs",1);
  document.documentElement.style.setProperty("--fs",fs);
  minus.addEventListener("click",()=>{fs=Math.max(.85,fs-.05);set(fs)});
  plus.addEventListener("click",()=>{fs=Math.min(1.25,fs+.05);set(fs)});
}

function initLessons(){[1,2,3,4].forEach(w=>{const ns=`lesson_${w}`;const d=S.get(ns,{testimonios:"",lugar:"",hora:""});const t=document.getElementById(`testimonios_${w}`),l=document.getElementById(`lugar_${w}`),h=document.getElementById(`hora_${w}`);if(t)t.value=d.testimonios;if(l)l.value=d.lugar;if(h)h.value=d.hora;const b=document.getElementById(`save_${w}`);if(b){b.addEventListener("click",()=>{S.set(ns,{testimonios:t.value,lugar:l.value,hora:h.value})})}})}

const BIT_ITEMS=[
 "Fomento amistad y oración mutua entre los miembros.",
 "Mantengo el enfoque en Aprender (fe, visión, unidad).",
 "Descubro y animo los dones de cada persona.",
 "Delego pequeñas tareas para involucrar a todos.",
 "Transmito que la misión pertenece al equipo, no solo a mí.",
 "Motivo a invitar nuevos amigos y celebro sus esfuerzos.",
 "Acompaño a mi grupo en los entrenamientos de la iglesia.",
 "Oro por crecimiento espiritual y relaciones sanas."
];
function currentWeekKey(){const d=new Date(),onejan=new Date(d.getFullYear(),0,1);const week=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);return `${d.getFullYear()}-W${week}`}
function initBitacora(){const w=currentWeekKey(),store=S.get("bitacora",{}),week=store[w]||BIT_ITEMS.map(()=>({done:false}));const wrap=document.getElementById("bitacora_checks");wrap.innerHTML="";BIT_ITEMS.forEach((label,i)=>{const row=document.createElement("div");row.className="checkrow";row.innerHTML=`<input type="checkbox" id="b_${i}" ${week[i].done?"checked":""}/><label for="b_${i}" style="flex:1">${label}</label>`;wrap.appendChild(row);row.querySelector("input").addEventListener("change",e=>{week[i].done=e.target.checked;store[w]=week;S.set("bitacora",store)})});document.getElementById("bit_note").value=(S.get("bit_notes",{})[w]||"");document.getElementById("save_bit").addEventListener("click",()=>{const notes=S.get("bit_notes",{});notes[w]=document.getElementById("bit_note").value.trim();S.set("bit_notes",notes);renderHistory()});renderHistory()}
function renderHistory(){const hist=document.getElementById("bit_hist");const store=S.get("bitacora",{}),notes=S.get("bit_notes",{});const keys=Object.keys(store).sort().reverse().slice(0,8);hist.innerHTML=keys.map(k=>{const arr=store[k];const pct=Math.round(100*(arr.filter(x=>x.done).length/arr.length));const note=(notes[k]||"").replace(/</g,"&lt;");return `<div class="card"><strong>${k}</strong><div class="small">${pct}% completado — ${note||"Sin notas"}</div></div>`}).join("")||`<div class="card small">Sin histórico aún.</div>`}

const DEFAULT_TASKS=["Llamar a los miembros del grupo","Orar por ellos","Asistir a la reunión con su líder","Llenar el libro de formatos","Entregar ofrendas","Asistir al servicio de miércoles","Asistir al servicio de domingo"];
function initTasks(){let tasks=S.get("tasks",null);if(!tasks){tasks=DEFAULT_TASKS.map(t=>({title:t,done:false}));S.set("tasks",tasks)}renderTasks(tasks);document.getElementById("add_task_btn").addEventListener("click",()=>{const v=document.getElementById("add_task").value.trim();if(!v)return;tasks.push({title:v,done:false});S.set("tasks",tasks);document.getElementById("add_task").value="";renderTasks(tasks)});document.getElementById("reset_week").addEventListener("click",()=>{tasks.forEach(t=>t.done=false);S.set("tasks",tasks);renderTasks(tasks)})}
function renderTasks(tasks){const wrap=document.getElementById("tasks_list");wrap.innerHTML="";tasks.forEach((t,i)=>{const row=document.createElement("div");row.className="checkrow";row.innerHTML=`<input type="checkbox" id="t_${i}" ${t.done?"checked":""}/><label for="t_${i}" style="flex:1">${t.title}</label><button class="btn ghost" data-r="${i}" title="Eliminar">✕</button>`;wrap.appendChild(row);row.querySelector("input").addEventListener("change",e=>{t.done=e.target.checked;S.set("tasks",tasks)});row.querySelector("button").addEventListener("click",()=>{tasks.splice(i,1);S.set("tasks",tasks);renderTasks(tasks)})})}

/* Recordatorios (placeholder ligero) */
function initReminders(){
  const btn=document.getElementById("save_reminders");
  if(!btn) return;
  btn.addEventListener("click",()=>toast("Recordatorios guardados (usa notificaciones del sistema)"));
}

async function fileToDataURL(file){return await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function applyLogos(){const iglesia=S.get("logo_iglesia",null);const elI=document.getElementById("logo-iglesia");if(elI && iglesia){elI.src=iglesia}}
function initLogos(){applyLogos();const upI=document.getElementById("up_logo_iglesia"),save=document.getElementById("save_logos"),clear=document.getElementById("clear_logos");if(save){save.addEventListener("click",async()=>{try{if(upI?.files?.[0])S.set("logo_iglesia",await fileToDataURL(upI.files[0]));applyLogos();toast("Logo guardado")}catch(e){toast("No se pudo guardar el logo")}})}if(clear){clear.addEventListener("click",()=>{localStorage.removeItem(S.key("logo_iglesia"));toast("Logo eliminado")})}}
