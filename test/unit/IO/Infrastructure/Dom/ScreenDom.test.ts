import {
  describe,
  expect,
  jest,
  beforeEach,
  afterEach,
  test,
} from '@jest/globals';
import { ScreenDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenDom';
import { BaseDom } from '../../../../../src/Player/Infrastructure/Dom/BaseDom';
import { PlayerDom } from '../../../../../src/Player/Infrastructure/Dom/PlayerDom';
import { EnemyDom } from '../../../../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { HitDom } from '../../../../../src/Hit/Infrastructure/Dom/HitDom';
import { ScreenElementDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDom';
import { SpriteCordsDom } from '../../../../../src/IO/Infrastructure/Dom/SpriteCordsDom';
import { ScreenElementDimensionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDimensionDom';
import { ScreenElementPositionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementPositionDom';
import { resetDocument } from '../../../../DomDocumentInit';
import { EventBus } from '../../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../../src/IO/Domain/GameEvents';

jest.mock('../../../../../src/Player/Infrastructure/Dom/PlayerDom');
jest.mock('../../../../../src/Enemy/Infrastructure/Dom/EnemyDom');
jest.mock('../../../../../src/Hit/Infrastructure/Dom/HitDom');
jest.mock('../../../../../src/IO/Infrastructure/Dom/ScreenElementDom');

describe('ScreenDom', () => {
  let screen: ScreenDom;
  let player: jest.Mocked<PlayerDom>;
  let enemy: jest.Mocked<EnemyDom>;
  let hit: jest.Mocked<HitDom>;
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let events: EventBus<GameEvents>;
  let availabilityChanges: Array<{
    focused: boolean;
    meetsMinimumResolution: boolean;
  }>;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    events = new EventBus<GameEvents>();
    availabilityChanges = [];
    events.on('window.availabilityChanged', (status) =>
      availabilityChanges.push(status),
    );
    canvas = document.getElementById('game') as HTMLCanvasElement;
    context = {
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
    jest.spyOn(canvas, 'getContext').mockReturnValue(context);

    player = new PlayerDom() as jest.Mocked<PlayerDom>;
    enemy = new EnemyDom() as jest.Mocked<EnemyDom>;
    hit = new HitDom(player, enemy) as jest.Mocked<HitDom>;

    screen = new ScreenDom(player, enemy, hit, events);
  });

  afterEach(() => {
    resetDocument();
    jest.clearAllMocks();
  });

  test('should initialize and return canvas', () => {
    expect(screen.getCanvas()).toBe(canvas);
  });

  test('publishes minimum-resolution status on construction and resize', () => {
    expect(availabilityChanges).toEqual([
      { focused: true, meetsMinimumResolution: true },
    ]);

    Object.defineProperty(window, 'innerHeight', { value: 759 });
    window.dispatchEvent(new Event('resize'));

    expect(availabilityChanges[availabilityChanges.length - 1]).toEqual({
      focused: true,
      meetsMinimumResolution: false,
    });
  });

  test('publishes focus changes without losing resolution status', () => {
    window.dispatchEvent(new Event('blur'));
    expect(availabilityChanges[availabilityChanges.length - 1]).toEqual({
      focused: false,
      meetsMinimumResolution: true,
    });

    window.dispatchEvent(new Event('focus'));
    expect(availabilityChanges[availabilityChanges.length - 1]).toEqual({
      focused: true,
      meetsMinimumResolution: true,
    });
  });

  test.each([
    { w: 1033, h: 760 },
    { w: 1033, h: 800 },
  ])(
    'publishes availability when the window meets minimum dimensions',
    ({ w, h }) => {
      Object.defineProperty(window, 'innerHeight', { value: h });
      Object.defineProperty(window, 'innerWidth', { value: w });
      window.dispatchEvent(new Event('resize'));
      expect(availabilityChanges[availabilityChanges.length - 1]).toEqual({
        focused: true,
        meetsMinimumResolution: true,
      });
    },
  );

  test('should skip drawing when animation is disabled', () => {
    screen.animate(false, 60, 16, 200);
    expect(player.animate).not.toHaveBeenCalled();
    expect(enemy.animate).not.toHaveBeenCalled();
    expect(hit.hasHits).not.toHaveBeenCalled();
    expect(context.reset).not.toHaveBeenCalled();
  });

  test('should start shake after a base hit and continue drawing', () => {
    const base = new BaseDom();
    base.applyDamage();
    player.getBase.mockReturnValue(base);
    enemy.animate.mockReturnValue([]);
    player.animate.mockReturnValue([]);

    screen.animate(true, 60, 16, 200);
    expect(base.radarAnnounce()).toBe(true);
    screen.animate(true, 60, 16, 200);
    expect(screen.getCanvas().style.transform).toContain('translate(');
    expect(player.getBase).toHaveBeenCalled();
  });

  test('should animate screen elements', () => {
    const screenElement = new ScreenElementDom(
      'sprite',
      'screenelement',
      32,
      32,
      0,
      0,
    );
    jest.spyOn(screenElement, 'getLoaded').mockReturnValue(true);
    jest
      .spyOn(screenElement, 'getSpriteCords')
      .mockReturnValue(new SpriteCordsDom(0, 0));
    jest
      .spyOn(screenElement, 'getDimension')
      .mockReturnValue(new ScreenElementDimensionDom(1, 1));
    jest
      .spyOn(screenElement, 'getPosition')
      .mockReturnValue(new ScreenElementPositionDom(0, 0));

    player.animate.mockReturnValue([screenElement]);
    const base = new BaseDom();
    player.getBase.mockReturnValue(base);
    enemy.animate.mockReturnValue([screenElement]);

    screen.animate(true, 60, 16, 200);

    expect(player.animate).toHaveBeenCalledWith(60, 16);
    expect(enemy.animate).toHaveBeenCalledWith(
      60,
      16,
      canvas.height,
      canvas.width,
    );
    expect(context.drawImage).toHaveBeenCalledTimes(2);
    expect(hit.hasHits).toHaveBeenCalledWith(canvas.width);
  });

  test('should draw the background behind screen elements', () => {
    const screenElement = new ScreenElementDom(
      'sprite',
      'screenelement',
      32,
      32,
      0,
      0,
    );
    jest.spyOn(screenElement, 'getLoaded').mockReturnValue(true);
    jest
      .spyOn(screenElement, 'getSpriteCords')
      .mockReturnValue(new SpriteCordsDom(0, 0));
    jest
      .spyOn(screenElement, 'getDimension')
      .mockReturnValue(new ScreenElementDimensionDom(1, 1));
    jest
      .spyOn(screenElement, 'getPosition')
      .mockReturnValue(new ScreenElementPositionDom(0, 0));
    player.animate.mockReturnValue([screenElement]);
    const base = new BaseDom();
    player.getBase.mockReturnValue(base);
    enemy.animate.mockReturnValue([]);

    screen.animate(true, 60, 16, 200);

    const drawImage = context.drawImage as jest.Mock;
    const fillRect = context.fillRect as jest.Mock;
    expect(drawImage.mock.invocationCallOrder[0]).toBeLessThan(
      fillRect.mock.invocationCallOrder[0],
    );
  });

  test('should not draw if screen element graphic is not loaded', () => {
    const screenElement = new ScreenElementDom(
      'sprite',
      'screenelement',
      32,
      32,
      0,
      0,
    );
    jest.spyOn(screenElement, 'getLoaded').mockReturnValue(false);

    player.animate.mockReturnValue([screenElement]);
    const base = new BaseDom();
    player.getBase.mockReturnValue(base);
    enemy.animate.mockReturnValue([screenElement]);

    screen.animate(true, 60, 16, 200);

    expect(player.animate).toHaveBeenCalledWith(60, 16);
    expect(enemy.animate).toHaveBeenCalledWith(
      60,
      16,
      canvas.height,
      canvas.width,
    );
    expect(context.drawImage).toHaveBeenCalledTimes(0);
    expect(hit.hasHits).toHaveBeenCalledWith(canvas.width);
  });
});
