import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const SEED_SQL = `
CREATE TABLE courses (id NUMBER PRIMARY KEY, title VARCHAR2(60), duration NUMBER);
CREATE TABLE students (id NUMBER PRIMARY KEY, name VARCHAR2(50), age NUMBER, course_id NUMBER REFERENCES courses(id));
CREATE TABLE departments (id NUMBER PRIMARY KEY, name VARCHAR2(50));
CREATE TABLE employees (id NUMBER PRIMARY KEY, name VARCHAR2(50), salary NUMBER, department_id NUMBER REFERENCES departments(id), hired_on DATE);
CREATE TABLE orders (id NUMBER PRIMARY KEY, customer_name VARCHAR2(50), amount NUMBER, status VARCHAR2(20));
INSERT INTO courses VALUES (1, 'JavaScript', 8), (2, 'SQL', 6), (3, 'Python', 10);
INSERT INTO students VALUES (1, 'Ada', 20, 1), (2, 'Lin', 17, 2), (3, 'Noor', 22, 1), (4, 'Sam', 19, 3), (5, 'Emil', 16, NULL);
INSERT INTO departments VALUES (10, 'Engineering'), (20, 'Sales'), (30, 'Support');
INSERT INTO employees VALUES (1, 'Mira', 4200, 10, '2021-04-15'), (2, 'Jonas', 3600, 20, '2023-01-10'), (3, 'Ravi', 5100, 10, '2019-08-01'), (4, 'Lea', 3000, NULL, '2024-03-12');
INSERT INTO orders VALUES (1, 'Nia', 120, 'shipped'), (2, 'Nia', 60, 'open'), (3, 'Lin', 75, 'shipped'), (4, 'Ada', 40, 'open');
CREATE TABLE dual (dummy VARCHAR2(1)); INSERT INTO dual VALUES ('X');
`;

// Tokenize just enough SQL grammar to safely locate the two taught row-limit clauses.
// SQL itself is still parsed and executed by SQLite WASM; this is not a result mock.
function scanSql(source) {
  const tokens = []; let depth = 0, i = 0;
  while (i < source.length) {
    const start = i, ch = source[i];
    if (/\s/.test(ch)) { i += 1; continue; }
    if (ch === '-' && source[i + 1] === '-') { i += 2; while (i < source.length && source[i] !== '\n') i += 1; continue; }
    if (ch === '/' && source[i + 1] === '*') { i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1; i = Math.min(source.length, i + 2); continue; }
    if (ch === "'" || ch === '"') { const quote = ch; i += 1; while (i < source.length) { if (source[i] === quote && source[i + 1] === quote) { i += 2; continue; } if (source[i++] === quote) break; } tokens.push({ value: '', start, end: i, depth }); continue; }
    if (ch === '(') { tokens.push({ value: ch, start, end: ++i, depth }); depth += 1; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); tokens.push({ value: ch, start, end: ++i, depth }); continue; }
    if (/[A-Za-z_]/.test(ch)) { i += 1; while (i < source.length && /[A-Za-z0-9_$#]/.test(source[i])) i += 1; tokens.push({ value: source.slice(start, i).toUpperCase(), start, end: i, depth }); continue; }
    if (/\d/.test(ch)) { i += 1; while (i < source.length && /\d/.test(source[i])) i += 1; tokens.push({ value: source.slice(start, i), start, end: i, depth }); continue; }
    i += 1; if ('<>=!'.includes(ch) && source[i] === '=') i += 1;
    tokens.push({ value: source.slice(start, i).toUpperCase(), start, end: i, depth });
  }
  return tokens;
}

export function translateOracleRowLimit(sql) {
  const tokens = scanSql(sql); let from = -1, to = -1, amount = null;
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i]; if (t.depth !== 0) continue;
    if (t.value === 'FETCH' && tokens[i + 1]?.value === 'FIRST' && /^\d+$/.test(tokens[i + 2]?.value || '') && tokens[i + 3]?.value === 'ROWS' && tokens[i + 4]?.value === 'ONLY') {
      from = t.start; to = tokens[i + 4].end; amount = Number(tokens[i + 2].value); break;
    }
    if (t.value === 'ROWNUM' && ['<=', '<'].includes(tokens[i + 1]?.value) && /^\d+$/.test(tokens[i + 2]?.value || '')) {
      const connector = tokens[i - 1];
      if (connector?.depth === 0 && ['WHERE', 'AND'].includes(connector.value)) from = connector.start;
      else throw new Error('Im Simulator wird ROWNUM nur als eigene WHERE-Bedingung oder nach AND unterstützt.');
      to = tokens[i + 2].end; amount = Math.max(0, Number(tokens[i + 2].value) - (tokens[i + 1].value === '<' ? 1 : 0)); break;
    }
  }
  if (from < 0) return sql;
  const remaining = `${sql.slice(0, from)} ${sql.slice(to)}`.trim().replace(/;+\s*$/, '');
  if (scanSql(remaining).some((token) => token.depth === 0 && token.value === 'LIMIT')) throw new Error('Bitte verwende Oracle FETCH FIRST oder ROWNUM, nicht LIMIT.');
  return `${remaining} LIMIT ${amount}`;
}

export function translateOracleQuery(sql) {
  let translated = translateOracleRowLimit(sql);
  const replacements = scanSql(translated).filter((token) => token.value === 'SYSDATE');
  for (const token of replacements.reverse()) {
    if (translated.slice(token.end).trimStart().startsWith('(')) continue;
    translated = `${translated.slice(0, token.start)}SYSDATE()${translated.slice(token.end)}`;
  }
  return translated;
}

export async function createOracleSimulator() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const db = new SQL.Database();
  db.create_function('NVL', (value, fallback) => value == null ? fallback : value);
  db.create_function('SYSDATE', () => new Date().toISOString().slice(0, 10));
  db.create_function('TO_DATE', (value) => value == null ? null : String(value));
  db.create_function('TO_CHAR', (value, format) => {
    if (value == null) return null;
    if (String(format || '').includes('YYYY') && /^\d{4}-/.test(String(value))) return String(value).slice(0, 4);
    if (typeof value === 'number' && String(format || '').includes('.')) return Number(value).toFixed(String(format).split('.')[1].length);
    return String(value);
  });
  db.exec(SEED_SQL);
  return db;
}

export function runOracleSubset(db, statement) {
  const sql = translateOracleQuery(statement);
  const results = db.exec(sql);
  return results.map((result) => ({ columns: result.columns, rows: result.values.map((values) => Object.fromEntries(result.columns.map((column, i) => [column, values[i]]))) }));
}

export function canonicalRows(rows) {
  return rows.map((row) => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b))))).sort();
}

export function resultMatches(actual, expected) {
  if (!actual || !expected) return false;
  const columns = actual.columns.map((column) => column.toLowerCase()).sort();
  const expectedColumns = expected.columns.map((column) => column.toLowerCase()).sort();
  return JSON.stringify(columns) === JSON.stringify(expectedColumns) && JSON.stringify(canonicalRows(actual.rows)) === JSON.stringify(canonicalRows(expected.rows));
}

