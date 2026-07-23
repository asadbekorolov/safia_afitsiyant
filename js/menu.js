/**
 * SAFIA MENU MANAGER MODULE
 * Handles category chips, real-time search, allergen filtering,
 * card rendering with lazy-loading, serving_ru display, and empty states.
 */

const MenuManager = (function() {

  // ALLERGEN DEFINITIONS & KEYWORD MATCHERS
  const ALLERGEN_DEFINITIONS = [
    {
      id: 'yongoq',
      label: "🥜 Yong'oq",
      keywords: ['орех', 'фундук', 'кедровый', 'нутелла', 'лесные орехи', 'древесные орехи']
    },
    {
      id: 'sitrus',
      label: '🍋 Sitrus',
      keywords: ['лимон', 'лайм', 'апельсин', 'цедра', 'цитрус']
    },
    {
      id: 'tuxum',
      label: '🥚 Tuxum',
      keywords: ['яйц', 'яйцо', 'яйца', 'желток', 'перепелин']
    },
    {
      id: 'qizil_mevalar',
      label: '🍓 Qizil mevalar',
      keywords: ['малин', 'ежевик', 'голубик', 'ягод', 'черниц', 'персик']
    },
    {
      id: 'asal',
      label: '🍯 Asal',
      keywords: ['мёд', 'мед']
    },
    {
      id: 'shokolad',
      label: '🍫 Shokolad',
      keywords: ['какао', 'шоколад', 'нутелла', 'топпинг']
    },
    {
      id: 'sut',
      label: '🥛 Sut',
      keywords: ['молок', 'сливок', 'сливки', 'сметан', 'сыр', 'лабне', 'фетакса', 'виола', 'сгущ']
    }
  ];

  // STATE FOR CURRENT VIEW
  let selectedCategory = '';
  let activeAllergens = new Set();
  let currentSearchQuery = '';

  // CHECK IF ITEM CONTAINS GIVEN ALLERGEN ID
  function itemContainsAllergen(item, allergenId) {
    const def = ALLERGEN_DEFINITIONS.find(a => a.id === allergenId);
    if (!def) return false;

    const nameText = (item.name_ru || '').toLowerCase();
    const ingText = (item.ingredients_ru || '').toLowerCase();
    const allergenArr = Array.isArray(item.allergens) ? item.allergens.map(a => a.toLowerCase()) : [];

    return def.keywords.some(kw => 
      nameText.includes(kw) || 
      ingText.includes(kw) || 
      allergenArr.some(a => a.includes(kw))
    );
  }

  // RENDER MENU CONTROLS (CATEGORY CHIPS + SEARCH + ALLERGENS)
  function renderMenuHeader(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Extract categories
    const categories = [...new Set(items.map(i => i.category || i.group))].filter(Boolean);

    let html = `
      <div class="menu-controls-wrapper">
        
        <!-- SEARCH BAR (Real-time by Name & Ingredients) -->
        <div class="search-input-group">
          <span class="search-icon">🔍</span>
          <input type="text" id="${type}-search-input"
                 placeholder="Nomi yoki ingredient bo'yicha qidirish (masalan: 'яйца', 'мята')..."
                 value="${escapeHtml(currentSearchQuery)}"
                 oninput="MenuManager.handleSearchInput('${type}', this.value)">
        </div>

        <!-- CATEGORY HORIZONTAL SCROLL CHIPS -->
        <div class="category-chips-scroll">
          <button class="chip-btn ${selectedCategory === '' ? 'active' : ''}"
                  onclick="MenuManager.selectCategory('${type}', '')">
            ✨ Barchasi
          </button>
          ${categories.map(cat => `
            <button class="chip-btn ${selectedCategory === cat ? 'active' : ''}"
                    onclick="MenuManager.selectCategory('${type}', '${escapeHtml(cat)}')">
              ${escapeHtml(cat)}
            </button>
          `).join('')}
        </div>

        <!-- ALLERGEN FILTERS ROW -->
        <div class="allergen-filter-section">
          <div class="allergen-filter-title">
            <span>⚠️ Allergen filtri:</span>
            <small style="color: var(--color-text-muted);">Tarkibida borlarini yashirish</small>
          </div>
          <div class="allergen-chips-wrap">
            ${ALLERGEN_DEFINITIONS.map(alg => {
              const isActive = activeAllergens.has(alg.id);
              return `
                <button class="allergen-chip ${isActive ? 'active' : ''}"
                        onclick="MenuManager.toggleAllergen('${type}', '${alg.id}')">
                  ${alg.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- MENU CARDS GRID -->
      <div class="cards-list" id="${type}-cards-container"></div>
    `;

    container.innerHTML = html;
    renderFilteredList(type, items);
  }

  // FILTER & RENDER ITEMS
  function renderFilteredList(type, items) {
    const container = document.getElementById(`${type}-cards-container`);
    if (!container) return;

    const query = currentSearchQuery.toLowerCase().trim();

    const filtered = items.filter(item => {
      // 1. Category filter
      const itemCat = item.category || item.group || '';
      if (selectedCategory && itemCat !== selectedCategory) {
        return false;
      }

      // 2. Search query filter (Name AND Ingredients)
      if (query) {
        const nameMatch = (item.name_ru || '').toLowerCase().includes(query);
        const ingMatch = (item.ingredients_ru || '').toLowerCase().includes(query);
        const idMatch = String(item.id).includes(query);
        if (!nameMatch && !ingMatch && !idMatch) {
          return false;
        }
      }

      // 3. Allergen filter (Hide items containing any selected allergen)
      for (let allergenId of activeAllergens) {
        if (itemContainsAllergen(item, allergenId)) {
          return false;
        }
      }

      return true;
    });

    // EMPTY STATE HANDLING
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-menu-state">
          <div class="empty-icon">⚠️</div>
          <h3>Mos taom yoki ichimlik topilmadi</h3>
          <p>Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang</p>
          <button class="btn-reset-filters" onclick="MenuManager.resetAllFilters('${type}')">
            🔄 Filtrlarni tozalash
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => renderMenuItemCard(item, type)).join('');
  }

  // RENDER INDIVIDUAL MENU ITEM CARD
  function renderMenuItemCard(item, type) {
    const itemKey = `${type}-${item.id}`;
    const isConfirmed = !!AppState.confirmedMap[itemKey];
    const isError = AppState.imageErrorSet.has(itemKey);
    const formattedPrice = item.price_uah ? `${item.price_uah.toLocaleString('ru-RU')} so'm` : '';

    return `
      <div class="food-card ${isConfirmed ? 'is-confirmed' : ''} ${isError ? 'has-img-error' : ''}" id="card-${itemKey}">
        <div class="card-img-wrap ${isError ? 'img-failed' : ''}">
          <img src="${item.image}" alt="${escapeHtml(item.name_ru)}"
               loading="lazy"
               onerror="handleCardImgError(this, '${itemKey}')"
               onclick="openImageModal('${item.image}', '${escapeHtml(item.name_ru)}')">
          <div class="img-error-msg">
            <span>⚠️</span>
            <span>Rasm topilmadi</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="card-top">
            <div class="card-badges">
              <span class="badge badge-id">#${String(item.id).padStart(3, '0')}</span>
              <span class="badge badge-cat">${escapeHtml(item.category || item.group || '')}</span>
              ${formattedPrice ? `<span class="badge badge-price">${formattedPrice}</span>` : ''}
            </div>
          </div>
          
          <div class="card-title">${escapeHtml(item.name_ru)}</div>
          
          <div class="card-text">
            <strong>Tarkibi:</strong> ${escapeHtml(item.ingredients_ru || 'Maʼlumot yoʻq')}
          </div>

          <!-- DISTINCTIVE SERVING BLOCK FOR BAR DRINKS -->
          ${item.serving_ru ? `
            <div class="serving-block">
              <div class="serving-title">☕️ Servirovka va podacha:</div>
              <div class="serving-desc">${escapeHtml(item.serving_ru)}</div>
            </div>
          ` : ''}

          <!-- PILLS (Spicy, Meatless, Allergens) -->
          ${renderCardPills(item)}

          <div class="card-footer">
            <label class="confirm-label">
              <input type="checkbox" class="confirm-checkbox"
                     ${isConfirmed ? 'checked' : ''}
                     onchange="toggleItemConfirmation('${itemKey}', this.checked)">
              <span>Tasdiqlandi</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  function renderCardPills(item) {
    let html = '<div class="card-pills">';
    if (item.is_spicy) html += '<span class="pill pill-allergen">🌶️ Achchiq</span>';
    if (item.is_meatless) html += '<span class="pill pill-tag">🌱 Goʻshtsiz</span>';
    
    if (item.allergens && Array.isArray(item.allergens)) {
      item.allergens.forEach(a => {
        html += `<span class="pill pill-allergen">⚠️ ${escapeHtml(a)}</span>`;
      });
    }
    html += '</div>';
    return html;
  }

  return {
    renderKitchen(items) {
      renderMenuHeader('view-kitchen', items, 'dishes');
    },

    renderBar(items) {
      renderMenuHeader('view-bar', items, 'drinks');
    },

    selectCategory(type, categoryName) {
      selectedCategory = categoryName;
      const items = type === 'dishes' ? DataLoader.getDishes() : DataLoader.getDrinks();
      renderMenuHeader(`view-${type === 'dishes' ? 'kitchen' : 'bar'}`, items, type);
    },

    handleSearchInput(type, query) {
      currentSearchQuery = query;
      const items = type === 'dishes' ? DataLoader.getDishes() : DataLoader.getDrinks();
      renderFilteredList(type, items);
    },

    toggleAllergen(type, allergenId) {
      if (activeAllergens.has(allergenId)) {
        activeAllergens.delete(allergenId);
      } else {
        activeAllergens.add(allergenId);
      }
      const items = type === 'dishes' ? DataLoader.getDishes() : DataLoader.getDrinks();
      renderMenuHeader(`view-${type === 'dishes' ? 'kitchen' : 'bar'}`, items, type);
    },

    resetAllFilters(type) {
      selectedCategory = '';
      currentSearchQuery = '';
      activeAllergens.clear();
      const items = type === 'dishes' ? DataLoader.getDishes() : DataLoader.getDrinks();
      renderMenuHeader(`view-${type === 'dishes' ? 'kitchen' : 'bar'}`, items, type);
    }
  };
})();
