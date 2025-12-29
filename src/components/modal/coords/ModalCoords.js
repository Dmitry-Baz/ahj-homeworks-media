import html from './modal-coords.html';
import './modal-coords.css';
import Modal from '../Modal';

export default class ModalCoords extends Modal {
  #textEl;
  #input;
  #errorMsg;
  #btnSend;
  #btnSendNoCoords;
  #timelineInput;

  constructor({ params } = {}) {
    super({ html });
    this.#timelineInput = params?.timelineInputEl;

    this.#textEl = this.element.querySelector('.modal__text');
    this.#input = this.element.querySelector('.form-modal__input');
    this.#errorMsg = this.element.querySelector('.form-modal__err-msg');
    this.#btnSend = this.element.querySelector('.form-modal__btn-send');
    this.#btnSendNoCoords = this.element.querySelector(
      '.form-modal__btn-send-no-coords'
    );

    this.#input.addEventListener('input', () => this.#hideError());
    this.#btnSend.addEventListener('click', () => this.#handleSend());
    this.#btnSendNoCoords.addEventListener('click', () =>
      this.#handleSendWithoutCoords()
    );
  }

  showAndAwait(message) {
    this.#textEl.textContent = message;
    this.#input.value = '';
    this.#hideError();
    this.#input.focus();
    return super.showAndAwait().finally(() => {
      this.#timelineInput?.focus();
    });
  }

  #handleSend() {
    const value = this.#input.value.trim();
    if (!value) {
      this.#showError('Введите координаты');
      return;
    }

    // Регулярка: допускает [xx.xxxxx, yy.yyyyy] или xx.xxxxx, yy.yyyyy
    const match = value.match(
      /^[[\s]*(-?\d{1,2}\.\d{5,})\s*,\s*(-?\d{1,2}\.\d{5,})[\]\s]*$/
    );
    if (!match) {
      this.#showError('Неверный формат');
      return;
    }

    const [, lat, lon] = match;
    this.close({
      success: true,
      coords: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      },
    });
  }

  #handleSendWithoutCoords() {
    this.close({ publishWithoutCoords: true });
  }

  #showError(msg) {
    this.#errorMsg.textContent = msg;
    this.#errorMsg.classList.remove('_hidden');
    this.#input.focus();
  }

  #hideError() {
    this.#errorMsg.classList.add('_hidden');
  }
}
