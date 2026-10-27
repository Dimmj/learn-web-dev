import {
  MONTHS_NOMINATIVE,
  buildCalendarGrid,
  isDateSelectable,
} from "../data/date";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Calendar({
  year,
  month,
  selectedDate,
  today,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) {
  const weeks = buildCalendarGrid(year, month);

  return (
    <section className="card calendar" aria-label="Календарь записи">
      <header className="calendar__header">
        <h2 className="calendar__title">
          {MONTHS_NOMINATIVE[month]} {year}
        </h2>
        <div className="calendar__nav">
          <button className="icon-btn" type="button"
                  aria-label="Предыдущий месяц" onClick={onPrevMonth}>
            {'<'}
          </button>
          <button className="icon-btn" type="button"
                  aria-label="Следующий месяц" onClick={onNextMonth}>
            {'>'}
          </button>
        </div>
      </header>

      <ul className="weekdays">
        {WEEKDAYS.map((d) => (
          <li key={d} className="weekdays__item">{d}</li>
        ))}
      </ul>

      <div className="days">
        {weeks.map((week, wi) =>
          week.map((cell, ci) => {
            const isSelected =
              !cell.otherMonth &&
              selectedDate &&
              cell.day === selectedDate.day &&
              month === selectedDate.month &&
              year === selectedDate.year;

            let className = "day";
            let disabled = false;

            if (cell.otherMonth) {
              className += " day--muted";
              disabled = true;
            } else if (!isDateSelectable(cell.day, month, year, today)) {
              className += " day--muted";
              disabled = true;
            } else if (isSelected) {
              className += " day--selected";
            }

            return (
              <button
                key={`${wi}-${ci}`}
                className={className}
                type="button"
                disabled={disabled}
                onClick={() => onDayClick(cell.day)}
              >
                {cell.day}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}