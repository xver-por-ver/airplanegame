import { describe, expect, test } from '@jest/globals';
import { FrameTiming } from '../../src/FrameTiming';

describe('FrameTiming', () => {
  test('preserves elapsed time and rounded frame rate', () => {
    expect(FrameTiming.between(16, 0)).toEqual({
      millisecondsSincePreviousFrame: 16,
      framesPerSecond: 63,
    });
  });

  test('reports zero rate for duplicate timestamps', () => {
    expect(FrameTiming.between(16, 16)).toEqual({
      millisecondsSincePreviousFrame: 0,
      framesPerSecond: 0,
    });
  });
});
