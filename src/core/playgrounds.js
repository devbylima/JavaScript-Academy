export const PLAYGROUND_TYPES = Object.freeze({
  console: { label: 'Code-Ausgabe', description: 'Führe deinen JavaScript-Code aus und untersuche Logs und Fehler.' },
  dom: { label: 'Interaktive DOM-Vorschau', description: 'Der eingegebene Code läuft gegen dieses isolierte HTML. Klicke danach selbst auf die Elemente.' },
  sqlOracleSubset: { label: 'Oracle-SQL-Simulator', description: 'Echte Abfragen laufen lokal in einer Datenbank-Engine; unterstützt ist ein dokumentierter Oracle-Syntax-Ausschnitt.' },
});

export function getPlaygroundType(exercise) {
  return exercise.playgroundType || (exercise.isDom ? 'dom' : 'console');
}


