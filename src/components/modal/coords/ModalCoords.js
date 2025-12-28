import html from './modal-coords.html';
import './modal-coords.css';
import ModalTimeline from '../ModalTimeline';

/*
  Модальное окно для ввода координат.

  1. btnSend - кнопка 'Опубликовать'.
  Нажатие на эту кнопку подразумевает, что пользователь хочет опубликовать пост
  с введенными координатами. Проверка координат завязана на checkValidity и добавление на input
  атрибута pattern, проверяющего регулярное выражение, а также required. После проверки эти атрибуты
  удаляются, и не влияют на нажатие других кнопок не требующих этих проверок.

  2. btnSendNoCoords - кнопка 'Опубликовать без координат'.
  Не проверяет правильность ввода координат и позволяет опубликовать пост без них.

  3. btnCancel - кнопка 'Не публиковать'.
  Наследуется из Modal, стандартная кнопка отмены, информируещая основной модуль об отмене действия.
 */

export default class ModalCoords extends ModalTimeline {
  constructor({ params } = {}) {
    super({ html, params });
    this.els = {
      ...this.els,
      text: null,
      form: null,
      input: null,
      btnSend: null,
      btnSendNoCoords: null,
      errMsg: null,
    };

    this.result = {
      success: null, // Boolean
      publishWithoutCoords: null, // Boolean
      coords: {}, // Объект с координатами либо пустой объект.
    };

    this.init();
  }

  init() {
    this.els.text = this.element.querySelector('.modal__text');
    this.els.form = this.element.querySelector('.form-modal');
    this.els.input = this.element.querySelector('.form-modal__input');
    this.els.input.addEventListener('input', this.hideError.bind(this));

    this.els.errMsg = this.element.querySelector('.form-modal__err-msg');

    this.els.btnSend = this.element.querySelector('.form-modal__btn-send');
    this.els.btnSend.addEventListener('click', this.onBtnSendClick.bind(this));

    this.els.btnSendNoCoords = this.element.querySelector('.form-modal__btn-send-no-coords');
    this.els.btnSendNoCoords.addEventListener('click', this.onBtnSendNoCoordsClick.bind(this));
  }

  showError(text) {
    this.els.errMsg.textContent = text;
    this.els.errMsg.classList.remove('_hidden');
  }

  hideError() {
    this.els.errMsg.classList.add('_hidden');
  }

  /*
    При нажатии на кнопку опубликовать, форма будет проверять валидность поля input.
    Для этого полю input назначаются атрибуты pattern и required.
    Регулярное выражение до помещения в html атрибут pattern:
    pattern = /^\[?-?\d{1,2}\.\d{5,}, ?-?\d{1,2}\.\d{5,}\]?$/
   */
  onBtnSendClick() {
    this.els.input.pattern = '^\\[?-?\\d{1,2}\\.\\d{5,}, ?-?\\d{1,2}\\.\\d{5,}\\]?$';
    this.els.input.required = true;

    const isValid = this.els.form.checkValidity();

    if (!isValid) {
      // Выдать сообщение об ошибке
      let errText = 'Ошибка'; // Текст непредвиденной ошибки.
      if (this.els.input.validity.valueMissing) errText = 'Введите координаты';
      else if (this.els.input.validity.patternMismatch) errText = 'Неверный формат';
      this.showError(errText);
      this.els.input.focus();
      this.removeVerifiableAttributes();
      return;
    }

    let coordsStr = this.els.input.value;
    // eslint-disable-next-line no-useless-escape
    coordsStr = coordsStr.replace(/[ \[\]]/g, ''); // Убираем возможные квадратные скобки и пробел
    const coordsArr = coordsStr.split(',');

    this.result.coords.latitude = parseFloat(coordsArr[0]);
    this.result.coords.longitude = parseFloat(coordsArr[1]);
    this.result.success = true;

    this.resolve(this.result);
    this.removeVerifiableAttributes();
  }

  // Убрать у input'a проверяемые атрибуты.
  // Можно не убирать, так как проверка атрибутов происходит только
  // при попытке отправить пост с координатами.
  removeVerifiableAttributes() {
    this.els.input.required = false;
    this.els.input.removeAttribute('pattern');
  }

  onBtnSendNoCoordsClick() {
    this.result.publishWithoutCoords = true;
    this.resolve(this.result);
  }

  show(text = '') {
    this.result.success = false;
    this.result.publishWithoutCoords = false;
    this.result.coords = {};

    this.els.text.textContent = text;
    this.els.input.value = '';
    this.hideError();
    super.show();
  }

  close() {
    this.result.publishWithoutCoords = false;
    super.close();
  }
}
