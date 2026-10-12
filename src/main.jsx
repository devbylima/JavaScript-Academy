import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Check, ChevronDown, ChevronRight, Code2, Flame, GraduationCap, Lightbulb, Play, RotateCcw, Sparkles, Terminal, Trophy } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { advancedExercises } from './data/advancedExercises.js';
import { chapterUnlocked, completeExercise, loadProgress, saveProgress } from './core/progress.js';
import { gradeRun } from './core/grading.js';
import './styles.css';

const topics = [
  { title:'JavaScript-Grundlagen', icon:'✳', ideas:['console.log()', 'Kommentare', 'Anweisungen', 'Strings ausgeben', 'Mehrere Ausgaben', 'Text kombinieren', 'Ausgaben lesen', 'Fehler finden', 'Code ordnen', 'Mini-Ausgabe'] },
  { title:'Variablen & Datentypen', icon:'◈', ideas:['const verwenden', 'let verändern', 'Strings verbinden', 'Zahlen berechnen', 'Booleans prüfen', 'Typen erkennen', 'Werte umwandeln', 'Variablen aktualisieren', 'Namen wählen', 'Warenkorb-Summe'] },
  { title:'Operatoren & Bedingungen', icon:'⌘', ideas:['Rechnen', 'Vergleichen', '=== statt ==', 'if einsetzen', 'else ergänzen', 'Mehrere Fälle', '&& kombinieren', '|| kombinieren', 'Grenzwerte prüfen', 'Ticket-Entscheidung'] },
  { title:'Schleifen', icon:'↻', ideas:['for zählen', 'Rückwärts zählen', 'while stoppen', 'Schrittweite ändern', 'Summe bilden', 'Werte filtern', 'Array durchlaufen', 'Abbruchbedingung', 'Schleifenfehler', 'Sternchen-Muster'] },
  { title:'Arrays', icon:'▤', ideas:['Array erstellen', 'Index lesen', 'Wert ersetzen', 'length nutzen', 'push anwenden', 'pop anwenden', 'Elemente ausgeben', 'Werte aufsummieren', 'Position finden', 'Playlist verwalten'] },
  { title:'Funktionen', icon:'ƒ', ideas:['Funktion deklarieren', 'Parameter übergeben', 'return nutzen', 'Standardwert setzen', 'Lokale Variable', 'Bedingung kombinieren', 'Array verarbeiten', 'Ergebnis speichern', 'Funktion aufrufen', 'Trinkgeld berechnen'] },
  { title:'Objekte', icon:'◇', ideas:['Objekt anlegen', 'Property lesen', 'Property ändern', 'Klammernotation', 'Schlüssel ergänzen', 'Verschachteln', 'Property prüfen', 'Objekt ausgeben', 'Daten modellieren', 'Profilkarte bauen'] },
  { title:'Objektmethoden & this', icon:'✧', ideas:['Methode ergänzen', 'Methode aufrufen', 'this lesen', 'this ändern', 'Parameter verwenden', 'Wert zurückgeben', 'Aufrufkontext erkennen', 'Arrow-Funktion vergleichen', 'Normalfunktion binden', 'Punktestand verwalten'] },
  { title:'Arrays in Objekten', icon:'▦', ideas:['Array-Property lesen', 'Index ändern', 'push in Methode', 'pop in Methode', 'Länge zurückgeben', 'Array durchlaufen', 'Objekte im Array', 'Verschachtelte Daten', 'Elemente zählen', 'Wunschliste verwalten'] },
  { title:'Click-Handler & DOM', icon:'⌖', ideas:['querySelector finden', 'Click-Event binden', 'Text verändern', 'Klickzähler', 'Arrow-Handler', 'this im Handler', 'Objektmethode verbinden', 'Element ergänzen', 'DOM und Array', 'Interaktiver Zähler'] }
];

