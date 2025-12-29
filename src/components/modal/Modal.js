import "./modal.css";

export default class Modal {
  #element;
  #form;
  #cancelBtn;
  #resolve = null;
  #isOpen = false;

  constructor({ html }) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    this.#element = wrapper.firstElementChild;

    this.#form = this.#element.querySelector(".form-modal");
    this.#cancelBtn = this.#element.querySelector(".modal__btn-cancel");

    if (this.#form) {
      this.#form.addEventListener("submit", (e) => e.preventDefault());
    }
    if (this.#cancelBtn) {
      this.#cancelBtn.addEventListener("click", () => this.close());
    }

    document.body.appendChild(this.#element);
  }

  get element() {
    return this.#element;
  }

  async showAndAwait() {
    return new Promise((resolve) => {
      this.#resolve = resolve;
      this.#element.classList.remove("_hidden");
      this.#isOpen = true;
      document.addEventListener("keydown", this.#handleEscape);
    });
  }

  close(result = {}) {
    if (!this.#isOpen) return;
    this.#element.classList.add("_hidden");
    this.#isOpen = false;
    document.removeEventListener("keydown", this.#handleEscape);
    if (this.#resolve) this.#resolve(result);
  }

  #handleEscape = (e) => {
    if (e.key === "Escape") this.close();
  };
}
