export interface BaseInterface {
  applyDamage(): void;
  getSpritePosition(): string;
  getRadarMessage(): string;
  getHealth(): number;
  baseHit(): boolean;
}
