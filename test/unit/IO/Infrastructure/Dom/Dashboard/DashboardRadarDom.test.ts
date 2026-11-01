import { describe, expect, beforeEach, afterEach, test, jest } from '@jest/globals';
import { DashboardRadarDom } from '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardRadarDom';
import { PlayerDom } from '../../../../../../src/Player/Infrastructure/Dom/PlayerDom';
import { EnemyDom } from '../../../../../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { MissileAtomicDom } from '../../../../../../src/Enemy/Infrastructure/Dom/MissileAtomicDom';
import { MissileAbstractDom } from '../../../../../../src/Enemy/Infrastructure/Dom/MissileAbstractDom';
import { Dom } from '../../../../../../src/IO/Infrastructure/Dom/Dom';
import { resetDocument } from '../../../../../DomDocumentInit';
import { BaseDom } from '../../../../../../src/Player/Infrastructure/Dom/BaseDom';

const createBaseDomMock = (overrides: Partial<jest.Mocked<BaseDom>> = {}): jest.Mocked<BaseDom> => ({
    applyDamage: jest.fn<() => void>(),
    radarAnnounce: jest.fn<() => boolean>().mockReturnValue(false),
    atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(false),
    baseHit: jest.fn<() => boolean>().mockReturnValue(false),
    getSpritePosition: jest.fn<() => string>(),
    getRadarMessage: jest.fn<() => string>(),
    getHealth: jest.fn<() => number>(),
    ...overrides,
} as unknown as jest.Mocked<BaseDom>);

jest.mock('../../../../../../src/Player/Infrastructure/Dom/PlayerDom');
jest.mock('../../../../../../src/Enemy/Infrastructure/Dom/EnemyDom'); 

