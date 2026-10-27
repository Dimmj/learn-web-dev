export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="logo" href="#" aria-label="На главную">
          <img className="logo__img" src="/images/logo.png" alt="Логотип салона — ножницы" />
        </a>
        <nav className="nav" aria-label="Основное меню">
          <ul className="nav__list">
            <li><a className="nav__link" href="#">Услуги</a></li>
            <li><a className="nav__link" href="#">Галерея</a></li>
            <li><a className="nav__link" href="#">Команда</a></li>
            <li><a className="nav__link" href="#">Отзывы</a></li>
            <li><a className="nav__link" href="#">Контакты</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}