export interface ScreenShakeInterface {
    startShake(remainingBaseHealth: number, radarDisplayTime: number): void;
    animate(millisecondsSinceLastAnimateCall: number): void;
}
