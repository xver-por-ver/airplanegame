import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import Game from '../../src/Game';
import { PlayerControlsDom } from '../../src/IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from '../../src/IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from '../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from '../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../src/Player/Infrastructure/Dom/PlayerDom';
import { MenuDom } from '../../src/IO/Infrastructure/Dom/MenuDom';
import { HitDom } from '../../src/Hit/Infrastructure/Dom/HitDom';
import { EventBusInterface } from '../../src/IO/Domain/EventBusInterface';
import { GameEvents } from '../../src/IO/Domain/GameEvents';

jest.mock('../../src/IO/Infrastructure/Dom/PlayerControlsDom');
jest.mock('../../src/IO/Infrastructure/Dom/ScreenDom');
jest.mock('../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom');
jest.mock('../../src/Enemy/Infrastructure/Dom/EnemyDom');
jest.mock('../../src/Player/Infrastructure/Dom/PlayerDom');
jest.mock('../../src/IO/Infrastructure/Dom/MenuDom');
jest.mock('../../src/Hit/Infrastructure/Dom/HitDom');

const eventBusFromGame = (): EventBusInterface<GameEvents> =>
  (MenuDom as jest.Mock).mock.calls[0][0] as EventBusInterface<GameEvents>;

describe('Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.requestAnimationFrame = jest.fn(() => 0);
    (
      DashboardDom.prototype.getRadarAnouncementDisplayTime as jest.Mock
    ).mockReturnValue(200);
    (MenuDom.prototype.gameOverDisplayed as jest.Mock).mockReturnValue(false);
    new Game();
  });

  test('should create instances of its dependencies', () => {
    expect(PlayerDom).toHaveBeenCalledTimes(1);
    expect(EnemyDom).toHaveBeenCalledTimes(1);
    expect(DashboardDom).toHaveBeenCalledTimes(1);
    expect(ScreenDom).toHaveBeenCalledTimes(1);
    expect(HitDom).toHaveBeenCalledTimes(1);
    expect(MenuDom).toHaveBeenCalledTimes(1);
    expect(PlayerControlsDom).toHaveBeenCalledTimes(1);
  });

  test('creates one event bus and injects it into lifecycle participants', () => {
    const events = eventBusFromGame();
    const player = (PlayerDom as jest.Mock).mock.instances[0];
    const enemy = (EnemyDom as jest.Mock).mock.instances[0];
    const screen = (ScreenDom as jest.Mock).mock.instances[0];
    const hit = (HitDom as jest.Mock).mock.instances[0];

    expect(DashboardDom).toHaveBeenCalledWith(player, enemy, events);
    expect(HitDom).toHaveBeenCalledWith(player, enemy);
    expect(ScreenDom).toHaveBeenCalledWith(player, enemy, hit, events);
    expect(MenuDom).toHaveBeenCalledWith(events);
    expect(PlayerControlsDom).toHaveBeenCalledWith(screen, player, events);
  });

  test('should call requestAnimationFrame on instantiation', () => {
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test('runs only after the start request and pauses when a blocker appears', () => {
    const events = eventBusFromGame();
    events.emit('game.startRequested', undefined);
    const userPauseEvents: Array<{ blockers: string[] }> = [];
    events.on('game.paused', ({ blockers }) =>
      userPauseEvents.push({ blockers }),
    );
    events.emit('game.userPauseChanged', { paused: true });

    const animate = (window.requestAnimationFrame as jest.Mock).mock
      .calls[0][0] as (time: number) => void;
    animate(16);

    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(
      false,
      63,
      16,
      200,
    );
    expect(DashboardDom.prototype.animate).toHaveBeenCalledWith(false, 16);
    expect(userPauseEvents).toEqual([{ blockers: ['user-pause'] }]);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test('does not resume until every active blocker clears', () => {
    const events = eventBusFromGame();
    const transitions: string[] = [];
    events.on('game.paused', () => transitions.push('paused'));
    events.on('game.resumed', () => transitions.push('resumed'));
    events.emit('game.startRequested', undefined);
    events.emit('window.availabilityChanged', {
      focused: false,
      meetsMinimumResolution: true,
    });
    events.emit('game.userPauseChanged', { paused: true });
    events.emit('gameplay.holdChanged', { active: true, reason: 'base-hit' });

    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });
    events.emit('game.userPauseChanged', { paused: false });
    expect(transitions).toEqual(['paused']);

    events.emit('gameplay.holdChanged', { active: false, reason: 'base-hit' });
    expect(transitions).toEqual(['paused', 'resumed']);
  });

  test('continues requesting frames until the game-over delay elapses', () => {
    const events = eventBusFromGame();
    events.emit('game.startRequested', undefined);
    (MenuDom.prototype.gameOverDisplayed as jest.Mock).mockReturnValue(false);
    const animate = (window.requestAnimationFrame as jest.Mock).mock
      .calls[0][0] as (time: number) => void;
    animate(16);

    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(true, 63, 16, 200);
    expect(DashboardDom.prototype.animate).toHaveBeenCalledWith(true, 16);
    expect(MenuDom.prototype.animate).toHaveBeenCalledWith(16);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test('publishes defeat once and stops gameplay animation', () => {
    const events = eventBusFromGame();
    events.emit('game.startRequested', undefined);
    const defeated = jest.fn();
    events.on('game.defeated', defeated);
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(true);
    const animate = (window.requestAnimationFrame as jest.Mock).mock
      .calls[0][0] as (time: number) => void;

    animate(16);
    animate(32);

    expect(defeated).toHaveBeenCalledTimes(1);
    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(
      false,
      63,
      16,
      200,
    );
  });

  test('propagates a lifecycle listener error and does not schedule another frame', () => {
    const events = eventBusFromGame();
    events.on('game.defeated', () => {
      throw new Error('game-over listener failed');
    });
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(true);
    const animate = (window.requestAnimationFrame as jest.Mock).mock
      .calls[0][0] as (time: number) => void;

    expect(() => animate(16)).toThrow('game-over listener failed');
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
