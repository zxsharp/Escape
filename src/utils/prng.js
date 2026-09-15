/**
 * Mulberry32 PRNG (Pseudo-Random Number Generator)
 * Produces deterministic 32-bit random floats [0, 1) given a seed string or number.
 */
export function createPRNG(seedInput) {
  let seed = 0;
  if (typeof seedInput === 'number') {
    seed = seedInput;
  } else if (typeof seedInput === 'string') {
    for (let i = 0; i < seedInput.length; i++) {
      seed = (Math.imul(31, seed) + seedInput.charCodeAt(i)) | 0;
    }
  } else {
    seed = Math.floor(Math.random() * 1000000);
  }

  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
