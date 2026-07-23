/**
 * SAFIA GAMIFIED QUIZ / TEST MODULE
 * Generates 10 randomized questions from 5 distinct question types:
 * 1. Image -> Name
 * 2. Name -> Ingredient
 * 3. Bar Serving Rule
 * 4. Allergen Question
 * 5. Service Standard Question
 * Includes instant green/red visual feedback, progress bar,
 * results screen, error review, and localStorage persistence.
 */

const QuizManager = (function() {
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let userAnswers = []; // { questionText, image, options, selectedIdx, correctIdx, isCorrect }
  let isAnswered = false;

  // DYNAMIC QUESTION GENERATOR (10 RANDOM QUESTIONS FROM 5 TYPES)
  function generateQuizQuestions() {
    const dishes = DataLoader.getDishes();
    const drinks = DataLoader.getDrinks();
    const standards = DataLoader.getStandards();

    const allItems = [...dishes, ...drinks];
    const generated = [];

    if (allItems.length === 0) return [];

    // TYPE 1: RASM -> NOM (Image -> Dish/Drink Name)
    const itemsWithImg = allItems.filter(i => i.image);
    for (let i = 0; i < 2; i++) {
      const target = itemsWithImg[Math.floor(Math.random() * itemsWithImg.length)];
      if (!target) continue;

      const wrongOpts = allItems
        .filter(x => x.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.name_ru);

      const options = [target.name_ru, ...wrongOpts].sort(() => Math.random() - 0.5);

      generated.push({
        type: 'image_to_name',
        question: `🖼 Ushbu taom/ichimlikning nomi nima?`,
        image: target.image,
        options: options,
        correctIdx: options.indexOf(target.name_ru)
      });
    }

    // TYPE 2: NOM -> INGREDIENT
    const dishesWithIng = dishes.filter(d => d.ingredients_ru);
    for (let i = 0; i < 2; i++) {
      const target = dishesWithIng[Math.floor(Math.random() * dishesWithIng.length)];
      if (!target) continue;

      const mainIng = target.ingredients_ru.split(',')[0].trim();
      const wrongIngs = dishes
        .filter(x => x.id !== target.id && x.ingredients_ru)
        .map(x => x.ingredients_ru.split(',')[0].trim())
        .filter(ing => ing !== mainIng)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [mainIng, ...wrongIngs].sort(() => Math.random() - 0.5);

      generated.push({
        type: 'name_to_ingredient',
        question: `🥗 "${target.name_ru}" tarkibida qaysi masalliq mavjud?`,
        image: null,
        options: options,
        correctIdx: options.indexOf(mainIng)
      });
    }

    // TYPE 3: BAR SERVIROVKASI (Serving rule for bar drink)
    const drinksWithServing = drinks.filter(d => d.serving_ru && d.serving_ru.length > 5);
    for (let i = 0; i < 2; i++) {
      const target = drinksWithServing[Math.floor(Math.random() * drinksWithServing.length)];
      if (!target) continue;

      const wrongServings = drinksWithServing
        .filter(x => x.id !== target.id)
        .map(x => x.serving_ru)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [target.serving_ru, ...wrongServings].sort(() => Math.random() - 0.5);

      generated.push({
        type: 'bar_serving',
        question: `☕️ Bar: "${target.name_ru}" qanday servirovka va podacha bilan beriladi?`,
        image: null,
        options: options,
        correctIdx: options.indexOf(target.serving_ru)
      });
    }

    // TYPE 4: ALLERGEN SAVOLI
    const itemsWithAllergens = allItems.filter(i => i.allergens && i.allergens.length > 0);
    for (let i = 0; i < 2; i++) {
      const target = itemsWithAllergens[Math.floor(Math.random() * itemsWithAllergens.length)];
      if (!target) continue;

      const correctAllergen = target.allergens[0];
      const allPossibleAllergens = ['молочные продукты', 'глютен', 'лесные орехи', 'яйца', 'рыба', 'кунжут', 'сосиски куриные'];
      const wrongAllergens = allPossibleAllergens
        .filter(a => !target.allergens.includes(a))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [correctAllergen, ...wrongAllergens].sort(() => Math.random() - 0.5);

      generated.push({
        type: 'allergen_question',
        question: `⚠️ "${target.name_ru}" tarkibida qaysi allergen bor?`,
        image: null,
        options: options,
        correctIdx: options.indexOf(correctAllergen)
      });
    }

    // TYPE 5: SERVIS STANDARTI (Service standards rules)
    const stdQuestionsPool = [
      {
        question: "🤬 Mehmon shikoyat qildiganda birinchi qadam nima?",
        correct: "Mehmon bilan tortishmasdan tinglash va zudlik bilan yechim taklif etish",
        wrongs: [
          "Ofitsiant o'zining haq ekanligini isbotlash",
          "Menejer kelgunicha kutish va mehmonga javob bermaslik",
          "Mehmonning talabini rad etish"
        ]
      },
      {
        question: "🍽 Salatlar va nonushtalar uchun qanday asbob beriladi?",
        correct: "Shaxsan NOJ va VILKA beriladi",
        wrongs: [
          "Faqat osh qoshiq beriladi",
          "Yog'och tutqichli pichoq va vilka",
          "Hech qanday asbob berilmaydi"
        ]
      },
      {
        question: "🛑 Mehmon kelganda salomlashish uchun maksimal vaqt qancha?",
        correct: "3 soniya ichida samimiy salomlashish shart",
        wrongs: [
          "1 daqiqa ichida",
          "Mehmon o'zi chaqirganda",
          "Buyurtma tayyor bo'lganda"
        ]
      }
    ];

    for (let q of stdQuestionsPool) {
      const options = [q.correct, ...q.wrongs].sort(() => Math.random() - 0.5);
      generated.push({
        type: 'service_standard',
        question: q.question,
        image: null,
        options: options,
        correctIdx: options.indexOf(q.correct)
      });
    }

    // Shuffle final 10 questions
    return generated.sort(() => Math.random() - 0.5).slice(0, 10);
  }

  function startNewQuiz() {
    questions = generateQuizQuestions();
    currentIndex = 0;
    score = 0;
    userAnswers = [];
    isAnswered = false;
  }

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (questions.length === 0) {
      startNewQuiz();
    }

    // If quiz complete, render results
    if (currentIndex >= questions.length && questions.length > 0) {
      renderQuizResults(container);
      return;
    }

    const q = questions[currentIndex];
    const total = questions.length;
    const percent = Math.round((currentIndex / total) * 100);

    let html = `
      <div class="quiz-wrapper">
        
        <!-- QUIZ PROGRESS HEADER -->
        <div class="card-progress-header" style="margin-bottom: 16px;">
          <div class="progress-info">
            <span>Savol <strong>${currentIndex + 1} / ${total}</strong></span>
            <span>Ball: ${score}</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        <!-- QUESTION CARD -->
        <div class="quiz-container">
          ${q.image ? `
            <div style="text-align: center; margin-bottom: 12px;">
              <img src="${q.image}" alt="Quiz Image" style="max-height: 160px; border-radius: 10px; border: 1px solid var(--color-border);"
                   onerror="this.style.display='none'">
            </div>
          ` : ''}

          <div class="quiz-question">${escapeHtml(q.question)}</div>

          <div class="quiz-options" id="quiz-options-container">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option-btn" id="opt-btn-${idx}"
                      onclick="QuizManager.selectAnswer(${idx})">
                ${escapeHtml(opt)}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  // INSTANT VISUAL FEEDBACK ON ANSWER SELECTION
  function selectAnswer(selectedIdx) {
    if (isAnswered) return;
    isAnswered = true;

    const q = questions[currentIndex];
    const isCorrect = (selectedIdx === q.correctIdx);

    if (isCorrect) {
      score++;
    }

    // Record answer for error review
    userAnswers.push({
      questionText: q.question,
      options: q.options,
      selectedIdx: selectedIdx,
      correctIdx: q.correctIdx,
      isCorrect: isCorrect
    });

    // Apply visual feedback styles
    const selectedBtn = document.getElementById(`opt-btn-${selectedIdx}`);
    const correctBtn = document.getElementById(`opt-btn-${q.correctIdx}`);

    if (selectedBtn) {
      selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (!isCorrect && correctBtn) {
      correctBtn.classList.add('correct');
    }

    // Advance to next question after 1000ms delay
    setTimeout(() => {
      currentIndex++;
      isAnswered = false;
      render('view-test');
    }, 1000);
  }

  // RESULTS & ERROR REVIEW PANEL
  function renderQuizResults(container) {
    const total = questions.length;
    const percent = Math.round((score / total) * 100);

    // Save to localStorage
    StorageManager.saveQuizResult(score, total);
    const bestScore = StorageManager.getBestQuizScore();

    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

    let html = `
      <div class="quiz-container text-center" style="padding: 24px 16px;">
        <div style="font-size: 48px; margin-bottom: 8px;">
          ${percent >= 80 ? '🏆' : percent >= 60 ? '👍' : '📚'}
        </div>
        <h2 style="color: var(--color-primary); margin-bottom: 6px;">Test Yakunlandi!</h2>
        
        <div style="font-size: 24px; font-weight: 800; color: var(--color-primary); margin: 12px 0;">
          Natijangiz: ${score} / ${total} (${percent}%)
        </div>

        ${bestScore ? `
          <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 16px;">
            Eng yaxshi natijangiz: <strong>${bestScore}%</strong>
          </div>
        ` : ''}

        <!-- ERROR REVIEW SECTION -->
        ${wrongAnswers.length > 0 ? `
          <div style="text-align: left; margin: 20px 0; border-top: 1px dashed var(--color-border); padding-top: 16px;">
            <h4 style="color: var(--color-danger); margin-bottom: 12px;">⚠️ Xatolar ustida ishlash (${wrongAnswers.length} ta xato):</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${wrongAnswers.map(wa => `
                <div style="background: var(--color-bg); padding: 10px; border-radius: 8px; font-size: 13px; border-left: 4px solid var(--color-danger);">
                  <strong style="color: var(--color-primary);">${escapeHtml(wa.questionText)}</strong>
                  <div style="color: var(--color-danger); margin-top: 4px;">❌ Sizning javobingiz: ${escapeHtml(wa.options[wa.selectedIdx])}</div>
                  <div style="color: var(--color-success); font-weight: 600; margin-top: 2px;">✅ To'g'ri javob: ${escapeHtml(wa.options[wa.correctIdx])}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="alert-box alert-recommended" style="margin: 16px 0;">
            <strong>Ajoyib! Barcha savollarga to'g'ri javob berdingiz! 🌟</strong>
          </div>
        `}

        <button class="btn-card-action btn-know" onclick="QuizManager.restartQuiz()">
          🔄 Qayta topshirish
        </button>
      </div>
    `;

    container.innerHTML = html;
  }

  return {
    render(containerId) {
      render(containerId);
    },

    selectAnswer(idx) {
      selectAnswer(idx);
    },

    restartQuiz() {
      startNewQuiz();
      render('view-test');
    }
  };
})();
