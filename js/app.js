/**
 * SAFIA MOBILE SPA APPLICATION LOGIC
 * Integrates DataLoader, MenuManager, StandardsManager, StorageManager,
 * FlashcardManager, QuizManager, and i18n multi-language support.
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
  initI18n();

  // Load data via DataLoader
  const data = await DataLoader.loadAll();
  AppState.dishes = data.dishes;
  AppState.drinks = data.drinks;
  AppState.standards = data.standards;

  renderActiveView();
});

// MULTI-LANGUAGE LISTENER
function initI18n() {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = I18n.getLang();
  }

  document.addEventListener('safia_lang_changed', (e) => {
    updateUiLanguage();
    renderActiveView();
  });

  updateUiLanguage();
}

function updateUiLanguage() {
  const sub = document.getElementById('txt-brand-sub');
  if (sub) sub.innerText = I18n.t('brandSub');

  const adminBtn = document.getElementById('txt-admin-btn');
  if (adminBtn) adminBtn.innerText = I18n.t('adminBtn');

  // Update nav labels
  const tabK = document.getElementById('tab-label-kitchen');
  if (tabK) tabK.innerText = I18n.t('tabKitchen');

  const tabB = document.getElementById('tab-label-bar');
  if (tabB) tabB.innerText = I18n.t('tabBar');

  const tabS = document.getElementById('tab-label-standards');
  if (tabS) tabS.innerText = I18n.t('tabStandards');

  const tabC = document.getElementById('tab-label-cards');
  if (tabC) tabC.innerText = I18n.t('tabCards');

  const tabT = document.getElementById('tab-label-test');
  if (tabT) tabT.innerText = I18n.t('tabTest');
}

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

  window.scrollTo({ top: 0, behavior: 'smooth' });
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
