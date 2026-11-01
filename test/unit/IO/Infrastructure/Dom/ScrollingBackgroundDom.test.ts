import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { ScrollingBackgroundDom } from '../../../../../src/IO/Infrastructure/Dom/ScrollingBackgroundDom';

describe('ScrollingBackgroundDom', () => {
  let background: ScrollingBackgroundDom;
  let context: CanvasRenderingContext2D;
  let translate: jest.Mock;

  beforeEach(() => {
    background = new ScrollingBackgroundDom();
    translate = jest.fn();
    context = {
      beginPath: jest.fn(),
      bezierCurveTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      lineTo: jest.fn(),
      moveTo: jest.fn(),
      restore: jest.fn(),
      save: jest.fn(),
      stroke: jest.fn(),
      translate,
    } as unknown as CanvasRenderingContext2D;
  });

  test('moves the terrain to the right as time passes', () => {
    background.animate(context, 1024, 658, 1000);

    expect(translate).toHaveBeenCalledWith(20, 0);
  });

  test('wraps the terrain offset at the seamless tile boundary', () => {
    background.animate(context, 1024, 658, 51_200);

    expect(translate).toHaveBeenCalledWith(0, 0);
  });
});
