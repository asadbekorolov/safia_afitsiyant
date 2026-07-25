/**
 * SAFIA MENU MANAGER MODULE
 * Dynamic 3-language rendering for dish names, ingredients, categories, and serving rules.
 */

const MenuManager = (function() {

  const ALLERGEN_DEFINITIONS = [
    {
      id: 'yongoq',
      label: { uz: "🥜 Yong'oq", ru: "🥜 Орехи", en: "🥜 Nuts" },
      keywords: ['орех', 'фундук', 'кедровый', 'нутелла', 'лесные орехи', 'древесные орехи']
    },
    {
      id: 'sitrus',
      label: { uz: "🍋 Sitrus", ru: "🍋 Цитрус", en: "🍋 Citrus" },
      keywords: ['лимон', 'лайм', 'апельсин', 'цедра', 'цитрус']
    },
    {
      id: 'tuxum',
      label: { uz: "🥚 Tuxum", ru: "🥚 Яйца", en: "🥚 Egg" },
      keywords: ['яйц', 'яйцо', 'яйца', 'желток', 'перепелин']
    },
    {
      id: 'qizil_mevalar',
      label: { uz: "🍓 Qizil mevalar", ru: "🍓 Ягоды", en: "🍓 Berries" },
      keywords: ['малин', 'ежевик', 'голубик', 'ягод', 'черниц', 'персик']
    },
    {
      id: 'asal',
      label: { uz: "🍯 Asal", ru: "🍯 Мёд", en: "🍯 Honey" },
      keywords: ['мёд', 'мед']
    },
    {
      id: 'shokolad',
      label: { uz: "🍫 Shokolad", ru: "🍫 Шоколад", en: "🍫 Chocolate" },
      keywords: ['какао', 'шоколад', 'нутелла', 'топпинг']
    },
    {
      id: 'sut',
      label: { uz: "🥛 Sut", ru: "🥛 Молоко", en: "🥛 Dairy" },
      keywords: ['молок', 'сливок', 'сливки', 'сметан', 'сыр', 'лабне', 'фетакса', 'виола', 'сгущ']
    }
  ];

  let selectedCategory = '';
  let activeAllergens = new Set();
  let currentSearchQuery = '';

  function itemContainsAllergen(item, allergenId) {
    const def = ALLERGEN_DEFINITIONS.find(a => a.id === allergenId);
    if (!def) return false;

    const nameText = (I18n.getField(item, 'name') || '').toLowerCase();
    const ingText = (I18n.getField(item, 'ingredients') || '').toLowerCase();
    const allergenArr = Array.isArray(item.allergens) ? item.allergens.map(a => a.toLowerCase()) : [];

    return def.keywords.some(kw => 
      nameText.includes(kw) || 
      ingText.includes(kw) || 
      allergenArr.some(a => a.includes(kw))
    );
  }

  function renderMenuHeader(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = [...new Set(items.map(i => i.category || i.group))].filter(Boolean);
    const lang = I18n.getLang();

    let html = `
      <div class="menu-controls-wrapper">
        
        <!-- SEARCH BAR -->
        <div class="search-input-group">
          <span class="search-icon">🔍</span>
          <input type="text" id="${type}-search-input"
                 placeholder="${type === 'dishes' ? I18n.t('searchKitchenPlaceholder') : I18n.t('searchBarPlaceholder')}"
                 value="${escapeHtml(currentSearchQuery)}"
                 oninput="MenuManager.handleSearchInput('${type}', this.value)">
        </div>

        <!-- CATEGORY HORIZONTAL SCROLL CHIPS -->
        <div class="category-chips-scroll">
          <button class="chip-btn ${selectedCategory === '' ? 'active' : ''}"
                  onclick="MenuManager.selectCategory('${type}', '')">
            ✨ ${type === 'dishes' ? I18n.t('allCategories') : I18n.t('allGroups')}
          </button>
          ${categories.map(cat => `
            <button class="chip-btn ${selectedCategory === cat ? 'active' : ''}"
                    onclick="MenuManager.selectCategory('${type}', '${escapeHtml(cat)}')">
              ${escapeHtml(I18n.translate(cat))}
            </button>
          `).join('')}
        </div>

        <!-- ALLERGEN FILTERS ROW -->
        <div class="allergen-filter-section">
          <div class="allergen-filter-title">
            <span>${I18n.t('allergenFilterTitle')}</span>
            <small style="color: var(--color-text-muted);">${I18n.t('allergenFilterSub')}</small>
          </div>
          <div class="allergen-chips-wrap">
            ${ALLERGEN_DEFINITIONS.map(alg => {
              const isActive = activeAllergens.has(alg.id);
              const chipLabel = alg.label[lang] || alg.label.uz;
              return `
                <button class="allergen-chip ${isActive ? 'active' : ''}"
                        onclick="MenuManager.toggleAllergen('${type}', '${alg.id}')">
                  ${chipLabel}
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

  function renderFilteredList(type, items) {
    const container = document.getElementById(`${type}-cards-container`);
    if (!container) return;

    const query = currentSearchQuery.toLowerCase().trim();

    const filtered = items.filter(item => {
      const itemCat = item.category || item.group || '';
      if (selectedCategory && itemCat !== selectedCategory) {
        return false;
      }

      if (query) {
        const nameMatch = I18n.getField(item, 'name').toLowerCase().includes(query);
        const ingMatch = I18n.getField(item, 'ingredients').toLowerCase().includes(query);
        const idMatch = String(item.id).includes(query);
        if (!nameMatch && !ingMatch && !idMatch) {
          return false;
        }
      }

      for (let allergenId of activeAllergens) {
        if (itemContainsAllergen(item, allergenId)) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-menu-state">
          <div class="empty-icon">⚠️</div>
          <h3>${I18n.t('emptyStateTitle')}</h3>
          <p>${I18n.t('emptyStateSub')}</p>
          <button class="btn-reset-filters" onclick="MenuManager.resetAllFilters('${type}')">
            ${I18n.t('btnResetFilters')}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => renderMenuItemCard(item, type)).join('');
  }

  function renderMenuItemCard(item, type) {
    const itemKey = `${type}-${item.id}`;
    const isConfirmed = !!AppState.confirmedMap[itemKey];
    const isError = AppState.imageErrorSet.has(itemKey);
    const formattedPrice = item.price_uah ? `${item.price_uah.toLocaleString('ru-RU')} so'm` : '';

    const name = I18n.getField(item, 'name');
    const ingredients = I18n.getField(item, 'ingredients');
    const serving = I18n.getField(item, 'serving');
    const category = I18n.translate(item.category || item.group || '');

    return `
      <div class="food-card ${isConfirmed ? 'is-confirmed' : ''} ${isError ? 'has-img-error' : ''}" id="card-${itemKey}">
        <div class="card-img-wrap ${isError ? 'img-failed' : ''}">
          <img src="${item.image}" alt="${escapeHtml(name)}"
               loading="lazy"
               onerror="handleCardImgError(this, '${itemKey}')"
               onclick="openImageModal('${item.image}', '${escapeHtml(name)}')">
          <div class="img-error-msg">
            <span>⚠️</span>
            <span>Rasm topilmadi</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="card-top">
            <div class="card-badges">
              <span class="badge badge-id">#${String(item.id).padStart(3, '0')}</span>
              <span class="badge badge-cat">${escapeHtml(category)}</span>
              ${formattedPrice ? `<span class="badge badge-price">${formattedPrice}</span>` : ''}
            </div>
          </div>
          
          <div class="card-title">${escapeHtml(name)}</div>
          
          <div class="card-text">
            <strong>${I18n.t('ingredientsLabel')}:</strong> ${escapeHtml(ingredients)}
          </div>

          ${serving ? `
            <div class="serving-block">
              <div class="serving-title">☕️ ${I18n.t('servingLabel')}:</div>
              <div class="serving-desc">${escapeHtml(serving)}</div>
            </div>
          ` : ''}

          ${renderCardPills(item)}

          <div class="card-footer">
            <label class="confirm-label">
              <input type="checkbox" class="confirm-checkbox"
                     ${isConfirmed ? 'checked' : ''}
                     onchange="toggleItemConfirmation('${itemKey}', this.checked)">
              <span>${I18n.t('confirmedCheckbox')}</span>
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
        html += `<span class="pill pill-allergen">⚠️ ${escapeHtml(I18n.translate(a))}</span>`;
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
