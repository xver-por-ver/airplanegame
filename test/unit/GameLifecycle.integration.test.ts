import { afterEach, describe, expect, jest, test } from '@jest/globals';
import Game from '../../src/Game';
import { PlayerDom } from '../../src/Player/Infrastructure/Dom/PlayerDom';
import { resetDocument } from '../DomDocumentInit';

describe('Game lifecycle integration', () => {
  afterEach(() => {
    resetDocument();
    jest.restoreAllMocks();
  });

  test('coordinates start, pause blockers, window availability, and resume', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });
    const rounds = document.createElement('div');
    rounds.id = 'menuRounds';
    document.body.appendChild(rounds);

    const animationFrames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    const context = {
      beginPath: jest.fn(),
      bezierCurveTo: jest.fn(),
      closePath: jest.fn(),
      drawImage: jest.fn(),
      fill: jest.fn(),
      fillRect: jest.fn(),
      lineTo: jest.fn(),
      moveTo: jest.fn(),
      reset: jest.fn(),
      restore: jest.fn(),
      save: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(context);
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    let canvasRect = {
      width: 800.5,
      height: 514.5,
      top: 80,
      left: 0,
      bottom: 594.5,
      right: 800.5,
      x: 0,
      y: 80,
      toJSON: () => {},
    } as DOMRect;
    jest
      .spyOn(canvas, 'getBoundingClientRect')
      .mockImplementation(() => canvasRect);
    const playerFly = jest.spyOn(PlayerDom.prototype, 'fly');

    new Game();
    expect(playerFly).toHaveBeenCalledWith(1024, 329, 658);
    const nextFrame = (timestamp: number): void => {
      const callback = animationFrames.shift();
      if (!callback) {
        throw new Error('No animation frame is scheduled');
      }
      callback(timestamp);
    };
    const click = (id: string): void => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Expected element #${id}`);
      }
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    };
    const overlay = document.getElementById('infoOverlay') as HTMLElement;
    const container = document.getElementById('infoContainer') as HTMLElement;

    expect(container.innerHTML).toContain('Screen too small');
    expect(container.innerHTML).toContain('1033 × 760');
    expect(overlay.style.visibility).toBe('visible');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    canvasRect = {
      width: 1023.5,
      height: 657.5,
      top: 40,
      left: 0,
      bottom: 697.5,
      right: 1023.5,
      x: 0,
      y: 40,
      toJSON: () => {},
    } as DOMRect;
    window.dispatchEvent(new Event('resize'));
    expect(container.innerHTML).toContain('PLAY');

    click('gameStartButton');
    expect(overlay.style.visibility).toBe('hidden');
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, clientY: 368.75 }),
    );
    expect(playerFly).toHaveBeenLastCalledWith(1024, 329, 658);
    nextFrame(16);
    expect(context.fillRect).toHaveBeenCalled();

    window.dispatchEvent(new Event('blur'));
    expect(container.innerHTML).toContain('Help Menu');
    expect(overlay.style.visibility).toBe('visible');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    window.dispatchEvent(new Event('focus'));
    expect(overlay.style.visibility).toBe('visible');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    expect(overlay.style.visibility).toBe('hidden');
    nextFrame(32);

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1032,
    });
    window.dispatchEvent(new Event('resize'));
    expect(container.innerHTML).toContain('Screen too small');
    expect(container.innerHTML).toContain('1033 × 760');
    expect(overlay.style.visibility).toBe('visible');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event('resize'));
    expect(overlay.style.visibility).toBe('hidden');
    nextFrame(48);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(4);
  });
});
