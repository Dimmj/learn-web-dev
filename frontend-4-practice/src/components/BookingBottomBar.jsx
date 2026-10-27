import { DAYS_OF_WEEK, MONTHS_GENITIVE } from "../data/date";

function BookingBottomBar({ selectedDate, selectedTime }) {
  // Если дата не выбрана - показываем подсказку на всю панель.
  if (!selectedDate) {
    return (
      <div className="booking-bar" aria-live="polite">
        <p className="booking-bar__empty">Выберите дату в календаре</p>
      </div>
    );
  }

  const { year, month, day } = selectedDate;

  // getDay() возвращает 0..6 (0 = воскресенье)
  const dayOfWeek = DAYS_OF_WEEK[new Date(year, month, day).getDay()];
  const monthName = MONTHS_GENITIVE[month];

  return (
    <div className="booking-bar" aria-live="polite">
      <p className="booking-bar__date">
        <span className="booking-bar__day-of-week">{dayOfWeek}, </span>
        <span className="booking-bar__day">{day}</span>{" "}
        <span className="booking-bar__month">{monthName}</span>{" "}
        <span className="booking-bar__year">{year}</span>
      </p>

      <p className="booking-bar__time">
        {selectedTime ? (
          <>
            <span className="booking-bar__time-label">Время: </span>
            <span className="booking-bar__time-value">{selectedTime}</span>
          </>
        ) : (
          <span className="booking-bar__time-empty">Выберите время</span>
        )}
      </p>
    </div>
  );
}

export default BookingBottomBar;