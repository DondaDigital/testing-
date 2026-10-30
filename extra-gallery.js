/* TEMNAK – EXTRA GALLERY. Načítá se po hlavním skriptu (defer). */
(function(){
"use strict";

/* Galerie používá výhradně dodané produktové fotografie z kořene webu.
   Zadní fotografie nebyly dodány, proto se falešný zadní pohled nenakreslí. */
const XG_IMG={
  1:{black:{front:"Minimalist černá mikina TEMNAK.png"},white:{front:"Minimalist bílá mikina TEMNAK.png"}},
  2:{black:{front:"Minimalist černá mikina TEMNAK.png"},white:{front:"Minimalist bílá mikina TEMNAK.png"}},
  3:{black:{front:"Minimalistické černé tričko TEMNAK.png"},white:{front:"Minimalist tričko TEMNAK na ramínku.png"}},
  4:{black:{front:"Minimalistické černé tričko TEMNAK.png"},white:{front:"Minimalist tričko TEMNAK na ramínku.png"}}
};
const XG_NAME={
  hoodie:{black:{cs:"Mikina TEMNAK — černá",en:"TEMNAK hoodie — black"},white:{cs:"Mikina TEMNAK — bílá",en:"TEMNAK hoodie — white"}},
  tee:{black:{cs:"Tričko TEMNAK — černé",en:"TEMNAK T-shirt — black"},white:{cs:"Tričko TEMNAK — bílé",en:"TEMNAK T-shirt — white"}}
};
const XG_TYPE={mikiny:"hoodie",tricka:"tee"};
const XG_COLORS=["black","white"];          // barva kousku na věšáku podle pořadí
const XGT={
 cs:{close:"Zavřít",closeAria:"Zavřít galerii",hint:"Najeď na kousek · klikni pro detail",view:"Zobrazit",buy:"Vybrat velikost",
  backRack:"Zpět na věšák",sideF:"Přední",sideB:"Zadní",prev:"Předchozí kousek",next:"Další kousek",flipAria:"Otočit kousek",
  white:"Bílá",black:"Černá",soon:"Připravujeme",empty:"Zatím tu nic nevisí."},
 en:{close:"Close",closeAria:"Close gallery",hint:"Hover an item · click for details",view:"View",buy:"Choose size",
  backRack:"Back to the rail",sideF:"Front",sideB:"Back",prev:"Previous item",next:"Next item",flipAria:"Turn the item",
  white:"White",black:"Black",soon:"Coming soon",empty:"Nothing is hanging here yet."}
};
/* ===================================== */

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=$("#xg"),rack=$("#xgRack");
if(!root||!rack)return;
const cap=$("#xgCap"),detail=$("#xgDetail"),box=$("#xgBox"),flipEl=$("#xgFlip");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const lg=()=>document.documentElement.lang==="en"?"en":"cs";
const tx=k=>XGT[lg()][k];
const L=o=>o&&typeof o==="object"?(o[lg()]??o.cs??""):(o??"");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let items=[],active=0,idx=-1,color="black",flipped=false,pushed=false,opener=null;

function list(){
  const P=typeof PRODUCTS!=="undefined"?PRODUCTS:[];
  return P.filter(p=>XG_TYPE[p.cat]).map((p,i)=>({id:String(p.id),pid:p.id,type:XG_TYPE[p.cat],p,color:XG_COLORS[i%2],img:XG_IMG[p.id]||null}));
}
const nameOf=(it,c=it.color)=>XG_NAME[it.type]?.[c]?.[lg()]||L(it.p.name);
const priceOf=it=>it.p.price>0&&typeof money==="function"?money(it.p.price):tx("soon");

/* ---------- kresba oblečení (ilustrace, dokud nejsou fotky) ---------- */
function ribs(x0,x1,y0,y1,step,col){let d="";for(let x=x0+step;x<x1;x+=step)d+=`M${x} ${y0}V${y1}`;return `<path d="${d}" stroke="${col}" stroke-width="1" fill="none"/>`}
const HANGER='<path d="M120 44V30C120 21 129 18 129 10C129 3.5 122 1.5 118.5 4.5C116 6.7 116.5 10.5 119.5 12.5" fill="none" stroke="#9c9c9c" stroke-width="2.4" stroke-linecap="round"/><path d="M120 44V30" stroke="#fff" stroke-opacity=".6" stroke-width=".8" fill="none"/><rect x="112" y="40" width="16" height="9" rx="2.5" fill="#3b2a21"/><path d="M120 46C98 46 62 56 34 75L38 83C66 67 100 57 120 57C140 57 174 67 202 83L206 75C178 56 142 46 120 46Z" fill="url(#xgWood)" stroke="#1d130e" stroke-width=".6"/>';
function garment(it,col,side){
  const im=it.img&&it.img[col]&&it.img[col][side];
  if(im)return `<img src="${esc(im)}" alt="${esc(nameOf(it,col))}" draggable="false" loading="lazy">`;
  const W=col==="white",front=side==="front",hood=it.type==="hoodie";
  const C=W?{f:"#f6f6f3",s:"rgba(0,0,0,.38)",rib:"#e4e4e0",lin:"#cdcdc8",fold:"rgba(0,0,0,.09)",ink:"#121212",str:"#ecece8",rl:"rgba(0,0,0,.12)"}
           :{f:"#171717",s:"rgba(255,255,255,.24)",rib:"#0d0d0d",lin:"#040404",fold:"rgba(255,255,255,.075)",ink:"#f4f4f4",str:"#8c8c8c",rl:"rgba(255,255,255,.1)"};
  const font='font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="800" text-anchor="middle"';
  const shade=d=>`<path d="${d}" fill="url(#xgShade)"/><path d="${d}" fill="url(#xgShadeV)"/>`;
  let s=HANGER;
  if(!hood){
    const neck=front?"C140 70 130 76 120 76C110 76 100 70 94 54Z":"C140 59 130 61 120 61C110 61 100 59 94 54Z";
    const P="M94 54L48 72L18 122L48 138L66 112V256H174V112L192 138L222 122L192 72L146 54"+neck;
    s+=`<path d="${P}" fill="${C.f}" stroke="${C.s}" stroke-width="1"/>`+shade(P)
      +`<g fill="none" stroke="${C.fold}" stroke-width="2.2" stroke-linecap="round"><path d="M92 92C98 140 90 196 96 250"/><path d="M148 96C142 150 152 200 146 252"/><path d="M120 120C122 170 118 210 122 252" stroke-width="1.4"/><path d="M56 106L40 128M184 106L200 128"/></g>`
      +`<g fill="none" stroke="${C.rl}" stroke-width="1" stroke-dasharray="2 3"><path d="M66 247H174"/><path d="M20 118L50 134M220 118L190 134"/></g>`
      +(front?`<path d="M95 55C101 70 111 76 120 76C129 76 139 70 145 55" fill="none" stroke="${C.rib}" stroke-width="6"/><path d="M92 55C99 73 110 79 120 79C130 79 141 73 148 55" fill="none" stroke="${C.s}" stroke-width=".8"/>`
             :`<path d="M95 55C106 59 134 59 145 55" fill="none" stroke="${C.rib}" stroke-width="5"/>`)
      +(front?`<text x="120" y="150" ${font} font-size="19" letter-spacing="3" fill="${C.ink}">TEMNAK</text>`
             :`<text x="120" y="132" ${font} font-size="20" letter-spacing="3" fill="${C.ink}">TEMNAK</text><text x="120" y="148" ${font} font-weight="500" font-size="7" letter-spacing="3" fill="${C.ink}">OFFICIAL MERCH</text>`);
  }else{
    const B="M92 52L48 68C34 100 30 170 34 232L64 238C66 200 66 170 70 130V252H170V130C174 170 174 200 176 238L206 232C210 170 206 100 192 68L148 52Z";
    s+=`<path d="${B}" fill="${C.f}" stroke="${C.s}" stroke-width="1"/>`+shade(B)
      +`<path d="M70 238H170V252H70Z" fill="${C.rib}" stroke="${C.s}" stroke-width=".6"/>`+ribs(70,170,238,252,6,C.rl)
      +`<path d="M33 218L65 224L64 238L34 232Z" fill="${C.rib}" stroke="${C.s}" stroke-width=".6"/><path d="M207 218L175 224L176 238L206 232Z" fill="${C.rib}" stroke="${C.s}" stroke-width=".6"/>`
      +`<g fill="none" stroke="${C.fold}" stroke-width="2" stroke-linecap="round"><path d="M70 130C67 170 66 205 64 238"/><path d="M170 130C173 170 174 205 176 238"/><path d="M100 120C104 170 98 215 102 232" stroke-width="1.6"/><path d="M142 120C138 170 144 215 140 232" stroke-width="1.6"/></g>`;
    if(front){
      const H="M86 58C84 38 100 27 120 27C140 27 156 38 154 58C146 74 134 80 120 80C106 80 94 74 86 58Z";
      s+=`<path d="${H}" fill="${C.f}" stroke="${C.s}" stroke-width="1"/>`+shade(H)
        +`<path d="M95 55C99 42 110 37 120 37C130 37 141 42 145 55C139 68 130 73 120 73C110 73 101 68 95 55Z" fill="${C.lin}" stroke="${C.s}" stroke-width=".8"/>`
        +`<path d="M108 74C107 96 106 112 106 128M132 74C133 98 135 114 135 132" stroke="${C.str}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="104" y="128" width="4" height="9" rx="2" fill="#777"/><rect x="133" y="132" width="4" height="9" rx="2" fill="#777"/>`
        +`<path d="M82 178H158L170 232H70Z" fill="none" stroke="${C.s}" stroke-width=".9"/><path d="M82 178H158" stroke="${C.fold}" stroke-width="2.4"/>`
        +`<text x="120" y="162" ${font} font-size="14" letter-spacing="2.6" fill="${C.ink}">TEMNAK</text>`;
    }else{
      const H="M80 56C80 36 100 26 120 26C140 26 160 36 160 56C160 92 142 122 120 122C98 122 80 92 80 56Z";
      s+=`<path d="${H}" fill="${C.f}" stroke="${C.s}" stroke-width="1"/>`+shade(H)+`<path d="M120 30V118" stroke="${C.fold}" stroke-width="2" fill="none"/>`
        +`<text x="120" y="176" ${font} font-size="24" letter-spacing="3.5" fill="${C.ink}">TEMNAK</text><text x="120" y="192" ${font} font-weight="500" font-size="7" letter-spacing="3" fill="${C.ink}">OFFICIAL MERCH</text>`;
    }
  }
  return `<svg viewBox="0 0 240 300" aria-hidden="true">${s}</svg>`;
}

/* ---------- věšák ---------- */
function renderRack(){
  items=list();
  if(!items.length){rack.innerHTML=`<p class="xg-empty">${esc(tx("empty"))}</p>`;cap.style.visibility="hidden";return}
  cap.style.visibility="";
  active=Math.max(0,Math.min(active,items.length-1));
  rack.innerHTML=`<div class="xg-rackin"><i class="xg-brk l"></i><i class="xg-brk r"></i>`+items.map((it,i)=>
    `<button type="button" class="xg-it${i===active?" on":""}" style="--i:${i}" data-i="${i}" aria-label="${esc(nameOf(it)+", "+priceOf(it))}" data-testid="xg-item-${it.id}">
      <span class="xg-sw"><span class="xg-gm" style="--ry:${i%2?-72:72}deg">${garment(it,it.color,"front")}</span></span></button>`).join("")+`</div>`;
}
function setActive(i,scroll){
  if(!items[i])return;
  const changed=i!==active;active=i;
  $$(".xg-it",rack).forEach((b,j)=>b.classList.toggle("on",j===i));
  const it=items[i];
  $("#xgCapName").textContent=nameOf(it);$("#xgCapPrice").textContent=priceOf(it);
  if(changed){cap.classList.remove("xgcap-in");void cap.offsetWidth;cap.classList.add("xgcap-in")}
  if(scroll){const b=$(`.xg-it[data-i="${i}"]`,rack);b&&b.scrollIntoView({inline:"center",block:"nearest",behavior:reduce?"auto":"smooth"})}
}

/* ---------- detail ---------- */
function renderDetail(){
  const it=items[idx];if(!it)return;const n=items.length;
  const hasBack=!!(it.img&&it.img[color]&&it.img[color].back);
  $("#xgFront").innerHTML=garment(it,color,"front");
  $("#xgBackF").innerHTML=hasBack?garment(it,color,"back"):"";
  $("#xgFig").disabled=!hasBack;
  $("#xgSeg").hidden=!hasBack;
  const pv=items[(idx-1+n)%n],nx=items[(idx+1)%n];
  $("#xgGL").innerHTML=n>1?garment(pv,pv.color,"front"):"";
  $("#xgGR").innerHTML=n>1?garment(nx,nx.color,"front"):"";
  $("#xgTags").innerHTML=["white","black"].map(c=>`<button type="button" class="xg-tag ${c}" data-c="${c}" aria-pressed="${c===color}" aria-label="${esc(tx(c))}" data-testid="xg-tag-${c}"><span>${esc(tx(c))}</span></button>`).join("");
  $("#xgName").textContent=nameOf(it,color);$("#xgPrice").textContent=priceOf(it);
  flipEl.classList.toggle("flipped",flipped);
  const seg=$("#xgSeg");seg.style.setProperty("--pos",flipped?1:0);
  $$("button",seg).forEach(b=>b.setAttribute("aria-pressed",(b.dataset.side==="back")===flipped));
  $("#xgPrev").hidden=$("#xgNext").hidden=n<2;
}
function setFlip(f){if(!items[idx]?.img?.[color]?.back)return;flipped=f;flipEl.classList.toggle("flipped",f);const seg=$("#xgSeg");seg.style.setProperty("--pos",f?1:0);$$("button",seg).forEach(b=>b.setAttribute("aria-pressed",(b.dataset.side==="back")===f))}
function nav(d){
  const n=items.length;if(n<2)return;
  box.style.setProperty("--sx",d>0?"30px":"-30px");
  idx=(idx+d+n)%n;color=items[idx].color;flipped=false;
  history.replaceState(null,"",location.pathname+location.search+"#extra-gallery/"+items[idx].id);
  renderDetail();box.classList.remove("swap");void box.offsetWidth;box.classList.add("swap");
}

/* ---------- zobrazení / skrytí ---------- */
function applyT(){
  $$("#xg [data-xgt]").forEach(el=>{el.textContent=tx(el.dataset.xgt)});
  $("#xgClose").setAttribute("aria-label",tx("closeAria"));
  $("#xgPrev").setAttribute("aria-label",tx("prev"));$("#xgNext").setAttribute("aria-label",tx("next"));
  $("#xgFig").setAttribute("aria-label",tx("flipAria"));
}
function openUI(){
  if(root.classList.contains("on"))return;
  opener=document.activeElement;
  root.classList.add("on");root.setAttribute("aria-hidden","false");
  document.documentElement.classList.add("xg-lock");
  setActive(active,true);
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
  if(had>=0){active=had;idx=-1;setActive(had,true);const b=$(`.xg-it[data-i="${had}"]`,rack);b&&b.focus({preventScroll:true})}
  idx=-1;
}
function showDetail(i){
  if(root.classList.contains("pv")&&idx===i)return;
  idx=i;color=items[i].color;flipped=false;renderDetail();
  root.classList.add("pv");detail.hidden=false;
  box.classList.remove("swap");void box.offsetWidth;
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

/* ---------- události ---------- */
$("#xgClose").addEventListener("click",closeGallery);
$("#xgBack").addEventListener("click",goBack);
$("#xgPrev").addEventListener("click",()=>nav(-1));
$("#xgNext").addEventListener("click",()=>nav(1));
$("#xgFig").addEventListener("click",()=>setFlip(!flipped));
$("#xgSeg").addEventListener("click",e=>{const b=e.target.closest("[data-side]");if(b)setFlip(b.dataset.side==="back")});
$("#xgTags").addEventListener("click",e=>{
  const b=e.target.closest("[data-c]");if(!b||b.dataset.c===color)return;
  color=b.dataset.c;renderDetail();
});
$("#xgBuy").addEventListener("click",()=>{
  const it=items[idx];if(!it)return;
  closeGallery();
  if(typeof openModal==="function")setTimeout(()=>openModal(it.pid),90);
});
$("#xgCapBtn").addEventListener("click",()=>{if(items[active])openDetail(items[active].id)});
rack.addEventListener("pointerover",e=>{
  if(e.pointerType!=="mouse")return;
  const b=e.target.closest(".xg-it");if(b&&+b.dataset.i!==active)setActive(+b.dataset.i);
});
/* myš: kousek je aktivní už po najetí, klik otevře detail. Dotyk: 1. klepnutí kousek vysune, 2. klepnutí otevře detail. */
let downActive=-1;
rack.addEventListener("pointerdown",e=>{const b=e.target.closest(".xg-it");downActive=b?active:-1});
rack.addEventListener("click",e=>{
  const b=e.target.closest(".xg-it");if(!b)return;
  const i=+b.dataset.i,kbd=e.detail===0;
  if(kbd||downActive===i)openDetail(items[i].id);else setActive(i,true);
  downActive=-1;
});
rack.addEventListener("focusin",e=>{const b=e.target.closest(".xg-it");if(b)setActive(+b.dataset.i)});
window.addEventListener("hashchange",sync);

/* swipe na dotykových zařízeních */
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
    else if(items.length){const i=Math.max(0,Math.min(items.length-1,active+d));setActive(i,true);const b=$(`.xg-it[data-i="${i}"]`,rack);b&&b.focus({preventScroll:true});e.preventDefault()}
  }
  if(e.key==="Tab"){
    const f=$$("button:not([disabled])",root).filter(x=>!x.hidden&&x.offsetParent!==null&&getComputedStyle(x).visibility!=="hidden");
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
  if(typeof f==="function")window[n]=function(){const r=f.apply(this,arguments);try{refresh();refreshSourceSurveyText()}catch(e){console.error(e)}return r};
});

refresh();
sync();

/* ---------- otázka zdroje návštěvy ----------
   Odpověď zůstává pouze v localStorage tohoto prohlížeče. Bez backendu se nikam neposílá.
   Panel i odpověď se ukládají pouze po udělení analytického souhlasu. */
const surveyPanel=$("#sourceSurvey"),surveyStateKey="tmk_source_panel_state",surveyAnswerKey="tmk_source_panel_answer";
const SURVEY_COPY={
 cs:{title:"Odkud jste se o nás dozvěděli?",privacy:"Odpověď zůstává pouze v tomto prohlížeči a neodesílá se na server.",legend:"Vyberte jednu možnost",recommendation:"Doporučení od známého",ad:"Reklama",other:"Jinde",otherLabel:"Kde jste o nás slyšeli? (nepovinné)",otherPlaceholder:"Doplňte, pokud chcete",submit:"Hotovo",thanks:"Děkujeme za odpověď.",close:"Zavřít"},
 en:{title:"How did you hear about us?",privacy:"Your answer stays in this browser and is not sent to a server.",legend:"Choose one option",recommendation:"Recommendation from a friend",ad:"Advertisement",other:"Somewhere else",otherLabel:"Where did you hear about us? (optional)",otherPlaceholder:"Add a detail if you like",submit:"Done",thanks:"Thank you for your answer.",close:"Close"}
};
let surveyTimer=null,surveyFinished=false;
function refreshSourceSurveyText(){
  if(!surveyPanel)return;
  const words=SURVEY_COPY[lg()];
  $$("[data-source-copy]",surveyPanel).forEach(el=>{const k=el.dataset.sourceCopy;if(words[k])el.textContent=words[k]});
  $$("[data-source-copy-aria]",surveyPanel).forEach(el=>{const k=el.dataset.sourceCopyAria;if(words[k])el.setAttribute("aria-label",words[k])});
  $$("[data-source-copy-placeholder]",surveyPanel).forEach(el=>{const k=el.dataset.sourceCopyPlaceholder;if(words[k])el.setAttribute("placeholder",words[k])});
}
function hasSurveyConsent(){return typeof consent!=="undefined"&&!!consent&&consent.analytics===true}
function hideSourceSurvey(){
  clearTimeout(surveyTimer);surveyTimer=null;
  if(!surveyPanel)return;
  surveyPanel.classList.remove("is-open");
  setTimeout(()=>{if(!surveyPanel.classList.contains("is-open"))surveyPanel.hidden=true},460);
}
function scheduleSourceSurvey(){
  clearTimeout(surveyTimer);surveyTimer=null;
  if(!surveyPanel)return;
  if(!hasSurveyConsent()){
    hideSourceSurvey();surveyFinished=false;
    ls.del(surveyStateKey);ls.del(surveyAnswerKey);
    return;
  }
  surveyFinished=!!ls.get(surveyStateKey);
  if(surveyFinished)return;
  surveyTimer=setTimeout(()=>{
    if(!hasSurveyConsent()||surveyFinished)return;
    surveyPanel.hidden=false;
    requestAnimationFrame(()=>surveyPanel.classList.add("is-open"));
  },10000);
}
function finishSourceSurvey(answer,detail){
  if(!hasSurveyConsent())return;
  surveyFinished=true;
  ls.set(surveyStateKey,"completed");
  ls.set(surveyAnswerKey,JSON.stringify({source:answer,detail:detail||"",savedAt:Date.now()}));
  $("#sourceSurveyChoices").hidden=true;
  $("#sourceSurveyThanks").hidden=false;
}
function dismissSourceSurvey(){
  if(hasSurveyConsent())ls.set(surveyStateKey,"dismissed");
  surveyFinished=true;hideSourceSurvey();
}
if(surveyPanel){
  refreshSourceSurveyText();
  $("#sourceSurveyClose").addEventListener("click",dismissSourceSurvey);
  surveyPanel.addEventListener("change",e=>{
    const radio=e.target.closest('input[name="sourceSurveyAnswer"]');if(!radio)return;
    const other=radio.value==="Other";$("#sourceSurveyOther").hidden=!other;
    if(other){$("#sourceSurveyOtherText").focus();return}
    finishSourceSurvey(radio.value,"");
  });
  $("#sourceSurveySubmit").addEventListener("click",()=>finishSourceSurvey("Other",$("#sourceSurveyOtherText").value.trim()));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!surveyPanel.hidden&&surveyPanel.classList.contains("is-open"))dismissSourceSurvey()});
  const nativeSetConsent=window.setConsent;
  if(typeof nativeSetConsent==="function")window.setConsent=function(){const r=nativeSetConsent.apply(this,arguments);scheduleSourceSurvey();return r};
  scheduleSourceSurvey();
}
})();
