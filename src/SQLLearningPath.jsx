import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronRight, Code2, Moon, Play, RotateCcw, Sparkles, Sun, Table2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { sqlCurriculum, sqlExerciseCount } from './data/sqlCurriculum.js';
import { canonicalRows, createOracleSimulator, resultMatches, runOracleSubset } from './core/oracleSimulator.js';
import './sql-learning.css';

const SQL_PROGRESS_KEY = 'javascript-academy-sql-progress-v1';
function loadSqlProgress() {
  try { const value = JSON.parse(localStorage.getItem(SQL_PROGRESS_KEY)); return { done: [...new Set(value?.done || [])], xp: Math.max(0, Number(value?.xp) || 0), last: value?.last || sqlCurriculum[0].exercises[0].id }; }
  catch { return { done: [], xp: 0, last: sqlCurriculum[0].exercises[0].id }; }
}

export function SQLLearningPath({ theme, onThemeChange, onLanguageChange }) {
  const [progress, setProgress] = useState(loadSqlProgress);
  const [current, setCurrent] = useState(progress.last);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const chapters = sqlCurriculum;
  const exercise = useMemo(() => chapters.flatMap((chapter) => chapter.exercises).find((item) => item.id === current) || chapters[0].exercises[0], [current]);
  const chapter = chapters.find((item) => item.exercises.some((entry) => entry.id === current)) || chapters[0];
  const done = new Set(progress.done);

  useEffect(() => { setCode(exercise.starter); setResult(null); setHint(0); setSolutionOpen(false); setProgress((value) => ({ ...value, last: exercise.id })); }, [exercise]);
  useEffect(() => { try { localStorage.setItem(SQL_PROGRESS_KEY, JSON.stringify(progress)); } catch { /* storage may be disabled */ } }, [progress]);

  async function runSql() {
    setResult({ status: 'running' });
    let db;
    try {
      db = await createOracleSimulator();
      const execution = runOracleSubset(db, code);
      const queryResult = exercise.verifyQuery ? runOracleSubset(db, exercise.verifyQuery).at(-1) : execution.at(-1);
      const valid = Boolean(queryResult) && resultMatches(queryResult, exercise.result);
      const grade = { status: valid ? 'success' : 'incorrect', queryResult: queryResult || null, message: valid ? 'Das tatsächliche Datenbankergebnis stimmt mit dem Lernziel überein.' : 'Die Abfrage wurde ausgeführt, aber Ergebnis oder Datenänderung weicht noch ab.' };
      setResult(grade);
      if (valid && !done.has(exercise.id)) setProgress((value) => ({ ...value, done: [...value.done, exercise.id], xp: value.xp + exercise.xp }));
    } catch (error) {
      setResult({ status: 'error', message: explainSqlError(error) });
    } finally { db?.close(); }
  }

  const completed = done.size;
  const percent = Math.round(completed / sqlExerciseCount * 100);
  return <div className="app-shell sql-shell">
    <aside className="sidebar"><a className="brand" href="#sql"><span className="brand-mark"><Table2 size={20}/></span><span>javascript<span className="brand-soft">academy</span></span></a><div className="side-label">ORACLE SQL · LERNPFAD</div><nav>{chapters.map((item, index) => <button key={item.id} className={'chapter '+(item.id===chapter.id?'active':'available')} aria-current={item.id===chapter.id?'step':undefined} onClick={()=>setCurrent(item.exercises[0].id)}><span className="chapter-icon">{String(index+1).padStart(2,'0')}</span><span className="chapter-name">{item.title}</span>{item.exercises.every((entry)=>done.has(entry.id))&&<Check size={15}/>}</button>)}</nav><div className="sidebar-bottom"><div className="profile"><div className="avatar">K</div><div><b>SQL Learner</b><small>Level {Math.floor(progress.xp/100)+1}</small></div></div></div></aside>
    <main className="main"><header className="topbar"><div className="crumb">Dein Lernbereich <ChevronRight size={14}/><b>{chapter.title}</b></div><div className="stats"><div className="language-toggle" role="group" aria-label="Lernsprache"><button type="button" onClick={()=>onLanguageChange('javascript')}>JavaScript</button><button type="button" aria-pressed="true">Oracle SQL</button></div><span className="xp"><Sparkles size={16}/> {progress.xp} SQL-XP</span><button type="button" className="theme-toggle" aria-label={theme==='dark'?'Light Mode aktivieren':'Dark Mode aktivieren'} onClick={onThemeChange}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button></div></header>
      <div className="content"><section className="welcome"><div><div className="eyebrow">ORACLE-SYNTAX · LOKALE SIMULATION</div><h1>SQL lernen, Abfragen verstehen</h1><p>Deine Abfragen laufen lokal in einer echten WASM-Datenbank-Engine.</p></div><div className="welcome-illustration"><span className="plant">▦</span></div></section>
        <section className="overview"><div className="overview-head"><div><h2>SQL-Lernpfad</h2><p>Oracle-Syntax-Ausschnitt · keine Verbindung zu FreeSQL</p></div><div className="progress-ring" style={{'--progress':percent*3.6+'deg'}}><div><b>{percent}%</b><small>GESAMT</small></div></div></div><div className="progress-line"><span style={{width:percent+'%'}}/></div><div className="overview-metrics"><div><span className="metric-icon rose"><Check size={17}/></span><b>{completed}<small>Übungen erledigt</small></b></div><div><span className="metric-icon sage"><Sparkles size={17}/></span><b>{progress.xp}<small>SQL-Erfahrung</small></b></div><div><span className="metric-icon lilac"><Table2 size={17}/></span><b>{chapters.length}<small>Themenbereiche</small></b></div></div></section>
        <section className="sql-toolbar"><label>Thema<select value={chapter.id} onChange={(event)=>setCurrent(chapters.find((entry)=>entry.id===event.target.value).exercises[0].id)}>{chapters.map((item)=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>Übung<select value={exercise.id} onChange={(event)=>setCurrent(event.target.value)}>{chapter.exercises.map((item,index)=><option key={item.id} value={item.id}>{index+1}. {item.title}</option>)}</select></label></section>
        <section className="sql-workspace"><article className="task-panel"><div className="task-top"><span className="task-icon"><Table2 size={18}/></span><span className="difficulty">Einsteiger</span><span className="exercise-number">ÜBUNG {chapter.exercises.indexOf(exercise)+1} / {chapter.exercises.length}</span></div><h2>{exercise.title}</h2><p>{exercise.description}</p><div className="goal"><span>✳</span><div><b>Lernziel</b><p>Schreibe eine Oracle-SQL-Abfrage. Verglichen wird das Resultat, nicht die Schreibweise.</p></div></div><button className="hint-button" onClick={()=>setHint((value)=>Math.min(3,value+1))}>Hinweis anzeigen <span>{hint}/3</span></button>{hint>0&&<div className="hint-card"><b>{['Denkanstoß','Konzept','Gerüst'][hint-1]}</b><p>{exercise.hint[hint-1]}</p></div>}<button className="solution-button" disabled={!result||result.status==='running'} onClick={()=>setSolutionOpen((value)=>!value)}>{solutionOpen?'Lösung verbergen':'Musterlösung anzeigen'}</button>{solutionOpen&&<div className="solution"><pre>{exercise.solution}</pre><p>Das Ergebnis wird anhand der Tabellenwerte und Spalten geprüft; abweichende Reihenfolgen der Zeilen sind erlaubt.</p></div>}</article>
          <section className="editor-panel"><div className="editor-head"><div><Code2 size={16}/><b>Oracle SQL</b><span>CodeMirror</span></div><button className="reset" onClick={()=>{setCode(exercise.starter);setResult(null)}}><RotateCcw size={14}/> Code zurücksetzen</button></div><div className="sql-code"><CodeMirror aria-label="Oracle SQL-Abfrage bearbeiten" value={code} height="clamp(230px, 31vh, 400px)" theme={theme==='dark'?oneDark:'light'} extensions={[sql()]} onChange={setCode} basicSetup={{lineNumbers:true,foldGutter:true,highlightActiveLine:true}}/></div><div className="editor-footer"><span><span className="dot"/> Lokale Übungsdatenbank · kein Login</span><button className="run-button" onClick={runSql}><Play size={15} fill="currentColor"/> SQL ausführen</button></div><div className="output"><div className="output-head"><span>ERGEBNIS & TEST</span>{result&&<span className={'status '+result.status}>{result.status==='success'?'✓ Richtig':result.status==='running'?'Läuft …':result.status==='error'?'SQL-Fehler':'Noch nicht ganz'}</span>}</div><div className="sql-result">{result?.message&&<p className={'sql-message '+result.status}>{result.message}</p>}{result?.status==='error'&&<pre>{result.message}</pre>}{result?.queryResult&&<div className="sql-table-wrap"><table><thead><tr>{result.queryResult.columns.map((name)=><th key={name}>{name}</th>)}</tr></thead><tbody>{result.queryResult.rows.map((row,index)=><tr key={index}>{result.queryResult.columns.map((name)=><td key={name}>{row[name]===null?'NULL':String(row[name])}</td>)}</tr>)}</tbody></table></div>}{!result&&<p className="muted">Führe eine Abfrage aus, um echte Tabellenzeilen zu sehen.</p>}</div><button className="reset sql-reset" onClick={()=>setResult({status:null,message:'Datenbank zurückgesetzt. Jede Ausführung beginnt mit dem dokumentierten Beispieldatensatz; dein SQL-Code blieb erhalten.'})}><RotateCcw size={14}/> Datenbank zurücksetzen</button></div></section>
        </section>
        <details className="sql-schema"><summary><Table2 size={16}/> Beispielschema und Daten anzeigen</summary><p><code>students</code>, <code>courses</code>, <code>employees</code>, <code>departments</code> und <code>orders</code>. Nutze SELECT, um Werte zu inspizieren.</p><pre>students: id, name, age, course_id{`\n`}courses: id, title, duration{`\n`}employees: id, name, salary, department_id, hired_on{`\n`}departments: id, name{`\n`}orders: id, customer_name, amount, status</pre></details>
        <footer><BookOpen size={14}/> SQL-XP und Abschlüsse werden getrennt vom JavaScript-Lernpfad gespeichert.</footer></div>
    </main>
  </div>;
}

function explainSqlError(error) {
  const message = String(error?.message || error).slice(0, 400);
  if (/syntax error|incomplete input|near /i.test(message)) return `SQL-Syntaxfehler: Prüfe Schlüsselwörter, Kommas, Anführungszeichen und den unterstützten Oracle-Syntaxausschnitt. (${message})`;
  if (/no such table|no such column/i.test(message)) return `Tabelle oder Spalte nicht gefunden. Schau im Schema nach der genauen Schreibweise. (${message})`;
  if (/constraint/i.test(message)) return `Eine Tabellenregel wurde verletzt, etwa PRIMARY KEY, NOT NULL oder FOREIGN KEY. (${message})`;
  return `Die Datenbank konnte die Abfrage nicht ausführen: ${message}`;
}

