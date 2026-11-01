import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import Game from '../../src/Game';
import { PlayerControlsDom } from '../../src/IO/Infrastructure/Dom/PlayerControlsDom';
import { ScreenDom } from '../../src/IO/Infrastructure/Dom/ScreenDom';
import { DashboardDom } from '../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { EnemyDom } from '../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { PlayerDom } from '../../src/Player/Infrastructure/Dom/PlayerDom';
import { MenuDom } from '../../src/IO/Infrastructure/Dom/MenuDom';
import { HitDom } from '../../src/Hit/Infrastructure/Dom/HitDom';

jest.mock('../../src/IO/Infrastructure/Dom/PlayerControlsDom');
jest.mock('../../src/IO/Infrastructure/Dom/ScreenDom');
jest.mock('../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom');
jest.mock('../../src/Enemy/Infrastructure/Dom/EnemyDom');
jest.mock('../../src/Player/Infrastructure/Dom/PlayerDom');
jest.mock('../../src/IO/Infrastructure/Dom/MenuDom');
jest.mock('../../src/Hit/Infrastructure/Dom/HitDom');

describe('Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.requestAnimationFrame = jest.fn(() => 0);
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

  test('should wire shared dependencies into dashboard, hit, screen and controls', () => {
    const player = (PlayerDom as jest.Mock).mock.instances[0];
    const enemy = (EnemyDom as jest.Mock).mock.instances[0];
    const dashboard = (DashboardDom as jest.Mock).mock.instances[0];
    const screen = (ScreenDom as jest.Mock).mock.instances[0];
    const hit = (HitDom as jest.Mock).mock.instances[0];

    expect(DashboardDom).toHaveBeenCalledWith(player, enemy);
    expect(HitDom).toHaveBeenCalledWith(player, enemy);
    expect(ScreenDom).toHaveBeenCalledWith(player, enemy, hit);
    expect(PlayerControlsDom).toHaveBeenCalledWith(screen, player, dashboard);
  });

  test('should call requestAnimationFrame on instantiation', () => {
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test('should call animate on screen and dashboard when animation frame is called', () => {
    (PlayerControlsDom.prototype.animateScreen as jest.Mock).mockReturnValue(true);
    (MenuDom.prototype.gameOverDisplayed as jest.Mock).mockReturnValue(false);
    const animate = (window.requestAnimationFrame as jest.Mock).mock.calls[0][0] as (time: number) => void;
    animate(0);
    expect(ScreenDom.prototype.animate).toHaveBeenCalledTimes(1);
    expect(DashboardDom.prototype.animate).toHaveBeenCalledTimes(1);
    expect(MenuDom.prototype.animate).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test('should stop requesting animation frames when game has ended', () => {
    (MenuDom.prototype.gameOverDisplayed as jest.Mock).mockReturnValue(true);
    (PlayerControlsDom.prototype.animateScreen as jest.Mock).mockReturnValue(true);
    const animate = (window.requestAnimationFrame as jest.Mock).mock.calls[0][0] as (time: number) => void;
    animate(16);

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test('should compute timing and pass correct values to screen, dashboard and menu', () => {
    (PlayerControlsDom.prototype.animateScreen as jest.Mock).mockReturnValue(true);
    (PlayerControlsDom.prototype.getGameInitiated as jest.Mock).mockReturnValue(true);
    (DashboardDom.prototype.getPaused as jest.Mock).mockReturnValue(false);
    (DashboardDom.prototype.getRadarAnouncementDisplayTime as jest.Mock).mockReturnValue(200);
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(false);

    const animate = (window.requestAnimationFrame as jest.Mock).mock.calls[0][0] as (time: number) => void;
    animate(100);

    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(true, 10, 100, 200);
    expect(DashboardDom.prototype.animate).toHaveBeenCalledWith(true, 100);
    expect(MenuDom.prototype.animate).toHaveBeenCalledWith(100, true, true, false, false);
  });

  test('should update timing from the previous animation frame timestamp', () => {
    (PlayerControlsDom.prototype.animateScreen as jest.Mock).mockReturnValue(true);

    const animate = (window.requestAnimationFrame as jest.Mock).mock.calls[0][0] as (time: number) => void;
    animate(100);
    animate(125);

    expect(ScreenDom.prototype.animate).toHaveBeenNthCalledWith(1, true, 10, 100, 200);
    expect(ScreenDom.prototype.animate).toHaveBeenNthCalledWith(2, true, 40, 25, 200);
    expect(DashboardDom.prototype.animate).toHaveBeenNthCalledWith(2, true, 25);
  });

  test('should query control state for each animate branch', () => {
    (PlayerControlsDom.prototype.animateScreen as jest.Mock).mockReturnValue(false);
    (PlayerControlsDom.prototype.getGameInitiated as jest.Mock).mockReturnValue(true);
    (DashboardDom.prototype.getPaused as jest.Mock).mockReturnValue(false);
    (PlayerDom.prototype.defeated as jest.Mock).mockReturnValue(false);

    const animate = (window.requestAnimationFrame as jest.Mock).mock.calls[0][0] as (time: number) => void;
    animate(50);

    expect(PlayerControlsDom.prototype.animateScreen).toHaveBeenCalledTimes(3);
    expect(PlayerControlsDom.prototype.getGameInitiated).toHaveBeenCalledTimes(1);
    expect(DashboardDom.prototype.getPaused).toHaveBeenCalledTimes(1);
    expect(PlayerDom.prototype.defeated).toHaveBeenCalledTimes(1);
    expect(ScreenDom.prototype.animate).toHaveBeenCalledWith(false, 20, 50, 200);
    expect(DashboardDom.prototype.animate).toHaveBeenCalledWith(false, 50);
    expect(MenuDom.prototype.animate).toHaveBeenCalledWith(50, true, false, false, false);
  });
});
