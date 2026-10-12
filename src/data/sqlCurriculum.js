const lessons = [
  ['SQL-Grundlagen & DUAL', [
    ['Text mit DUAL ausgeben', 'Gib den Text Hallo SQL als greeting aus.', "SELECT 'Hallo SQL' AS greeting FROM dual", ['greeting', [['Hallo SQL']]]],
    ['Mit Zahlen rechnen', 'Berechne 7 × 6 als product.', 'SELECT 7 * 6 AS product FROM dual', ['product', [[42]]]],
    ['Oracle-String verbinden', 'Verbinde Ada und Lovelace mit || zu einem Namen.', "SELECT 'Ada' || ' ' || 'Lovelace' AS full_name FROM dual", ['full_name', [['Ada Lovelace']]]],
  ]],
  ['SELECT & DISTINCT', [
    ['Namen auswählen', 'Gib alle Studierendennamen alphabetisch aus.', 'SELECT name FROM students ORDER BY name', ['name', [['Ada'], ['Emil'], ['Lin'], ['Noor'], ['Sam']]]],
    ['Kurs-IDs ohne Duplikate', 'Zeige jede belegte course_id nur einmal.', 'SELECT DISTINCT course_id FROM students WHERE course_id IS NOT NULL ORDER BY course_id', ['course_id', [[1], [2], [3]]]],
    ['Mehrere Spalten', 'Zeige name und age für alle Lernenden.', 'SELECT name, age FROM students ORDER BY id', ['name', 'age', [['Ada', 20], ['Lin', 17], ['Noor', 22], ['Sam', 19], ['Emil', 16]]]],
  ]],
  ['WHERE & Filtern', [
    ['Minderjährige finden', 'Finde Lernende unter 18 Jahren.', 'SELECT name FROM students WHERE age < 18 ORDER BY name', ['name', [['Emil'], ['Lin']]]],
    ['Nach Kurs filtern', 'Zeige die Namen aus Kurs 1.', 'SELECT name FROM students WHERE course_id = 1 ORDER BY name', ['name', [['Ada'], ['Noor']]]],
    ['Textstatus filtern', "Finde offene Bestellungen mit einem Betrag ab 50.", "SELECT id, amount FROM orders WHERE status = 'open' AND amount >= 50 ORDER BY id", ['id', 'amount', [[2, 60]]]],
  ]],
  ['Vergleich & Logik', [
    ['Bereich mit BETWEEN', 'Finde Lernende zwischen 18 und 20 Jahren einschließlich der Grenzen.', 'SELECT name FROM students WHERE age BETWEEN 18 AND 20 ORDER BY name', ['name', [['Ada'], ['Sam']]]],
    ['Werte mit IN wählen', 'Finde Bestellungen mit Status open oder shipped.', "SELECT id FROM orders WHERE status IN ('open', 'shipped') ORDER BY id", ['id', [[1], [2], [3], [4]]]],
    ['Muster mit LIKE', 'Finde Namen, die mit A beginnen.', "SELECT name FROM students WHERE name LIKE 'A%'", ['name', [['Ada']]]],
  ]],
  ['ORDER BY & Zeilenbegrenzung', [
    ['Absteigend sortieren', 'Zeige die teuerste Bestellung zuerst.', 'SELECT amount FROM orders ORDER BY amount DESC', ['amount', [[120], [75], [60], [40]]]],
    ['FETCH FIRST verwenden', 'Gib die zwei höchsten Gehälter aus.', 'SELECT salary FROM employees ORDER BY salary DESC FETCH FIRST 2 ROWS ONLY', ['salary', [[5100], [4200]]]],
    ['ROWNUM begrenzen', 'Gib drei Bestellnummern zurück. (Im Simulator: ROWNUM-Bedingung am Ende von WHERE oder AND.)', 'SELECT id FROM orders WHERE ROWNUM <= 3 ORDER BY id', ['id', [[1], [2], [3]]]],
  ]],
  ['Aggregatfunktionen', [
    ['COUNT zählen', 'Zähle alle Studierenden.', 'SELECT COUNT(*) AS total FROM students', ['total', [[5]]]],
    ['SUM berechnen', 'Berechne den Umsatz aller Bestellungen.', 'SELECT SUM(amount) AS revenue FROM orders', ['revenue', [[295]]]],
    ['AVG, MIN und MAX', 'Gib Durchschnitt, Minimum und Maximum der Gehälter aus.', 'SELECT AVG(salary) AS average_salary, MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees', ['average_salary', 'min_salary', 'max_salary', [[3975, 3000, 5100]]]],
  ]],
  ['GROUP BY & HAVING', [
    ['Bestellungen je Status', 'Zähle Bestellungen je Status.', 'SELECT status, COUNT(*) AS total FROM orders GROUP BY status ORDER BY status', ['status', 'total', [['open', 2], ['shipped', 2]]]],
    ['Umsatz je Kundschaft', 'Summiere den Betrag pro customer_name.', 'SELECT customer_name, SUM(amount) AS total FROM orders GROUP BY customer_name ORDER BY customer_name', ['customer_name', 'total', [['Ada', 40], ['Lin', 75], ['Nia', 180]]]],
    ['Gruppen mit HAVING filtern', 'Zeige Statusgruppen mit mindestens zwei Bestellungen.', 'SELECT status, COUNT(*) AS total FROM orders GROUP BY status HAVING COUNT(*) >= 2 ORDER BY status', ['status', 'total', [['open', 2], ['shipped', 2]]]],
  ]],
  ['JOINs', [
    ['INNER JOIN', 'Zeige Studierendenname und Kurstitel für zugeordnete Kurse.', 'SELECT students.name, courses.title FROM students INNER JOIN courses ON students.course_id = courses.id ORDER BY students.name', ['name', 'title', [['Ada', 'JavaScript'], ['Lin', 'SQL'], ['Noor', 'JavaScript'], ['Sam', 'Python']]]],
    ['LEFT JOIN', 'Zeige alle Lernenden samt Kurstitel; Emil soll ohne Kurs trotzdem vorkommen.', 'SELECT students.name, courses.title FROM students LEFT JOIN courses ON students.course_id = courses.id ORDER BY students.name', ['name', 'title', [['Ada', 'JavaScript'], ['Emil', null], ['Lin', 'SQL'], ['Noor', 'JavaScript'], ['Sam', 'Python']]]],
    ['Abteilung zu Mitarbeitenden', 'Verbinde Namen und Abteilungsnamen der Mitarbeitenden.', 'SELECT employees.name, departments.name AS department FROM employees JOIN departments ON employees.department_id = departments.id ORDER BY employees.name', ['name', 'department', [['Jonas', 'Sales'], ['Mira', 'Engineering'], ['Ravi', 'Engineering']]]],
  ]],
  ['Unterabfragen', [
    ['Über Durchschnitt filtern', 'Finde Mitarbeitende mit Gehalt über dem Durchschnitt.', 'SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY name', ['name', [['Mira'], ['Ravi']]]],
    ['IN mit Unterabfrage', 'Finde Namen der Lernenden in Kursen ab 8 Wochen.', 'SELECT name FROM students WHERE course_id IN (SELECT id FROM courses WHERE duration >= 8) ORDER BY name', ['name', [['Ada'], ['Noor'], ['Sam']]]],
    ['EXISTS prüfen', 'Finde Abteilungen, denen mindestens eine Person zugeordnet ist.', 'SELECT name FROM departments d WHERE EXISTS (SELECT 1 FROM employees e WHERE e.department_id = d.id) ORDER BY name', ['name', [['Engineering'], ['Sales']]]],
  ]],
  ['INSERT, UPDATE & DELETE', [
    ['Datensatz einfügen', 'Füge eine neue Bestellung ein und prüfe den Datensatz.', "INSERT INTO orders (id, customer_name, amount, status) VALUES (5, 'Iris', 25, 'open')", ['id', 'customer_name', 'amount', 'status', [[5, 'Iris', 25, 'open']]], 'SELECT id, customer_name, amount, status FROM orders WHERE id = 5'],
    ['Datensatz ändern', "Setze Bestellung 2 auf 'shipped' und prüfe ihren Status.", "UPDATE orders SET status = 'shipped' WHERE id = 2", ['status', [['shipped']]], 'SELECT status FROM orders WHERE id = 2'],
    ['Datensatz löschen', 'Lösche Bestellung 4 und prüfe, dass sie nicht mehr existiert.', 'DELETE FROM orders WHERE id = 4', ['total', [[0]]], 'SELECT COUNT(*) AS total FROM orders WHERE id = 4'],
  ]],
  ['NULL, NVL & Datumsfunktionen', [
    ['NULL mit NVL ersetzen', 'Zeige bei Lernenden ohne Kurs den Text Kein Kurs.', "SELECT name, NVL(course_id, 'Kein Kurs') AS course FROM students WHERE id = 5", ['name', 'course', [['Emil', 'Kein Kurs']]]],
    ['SYSDATE lesen', 'Lies mit SYSDATE das aktuelle Jahr aus und formatiere es mit TO_CHAR.', "SELECT TO_CHAR(SYSDATE, 'YYYY') AS current_year FROM dual", ['current_year', [[String(new Date().getUTCFullYear())]]]],
    ['Datum mit TO_DATE lesen', 'Wandle das Oracle-Datum 15.04.2021 in ein Datum um und zeige es als ISO-Wert.', "SELECT TO_DATE('2021-04-15', 'YYYY-MM-DD') AS hired_on FROM dual", ['hired_on', [['2021-04-15']]]],
    ['Zahl mit TO_CHAR formatieren', 'Formatiere 12.5 mit einer Nachkommastelle.', "SELECT TO_CHAR(12.5, 'FM9990.0') AS formatted FROM dual", ['formatted', [['12.5']]]],
  ]],
  ['Constraints & Datenmodell', [
    ['Tabelle mit NUMBER anlegen', 'Erzeuge eine kleine Tabelle mit Primärschlüssel und NUMBER-Spalte; kontrolliere danach den Eintrag.', 'CREATE TABLE practice_scores (id NUMBER PRIMARY KEY, score NUMBER NOT NULL); INSERT INTO practice_scores VALUES (1, 95)', ['total', [[1]]], 'SELECT COUNT(*) AS total FROM practice_scores'],
    ['VARCHAR2 und NOT NULL', 'Lege eine Tabelle mit verpflichtendem Namen an und füge eine Zeile ein.', "CREATE TABLE practice_members (id NUMBER PRIMARY KEY, name VARCHAR2(40) NOT NULL); INSERT INTO practice_members VALUES (1, 'Ari')", ['name', [['Ari']]], 'SELECT name FROM practice_members'],
    ['DATE-Spalte definieren', 'Lege eine Oracle-artige DATE-Spalte an und speichere ein ISO-Datum.', "CREATE TABLE practice_events (id NUMBER PRIMARY KEY, event_date DATE); INSERT INTO practice_events VALUES (1, TO_DATE('2025-06-01', 'YYYY-MM-DD'))", ['event_date', [['2025-06-01']]], 'SELECT event_date FROM practice_events'],
  ]],
];

