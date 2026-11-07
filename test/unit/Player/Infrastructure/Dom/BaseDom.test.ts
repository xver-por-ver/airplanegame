import { describe, expect, beforeEach, test } from '@jest/globals';
import { BaseDom } from '../../../../../src/Player/Infrastructure/Dom/BaseDom';
import { EnemyDom } from '../../../../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { MissileAtomicDom } from '../../../../../src/Enemy/Infrastructure/Dom/MissileAtomicDom';
import { MissileHydrogenDom } from '../../../../../src/Enemy/Infrastructure/Dom/MissileHydrogenDom';

describe('BaseDom', () => {
  let baseDom: BaseDom;

  beforeEach(() => {
    baseDom = new BaseDom();
  });

  test('should initialize with 3 health', () => {
    expect(baseDom.getHealth()).toBe(3);
  });

  test('should decrease health when applying damage', () => {
    baseDom.applyDamage();
    expect(baseDom.getHealth()).toBe(2);
  });

  test('should set pending radar announcement on applying damage', () => {
    baseDom.applyDamage();
    expect(baseDom.radarAnnounce()).toBe(true);
  });

  test('should unset pending radar announcement when the base is hit', () => {
    baseDom.applyDamage();
    expect(baseDom.baseHit()).toBe(true);
    expect(baseDom.radarAnnounce()).toBe(false);
    expect(baseDom.baseHit()).toBe(false);
  });

  test('should return the correct sprite position based on health', () => {
    expect(baseDom.getSpritePosition()).toBe('-146px -89px');
    baseDom.applyDamage(); // health = 2
    expect(baseDom.getSpritePosition()).toBe('-146px -89px');
    baseDom.applyDamage(); // health = 1
    expect(baseDom.getSpritePosition()).toBe('-146px -142px');
    baseDom.applyDamage(); // health = 0
    expect(baseDom.getSpritePosition()).toBe('-90x -142px');
  });

  test('should detect and clear an atomic missile announcement', () => {
    const atomicMissile = new MissileAtomicDom('1', 800);
    const hydrogenMissile = new MissileHydrogenDom('2', 800);
    const enemy = {
      getLaunchedMissiles: () => [hydrogenMissile, atomicMissile],
    } as unknown as EnemyDom;

    expect(baseDom.atomicMissileDetection(enemy)).toBe(true);
    expect(atomicMissile.radarAnnounce()).toBe(false);
    expect(baseDom.atomicMissileDetection(enemy)).toBe(false);
  });

  test('should return false when no atomic missile is pending', () => {
    const hydrogenMissile = new MissileHydrogenDom('2', 800);
    const enemy = {
      getLaunchedMissiles: () => [hydrogenMissile],
    } as unknown as EnemyDom;
    expect(baseDom.atomicMissileDetection(enemy)).toBe(false);
  });

  test('should return the correct radar message based on health', () => {
    baseDom.applyDamage(); // health = 2
    expect(baseDom.getRadarMessage()).toBe('<p>BASE HAS SUFFERED DAMAGE</p>');
    baseDom.applyDamage(); // health = 1
    expect(baseDom.getRadarMessage()).toBe('<p>BASE WILL NOT WITHSTAND FURTHER DAMAGE</p>');
    baseDom.applyDamage(); // health = 0
    expect(baseDom.getRadarMessage()).toBe('<p>BASE DESTROYED</p>');
  });
});
