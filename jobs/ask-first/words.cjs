// words.json from whisper timings but SCRIPT.txt text (whisper mishears names/first words).
// Same word count -> 1:1; else each script word takes the time at its char position in the whisper text.
const fs=require("fs"),{execSync}=require("child_process");const out={};
// Duration from the WAV header (no ffprobe needed: it is broken on some Macs); ffprobe only as a fallback.
function wavDur(f){
  try{const b=fs.readFileSync(f);if(b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WAVE"){let o=12,rate=0;
    while(o+8<=b.length){const id=b.toString("ascii",o,o+4),sz=b.readUInt32LE(o+4);
      if(id==="fmt ")rate=b.readUInt32LE(o+16);
      if(id==="data"&&rate>0)return Math.min(sz,b.length-o-8)/rate;
      o+=8+sz+(sz%2);}}}catch(e){}
  return +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`).toString();
}
const norm=(s)=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
for (const l of fs.readFileSync("SCRIPT.txt","utf8").trim().split("\n")) {
  const [id,line]=l.split("|");
  const ww=fs.readFileSync(`assets/words/${id}.jsonl`,"utf8").trim().split("\n").flatMap(x=>JSON.parse(x).words);
  const dur=wavDur(`assets/vo/${id}.wav`);
  const k=Math.min(1,(dur-0.1)/ww.at(-1).end);
  const sw=line.trim().split(/\s+/);
  let words;
  if (sw.length===ww.length) words=sw.map((t,i)=>({text:t,start:ww[i].start,end:ww[i].end}));
  else {
    const wl=ww.map(w=>Math.max(1,norm(w.text).length)), wt=wl.reduce((a,b)=>a+b,0);
    const sl=sw.map(w=>Math.max(1,norm(w).length)), st=sl.reduce((a,b)=>a+b,0);
    const timeAt=(f)=>{let c=0;for(let i=0;i<ww.length;i++){const a=c/wt,b=(c+wl[i])/wt;if(f<=b+1e-9)return ww[i].start+(ww[i].end-ww[i].start)*((f-a)/(b-a));c+=wl[i];}return ww.at(-1).end;};
    let c=0; words=sw.map((t,i)=>{const s=timeAt(c/st);c+=sl[i];return {text:t,start:s,end:timeAt(c/st)};});
  }
  out[id]={dur,words:words.map(w=>({text:w.text,start:+(w.start*k).toFixed(3),end:+(w.end*k).toFixed(3)}))};
}
fs.writeFileSync("assets/words.json",JSON.stringify(out));
