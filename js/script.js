/* ============================================================
   Онлайн-библиотека — общий скрипт
   ============================================================ */

'use strict';

/* ---------- Данные книг ---------- */
const BOOKS = [
  { id: 1,  title: 'Мастер и Маргарита',   author: 'М. Булгаков',    genre: 'Роман',      year: 1967, cover: '#7a4b2c', emoji: '🐈' },
  { id: 2,  title: 'Преступление и наказание', author: 'Ф. Достоевский', genre: 'Роман', year: 1866, cover: '#4b5d7a', emoji: '🪓' },
  { id: 3,  title: 'Война и мир',          author: 'Л. Толстой',     genre: 'Роман',      year: 1869, cover: '#5e381f', emoji: '⚔️' },
  { id: 4,  title: 'Евгений Онегин',       author: 'А. Пушкин',      genre: 'Поэзия',     year: 1833, cover: '#8a5a3b', emoji: '🖋' },
  { id: 5,  title: 'Мёртвые души',         author: 'Н. Гоголь',      genre: 'Роман',      year: 1842, cover: '#3f4a3a', emoji: '🛷' },
  { id: 6,  title: 'Тихий Дон',            author: 'М. Шолохов',     genre: 'Роман',      year: 1940, cover: '#6b4a2c', emoji: '🐎' },
  { id: 7,  title: 'Доктор Живаго',        author: 'Б. Пастернак',   genre: 'Роман',      year: 1957, cover: '#4a6b6b', emoji: '❄️' },
  { id: 8,  title: 'Собачье сердце',       author: 'М. Булгаков',    genre: 'Повесть',    year: 1925, cover: '#7a3b3b', emoji: '🐕' },
  { id: 9,  title: 'Отцы и дети',          author: 'И. Тургенев',    genre: 'Роман',      year: 1862, cover: '#5d5d3a', emoji: '🌿' },
  { id: 10, title: 'Герой нашего времени', author: 'М. Лермонтов',   genre: 'Роман',      year: 1840, cover: '#3a4a5d', emoji: '🏔' },
  { id: 11, title: 'Анна Каренина',        author: 'Л. Толстой',     genre: 'Роман',      year: 1877, cover: '#6b3a4a', emoji: '🚂' },
  { id: 12, title: 'Ревизор',              author: 'Н. Гоголь',      genre: 'Комедия',    year: 1836, cover: '#7a6b2c', emoji: '🎭' }
];

/* ============================================================
   Утилиты
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Бургер-меню
   ============================================================ */
function initBurger() {
  const burger = $('#burger');
  const nav = $('.nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
  });
}

/* ============================================================
   Создание карточки книги
   ============================================================ */
