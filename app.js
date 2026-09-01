'use strict';
const tabs=[
  ['home','Overview','⌂'],['characters','Characters','♙'],['events','Events','◇'],
  ['tree','Family Trees','⌘'],['timeline','Timeline','↝'],['bible','Bible','▤'],
  ['concordance','Concordance','⌕'],['quiz','Quiz','?'],['stats','Statistics','▥']
];
function home(){
  const readDays=ReadingStreak.days().length,current=ReadingStreak.current(),longest=ReadingStreak.longest();
  const recent=[['david','David','Recently'],['moses','Moses','Recently'],['ruth','Ruth','Recently'],['paul','Paul','Recently']];
  return `<div class="overview-dashboard">
    <section class="welcome-banner">
      <div class="welcome-copy"><span class="eyebrow">SCRIPTURE ATLAS V5.3</span><h2>Welcome back!</h2><p>Explore the people, places, and stories of the Bible.</p><button class="overview-action" data-home-tab="characters">Explore characters</button></div>
      <div class="welcome-image"><img src="images/paul.jpg" alt="Storybook Bible character beside an ancient coastal city"></div>
    </section>
    <section class="overview-stats" aria-label="Reading statistics">
      <article><span>🔥</span><div><b>${current}</b><strong>Day Streak</strong><small>Keep it going!</small></div></article>
      <article><span>🏅</span><div><b>${longest}</b><strong>Longest Streak</strong><small>Great job!</small></div></article>
      <article><span>🗓️</span><div><b>${readDays}</b><strong>Days Read</strong><small>All time</small></div></article>
      <article><span>📖</span><div><b>${D.characters.length}</b><strong>Characters</strong><small>Keep exploring</small></div></article>
    </section>
    <section class="overview-columns">
      <div class="overview-calendar">${ReadingStreak.widget()}</div>
      <section class="recent-panel panel"><div class="section-title"><h3>Recently Read</h3><button data-home-tab="characters">View all</button></div><div class="recent-list">${recent.map(([id,name,when])=>`<button class="recent-item" data-character="${id}"><img src="images/${id}.jpg" alt="${name} storybook illustration"><span><b>${name}</b><small>${when}</small></span><i>›</i></button>`).join('')}</div></section>
    </section>
    <section class="verse-strip"><span>“Thy word is a lamp unto my feet, and a light unto my path.”</span><b>Psalm 119:105</b><i aria-hidden="true">🪔</i></section>
  </div>`
}
function stats(){return `<h2>Statistics</h2><div class="stats"><div class="stat"><b>${State.scores.filter(x=>x.ok).length}</b><small>correct</small></div><div class="stat"><b>${State.scores.length}</b><small>rounds</small></div><div class="stat"><b>${State.scores.reduce((a,x)=>a+(x.points||0),0)}</b><small>quiz points</small></div><div class="stat"><b>${Object.keys(ReferenceCache.exact).length}</b><small>offline verses</small></div></div>`}

