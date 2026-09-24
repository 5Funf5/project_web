
/* ============================================================
   Страница авторизации: вкладки + валидация
   ============================================================ */
function initAuthPage() {
  const loginForm    = $('#loginForm');
  const registerForm = $('#registerForm');
  if (!loginForm || !registerForm) return;

  /* ---------- Переключение вкладок ---------- */
  const tabs = $$('.auth-tab');

  function switchTab(name) {
    tabs.forEach(t => t.classList.toggle('auth-tab--active', t.dataset.tab === name));
    loginForm.hidden    = name !== 'login';
    registerForm.hidden = name !== 'register';
    clearFormMessages(loginForm);
    clearFormMessages(registerForm);
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
     Утилиты валидации
     ============================================================ */

  // Регулярное выражение для email
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * Устанавливает/снимает ошибку у конкретного поля.
   * @param {HTMLInputElement} input
   * @param {string} message — текст ошибки ('' = нет ошибки)
   */
  function setFieldError(input, message) {
    const field   = input.closest('.form__field');
    const errorEl = field.querySelector('.form__error');

    if (message) {
      input.classList.add('input--error');
      input.classList.remove('input--valid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      input.classList.remove('input--error');
      // Зелёная рамка только если поле не пустое
      input.classList.toggle('input--valid', input.value.trim() !== '');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  /**
   * Показывает общее сообщение формы (плашка сверху).
   * @param {HTMLFormElement} form
   * @param {'error'|'success'} type
   * @param {string} text
   */
  function setFormAlert(form, type, text) {
    const alertEl = form.querySelector('.form__alert');
    if (!alertEl) return;
    alertEl.hidden = false;
    alertEl.className = `form__alert form__alert--${type}`;
    alertEl.textContent = text;
  }

  /** Убирает общую плашку и все ошибки формы. */
  function clearFormMessages(form) {
    const alertEl = form.querySelector('.form__alert');
    if (alertEl) {
      alertEl.hidden = true;
      alertEl.textContent = '';
    }
    $$('input', form).forEach(input => setFieldError(input, ''));
  }

  /* ============================================================
     Правила проверки полей
     ============================================================ */
  const rules = {
    name: (v) => {
      const val = v.trim();
      if (!val)            return 'Укажите имя';
      if (val.length < 2)  return 'Имя должно содержать минимум 2 символа';
      return '';
    },
    email: (v) => {
      const val = v.trim();
      if (!val)                  return 'Укажите email';
      if (!EMAIL_RE.test(val))   return 'Введите корректный email, например user@mail.ru';
      return '';
    },
    password: (v) => {
      if (!v)                return 'Укажите пароль';
      if (v.length < 8)      return 'Пароль должен содержать не менее 8 символов';
      return '';
    },
    confirm: (v, form) => {
      if (!v)                                return 'Повторите пароль';
      if (v !== form.password.value)         return 'Пароли не совпадают';
      return '';
    }
  };

  /**
   * Проверяет одно поле и возвращает true, если оно валидно.
   */
  function validateField(form, name) {
    const input = form[name];
    if (!input) return true;
    const message = rules[name](input.value, form);
    setFieldError(input, message);
    return message === '';
  }

  /**
   * Проверяет всю форму регистрации.
   * @returns {boolean} — true, если все поля валидны
   */
  function validateRegisterForm(form) {
    const fields = ['name', 'email', 'password', 'confirm'];
    let firstInvalid = null;
    let valid = true;

    fields.forEach(name => {
      const ok = validateField(form, name);
      if (!ok) {
        valid = false;
        if (!firstInvalid) firstInvalid = form[name];
      }
    });

    if (!valid) {
      setFormAlert(form, 'error', 'Форма содержит ошибки. Исправьте выделенные поля.');
      if (firstInvalid) firstInvalid.focus();
    } else {
      const alertEl = form.querySelector('.form__alert');
      if (alertEl) alertEl.hidden = true;
    }

    return valid;
  }

  /* ============================================================
     Живая перепроверка после исправления
     — как только пользователь меняет поле, ошибка снимается/обновляется
     ============================================================ */
  ['name', 'email', 'password', 'confirm'].forEach(name => {
    const input = registerForm[name];
    if (!input) return;

    // Проверка «на лету» после того, как поле уже было тронуто
    input.addEventListener('blur', () => {
      if (input.value !== '' || input.dataset.touched === '1') {
        input.dataset.touched = '1';
        validateField(registerForm, name);
        // Если поле "confirm" — перепроверим и его при смене пароля
        if (name === 'password' && registerForm.confirm.value) {
          validateField(registerForm, 'confirm');
        }
      }
    });

    // При вводе — сбрасываем ошибку, если поле стало валидным
    input.addEventListener('input', () => {
      input.dataset.touched = '1';
      validateField(registerForm, name);
      if (name === 'password' && registerForm.confirm.value) {
        validateField(registerForm, 'confirm');
      }
    });
  });

  /* ============================================================
     Отправка формы регистрации
     ============================================================ */
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Валидация до любой дальнейшей обработки
    if (!validateRegisterForm(registerForm)) {
      return; // форма НЕ считается успешно отправленной
    }

    // ---- Здесь можно отправлять данные на сервер ----
    const user = {
      name:  registerForm.name.value.trim(),
      email: registerForm.email.value.trim()
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();

    setFormAlert(registerForm, 'success', `Аккаунт создан. Добро пожаловать, ${user.name}!`);

    // Очистка формы и подсветки
    registerForm.reset();
    $$('input', registerForm).forEach(input => {
      input.classList.remove('input--error', 'input--valid');
      input.removeAttribute('aria-invalid');
      delete input.dataset.touched;
      const err = input.closest('.form__field')?.querySelector('.form__error');
      if (err) err.textContent = '';
    });

    // Через 4 сек убираем плашку успеха
    setTimeout(() => {
      const alertEl = registerForm.querySelector('.form__alert');
      if (alertEl) alertEl.hidden = true;
    }, 4000);
  });

  /* ============================================================
     Отправка формы входа (оставляем прежнюю логику)
     ============================================================ */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const email = loginForm.email;
    const password = loginForm.password;

    const emailErr = !email.value.trim()
      ? 'Укажите email'
      : !EMAIL_RE.test(email.value.trim())
        ? 'Некорректный email'
        : '';
    setFieldError(email, emailErr);
    if (emailErr) valid = false;

    const passErr = !password.value
      ? 'Укажите пароль'
      : password.value.length < 8
        ? 'Пароль должен содержать не менее 8 символов'
        : '';
    setFieldError(password, passErr);
    if (passErr) valid = false;

    if (!valid) {
      setFormAlert(loginForm, 'error', 'Проверьте правильность введённых данных.');
      return;
    }

    const user = {
      email: email.value.trim(),
      name:  email.value.split('@')[0]
    };
    localStorage.setItem('libraryUser', JSON.stringify(user));
    updateAuthLink();
    setFormAlert(loginForm, 'success', `Добро пожаловать, ${user.name}!`);
    loginForm.reset();
  });

  // Сброс ошибок у формы входа при вводе
  ['email', 'password'].forEach(name => {
    const input = loginForm[name];
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.classList.contains('input--error')) {
        const err = rules[name](input.value, loginForm);
        setFieldError(input, err);
      }
    });
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