import { describe, expect, test } from '@jest/globals';
import { ScreenDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenDom';
import { ScreenShakeDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenShakeDom';

describe('ScreenShakeDom', () => {
  const makeShake = () => {
    const canvas = document.createElement('canvas');
    const screen = { getCanvas: () => canvas } as ScreenDom;
    return { canvas, shake: new ScreenShakeDom(screen) };
  };

  test('starts shaking with strength based on base health', () => {
    const { canvas, shake } = makeShake();
    shake.animate(true, 0, 300, 1);
    expect(canvas.style.transform).toContain('translate(');
    shake.animate(false, 30, 300, 1);
    expect(canvas.style.transform).not.toBe('');
  });

  test('clamps damage level and clears the transform at expiration', () => {
    const { canvas, shake } = makeShake();
    shake.animate(true, 0, 50, -1);
    expect(canvas.style.transform).toContain('translate(');
    shake.animate(false, 50, 50, -1);
    expect(canvas.style.transform).toBe('');
    shake.animate(false, 25, 50, -1);
    expect(canvas.style.transform).toBe('');
  });

  test('supports zero-duration shake and clamps healthy base strength', () => {
    const { canvas, shake } = makeShake();
    shake.animate(true, 0, 0, 8);
    expect(canvas.style.transform).toBe('');
    shake.animate(false, 1, 0, 8);
    expect(canvas.style.transform).toBe('');
    shake.animate(true, 0, 100, 3);
    expect(canvas.style.transform).toContain('translate(');
  });
});
