// Admin bedrijven in behandeling pagina
import Router from '../../router.js';
import { logoutUser } from '../../utils/auth-api.js';
import ehbLogo from '../../images/EhB-logo-transparant.png';

export async function renderAdminBedrijvenInBehandeling(rootElement) {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const adminUsername = sessionStorage.getItem('adminUsername');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Redirect to admin login if not logged in
    Router.navigate('/admin-login');
    return;
  }

  rootElement.innerHTML = `
    <div class="admin-dashboard-clean">
      <header class="admin-header-clean">        <div class="admin-logo-section">
          <img src="${ehbLogo}" alt="Logo" width="40" height="40">
          <span>EhB Career Launch</span>
        </div><div class="admin-header-right">
          <span class="admin-username">Welkom, ${adminUsername}</span>
          <button id="logout-btn" class="logout-btn-clean">Uitloggen</button>
          <button id="menu-toggle" class="menu-toggle-btn">☰</button>
        </div>
      </header>
      
      <div class="admin-main-layout">
        <aside class="admin-sidebar-clean">
          <nav class="admin-nav">            <ul>
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-studenten">Ingeschreven studenten</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/ingeschreven-bedrijven">Ingeschreven Bedrijven</button></li>
              <li><button class="nav-btn active" data-route="/admin-dashboard/bedrijven-in-behandeling">Bedrijven in behandeling</button></li>
              <li><button class="nav-btn" data-route="/admin-dashboard/contacten">Contacten</button></li>
            </ul>
          </nav>
        </aside>
        
        <main class="admin-content-clean">
          <div class="admin-section-header">
            <h1 id="section-title">Bedrijven in Behandeling</h1>          </div>            <div class="admin-content-area" id="content-area">            <div class="processing-list">
              <!-- Companies will be populated by API call -->
            </div>
          </div>
        </main>
      </div>
        
      <!-- FOOTER -->
      <footer class="student-profile-footer">
        <a id="privacy-policy" href="/privacy">Privacy Policy</a> |
        <a id="contacteer-ons" href="/contact">Contacteer Ons</a>
      </footer>
    </div>
  `;

  // Fetch unapproved companies from API
  const accessToken = sessionStorage.getItem('accessToken');
  try {
    const response = await fetch(
      'https://api.ehb-match.me/bedrijven/nietgoedgekeurd',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const companies = await response.json();

    const companyListContainer = document.querySelector('.processing-list');
    companyListContainer.innerHTML = ''; // Clear existing content

    // Ensure data-company-id is correctly set when rendering companies
    if (companies.length === 0) {
      companyListContainer.innerHTML =
        '<p>Geen bedrijven gevonden die zich hebben ingeschreven.</p>';
    } else {
      companies.forEach((company) => {
        const companyItem = document.createElement('div');
        companyItem.className = 'processing-item clickable-processing';
        companyItem.setAttribute(
          'data-company-id',
          company.gebruiker_id || 'unknown'
        ); // Gebruik gebruiker_id als ID

        companyItem.innerHTML = `
          <span class="processing-company-name">${company.naam}</span>
          <div class="processing-actions">
            <button class="approve-btn" data-company="${company.naam}" title="Goedkeuren">✓</button>
            <button class="reject-btn" data-company="${company.naam}" title="Afwijzen">✕</button>
          </div>
        `;

        companyListContainer.appendChild(companyItem);
      });
    }
  } catch (error) {
    console.error('Error fetching unapproved companies:', error);
  }

  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = null;
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      window.sessionStorage.clear();
      localStorage.clear();
      Router.navigate('/');
    });
  }

  // Handle navigation between sections
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      Router.navigate(route);
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar-clean');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // FOOTER LINKS
  document.getElementById('privacy-policy').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/privacy');
  });
  document.getElementById('contacteer-ons').addEventListener('click', (e) => {
    e.preventDefault();
    Router.navigate('/contact');
  }); // Handle approve/reject buttons
  const approveButtons = document.querySelectorAll('.approve-btn');
  const rejectButtons = document.querySelectorAll('.reject-btn');

  // Update click event listener for processing items to use the correct route
  const clickableProcessingItems = document.querySelectorAll(
    '.clickable-processing'
  );
  clickableProcessingItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      // Prevent navigation if clicking on action buttons
      if (
        e.target.classList.contains('approve-btn') ||
        e.target.classList.contains('reject-btn')
      ) {
        return;
      }

      // Retrieve the companyId from the dataset
      const companyId = item.getAttribute('data-company-id');
      if (companyId && companyId !== 'unknown') {
        Router.navigate(
          `/admin-dashboard/processing-company-detail?id=${companyId}`
        );
      } else {
        alert('Fout: Bedrijfs-ID ontbreekt. Neem contact op met de beheerder.');
        console.error(
          'Company ID is missing or undefined for the clicked item.'
        );
      }
    });
  });

  // Add click event listener to navigate to processing company detail page
  document.querySelectorAll('.clickable-company').forEach((companyItem) => {
    companyItem.addEventListener('click', () => {
      const companyId = companyItem.dataset.companyId;
      Router.navigate(
        `/admin-dashboard/processing-company-detail?id=${companyId}`
      );
    });
  });
  approveButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const companyName = btn.dataset.company;
      const companyItem = btn.closest('.processing-item');
      const companyId = companyItem.getAttribute('data-company-id');

      if (!companyId || companyId === 'unknown') {
        alert('Fout: Bedrijfs-ID ontbreekt. Kan het bedrijf niet goedkeuren.');
        return;
      }

      if (confirm(`Weet je zeker dat je ${companyName} wilt goedkeuren?`)) {
        try {
          // Disable the button to prevent double-clicks
          btn.disabled = true;
          btn.textContent = '...';

          // Call the API to approve the company
          const accessToken = sessionStorage.getItem('accessToken');
          const response = await fetch(
            `https://api.ehb-match.me/bedrijven/keur/${companyId}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log('Company approved successfully:', result); // Remove the item from the list
            companyItem.remove();

            // Check if list is empty BEFORE navigating
            const processingList = document.querySelector('.processing-list');
            if (processingList && processingList.children.length === 0) {
              processingList.innerHTML =
                '<div class="empty-state"><p>Geen bedrijven in behandeling</p></div>';
            }

            alert(
              `${companyName} is goedgekeurd en toegevoegd aan ingeschreven bedrijven.`
            );

            // Navigate to ingeschreven bedrijven after successful approval
            Router.navigate('/admin-dashboard/ingeschreven-bedrijven');
          } else {
            // Handle error responses
            let errorMessage =
              'Er is een fout opgetreden bij het goedkeuren van het bedrijf.';

            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (e) {
              // If we can't parse the error, use default message
            }

            if (response.status === 403) {
              errorMessage =
                'Je hebt geen toestemming om bedrijven goed te keuren.';
            } else if (response.status === 404) {
              errorMessage = 'Het bedrijf werd niet gevonden.';
            }

            alert(errorMessage);

            // Re-enable the button
            btn.disabled = false;
            btn.textContent = '✓';
          }
        } catch (error) {
          console.error('Error approving company:', error);
          alert('Er is een netwerkfout opgetreden. Probeer het later opnieuw.');

          // Re-enable the button
          btn.disabled = false;
          btn.textContent = '✓';
        }
      }
    });
  });
  rejectButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const companyName = btn.dataset.company;
      const companyItem = btn.closest('.processing-item');
      const companyId = companyItem.getAttribute('data-company-id');

      if (!companyId || companyId === 'unknown') {
        alert('Fout: Bedrijfs-ID ontbreekt. Kan het bedrijf niet afwijzen.');
        return;
      }

      if (
        confirm(
          `Weet je zeker dat je ${companyName} wilt afwijzen? Dit zal het bedrijf permanent verwijderen uit het systeem.`
        )
      ) {
        try {
          // Disable the button to prevent double-clicks
          btn.disabled = true;
          btn.textContent = '...';

          // Call the DELETE user endpoint to reject/delete the company
          const accessToken = sessionStorage.getItem('accessToken');
          const response = await fetch(
            `https://api.ehb-match.me/user/${companyId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 204) {
            // 204 No Content - successful deletion
            console.log('Company deleted successfully'); // Remove the item from the list
            companyItem.remove();
            alert(
              `${companyName} is afgewezen en permanent verwijderd uit het systeem.`
            );

            // Check if list is empty
            const processingList = document.querySelector('.processing-list');
            if (processingList && processingList.children.length === 0) {
              processingList.innerHTML =
                '<div class="empty-state"><p>Geen bedrijven in behandeling</p></div>';
            }
          } else {
            // Handle error responses
            let errorMessage =
              'Er is een fout opgetreden bij het afwijzen van het bedrijf.';

            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (e) {
              // If we can't parse the error, use default message
            }

            if (response.status === 403) {
              errorMessage =
                'Je hebt geen toestemming om bedrijven af te wijzen.';
            } else if (response.status === 404) {
              errorMessage = 'Het bedrijf werd niet gevonden.';
            }

            alert(errorMessage);

            // Re-enable the button
            btn.disabled = false;
            btn.textContent = '✕';
          }
        } catch (error) {
          console.error('Error rejecting company:', error);
          alert('Er is een netwerkfout opgetreden. Probeer het later opnieuw.');

          // Re-enable the button
          btn.disabled = false;
          btn.textContent = '✕';
        }
      }
    });
  });
  document.title = 'Bedrijven in Behandeling - Admin Dashboard';

  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener('click', () => {
      Router.navigate('/admin-dashboard/bedrijven-in-behandeling');
    });
  }
}
