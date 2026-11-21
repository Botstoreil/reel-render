// words.json from whisper timings but SCRIPT.txt text (whisper mishears names/first words).
// Same word count -> 1:1; else each script word takes the time at its char position in the whisper text.
const fs=require("fs"),{execSync}=require("child_process");const out={};
const norm=(s)=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
for (const l of fs.readFileSync("SCRIPT.txt","utf8").trim().split("\n")) {
  const [id,line]=l.split("|");
  const ww=fs.readFileSync(`assets/words/${id}.jsonl`,"utf8").trim().split("\n").flatMap(x=>JSON.parse(x).words);
  // duration from the WAV header (this Mac has no working ffprobe; same value as ffprobe format=duration)
  const wb=fs.readFileSync(`assets/vo/${id}.wav`);let dur=0,br=0;for(let p=12;p+8<=wb.length;){const ck=wb.toString("ascii",p,p+4),sz=wb.readUInt32LE(p+4);if(ck==="fmt ")br=wb.readUInt32LE(p+16);if(ck==="data"){dur=Math.min(sz,wb.length-p-8)/br;break;}p+=8+sz+(sz&1);}
  if(!dur)throw new Error("bad wav "+id);
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
