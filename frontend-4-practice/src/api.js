// API-клиент. Все запросы к серверу — здесь.
// Компоненты не знают про fetch, URL и JSON — они вызывают функцию
// и получают данные либо Error.

export async function fetchToday() {
  try {
    const response = await fetch("/api/booking/today");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки сегодня:", error);
    throw error;
  }
}

export async function fetchSlots(date) {
  try {
    const params = new URLSearchParams({
      day: String(date.day),
      month: String(date.month),
      year: String(date.year),
    });
    const response = await fetch(`/api/slots?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки слотов:", error);
    throw error;
  }
}