describe('DashboardRadarDom', () => {
    let dashboardRadar: DashboardRadarDom;
    let dom: Dom;
    let player: PlayerDom;
    let enemy: EnemyDom;
    let radarImg: HTMLElement;
    let radarMsg: HTMLElement;

    beforeEach(() => {        
        radarImg = document.getElementById('radarImg') as HTMLElement;
        radarMsg = document.getElementById('radarMsg') as HTMLElement;

        player = new PlayerDom() as jest.Mocked<PlayerDom>;
        enemy = new EnemyDom() as jest.Mocked<EnemyDom>;
        dom = new Dom();

        dashboardRadar = new DashboardRadarDom(player, enemy, dom);
    });

    afterEach(() => {
        resetDocument();
        jest.clearAllMocks();
    });

    test('should construct without errors when elements exist', () => {
        expect(() => new DashboardRadarDom(player, enemy, dom)).not.toThrow();
    });

    test('should return the radar announcement display duration', () => {
        expect(dashboardRadar.getDisplayTime()).toBe(2000);
    });

    test('should throw error when radar image element is missing', () => {
        document.body.removeChild(radarImg);
        expect(() => new DashboardRadarDom(player, enemy, dom)).toThrow("Fatal: non existent element with id 'radarImg'");
    });

    test('should throw error when radar message element is missing', () => {
        document.body.removeChild(radarMsg);
        expect(() => new DashboardRadarDom(player, enemy, dom)).toThrow("Fatal: non existent element with id 'radarMsg'");
    });

    test('should detect atomic missiles when screen is animated', () => {
        const missileAtomic = new MissileAtomicDom('missileA1', 500);
        
        enemy.getLaunchedMissiles = jest.fn<() => MissileAbstractDom[]>().mockReturnValue([missileAtomic]);

        const base = createBaseDomMock({
            radarAnnounce: jest.fn<() => boolean>().mockReturnValue(false),
            atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(true),
        });

        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        
        dashboardRadar.animate(true, 10);
        
        expect(radarImg.style.getPropertyValue('visibility')).toBe('visible');
        expect(radarMsg.innerHTML).toBe('<p>ATOMIC MISILE APPROACHING</p>');
    });

    test('should handle base hit when player is defeated', () => {
        const position = '100px -100px';
        const message = 'test-message';
        const base = createBaseDomMock({
            radarAnnounce: jest.fn<() => boolean>().mockReturnValue(true),
            baseHit: jest.fn<() => boolean>().mockReturnValue(true),
            getSpritePosition: jest.fn<() => string>().mockReturnValue(position),
            getRadarMessage: jest.fn<() => string>().mockReturnValue(message),
        });
        
        player.defeated = jest.fn<() => boolean>().mockReturnValue(true);
        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        
        radarImg.style.backgroundPosition = '0px 0px';
        dashboardRadar.animate(false, 100);

        expect(radarImg.style.visibility).toBe('visible');
        expect(radarImg.style.backgroundPosition).toBe(position);
        expect(radarMsg.innerHTML).toBe(message);
    });

    test('should clear display after timeout', () => {
        const missileAtomic = new MissileAtomicDom('missileA1', 500);
        
        enemy.getLaunchedMissiles = jest.fn<() => MissileAbstractDom[]>().mockReturnValue([missileAtomic]);

        const base = createBaseDomMock({
            atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(true),
        });
        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        
        dashboardRadar.animate(true, 200);
        base.atomicMissileDetection = jest.fn<() => boolean>().mockReturnValue(false);
        dashboardRadar.animate(true, 2000);
        
        expect(radarImg.style.getPropertyValue('visibility')).toBe('hidden');
        expect(radarMsg.innerHTML).toBe('');
    });

    test('should return correct pause state', () => {
        expect(dashboardRadar.getPaused()).toBe(false);
        
        const base = createBaseDomMock({
            radarAnnounce: jest.fn<() => boolean>().mockReturnValue(true),
            getSpritePosition: jest.fn<() => string>(),
            getRadarMessage: jest.fn<() => string>(),
            baseHit: jest.fn<() => boolean>().mockReturnValue(true),
        });
        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        player.defeated = jest.fn<() => boolean>().mockReturnValue(true);
        
        dashboardRadar.animate(false, 100);
        expect(dashboardRadar.getPaused()).toBe(true);
    });

    test('should not process base hit when screen is not animated and player is not defeated', () => {
        const base = createBaseDomMock({
            radarAnnounce: jest.fn<() => boolean>().mockReturnValue(true),
        });
        
        player.defeated = jest.fn<() => boolean>().mockReturnValue(false);
        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        
        dashboardRadar.animate(false, 100);
        
        expect(base.radarAnnounce).not.toHaveBeenCalled();
    });

    test('should process base hit when screen is animated and player is not defeated', () => {
        const base = createBaseDomMock({
            getSpritePosition: jest.fn<() => string>(),
            getRadarMessage: jest.fn<() => string>(),
        });
        player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
        player.defeated = jest.fn<() => boolean>().mockReturnValue(false);
        enemy.getLaunchedMissiles = jest.fn<() => MissileAbstractDom[]>().mockReturnValue([]);        
        
        dashboardRadar.animate(true, 100);
        
        expect(base.baseHit).toHaveBeenCalled();
    });

    describe('displayActivationControl', () => {
        test('should decrease timeout when display is activated and screen is animated', () => {
            const base = createBaseDomMock({ 
                atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(true),
            });
            player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
            const initialTimeout = (dashboardRadar as any).displayDeactivationTimeout;
            dashboardRadar.animate(true, 0);
            base.atomicMissileDetection = jest.fn<() => boolean>().mockReturnValue(false);
            dashboardRadar.animate(true, 100);
            expect((dashboardRadar as any).displayDeactivationTimeout).toBeLessThan(initialTimeout);
        });

        test('should not decrease timeout when display is activated, screen not animated, and not paused', () => {
            const base = createBaseDomMock({ 
                radarAnnounce: jest.fn<() => boolean>().mockReturnValue(false),
            });
            player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
            const initialTimeout = (dashboardRadar as any).displayDeactivationTimeout;
            dashboardRadar.animate(false, 100);
            expect((dashboardRadar as any).displayDeactivationTimeout).toBe(initialTimeout);
        });

        test('should decrease timeout when display is activated, screen not animated, and paused', () => {
            const base = createBaseDomMock({
                radarAnnounce: jest.fn<() => boolean>().mockReturnValue(true),
                baseHit: jest.fn<() => boolean>().mockReturnValue(true),
                atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(true),
                getSpritePosition: jest.fn<() => string>(),
                getRadarMessage: jest.fn<() => string>(),
            });
            player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
            player.defeated = jest.fn<() => boolean>().mockReturnValue(true);
            const displayClearSpy = jest.spyOn(dashboardRadar as any, 'displayClear');
            const initialTimeout = (dashboardRadar as any).displayDeactivationTimeout;
            dashboardRadar.animate(false, 0);
            dashboardRadar.animate(false, initialTimeout);
            expect((dashboardRadar as any).displayDeactivationTimeout).toBe(initialTimeout);
            expect(displayClearSpy).toHaveBeenCalled();
        });

        test('should call displayClear when timeout reaches zero', () => {
            const base = createBaseDomMock({
                radarAnnounce: jest.fn<() => boolean>().mockReturnValue(false),
                atomicMissileDetection: jest.fn<() => boolean>().mockReturnValue(true),
            });
            player.getBase = jest.fn<() => BaseDom>().mockReturnValue(base);
            dashboardRadar.animate(true, 0);

            const initialTimeout = (dashboardRadar as any).displayDeactivationTimeout;
            const displayClearSpy = jest.spyOn(dashboardRadar as any, 'displayClear');
            dashboardRadar.animate(true, initialTimeout + 1);
            expect(displayClearSpy).toHaveBeenCalled();
        });
    });
});