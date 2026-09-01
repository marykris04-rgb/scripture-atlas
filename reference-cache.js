'use strict';
const ReferenceCache={
 exact:APP_DATA.verseCache?.KJV||{},
 parse(ref){const m=String(ref).trim().match(/^((?:[1-3]\s)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);return m?{book:m[1],chapter:+m[2],start:m[3]?+m[3]:null,end:m[4]?+m[4]:(m[3]?+m[3]:null)}:null},
 related(ref){const p=this.parse(ref);if(!p)return[];return Object.entries(this.exact).filter(([r])=>{const x=this.parse(r);return x&&x.book===p.book&&x.chapter>=p.chapter&&(x.chapter===p.chapter)&&(!p.start||(x.start>=p.start&&x.start<=p.end))}).map(([reference,text])=>({reference,text}))},
 context(ref){const direct=this.related(ref);if(direct.length)return direct;const p=this.parse(ref);if(!p)return[];return Object.entries(this.exact).filter(([r])=>{const x=this.parse(r);return x&&x.book===p.book&&Math.abs(x.chapter-p.chapter)<=1}).slice(0,8).map(([reference,text])=>({reference,text}))},
 render(ref){const rows=this.context(ref);return `<section class="local-passage"><h4>${UI.esc(ref)} · locally saved KJV excerpts</h4>${rows.length?rows.map(v=>`<p class="verse-line"><b>${UI.esc(v.reference)}</b> ${UI.esc(v.text)}</p>`).join(''):`<p class="meta">This broad citation is retained, but the local library does not yet contain a word-for-word excerpt from that chapter. No biography or generated text is presented as Scripture.</p>`}</section>`}
};
