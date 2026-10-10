const e=`
float mHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float mNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(mHash(i), mHash(i + vec3(1, 0, 0)), f.x), mix(mHash(i + vec3(0, 1, 0)), mHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(mHash(i + vec3(0, 0, 1)), mHash(i + vec3(1, 0, 1)), f.x), mix(mHash(i + vec3(0, 1, 1)), mHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float mFbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * mNoise(p);
    p = p * 2.07 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
// Craters on a unit sphere: one jittered bowl per cell, dark inside with a bright rim.
float mCraters(vec3 p, float scale) {
  vec3 s = p * scale;
  vec3 cell = floor(s);
  vec3 f = fract(s);
  float present = step(0.45, mHash(cell + 4.0));
  vec3 centre = vec3(mHash(cell), mHash(cell + 1.3), mHash(cell + 2.6)) * 0.5 + 0.25;
  float radius = 0.16 + 0.14 * mHash(cell + 7.0);
  float dd = length(f - centre);
  float bowl = smoothstep(radius, radius * 0.55, dd);
  float rim = smoothstep(radius * 1.25, radius, dd) * (1.0 - bowl);
  return present * (rim * 0.45 - bowl * 0.5);
}

vec3 moonLayer(vec3 col, vec3 d, vec3 m, float vis, vec3 tint, float R, float haloAmt) {
  float c = dot(d, m);
  if (c < 0.9 || vis < 0.01) return col;
  float ang = acos(clamp(c, -1.0, 1.0));
  // Halo: bright near the limb, falling away softly.
  col += tint * (0.2 * exp(-ang * 1.3 / R) + 0.05 * exp(-ang * 0.4 / R)) * haloAmt * vis;
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), m));
  vec3 up2 = cross(m, right);
  vec2 q = vec2(dot(d, right), dot(d, up2)) / R;
  float r = length(q);
  if (r > 1.04) return col;
  vec3 n = vec3(q, sqrt(max(1.0 - r * r, 0.0)));
  // Surface: pale highlands, darker seas, craters and fine mottling, all fixed to the ball.
  float seas = smoothstep(0.46, 0.64, mFbm(n * 1.9 + 3.0));
  float albedo = mix(0.98, 0.56, seas * 0.8);
  albedo += mCraters(n, 3.2) * 0.4;
  albedo += (mFbm(n * 5.0) - 0.5) * 0.08;
  albedo *= 0.78 + 0.22 * n.z;
  // Lit from one side, so the terminator gives it volume.
  vec3 L = normalize(vec3(-0.62, 0.34, 0.7));
  float lit = smoothstep(-0.04, 0.3, dot(n, L));
  float shade = 0.06 + 0.94 * lit;
  vec3 moon = tint * albedo * shade;
  float body = smoothstep(1.03, 0.97, r);
  // The night side is only a faint tint of the sky, not an opaque disc.
  return mix(col, moon + col * 0.25 * (1.0 - lit), body * vis * mix(0.22, 1.0, lit));
}
`;export{e as M};
