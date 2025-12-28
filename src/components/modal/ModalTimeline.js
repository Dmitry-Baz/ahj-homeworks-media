import Modal from './Modal';

/*
    Общий класс для всех модальных окон в проекте Timeline.
    Расширяет базовый метод hide(). Теперь при скрытии окна,
    в input Timeline'a устанавливается фокус.
 */

export default class ModalTimeline extends Modal {
  constructor({ html, params }) {
    super({ html });
    this.params = params;
  }

  hide() {
    super.hide();
    if (!this.params) return;

    if ('timelineInputEl' in this.params) this.params.timelineInputEl.focus();
  }
}
