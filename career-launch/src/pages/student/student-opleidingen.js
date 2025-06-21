// Opleidingen EhB Campus Kaai Anderlecht
// Waarde 1 = Toegepaste Informatica (API: opleiding_id: 1)

export const opleidingen = [
  { id: 1, naam: 'Toegepaste Informatica' },
  { id: 2, naam: 'Biomedische Laboratoriumtechnologie' },
  { id: 3, naam: 'Chemie' },
  { id: 4, naam: 'Elektromechanica' },
  { id: 5, naam: 'Elektronica-ICT' },
  { id: 6, naam: 'Ontwerp- en Productietechnologie' },
  { id: 7, naam: 'Multimedia en Creatieve Technologie' },
  { id: 8, naam: 'Energietechnologie' },
];

// Helper: geef de naam van de opleiding op basis van id
export function getOpleidingNaamById(id) {
  const opleiding = opleidingen.find((o) => String(o.id) === String(id));
  return opleiding ? opleiding.naam : 'Onbekend of niet ingevuld';
}
