/* TEMNAK – EXTRA GALLERY. Načítá se po hlavním skriptu (defer). */
(function(){
"use strict";

/* ============ UPRAVTE ZDE ============
   file  = vyříznutý kousek na ramínku (průhledné WebP, stejné rozměry) – leží vedle index.html.
   pid   = id produktu v PRODUCTS (index.html): odtud se bere název, cena i okno s velikostmi.
   group = kousky se stejnou skupinou se v detailu přepínají cedulkami Bílá / Černá.
   Pořadí pid je předpoklad (1+2 mikiny, 3+4 trička, vždy bílá + černá). */
const XG_ITEMS=[
 {pid:1,group:"hoodie",color:"white",file:"gal-bila-mikina.webp",
  kind:{cs:"Mikina · bílá",en:"Hoodie · white"},alt:{cs:"Bílá mikina TEMNAK na ramínku",en:"White TEMNAK hoodie on a hanger"}},
 {pid:2,group:"hoodie",color:"black",file:"gal-cerna-mikina.webp",
  kind:{cs:"Mikina · černá",en:"Hoodie · black"},alt:{cs:"Černá mikina TEMNAK na ramínku",en:"Black TEMNAK hoodie on a hanger"}},
 {pid:3,group:"tee",color:"white",file:"gal-bile-tricko.webp",
  kind:{cs:"Tričko · bílé",en:"T-shirt · white"},alt:{cs:"Bílé tričko TEMNAK na ramínku",en:"White TEMNAK t-shirt on a hanger"}},
 {pid:4,group:"tee",color:"black",file:"gal-cerne-tricko.webp",
  kind:{cs:"Tričko · černé",en:"T-shirt · black"},alt:{cs:"Černé tričko TEMNAK na ramínku",en:"Black TEMNAK t-shirt on a hanger"}}
];
const XG_START=1;   /* který kousek je na začátku vysunutý (index od 0) */
const XGT={
 cs:{close:"Zavřít",closeAria:"Zavřít galerii",hint:"Najeď na kousek · klikni pro detail",hintTouch:"Klepni na kousek · klepni znovu pro detail",view:"Zobrazit",buy:"Vybrat velikost",
  backRack:"Zpět na věšák",prev:"Předchozí",next:"Další",soon:"Připravujeme",empty:"Zatím tu nic nevisí.",white:"Bílá",black:"Černá"},
 en:{close:"Close",closeAria:"Close gallery",hint:"Hover an item · click for details",hintTouch:"Tap an item · tap again for details",view:"View",buy:"Choose size",
  backRack:"Back to the rail",prev:"Previous",next:"Next",soon:"Coming soon",empty:"Nothing is hanging here yet.",white:"White",black:"Black"}
};
/* ===================================== */

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$("#xg"),rack=$("#xgRack");
if(!root||!rack)return;
const cap=$("#xgCap"),detail=$("#xgDetail"),box=$("#xgBox"),fig=$("#xgFig");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const touchUI=matchMedia("(hover: none)").matches;
const lg=()=>document.documentElement.lang==="en"?"en":"cs";
const tx=k=>XGT[lg()][k];
const L=o=>o&&typeof o==="object"?(o[lg()]??o.cs??""):(o??"");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const src=f=>encodeURI(f);
const imgTag=(it,eager)=>`<img src="${src(it.file)}" alt="${esc(L(it.alt))}" width="900" height="1172" decoding="async" draggable="false"${eager?"":' loading="lazy"'}>`;

let items=[],groups=[],active=XG_START,gi=-1,color="white",pushed=false,opener=null,ptype="mouse",downActive=-1;

function list(){
  const P=typeof PRODUCTS!=="undefined"?PRODUCTS:[];
  const it=XG_ITEMS.map(x=>({...x,id:String(x.pid),p:P.find(p=>p.id===x.pid)||null}));
  groups=[...new Set(it.map(x=>x.group))];
  return it;
}
const nameOf=it=>it.p?L(it.p.name):L(it.kind);
const priceOf=it=>it.p&&it.p.price>0&&typeof money==="function"?money(it.p.price):tx("soon");
const variant=(g,c)=>items.find(x=>x.group===groups[g]&&x.color===c)||items.find(x=>x.group===groups[g]);

/* ---------- věšák ---------- */
function renderRack(){
  items=list();
  const sl=rack.scrollLeft;
  if(!items.length){rack.innerHTML=`<p class="xg-empty">${esc(tx("empty"))}</p>`;cap.style.visibility="hidden";return}
  cap.style.visibility="";
  active=Math.max(0,Math.min(active,items.length-1));
  rack.innerHTML=`<div class="xg-rackin"><i class="xg-brk l"></i><i class="xg-brk r"></i>`+items.map((it,i)=>
    `<button type="button" class="xg-it${i===active?" on":""}" style="--i:${i}" data-i="${i}" aria-label="${esc(nameOf(it)+", "+L(it.kind)+", "+priceOf(it))}" data-testid="xg-item-${it.id}"><span class="xg-sw"><span class="xg-gm">${imgTag(it,true)}</span></span></button>`).join("")+`</div>`;
  rack.scrollLeft=sl;
}
function setActive(i,opt){
  if(!items[i])return;
  const changed=i!==active||!$("#xgCapName").textContent,prev=active;active=i;
  const it=items[i];
  $$(".xg-it",rack).forEach((b,j)=>{
    b.classList.toggle("on",j===i);
    if(changed&&j!==i&&!reduce&&Math.abs(j-i)<=2){  /* ostatní kousky se při přehození „rozhoupou“ */
      b.style.setProperty("--n",((j<i?-1:1)*(3.4-Math.abs(j-i)))+"deg");
      b.classList.remove("nudge");void b.offsetWidth;b.classList.add("nudge");
    }
  });
  $("#xgCapName").textContent=nameOf(it);$("#xgCapKind").textContent=L(it.kind);$("#xgCapPrice").textContent=priceOf(it);
  if(changed){cap.classList.remove("xgcap-in");void cap.offsetWidth;cap.classList.add("xgcap-in")}
  if(opt&&opt.scroll){centerItem(i);setTimeout(()=>centerItem(i),420);setTimeout(()=>centerItem(i),900)}
}
function centerItem(i){
  const n=$(`.xg-it[data-i="${i}"]`,rack);if(!n)return;
  if(rack.scrollWidth<=rack.clientWidth+2)return;
  const target=n.offsetLeft+n.offsetWidth/2-rack.clientWidth/2;
  rack.scrollTo({left:target,behavior:"auto"});
}

/* ---------- detail ---------- */
function renderDetail(){
  const it=variant(gi,color);if(!it)return;const G=groups.length;
  $("#xgImg").src=src(it.file);$("#xgImg").alt=L(it.alt);
  const pg=variant((gi-1+G)%G,color),ng=variant((gi+1)%G,color);
  const gl=$("#xgGL"),gr=$("#xgGR");
  gl.hidden=G<3;gr.hidden=G<2;
  if(G>2)gl.innerHTML=`<img src="${src(pg.file)}" alt="" decoding="async">`;
  if(G>1)gr.innerHTML=`<img src="${src(ng.file)}" alt="" decoding="async">`;
  const has=c=>items.some(x=>x.group===groups[gi]&&x.color===c);
  $("#xgTags").innerHTML=["white","black"].filter(has).map(c=>`<button type="button" class="xg-tag ${c}" data-c="${c}" aria-pressed="${c===it.color}" aria-label="${esc(tx(c))}" data-testid="xg-tag-${c}"><span>${esc(tx(c))}</span></button>`).join("");
  $("#xgName").textContent=nameOf(it);$("#xgKind").textContent=L(it.kind);$("#xgPrice").textContent=priceOf(it);
  $("#xgBuy").hidden=!it.p||typeof openModal!=="function";
  $("#xgPrev").hidden=$("#xgNext").hidden=G<2;
}
const curItem=()=>variant(gi,color);
function setHash(){const it=curItem();if(it)history.replaceState(null,"",location.pathname+location.search+"#extra-gallery/"+it.id)}
function nav(d){
  const G=groups.length;if(G<2)return;
  box.style.setProperty("--sx",d>0?"30px":"-30px");
  gi=(gi+d+G)%G;color=variant(gi,color).color;active=items.indexOf(curItem());
  setHash();renderDetail();box.classList.remove("swap");void box.offsetWidth;box.classList.add("swap");
}
function setColor(c){
  if(c===curItem().color)return;
  color=c;active=items.indexOf(curItem());setHash();renderDetail();
  fig.classList.remove("turn");void fig.offsetWidth;fig.classList.add("turn");
}

/* ---------- zobrazení / skrytí ---------- */
function applyT(){
  $$("#xg [data-xgt]").forEach(el=>{el.textContent=tx(el.dataset.xgt)});
  $(".xg-hint").textContent=tx(touchUI?"hintTouch":"hint");
  $("#xgClose").setAttribute("aria-label",tx("closeAria"));
  $("#xgPrev").setAttribute("aria-label",tx("prev"));$("#xgNext").setAttribute("aria-label",tx("next"));
}
function openUI(){
  if(root.classList.contains("on"))return;
  opener=document.activeElement;
  root.classList.add("on");root.setAttribute("aria-hidden","false");
  document.documentElement.classList.add("xg-lock");
  requestAnimationFrame(()=>centerItem(active));
  setTimeout(()=>$("#xgClose").focus({preventScroll:true}),80);
}
function closeUI(){
  if(!root.classList.contains("on"))return;
  root.classList.remove("on","pv");root.setAttribute("aria-hidden","true");
  document.documentElement.classList.remove("xg-lock");
  detail.hidden=true;gi=-1;pushed=false;
  if(opener&&opener.focus)try{opener.focus({preventScroll:true})}catch(e){}
}
function showStage(){
  const had=root.classList.contains("pv");
  root.classList.remove("pv");detail.hidden=true;pushed=false;gi=-1;
  if(had){
    setActive(active);
    requestAnimationFrame(()=>{centerItem(active);const b=$(`.xg-it[data-i="${active}"]`,rack);b&&b.focus({preventScroll:true})});
  }
}
function showDetail(it){
  const g=groups.indexOf(it.group);
  if(root.classList.contains("pv")&&gi===g&&color===it.color)return;
  gi=g;color=it.color;active=items.indexOf(it);renderDetail();
  root.classList.add("pv");detail.hidden=false;
  box.classList.remove("swap");void box.offsetWidth;
  setTimeout(()=>$("#xgBack").focus({preventScroll:true}),60);
}
function sync(){
  const h=location.hash;
  if(h==="#extra-gallery"||h.indexOf("#extra-gallery/")===0){
    openUI();
    const id=h.split("/")[1]||"",it=id?items.find(x=>x.id===id):null;
    it?showDetail(it):showStage();
  }else closeUI();
}
function closeGallery(){history.replaceState(null,"",location.pathname+location.search);sync()}
function goBack(){
  if(pushed)history.back();
  else{history.replaceState(null,"",location.pathname+location.search+"#extra-gallery");sync()}
}
function openDetail(id){pushed=true;location.hash="#extra-gallery/"+id}
const step=d=>{const i=Math.max(0,Math.min(items.length-1,active+d));setActive(i,{scroll:true})};

/* ---------- události ---------- */
$("#xgClose").addEventListener("click",closeGallery);
$("#xgBack").addEventListener("click",goBack);
$("#xgPrev").addEventListener("click",()=>nav(-1));
$("#xgNext").addEventListener("click",()=>nav(1));
$("#xgCapBtn").addEventListener("click",()=>{if(items[active])openDetail(items[active].id)});
$("#xgTags").addEventListener("click",e=>{const b=e.target.closest("[data-c]");if(b)setColor(b.dataset.c)});
$("#xgBuy").addEventListener("click",()=>{
  const it=curItem();if(!it||!it.p)return;
  closeGallery();
  if(typeof openModal==="function")setTimeout(()=>openModal(it.pid),90);
});

/* myš: najetí vysune kousek, klik otevře detail. Dotyk: 1. klepnutí vysune, 2. otevře detail. */
rack.addEventListener("pointerdown",e=>{ptype=e.pointerType;downActive=active});
rack.addEventListener("pointerover",e=>{
  if(e.pointerType!=="mouse")return;
  const b=e.target.closest(".xg-it");if(b&&+b.dataset.i!==active)setActive(+b.dataset.i);
});
rack.addEventListener("click",e=>{
  const b=e.target.closest(".xg-it");if(!b)return;
  const i=+b.dataset.i;
  if(ptype==="touch"&&e.detail!==0&&i!==downActive)setActive(i,{scroll:true});
  else openDetail(items[i].id);
});
rack.addEventListener("focusin",e=>{const b=e.target.closest(".xg-it");if(b&&+b.dataset.i!==active)setActive(+b.dataset.i)});
rack.addEventListener("wheel",e=>{
  if(rack.scrollWidth<=rack.clientWidth+2||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
  e.preventDefault();rack.scrollLeft+=e.deltaY;
},{passive:false});
window.addEventListener("resize",()=>{if(root.classList.contains("on"))centerItem(active)});
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
  if(root.classList.contains("pv")&&gi>=0)renderDetail();
}
["applyLang","renderAll"].forEach(n=>{
  const f=window[n];
  if(typeof f==="function")window[n]=function(){const r=f.apply(this,arguments);try{refresh()}catch(e){console.error(e)}return r};
});

refresh();
sync();
})();
