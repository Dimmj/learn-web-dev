export default function TimeSlots({ slots, selectedTime, onSlotClick }) {
  return (
    <aside className="card slots" aria-label="Доступное время">
      <h2 className="slots__title">Доступное время</h2>

      <div className="slots__grid">
        {!slots || slots.length === 0 ? (
          <p className="slots__empty">В этот день нет доступного времени</p>
        ) : (
          slots.map((slot) =>
            !slot.available ? (
              <button
                key={slot.time}
                className="slot slot--busy"
                type="button"
                disabled
              >
                <span className="slot__time">{slot.time}</span>
                <span className="slot__note">Занято</span>
              </button>
            ) : (
              <button
                key={slot.time}
                className={
                  "slot" + (selectedTime === slot.time ? " slot--selected" : "")
                }
                type="button"
                onClick={() => onSlotClick(slot.time)}
              >
                <span className="slot__time">{slot.time}</span>
              </button>
            )
          )
        )}
      </div>
    </aside>
  );
}