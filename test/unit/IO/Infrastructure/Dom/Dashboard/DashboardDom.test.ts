import {
  describe,
  expect,
  beforeEach,
  afterEach,
  test,
  jest,
} from '@jest/globals';
import { DashboardDom } from '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardDom';
import { PlayerDom } from '../../../../../../src/Player/Infrastructure/Dom/PlayerDom';
import { EnemyDom } from '../../../../../../src/Enemy/Infrastructure/Dom/EnemyDom';
import { resetDocument } from '../../../../../DomDocumentInit';
import { DashboardMagazineDom } from '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardMagazineDom';
import { DashboardRadarDom } from '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardRadarDom';
import { DashboardScoreDom } from '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardScoreDom';
import { EventBus } from '../../../../../../src/IO/Infrastructure/EventBus';
import { GameEvents } from '../../../../../../src/IO/Domain/GameEvents';

jest.mock(
  '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardMagazineDom',
);
jest.mock(
  '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardRadarDom',
);
jest.mock(
  '../../../../../../src/IO/Infrastructure/Dom/Dashboard/DashboardScoreDom',
);

describe('DashboardDom', () => {
  let player: PlayerDom;
  let enemy: EnemyDom;
  let events: EventBus<GameEvents>;

  beforeEach(() => {
    resetDocument();
    player = new PlayerDom() as jest.Mocked<PlayerDom>;
    enemy = new EnemyDom() as jest.Mocked<EnemyDom>;
    events = new EventBus<GameEvents>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('constructor should initialize dashboard components', () => {
    new DashboardDom(player, enemy, events);
    expect(DashboardMagazineDom).toHaveBeenCalledWith(
      player,
      expect.any(Object),
    );
    expect(DashboardRadarDom).toHaveBeenCalledWith(
      player,
      enemy,
      expect.any(Object),
      events,
    );
    expect(DashboardScoreDom).toHaveBeenCalledWith(player, expect.any(Object));
  });

  test('animate should call animate on all dashboard components', () => {
    const dashboard = new DashboardDom(player, enemy, events);
    const animateScreen = true;
    const milliseconds = 16;

    dashboard.animate(animateScreen, milliseconds);

    const magazineInstance = (DashboardMagazineDom as jest.Mock).mock
      .instances[0] as DashboardMagazineDom;
    const radarInstance = (DashboardRadarDom as jest.Mock).mock
      .instances[0] as DashboardRadarDom;
    const scoreInstance = (DashboardScoreDom as jest.Mock).mock
      .instances[0] as DashboardScoreDom;

    expect(magazineInstance.animate).toHaveBeenCalledWith(animateScreen);
    expect(radarInstance.animate).toHaveBeenCalledWith(
      animateScreen,
      milliseconds,
    );
    expect(scoreInstance.animate).toHaveBeenCalled();
  });

  test('getRadarAnouncementDisplayTime should return the radar display time', () => {
    const dashboard = new DashboardDom(player, enemy, events);
    const radarInstance = (DashboardRadarDom as jest.Mock).mock
      .instances[0] as DashboardRadarDom;
    jest.spyOn(radarInstance, 'getDisplayTime').mockReturnValue(1234);

    expect(dashboard.getRadarAnouncementDisplayTime()).toBe(1234);
  });
});