const samples = [
  [
    ['console.log("Hallo, JavaScript!")','Hallo, JavaScript!'], ['// Gib deinen Namen aus\nconsole.log("Alex")','Alex'],
    ['console.log("Lernen");\nconsole.log("macht Spaß");','Lernen\nmacht Spaß'], ['console.log(2 + 3)','5'], ['console.log("JS" + " Academy")','JS Academy'],
    ['console.log(typeof "Hallo")','string'], ['console.log(10 - 4)','6'], ['console.log("Tag " + 1)','Tag 1'], ['console.log(3 * 4)','12'], ['console.log("Fertig!")','Fertig!']
  ],
  [
    ['const farbe = "Salbei";\nconsole.log(farbe)','Salbei'], ['let punkte = 2;\npunkte = 5;\nconsole.log(punkte)','5'], ['const vorname = "Mia";\nconsole.log("Hallo " + vorname)','Hallo Mia'],
    ['const preis = 4;\nconsole.log(preis * 3)','12'], ['const istBereit = true;\nconsole.log(istBereit)','true'], ['console.log(typeof 42)','number'], ['console.log(Number("8") + 2)','10'],
    ['let count = 1;\ncount++;\nconsole.log(count)','2'], ['const kurs = "JavaScript";\nconsole.log(kurs.length)','10'], ['const preis = 12; const anzahl = 2;\nconsole.log(preis * anzahl)','24']
  ],
  [
    ['console.log(8 + 3)','11'], ['console.log(9 > 4)','true'], ['console.log(5 === "5")','false'], ['if (7 > 3) console.log("Ja")','Ja'],
    ['if (2 > 3) console.log("A"); else console.log("B")','B'], ['const n = 8;\nif (n > 10) console.log("groß"); else if (n > 5) console.log("mittel"); else console.log("klein")','mittel'],
    ['console.log(true && false)','false'], ['console.log(false || true)','true'], ['const alter = 18;\nconsole.log(alter >= 18)','true'], ['const punkte = 75;\nconsole.log(punkte >= 50 ? "Bestanden" : "Weiter üben")','Bestanden']
  ],
  [
    ['for (let i = 1; i <= 3; i++) console.log(i)','1\n2\n3'], ['for (let i = 3; i > 0; i--) console.log(i)','3\n2\n1'], ['let i = 0; while (i < 2) { console.log(i); i++; }','0\n1'],
    ['for (let i = 0; i <= 4; i += 2) console.log(i)','0\n2\n4'], ['let sum = 0; for (const n of [2,3,4]) sum += n; console.log(sum)','9'],
    ['for (const n of [1,2,3,4]) if (n % 2 === 0) console.log(n)','2\n4'], ['["a","b"].forEach(x => console.log(x))','a\nb'],
    ['for (let i=0; i<2; i++) console.log("Runde " + (i+1))','Runde 1\nRunde 2'], ['for (let i=0; i<3; i++) { if(i===1) continue; console.log(i) }','0\n2'], ['for (let i=1; i<=3; i++) console.log("*".repeat(i))','*\n**\n***']
  ],
  [
    ['const farben = ["rosa", "salbei"];\nconsole.log(farben.length)','2'], ['const tiere = ["Katze", "Hund"];\nconsole.log(tiere[0])','Katze'], ['const zahlen=[3,4]; zahlen[1]=9; console.log(zahlen[1])','9'], ['console.log(["a","b","c"].length)','3'],
    ['const einkauf=["Brot"]; einkauf.push("Milch"); console.log(einkauf.join(", "))','Brot, Milch'], ['const stapel=[1,2,3]; console.log(stapel.pop())','3'], ['["rot","blau"].forEach(f => console.log(f))','rot\nblau'],
    ['const werte=[2,4,6]; console.log(werte.reduce((a,b)=>a+b,0))','12'], ['console.log(["a","b","c"].indexOf("b"))','1'], ['const songs=["Intro"]; songs.push("Finale"); console.log(songs.length)','2']
  ],
  [
    ['function begruessung(){ return "Hallo"; }\nconsole.log(begruessung())','Hallo'], ['function mal(a,b){ return a*b; }\nconsole.log(mal(3,4))','12'], ['function doppelt(n){ return n*2; }\nconsole.log(doppelt(5))','10'],
    ['function willkommen(name="Gast"){ return "Hi " + name; }\nconsole.log(willkommen())','Hi Gast'], ['function test(){ const geheim=7; return geheim; }\nconsole.log(test())','7'],
    ['function istGerade(n){ return n % 2 === 0; }\nconsole.log(istGerade(6))','true'], ['function summe(xs){ return xs.reduce((a,b)=>a+b,0); }\nconsole.log(summe([1,2,3]))','6'],
    ['function quadrat(n){ return n*n; }\nconst ergebnis=quadrat(4); console.log(ergebnis)','16'], ['function gruss(name){ return "Hallo " + name; }\nconsole.log(gruss("Sam"))','Hallo Sam'], ['function trinkgeld(preis){ return preis * 0.1; }\nconsole.log(trinkgeld(30))','3']
  ],
  [
    ['const buch={titel:"Dune"}; console.log(buch.titel)','Dune'], ['const person={name:"Mia",alter:16}; console.log(person.alter)','16'], ['const konto={saldo:10}; konto.saldo=25; console.log(konto.saldo)','25'],
    ['const key="farbe"; const auto={farbe:"grün"}; console.log(auto[key])','grün'], ['const user={name:"Lee"}; user.aktiv=true; console.log(user.aktiv)','true'], ['const raum={fenster:{anzahl:2}}; console.log(raum.fenster.anzahl)','2'],
    ['const tier={art:"Fuchs"}; console.log("art" in tier)','true'], ['const buch={titel:"JS",seiten:120}; console.log(Object.keys(buch).length)','2'],
    ['const rezept={name:"Brot",minuten:45}; console.log(rezept.name + ": " + rezept.minuten)','Brot: 45'], ['const profil={name:"Ari",level:3}; console.log(profil.name + " · Level " + profil.level)','Ari · Level 3']
  ],
  [
    ['const u={name:"Nia",gruss(){return "Hi " + this.name}}; console.log(u.gruss())','Hi Nia'], ['const u={punkte:1,plus(){this.punkte++; return this.punkte}}; console.log(u.plus())','2'],
    ['const konto={stand:8,lesen(){return this.stand}}; console.log(konto.lesen())','8'], ['const spiel={leben:3,schaden(n){this.leben-=n; return this.leben}}; console.log(spiel.schaden(1))','2'],
    ['const box={wert:2,add(n){this.wert+=n; return this.wert}}; console.log(box.add(5))','7'], ['const wagen={marke:"Volvo",label(){return this.marke}}; console.log(wagen.label())','Volvo'],
    ['const obj={x:4,normal(){return this.x},pfeil:()=>this?.x}; console.log(obj.normal())','4'], ['const obj={x:9,read(){return this.x}}; console.log(obj.read())','9'],
    ['const counter={n:0,inc(){return ++this.n}}; counter.inc(); console.log(counter.n)','1'], ['const spiel={punkte:10,gewinnen(n){this.punkte+=n; return this.punkte}}; console.log(spiel.gewinnen(5))','15']
  ],
  [
    ['const p={farben:["rosa","grün"]}; console.log(p.farben[0])','rosa'], ['const p={noten:[2,3]}; p.noten[0]=1; console.log(p.noten[0])','1'], ['const liste={items:["A"],add(x){this.items.push(x)}}; liste.add("B"); console.log(liste.items.length)','2'],
    ['const stack={items:[1,2],remove(){return this.items.pop()}}; console.log(stack.remove())','2'], ['const team={mitglieder:["A","B"],count(){return this.mitglieder.length}}; console.log(team.count())','2'],
    ['const p={werte:[2,4,6]}; for(const n of p.werte) console.log(n)','2\n4\n6'], ['const kurs={teilnehmer:[{name:"Ada"},{name:"Lin"}]}; console.log(kurs.teilnehmer[1].name)','Lin'],
    ['const lager={fach:{artikel:["Buch"]}}; console.log(lager.fach.artikel[0])','Buch'], ['const team={mitglieder:["Ada","Lin","Sam"]}; console.log(team.mitglieder.filter(n=>n.startsWith("A")).length)','1'],
    ['const w={items:["Skizzenbuch"],add(x){this.items.push(x); return this.items.length}}; console.log(w.add("Stift"))','2']
  ],
  [
    ['const b=document.querySelector("#action"); b.addEventListener("click",()=>console.log("geklickt")); b.click();','geklickt'], ['const b=document.querySelector("#action"); b.addEventListener("click",()=>console.log("Event bereit")); b.click();','Event bereit'],
    ['const out=document.querySelector("#output"); out.textContent="Hallo DOM"; console.log(out.textContent)','Hallo DOM'], ['let n=0; const b=document.querySelector("#action"); b.addEventListener("click",()=>n++); b.click(); b.click(); console.log(n)','2'],
    ['const b=document.querySelector("#action"); b.addEventListener("click",()=>console.log("Pfeil")); b.click();','Pfeil'], ['const b=document.querySelector("#action"); b.addEventListener("click",function(){console.log(this.id)}); b.click();','action'],
    ['const app={n:0,click(){this.n++; console.log(this.n)}}; const b=document.querySelector("#action"); b.addEventListener("click",()=>app.click()); b.click();','1'],
    ['const out=document.querySelector("#output"); const p=document.createElement("p"); p.textContent="Neu"; out.append(p); console.log(out.textContent)','Neu'],
    ['const names=["Ada"]; const b=document.querySelector("#action"); b.addEventListener("click",()=>names.push("Lin")); b.click(); console.log(names.length)','2'],
    ['let count=0; const out=document.querySelector("#output"); const b=document.querySelector("#action"); b.addEventListener("click",function(){count++; out.textContent=count}); b.click(); b.click(); console.log(out.textContent)','2']
  ]
];

