import { ExplosionDom } from '../../../Hit/Infrastructure/Dom/ExplosionDom';
import { ScreenElementDom } from '../../../IO/Infrastructure/Dom/ScreenElementDom';
import { EnemyInterface } from '../../Domain/EnemyInterface';
import { MissileAbstractDom } from './MissileAbstractDom';
import { MissileAtomicDom } from './MissileAtomicDom';
import { MissileHydrogenDom } from './MissileHydrogenDom';

export class EnemyDom implements EnemyInterface {
  private readonly missileHydrogenRelaunchTime: number = 1500;
  private readonly missileAtomicRelaunchTime: number = 15000;
  private timeTillNextMissileHydrogenLaunch: number =
    this.missileHydrogenRelaunchTime;
  private timeTillNextMissileAtomicLaunch: number =
    this.missileAtomicRelaunchTime;
  private launchedMissiles: MissileAbstractDom[] = [];
  private explosions: ExplosionDom[] = [];
  private nextEntityId: number = 1;

  public animate(
    repaintRatePerSecond: number,
    millisecondsSinceLastAnimateCall: number,
    screenHeight: number,
    screenWidth: number,
  ): ScreenElementDom[] {
    this.timeTillNextMissileHydrogenLaunch -= millisecondsSinceLastAnimateCall;
    this.timeTillNextMissileAtomicLaunch -= millisecondsSinceLastAnimateCall;
    if (this.timeTillNextMissileHydrogenLaunch <= 0) {
      this.launchMissile(
        new MissileHydrogenDom(this.nextId('missile'), screenHeight),
      );
      this.timeTillNextMissileHydrogenLaunch +=
        this.missileHydrogenRelaunchTime;
    }
    if (this.timeTillNextMissileAtomicLaunch <= 0) {
      this.launchMissile(
        new MissileAtomicDom(this.nextId('missile'), screenHeight),
      );
      this.timeTillNextMissileAtomicLaunch += this.missileAtomicRelaunchTime;
    }

    const screenElementsToPaint: ScreenElementDom[] = [];
    this.launchedMissiles.forEach((missile: MissileAbstractDom) => {
      if (missile.destroyed()) {
        this.explodeMissile(missile, screenWidth);
        return;
      }
      missile.animate(repaintRatePerSecond);
      screenElementsToPaint.push(missile.getScreenElement());
    });
    this.explosions.forEach((explosion: ExplosionDom) => {
      explosion.animate(millisecondsSinceLastAnimateCall);
      screenElementsToPaint.push(explosion.getScreenElement());
    });
    this.cleanOffScreenMissiles();
    this.clearExplosions();
    return screenElementsToPaint;
  }

  private nextId(entity: string): string {
    return `${entity}-${this.nextEntityId++}`;
  }

  private launchMissile(missile: MissileAbstractDom): void {
    this.launchedMissiles.push(missile);
  }

  private cleanOffScreenMissiles(): void {
    this.launchedMissiles = this.launchedMissiles.filter(
      (missile: MissileAbstractDom) => {
        return false === missile.destroyed();
      },
    );
  }

  public getLaunchedMissiles(): MissileAbstractDom[] {
    return this.launchedMissiles;
  }

  private explodeMissile(
    missile: MissileAbstractDom,
    screenWidth: number,
  ): void {
    this.explosions.push(
      new ExplosionDom(
        this.nextId('explosion'),
        missile.getDimension(),
        missile.getPosition(),
      ),
    );
    missile.setPosition(screenWidth, 0);
  }

  private clearExplosions(): void {
    this.explosions = this.explosions.filter((explosion: ExplosionDom) => {
      return 0 < explosion.getTimeVisible();
    });
  }
}
