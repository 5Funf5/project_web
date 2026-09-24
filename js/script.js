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
   Страница авторизации: вкладки + ручная валидация (без <form>)
   ============================================================ */
function initAuthPage() {
  const loginForm    = $('#loginForm');
  const registerForm = $('#registerForm');
  


  /* ---------- Переключение вкладок ---------- */
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

  /* ============================================================
     Ссылки на элементы
     ============================================================ */
  const regName     = $('#regName');
  const regEmail    = $('#regEmail');
  const regPassword = $('#regPassword');
  const regConfirm  = $('#regConfirm');
  const registerBtn = $('#registerBtn');
  const registerAlert = $('#registerAlert');

  const loginEmail    = $('#loginEmail');
  const loginPassword = $('#loginPassword');
  const loginBtn      = $('#loginBtn');
  const loginAlert    = $('#loginAlert');

  /* ============================================================
     Утилиты
     ============================================================ */

  // Проверка формата email
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * Устанавливает сообщение об ошибке под конкретным полем.
   * @param {HTMLInputElement} input
   * @param {string} message — '' означает «ошибки нет»
   */
  function setFieldError(input, message) {
    const field   = input.closest('.form__field');
    const errorEl = field.querySelector('.form__error');

    if (message) {
      input.classList.add('input--error');
      input.classList.remove('input--valid');
      errorEl.textContent = message;
    } else {
      input.classList.remove('input--error');
      input.classList.toggle('input--valid', input.value.trim() !== '');
      errorEl.textContent = '';
    }
  }

  /**
   * Показывает общее сообщение над формой.
   */
  function setFormAlert(alertEl, type, text) {
    alertEl.hidden = false;
    alertEl.className = `form__alert form__alert--${type}`;
    alertEl.textContent = text;
  }

  function hideFormAlert(alertEl) {
    alertEl.hidden = true;
    alertEl.textContent = '';
  }

  /* ============================================================
     ВАЛИДАЦИЯ РЕГИСТРАЦИИ
     ============================================================ */

  /**
   * Проверяет форму регистрации.
   * @returns {boolean} true — всё корректно
   */
  function validateRegister() {
    let isValid = true;
    let firstInvalid = null;

    // 1) Имя — обязательное, минимум 2 символа
    const nameVal = regName.value.trim();
    if (!nameVal) {
      setFieldError(regName, 'Укажите имя');
      isValid = false;
      firstInvalid = firstInvalid || regName;
    } else if (nameVal.length < 2) {
      setFieldError(regName, 'Имя должно содержать минимум 2 символа');
      isValid = false;
      firstInvalid = firstInvalid || regName;
    } else {
      setFieldError(regName, '');
    }

    // 2) Email — обязательный + корректный формат
    const emailVal = regEmail.value.trim();
    if (!emailVal) {
      setFieldError(regEmail, 'Укажите email');
      isValid = false;
      firstInvalid = firstInvalid || regEmail;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(regEmail, 'Введите корректный email, например user@mail.ru');
      isValid = false;
      firstInvalid = firstInvalid || regEmail;
    } else {
      setFieldError(regEmail, '');
    }

    // 3) Пароль — обязательный, не менее 8 символов
    const passVal = regPassword.value;
    if (!passVal) {
      setFieldError(regPassword, 'Укажите пароль');
      isValid = false;
      firstInvalid = firstInvalid || regPassword;
    } else if (passVal.length < 8) {
      setFieldError(regPassword, 'Пароль должен содержать не менее 8 символов');
      isValid = false;
      firstInvalid = firstInvalid || regPassword;
    } else {
      setFieldError(regPassword, '');
    }

    // 4) Повтор пароля — обязательный + совпадает с паролем
    const confirmVal = regConfirm.value;
    if (!confirmVal) {
      setFieldError(regConfirm, 'Повторите пароль');
      isValid = false;
      firstInvalid = firstInvalid || regConfirm;
    } else if (confirmVal !== passVal) {
      setFieldError(regConfirm, 'Пароли не совпадают');
      isValid = false;
      firstInvalid = firstInvalid || regConfirm;
    } else {
      setFieldError(regConfirm, '');
    }

    // Общее сообщение
    if (!isValid) {
      setFormAlert(registerAlert, 'error', 'Форма содержит ошибки. Исправьте выделенные поля.');
      if (firstInvalid) firstInvalid.focus();
    } else {
      hideFormAlert(registerAlert);
    }

    return isValid;
  }

  /* ============================================================
     Обработчик кнопки «Зарегистрироваться»
     ============================================================ */
  registerBtn.addEventListener('click', () => {
    // Валидация ДО любой дальнейшей обработки
    if (!validateRegister()) {
      return; // данные никуда не уходят
    }

    // ---- Успешная отправка ----
    const user = {
      name:  regName.value.trim(),
      email: regEmail.value.trim()
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();

    setFormAlert(registerAlert, 'success', `Аккаунт создан. Добро пожаловать, ${user.name}!`);

    // Очистка полей и подсветки
    [regName, regEmail, regPassword, regConfirm].forEach(input => {
      input.value = '';
      input.classList.remove('input--error', 'input--valid');
      const err = input.closest('.form__field').querySelector('.form__error');
      err.textContent = '';
    });

    // Скрыть плашку успеха через 4 сек
    setTimeout(() => hideFormAlert(registerAlert), 4000);
  });

  /* ============================================================
     Живая перепроверка при вводе — чтобы после исправления
     пользователь сразу видел, что поле стало валидным
     ============================================================ */
  regName.addEventListener('input', () => {
    if (regName.value.trim().length >= 2) setFieldError(regName, '');
  });

  regEmail.addEventListener('input', () => {
    if (EMAIL_RE.test(regEmail.value.trim())) setFieldError(regEmail, '');
  });

  regPassword.addEventListener('input', () => {
    if (regPassword.value.length >= 8) setFieldError(regPassword, '');
    // Если повтор уже введён — перепроверим совпадение
    if (regConfirm.value) {
      if (regConfirm.value === regPassword.value) {
        setFieldError(regConfirm, '');
      } else {
        setFieldError(regConfirm, 'Пароли не совпадают');
      }
    }
  });

  regConfirm.addEventListener('input', () => {
    if (regConfirm.value && regConfirm.value === regPassword.value) {
      setFieldError(regConfirm, '');
    } else if (regConfirm.value) {
      setFieldError(regConfirm, 'Пароли не совпадают');
    }
  });

  /* ============================================================
     Вход — аналогично, по клику
     ============================================================ */
  loginBtn.addEventListener('click', () => {
    let isValid = true;
    let firstInvalid = null;

    const emailVal = loginEmail.value.trim();
    if (!emailVal) {
      setFieldError(loginEmail, 'Укажите email');
      isValid = false;
      firstInvalid = firstInvalid || loginEmail;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(loginEmail, 'Некорректный email');
      isValid = false;
      firstInvalid = firstInvalid || loginEmail;
    } else {
      setFieldError(loginEmail, '');
    }

    const passVal = loginPassword.value;
    if (!passVal) {
      setFieldError(loginPassword, 'Укажите пароль');
      isValid = false;
      firstInvalid = firstInvalid || loginPassword;
    } else if (passVal.length < 8) {
      setFieldError(loginPassword, 'Пароль должен содержать не менее 8 символов');
      isValid = false;
      firstInvalid = firstInvalid || loginPassword;
    } else {
      setFieldError(loginPassword, '');
    }

    if (!isValid) {
      setFormAlert(loginAlert, 'error', 'Проверьте правильность введённых данных.');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const user = {
      email: emailVal,
      name:  emailVal.split('@')[0]
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();

    setFormAlert(loginAlert, 'success', `Добро пожаловать, ${user.name}!`);
    loginEmail.value = '';
    loginPassword.value = '';
    [loginEmail, loginPassword].forEach(i => i.classList.remove('input--error', 'input--valid'));
    setTimeout(() => hideFormAlert(loginAlert), 4000);
  });

  loginEmail.addEventListener('input', () => {
    if (EMAIL_RE.test(loginEmail.value.trim())) setFieldError(loginEmail, '');
  });
  loginPassword.addEventListener('input', () => {
    if (loginPassword.value.length >= 8) setFieldError(loginPassword, '');
  });
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