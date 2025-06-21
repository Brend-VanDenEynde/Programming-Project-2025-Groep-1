/**
 * Bedrijf Favorites Storage Utility
 * Beheert favoriet studenten in localStorage voor bedrijven
 */

/**
 * Verkrijgt de localStorage key voor favoriten van een specifiek bedrijf
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @returns {string} localStorage key
 */
function getFavoritesKey(bedrijfId) {
  return `bedrijf_favorites_${bedrijfId}`;
}

/**
 * Haalt alle favoriete studenten op voor een bedrijf
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @returns {Array} Array van student-IDs
 */
export function getFavoriteStudents(bedrijfId) {
  if (!bedrijfId) return [];

  try {
    const favoritesJson = localStorage.getItem(getFavoritesKey(bedrijfId));
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    // Silently handle localStorage errors
    return [];
  }
}

/**
 * Voegt een student toe aan favorieten van een bedrijf
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {string|number} studentId - ID van de student
 * @returns {boolean} True als succesvol toegevoegd
 */
export function addFavoriteStudent(bedrijfId, studentId) {
  if (!bedrijfId || !studentId) return false;

  try {
    const favorites = getFavoriteStudents(bedrijfId);
    const studentIdStr = studentId.toString();

    // Controleer of student al in favorieten staat
    if (favorites.includes(studentIdStr)) {
      return false; // Al toegevoegd
    }

    favorites.push(studentIdStr);
    localStorage.setItem(getFavoritesKey(bedrijfId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Verwijdert een student uit favorieten van een bedrijf
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {string|number} studentId - ID van de student
 * @returns {boolean} True als succesvol verwijderd
 */
export function removeFavoriteStudent(bedrijfId, studentId) {
  if (!bedrijfId || !studentId) return false;

  try {
    const favorites = getFavoriteStudents(bedrijfId);
    const studentIdStr = studentId.toString();
    const index = favorites.indexOf(studentIdStr);

    if (index === -1) {
      return false; // Niet gevonden in favorieten
    }

    favorites.splice(index, 1);
    localStorage.setItem(getFavoritesKey(bedrijfId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Controleert of een student in de favorieten van een bedrijf staat
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {string|number} studentId - ID van de student
 * @returns {boolean} True als favoriet
 */
export function isStudentFavorite(bedrijfId, studentId) {
  if (!bedrijfId || !studentId) return false;

  const favorites = getFavoriteStudents(bedrijfId);
  return favorites.includes(studentId.toString());
}

/**
 * Wisselt de favoriet status van een student (toggle)
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {string|number} studentId - ID van de student
 * @returns {boolean} True als nu favoriet, false als verwijderd
 */
export function toggleFavoriteStudent(bedrijfId, studentId) {
  if (isStudentFavorite(bedrijfId, studentId)) {
    removeFavoriteStudent(bedrijfId, studentId);
    return false;
  } else {
    addFavoriteStudent(bedrijfId, studentId);
    return true;
  }
}

/**
 * Verkrijgt het aantal favoriete studenten voor een bedrijf
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @returns {number} Aantal favorieten
 */
export function getFavoritesCount(bedrijfId) {
  const favorites = getFavoriteStudents(bedrijfId);
  return favorites.length;
}

/**
 * Filtert een lijst studenten om alleen favorieten te tonen
 * @param {Array} students - Array van student objecten
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {string} studentIdField - Naam van het veld met student-ID (standaard: 'gebruiker_id')
 * @returns {Array} Array van favoriete studenten
 */
export function filterFavoriteStudents(
  students,
  bedrijfId,
  studentIdField = 'gebruiker_id'
) {
  if (!students || !Array.isArray(students) || !bedrijfId) {
    return [];
  }

  const favorites = getFavoriteStudents(bedrijfId);
  return students.filter((student) =>
    favorites.includes(student[studentIdField]?.toString())
  );
}

/**
 * Wist alle favorieten voor een bedrijf (bijv. bij account verwijdering)
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @returns {boolean} True als succesvol gewist
 */
export function clearAllFavorites(bedrijfId) {
  if (!bedrijfId) return false;

  try {
    localStorage.removeItem(getFavoritesKey(bedrijfId));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Export alle favorieten voor backup/migratie doeleinden
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @returns {Object} Object met metadata en favoriet data
 */
export function exportFavorites(bedrijfId) {
  const favorites = getFavoriteStudents(bedrijfId);
  return {
    bedrijfId: bedrijfId,
    favorites: favorites,
    exportDate: new Date().toISOString(),
    count: favorites.length,
  };
}

/**
 * Importeert favorieten van backup (overschrijft bestaande)
 * @param {string|number} bedrijfId - ID van het bedrijf
 * @param {Array} favorites - Array van student-IDs
 * @returns {boolean} True als succesvol geïmporteerd
 */
export function importFavorites(bedrijfId, favorites) {
  if (!bedrijfId || !Array.isArray(favorites)) return false;

  try {
    localStorage.setItem(getFavoritesKey(bedrijfId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}
