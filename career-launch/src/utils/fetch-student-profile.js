// Utility: Haal student-profiel en user-info op en zet altijd id en gebruiker_id in sessionStorage
export async function fetchAndStoreStudentProfile() {
  const token = sessionStorage.getItem('authToken');
  if (!token) throw new Error('Geen authToken gevonden');
  // 1. User ophalen
  const respUser = await fetch('https://api.ehb-match.me/auth/info', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!respUser.ok) throw new Error('Kan user-info niet ophalen');
  const user = (await respUser.json()).user;
  if (!user || !user.id) throw new Error('User info onvolledig');
  // 2. Student ophalen (user.id == student.id)
  const respStudent = await fetch(`https://api.ehb-match.me/studenten/${user.id}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!respStudent.ok) throw new Error('Kan student niet ophalen');
  const student = await respStudent.json();
  // 3. Combineer/opslaan (ook gebruiker_id voor backward compatibility)
  const combined = { ...student, id: user.id, gebruiker_id: user.id, email: user.email };
  sessionStorage.setItem('studentData', JSON.stringify(combined));
  return combined;
}
