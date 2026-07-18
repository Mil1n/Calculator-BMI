(function (root) {
  const HISTORY_STORAGE_KEY = 'bmi-calculator-history';
  const HISTORY_LIMIT = 10;

  function createHistoryItem(result, createdAt = new Date()) {
    return {
      id: `${createdAt.toISOString()}-${result.bmi}-${Math.round(result.heightMeters * 100)}-${result.weightKg}`,
      createdAt: createdAt.toISOString(),
      bmi: result.bmi,
      category: result.category.title,
      categoryKey: result.category.key,
      height: Math.round(result.heightMeters * 100),
      weight: result.weightKg
    };
  }

  function getHistory(storage = root.localStorage) {
    if (!storage) {
      return [];
    }

    try {
      const history = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY)) || [];
      return Array.isArray(history) ? history : [];
    } catch (error) {
      return [];
    }
  }

  function isSameMeasurement(firstItem, secondItem) {
    return Boolean(
      firstItem &&
      secondItem &&
      firstItem.bmi === secondItem.bmi &&
      firstItem.height === secondItem.height &&
      firstItem.weight === secondItem.weight &&
      firstItem.categoryKey === secondItem.categoryKey
    );
  }

  function saveHistory(history, storage = root.localStorage) {
    if (!storage) {
      return history;
    }

    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return history;
  }

  function addHistoryItem(result, storage = root.localStorage, createdAt = new Date()) {
    const historyItem = createHistoryItem(result, createdAt);
    const currentHistory = getHistory(storage);
    const dedupedHistory = isSameMeasurement(historyItem, currentHistory[0])
      ? currentHistory.slice(1)
      : currentHistory;
    const history = [historyItem, ...dedupedHistory].slice(0, HISTORY_LIMIT);

    return saveHistory(history, storage);
  }

  function clearHistory(storage = root.localStorage) {
    if (storage) {
      storage.removeItem(HISTORY_STORAGE_KEY);
    }

    return [];
  }

  function formatHistoryDate(value) {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function toCsvValue(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
  }

  function exportHistoryToCsv(history) {
    const header = ['Дата', 'BMI', 'Категория', 'Рост, см', 'Вес, кг'];
    const rows = history.map((item) => [
      formatHistoryDate(item.createdAt),
      item.bmi.toFixed(1),
      item.category,
      item.height,
      item.weight
    ]);

    return [header, ...rows]
      .map((row) => row.map(toCsvValue).join(','))
      .join('\n');
  }

  const api = {
    HISTORY_LIMIT,
    HISTORY_STORAGE_KEY,
    addHistoryItem,
    clearHistory,
    createHistoryItem,
    exportHistoryToCsv,
    formatHistoryDate,
    getHistory,
    isSameMeasurement,
    saveHistory
  };

  root.BMIHistory = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
