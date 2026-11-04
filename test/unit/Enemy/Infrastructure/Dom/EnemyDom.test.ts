import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import { EnemyDom } from '../../../../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { MissileHydrogenDom } from '../../../../../src/Enemy/Infrastructure/Dom/MissileHydrogenDom';
import { MissileAtomicDom } from '../../../../../src/Enemy/Infrastructure/Dom/MissileAtomicDom';
import { ExplosionDom } from '../../../../../src/Hit/Infrastructure/Dom/ExplosionDom';
import { ScreenElementDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDom';
import { ScreenElementPositionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementPositionDom';
import { ScreenElementDimensionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDimensionDom';

jest.mock('../../../../../src/Enemy/Infrastructure/Dom/MissileHydrogenDom');
jest.mock('../../../../../src/Enemy/Infrastructure/Dom/MissileAtomicDom');
jest.mock('../../../../../src/Hit/Infrastructure/Dom/ExplosionDom');

describe('EnemyDom', () => {
  let enemyDom: EnemyDom;
  const screenHeight = 600;
  const screenWidth = 800;

  beforeEach(() => {
    enemyDom = new EnemyDom();
    jest.useFakeTimers();
  });

  test('should launch a hydrogen missile when the time comes', () => {
    enemyDom.animate(60, 1600, screenHeight, screenWidth);
    expect(MissileHydrogenDom).toHaveBeenCalledTimes(1);
  });

  test('should launch an atomic missile when the time comes', () => {
    enemyDom.animate(60, 15100, screenHeight, screenWidth);
    expect(MissileAtomicDom).toHaveBeenCalledTimes(1);
  });

  test('should assign sequential missile identities deterministically', () => {
    enemyDom.animate(60, 1500, screenHeight, screenWidth);
    enemyDom.animate(60, 13500, screenHeight, screenWidth);

    expect(MissileHydrogenDom).toHaveBeenNthCalledWith(
      1,
      'missile-1',
      screenHeight,
    );
    expect(MissileHydrogenDom).toHaveBeenNthCalledWith(
      2,
      'missile-2',
      screenHeight,
    );
    expect(MissileAtomicDom).toHaveBeenCalledWith('missile-3', screenHeight);
  });

  test('should animate launched missiles', () => {
    const missile = new MissileHydrogenDom('1', screenHeight);
    const animateSpy = jest.spyOn(missile, 'animate');
    enemyDom.getLaunchedMissiles().push(missile);

    enemyDom.animate(60, 100, screenHeight, screenWidth);

    expect(animateSpy).toHaveBeenCalledWith(60);
  });

  test('should create an explosion when a missile is destroyed', () => {
    const missile = new MissileHydrogenDom('1', screenHeight);
    jest.spyOn(missile, 'destroyed').mockReturnValue(true);
    jest.spyOn(missile, 'getPosition').mockReturnValue(new ScreenElementPositionDom(100, 100));
    jest.spyOn(missile, 'getDimension').mockReturnValue(new ScreenElementDimensionDom(10, 10));
    enemyDom.getLaunchedMissiles().push(missile);

    enemyDom.animate(60, 100, screenHeight, screenWidth);

    expect(ExplosionDom).toHaveBeenCalledTimes(1);
  });

  test('should clean off-screen missiles', () => {
    const missile = new MissileHydrogenDom('1', screenHeight);
    const position = new ScreenElementPositionDom(screenWidth + 100, 100);
    const dimension = new ScreenElementDimensionDom(10, 10);
    jest.spyOn(missile, 'getPosition').mockReturnValue(position);
    jest.spyOn(missile, 'getDimension').mockReturnValue(dimension);
    enemyDom.getLaunchedMissiles().push(missile);

    enemyDom.animate(60, 100, screenHeight, screenWidth);

    expect(enemyDom.getLaunchedMissiles()).toHaveLength(0);
  });

  test('should clear finished explosions', () => {
    const explosion = new ExplosionDom('1', new ScreenElementDimensionDom(10, 10), new ScreenElementPositionDom(100, 100));
    jest.spyOn(explosion, 'getTimeVisible').mockReturnValue(-1);
    (enemyDom as any).explosions.push(explosion);

    enemyDom.animate(60, 100, screenHeight, screenWidth);

    expect((enemyDom as any).explosions).toHaveLength(0);
  });

  test('should return screen elements to paint', () => {
    const missile = new MissileHydrogenDom('1', screenHeight);
    const screenElement = new ScreenElementDom('sprite', {} as any, 1, 1, 1, 1);
    jest.spyOn(missile, 'getScreenElement').mockReturnValue(screenElement);
    enemyDom.getLaunchedMissiles().push(missile);

    const result = enemyDom.animate(60, 100, screenHeight, screenWidth);

    expect(result).toContain(screenElement);
  });
});
