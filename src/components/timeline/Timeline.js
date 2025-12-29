import Post from "../post/Post";
import ModalCoords from "../modal/coords/ModalCoords";
import ModalInfo from "../modal/info/ModalInfo";

export default class Timeline {
  #els;
  #modals;
  #recorder = null;
  #isRecording = false;
  #mediaStopAction = null; // 'send' | 'cancel'

  constructor() {
    this.#els = {
      feed: document.querySelector(".feed"),
      entries: null,
      composerInput: null,
      mediaDuration: null,
      videoPreview: null,
      videoElement: null,
      textForm: null,
      mediaForm: null,
      mediaStart: null,
      mediaStop: null,
      btnAudio: null,
      btnVideo: null,
      btnSend: null,
      btnCancel: null,
    };

    this.#modals = {
      coords: null,
      info: null,
    };

    this.#initDOM();
    this.#bindEvents();
    this.#initModals();
  }

  #initDOM() {
    const { feed } = this.#els;
    if (!feed) throw new Error("Feed container not found");

    this.#els.entries = feed.querySelector(".feed__entries");
    this.#els.composerInput = feed.querySelector(".composer__input");
    this.#els.mediaDuration = feed.querySelector(".media-form__duration");
    this.#els.videoPreview = feed.querySelector(".composer__video-preview");
    this.#els.videoElement = feed.querySelector(".composer__video");
    this.#els.textForm = feed.querySelector(".composer__text-form");
    this.#els.mediaForm = feed.querySelector(".composer__media-form");
    this.#els.mediaStart = feed.querySelector(".media-form__start");
    this.#els.mediaStop = feed.querySelector(".media-form__stop");
    this.#els.btnAudio = feed.querySelector(".media-form__btn-audio");
    this.#els.btnVideo = feed.querySelector(".media-form__btn-video");
    this.#els.btnSend = feed.querySelector(".media-form__btn-send");
    this.#els.btnCancel = feed.querySelector(".media-form__btn-cancel");
  }

  #bindEvents() {
    this.#els.textForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleTextSubmit();
    });

    this.#els.composerInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.#handleTextSubmit();
      }
    });

    this.#els.btnAudio?.addEventListener("click", () =>
      this.#startRecording("audio")
    );
    this.#els.btnVideo?.addEventListener("click", () =>
      this.#startRecording("video")
    );
    this.#els.btnSend?.addEventListener("click", () =>
      this.#stopRecording("send")
    );
    this.#els.btnCancel?.addEventListener("click", () =>
      this.#stopRecording("cancel")
    );
  }

  #initModals() {
    const params = { timelineInputEl: this.#els.composerInput };
    this.#modals.coords = new ModalCoords({ params });
    this.#modals.info = new ModalInfo({ params });
  }

  async #handleTextSubmit() {
    const value = this.#els.composerInput?.value.trim();
    if (!value) return;

    await this.#createPost({ type: "text", content: value });
    if (this.#els.composerInput) this.#els.composerInput.value = "";
  }

  async #createPost({ type, content }) {
    const coordsResult = await this.#requestCoordinates();

    if (!coordsResult.success && !coordsResult.publishWithoutCoords) {
      return;
    }

    const postData = {
      type,
      content,
      coords: coordsResult.success ? coordsResult.coords : null,
    };

    const post = new Post(postData);
    this.#els.entries?.prepend(post.element);
  }

  async #requestCoordinates() {
    if (!navigator.geolocation) {
      return this.#modals.coords.showAndAwait(
        "Ваш браузер не поддерживает геолокацию. Пожалуйста, введите координаты вручную."
      );
    }

    try {
      const position = await this.#getCurrentPosition();
      return { success: true, coords: position.coords };
    } catch (error) {
      const message = this.#getGeolocationErrorMessage(error.code);
      return this.#modals.coords.showAndAwait(message);
    }
  }

  #getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  }

  #getGeolocationErrorMessage(code) {
    const messages = {
      1: "Доступ к геолокации запрещён. Разрешите его или введите координаты вручную.",
      2: "Не удалось определить местоположение. Проверьте интернет и повторите.",
      default:
        "Не удалось получить координаты. Пожалуйста, введите их вручную.",
    };
    return messages[code] || messages.default;
  }

  async #startRecording(type) {
    const support = this.#checkMediaSupport();
    if (!support.success) {
      await this.#modals.info.showAndAwait(support.message);
      return;
    }

    try {
      const stream = await this.#getUserMedia(type);
      if (type === "video") {
        this.#els.videoElement.srcObject = stream;
        this.#els.videoPreview?.classList.remove("_hidden");
      }

      this.#setupRecorder(stream, type);
      this.#switchMediaControls(true);
      this.#els.mediaDuration.textContent = "00:00";
    } catch (err) {
      const message = this.#getMediaErrorMessage(type, err);
      await this.#modals.info.showAndAwait(message);
      this.#cleanupStream(err.stream);
    }
  }

  #checkMediaSupport() {
    if (!navigator.mediaDevices) {
      return {
        success: false,
        message: "Ваш браузер не поддерживает доступ к медиаустройствам.",
      };
    }
    if (!window.MediaRecorder) {
      return {
        success: false,
        message: "Ваш браузер не поддерживает запись медиа.",
      };
    }
    return { success: true };
  }

  async #getUserMedia(type) {
    const constraints = { audio: true, video: false };
    if (type === "video") {
      constraints.video = true;
      // Попытка с аудио, затем без
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      } catch {
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }
    }
    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  #setupRecorder(stream, type) {
    this.#recorder = new MediaRecorder(stream);
    const chunks = [];
    let duration = 0;
    let intervalId = null;

    this.#recorder.ondataavailable = (e) => chunks.push(e.data);
    this.#recorder.onstart = () => {
      this.#isRecording = true;
      duration = 0;
      intervalId = setInterval(() => {
        if (this.#isRecording) {
          duration += 1;
          const date = new Date(1970, 0, 1, 0, 0, duration);
          this.#els.mediaDuration.textContent = date.toLocaleTimeString("ru", {
            minute: "2-digit",
            second: "2-digit",
          });
        }
      }, 1000);
    };

    this.#recorder.onstop = () => {
      this.#isRecording = false;
      clearInterval(intervalId);
      const blob = new Blob(chunks, {
        type: type === "audio" ? "audio/webm" : "video/webm",
      });

      if (this.#mediaStopAction === "send") {
        this.#createPost({ type, content: blob });
      }

      if (type === "video") {
        this.#els.videoElement.srcObject = null;
        this.#els.videoPreview?.classList.add("_hidden");
      }

      this.#cleanupStream(stream);
      this.#switchMediaControls(false);
    };

    this.#recorder.start();
  }

  #cleanupStream(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  #switchMediaControls(isRecording) {
    if (isRecording) {
      this.#els.mediaStart?.classList.add("_hidden");
      this.#els.mediaStop?.classList.remove("_hidden");
    } else {
      this.#els.mediaStart?.classList.remove("_hidden");
      this.#els.mediaStop?.classList.add("_hidden");
    }
  }

  #stopRecording(action) {
    this.#mediaStopAction = action;
    if (this.#recorder && this.#isRecording) {
      this.#recorder.stop();
    }
  }

  #getMediaErrorMessage(type, error) {
    const name = type === "audio" ? "микрофон" : "веб-камера";
    const generic = `Не удалось получить доступ к ${name}. Проверьте подключение и разрешения.`;

    // В Chrome/Firefox ошибки permissions дают .name или .message
    if (
      error.name === "NotAllowedError" ||
      error.message?.includes("permission")
    ) {
      return `Доступ к ${name} запрещён. Разрешите его в настройках браузера.`;
    }
    return generic;
  }
}
