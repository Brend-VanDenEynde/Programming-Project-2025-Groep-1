/**
 * Favorites Storage Utility
 * Beheert favoriet bedrijven in localStorage voor studenten
 */

/**
 * Verkrijgt de localStorage key voor favoriten van een specifieke student
 * @param {string|number} studentId - ID van de student
 * @returns {string} localStorage key
 */
function getFavoritesKey(studentId) {
  return `student_favorites_${studentId}`;
}

/**
 * Haalt alle favoriete bedrijven op voor een student
 * @param {string|number} studentId - ID van de student
 * @returns {Array} Array van bedrijfs-IDs
 */
export function getFavoriteCompanies(studentId) {
  if (!studentId) return [];

  try {
    const favoritesJson = localStorage.getItem(getFavoritesKey(studentId));
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    // Silently handle localStorage errors
    return [];
  }
}

/**
 * Voegt een bedrijf toe aan favorieten van een student
 * @param {string|number} studentId - ID van de student
 * @param {string|number} companyId - ID van het bedrijf
 * @returns {boolean} True als succesvol toegevoegd
 */
export function addFavoriteCompany(studentId, companyId) {
  if (!studentId || !companyId) return false;

  try {
    const favorites = getFavoriteCompanies(studentId);
    const companyIdStr = companyId.toString();

    // Controleer of bedrijf al in favorieten staat
    if (favorites.includes(companyIdStr)) {
      return false; // Al toegevoegd
    }

    favorites.push(companyIdStr);
    localStorage.setItem(getFavoritesKey(studentId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Verwijdert een bedrijf uit favorieten van een student
 * @param {string|number} studentId - ID van de student
 * @param {string|number} companyId - ID van het bedrijf
 * @returns {boolean} True als succesvol verwijderd
 */
export function removeFavoriteCompany(studentId, companyId) {
  if (!studentId || !companyId) return false;

  try {
    const favorites = getFavoriteCompanies(studentId);
    const companyIdStr = companyId.toString();
    const index = favorites.indexOf(companyIdStr);

    if (index === -1) {
      return false; // Niet gevonden in favorieten
    }

    favorites.splice(index, 1);
    localStorage.setItem(getFavoritesKey(studentId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Controleert of een bedrijf in de favorieten van een student staat
 * @param {string|number} studentId - ID van de student
 * @param {string|number} companyId - ID van het bedrijf
 * @returns {boolean} True als favoriet
 */
export function isCompanyFavorite(studentId, companyId) {
  if (!studentId || !companyId) return false;

  const favorites = getFavoriteCompanies(studentId);
  return favorites.includes(companyId.toString());
}

/**
 * Wisselt de favoriet status van een bedrijf (toggle)
 * @param {string|number} studentId - ID van de student
 * @param {string|number} companyId - ID van het bedrijf
 * @returns {boolean} True als nu favoriet, false als verwijderd
 */
export function toggleFavoriteCompany(studentId, companyId) {
  if (isCompanyFavorite(studentId, companyId)) {
    removeFavoriteCompany(studentId, companyId);
    return false;
  } else {
    addFavoriteCompany(studentId, companyId);
    return true;
  }
}

/**
 * Verkrijgt het aantal favoriete bedrijven voor een student
 * @param {string|number} studentId - ID van de student
 * @returns {number} Aantal favorieten
 */
export function getFavoritesCount(studentId) {
  const favorites = getFavoriteCompanies(studentId);
  return favorites.length;
}

/**
 * Filtert een lijst bedrijven om alleen favorieten te tonen
 * @param {Array} companies - Array van bedrijf objecten
 * @param {string|number} studentId - ID van de student
 * @param {string} companyIdField - Naam van het veld met bedrijfs-ID (standaard: 'gebruiker_id')
 * @returns {Array} Array van favoriete bedrijven
 */
export function filterFavoriteCompanies(
  companies,
  studentId,
  companyIdField = 'gebruiker_id'
) {
  if (!companies || !Array.isArray(companies) || !studentId) {
    return [];
  }

  const favorites = getFavoriteCompanies(studentId);
  return companies.filter((company) =>
    favorites.includes(company[companyIdField]?.toString())
  );
}

/**
 * Wist alle favorieten voor een student (bijv. bij account verwijdering)
 * @param {string|number} studentId - ID van de student
 * @returns {boolean} True als succesvol gewist
 */
export function clearAllFavorites(studentId) {
  if (!studentId) return false;

  try {
    localStorage.removeItem(getFavoritesKey(studentId));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}

/**
 * Export alle favorieten voor backup/migratie doeleinden
 * @param {string|number} studentId - ID van de student
 * @returns {Object} Object met metadata en favoriet data
 */
export function exportFavorites(studentId) {
  const favorites = getFavoriteCompanies(studentId);
  return {
    studentId: studentId,
    favorites: favorites,
    exportDate: new Date().toISOString(),
    count: favorites.length,
  };
}

/**
 * Importeert favorieten van backup (overschrijft bestaande)
 * @param {string|number} studentId - ID van de student
 * @param {Array} favorites - Array van bedrijfs-IDs
 * @returns {boolean} True als succesvol geïmporteerd
 */
export function importFavorites(studentId, favorites) {
  if (!studentId || !Array.isArray(favorites)) return false;

  try {
    localStorage.setItem(getFavoritesKey(studentId), JSON.stringify(favorites));
    return true;
  } catch (error) {
    // Silently handle localStorage errors
    return false;
  }
}
