/**
 * SAFIA DATA LOADER MODULE (Version 10 Cache Key)
 * Automatically clears legacy caches to ensure full 3-language JSON dataset loading.
 */

const DataLoader = (function() {
  const CACHE_KEY_DISHES = 'safia_dishes_cache_v10';
  const CACHE_KEY_DRINKS = 'safia_drinks_cache_v10';
  const CACHE_KEY_STANDARDS = 'safia_standards_cache_v10';

  const CUSTOM_KEY_DISHES = 'safia_dishes_custom_v10';
  const CUSTOM_KEY_DRINKS = 'safia_drinks_custom_v10';

  let cachedDishes = null;
  let cachedDrinks = null;
  let cachedStandards = null;

  // Purge legacy caches once
  function purgeLegacyCaches() {
    ['safia_dishes_cache_v1', 'safia_drinks_cache_v1', 'safia_dishes_custom_v1', 'safia_drinks_custom_v1',
     'safia_dishes_cache_v2', 'safia_drinks_cache_v2', 'safia_dishes_custom_v2', 'safia_drinks_custom_v2'].forEach(key => {
      try { localStorage.removeItem(key); } catch(e){}
    });
  }

  async function fetchWithCache(url, cacheKey) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          console.warn('localStorage save warning:', e);
        }
        return data;
      }
    } catch (err) {
      console.warn(`Network fetch failed for ${url}, attempting cache fallback.`, err);
    }

    const local = localStorage.getItem(cacheKey);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse cache for key:', cacheKey);
      }
    }

    return null;
  }

  return {
    async loadAll() {
      purgeLegacyCaches();

      // 1. Check for custom admin overrides
      const customDishes = localStorage.getItem(CUSTOM_KEY_DISHES);
      const customDrinks = localStorage.getItem(CUSTOM_KEY_DRINKS);

      if (customDishes) {
        try { cachedDishes = JSON.parse(customDishes); } catch (e) {}
      }

      if (customDrinks) {
        try { cachedDrinks = JSON.parse(customDrinks); } catch (e) {}
      }

      // 2. Fetch fresh JSON files
      if (!cachedDishes) {
        cachedDishes = await fetchWithCache('data/dishes.json', CACHE_KEY_DISHES) || [];
      }

      if (!cachedDrinks) {
        cachedDrinks = await fetchWithCache('data/drinks.json', CACHE_KEY_DRINKS) || [];
      }

      cachedStandards = await fetchWithCache('data/standards.json', CACHE_KEY_STANDARDS) || null;

      return {
        dishes: cachedDishes,
        drinks: cachedDrinks,
        standards: cachedStandards
      };
    },

    getDishes() {
      return cachedDishes || [];
    },

    getDrinks() {
      return cachedDrinks || [];
    },

    getStandards() {
      return cachedStandards || null;
    },

    saveCustomDishes(dishes) {
      cachedDishes = dishes;
      localStorage.setItem(CUSTOM_KEY_DISHES, JSON.stringify(dishes));
    },

    saveCustomDrinks(drinks) {
      cachedDrinks = drinks;
      localStorage.setItem(CUSTOM_KEY_DRINKS, JSON.stringify(drinks));
    },

    resetCustomData() {
      localStorage.removeItem(CUSTOM_KEY_DISHES);
      localStorage.removeItem(CUSTOM_KEY_DRINKS);
      localStorage.removeItem(CACHE_KEY_DISHES);
      localStorage.removeItem(CACHE_KEY_DRINKS);
      cachedDishes = null;
      cachedDrinks = null;
    }
  };
})();
