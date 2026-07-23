/**
 * SAFIA ADMIN MENU EDITOR MODULE
 * Handles full inline editing of dishes and drinks, adding new items,
 * deleting items, search filtering, LocalStorage saving, JSON Export & Import.
 */

const AdminManager = (function() {
  let activeTab = 'dishes'; // 'dishes' or 'drinks'
  let adminDishes = [];
  let adminDrinks = [];
  let searchQuery = '';

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await DataLoader.loadAll();
    adminDishes = JSON.parse(JSON.stringify(data.dishes));
    adminDrinks = JSON.parse(JSON.stringify(data.drinks));
    render();
  });

  function render() {
    const container = document.getElementById('admin-editor-container');
    if (!container) return;

    const items = activeTab === 'dishes' ? adminDishes : adminDrinks;
    const query = searchQuery.toLowerCase().trim();

    const filteredItems = items.filter(item => {
      if (!query) return true;
      const name = (item.name_ru || '').toLowerCase();
      const ing = (item.ingredients_ru || '').toLowerCase();
      const idStr = String(item.id);
      return name.includes(query) || ing.includes(query) || idStr.includes(query);
    });

    let html = `
      <div class="admin-editor-wrapper">
        
        <!-- HEADER ACTIONS TOOLBAR -->
        <div class="control-bar" style="margin-bottom: 16px;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="AdminManager.saveToLocalStorage()">
                <span>💾 Lokal Saqlash</span>
              </button>
              <button class="btn" onclick="AdminManager.exportJSON('dishes')">
                <span>📥 dishes.json Yuklash</span>
              </button>
              <button class="btn" onclick="AdminManager.exportJSON('drinks')">
                <span>📥 drinks.json Yuklash</span>
              </button>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <label class="btn" style="cursor: pointer;">
                <span>📤 Tashqi JSON Yuklash</span>
                <input type="file" accept=".json" style="display: none;" onchange="AdminManager.importJSON(this)">
              </label>
              <button class="btn" style="color: var(--color-danger);" onclick="AdminManager.resetDefault()">
                <span>🔄 Tiklash</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB SWITCHER (DISHES VS DRINKS) -->
        <div class="category-chips-scroll" style="margin-bottom: 14px;">
          <button class="chip-btn ${activeTab === 'dishes' ? 'active' : ''}"
                  onclick="AdminManager.switchTab('dishes')">
            🍽 Oshxona Menyusi (${adminDishes.length})
          </button>
          <button class="chip-btn ${activeTab === 'drinks' ? 'active' : ''}"
                  onclick="AdminManager.switchTab('drinks')">
            ☕️ Bar Menyusi (${adminDrinks.length})
          </button>
        </div>

        <!-- SEARCH BAR IN ADMIN -->
        <div class="search-input-group" style="margin-bottom: 16px;">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Nom yoki ID bo'yicha tahrirlash uchun qidirish..."
                 value="${escapeHtml(searchQuery)}"
                 oninput="AdminManager.handleSearch(this.value)">
        </div>

        <!-- EDITOR CARDS LIST -->
        <div class="cards-list">
          ${filteredItems.map(item => renderEditorCard(item)).join('')}
        </div>

        <!-- ADD NEW ITEM BUTTON -->
        <div style="margin-top: 20px; text-align: center;">
          <button class="btn-card-action btn-know" style="min-width: 240px;" onclick="AdminManager.addNewItem()">
            ➕ Yangi ${activeTab === 'dishes' ? 'Taom' : 'Ichimlik'} Qo'shish
          </button>
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  function renderEditorCard(item) {
    const isDish = activeTab === 'dishes';

    return `
      <div class="food-card" style="flex-direction: column; gap: 10px;">
        <div class="card-top">
          <span class="badge badge-id">ID: #${String(item.id).padStart(3, '0')}</span>
          <button class="btn" style="color: var(--color-danger); padding: 4px 10px; font-size: 12px;"
                  onclick="AdminManager.deleteItem(${item.id})">
            🗑 O'chirish
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">NOMI (RU):</label>
            <input type="text" class="select-control" style="width: 100%;"
                   value="${escapeHtml(item.name_ru || '')}"
                   onchange="AdminManager.updateField(${item.id}, 'name_ru', this.value)">
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">KATEGORIYA / GURUH:</label>
            <input type="text" class="select-control" style="width: 100%;"
                   value="${escapeHtml(item.category || item.group || '')}"
                   onchange="AdminManager.updateField(${item.id}, '${isDish ? 'category' : 'group'}', this.value)">
          </div>

          ${isDish ? `
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">NARXI (so'm / UAH):</label>
              <input type="number" class="select-control" style="width: 100%;"
                     value="${item.price_uah || 0}"
                     onchange="AdminManager.updateField(${item.id}, 'price_uah', parseFloat(this.value) || 0)">
            </div>
          ` : ''}
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">TARKIBI (RU):</label>
          <textarea class="select-control" style="width: 100%; min-height: 60px; font-family: inherit; font-size: 13px;"
                    onchange="AdminManager.updateField(${item.id}, 'ingredients_ru', this.value)">${escapeHtml(item.ingredients_ru || '')}</textarea>
        </div>

        ${!isDish ? `
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">SERVIROVKA VA PODACHA (BAR):</label>
            <textarea class="select-control" style="width: 100%; min-height: 50px; font-family: inherit; font-size: 13px;"
                      onchange="AdminManager.updateField(${item.id}, 'serving_ru', this.value)">${escapeHtml(item.serving_ru || '')}</textarea>
          </div>
        ` : ''}

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--color-text-muted);">RASM MANZILI (URL / Asset path):</label>
          <input type="text" class="select-control" style="width: 100%;"
                 value="${escapeHtml(item.image || '')}"
                 onchange="AdminManager.updateField(${item.id}, 'image', this.value)">
        </div>

      </div>
    `;
  }

  return {
    switchTab(tab) {
      activeTab = tab;
      searchQuery = '';
      render();
    },

    handleSearch(query) {
      searchQuery = query;
      render();
    },

    updateField(id, field, value) {
      const items = activeTab === 'dishes' ? adminDishes : adminDrinks;
      const target = items.find(i => i.id === id);
      if (target) {
        target[field] = value;
      }
    },

    deleteItem(id) {
      if (confirm("Haqiqatdan ham ushbu taom/ichimlikni o'chirmoqchimisiz?")) {
        if (activeTab === 'dishes') {
          adminDishes = adminDishes.filter(i => i.id !== id);
        } else {
          adminDrinks = adminDrinks.filter(i => i.id !== id);
        }
        render();
      }
    },

    addNewItem() {
      const isDish = activeTab === 'dishes';
      const items = isDish ? adminDishes : adminDrinks;
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;

      if (isDish) {
        adminDishes.push({
          id: newId,
          name_ru: "Yangi Taom",
          category: "Завтраки",
          price_uah: 50000,
          ingredients_ru: "Tarkib ma'lumoti",
          tags: [],
          is_spicy: false,
          is_meatless: false,
          allergens: [],
          image: "assets/images/dishes/dish-001.webp"
        });
      } else {
        adminDrinks.push({
          id: newId,
          name_ru: "Yangi Ichimlik",
          group: "Авторские чаи",
          ingredients_ru: "Tarkib ma'lumoti",
          serving_ru: "Servirovka qoidasi",
          allergens: [],
          image: "assets/images/drinks/drink-001.webp"
        });
      }
      render();
    },

    saveToLocalStorage() {
      DataLoader.saveCustomDishes(adminDishes);
      DataLoader.saveCustomDrinks(adminDrinks);
      alert("✅ O'zgarishlar brauzer xotirasiga saqlandi! Endi bosh sahifada (index.html) yangi narxlar va ma'lumotlar darhol ko'rinadi.");
    },

    exportJSON(type) {
      const data = type === 'dishes' ? adminDishes : adminDrinks;
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importJSON(fileInput) {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed)) {
            if (activeTab === 'dishes') {
              adminDishes = parsed;
              DataLoader.saveCustomDishes(adminDishes);
            } else {
              adminDrinks = parsed;
              DataLoader.saveCustomDrinks(adminDrinks);
            }
            alert(`✅ ${file.name} muvaffaqiyatli yuklandi va saqlandi!`);
            render();
          } else {
            alert("⚠️ Yaroqsiz JSON fayli format! Massiv (Array) bo'lishi kerak.");
          }
        } catch (err) {
          alert("❌ JSON o'qishda xatolik: " + err.message);
        }
      };
      reader.readAsText(file);
    },

    resetDefault() {
      if (confirm("Haqiqatdan ham barcha o'zgartirishlarni bekor qilib, dastlabki holatga qaytarmoqchimisiz?")) {
        DataLoader.resetCustomData();
        location.reload();
      }
    }
  };
})();
