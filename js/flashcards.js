/**
 * SAFIA FLASHCARDS GAMIFIED TRAINER MODULE
 * Features 3D card flip animation, 2 modes (Oshxona & Bar),
 * progress tracking via StorageManager, and completion screens.
 */

const FlashcardManager = (function() {
  let currentMode = 'kitchen'; // 'kitchen' or 'bar'
  let currentIndex = 0;
  let activeDeck = [];
  let isFlipped = false;

  function init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Load items based on currentMode
    const rawItems = currentMode === 'kitchen' ? DataLoader.getDishes() : DataLoader.getDrinks();
    
    // Attach type prefix
    activeDeck = rawItems.map(item => ({
      ...item,
      itemKey: `${currentMode === 'kitchen' ? 'dishes' : 'drinks'}-${item.id}`
    }));

    if (activeDeck.length === 0) {
      container.innerHTML = '<div class="empty-menu-state">Kartochkalar mavjud emas</div>';
      return;
    }

    render(container);
  }

  function render(container) {
    const totalItems = activeDeck.length;
    const learnedCount = activeDeck.filter(item => StorageManager.isLearned(item.itemKey)).length;
    const percent = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;

    // Check if 100% completed
    const unlearnedDeck = activeDeck.filter(item => !StorageManager.isLearned(item.itemKey));

    if (unlearnedDeck.length === 0 && totalItems > 0) {
      renderCompletionScreen(container, totalItems);
      return;
    }

    // Ensure currentIndex is within unlearnedDeck bounds
    const currentItem = unlearnedDeck[currentIndex % unlearnedDeck.length];

    let html = `
      <div class="flashcards-wrapper">
        
        <!-- MODE SWITCHER TABS -->
        <div class="category-chips-scroll" style="justify-content: center; margin-bottom: 14px;">
          <button class="chip-btn ${currentMode === 'kitchen' ? 'active' : ''}"
                  onclick="FlashcardManager.switchMode('kitchen')">
            🍽 Oshxona (Rasm → Nom & Tarkib)
          </button>
          <button class="chip-btn ${currentMode === 'bar' ? 'active' : ''}"
                  onclick="FlashcardManager.switchMode('bar')">
            ☕️ Bar (Nom → Tarkib & Servirovka)
          </button>
        </div>

        <!-- PROGRESS BAR HEADER -->
        <div class="card-progress-header" style="margin-bottom: 16px;">
          <div class="progress-info">
            <span>O'rganish jarayoni: <strong>${learnedCount} / ${totalItems}</strong></span>
            <span>${percent}%</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        <!-- 3D FLIP CARD -->
        <div class="flashcard-wrapper" onclick="FlashcardManager.toggleFlip()">
          <div class="flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard-element">
            ${currentMode === 'kitchen' ? renderKitchenCardFace(currentItem) : renderBarCardFace(currentItem)}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flashcard-controls">
          <button class="btn-card-action btn-learn" onclick="FlashcardManager.markCurrentCard(false)">
            ❌ Qaytarish
          </button>
          <button class="btn-card-action btn-know" onclick="FlashcardManager.markCurrentCard(true)">
            ✅ Bilaman
          </button>
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  // REJIM 1: OSHXONA (FRONT: IMAGE | BACK: NAME & INGREDIENTS)
  function renderKitchenCardFace(item) {
    const formattedPrice = item.price_uah ? `${item.price_uah.toLocaleString('ru-RU')} so'm` : '';

    return `
      <!-- FRONT FACE -->
      <div class="flashcard-face flashcard-front">
        <div class="badge badge-cat" style="position: absolute; top: 12px; left: 12px;">
          ${escapeHtml(item.category || 'Oshxona')}
        </div>
        <img src="${item.image}" alt="${escapeHtml(item.name_ru)}" class="flashcard-img"
             onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\'><rect width=\'100%\' height=\'100%\' fill=\'%23fee2e2\'/><text x=\'50%\' y=\'50%\' font-size=\'16\' text-anchor=\'middle\' fill=\'%23dc2626\'>No Image</text></svg>'">
        <div style="font-size: 13px; color: var(--color-text-muted); margin-top: 4px;">
          Nomi va tarkibini ko'rish uchun bosing 👆
        </div>
      </div>

      <!-- BACK FACE -->
      <div class="flashcard-face flashcard-back">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 8px;">
          <span class="badge badge-id">#${String(item.id).padStart(3, '0')}</span>
          ${formattedPrice ? `<span class="badge badge-price">${formattedPrice}</span>` : ''}
        </div>
        <h3 style="font-size: 17px; color: var(--color-primary); margin-bottom: 8px;">${escapeHtml(item.name_ru)}</h3>
        <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 8px;">
          <strong>Tarkibi:</strong> ${escapeHtml(item.ingredients_ru)}
        </div>
        ${item.allergens && item.allergens.length ? `
          <div style="font-size: 11.5px; color: var(--color-danger); margin-top: auto;">
            <strong>⚠️ Allergenlar:</strong> ${item.allergens.join(', ')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // REJIM 2: BAR (FRONT: NAME & GROUP | BACK: INGREDIENTS & SERVIROVKA)
  function renderBarCardFace(item) {
    return `
      <!-- FRONT FACE -->
      <div class="flashcard-face flashcard-front" style="justify-content: center; background: #FFFDF9;">
        <span class="badge badge-cat" style="margin-bottom: 12px;">${escapeHtml(item.group || 'Bar')}</span>
        <h3 style="font-size: 20px; color: var(--color-primary); margin-bottom: 8px;">${escapeHtml(item.name_ru)}</h3>
        <p style="font-size: 12px; color: var(--color-text-muted);">
          Tarkib va servirovka qoidasini ko'rish uchun bosing 👆
        </p>
      </div>

      <!-- BACK FACE -->
      <div class="flashcard-face flashcard-back">
        <h4 style="color: var(--color-primary); margin-bottom: 4px;">Tarkibi:</h4>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 10px;">${escapeHtml(item.ingredients_ru)}</p>
        
        ${item.serving_ru ? `
          <div class="serving-block" style="width: 100%; margin-bottom: 8px;">
            <div class="serving-title">☕️ Servirovka va podacha:</div>
            <div class="serving-desc">${escapeHtml(item.serving_ru)}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // RENDER CELEBRATION SCREEN
  function renderCompletionScreen(container, totalItems) {
    container.innerHTML = `
      <div class="quiz-container text-center" style="padding: 40px 20px;">
        <div style="font-size: 54px; margin-bottom: 10px;">🎉</div>
        <h2 style="color: var(--color-primary); margin-bottom: 8px;">Barcha kartochkalarni o'rgandingiz!</h2>
        <p style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 20px;">
          Siz ${currentMode === 'kitchen' ? 'Oshxona' : 'Bar'} bo'limidagi barcha <strong>${totalItems} ta</strong> kartochkani muvaffaqiyatli o'zlashtirdingiz.
        </p>
        <button class="btn-card-action btn-know" onclick="FlashcardManager.resetCurrentMode()">
          🔄 Qayta boshlash
        </button>
      </div>
    `;
  }

  return {
    render(containerId) {
      init(containerId);
    },

    switchMode(mode) {
      currentMode = mode;
      currentIndex = 0;
      isFlipped = false;
      init('view-cards');
    },

    toggleFlip() {
      isFlipped = !isFlipped;
      const el = document.getElementById('flashcard-element');
      if (el) {
        el.classList.toggle('flipped', isFlipped);
      }
    },

    markCurrentCard(known) {
      const unlearnedDeck = activeDeck.filter(item => !StorageManager.isLearned(item.itemKey));
      if (unlearnedDeck.length > 0) {
        const currentItem = unlearnedDeck[currentIndex % unlearnedDeck.length];
        if (known) {
          StorageManager.markLearned(currentItem.itemKey);
        }
      }

      isFlipped = false;
      currentIndex++;
      init('view-cards');
    },

    resetCurrentMode() {
      activeDeck.forEach(item => StorageManager.unmarkLearned(item.itemKey));
      currentIndex = 0;
      isFlipped = false;
      init('view-cards');
    }
  };
})();