const chapters = topics.map((topic, ci) => ({...topic, id:ci+1, exercises:topic.ideas.map((title, ei)=>{
  const [starter, expected] = samples[ci][ei];
  return { id:`c${ci+1}-${ei+1}`, title, starter, expected, xp:10+(ei>6?5:0), difficulty:ei<3?'Leicht':ei<7?'Mittel':'Knifflig',
    description:`Setze ${title} um und prüfe die Ausgabe im Ergebnisbereich.`,
    hint:[`Achte darauf, welche JavaScript-Idee hier im Mittelpunkt steht: ${title}.`, `Führe den Code Schritt für Schritt aus und nutze console.log(), um Zwischenwerte sichtbar zu machen.`, `Vergleiche dein Ergebnis mit dem Beispiel. Ein möglicher Ansatz steht im Startercode.`],
    solution:starter
  };
})})).map((chapter) => {
  const curated = advancedExercises[chapter.id];
  if (!curated) return chapter;
  return { ...chapter, lesson: `In diesem Kapitel arbeitest du mit ${chapter.title.toLowerCase()}. Baue die Lösung schrittweise auf, führe sie aus und kontrolliere anschließend das Verhalten.`, exercises: curated.map((item, index) => ({
    ...item, id: `c${chapter.id}-${index + 1}`, xp: index < 3 ? 10 : index < 7 ? 15 : 20,
    expected: 'Alle Verhaltenstests bestanden', solutionExplanation: item.explanation, isDom: chapter.id === 10,
  })) };
});

