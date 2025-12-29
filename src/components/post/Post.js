import postHTML from "./post.html";

export default class Post {
  #element;
  #els;

  constructor({ type, content, coords } = {}) {
    const temp = document.createElement("div");
    temp.innerHTML = postHTML.trim();

    this.#element = temp.firstElementChild;
    this.#els = {
      content: this.#element.querySelector(".entry__content"),
      coords: this.#element.querySelector(".entry__coords"),
      datetime: this.#element.querySelector(".entry__datetime"),
    };

    this.#setDateTime();
    this.#setCoords(coords);

    const creator = {
      text: this.#createText,
      audio: this.#createAudio,
      video: this.#createVideo,
    }[type];

    if (creator) {
      this.#els.content.appendChild(creator(content));
    }
  }

  get element() {
    return this.#element;
  }

  #setCoords(coords) {
    if (
      coords &&
      typeof coords.latitude === "number" &&
      typeof coords.longitude === "number"
    ) {
      this.#els.coords.textContent = `[${coords.latitude.toFixed(
        5
      )}, ${coords.longitude.toFixed(5)}]`;
    } else {
      this.#els.coords.classList.add("_hidden");
    }
  }

  #setDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("ru");
    const time = now.toLocaleTimeString("ru", {
      hour: "2-digit",
      minute: "2-digit",
    });
    this.#els.datetime.textContent = `${date} ${time}`;
  }

  #createText(content) {
    const el = document.createElement("p");
    el.className = "entry__text";
    el.textContent = content;
    return el;
  }

  #createAudio(blob) {
    const el = document.createElement("audio");
    el.controls = true;
    el.preload = "metadata";
    el.src = URL.createObjectURL(blob);
    return el;
  }

  #createVideo(blob) {
    const el = document.createElement("div");
    el.className = "entry__media";
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.src = URL.createObjectURL(blob);
    el.appendChild(video);
    return el;
  }
}
