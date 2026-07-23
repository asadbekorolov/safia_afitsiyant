/**
 * SAFIA SERVICE STANDARDS MODULE
 * Renders interactive accordion panels, allergen guidance, forbidden actions,
 * complaint handling, cutlery rules, and real-time standards search.
 */

const StandardsManager = (function() {
  let searchKeyword = '';
  let openAccordionIds = new Set(['mission', 'serving_rules', 'guest_interaction', 'forbidden']);

  // FORBIDDEN ACTIONS DATA (STOP / RED BLOCKS)
  const FORBIDDEN_ACTIONS = [
    {
      title: "Mehmon bilan tortishish yoki e'tiroz bildirish 🛑",
      desc: "Har qanday vaziyatda mehmon haq. Shikoyat kelganda tortishmasdan tinglash va zudlik bilan hal etish shart."
    },
    {
      title: "Allergiya bor-yo'qligini so'ramasdan taom tavsiya qilish 🛑",
      desc: "Mehmon xavfsizligi birinchi o'rinda. Allergenlar haqida so'ramasdan taom berish qat'iyan man etiladi."
    },
    {
      title: "Kir, tirnalgan yoki shikastlangan idishlarda taom tortish 🛑",
      desc: "Barcha idish va pichoq-vilkalar sirli, toza va parlashi shart."
    },
    {
      title: "Ish vaqtida shaxsiy telefondan foydalanish yoki e'tiborsizlik 🛑",
      desc: "Mehmon kelganda 3 soniya ichida salomlashish va diqqatni mehmonga qaratish shart."
    }
  ];

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const std = DataLoader.getStandards();
    if (!std) {
      container.innerHTML = '<div class="empty-menu-state">Standartlar maʼlumoti yuklanmadi</div>';
      return;
    }

    let html = `
      <div class="standards-wrapper">
        
        <!-- STANDARDS SEARCH BAR -->
        <div class="search-input-group" style="margin-bottom: 16px;">
          <span class="search-icon">🔍</span>
          <input type="text" id="standards-search-input"
                 placeholder="Standartlar bo'yicha qidirish (masalan: 'pichoq', 'shikoyat', 'allergiya')..."
                 value="${escapeHtml(searchKeyword)}"
                 oninput="StandardsManager.handleSearch(this.value)">
        </div>

        <div class="accordion-group">

          <!-- 1. MISSION & VALUES -->
          ${renderAccordionItem('mission', '🌟 Missiya, Qadriyatlar va Prinsiplar', renderMissionContent(std))}

          <!-- 2. SERVING RULES (PICHOQ, VILKA, QOSHIQ) -->
          ${renderAccordionItem('serving_rules', '🍽 Idishlar va Asboblarni Tortish Qoidalari', renderServingRulesContent(std))}

          <!-- 3. GREETINGS & SERVICE STAGES -->
          ${renderAccordionItem('greetings', '🤝 Servisning 5 Bosqichi va Salomlashish Iboralari', renderGreetingsContent(std))}

          <!-- 4. TAKING ORDER & 12 STEPS -->
          ${renderAccordionItem('taking_order', '📋 Buyurtma Qabul Qilish va Raqamlash Tizimi', renderTakingOrderContent(std))}

          <!-- 5. ALLERGIES & 7 ALLERGENS -->
          ${renderAccordionItem('allergies', '⚠️ Allergiya va 7 Allergen Standarti', renderAllergiesContent(std))}

          <!-- 6. COMPLAINTS & TYPICAL SITUATIONS -->
          ${renderAccordionItem('guest_interaction', '🤬 Shikoyatlar Bilan Ishlash va Tipik Vaziyatlar', renderComplaintsContent(std))}

          <!-- 7. FORBIDDEN ACTIONS (STOP RED BLOCKS) -->
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

  // CONTENT RENDERERS
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
      <p style="font-size: 13px; margin-bottom: 10px; color: var(--color-text-secondary);">
        Taomlar turi bo'yicha asbob-uskunalarni (pichoq, vilka, qoshiq) to'g'ri taqdim etish qoidalari:
      </p>
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
      <h4 style="color: var(--color-primary); margin-bottom: 8px;">Salomlashish Iboralari:</h4>
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
      <h4 style="color: var(--color-primary); margin-bottom: 8px;">Buyurtma olish tavsiyalari:</h4>
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
      <h4 style="color: var(--color-primary); margin-bottom: 8px;">Asosiy 7 Allergen Ro'yxati:</h4>
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
        <p style="font-size: 12.5px; margin-top: 4px;">Mehmon shikoyat qilganda e'tiroz bildirmang. Sabr bilan tinglang va zudlik bilan yechim taklif eting.</p>
      </div>

      <h4 style="color: var(--color-primary); margin-bottom: 8px;">Tipik Vaziyatlar va Tayyor Javoblar:</h4>
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
    return `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${FORBIDDEN_ACTIONS.map(item => `
          <div class="alert-box alert-forbidden">
            <h4 style="color: var(--color-danger); font-size: 14px; margin-bottom: 4px;">${escapeHtml(item.title)}</h4>
            <p style="font-size: 12.5px; color: #7f1d1d;">${escapeHtml(item.desc)}</p>
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
