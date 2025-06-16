// src/pages/bedrijf/bedrijf-studenten.js
import {
  createBedrijfNavbar,
  setupBedrijfNavbarEvents,
} from '../../utils/bedrijf-navbar.js';

export function renderBedrijfStudenten(rootElement, bedrijfData) {
  rootElement.innerHTML = `
    ${createBedrijfNavbar('studenten')}
          <div class="content-header">
            <h1>Studenten Overzicht</h1>
            <p>Bekijk alle geregistreerde studenten en hun profielen</p>
          </div>

          <div class="students-filters">
            <div class="filter-group">
              <label for="study-filter">Filter op studierichting:</label>
              <select id="study-filter">
                <option value="">Alle studierichtingen</option>
                <option value="informatica">Informatica</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="engineering">Engineering</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="year-filter">Filter op studiejaar:</label>
              <select id="year-filter">
                <option value="">Alle jaren</option>
                <option value="1">1e jaar</option>
                <option value="2">2e jaar</option>
                <option value="3">3e jaar</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div class="search-group">
              <label for="student-search">Zoek student:</label>
              <input type="text" id="student-search" placeholder="Zoek op naam of email...">
            </div>
          </div>

          <div class="students-grid" id="students-grid">
            <div class="loading-message">
              <p>Studenten laden...</p>
            </div>
          </div>

          <div class="pagination" id="pagination" style="display: none;">
            <button id="prev-page" disabled>Vorige</button>
            <span id="page-info">Pagina 1 van 1</span>
            <button id="next-page" disabled>Volgende</button>
          </div>        </div>
      </div>

      <footer class="bedrijf-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Setup navbar events
  setupBedrijfNavbarEvents();

  // Setup students page functionality
  setupStudentsPage();
}

function setupStudentsPage() {
  let currentPage = 1;
  let studentsPerPage = 12;
  let allStudents = [];
  let filteredStudents = [];

  // Load students data
  loadStudents();

  // Setup filter event listeners
  document
    .getElementById('study-filter')
    ?.addEventListener('change', filterStudents);
  document
    .getElementById('year-filter')
    ?.addEventListener('change', filterStudents);
  document
    .getElementById('student-search')
    ?.addEventListener('input', filterStudents);

  // Setup pagination
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayStudents();
      updatePagination();
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayStudents();
      updatePagination();
    }
  });

  async function loadStudents() {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate with some sample data
      allStudents = generateSampleStudents();
      filteredStudents = [...allStudents];
      displayStudents();
      updatePagination();
    } catch (error) {
      console.error('Error loading students:', error);
      const gridElement = document.getElementById('students-grid');
      if (gridElement) {
        gridElement.innerHTML = `
          <div class="error-message">
            <p>Er ging iets mis bij het laden van de studenten.</p>
            <button onclick="location.reload()">Probeer opnieuw</button>
          </div>
        `;
      }
    }
  }

  function filterStudents() {
    const studyFilter = document.getElementById('study-filter')?.value || '';
    const yearFilter = document.getElementById('year-filter')?.value || '';
    const searchTerm =
      document.getElementById('student-search')?.value.toLowerCase() || '';

    filteredStudents = allStudents.filter((student) => {
      const matchesStudy = !studyFilter || student.studyField === studyFilter;
      const matchesYear = !yearFilter || student.studyYear === yearFilter;
      const matchesSearch =
        !searchTerm ||
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm);

      return matchesStudy && matchesYear && matchesSearch;
    });

    currentPage = 1;
    displayStudents();
    updatePagination();
  }

  function displayStudents() {
    const gridElement = document.getElementById('students-grid');
    if (!gridElement) return;

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);

    if (studentsToShow.length === 0) {
      gridElement.innerHTML = `
        <div class="no-results">
          <p>Geen studenten gevonden met de huidige filters.</p>
        </div>
      `;
      return;
    }

    gridElement.innerHTML = studentsToShow
      .map(
        (student) => `
      <div class="student-card" data-student-id="${student.id}">
        <div class="student-avatar">
          <img src="${student.avatar || '/src/images/default.png'}" alt="${
          student.name
        }" />
        </div>
        <div class="student-info">
          <h3>${student.name}</h3>
          <p class="student-email">${student.email}</p>
          <p class="student-study">${student.studyField} - ${
          student.studyYear
        }e jaar</p>
          <div class="student-skills">
            ${student.skills
              .slice(0, 3)
              .map((skill) => `<span class="skill-tag">${skill}</span>`)
              .join('')}
            ${
              student.skills.length > 3
                ? `<span class="skill-more">+${
                    student.skills.length - 3
                  }</span>`
                : ''
            }
          </div>
        </div>
        <div class="student-actions">
          <button class="btn-primary" onclick="viewStudentProfile('${
            student.id
          }')">
            Bekijk Profiel
          </button>
          <button class="btn-secondary" onclick="inviteToSpeeddate('${
            student.id
          }')">
            Uitnodigen
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  function updatePagination() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const paginationElement = document.getElementById('pagination');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (totalPages <= 1) {
      paginationElement.style.display = 'none';
      return;
    }

    paginationElement.style.display = 'flex';
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageInfo.textContent = `Pagina ${currentPage} van ${totalPages}`;
  }

  // Make functions globally available for onclick handlers
  window.viewStudentProfile = (studentId) => {
    // Navigate to student detail view
    console.log('Viewing student profile:', studentId);
    // In a real app, you would navigate to a student detail page
    alert(`Student profiel bekijken: ${studentId}`);
  };

  window.inviteToSpeeddate = (studentId) => {
    // Send speeddate invitation
    console.log('Inviting student to speeddate:', studentId);
    const student = allStudents.find((s) => s.id === studentId);
    if (
      student &&
      confirm(`Wil je ${student.name} uitnodigen voor een speeddate?`)
    ) {
      alert(`Uitnodiging verstuurd naar ${student.name}!`);
    }
  };
}

function generateSampleStudents() {
  const names = [
    'Jan Janssen',
    'Marie De Vries',
    'Pieter Peters',
    'Lisa Van Der Berg',
    'Tom Willems',
    'Sara Claes',
    'David Mertens',
    'Emma De Wit',
    'Lucas Van Damme',
    'Noor Peeters',
  ];
  const studyFields = ['informatica', 'business', 'marketing', 'engineering'];
  const skills = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'Marketing',
    'Design',
    'Project Management',
    'Communication',
    'Leadership',
  ];

  return Array.from({ length: 25 }, (_, index) => ({
    id: `student-${index + 1}`,
    name: names[index % names.length],
    email: `student${index + 1}@ehb.be`,
    studyField: studyFields[Math.floor(Math.random() * studyFields.length)],
    studyYear: Math.floor(Math.random() * 3) + 1,
    skills: skills
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2),
    avatar: null,
  }));
}
