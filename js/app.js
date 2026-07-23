/**
 * SAFIA MOBILE SPA APPLICATION LOGIC
 * Integrates DataLoader, MenuManager, StandardsManager, StorageManager, FlashcardManager, and QuizManager.
 */

// STATE MANAGEMENT
const AppState = {
  activeTab: 'kitchen', // 'kitchen', 'bar', 'standards', 'cards', 'test'
  dishes: [],
  drinks: [],
  standards: null,
  confirmedMap: JSON.parse(localStorage.getItem('safia_confirmed_v2') || '{}'),
  imageErrorSet: new Set()
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
  initRouter();
  
  // Load data via DataLoader
  const data = await DataLoader.loadAll();
  AppState.dishes = data.dishes;
  AppState.drinks = data.drinks;
  AppState.standards = data.standards;

  renderActiveView();
});

// SPA ROUTER LOGIC
function initRouter() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.dataset.tab;
      if (targetTab) {
        switchTab(targetTab);
      }
    });
  });
}

function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Update Nav Items active class
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.tab === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update View Sections visibility
  document.querySelectorAll('.view-section').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Scroll to top on tab switch
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render view content
  renderActiveView();
}

// VIEW RENDERER DISPATCHER
function renderActiveView() {
  switch (AppState.activeTab) {
    case 'kitchen':
      MenuManager.renderKitchen(AppState.dishes);
      break;
    case 'bar':
      MenuManager.renderBar(AppState.drinks);
      break;
    case 'standards':
      StandardsManager.render('view-standards');
      break;
    case 'cards':
      FlashcardManager.render('view-cards');
      break;
    case 'test':
      QuizManager.render('view-test');
      break;
  }
}

// IMAGE ERROR HANDLER (RED BORDER REQUIREMENT)
function handleCardImgError(imgEl, itemKey) {
  imgEl.style.display = 'none';
  if (imgEl.parentElement) {
    imgEl.parentElement.classList.add('img-failed');
  }
  const card = document.getElementById(`card-${itemKey}`);
  if (card) {
    card.classList.add('has-img-error');
  }
  AppState.imageErrorSet.add(itemKey);
}

// TOGGLE CONFIRMATION
function toggleItemConfirmation(itemKey, isChecked) {
  if (isChecked) {
    AppState.confirmedMap[itemKey] = true;
  } else {
    delete AppState.confirmedMap[itemKey];
  }
  localStorage.setItem('safia_confirmed_v2', JSON.stringify(AppState.confirmedMap));

  const card = document.getElementById(`card-${itemKey}`);
  if (card) {
    if (isChecked) card.classList.add('is-confirmed');
    else card.classList.remove('is-confirmed');
  }
}

// LIGHTBOX MODAL FUNCTION
function openImageModal(src, title) {
  let modal = document.getElementById('app-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.classList.remove('active');
    modal.innerHTML = `
      <div class="modal-content">
        <img id="modal-img" src="" alt="Zoom image">
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('modal-img').src = src;
  modal.classList.add('active');
}

// UTILS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
