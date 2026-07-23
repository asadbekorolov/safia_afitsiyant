/**
 * SAFIA SERVICE STANDARDS MODULE
 * Renders interactive accordion panels, allergen guidance, forbidden actions,
 * complaint handling, cutlery rules, real-time standards search, and i18n support.
 */

const StandardsManager = (function() {
  let searchKeyword = '';
  let openAccordionIds = new Set(['mission', 'serving_rules', 'guest_interaction', 'forbidden']);

  const FORBIDDEN_ACTIONS = [
    {
      title: { uz: "Mehmon bilan tortishish yoki e'tiroz bildirish 🛑", ru: "Спорить с гостем или возражать 🛑", en: "Arguing or disputing with a guest 🛑" },
      desc: { uz: "Har qanday vaziyatda mehmon haq. Shikoyat kelganda tortishmasdan tinglash va zudlik bilan yechim taklif etish shart.", ru: "Гость всегда прав. При жалобе выслушайте без споров и предложите решение.", en: "The guest is always right. Listen patiently without arguing and offer an immediate solution." }
    },
    {
      title: { uz: "Allergiya bor-yo'qligini so'ramasdan taom tavsiya qilish 🛑", ru: "Рекомендовать блюда не спросив про аллергию 🛑", en: "Recommending food without checking for allergies 🛑" },
      desc: { uz: "Mehmon xavfsizligi birinchi o'rinda. Allergenlar haqida so'ramasdan taom berish qat'iyan man etiladi.", ru: "Безопасность гостя превыше всего. Всегда уточняйте наличие аллергии.", en: "Guest safety is top priority. Always check for food allergies before recommending." }
    },
    {
      title: { uz: "Kir, tirnalgan yoki shikastlangan idishlarda taom tortish 🛑", ru: "Подавать блюда в грязной или поврежденной посуде 🛑", en: "Serving food in dirty or damaged tableware 🛑" },
      desc: { uz: "Barcha idish va pichoq-vilkalar sirli, toza va parlashi shart.", ru: "Вся посуда и приборы должны быть безупречно чистыми и сияющими.", en: "All dishes and cutlery must be sparkling clean and undamaged." }
    },
    {
      title: { uz: "Ish vaqtida shaxsiy telefondan foydalanish 🛑", ru: "Использовать личный телефон во время работы 🛑", en: "Using personal mobile phones during service 🛑" },
      desc: { uz: "Mehmon kelganda 3 soniya ichida salomlashish va diqqatni mehmonga qaratish shart.", ru: "Приветствуйте гостя в течение 3 секунд.", en: "Greet guests within 3 seconds and stay attentive." }
    }
  ];

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const std = DataLoader.getStandards();
    if (!std) {
      container.innerHTML = `<div class="empty-menu-state">${I18n.t('emptyStateTitle')}</div>`;
      return;
    }

    let html = `
      <div class="standards-wrapper">
        
        <!-- STANDARDS SEARCH BAR -->
        <div class="search-input-group" style="margin-bottom: 16px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="standards-search-input"
                 placeholder="${I18n.t('searchStandardsPlaceholder')}"
                 value="${escapeHtml(searchKeyword)}"
                 oninput="StandardsManager.handleSearch(this.value)">
        </div>

        <div class="accordion-group">
          ${renderAccordionItem('mission', '🌟 Missiya, Qadriyatlar va Prinsiplar', renderMissionContent(std))}
          ${renderAccordionItem('serving_rules', '🍽 Idishlar va Asboblarni Tortish Qoidalari', renderServingRulesContent(std))}
          ${renderAccordionItem('greetings', '🤝 Servisning 5 Bosqichi va Salomlashish Iboralari', renderGreetingsContent(std))}
          ${renderAccordionItem('taking_order', '📋 Buyurtma Qabul Qilish va Raqamlash Tizimi', renderTakingOrderContent(std))}
          ${renderAccordionItem('allergies', '⚠️ Allergiya va 7 Allergen Standarti', renderAllergiesContent(std))}
          ${renderAccordionItem('guest_interaction', '🤬 Shikoyatlar Bilan Ishlash va Tipik Vaziyatlar', renderComplaintsContent(std))}
          ${renderAccordionItem('forbidden', '🚫 TAQIQLANGAN Xatti-harakatlar (STOP Bloklar)', renderForbiddenContent())}
        </div>
      </div>
    `;

    container.innerHTML = html;
    applySearchHighlight();
  }

  function renderAccordionItem(id, title, contentHtml) {
    const isOpen = openAccordionIds.has(id) || searchKeyword.length > 0;
    return `
      <div class="accordion-item ${isOpen ? 'active' : ''}" id="acc-item-${id}">
        <button class="accordion-header" onclick="StandardsManager.toggleAccordion('${id}')">
          <span>${title}</span>
          <span class="acc-icon">${isOpen ? '➖' : '➕'}</span>
        </button>
        <div class="accordion-content ${isOpen ? 'show' : ''}">
          <div class="accordion-body">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;
  }

  function renderMissionContent(std) {
    const sec = (std.sections || []).find(s => s.id === 'mission');
    if (!sec || !sec.content) return '';

    return `
      <div class="alert-box alert-recommended" style="margin-bottom: 12px;">
        <strong>🎯 Missiyamiz:</strong> "${escapeHtml(sec.content.mission_uz || sec.content.mission_ru)}"
      </div>
      <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 10px;">
        <em>"${escapeHtml(sec.content.motto_uz || sec.content.motto_ru)}"</em>
      </p>
      <h4 style="color: var(--color-primary); font-size: 14px; margin-bottom: 6px;">Asosiy Qadriyatlar:</h4>
      <ul class="std-list">
        ${(sec.content.values || []).map(v => `
          <li><strong>${escapeHtml(v.title_uz || v.title_ru)}</strong></li>
        `).join('')}
      </ul>
    `;
  }

  function renderServingRulesContent(std) {
    const sec = (std.sections || []).find(s => s.id === 'dish_serving_rules');
    if (!sec || !sec.rules) return '';

    return `
      <div class="table-responsive">
        <table class="std-table">
          <thead>
            <tr>
              <th>Kategoriya</th>
              <th>Servirovka Qoidasi (UZ)</th>
              <th>(RU)</th>
            </tr>
          </thead>
          <tbody>
            ${sec.rules.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.category_uz || r.category_ru)}</strong></td>
                <td><span class="pill pill-tag">✅ ${escapeHtml(r.description_uz)}</span></td>
                <td style="font-size: 12px; color: var(--color-text-muted);">${escapeHtml(r.description_ru)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderGreetingsContent(std) {
    const sec = (std.sections || []).find(s => s.id === 'greeting_phrases');
    const greetings = sec ? sec.greetings : [];

    return `
      <div class="greetings-grid" style="display: flex; flex-direction: column; gap: 8px;">
        ${greetings.map(g => `
          <div class="alert-box alert-recommended">
            <strong>🗣 ${escapeHtml(g.phrase_uz || g.phrase_ru)}</strong>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 2px;">RU: "${escapeHtml(g.phrase_ru)}"</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTakingOrderContent(std) {
    const sec = (std.sections || []).find(s => s.id === 'taking_order');
    if (!sec) return '';

    return `
      <ul class="std-list" style="margin-bottom: 12px;">
        ${(sec.basic_phrases || []).map(b => `
          <li><strong>${escapeHtml(b.phrase_uz || b.phrase_ru)}</strong></li>
        `).join('')}
      </ul>
    `;
  }

  function renderAllergiesContent(std) {
    const alg = std.allergen_information;
    if (!alg) return '';

    return `
      <div class="alert-box alert-forbidden" style="margin-bottom: 12px;">
        <strong>⚠️ ALLERGEN OGOHLANTIRIShI:</strong>
        <p style="font-size: 12.5px; margin-top: 4px;">${escapeHtml(alg.description_uz || alg.description_ru)}</p>
      </div>
      <div class="pills-group" style="margin-top: 6px;">
        ${(alg.common_allergens || []).map(a => `<span class="pill pill-allergen" style="font-size: 12px; padding: 4px 10px;">⚠️ ${escapeHtml(a)}</span>`).join('')}
      </div>
    `;
  }

  function renderComplaintsContent(std) {
    const sec = (std.sections || []).find(s => s.id === 'guest_interaction');
    if (!sec || !sec.problems_and_solutions) return '';

    const psList = sec.problems_and_solutions.uz || sec.problems_and_solutions.ru || [];

    return `
      <div class="alert-box alert-recommended" style="margin-bottom: 12px;">
        <strong>1-QADAM: TINGLASH VA TUSHUNISH 🤝</strong>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${psList.map(ps => `
          <div style="background: var(--color-bg); border-left: 4px solid var(--color-primary); padding: 10px; border-radius: 6px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--color-danger);">❓ Vaziyat: ${escapeHtml(ps.problem)}</div>
            <div style="font-size: 12.5px; color: var(--color-success); font-weight: 600; margin-top: 4px;">✅ Yechim: ${escapeHtml(ps.solution)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderForbiddenContent() {
    const lang = I18n.getLang();
    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${FORBIDDEN_ACTIONS.map(item => `
          <div class="alert-box alert-forbidden">
            <h4 style="color: var(--color-danger); font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.title[lang] || item.title.uz)}</h4>
            <p style="font-size: 12.5px; color: var(--color-danger);">${escapeHtml(item.desc[lang] || item.desc.uz)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function applySearchHighlight() {
    if (!searchKeyword) return;
    const query = searchKeyword.toLowerCase();

    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const text = item.innerText.toLowerCase();
      if (text.includes(query)) {
        item.style.display = 'block';
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        if (content) content.classList.add('show');
      } else {
        item.style.display = 'none';
      }
    });
  }

  return {
    render(containerId) {
      render(containerId);
    },

    toggleAccordion(id) {
      if (openAccordionIds.has(id)) {
        openAccordionIds.delete(id);
      } else {
        openAccordionIds.add(id);
      }
      render('view-standards');
    },

    handleSearch(query) {
      searchKeyword = query;
      render('view-standards');
    }
  };
})();
