/**
 * SAFIA QUIZ MODULE
 * Generates 10 randomized questions with instant feedback,
 * error review panel, localStorage history, and dynamic 3-language support.
 */

const QuizManager = (function() {
  const TOTAL_QUESTIONS = 10;
  let quizSession = [];
  let currentStep = 0;
  let userAnswers = [];
  let isAnswered = false;

  function generateQuizSession() {
    const dishes = DataLoader.getDishes();
    const drinks = DataLoader.getDrinks();

    quizSession = [];
    userAnswers = [];
    currentStep = 0;
    isAnswered = false;

    if (dishes.length === 0 || drinks.length === 0) return;

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const typeIndex = i % 4; // 4 question types

      if (typeIndex === 0 && dishes.length >= 4) {
        // TYPE 1: Image -> Dish Name
        const target = getRandomItem(dishes);
        const options = getMultipleChoiceOptions(dishes, target, 'name');
        quizSession.push({
          type: 'image_to_name',
          questionText: "Rasmda ko'rsatilgan taom nomini toping:",
          image: target.image,
          correctAnswer: I18n.getField(target, 'name'),
          options: options,
          targetItem: target
        });
      } else if (typeIndex === 1 && dishes.length >= 4) {
        // TYPE 2: Name -> Main Ingredient
        const target = getRandomItem(dishes);
        const options = getMultipleChoiceOptions(dishes, target, 'ingredients');
        quizSession.push({
          type: 'name_to_ingredient',
          questionText: `"${I18n.getField(target, 'name')}" taomining tarkibini toping:`,
          correctAnswer: I18n.getField(target, 'ingredients'),
          options: options,
          targetItem: target
        });
      } else if (typeIndex === 2 && drinks.length >= 4) {
        // TYPE 3: Bar Serving Rule
        const target = getRandomItem(drinks.filter(d => d.serving_ru || d.serving_uz));
        if (target) {
          const options = getMultipleChoiceOptions(drinks, target, 'serving');
          quizSession.push({
            type: 'bar_serving',
            questionText: `"${I18n.getField(target, 'name')}" bar ichimligining to'g'ri servirovka qoidasini toping:`,
            correctAnswer: I18n.getField(target, 'serving'),
            options: options,
            targetItem: target
          });
        }
      } else {
        // TYPE 4: Allergen Question
        const target = getRandomItem(dishes.filter(d => d.allergens && d.allergens.length > 0)) || getRandomItem(dishes);
        const hasAllergen = target.allergens && target.allergens.length > 0;
        const correctAlg = hasAllergen ? I18n.translate(target.allergens[0]) : "Allergen mavjud emas";

        quizSession.push({
          type: 'allergen',
          questionText: `"${I18n.getField(target, 'name')}" tarkibida qaysi allergen mavjud?`,
          correctAnswer: correctAlg,
          options: shuffleArray([correctAlg, "🥜 Yong'oq", "🥛 Sut", "🌾 Glyuten"]),
          targetItem: target
        });
      }
    }
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getMultipleChoiceOptions(sourceArr, targetItem, fieldPrefix) {
    const correctVal = I18n.getField(targetItem, fieldPrefix);
    const options = [correctVal];

    while (options.length < 4) {
      const randomItem = getRandomItem(sourceArr);
      const val = I18n.getField(randomItem, fieldPrefix);
      if (val && !options.includes(val)) {
        options.push(val);
      }
    }

    return shuffleArray(options);
  }

  function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (quizSession.length === 0) {
      generateQuizSession();
    }

    if (currentStep >= quizSession.length) {
      renderQuizResults(container);
      return;
    }

    const question = quizSession[currentStep];

    let html = `
      <div class="quiz-container">
        
        <!-- HEADER PROGRESS -->
        <div class="card-progress-header" style="margin-bottom: 16px;">
          <div class="progress-info">
            <span>${I18n.t('quizQuestionLabel')}: <strong>${currentStep + 1} / ${quizSession.length}</strong></span>
            <span>${Math.round(((currentStep + 1) / quizSession.length) * 100)}%</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill" style="width: ${Math.round(((currentStep + 1) / quizSession.length) * 100)}%;"></div>
          </div>
        </div>

        <!-- QUESTION IMAGE IF APPLICABLE -->
        ${question.image ? `
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="${question.image}" alt="Question Image"
                 style="max-width: 220px; max-height: 180px; border-radius: var(--radius-md); border: 2px solid var(--color-border); object-fit: cover;">
          </div>
        ` : ''}

        <!-- QUESTION TEXT -->
        <div class="quiz-question">${escapeHtml(question.questionText)}</div>

        <!-- OPTIONS BUTTONS -->
        <div class="quiz-options">
          ${question.options.map((opt, idx) => `
            <button class="quiz-option-btn" id="opt-btn-${idx}"
                    onclick="QuizManager.selectAnswer('${escapeHtml(opt)}', ${idx})">
              ${escapeHtml(opt)}
            </button>
          `).join('')}
        </div>

      </div>
    `;

    container.innerHTML = html;
  }

  function renderQuizResults(container) {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const total = quizSession.length;
    const scorePercent = Math.round((correctCount / total) * 100);

    StorageManager.saveQuizResult(correctCount, total);
    const bestScore = StorageManager.getBestQuizScore();

    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

    let html = `
      <div class="quiz-container text-center">
        <div style="font-size: 54px; margin-bottom: 8px;">
          ${scorePercent >= 80 ? '🏆' : '📊'}
        </div>
        <h2 style="color: var(--color-primary); margin-bottom: 6px;">${I18n.t('quizCompletedTitle')}</h2>
        
        <div style="font-size: 24px; font-weight: 800; color: var(--color-primary); margin-bottom: 4px;">
          ${correctCount} / ${total} — ${scorePercent}%
        </div>
        
        <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 16px;">
          ${I18n.t('bestScoreLabel')}: <strong>${bestScore.score} / ${bestScore.total} (${bestScore.percent}%)</strong>
        </div>

        ${scorePercent === 100 ? `
          <div class="alert-box alert-recommended" style="margin-bottom: 20px;">
            ${I18n.t('perfectScoreMsg')}
          </div>
        ` : ''}

        <!-- ERROR REVIEW PANEL -->
        ${wrongAnswers.length > 0 ? `
          <div style="text-align: left; margin-bottom: 20px;">
            <h4 style="color: var(--color-danger); margin-bottom: 10px;">${I18n.t('errorReviewTitle')} (${wrongAnswers.length}):</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${wrongAnswers.map(wa => `
                <div style="background: var(--color-bg); border: 1px solid var(--color-border); border-left: 4px solid var(--color-danger); padding: 10px; border-radius: var(--radius-sm);">
                  <div style="font-size: 13px; font-weight: 700; color: var(--color-primary);">${escapeHtml(wa.questionText)}</div>
                  <div style="font-size: 12px; color: var(--color-danger); margin-top: 2px;">
                    ${I18n.t('yourAnswer')}: <strong>${escapeHtml(wa.userChoice)}</strong>
                  </div>
                  <div style="font-size: 12px; color: var(--color-success); margin-top: 2px;">
                    ${I18n.t('correctAnswer')}: <strong>${escapeHtml(wa.correctAnswer)}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <button class="btn-card-action btn-know" onclick="QuizManager.restartQuiz()" style="min-width: 220px;">
          🔄 ${I18n.t('btnRestart')}
        </button>
      </div>
    `;

    container.innerHTML = html;
  }

  return {
    render(containerId) {
      render(containerId);
    },

    selectAnswer(userChoice, optIndex) {
      if (isAnswered) return;
      isAnswered = true;

      const q = quizSession[currentStep];
      const isCorrect = userChoice === q.correctAnswer;

      userAnswers.push({
        questionText: q.questionText,
        userChoice: userChoice,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect
      });

      const selectedBtn = document.getElementById(`opt-btn-${optIndex}`);
      if (selectedBtn) {
        if (isCorrect) {
          selectedBtn.style.background = 'var(--color-success-bg)';
          selectedBtn.style.borderColor = 'var(--color-success)';
          selectedBtn.style.color = 'var(--color-success)';
        } else {
          selectedBtn.style.background = 'var(--color-danger-bg)';
          selectedBtn.style.borderColor = 'var(--color-danger)';
          selectedBtn.style.color = 'var(--color-danger)';
        }
      }

      // Highlight correct option if wrong
      if (!isCorrect) {
        q.options.forEach((opt, idx) => {
          if (opt === q.correctAnswer) {
            const correctBtn = document.getElementById(`opt-btn-${idx}`);
            if (correctBtn) {
              correctBtn.style.background = 'var(--color-success-bg)';
              correctBtn.style.borderColor = 'var(--color-success)';
            }
          }
        });
      }

      setTimeout(() => {
        currentStep++;
        isAnswered = false;
        render('view-test');
      }, 1000);
    },

    restartQuiz() {
      generateQuizSession();
      render('view-test');
    }
  };
})();
