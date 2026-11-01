import { describe, expect, test } from '@jest/globals';
import { MissileAtomicDom } from '../../../../../src/Enemy/Infrastructure/Dom/MissileAtomicDom';

describe('MissileAtomicDom', () => {
  test('announces radar detection until cleared', () => {
    const missile = new MissileAtomicDom('1', 800);
    expect(missile.radarAnnounce()).toBe(true);
    missile.unsetRadarAnnounce();
    expect(missile.radarAnnounce()).toBe(false);
  });
});
