export interface ISeedRandom {
  seed: number;

  number: (min: number, max: number) => number;
  dice: () => number;
  percent: <T>(cases: { percent: number, result: T }[]) => T | undefined;
}

export function createSeedRandom(seed: number): ISeedRandom {
  const rng = mulberry32(seed);

  function number(min: number, max: number) {
    return Math.floor(rng() * (max - min) + min);
  }

  function dice() {
    return number(1, 6 + 1);
  }

  function percent<T>(cases: { percent: number, result: T }[]): T | undefined {
    let total = 0;
    cases.forEach((value) => { total += value.percent })

    let percentage = number(0, total) + 1;

    let probability = 0;
    for (let i = 0; i < cases.length; ++i) {
      const value = cases[i];
      if (!value) continue;

      probability += value.percent;
      if (percentage <= probability) return value.result;
    }

    return undefined;
  }

  return {
    seed,

    number,
    dice,
    percent,
  }
}

function mulberry32(seed: number) {
  return function () {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}