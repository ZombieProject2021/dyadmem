/**
 * Pro Unlock Override Module
 * Переопределяет функции Pro проверки чтобы всегда разблокировать Pro
 * 
 * Этот файл переопределяет функции из schemas.ts
 */

export function hasDyadProKey(settings: any): boolean {
  // Всегда возвращаем true - Pro разблокирован
  return true;
}

export function isDyadProEnabled(settings: any): boolean {
  // Всегда возвращаем true - Pro включен
  // Проверяем только enableDyadPro флаг
  return settings?.enableDyadPro !== false;
}
