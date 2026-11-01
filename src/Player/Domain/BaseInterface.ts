import { EnemyDom } from '../../Enemy/Infrastructure/Dom/EnemyDom';

export interface BaseInterface {
  applyDamage(): void;
  getSpritePosition(): string;
  getRadarMessage(): string;
  getHealth(): number;
  atomicMissileDetection(enemy: EnemyDom): boolean;
  baseHit(): boolean;
}
