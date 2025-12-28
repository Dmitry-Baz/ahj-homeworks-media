import './modal.css';

/*
    Универсальный, базовый класс модального окна, от которого можно наследоваться и
    добавлять необходимый функционал. Предназначен для переиспользования в любых проектах.
 */

export default class Modal {
  constructor({ parent, html, isCircularTab = true } = {}) {
    this.element = null;
    this.parentEl = null;
    this.els = {
      form: null,
      btnCancel: null,
    };

    this.handlers = {
      onDocKeydown: this.onDocKeydown.bind(this),
    };

    this.isOpen = false;

    this.resolve = null;
    this.result = null;

    this.initModal({ parent, html, isCircularTab });
  }

  initModal({ parent, html, isCircularTab }) {
    let tempWrapEl = document.createElement('div');
    tempWrapEl.insertAdjacentHTML('afterbegin', html);

    this.element = tempWrapEl.querySelector('.modal-container');
    tempWrapEl = null;

    this.els.form = this.element.querySelector('.form-modal');
    this.els.form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.els.btnCancel = this.element.querySelector('.modal__btn-cancel');
    this.els.btnCancel.addEventListener('click', this.onBtnCancelClick.bind(this));

    // Определяем первый элемент формы для фокуса, а также для табуляции внутри формы по кругу.
    // eslint-disable-next-line prefer-destructuring
    this.firstEl = this.els.form.elements[0];

    // Если для формы предусмотрена табуляция по кругу, то определяем последний элемент формы
    // и добавляем соответствующие события.
    if (isCircularTab) {
      this.lastEl = this.els.form.elements[this.els.form.elements.length - 1];

      this.firstEl.addEventListener('keydown', this.onFirstElKeydown.bind(this));
      this.lastEl.addEventListener('keydown', this.onLastElKeydown.bind(this));
    }

    this.bindToDOM(parent);
  }

  onFirstElKeydown(event) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.lastEl.focus();
    }
  }

  onLastElKeydown(event) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.firstEl.focus();
    }
  }

  // Нажатие клавиши на document (внутри страницы).
  onDocKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  // Если parent не передан, то this.parentEl будет вычислен как <body>.
  bindToDOM(parent) {
    if (parent) {
      this.parentEl = typeof parent === 'string' ? document.querySelector(parent) : parent;
    } else {
      this.parentEl = document.body;
    }

    this.parentEl.append(this.element);
  }

  show() {
    document.addEventListener('keydown', this.handlers.onDocKeydown);
    this.element.classList.remove('_hidden');
    this.firstEl.focus();
    this.isOpen = true;

    // Можно убрать прокрутку страницы во время показа модального окна.
    // В данном случае возможность прокрутки оставлена.
    // document.body.style.overflowY = 'hidden';
  }

  hide() {
    document.removeEventListener('keydown', this.handlers.onDocKeydown);
    this.element.classList.add('_hidden');

    // Вернуть прокрутку страницы после закрытия модального окна.
    // document.body.style.overflowY = '';

    this.isOpen = false;
  }

  onBtnCancelClick(event) {
    event.preventDefault();
    this.close();
  }

  close() {
    this.hide();
    this.resolve(this.result);
  }

  getData() {
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  onFormSubmit(event) {
    event.preventDefault();
  }
}
