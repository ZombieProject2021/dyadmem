"use client";

import React, { useState } from 'react';

export function PhpTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPhp = async () => {
    setLoading(true);
    setError(null);
    try {
      // Прямое обращение к PHP серверу на порту 8000
      const response = await fetch('http://localhost:8000/hello.php');
      if (!response.ok) throw new Error('Ошибка сервера');
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось подключиться к PHP серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Тест PHP Сервера</h2>
      <button 
        onClick={testPhp}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Загрузка...' : 'Проверить hello.php'}
      </button>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          Ошибка: {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <p className="text-green-600 font-medium">Успех!</p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
