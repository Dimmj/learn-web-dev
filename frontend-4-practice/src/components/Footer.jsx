export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="logo--footer" aria-hidden="true">
            <img className="logo__img" src="/images/logo.png" alt="" />
          </span>
          <p className="footer__tagline">Ждём вас к нам!</p>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Контакты</h3>
          <ul className="footer__list">
            <li className="footer__item">ул. Садовая, 15, Москва</li>
            <li className="footer__item">
              <a className="footer__phone" href="tel:+74951234567">
                +7 (495) 123-45-67
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Режим работы</h3>
          <ul className="footer__list">
            <li className="footer__item">Пн–Пт: 9:00 – 21:00</li>
            <li className="footer__item">Сб–Вс: 10:00 – 19:00</li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copy">© 2026. Все права защищены.</p>
        <a className="footer__link" href="#">
          Политика конфиденциальности
        </a>
      </div>
    </footer>
  );
}