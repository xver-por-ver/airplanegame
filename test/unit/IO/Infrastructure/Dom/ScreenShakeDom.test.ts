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
    shake.startShake(1, 300);
    expect(canvas.style.transform).toContain('translate(');
    shake.animate(30);
    expect(canvas.style.transform).not.toBe('');
  });

  test('clamps damage level and clears the transform at expiration', () => {
    const { canvas, shake } = makeShake();
    shake.startShake(-1, 50);
    expect(canvas.style.transform).toContain('translate(');
    shake.animate(50);
    expect(canvas.style.transform).toBe('');
    shake.animate(25);
    expect(canvas.style.transform).toBe('');
  });

  test('supports zero-duration shake and clamps healthy base strength', () => {
    const { canvas, shake } = makeShake();
    shake.startShake(8, 0);
    expect(canvas.style.transform).toBe('');
    shake.animate(1);
    expect(canvas.style.transform).toBe('');
    shake.startShake(3, 100);
    expect(canvas.style.transform).toContain('translate(');
  });
});
