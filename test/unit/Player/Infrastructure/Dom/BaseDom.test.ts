import { describe, expect, beforeEach, test } from '@jest/globals';
import { BaseDom } from '../../../../../src/Player/Infrastructure/Dom/BaseDom';

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

  test('should unset pending radar announcement', () => {
    baseDom.applyDamage();
    baseDom.baseHit();
    expect(baseDom.radarAnnounce()).toBe(false);
  });

  test('should return the correct sprite position based on health', () => {
    expect(baseDom.getSpritePosition()).toBe('-146px -89px');
    baseDom.applyDamage(); // health = 2
    expect(baseDom.getSpritePosition()).toBe('-146px -89px');
    baseDom.applyDamage(); // health = 1
    expect(baseDom.getSpritePosition()).toBe('-146px -140px');
    baseDom.applyDamage(); // health = 0
    expect(baseDom.getSpritePosition()).toBe('-90x -140px');
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