let drawerReturnFocus=null;
function openDrawer(){
  const drawer=document.getElementById('drawer'),backdrop=document.getElementById('drawerBackdrop'),menu=document.getElementById('menuBtn');
  drawerReturnFocus=document.activeElement;
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
  backdrop.classList.remove('hidden'); backdrop.setAttribute('aria-hidden','false');
  menu.setAttribute('aria-expanded','true'); document.body.classList.add('no-scroll');
  setTimeout(()=>document.getElementById('drawerCloseBtn')?.focus(),0);
}
function closeDrawer(restore=true){
  const drawer=document.getElementById('drawer'),backdrop=document.getElementById('drawerBackdrop'),menu=document.getElementById('menuBtn');
  drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
  backdrop.classList.add('hidden'); backdrop.setAttribute('aria-hidden','true');
  menu.setAttribute('aria-expanded','false');
  if(document.getElementById('modal').classList.contains('hidden'))document.body.classList.remove('no-scroll');
  if(restore)(drawerReturnFocus||menu)?.focus();
}
function render(){
  const nav=document.getElementById('nav'),app=document.getElementById('app');
  nav.innerHTML=tabs.map(t=>`<button type="button" data-tab="${t[0]}" aria-current="${State.tab===t[0]?'page':'false'}" class="${State.tab===t[0]?'active':''}"><span class="nav-icon" aria-hidden="true">${t[2]}</span><span>${t[1]}</span></button>`).join('');
  nav.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{State.tab=b.dataset.tab;State.query='';closeDrawer(false);render();window.scrollTo({top:0,behavior:'smooth'});app.focus({preventScroll:true})});
  const pages={home,characters:()=>Atlas.list('characters'),events:()=>Atlas.list('events'),tree:()=>Atlas.tree(),timeline:()=>Atlas.timeline(),bible:()=>Bible.view(),concordance:()=>Bible.concordance(),quiz:()=>Quiz.view(),stats};
  app.innerHTML=pages[State.tab](); document.querySelectorAll('[data-mobile-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mobileTab===State.tab)); bind();
}
function bind(){
  document.querySelectorAll('[data-mobile-tab]').forEach(b=>b.onclick=()=>{State.tab=b.dataset.mobileTab;State.query='';render();window.scrollTo({top:0,behavior:'smooth'})});
  document.querySelectorAll('[data-mobile-menu]').forEach(b=>b.onclick=openDrawer);
  document.querySelectorAll('[data-home-tab]').forEach(b=>b.onclick=()=>{State.tab=b.dataset.homeTab;render();window.scrollTo({top:0,behavior:'smooth'})});
  document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{const c=D.characters.find(x=>String(x.id).toLowerCase().includes(b.dataset.character)||String(x.name).toLowerCase()===b.dataset.character);if(c)Atlas.open('characters',c.id)});
  const s=document.getElementById('search');
  if(s)s.oninput=e=>{State.query=e.target.value;render();const n=document.getElementById('search');n?.focus();n?.setSelectionRange(State.query.length,State.query.length)};
  const tt=document.getElementById('testFilter'),cf=document.getElementById('catFilter');
  if(tt){const k=State.tab==='characters'?'charTestament':'eventTestament';tt.value=State[k];tt.onchange=e=>{State[k]=e.target.value;render()}}
  if(cf){const k=State.tab==='characters'?'charCategory':'eventCategory';cf.value=State[k];cf.onchange=e=>{State[k]=e.target.value;render()}}
  const t=document.getElementById('timelineTest'),c=document.getElementById('timelineCat');
  if(t){t.value=State.timelineTestament;t.onchange=e=>{State.timelineTestament=e.target.value;render()}}
  if(c){c.value=State.timelineCategory;c.onchange=e=>{State.timelineCategory=e.target.value;render()}}
  if(State.tab==='quiz')Quiz.bind();
  const cq=document.getElementById('concordanceSearch');
  if(cq)cq.oninput=e=>{State.concordanceQuery=e.target.value;render();const n=document.getElementById('concordanceSearch');n?.focus();n?.setSelectionRange(State.concordanceQuery.length,State.concordanceQuery.length)};
}
if(store.get('theme','light')==='dark')document.body.classList.add('dark');
document.getElementById('menuBtn').onclick=openDrawer;
document.getElementById('drawerCloseBtn').onclick=()=>closeDrawer();
document.getElementById('drawerBackdrop').onclick=()=>closeDrawer();
document.getElementById('themeBtn').onclick=()=>{document.body.classList.toggle('dark');store.set('theme',document.body.classList.contains('dark')?'dark':'light')};
document.getElementById('exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({scores:State.scores,mastery:State.mastery},null,2)],{type:'application/json'}));a.download='scripture-atlas-v5.5-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('drawer').classList.contains('open'))closeDrawer()});
render();
