/**
 * SAFIA MULTI-LANGUAGE (i18n) MODULE WITH DYNAMIC DICTIONARY TRANSLATIONS
 * Supports UZ (O'zbekcha), RU (Ruscha), EN (English).
 * Dynamically translates dish names, ingredients, categories, bar serving rules, and standards.
 */

const I18n = (function() {
  const LANG_KEY = 'safia_lang_v1';
  let currentLang = localStorage.getItem(LANG_KEY) || 'uz';

  // Interface Dictionary
  const DICTIONARY = {
    uz: {
      brandSub: "Standartlar & Menyu",
      adminBtn: "Admin",
      backHome: "Bosh sahifa",
      tabKitchen: "Oshxona",
      tabBar: "Bar",
      tabStandards: "Standartlar",
      tabCards: "Kartochkalar",
      tabTest: "Test",

      searchKitchenPlaceholder: "Oshxona taomlarini qidirish...",
      searchBarPlaceholder: "Bar ichimliklarini qidirish...",
      searchStandardsPlaceholder: "Standartlar bo'yicha qidirish (masalan: 'pichoq', 'shikoyat')...",
      searchAdminPlaceholder: "Nom yoki ID bo'yicha tahrirlash uchun qidirish...",
      allCategories: "Barcha kategoriyalar",
      allGroups: "Barcha guruhlar",
      allergenFilterTitle: "⚠️ Allergen filtri:",
      allergenFilterSub: "Tarkibida borlarini yashirish",

      totalItems: "Jami",
      confirmedCount: "Tasdiqlandi",
      ingredientsLabel: "Tarkibi",
      servingLabel: "Servirovka va podacha",
      confirmedCheckbox: "Tasdiqlandi",
      confirmedBadge: "✓ Tasdiqlangan",

      emptyStateTitle: "Mos taom yoki ichimlik topilmadi",
      emptyStateSub: "Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang",
      btnResetFilters: "🔄 Filtrlarni tozalash",

      flashcardSub: "Aylantirish uchun kartochka ustiga bosing 👆",
      btnLearn: "❌ Qaytarish",
      btnKnow: "✅ Bilaman",
      flashcardDoneTitle: "🎉 Barcha kartochkalarni o'rgandingiz!",
      btnRestart: "🔄 Qayta boshlash",

      quizScore: "Ball",
      quizQuestionLabel: "Savol",
      quizCompletedTitle: "Test Yakunlandi!",
      quizResultScore: "Natijangiz",
      bestScoreLabel: "Eng yaxshi natijangiz",
      errorReviewTitle: "⚠️ Xatolar ustida ishlash",
      yourAnswer: "❌ Sizning javobingiz",
      correctAnswer: "✅ To'g'ri javob",
      perfectScoreMsg: "Ajoyib! Barcha savollarga to'g'ri javob berdingiz! 🌟",

      adminTitle: "⚙️ Admin Menyu Boshqaruvi",
      adminSub: "Menyu va Narxlar Tahrirchisi",
      saveLocalBtn: "💾 Lokal Saqlash",
      exportDishesBtn: "📥 dishes.json Yuklash",
      exportDrinksBtn: "📥 drinks.json Yuklash",
      importJsonBtn: "📤 Tashqi JSON Yuklash",
      resetDefaultBtn: "🔄 Tiklash",
      addNewItemBtn: "➕ Yangi Qo'shish",
      deleteBtn: "🗑 O'chirish"
    },

    ru: {
      brandSub: "Стандарты и Меню",
      adminBtn: "Админ",
      backHome: "Главная",
      tabKitchen: "Кухня",
      tabBar: "Бар",
      tabStandards: "Стандарты",
      tabCards: "Карточки",
      tabTest: "Тест",

      searchKitchenPlaceholder: "Поиск блюд кухни...",
      searchBarPlaceholder: "Поиск напитков бара...",
      searchStandardsPlaceholder: "Поиск по стандартам (например: 'нож', 'жалоба')...",
      searchAdminPlaceholder: "Поиск по названию или ID...",
      allCategories: "Все категории",
      allGroups: "Все группы",
      allergenFilterTitle: "⚠️ Фильтр аллергенов:",
      allergenFilterSub: "Скрыть содержащие аллергены",

      totalItems: "Всего",
      confirmedCount: "Подтверждено",
      ingredientsLabel: "Состав",
      servingLabel: "Сервировка и подача",
      confirmedCheckbox: "Подтверждено",
      confirmedBadge: "✓ Подтверждено",

      emptyStateTitle: "Блюда или напитки не найдены",
      emptyStateSub: "Измените поисковый запрос или сбросьте фильтры",
      btnResetFilters: "🔄 Сбросить фильтры",

      flashcardSub: "Нажмите на карточку, чтобы перевернуть 👆",
      btnLearn: "❌ Повторить",
      btnKnow: "✅ Знаю",
      flashcardDoneTitle: "🎉 Вы изучили все карточки!",
      btnRestart: "🔄 Начать заново",

      quizScore: "Баллы",
      quizQuestionLabel: "Вопрос",
      quizCompletedTitle: "Тест Завершен!",
      quizResultScore: "Ваш результат",
      bestScoreLabel: "Ваш лучший результат",
      errorReviewTitle: "⚠️ Работа над ошибками",
      yourAnswer: "❌ Ваш ответ",
      correctAnswer: "✅ Правильный ответ",
      perfectScoreMsg: "Отлично! Вы ответили правильно на все вопросы! 🌟",

      adminTitle: "⚙️ Админ Управление Меню",
      adminSub: "Редактор Меню и Цен",
      saveLocalBtn: "💾 Сохранить Локально",
      exportDishesBtn: "📥 Скачать dishes.json",
      exportDrinksBtn: "📥 Скачать drinks.json",
      importJsonBtn: "📤 Загрузить JSON",
      resetDefaultBtn: "🔄 Сброс",
      addNewItemBtn: "➕ Добавить Новое",
      deleteBtn: "🗑 Удалить"
    },

    en: {
      brandSub: "Standards & Menu",
      adminBtn: "Admin",
      backHome: "Home",
      tabKitchen: "Kitchen",
      tabBar: "Bar",
      tabStandards: "Standards",
      tabCards: "Flashcards",
      tabTest: "Quiz",

      searchKitchenPlaceholder: "Search kitchen dishes...",
      searchBarPlaceholder: "Search bar drinks...",
      searchStandardsPlaceholder: "Search standards (e.g. 'knife', 'complaint')...",
      searchAdminPlaceholder: "Search by name or ID to edit...",
      allCategories: "All Categories",
      allGroups: "All Groups",
      allergenFilterTitle: "⚠️ Allergen Filter:",
      allergenFilterSub: "Hide items containing allergens",

      totalItems: "Total",
      confirmedCount: "Confirmed",
      ingredientsLabel: "Ingredients",
      servingLabel: "Serving & Presentation",
      confirmedCheckbox: "Confirmed",
      confirmedBadge: "✓ Confirmed",

      emptyStateTitle: "No matching items found",
      emptyStateSub: "Try changing search terms or resetting filters",
      btnResetFilters: "🔄 Reset Filters",

      flashcardSub: "Tap card to flip 👆",
      btnLearn: "❌ Review",
      btnKnow: "✅ I Know",
      flashcardDoneTitle: "🎉 You learned all flashcards!",
      btnRestart: "🔄 Restart",

      quizScore: "Score",
      quizQuestionLabel: "Question",
      quizCompletedTitle: "Quiz Completed!",
      quizResultScore: "Your Score",
      bestScoreLabel: "Your Best Score",
      errorReviewTitle: "⚠️ Review Incorrect Answers",
      yourAnswer: "❌ Your answer",
      correctAnswer: "✅ Correct answer",
      perfectScoreMsg: "Awesome! You answered every question correctly! 🌟",

      adminTitle: "⚙️ Admin Menu Manager",
      adminSub: "Menu & Price Editor",
      saveLocalBtn: "💾 Save Locally",
      exportDishesBtn: "📥 Export dishes.json",
      exportDrinksBtn: "📥 Export drinks.json",
      importJsonBtn: "📤 Import JSON",
      resetDefaultBtn: "🔄 Reset",
      addNewItemBtn: "➕ Add New Item",
      deleteBtn: "🗑 Delete"
    }
  };

  // Dynamic Glossary for Food Names, Ingredients, Categories & Servings
  const FOOD_GLOSSARY = [
    { ru: "Завтраки", uz: "Nonushtalar", en: "Breakfasts" },
    { ru: "Вторые блюда", uz: "Ikkinchi taomlar", en: "Main Courses" },
    { ru: "Салаты", uz: "Salatlar", en: "Salads" },
    { ru: "Супы", uz: "Suplar va krem-suplar", en: "Soups & Cream Soups" },
    { ru: "Десерты", uz: "Shirinliklar", en: "Desserts" },
    { ru: "Авторские чаи", uz: "Mualliflik Choylari", en: "Signature Teas" },
    { ru: "Кофейные напитки", uz: "Kofe Ichimliklari", en: "Coffee Drinks" },
    { ru: "Лимонады", uz: "Limonadlar", en: "Lemonades" },
    { ru: "Смузи и Фреши", uz: "Smuzi va Yangi Sharbatlar", en: "Smoothies & Fresh Juices" },

    { ru: "яйца", uz: "tuxum", en: "eggs" },
    { ru: "яйцо", uz: "tuxum", en: "egg" },
    { ru: "лосось", uz: "losos baliq", en: "salmon" },
    { ru: "авокадо", uz: "avokado", en: "avocado" },
    { ru: "хлеб", uz: "tost noni", en: "bread" },
    { ru: "масло", uz: "sariyog'", en: "butter" },
    { ru: "зелень", uz: "yangi ko'katlar", en: "herbs" },
    { ru: "бекон", uz: "bekon", en: "bacon" },
    { ru: "томаты", uz: "pomidorlar", en: "tomatoes" },
    { ru: "томат", uz: "pomidor", en: "tomato" },
    { ru: "соус", uz: "sous", en: "sauce" },
    { ru: "овсяные хлопья", uz: "suli yormasi", en: "oatmeal" },
    { ru: "молоко", uz: "sut", en: "milk" },
    { ru: "ягоды", uz: "mavsumiy mevalar", en: "berries" },
    { ru: "мёд", uz: "tabiiy asal", en: "honey" },
    { ru: "творог", uz: "tvorog pishlog'i", en: "cottage cheese" },
    { ru: "сметана", uz: "smetana", en: "sour cream" },
    { ru: "джем", uz: "djem", en: "jam" },
    { ru: "сахар", uz: "shakar", en: "sugar" },
    { ru: "куриное филе", uz: "tovuq filesi", en: "chicken fillet" },
    { ru: "курица", uz: "tovuq go'shti", en: "chicken" },
    { ru: "говядина", uz: "mol go'shti", en: "beef" },
    { ru: "ветчина", uz: "vetchina", en: "ham" },
    { ru: "сыр", uz: "pishloq", en: "cheese" },
    { ru: "креветки", uz: "krevetkalar", en: "shrimps" },
    { ru: "тунец", uz: "tunez baliq", en: "tuna" },
    { ru: "грибы", uz: "qo'ziqorinlar", en: "mushrooms" },
    { ru: "сливки", uz: "qaymoq", en: "cream" },
    { ru: "картофель", uz: "kartoshka", en: "potatoes" },
    { ru: "огурцы", uz: "bodring", en: "cucumber" },
    { ru: "лук", uz: "piyoz", en: "onion" },
    { ru: "чеснок", uz: "sarimsoqpiyoz", en: "garlic" },
    { ru: "перец", uz: "murch", en: "pepper" },
    { ru: "соль", uz: "tuz", en: "salt" },
    { ru: "паста", uz: "pasta makaroni", en: "pasta" },
    { ru: "лимон", uz: "limon", en: "lemon" },
    { ru: "мята", uz: "yalpiz", en: "mint" },
    { ru: "лед", uz: "muz bo'laklari", en: "ice cubes" },
    { ru: "сироп", uz: "sirop", en: "syrup" },
    { ru: "кофе", uz: "kofe", en: "coffee" },
    { ru: "чай", uz: "choy", en: "tea" },
    { ru: "апельсин", uz: "apelsin", en: "orange" },
    { ru: "клубника", uz: "qulupnay", en: "strawberry" },
    { ru: "персик", uz: "shaftoli", en: "peach" },
    { ru: "маракуйя", uz: "marakuyya", en: "passion fruit" },
    { ru: "подается в", uz: "beriladi:", en: "served in:" },
    { ru: "подается с", uz: "birga beriladi:", en: "served with:" },
    { ru: "бокал", uz: "bokal stakan", en: "glass" },
    { ru: "кружка", uz: "chashka kruzka", en: "mug" },
    { ru: "трубочка", uz: "naycha (trubochka)", en: "straw" },
    { ru: "украшается", uz: "bezatiladi:", en: "garnished with:" }
  ];

  function translateText(text) {
    if (!text || typeof text !== 'string') return text || '';
    if (currentLang === 'ru') return text;

    let res = text;
    FOOD_GLOSSARY.forEach(item => {
      const reg = new RegExp(item.ru, 'gi');
      const replacement = item[currentLang] || item.ru;
      res = res.replace(reg, replacement);
    });

    return res;
  }

  return {
    getLang() {
      return currentLang;
    },

    setLang(lang) {
      if (['uz', 'ru', 'en'].includes(lang)) {
        currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        document.dispatchEvent(new CustomEvent('safia_lang_changed', { detail: { lang } }));
      }
    },

    t(key) {
      const dict = DICTIONARY[currentLang] || DICTIONARY.uz;
      return dict[key] || key;
    },

    getField(item, fieldPrefix) {
      if (!item) return '';
      const key = `${fieldPrefix}_${currentLang}`;
      if (item[key]) return item[key];

      const fallbackRu = item[`${fieldPrefix}_ru`] || item[fieldPrefix] || '';
      return translateText(fallbackRu);
    },

    translate(text) {
      return translateText(text);
    }
  };
})();
