import html from './modal-info.html';
import ModalTimeline from '../ModalTimeline';

export default class ModalInfo extends ModalTimeline {
  constructor({ params } = {}) {
    super({ html, params });
    this.els = {
      ...this.els,
      text: null,
    };

    this.init();
  }

  init() {
    this.els.text = this.element.querySelector('.modal__text');
  }

  show(text = 'Что-то пошло не так.') {
    this.els.text.textContent = text;
    super.show();
  }
}
