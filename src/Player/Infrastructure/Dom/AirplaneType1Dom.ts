import { AirplaneAbstractDom } from './AirplaneAbstractDom';

export class AirplaneType1Dom extends AirplaneAbstractDom {
  protected readonly magazineCapacity: number = 7;

  constructor(id: number) {
    super('sprite', 'airplaneT1' + id, 70, 111, 37, 0, 0);
    this.initializeMagazine();
  }
}