export const sqlCurriculum = lessons.map(([title, exercises], chapterIndex) => ({
  id: `sql-c${chapterIndex + 1}`,
  title,
  exercises: exercises.map((entry, exerciseIndex) => {
    const [exerciseTitle, description, starter, ...spec] = entry;
    const verifyQuery = typeof spec.at(-1) === 'string' ? spec.pop() : null;
    let columns, values;
    if (spec.length === 1) {
      const expected = spec[0];
      if (expected.length === 2) [columns, values] = expected;
      else { values = expected.at(-1); columns = expected.slice(0, -1); }
      if (typeof columns === 'string') columns = [columns];
    } else {
      values = spec.pop();
      columns = spec;
    }
    if (!Array.isArray(values)) throw new Error(`Invalid result example: ${exerciseTitle} ${JSON.stringify(spec)}`);
    const result = { columns, rows: values.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]]))) };
    return {
      id: `sql-c${chapterIndex + 1}-${exerciseIndex + 1}`,
      title: exerciseTitle,
      description,
      starter,
      solution: starter,
      result,
      verifyQuery: verifyQuery || null,
      xp: 10,
      hint: [
        `Überlege, welche Tabelle oder welcher SQL-Baustein für „${exerciseTitle}“ gebraucht wird.`,
        'Oracle-SQL wird hier tatsächlich von einer lokalen Datenbank-Engine ausgeführt. Spaltennamen und Werte kannst du in der Tabellenübersicht nachsehen.',
        'Starte mit SELECT ... FROM ... und ergänze dann den passenden Ausdruck oder die Filterbedingung.',
      ],
      playgroundType: 'sqlOracleSubset',
    };
  }),
}));

export const sqlExerciseCount = sqlCurriculum.reduce((sum, chapter) => sum + chapter.exercises.length, 0);

