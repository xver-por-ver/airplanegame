import { ScreenElementDom } from '../../../IO/Infrastructure/Dom/ScreenElementDom';
import { PlayerInterface } from '../../Domain/PlayerInterface';
import { AirplaneAbstractDom } from './AirplaneAbstractDom';
import { AirplaneType1Dom } from './AirplaneType1Dom';
import { BaseDom } from './BaseDom';

export class PlayerDom implements PlayerInterface {
  private score: number = 0;
  private readonly airplanes: AirplaneAbstractDom[] = [];
  private readonly base: BaseDom;

  constructor() {
    this.airplanes.push(new AirplaneType1Dom(this.airplanes.length));
    this.base = new BaseDom();
  }

  public animate(
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
  ): ScreenElementDom[] {
    const screenElementsToPaint: ScreenElementDom[] = [];
    this.airplanes.forEach((airplane: AirplaneAbstractDom) => {
      screenElementsToPaint.push(
        ...airplane.animate(
          repaintRatePerSecond,
          millisecondsSinceLastAnimateCall,
        ),
      );
    });
    return screenElementsToPaint;
  }

  public fly(x: number, y: number, screenHeight: number): void {
    this.airplanes.forEach((airplane: AirplaneAbstractDom) => {
      airplane.fly(x, y, screenHeight);
    });
  }

  public fire(): void {
    this.airplanes.forEach((airplane: AirplaneAbstractDom) => {
      airplane.fire();
    });
  }

  public reloadMagazine(): void {
    this.airplanes.forEach((airplane: AirplaneAbstractDom) => {
      airplane.reloadMagazine();
    });
  }

  public getAirplanes(): AirplaneAbstractDom[] {
    return this.airplanes;
  }

  public updateScore(points: number): void {
    this.score += points;
  }

  public getBase(): BaseDom {
    return this.base;
  }

  public getScrore(): number {
    return this.score;
  }

  public defeated(): boolean {
    return 0 === this.base.getHealth();
  }
}
