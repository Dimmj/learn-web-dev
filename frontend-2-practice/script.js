// 1. ДАННЫЕ

const SERVER_DATA = {
  // Фиксируем «сегодня» на момент загрузки и обнуляем время
  today: (function () {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  })(),
};

/** Названия месяцев в именительном падеже — для заголовка календаря.
 Индекс массива совпадает со значением `month`
 (0 — январь, 11 — декабрь)*/
const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

// 2. ЧИСТЫЕ ФУНКЦИИ

/**Сравнивает две даты по календарному дню
 `-1`, если `date1` раньше `date2`
`0`, если даты совпадают; `1`, если `date1` позже `date2`.
 */
function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

//Проверяет, можно ли выбрать указанный день: он должен быть не раньше «сегодня»
function isDateSelectable(day, month, year) {
  const today = SERVER_DATA.today;
  return compareDates({ day: day, month: month, year: year }, today) >= 0;
}

// Строит сетку календаря для указанного месяца.
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();

  const startDayOfWeek = firstDay.getDay();

  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// 3. СОСТОЯНИЕ
/**
объект Slot:
time — время слота в формате "HH:MM"
isBusy — занят ли слот
 */

/**
объект BookingState
currentYear — год отображаемого месяца
currentMonth — индекс отображаемого месяца
selectedDate — выбранная пользователем дата
selectedTime — выбранное время "HH:MM" или `null`
 */

const state = {
  currentYear: SERVER_DATA.today.year,
  currentMonth: SERVER_DATA.today.month,
  selectedDate: {
    year: SERVER_DATA.today.year,
    month: SERVER_DATA.today.month,
    day: SERVER_DATA.today.day,
  },
  selectedTime: null,
  slots: [],
};

// 4. ИМИТАЦИЯ ДАННЫХ С СЕРВЕРА

//Генерирует список слотов для указанной даты (занятость - случайная)
function generateSlotsForDate(date) {
  const allTimes = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const seed = date.day * 31 + date.month * 12 + date.year;
  return allTimes.map(function (time, i) {
    return { time: time, isBusy: (seed + i * 7) % 5 === 0 };
  });
}

// 5. РЕНДЕР
/**
 Перерисовывает календарь: заголовок с месяцем и сетку дней.
 После вставки HTML заново навешивает обработчики на доступные дни, потому что старые кнопки удаляются вместе с `innerHTML`
 Кликнуть можно только по дням текущего месяца, поэтому координаты для «хвостов» не нужны.
 */
function renderCalendar() {
  const titleEl = document.querySelector(".calendar__title");
  const daysEl = document.querySelector(".days");

  titleEl.textContent = MONTHS_NOMINATIVE[state.currentMonth] + " " + state.currentYear;

  const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
  let html = "";

  weeks.forEach(function (week) {
    week.forEach(function (cell) {
      const classes = ["day"];
      let disabled = false;

      const isSelected =
        !cell.otherMonth &&
        cell.day === state.selectedDate.day &&
        state.currentMonth === state.selectedDate.month &&
        state.currentYear === state.selectedDate.year;

      if (cell.otherMonth) {
        classes.push("day--muted");
        disabled = true;
      } else if (!isDateSelectable(cell.day, state.currentMonth, state.currentYear)) {
        classes.push("day--muted");
        disabled = true;
      } else if (isSelected) {
        classes.push("day--selected");
      }

      // data-month и data-year не пишем - месяц и год и так лежат в state. На клик попадёт только день текущего месяца.
      html +=
        '<button class="' + classes.join(" ") + '" type="button"' +
        ' data-day="' + cell.day + '"' +
        (disabled ? " disabled" : "") +
        ">" + cell.day + "</button>";
    });
  });

  daysEl.innerHTML = html;

  daysEl.querySelectorAll(".day:not([disabled])").forEach(function (btn) {
    btn.addEventListener("click", onDayClick);
  });
}

/**
Перерисовывает сетку слотов для выбранной даты
Занятые слоты рендерятся с `disabled` и без обработчика
Выбранный слот помечается классом `.slot--selected`.
 */
function renderTimeSlots() {
  const grid = document.querySelector(".slots__grid");
  state.slots = generateSlotsForDate(state.selectedDate);

  let html = "";
  state.slots.forEach(function (slot) {
    if (slot.isBusy) {
      html +=
        '<button class="slot slot--busy" type="button" disabled>' +
        '<span class="slot__time">' + slot.time + "</span>" +
        '<span class="slot__note">Занято</span>' +
        "</button>";
    } else {
      const selectedClass = state.selectedTime === slot.time ? " slot--selected" : "";
      html +=
        '<button class="slot' + selectedClass + '" type="button"' +
        ' data-time="' + slot.time + '">' +
        '<span class="slot__time">' + slot.time + "</span>" +
        "</button>";
    }
  });

  grid.innerHTML = html;

  grid.querySelectorAll(".slot:not([disabled])").forEach(function (btn) {
    btn.addEventListener("click", onTimeSlotClick);
  });
}

// 6. ОБРАБОТЧИКИ
/**
 * Обработчик клика по дню календаря
Достаёт число из `data-day`, собирает {@link SimpleDate} из текущего отображаемого месяца и года, сбрасывает выбранное
время (оно относилось к прежнему дню) и запускает перерисовку
`event.currentTarget` - сама кнопка
 */
function onDayClick(event) {
  const btn = event.currentTarget;
  const day = parseInt(btn.dataset.day, 10);

  state.selectedDate = { year: state.currentYear, month: state.currentMonth, day: day };
  state.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
}

/**
Обработчик клика по слоту времени
Сохраняет выбранное время и перерисовывает сетку слотов, чтобы подсветить нужную кнопку.
 */
function onTimeSlotClick(event) {
  state.selectedTime = event.currentTarget.dataset.time;
  renderTimeSlots();
}

/**
Навешивает обработчики на стрелки
Стрелки листают месяцы в пределах 0–11, автоматически меняя год
 кнопки навигации не перерисовываются, повторно вешать обработчики не нужно.
 */
function setupMonthNavigation() {
  const buttons = document.querySelectorAll(".calendar__nav .icon-btn");
  const prevBtn = buttons[0];
  const nextBtn = buttons[1];

  prevBtn.addEventListener("click", function () {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    renderCalendar();
  });

  nextBtn.addEventListener("click", function () {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    renderCalendar();
  });
}

// 7. ИНИЦИАЛИЗАЦИЯ
/**
Точка входа страницы.
Рисует календарь и слоты для текущего месяца, вешает обработчики на стрелки
 */
function init() {
  renderCalendar();
  renderTimeSlots();
  setupMonthNavigation();
}

document.addEventListener("DOMContentLoaded", init);