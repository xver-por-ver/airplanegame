import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import { PlayerDom } from '../../../../../src/Player/Infrastructure/Dom/PlayerDom';
import { AirplaneType1Dom } from '../../../../../src/Player/Infrastructure/Dom/AirplaneType1Dom';
import { BaseDom } from '../../../../../src/Player/Infrastructure/Dom/BaseDom';
import { ScreenElementDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDom';

jest.mock('../../../../../src/Player/Infrastructure/Dom/AirplaneType1Dom');
jest.mock('../../../../../src/Player/Infrastructure/Dom/BaseDom');

describe('PlayerDom', () => {
  let playerDom: PlayerDom;
  let airplane: AirplaneType1Dom;
  let base: BaseDom;

  beforeEach(() => {
    playerDom = new PlayerDom();
    airplane = (playerDom.getAirplanes()[0] as jest.Mocked<AirplaneType1Dom>);
    base = (playerDom.getBase() as jest.Mocked<BaseDom>);
  });

  test('should create an airplane and a base on construction', () => {
    expect(AirplaneType1Dom).toHaveBeenCalledTimes(1);
    expect(BaseDom).toHaveBeenCalledTimes(1);
    expect(playerDom.getAirplanes()).toHaveLength(1);
  });

  test('should animate its airplanes', () => {
    const screenElement = new ScreenElementDom('sprite', {} as any, 1, 1, 1, 1);
    const animateSpy = jest.spyOn(airplane, 'animate').mockReturnValue([screenElement]);

    const result = playerDom.animate(60, 100);

    expect(animateSpy).toHaveBeenCalledWith(60, 100);
    expect(result).toEqual([screenElement]);
  });

  test('should make its airplanes fly', () => {
    const flySpy = jest.spyOn(airplane, 'fly');
    playerDom.fly(100, 200, 600);
    expect(flySpy).toHaveBeenCalledWith(100, 200, 600);
  });

  test('should make its airplanes fire', () => {
    const fireSpy = jest.spyOn(airplane, 'fire');
    playerDom.fire();
    expect(fireSpy).toHaveBeenCalledTimes(1);
  });

  test('should make its airplanes reload their magazines', () => {
    const reloadMagazineSpy = jest.spyOn(airplane, 'reloadMagazine');
    playerDom.reloadMagazine();
    expect(reloadMagazineSpy).toHaveBeenCalledTimes(1);
  });

  test('should update the score', () => {
    playerDom.updateScore(100);
    expect(playerDom.getScrore()).toBe(100);
    playerDom.updateScore(50);
    expect(playerDom.getScrore()).toBe(150);
  });

  test('should delegate defeat status to the base', () => {
    jest.spyOn(base, 'isDefeated').mockReturnValue(true);
    expect(playerDom.defeated()).toBe(true);

    jest.spyOn(base, 'isDefeated').mockReturnValue(false);
    expect(playerDom.defeated()).toBe(false);
  });
});
