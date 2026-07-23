/**
 * SAFIA STORAGE MANAGER MODULE
 * Manages localStorage state for learned flashcards, quiz history, and progress.
 */

const StorageManager = (function() {
  const LEARNED_KEY = 'safia_learned_flashcards_v1';
  const QUIZ_KEY = 'safia_quiz_history_v1';

  function getLearnedMap() {
    try {
      const data = localStorage.getItem(LEARNED_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Storage read error:', e);
      return {};
    }
  }

  return {
    isLearned(cardKey) {
      const map = getLearnedMap();
      return !!map[cardKey];
    },

    markLearned(cardKey) {
      const map = getLearnedMap();
      map[cardKey] = true;
      try {
        localStorage.setItem(LEARNED_KEY, JSON.stringify(map));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    },

    unmarkLearned(cardKey) {
      const map = getLearnedMap();
      delete map[cardKey];
      try {
        localStorage.setItem(LEARNED_KEY, JSON.stringify(map));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
    },

    getLearnedCount(type) {
      const map = getLearnedMap();
      return Object.keys(map).filter(k => !type || k.startsWith(type)).length;
    },

    saveQuizResult(score, total) {
      try {
        const history = this.getQuizHistory();
        history.push({
          score,
          total,
          percent: Math.round((score / total) * 100),
          date: new Date().toISOString()
        });
        localStorage.setItem(QUIZ_KEY, JSON.stringify(history));
      } catch (e) {
        console.warn('Quiz history save error:', e);
      }
    },

    getQuizHistory() {
      try {
        const data = localStorage.getItem(QUIZ_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    },

    getBestQuizScore() {
      const history = this.getQuizHistory();
      if (history.length === 0) return null;
      return Math.max(...history.map(h => h.percent));
    },

    resetAll() {
      try {
        localStorage.removeItem(LEARNED_KEY);
        localStorage.removeItem(QUIZ_KEY);
      } catch (e) {
        console.warn('Storage clear error:', e);
      }
    }
  };
})();
