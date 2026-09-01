'use strict';
const D=APP_DATA,$=s=>document.querySelector(s);
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('sa21_'+k))??d}catch{return d}},set:(k,v)=>localStorage.setItem('sa21_'+k,JSON.stringify(v))};
const State={tab:'home',query:'',charTestament:'All',eventTestament:'All',charCategory:'All',eventCategory:'All',timelineTestament:'All',timelineCategory:'All',returnContext:null,read:store.get('read',[]),scores:store.get('scores',[]),mastery:store.get('mastery',{}),concordanceQuery:''};
const ReadingStreak={
  key:'readingDays',
  localDate(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`},
  days(){return [...new Set(store.get(this.key,[]))].sort()},
  mark(){const days=this.days(),today=this.localDate();if(!days.includes(today)){days.push(today);store.set(this.key,days.sort())}},
  difference(a,b){const [ay,am,ad]=a.split('-').map(Number),[by,bm,bd]=b.split('-').map(Number);return Math.round((Date.UTC(by,bm-1,bd)-Date.UTC(ay,am-1,ad))/86400000)},
  current(){const days=this.days();if(!days.length)return 0;let cursor=this.localDate(),i=days.length-1;if(days[i]!==cursor){const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);cursor=this.localDate(yesterday);if(days[i]!==cursor)return 0}let count=0;for(;i>=0;i--){if(days[i]!==cursor)break;count++;const d=new Date(cursor+'T12:00:00');d.setDate(d.getDate()-1);cursor=this.localDate(d)}return count},
  longest(){const days=this.days();if(!days.length)return 0;let best=1,run=1;for(let i=1;i<days.length;i++){run=this.difference(days[i-1],days[i])===1?run+1:1;best=Math.max(best,run)}return best},
  widget(){
    const today=new Date(),year=today.getFullYear(),month=today.getMonth(),first=new Date(year,month,1),count=new Date(year,month+1,0).getDate(),offset=first.getDay(),read=new Set(this.days());
    const cells=Array.from({length:offset},()=>'<span class="calendar-day empty" aria-hidden="true"></span>');
    for(let day=1;day<=count;day++){const d=new Date(year,month,day),key=this.localDate(d),active=read.has(key),isToday=day===today.getDate();cells.push(`<span class="calendar-day ${active?'read-day':''} ${isToday?'today':''}" aria-label="${d.toLocaleDateString(undefined,{month:'long',day:'numeric'})}${active?', reading recorded':''}">${day}${active?'<i aria-hidden="true">✓</i>':''}</span>`)}
    return `<section class="reading-streak panel"><div class="streak-heading"><div><span class="streak-flame" aria-hidden="true">🔥</span><h2>${this.current()} day streak</h2><p>Open a character profile each day to continue the reading streak.</p></div><div class="streak-best"><b>${this.longest()}</b><small>longest</small></div></div><div class="calendar-title"><b>${today.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</b><span>${this.days().length} reading day${this.days().length===1?'':'s'}</span></div><div class="calendar-week" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div><div class="reading-calendar">${cells.join('')}</div></section>`
  }
};
let modalReturnFocus=null;
const UI={
  esc:s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),
  ref:(r,type,id)=>`<button class="ref" onclick="Bible.openRef('${String(r).replace(/'/g,"\'")}','${type||''}','${id||''}')">${r}</button>`,
  modal:(html,title='Details')=>{
    modalReturnFocus=document.activeElement;
    $('#modalTitle').textContent=title;
    $('#modalBody').innerHTML=html;
    $('#modalBody').scrollTop=0;
    $('#modal').classList.remove('hidden');
    $('#modal').setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    setTimeout(()=>$('.close')?.focus(),0);
  },
  close:()=>{
    $('#modal').classList.add('hidden');
    $('#modal').setAttribute('aria-hidden','true');
    if(!document.getElementById('drawer')?.classList.contains('open'))document.body.classList.remove('no-scroll');
    modalReturnFocus?.focus?.();
  }
};
window.addEventListener('click',e=>{if(e.target.id==='modal')UI.close()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').classList.contains('hidden'))UI.close()});
