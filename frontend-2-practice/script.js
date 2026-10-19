// 1. ДАННЫЕ

const SERVER_DATA = {
  today: (function () {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  })(),
};

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

// 2. ЧИСТЫЕ ФУНКЦИИ

function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

function isDateSelectable(day, month, year) {
  const today = SERVER_DATA.today;
  return compareDates({ day: day, month: month, year: year }, today) >= 0;
}

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

function generateSlotsForDate(date) {
  const allTimes = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const seed = date.day * 31 + date.month * 12 + date.year;
  return allTimes.map(function (time, i) {
    return { time: time, isBusy: (seed + i * 7) % 5 === 0 };
  });
}

// 5. РЕНДЕР

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

      // Защита от null: selectedDate может быть сброшен при смене месяца
      const isSelected =
        state.selectedDate !== null &&
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

function renderTimeSlots() {
  const grid = document.querySelector(".slots__grid");

  // Если дата не выбрана — показываем заглушку вместо слотов
  if (!state.selectedDate) {
    state.slots = [];
    grid.innerHTML = '<p class="slots__empty">Выберите дату в календаре</p>';
    return;
  }

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

// Управление кнопкой «Продолжить»
function updateContinueButton() {
  const btn = document.querySelector(".btn");
  if (!btn) return;
  btn.disabled = !(state.selectedDate && state.selectedTime);
}

// 6. ОБРАБОТЧИКИ

function onDayClick(event) {
  const btn = event.currentTarget;
  const day = parseInt(btn.dataset.day, 10);

  state.selectedDate = { year: state.currentYear, month: state.currentMonth, day: day };
  state.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
  updateContinueButton();
}

function onTimeSlotClick(event) {
  state.selectedTime = event.currentTarget.dataset.time;
  renderTimeSlots();
  updateContinueButton();
}

function onContinueClick() {
  // Повторная проверка при нажатии — состояние могло измениться
  if (!state.selectedDate || !state.selectedTime) {
    return;
  }

  const { year, month, day } = state.selectedDate;

  if (!isDateSelectable(day, month, year)) {
    return;
  }

  const slot = state.slots.find(function (s) {
    return s.time === state.selectedTime;
  });
  if (!slot || slot.isBusy) {
    return;
  }

  const dateStr =
    String(day).padStart(2, "0") + "." +
    String(month + 1).padStart(2, "0") + "." +
    year;

  // Здесь должно быть реальное действие: fetch на сервер, модалка, переход и т.п.
  console.log("Подтверждена запись:", { date: dateStr, time: state.selectedTime });
  alert("Запись подтверждена: " + dateStr + " в " + state.selectedTime);
}

function handleMonthChange() {
  // Если выбранная дата не принадлежит отображаемому месяцу — сбрасываем выбор.
  // Иначе слоты останутся от прежней даты и состояние будет рассогласовано.
  if (
    !state.selectedDate ||
    state.selectedDate.year !== state.currentYear ||
    state.selectedDate.month !== state.currentMonth
  ) {
    state.selectedDate = null;
    state.selectedTime = null;
  }

  renderCalendar();
  renderTimeSlots();
  updateContinueButton();
}

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
    handleMonthChange();
  });

  nextBtn.addEventListener("click", function () {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    handleMonthChange();
  });
}

function setupContinueButton() {
  const btn = document.querySelector(".btn");
  if (!btn) return;
  btn.addEventListener("click", onContinueClick);
}

// 7. ИНИЦИАЛИЗАЦИЯ

function init() {
  renderCalendar();
  renderTimeSlots();
  setupMonthNavigation();
  setupContinueButton();
  updateContinueButton();
}

document.addEventListener("DOMContentLoaded", init);