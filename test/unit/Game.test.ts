import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import Game from '../../src/Game';
import { FrameTiming } from '../../src/FrameTiming';
import { PlayerControlsDom } from '../../src/IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from '../../src/IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from '../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from '../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../src/Player/Infrastructure/Dom/PlayerDom';
import { MenuDom } from '../../src/IO/Infrastructure/Dom/MenuDom';
import { HitDom } from '../../src/Hit/Infrastructure/Dom/HitDom';
import { EventBusInterface } from '../../src/IO/Domain/EventBusInterface';
import { GameEvents } from '../../src/IO/Domain/GameEventsInterface';

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
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    jest.clearAllMocks();
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(false);
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
    expect(ScreenDom).toHaveBeenCalledWith(player, enemy, hit);
    expect(MenuDom).toHaveBeenCalledWith(events);
    expect(PlayerControlsDom).toHaveBeenCalledWith(screen, player, events);
  });

  test('should call requestAnimationFrame on instantiation', () => {
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test('ignores repeated start requests', () => {
    const events = eventBusFromGame();
    const started = jest.fn();
    events.on('game.started', started);

    events.emit('game.startRequested', undefined);
    events.emit('game.startRequested', undefined);

    expect(started).toHaveBeenCalledTimes(1);
  });

  test('does not start after the player is defeated', () => {
    const events = eventBusFromGame();
    const started = jest.fn();
    events.on('game.started', started);
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(true);

    events.emit('game.startRequested', undefined);

    expect(started).not.toHaveBeenCalled();
  });

  test('starts paused when a window blocker is already active', () => {
    const events = eventBusFromGame();
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: false,
    });
    const paused = jest.fn();
    events.on('game.paused', paused);

    events.emit('game.startRequested', undefined);

    expect(paused).toHaveBeenCalledWith({ blockers: ['minimum-resolution'] });
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
      FrameTiming.between(16, 0),
      200,
    );
    expect(DashboardDom.prototype.animate).toHaveBeenCalledWith(false, 16);
    expect(userPauseEvents).toEqual([{ blockers: ['user-pause'] }]);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test('discards the time spent paused when the game resumes', () => {
    const events = eventBusFromGame();
    events.emit('game.startRequested', undefined);
    const firstFrame = (window.requestAnimationFrame as jest.Mock).mock
      .calls[0][0] as (time: number) => void;
    firstFrame(16);

    events.emit('window.availabilityChanged', {
      focused: false,
      meetsMinimumResolution: true,
    });
    events.emit('window.availabilityChanged', {
      focused: true,
      meetsMinimumResolution: true,
    });

    const resumedFrame = (window.requestAnimationFrame as jest.Mock).mock
      .calls[1][0] as (time: number) => void;
    resumedFrame(60_000);

    expect(DashboardDom.prototype.animate).toHaveBeenLastCalledWith(false, 0);
    expect(ScreenDom.prototype.animate).toHaveBeenLastCalledWith(
      false,
      FrameTiming.between(60_000, 60_000),
      200,
    );

    const nextFrame = (window.requestAnimationFrame as jest.Mock).mock
      .calls[2][0] as (time: number) => void;
    nextFrame(60_016);

    expect(DashboardDom.prototype.animate).toHaveBeenLastCalledWith(true, 16);
    expect(ScreenDom.prototype.animate).toHaveBeenLastCalledWith(
      true,
      FrameTiming.between(60_016, 60_000),
      200,
    );
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

    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(
      true,
      FrameTiming.between(16, 0),
      200,
    );
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
      FrameTiming.between(16, 0),
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
