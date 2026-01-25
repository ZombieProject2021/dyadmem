/**
 * Pro Unlock Override
 * Переопределяет функции Pro проверки из schemas.ts
 * 
 * Этот модуль должен быть импортирован в начале приложения
 * чтобы переопределить функции до их использования
 */

// Новые функции которые всегда разблокированы
export function hasDyadProKey(settings: any): boolean {
  // Всегда возвращаем true - Pro разблокирован
  return true;
}

export function isDyadProEnabled(settings: any): boolean {
  // Всегда возвращаем true - Pro включен
  return settings?.enableDyadPro !== false;
}

console.log("✓ Pro функции разблокированы (override)");
