// Opleidingen EhB Campus Kaai Anderlecht
// Waarde 1 = Toegepaste Informatica (API: opleiding_id: 1)

export const opleidingen = [
  { id: 1, naam: 'Toegepaste Informatica' },
  { id: 2, naam: 'Multimedia & Creative Technologies' },
  { id: 3, naam: 'Programmeren' },
  { id: 4, naam: 'Systeem- & Netwerkbeheer' },
  { id: 5, naam: 'Internet of Things' },
  { id: 6, naam: 'Elektromechanische Systemen' },
];

// Helper: geef de naam van de opleiding op basis van id
export function getOpleidingNaamById(id) {
  const opleiding = opleidingen.find((o) => String(o.id) === String(id));
  return opleiding ? opleiding.naam : 'Onbekend of niet ingevuld';
}
