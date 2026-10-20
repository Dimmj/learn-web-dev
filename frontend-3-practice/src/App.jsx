import { useState, useEffect } from "react";
import Header from "./components/Header";
import Stepper from "./components/Stepper";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import Footer from "./components/Footer";
import { generateSlotsForDate } from "./data/slots";
import { isDateSelectable } from "./data/date";


// «Сегодня» вычисляется один раз при загрузке модуля
const TODAY = (() => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
})();


function App() {
  // Состояние календаря и выбора
  const [currentYear, setCurrentYear] = useState(TODAY.year);
  const [currentMonth, setCurrentMonth] = useState(TODAY.month);
  const [selectedDate, setSelectedDate] = useState({ ...TODAY });
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState(() => generateSlotsForDate(TODAY));

  // Слоты всегда соответствуют выбранной дате
  useEffect(() => {
    if (selectedDate) {
      setSlots(generateSlotsForDate(selectedDate));
    } else {
      setSlots([]);
    }
  }, [selectedDate]);

  // Листание месяцев вперёд/назад
  function changeMonth(delta) {
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }

    setCurrentMonth(m);
    setCurrentYear(y);

    // Если выбранная дата не в новом месяце — сбрасываем выбор
    if (
      !selectedDate ||
      selectedDate.year !== y ||
      selectedDate.month !== m
    ) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }

  // Клик по дню: выбираем дату и сбрасываем время
  function handleDayClick(day) {
    setSelectedDate({ year: currentYear, month: currentMonth, day });
    setSelectedTime(null);
  }

  // Клик по слоту: запоминаем время
  function handleSlotClick(time) {
    setSelectedTime(time);
  }

  // Кнопка «Продолжить»
  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    const { year, month, day } = selectedDate;
    if (!isDateSelectable(day, month, year, TODAY)) return;

    const slot = slots.find((s) => s.time === selectedTime);
    if (!slot || slot.isBusy) return;

    const dateStr =
      String(day).padStart(2, "0") + "." +
      String(month + 1).padStart(2, "0") + "." +
      year;

    console.log("Подтверждена запись:", { date: dateStr, time: selectedTime });
    alert("Запись подтверждена: " + dateStr + " в " + selectedTime);
  }

  const canContinue = Boolean(selectedDate && selectedTime);

  return (
    <div className="page">
      <Header />
      <Stepper />

      <main className="main">
        <div className="container">
          <div className="page-title">
            <span className="page-title__accent" aria-hidden="true"></span>
            <h1 className="page-title__text">Выбор времени</h1>
          </div>

          <div className="booking">
            <Calendar
              year={currentYear}
              month={currentMonth}
              selectedDate={selectedDate}
              today={TODAY}
              onPrevMonth={() => changeMonth(-1)}
              onNextMonth={() => changeMonth(1)}
              onDayClick={handleDayClick}
            />
            <TimeSlots
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              slots={slots}
              onSlotClick={handleSlotClick}
            />
          </div>

          <div className="actions">
            <button
              className="btn"
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Продолжить
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;