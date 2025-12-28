/**
 * @jest-environment jsdom
 */

// Описание выше переключает окружение jest'a с node на jsdom.
// Это позволяет тестировать модули, для которых нужно браузерное окружение,
// т.е. дает доступ к объекту document.

import ModalCoords from '../ModalCoords';

describe('ModalCoords', () => {
  const _ = new ModalCoords();

  describe('should show error message, if user enter:', () => {
    test.each([
      '',
      '1.12345 2.12345',
      '123.12345, 2.12345',
      '1.12345, 123.12345',
      '1.123, 2.12345',
      '1.12345 2.123',
    ])('\'%s\'', (coords) => {
      _.els.input.value = coords;
      _.els.btnSend.click();
      expect(_.els.errMsg.classList.contains('_hidden')).toBeFalsy();
    });
  });

  // При правильном вводе, окно возвращает промисс, который назначается в getData(),
  // поэтому нужно вызывать getData(). Так как промис в getData() разрешится только
  // при нажатии btnSent и правильном формате координат, то с помощью setTimeout'a
  // вводим координаты и нажимаем btnSend.
  describe('should show no error message, if user enter:', () => {
    test.each([
      '12.12345,21.23456',
      '12.12345, 21.23456',
      '-12.12345, 21.23456',
      '12.12345, -21.23456',
      '[12.12345, 21.23456]',
      '[-12.12345, -21.23456]',
      '[12.1234567, 21.2345678]',
    ])('\'%s\'', async (coords) => {
      _.show('');
      setTimeout(() => {
        _.els.input.value = coords;
        _.els.btnSend.click();
      }, 0);
      await _.getData();
      expect(_.els.errMsg.classList.contains('_hidden')).toBeTruthy();
      _.hide();
    });
  });

  describe('should return object with coordinates, if user enter:', () => {
    test.each`
    latitude     | longitude
    ${12.12345}  | ${23.23456}
    ${-12.12345} | ${-23.23456}
    ${1.1234567} | ${2.2345679}
    `('\'$latitude, $longitude\'', async ({ latitude, longitude }) => {
      const userEnter = `${latitude}, ${longitude}`;
      _.show('');
      setTimeout(() => {
        _.els.input.value = userEnter;
        _.els.btnSend.click();
      }, 0);

      const result = await _.getData();
      const { coords } = result;

      expect(result.success).toBeTruthy();
      expect(coords.latitude).toBe(latitude);
      expect(coords.longitude).toBe(longitude);
    });
  });
});
