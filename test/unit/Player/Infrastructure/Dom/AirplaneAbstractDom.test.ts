import { describe, expect, jest, beforeEach, test } from '@jest/globals';
import { AirplaneAbstractDom } from '../../../../../src/Player/Infrastructure/Dom/AirplaneAbstractDom';
import { ScreenElementDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDom';
import { FireRoundDom } from '../../../../../src/Player/Infrastructure/Dom/FireRoundDom';
import { ScreenElementPositionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementPositionDom';
import { ScreenElementDimensionDom } from '../../../../../src/IO/Infrastructure/Dom/ScreenElementDimensionDom';

jest.mock('../../../../../src/IO/Infrastructure/Dom/ScreenElementDom');
jest.mock('../../../../../src/Player/Infrastructure/Dom/FireRoundDom');

const verticalCenter: number = 30;

class ConcreteAirplane extends AirplaneAbstractDom {
  protected readonly magazineCapacity: number = 1;

  constructor() {
    super('sprite', 'airplane1', 50, 100, verticalCenter, 0, 0);
    this.initializeMagazine();
  }
}

describe('AirplaneAbstractDom', () => {
  let airplane: ConcreteAirplane;
  let screenElement: ScreenElementDom;
  let fireRound: FireRoundDom;

  beforeEach(() => {
    airplane = new ConcreteAirplane();
    screenElement = (ScreenElementDom as jest.Mock).mock.instances[0] as ScreenElementDom;
    fireRound = (FireRoundDom as jest.Mock).mock.instances[0] as FireRoundDom;

    const position = new ScreenElementPositionDom(100, 200);
    const dimension = new ScreenElementDimensionDom(100, 50);
    jest.spyOn(screenElement, 'getPosition').mockReturnValue(position);
    jest.spyOn(screenElement, 'getDimension').mockReturnValue(dimension);

    const fireRoundPosition = new ScreenElementPositionDom(0, 0);
    const fireRoundDimension = new ScreenElementDimensionDom(10, 5);
    jest.spyOn(fireRound, 'getScreenElement').mockReturnValue({
        getPosition: () => fireRoundPosition,
        getDimension: () => fireRoundDimension,
    } as any);
  });

  test('should initialize correctly', () => {
    expect(ScreenElementDom).toHaveBeenCalledWith('sprite', 'airplane1', 50, 100, 0, 0, 'destination-over');
    expect(airplane.getAvailableFireRounds()).toBe(1);
    expect(airplane.getReloading()).toBe(false);
  });

  test('should fire a round', () => {
    airplane.fire();
    expect(airplane.getAvailableFireRounds()).toBe(0);
    expect(airplane.getReloading()).toBe(true);
  });

  test('should not fire when reloading', () => {
    airplane.fire();
    airplane.fire();
    expect(fireRound.setPosition).toHaveBeenCalledTimes(1);
  });

  test('should reload the magazine', () => {
    airplane.fire();
    airplane.reloadMagazine();
    expect(airplane.getAvailableFireRounds()).toBe(1);
    expect(airplane.getReloading()).toBe(false);
  });

  test('should reload automatically after a delay', () => {
    airplane.fire();
    airplane.animate(60, 1100);
    expect(airplane.getAvailableFireRounds()).toBe(1);
    expect(airplane.getReloading()).toBe(false);
  });

  test('should fly and set position within screen bounds', () => {
    const posY = 300 - verticalCenter;
    airplane.fly(150, 300, 600);
    expect(screenElement.setPosition).toHaveBeenCalledWith(100, posY);
  });

  test('should not fly above the top of the screen', () => {
    const posY = 0 - (verticalCenter + 1);
    airplane.fly(150, posY, 600);
    expect(screenElement.setPosition).toHaveBeenCalledWith(100, 0 - verticalCenter);
  });

  test('should not fly below the bottom of the screen', () => {
    const posY = 600 + (verticalCenter + 1);
    airplane.fly(150, posY, 600);
    expect(screenElement.setPosition).toHaveBeenCalledWith(100, 600 - verticalCenter);
  });

  test('should animate its fire rounds', () => {
    const animateSpy = jest.spyOn(fireRound, 'animate');
    airplane.animate(60, 100);
    expect(animateSpy).toHaveBeenCalledWith(60);
  });

  describe('getFireRounds', () => {
    test('should return an array of all fire rounds in the magazine', () => {
      // The magazine is initialized in the constructor of AirplaneType1Dom
      const fireRounds = airplane.getFireRounds();

      // ConcreteAirplane has a magazine capacity of 1
      expect(fireRounds).toHaveLength(1);
      expect(fireRounds[0]).toBeInstanceOf(FireRoundDom);
    });

    test('should return the same array instance on multiple calls', () => {
      const fireRounds1 = airplane.getFireRounds();
      const fireRounds2 = airplane.getFireRounds();

      expect(fireRounds1).toBe(fireRounds2);
    });
  });
});
