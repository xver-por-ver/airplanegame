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

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
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

    screen = new ScreenDom(player, enemy, hit);
  });

  afterEach(() => {
    resetDocument();
    jest.clearAllMocks();
  });

  test('should initialize and return canvas', () => {
    expect(screen.getCanvas()).toBe(canvas);
  });

  test('should skip drawing when animation is disabled', () => {
    player.getBase.mockReturnValue(new BaseDom());
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