function readProgress(){ return loadProgress(localStorage, chapters.reduce((n,c)=>n+c.exercises.length,0)); }
function escapeScript(code){ return code.replace(/<\/script/gi, '<\\/script'); }
function makeDocument(code, runId, checkCode = '') {
  const safeCode=escapeScript(code), safeChecks=escapeScript(checkCode);
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'"><style>body{font:14px system-ui;color:#293632;padding:16px;background:#fffefa}button{padding:8px 12px;border:0;border-radius:7px;background:#506d5b;color:white;margin:0 6px 8px 0}#output{padding:8px;background:#f4f5ef;border-radius:6px;min-height:20px}ul{padding-left:22px}</style></head><body><button id="action" type="button">Klick mich</button><button id="reset" type="button">Zurücksetzen</button><div id="output">0</div><ul id="list"></ul><script>
    const runId=${JSON.stringify(runId)}, send=(type,value)=>parent.postMessage({source:'academy-runner',runId,type,value},'*');
    const logs=[], checks=[];
    console.log=(...args)=>{const line=args.map(value=>{try{return typeof value==='object'?JSON.stringify(value):String(value)}catch{return String(value)}}).join(' ');logs.push(line);send('log',line)};
    console.error=(...args)=>send('error',args.map(String).join(' '));
    window.onerror=message=>{send('error',String(message));return true};
    const __assert=(label,passed,actual=passed)=>checks.push({label:String(label),passed:Boolean(passed),actual:String(actual)});
    try{${safeCode}\n${safeChecks}\n}catch(error){send('error',error.name+': '+error.message)}
    send('done',{logs,checks});
  <\/script></body></html>`;
}
function App(){
  const [progress,setProgress]=useState(readProgress);
  const [current,setCurrent]=useState(progress.last||'c1-1');
  const [code,setCode]=useState('');
  const [result,setResult]=useState(null);
  const [hint,setHint]=useState(0);
  const [showSolution,setShowSolution]=useState(false);
  const [previewDocument,setPreviewDocument]=useState('');
  const previewRef=useRef(null);
  const previewRunRef=useRef(null);
  const previewTimerRef=useRef(null);
  const activeRunRef=useRef(null);
  const exercise=useMemo(()=>chapters.flatMap(c=>c.exercises).find(e=>e.id===current)||chapters[0].exercises[0],[current]);
  const chapter=chapters[Number(current.split('-')[0].slice(1))-1];
  const total=chapters.reduce((n,c)=>n+c.exercises.length,0);
  const done=new Set(progress.done);
  useEffect(()=>{setCode(exercise.starter);setResult(null);setHint(0);setShowSolution(false);setPreviewDocument('');previewRunRef.current=null;if(previewTimerRef.current){clearTimeout(previewTimerRef.current);previewTimerRef.current=null;}setProgress(p=>({...p,last:exercise.id}));},[exercise]);
  useEffect(()=>{saveProgress(localStorage,progress);},[progress]);
  useEffect(()=>{
    const onPreviewMessage=(event)=>{
      if(event.source!==previewRef.current?.contentWindow||event.data?.source!=='academy-runner'||event.data?.runId!==previewRunRef.current)return;
      if(event.data.type==='done'&&previewTimerRef.current){clearTimeout(previewTimerRef.current);previewTimerRef.current=null;}
    };
    window.addEventListener('message',onPreviewMessage);
    return ()=>{window.removeEventListener('message',onPreviewMessage);if(previewTimerRef.current)clearTimeout(previewTimerRef.current);};
  },[]);
  const unlocked=(id)=> chapterUnlocked(id,progress.done);
  function run(){
    setResult({status:'running',logs:[]});
    if(activeRunRef.current){clearTimeout(activeRunRef.current.timer);activeRunRef.current.cleanup();}
    const runId=`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame=document.createElement('iframe');
    frame.setAttribute('sandbox','allow-scripts');
    frame.title='Isolierte Verhaltensprüfung';
    frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;border:0';
    frame.srcdoc=makeDocument(code,runId,exercise.check||'');
    document.body.append(frame);
    let logs=[], error=null, finished=false;
    const cleanup=()=>{window.removeEventListener('message',onMessage);frame.remove();};
    const timer=setTimeout(()=>{if(!finished){finished=true;cleanup();if(exercise.isDom){setPreviewDocument('');previewRunRef.current=null;if(previewTimerRef.current){clearTimeout(previewTimerRef.current);previewTimerRef.current=null;}}setResult({status:'error',logs,error:'Zeitlimit erreicht (1,5 s). Der Prüfcode wurde beendet.'});}},1500);
    activeRunRef.current={timer,cleanup};
    function onMessage(event){
      if(event.source!==frame.contentWindow||event.data?.source!=='academy-runner'||event.data?.runId!==runId)return;
      if(event.data.type==='log')logs.push(event.data.value);
      if(event.data.type==='error')error=String(event.data.value).slice(0,500);
      if(event.data.type==='done'&&!finished){
        finished=true;clearTimeout(timer);cleanup();
        const received=event.data.value||{};
        const grade=gradeRun({logs:received.logs||logs,checks:received.checks||[],error,expectedOutput:exercise.expected});
        setResult({...grade,logs:received.logs||logs,expected:exercise.expected});
        if(grade.passed)setProgress(p=>completeExercise(p,exercise));
      }
    }
    window.addEventListener('message',onMessage);
    if(exercise.isDom){
      const previewId=`preview-${runId}`;
      previewRunRef.current=previewId;
      if(previewTimerRef.current)clearTimeout(previewTimerRef.current);
      previewTimerRef.current=setTimeout(()=>{
        if(previewRunRef.current===previewId){
          previewRunRef.current=null;previewTimerRef.current=null;setPreviewDocument('');
          setResult({status:'error',logs:[],error:'Die Vorschau wurde nach 1,5 s wegen eines möglichen Endloslaufs zurückgesetzt.'});
        }
      },1500);
      setPreviewDocument(makeDocument(code,previewId,''));
    }
  }
  const exerciseIndex=Number(current.split('-')[1])-1;
  const next=chapter.exercises[exerciseIndex+1] || (unlocked(chapter.id+1)?chapters[chapter.id%chapters.length].exercises[0]:exercise);
  const percent=Math.round(done.size/total*100);
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#"><span className="brand-mark"><Code2 size={20}/></span><span>javascript<span className="brand-soft">academy</span></span></a>
      <div className="side-label">LERNPFAD</div><nav>{chapters.map(c=><button key={c.id} className={chapter.id===c.id?'chapter active':'chapter'} disabled={!unlocked(c.id)} onClick={()=>setCurrent(c.exercises[0].id)}><span className="chapter-icon">{c.icon}</span><span className="chapter-name">{String(c.id).padStart(2,'0')}　{c.title}</span>{chapter.id===c.id&&<ChevronRight size={16}/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="streak"><span>✿</span><div><b>Dein Lernplatz</b><small>In deinem Tempo.</small></div></div><div className="profile"><div className="avatar">K</div><div><b>JavaScript Learner</b><small>Level {Math.floor(progress.xp/100)+1}</small></div><ChevronDown size={16}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Dein Lernbereich <ChevronRight size={14}/><b>{chapter.title}</b></div><div className="stats"><span className="xp"><Sparkles size={16}/> {progress.xp} XP</span><div className="avatar small">K</div></div></header>
      <div className="content">
        <section className="welcome"><div><div className="eyebrow">MONTAG, 12. OKTOBER 2026 <span>✳</span></div><h1>Hallo, Katja <span>👋</span></h1><p>Ein kleiner Schritt heute bringt dich deinem Ziel näher.</p></div><div className="welcome-illustration"><span className="sun">☼</span><span className="plant">♧</span></div></section>
        <section className="overview"><div className="overview-head"><div><h2>Dein Lernpfad</h2><p>Du bist auf einem guten Weg. Mach weiter so!</p></div><div className="progress-ring" style={{'--progress':percent*3.6+'deg'}}><div><b>{percent}%</b><small>GESAMT</small></div></div></div><div className="progress-line"><span style={{width:percent+'%'}}/></div><div className="overview-metrics"><div><span className="metric-icon rose"><Check size={17}/></span><b>{done.size}<small>Übungen erledigt</small></b></div><div><span className="metric-icon sage"><Trophy size={17}/></span><b>{progress.xp}<small>Erfahrungspunkte</small></b></div><div><span className="metric-icon lilac"><GraduationCap size={18}/></span><b>Level {Math.floor(progress.xp/100)+1}<small>JavaScript Starter</small></b></div></div></section>
        <section className="lesson-heading"><div><span className="section-kicker">WEITERLERNEN</span><h2>Deine nächste Lektion</h2></div><button className="text-button" onClick={()=>setCurrent(progress.last||'c1-1')}>Letzten Stand öffnen <ChevronRight size={16}/></button></section>
        <section className="workspace">
          <div className="task-panel"><div className="task-top"><span className="task-icon">{chapter.icon}</span><span className="difficulty">{exercise.difficulty}</span><span className="exercise-number">ÜBUNG {current.split('-')[1]} / 10</span></div><h2>{exercise.title}</h2><p>{exercise.description}</p><div className="goal"><span>✳</span><div><b>Dein Lernziel</b><p>{chapter.lesson||`Nutze ${chapter.title}, um die Aufgabe zu lösen und die Ausgabe zu überprüfen.`}</p></div></div><div className="task-actions"><button className="hint-button" onClick={()=>setHint(n=>Math.min(n+1,3))}><Lightbulb size={16}/> Tipp anzeigen <span>{hint}/3</span></button>{hint>0&&<div className="hint-card"><b>{['Denkanstoß','Konzept','Codegerüst'][hint-1]}</b><p>{exercise.hint[hint-1]}</p></div>}<button className="solution-button" onClick={()=>setShowSolution(v=>!v)}>{showSolution?'Musterlösung verbergen':'Musterlösung anzeigen'}</button>{showSolution&&<div className="solution"><b>Musterlösung</b><pre>{exercise.solution}</pre><p>{exercise.solutionExplanation||'Führe den Code aus und vergleiche die Ausgabe mit dem erwarteten Ergebnis.'}</p></div>}<div className="reward"><Sparkles size={15}/> +{exercise.xp} XP bei Erfolg</div></div></div>
          <div className="editor-panel"><div className="editor-head"><div><Code2 size={16}/><b>Dein Code</b><span>JavaScript</span></div><button className="reset" onClick={()=>{setCode(exercise.starter);setResult(null);setPreviewDocument('');previewRunRef.current=null;if(previewTimerRef.current){clearTimeout(previewTimerRef.current);previewTimerRef.current=null;}}}><RotateCcw size={14}/> Zurücksetzen</button></div><div className="code-area"><CodeMirror aria-label="JavaScript-Code bearbeiten" value={code} height="204px" extensions={[javascript()]} onChange={setCode} basicSetup={{lineNumbers:true,foldGutter:true,highlightActiveLine:true,indentOnInput:true}} /></div><div className="editor-footer"><span><span className="dot"/> Änderungen bleiben in diesem Browser</span><button className="run-button" onClick={run}><Play size={15} fill="currentColor"/> Code ausführen</button></div>
            <div className="output"><div className="output-head"><span><Terminal size={15}/> AUSGABE</span>{result&&<span className={'status '+result.status}>{result.status==='success'?'✓ Richtig':result.status==='running'?'Läuft …':result.status==='error'?'Fehler':'Noch nicht ganz'}</span>}</div><div className="output-body">{!result?<span className="muted">Starte deinen Code, um das Ergebnis zu sehen.</span>:result.status==='running'?<span className="muted">Code wird ausgeführt …</span>:<><pre>{result.error||result.actual||'(Keine Ausgabe)'}</pre>{result.status!=='error'&&<small>{result.status==='success'?'Prima! Deine Ausgabe stimmt.':`Erwartet: ${result.expected}`}</small>}</>}</div></div>
          </div>
          {exercise.isDom&&<div className="preview-panel"><div className="editor-head"><div><Code2 size={16}/><b>Live-Vorschau</b><span>isoliertes HTML</span></div></div><iframe ref={previewRef} className="dom-preview" title="Interaktive DOM-Vorschau" sandbox="allow-scripts" srcDoc={previewDocument||'<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"><button id="action">Klick mich</button><button id="reset">Zurücksetzen</button><div id="output">Hier erscheint die Änderung</div><ul id="list"></ul>'}/><p className="preview-note">Führe deinen Code aus und klicke anschließend die Elemente in dieser Vorschau.</p></div>}
        </section>
        <section className="lesson-nav"><button onClick={()=>{const n=Number(current.split('-')[1]);if(n>1)setCurrent(`c${chapter.id}-${n-1}`)}} disabled={current.endsWith('-1')}>← Vorherige Übung</button><span>{done.size} von {total} Übungen abgeschlossen</span><button className="next-button" onClick={()=>setCurrent(next.id)}>Nächste Übung <ChevronRight size={15}/></button></section>
        <section className="chapters"><div className="section-title"><div><span className="section-kicker">DAS CURRICULUM</span><h2>Kapitel entdecken</h2></div><button className="text-button" onClick={()=>setCurrent('c1-1')}>Von vorn beginnen <RotateCcw size={14}/></button></div><div className="chapter-grid">{chapters.map(c=><button key={c.id} className={'chapter-card '+(!unlocked(c.id)?'locked':'')} title={!unlocked(c.id)?'Schließe das vorherige Kapitel ab, um dieses Kapitel freizuschalten.':'Kapitel wiederholen'} onClick={()=>unlocked(c.id)&&setCurrent(c.exercises[0].id)}><span className="card-icon">{c.icon}</span><small>KAPITEL {String(c.id).padStart(2,'0')} {!unlocked(c.id)&&'· GESPERRT'}</small><b>{c.title}</b><span className="card-progress">{c.exercises.filter(e=>done.has(e.id)).length} / 10 Übungen {unlocked(c.id)?<ChevronRight size={14}/>:<span aria-hidden="true">🔒</span>}</span></button>)}</div></section>
        <footer><BookOpen size={14}/> Mit Neugier lernen, Schritt für Schritt.</footer>
      </div>
    </main>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);

