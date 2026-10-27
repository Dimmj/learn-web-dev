import { useState, useEffect } from "react";
import Header from "./components/Header";
import Stepper from "./components/Stepper";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import BookingBottomBar from "./components/BookingBottomBar";
import Footer from "./components/Footer";
import { fetchToday, fetchSlots } from "./api";

function App() {
  // Сегодня с сервера
  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState(null);

  // Что видит и выбрал пользователь
  const [currentYear, setCurrentYear] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Слоты
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [errorSlots, setErrorSlots] = useState(null);

  // 1. Загрузка «сегодня» при открытии
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadingToday(true);
        setErrorToday(null);
        const data = await fetchToday();
        if (cancelled) return;

        setToday(data);
        setCurrentYear(data.year);
        setCurrentMonth(data.month);
        setSelectedDate({ year: data.year, month: data.month, day: data.day });
      } catch (err) {
        if (cancelled) return;
        setErrorToday(err.message);
      } finally {
        if (!cancelled) setLoadingToday(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // 2. Загрузка слотов при смене даты
  useEffect(() => {
    // today ещё не пришёл или дата не выбрана — нечего грузить.
    if (!today || !selectedDate) {
      setSlots([]);
      setLoadingSlots(false);
      setErrorSlots(null);
      return;
    }

    // cancelled — флаг «этот запрос устарел».
    // React вызывает cleanup у предыдущего эффекта, когда dependencies
    // меняются или компонент размонтируется. Там мы ставим cancelled=true,
    // и старый ответ уже не сможет перезаписать состояние.
    let cancelled = false;

    async function load() {
      try {
        setLoadingSlots(true);
        setErrorSlots(null);
        const response = await fetchSlots(selectedDate);
        if (cancelled) return;

        // Проверка от «сервер вернул не ту дату». Если ответ не совпадает
        // с тем, что мы просили, — игнорируем.
        const d = response.date;
        if (
          d.day !== selectedDate.day ||
          d.month !== selectedDate.month ||
          d.year !== selectedDate.year
        ) {
          return;
        }

        setSlots(response.slots);
      } catch (err) {
        if (cancelled) return;
        setErrorSlots(err.message);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [today, selectedDate]);

  // Обработчики
  function changeMonth(delta) {
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }

    setCurrentMonth(m);
    setCurrentYear(y);

    // Если выбранная дата не в новом месяце — сбрасываем её.
    // Тогда useEffect по selectedDate не запустит загрузку слотов.
    if (
      !selectedDate ||
      selectedDate.year !== y ||
      selectedDate.month !== m
    ) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }

  function handleDayClick(day) {
    setSelectedDate({ year: currentYear, month: currentMonth, day });
    setSelectedTime(null);
  }

  function handleSlotClick(time) {
    setSelectedTime(time);
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;
    const { year, month, day } = selectedDate;
    const dateStr =
      String(day).padStart(2, "0") + "." +
      String(month + 1).padStart(2, "0") + "." +
      year;
    alert("Запись подтверждена: " + dateStr + " в " + selectedTime);
  }

  const canContinue = Boolean(selectedDate && selectedTime);

  // Рендер области слотов с учётом loading / error
  function renderSlotsArea() {
    if (loadingSlots) {
      return (
        <aside className="card slots">
          <h2 className="slots__title">Доступное время</h2>
          <div className="slots__grid">
            <p className="slots__empty">Загрузка слотов...</p>
          </div>
        </aside>
      );
    }
    if (errorSlots) {
      return (
        <aside className="card slots">
          <h2 className="slots__title">Доступное время</h2>
          <div className="slots__grid">
            <p className="slots__empty">Ошибка: {errorSlots}</p>
          </div>
        </aside>
      );
    }
    return (
      <TimeSlots
        slots={slots}
        selectedTime={selectedTime}
        onSlotClick={handleSlotClick}
      />
    );
  }

  // Рендер всей страницы
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

          {loadingToday ? (
            <p className="slots__empty">Загрузка...</p>
          ) : errorToday ? (
            <p className="slots__empty">Ошибка: {errorToday}</p>
          ) : (
            <>
              <div className="booking">
                <Calendar
                  year={currentYear}
                  month={currentMonth}
                  selectedDate={selectedDate}
                  today={today}
                  onPrevMonth={() => changeMonth(-1)}
                  onNextMonth={() => changeMonth(1)}
                  onDayClick={handleDayClick}
                />
                {renderSlotsArea()}
              </div>

              <div className="actions">
                <BookingBottomBar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
                <button
                  className="btn"
                  type="button"
                  disabled={!canContinue}
                  onClick={handleContinue}
                >
                  Продолжить
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;