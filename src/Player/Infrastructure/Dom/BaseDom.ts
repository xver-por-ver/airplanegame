import { EnemyDom } from '../../../Enemy/Infrastructure/Dom/EnemyDom';
import { MissileAbstractDom } from '../../../Enemy/Infrastructure/Dom/MissileAbstractDom';
import { MissileAtomicDom } from '../../../Enemy/Infrastructure/Dom/MissileAtomicDom';
import { BaseInterface } from '../../Domain/BaseInterface';

export class BaseDom implements BaseInterface {
  private health: number = 3;
  private pendingHitAnnouncement: boolean = false;

  public applyDamage(): void {
    if (this.isDefeated()) {
      return;
    }
    this.pendingHitAnnouncement = true;
    this.health--;
  }

  public isDefeated(): boolean {
    return 0 === this.health;
  }

  public radarAnnounce(): boolean {
    return this.pendingHitAnnouncement;
  }

  private unsetRadarAnnounce(): void {
    this.pendingHitAnnouncement = false;
  }

  public getSpritePosition(): string {
    if (1 === this.health) {
      return '-146px -140px';
    }
    if (0 === this.health) {
      return '-90x -140px';
    }
    return '-146px -89px';
  }

  public getRadarMessage(): string {
    if (1 === this.health) {
      return '<p>BASE WILL NOT WITHSTAND FURTHER DAMAGE</p>';
    }
    if (0 === this.health) {
      return '<p>BASE DESTROYED</p>';
    }
    return '<p>BASE HAS SUFFERED DAMAGE</p>';
  }

  public getHealth(): number {
    return this.health;
  }

  public atomicMissileDetection(enemy: EnemyDom): boolean {
    const found = enemy
      .getLaunchedMissiles()
      .find((missile: MissileAbstractDom) => {
        if (missile instanceof MissileAtomicDom && missile.radarAnnounce()) {
          missile.unsetRadarAnnounce();
          return true;
        }
        return false;
      });
    return undefined !== found;
  }

  public baseHit(): boolean {
    if (this.radarAnnounce()) {
      this.unsetRadarAnnounce();
      return true;
    }
    return false;
  }
}
