const STEPS = [
  { num: 1, label: "Выбор мастера" },
  { num: 2, label: "Выбор услуги" },
  { num: 3, label: "Выбор времени", active: true },
  { num: 4, label: "Контактные данные" },
  { num: 5, label: "Подтверждение" },
];

export default function Stepper() {
  return (
    <div className="stepper">
      <ol className="steps container">
        {STEPS.map((s) => (
          <li key={s.num} className={"step" + (s.active ? " step--active" : "")}>
            <span className="step__num">{s.num}</span>
            <span className="step__label">{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}