function createBookCard(book) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card__cover" style="background:${book.cover}">${book.emoji}</div>
    <div class="card__body">
      <h3 class="card__title">${book.title}</h3>
      <p class="card__author">${book.author}</p>
      <div class="card__meta">
        <span class="card__genre">${book.genre}</span>
        <span>${book.year}</span>
      </div>
    </div>
  `;
  return card;
}

/* ============================================================
   Главная: популярные книги + анимация счётчиков
   ============================================================ */
function initHomePage() {
  const container = $('#popularBooks');
  if (container) {
    BOOKS.slice(0, 6).forEach(b => container.appendChild(createBookCard(b)));
  }

  // Анимация счётчиков
  const counters = $$('.stat__num');
  if (counters.length) {
    const animate = (el) => {
      const target = +el.dataset.count;
      const duration = 1500;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * progress).toLocaleString('ru-RU');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
  }
}

/* ============================================================
   Каталог: рендер, поиск, фильтр, сортировка
   ============================================================ */
function initCatalogPage() {
  const container = $('#catalogBooks');
  if (!container) return;

  const searchInput = $('#searchInput');
  const genreSelect = $('#genreSelect');
  const sortSelect  = $('#sortSelect');
  const emptyMsg    = $('#emptyMsg');

  // Заполняем жанры
  const genres = [...new Set(BOOKS.map(b => b.genre))].sort();
  genres.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    genreSelect.appendChild(opt);
  });

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const genre = genreSelect.value;
    const sort  = sortSelect.value;

    let list = BOOKS.filter(b => {
      const matchesQuery = !query
        || b.title.toLowerCase().includes(query)
        || b.author.toLowerCase().includes(query);
      const matchesGenre = !genre || b.genre === genre;
      return matchesQuery && matchesGenre;
    });

    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    if (sort === 'year')  list.sort((a, b) => a.year - b.year);

    container.innerHTML = '';
    if (!list.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;
    list.forEach(b => container.appendChild(createBookCard(b)));
  }

  searchInput.addEventListener('input', render);
  genreSelect.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  render();
}

/* ============================================================
   Страница авторизации: вкладки + валидация
   ============================================================ */
function initAuthPage() {
  const loginForm    = $('#loginForm');
  const registerForm = $('#registerForm');
  if (!loginForm || !registerForm) return;

  /* --- Переключение вкладок --- */
  const tabs = $$('.auth-tab');

  function switchTab(name) {
    tabs.forEach(t => t.classList.toggle('auth-tab--active', t.dataset.tab === name));
    loginForm.hidden    = name !== 'login';
    registerForm.hidden = name !== 'register';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  $$('[data-switch]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.switch);
    });
  });

  /* --- Валидация --- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, message) {
    const field = input.closest('.form__field');
    const errorEl = field.querySelector('.form__error');
    errorEl.textContent = message || '';
    input.classList.toggle('input--error', Boolean(message));
    return !message;
  }

  function validateLogin(form) {
    let ok = true;
    const email = form.email;
    const password = form.password;

    ok = setError(email, !email.value.trim()
      ? 'Введите email'
      : !emailRe.test(email.value.trim())
        ? 'Некорректный email'
        : '') && ok;

    ok = setError(password, !password.value
      ? 'Введите пароль'
      : password.value.length < 6
        ? 'Минимум 6 символов'
        : '') && ok;

    return ok;
  }

  function validateRegister(form) {
    let ok = true;
    const name = form.name;
    const email = form.email;
    const password = form.password;
    const confirm = form.confirm;

    ok = setError(name, !name.value.trim()
      ? 'Введите имя'
      : name.value.trim().length < 2
        ? 'Слишком короткое имя'
        : '') && ok;

    ok = setError(email, !email.value.trim()
      ? 'Введите email'
      : !emailRe.test(email.value.trim())
        ? 'Некорректный email'
        : '') && ok;

    ok = setError(password, !password.value
      ? 'Введите пароль'
      : password.value.length < 6
        ? 'Минимум 6 символов'
        : '') && ok;

    ok = setError(confirm, !confirm.value
      ? 'Повторите пароль'
      : confirm.value !== password.value
        ? 'Пароли не совпадают'
        : '') && ok;

    return ok;
  }

  /* --- Показ сообщения об успехе --- */
  function showSuccess(form, text) {
    let msg = form.querySelector('.form__success');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'form__success';
      form.appendChild(msg);
    }
    msg.textContent = text;
    setTimeout(() => msg.remove(), 4000);
  }

  /* --- Отправка форм --- */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateLogin(loginForm)) return;

    const user = {
      email: loginForm.email.value.trim(),
      name: loginForm.email.value.split('@')[0]
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();

    showSuccess(loginForm, `Добро пожаловать, ${user.name}!`);
    loginForm.reset();
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRegister(registerForm)) return;

    const user = {
      name: registerForm.name.value.trim(),
      email: registerForm.email.value.trim()
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();

    showSuccess(registerForm, `Аккаунт создан. Привет, ${user.name}!`);
    registerForm.reset();
  });
}

/* ============================================================
   Авторизация: отображение имени в шапке
   ============================================================ */
function updateAuthLink() {
  const link = $('#authLink');
  if (!link) return;
  const raw = localStorage.getItem('libraryUser');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      link.textContent = user.name ? `👤 ${user.name}` : 'Профиль';
      link.href = 'auth.html';
    } catch { /* ignore */ }
  }
}

/* ============================================================
   Инициализация
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initHomePage();
  initCatalogPage();
  initAuthPage();
  updateAuthLink();
});