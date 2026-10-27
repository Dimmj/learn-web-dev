// «База данных» приложения.
// Пока данные лежат прямо в модуле. Когда появится настоящий backend —
// файл исчезнет, а клиент продолжит обращаться к тем же /api/...

const now = new Date();

export const database = {
  today: {
    year: now.getFullYear(),
    month: now.getMonth(), // 0-индексный, как в Date
    day: now.getDate(),
  },
};

// Два набора слотов — чтобы соседние дни отличались.
// Слот: { time: "10:00", available: true | false }.
const SLOTS_EVEN_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

const SLOTS_ODD_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: false },
  { time: "13:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:00", available: false },
];

// Имитация «разные дни — разные слоты».
export function getSlotsForDay(day) {
  return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}