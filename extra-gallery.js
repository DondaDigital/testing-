/* TEMNAK – EXTRA GALLERY. Načítá se po hlavním skriptu (defer). */
(function(){
"use strict";

/* ============ UPRAVTE ZDE ============
   file = přesný název souboru v repozitáři (vedle index.html).
   pid  = id produktu v PRODUCTS (index.html) – odtud se bere název, cena i okno s velikostmi.
   Pořadí pid je předpoklad: 1 a 2 jsou mikiny, 3 a 4 trička (jako kategorie v PRODUCTS). Změníte-li pořadí, upravte jen pid. */
const XG_ITEMS=[
 {pid:1,file:"Minimalist bílá mikina TEMNAK.png",
  kind:{cs:"Mikina · bílá",en:"Hoodie · white"},alt:{cs:"Bílá mikina TEMNAK na ramínku",en:"White TEMNAK hoodie on a hanger"}},
 {pid:2,file:"Minimalist černá mikina TEMNAK.png",
  kind:{cs:"Mikina · černá",en:"Hoodie · black"},alt:{cs:"Černá mikina TEMNAK na ramínku",en:"Black TEMNAK hoodie on a hanger"}},
 {pid:3,file:"Minimalist tričko TEMNAK na ramínku.png",
  kind:{cs:"Tričko · bílé",en:"T-shirt · white"},alt:{cs:"Bílé tričko TEMNAK na ramínku",en:"White TEMNAK t-shirt on a hanger"}},
 {pid:4,file:"Minimalistické černé tričko TEMNAK.png",
  kind:{cs:"Tričko · černé",en:"T-shirt · black"},alt:{cs:"Černé tričko TEMNAK na ramínku",en:"Black TEMNAK t-shirt on a hanger"}}
];
const XGT={
 cs:{close:"Zavřít",closeAria:"Zavřít galerii",hint:"Táhni do stran · klepni na kousek",view:"Zobrazit",buy:"Vybrat velikost",
  backRack:"Zpět do showroomu",prev:"Předchozí kousek",next:"Další kousek",soon:"Připravujeme",empty:"Zatím tu nic nevisí."},
 en:{close:"Close",closeAria:"Close gallery",hint:"Swipe sideways · tap an item",view:"View",buy:"Choose size",
  backRack:"Back to the showroom",prev:"Previous item",next:"Next item",soon:"Coming soon",empty:"Nothing is hanging here yet."}
};
/* ===================================== */

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$("#xg"),rack=$("#xgRack");
if(!root||!rack)return;
const cap=$("#xgCap"),detail=$("#xgDetail"),dimg=$("#xgDImg"),dimgEl=$("#xgDImgEl");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const lg=()=>document.documentElement.lang==="en"?"en":"cs";
const tx=k=>XGT[lg()][k];
const L=o=>o&&typeof o==="object"?(o[lg()]??o.cs??""):(o??"");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Názvy souborů v repozitáři jsou uložené s rozloženou diakritikou (NFD). Zkusí se NFD, při chybě i složený tvar (NFC). */
const src=f=>encodeURI(f.normalize("NFD"));
const srcAlt=f=>encodeURI(f.normalize("NFC"));
const ONERR="if(!this.dataset.f){this.dataset.f=1;this.src=this.dataset.alt}";

let items=[],active=0,idx=-1,pushed=false,opener=null,moved=false,ptype="mouse",raf=0;

function list(){
  const P=typeof PRODUCTS!=="undefined"?PRODUCTS:[];
  return XG_ITEMS.map(x=>({...x,id:String(x.pid),p:P.find(p=>p.id===x.pid)||null}));
}
const nameOf=it=>it.p?L(it.p.name):L(it.kind);
const priceOf=it=>it.p&&it.p.price>0&&typeof money==="function"?money(it.p.price):tx("soon");
const imgTag=(it,i,cls)=>`<img${cls?` class="${cls}"`:""} src="${src(it.file)}" data-alt="${esc(srcAlt(it.file))}" onerror="${ONERR}" alt="${esc(L(it.alt))}" width="1145" height="1374" decoding="async" draggable="false"${i>0?' loading="lazy"':""}>`;

/* ---------- showroom ---------- */
function renderRack(){
  items=list();
  const sl=rack.scrollLeft;
  if(!items.length){rack.innerHTML=`<p class="xg-empty">${esc(tx("empty"))}</p>`;cap.style.visibility="hidden";return}
  cap.style.visibility="";
  active=Math.max(0,Math.min(active,items.length-1));
  rack.innerHTML=`<div class="xg-track">`+items.map((it,i)=>
    `<button type="button" class="xg-it" data-i="${i}" aria-label="${esc(nameOf(it)+", "+L(it.kind)+", "+priceOf(it))}" data-testid="xg-item-${it.id}"><span class="xg-ph">${imgTag(it,i)}</span></button>`).join("")+`</div>`;
  rack.scrollLeft=sl;depth();
}
function setActive(i){
  if(!items[i])return;
  const changed=i!==active||!$("#xgCapName").textContent;active=i;
  const it=items[i];
  $("#xgCapName").textContent=nameOf(it);$("#xgCapKind").textContent=L(it.kind);$("#xgCapPrice").textContent=priceOf(it);
  if(changed){cap.classList.remove("xgcap-in");void cap.offsetWidth;cap.classList.add("xgcap-in")}
}
function scrollToIndex(i,smooth){
  const n=$(`.xg-it[data-i="${i}"]`,rack);if(!n)return;
  rack.scrollTo({left:n.offsetLeft-(rack.clientWidth-n.offsetWidth)/2,behavior:smooth&&!reduce?"smooth":"auto"});
}
/* hloubka: kousky ve středu jsou plné, okolní se mírně zmenší, natočí a ztlumí */
function depth(){
  raf=0;
  const rc=rack.getBoundingClientRect(),cx=rc.left+rc.width/2,nodes=$$(".xg-it",rack);
  if(!nodes.length)return;
  let best=0,bd=1e9;
  nodes.forEach((n,i)=>{
    const r=n.getBoundingClientRect(),dist=r.left+r.width/2-cx,d=Math.max(-1.4,Math.min(1.4,dist/(r.width*1.1)));
    const a=Math.min(Math.abs(d),1),ph=n.firstElementChild;
    ph.style.setProperty("--s",reduce?1:(1-.12*a).toFixed(3));
    ph.style.setProperty("--r",reduce?"0deg":(-d*14).toFixed(2)+"deg");
    ph.style.setProperty("--o",(1-.5*a).toFixed(3));
    if(Math.abs(dist)<bd){bd=Math.abs(dist);best=i}
  });
  if(best!==active)setActive(best);
}
const queueDepth=()=>{if(!raf)raf=requestAnimationFrame(depth)};

/* ---------- detail ---------- */
function renderDetail(){
  const it=items[idx];if(!it)return;const n=items.length;
  dimgEl.src=src(it.file);dimgEl.dataset.alt=srcAlt(it.file);delete dimgEl.dataset.f;
  dimgEl.alt=L(it.alt);
  $("#xgName").textContent=nameOf(it);$("#xgKind").textContent=L(it.kind);$("#xgPrice").textContent=priceOf(it);
  $("#xgBuy").hidden=!it.p||typeof openModal!=="function";
  $("#xgPrev").hidden=$("#xgNext").hidden=n<2;
  dimg.classList.remove("zoom");
}
function nav(d){
  const n=items.length;if(n<2)return;
  dimg.style.setProperty("--sx",d>0?"30px":"-30px");
  idx=(idx+d+n)%n;active=idx;
  history.replaceState(null,"",location.pathname+location.search+"#extra-gallery/"+items[idx].id);
  renderDetail();dimg.classList.remove("swap");void dimg.offsetWidth;dimg.classList.add("swap");
}

/* ---------- zobrazení / skrytí ---------- */
function applyT(){
  $$("#xg [data-xgt]").forEach(el=>{el.textContent=tx(el.dataset.xgt)});
  $("#xgClose").setAttribute("aria-label",tx("closeAria"));
  [["#xgPrev","prev"],["#xgNext","next"],["#xgSPrev","prev"],["#xgSNext","next"]].forEach(([s,k])=>$(s).setAttribute("aria-label",tx(k)));
}
function openUI(){
  if(root.classList.contains("on"))return;
  opener=document.activeElement;
  root.classList.add("on");root.setAttribute("aria-hidden","false");
  document.documentElement.classList.add("xg-lock");
  requestAnimationFrame(()=>{scrollToIndex(active,false);depth()});
  setTimeout(()=>$("#xgClose").focus({preventScroll:true}),80);
}
function closeUI(){
  if(!root.classList.contains("on"))return;
  root.classList.remove("on","pv");root.setAttribute("aria-hidden","true");
  document.documentElement.classList.remove("xg-lock");
  detail.hidden=true;idx=-1;pushed=false;
  if(opener&&opener.focus)try{opener.focus({preventScroll:true})}catch(e){}
}
function showStage(){
  const had=root.classList.contains("pv")?idx:-1;
  root.classList.remove("pv");detail.hidden=true;pushed=false;
  if(had>=0){
    active=had;idx=-1;setActive(had);
    requestAnimationFrame(()=>{scrollToIndex(had,false);depth();const b=$(`.xg-it[data-i="${had}"]`,rack);b&&b.focus({preventScroll:true})});
  }
  idx=-1;
}
function showDetail(i){
  if(root.classList.contains("pv")&&idx===i)return;
  idx=i;active=i;renderDetail();
  root.classList.add("pv");detail.hidden=false;
  dimg.classList.remove("swap");void dimg.offsetWidth;
  setTimeout(()=>$("#xgBack").focus({preventScroll:true}),60);
}
function sync(){
  const h=location.hash;
  if(h==="#extra-gallery"||h.indexOf("#extra-gallery/")===0){
    openUI();
    const id=h.split("/")[1]||"",i=id?items.findIndex(x=>x.id===id):-1;
    i>=0?showDetail(i):showStage();
  }else closeUI();
}
function closeGallery(){history.replaceState(null,"",location.pathname+location.search);sync()}
function goBack(){
  if(pushed)history.back();
  else{history.replaceState(null,"",location.pathname+location.search+"#extra-gallery");sync()}
}
function openDetail(id){pushed=true;location.hash="#extra-gallery/"+id}
function step(d){
  scrollToIndex(Math.max(0,Math.min(items.length-1,active+d)),true);
}

/* ---------- události ---------- */
$("#xgClose").addEventListener("click",closeGallery);
$("#xgBack").addEventListener("click",goBack);
$("#xgPrev").addEventListener("click",()=>nav(-1));
$("#xgNext").addEventListener("click",()=>nav(1));
$("#xgSPrev").addEventListener("click",()=>step(-1));
$("#xgSNext").addEventListener("click",()=>step(1));
$("#xgCapBtn").addEventListener("click",()=>{if(items[active])openDetail(items[active].id)});
$("#xgBuy").addEventListener("click",()=>{
  const it=items[idx];if(!it||!it.p)return;
  closeGallery();
  if(typeof openModal==="function")setTimeout(()=>openModal(it.pid),90);
});
/* zoom v detailu (myš) – klik přiblíží, pohyb myši posouvá výřez */
dimg.addEventListener("pointermove",e=>{
  if(e.pointerType!=="mouse")return;
  const r=dimg.getBoundingClientRect();
  dimg.style.setProperty("--ox",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
  dimg.style.setProperty("--oy",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
});
dimg.addEventListener("click",e=>{
  if(ptype!=="mouse")return;
  const r=dimg.getBoundingClientRect();
  dimg.style.setProperty("--ox",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
  dimg.style.setProperty("--oy",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
  dimg.classList.toggle("zoom");
});

/* showroom: dotyk = nativní swipe, myš = tažení a kolečko */
rack.addEventListener("scroll",queueDepth,{passive:true});
window.addEventListener("resize",()=>{if(root.classList.contains("on")){scrollToIndex(active,false);queueDepth()}});
let downActive=-1;
rack.addEventListener("pointerdown",e=>{ptype=e.pointerType;downActive=active});
let down=false,sx=0,sl=0;
rack.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0)return;down=true;moved=false;sx=e.clientX;sl=rack.scrollLeft});
rack.addEventListener("pointermove",e=>{
  if(!down)return;const dx=e.clientX-sx;
  if(!moved&&Math.abs(dx)>6){moved=true;rack.classList.add("drag");try{rack.setPointerCapture(e.pointerId)}catch(_){}}
  if(moved)rack.scrollLeft=sl-dx;
});
["pointerup","pointercancel"].forEach(ev=>rack.addEventListener(ev,()=>{
  if(!down)return;down=false;
  if(moved){rack.classList.remove("drag");scrollToIndex(active,true)}
  setTimeout(()=>{moved=false},0);
}));
rack.addEventListener("click",e=>{
  if(moved){moved=false;e.preventDefault();e.stopPropagation();return}
  const b=e.target.closest(".xg-it");if(!b)return;
  const i=+b.dataset.i;
  if(ptype==="touch"&&e.detail!==0&&i!==downActive)scrollToIndex(i,true);  /* dotyk: 1. klepnutí vycentruje, 2. otevře detail */
  else openDetail(items[i].id);
},true);
rack.addEventListener("focusin",e=>{const b=e.target.closest(".xg-it");if(b&&+b.dataset.i!==active){setActive(+b.dataset.i)}});
let wheelAt=0;
rack.addEventListener("wheel",e=>{
  if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;           /* vodorovný trackpad necháme nativně */
  e.preventDefault();
  const now=Date.now();if(now-wheelAt<420||Math.abs(e.deltaY)<8)return;
  wheelAt=now;step(e.deltaY>0?1:-1);
},{passive:false});
window.addEventListener("hashchange",sync);

/* swipe v detailu */
let tx0=0,ty0=0;
detail.addEventListener("touchstart",e=>{tx0=e.touches[0].clientX;ty0=e.touches[0].clientY},{passive:true});
detail.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-tx0,dy=e.changedTouches[0].clientY-ty0;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)nav(dx<0?1:-1);
});

document.addEventListener("keydown",e=>{
  if(!root.classList.contains("on"))return;
  const pv=root.classList.contains("pv");
  if(e.key==="Escape"){pv?goBack():closeGallery();return}
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
    const d=e.key==="ArrowRight"?1:-1;
    if(pv){nav(d);e.preventDefault()}
    else if(items.length){step(d);e.preventDefault()}
  }
  if(e.key==="Tab"){
    const f=$$("button:not([disabled])",root).filter(x=>!x.hidden&&x.offsetParent!==null&&getComputedStyle(x).visibility!=="hidden"&&getComputedStyle(x).display!=="none");
    if(!f.length)return;
    const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===a||!root.contains(document.activeElement))){e.preventDefault();z.focus()}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  }
});

/* přepočet při změně jazyka / měny (hlavní skript volá applyLang a renderAll) */
function refresh(){
  applyT();renderRack();setActive(active);
  if(root.classList.contains("pv")&&idx>=0)renderDetail();
}
["applyLang","renderAll"].forEach(n=>{
  const f=window[n];
  if(typeof f==="function")window[n]=function(){const r=f.apply(this,arguments);try{refresh()}catch(e){console.error(e)}return r};
});

refresh();
sync();
})();
