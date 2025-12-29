import html from "./modal-info.html";
import Modal from "../Modal";

export default class ModalInfo extends Modal {
  #textEl;
  #timelineInput;

  constructor({ params } = {}) {
    super({ html });
    this.#textEl = this.element.querySelector(".modal__text");
    this.#timelineInput = params?.timelineInputEl;
  }

  showAndAwait(message = "Произошла ошибка.") {
    this.#textEl.textContent = message;
    return super.showAndAwait().finally(() => {
      this.#timelineInput?.focus();
    });
  }
}
