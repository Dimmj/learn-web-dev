export default function TimeSlots({
  selectedDate,
  selectedTime,
  slots,
  onSlotClick,
}) {
  return (
    <aside className="card slots" aria-label="Доступное время">
      <h2 className="slots__title">Доступное время</h2>
      <div className="slots__grid">
        {!selectedDate && (
          <p className="slots__empty">Выберите дату в календаре</p>
        )}

        {selectedDate &&
          slots.map((slot) =>
            slot.isBusy ? (
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
          )}
      </div>
    </aside>
  );
}