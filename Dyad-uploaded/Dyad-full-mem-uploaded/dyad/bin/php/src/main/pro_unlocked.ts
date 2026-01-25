/**
 * Pro Unlock Module
 * Разблокирует все Pro функции при запуске
 * БЕЗ перезаписи существующих API ключей пользователя
 */

export function initializeDyadProUnlocked() {
  try {
    // Пропускаем инициализацию в renderer процессе
    if (typeof window !== 'undefined') {
      console.log("Pro unlock: инициализирован в renderer");
      return;
    }
    
    // Динамический импорт для main процесса
    const { readSettings, writeSettings } = require("./settings");
    const settings = readSettings();
    
    // Проверяем есть ли уже Pro функции включены
    const alreadyUnlocked = 
      settings.enableDyadPro && 
      settings.enableProWebSearch && 
      settings.enableProLazyEditsMode &&
      settings.enableProSmartFilesContextMode;
    
    if (alreadyUnlocked) {
      console.log("✓ Pro функции уже разблокированы");
      return;
    }
    
    // Включаем только Pro функции, НЕ трогаем API ключи
    writeSettings({
      ...settings,
      enableDyadPro: true,
      enableProWebSearch: true,
      enableProLazyEditsMode: true,
      proLazyEditsMode: "v2",
      enableProSmartFilesContextMode: true,
      proSmartContextOption: "deep",
      // Сохраняем все существующие providerSettings как есть
      providerSettings: settings.providerSettings || {},
    });
    
    console.log("✓ Pro функции разблокированы");
  } catch (error) {
    console.log("Pro unlock инициализирован (или ошибка)");
  }
}
