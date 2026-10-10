import{H as O,e as b,aS as Ie,m as Le,j as Ve,aT as Fe,aU as at,aV as nt,aW as Ee,aL as ne,y as F,ab as K,ai as ce,aM as Pe,B as Se,ax as se,u as ze,au as je,ap as Ke,U as st,aj as Re,ah as Ce,d as Ae,aI as rt,aJ as it,n as lt,am as $e,S as Qe,aB as ct,ae as dt,al as X,ak as k,aE as ge,I as ut,O as Je,ac as Me,az as Ge,aD as _e,P as ht,aF as mt,V as ft,at as De,Q as Te,as as pt,aH as vt,J as wt,aN as gt,D as yt,aX as ke}from"./three.module-B9PKC9r9.js";import{m as xt}from"./BufferGeometryUtils-BU6Eg-JL.js";import{d as Mt,s as bt,b as St,h as Ue,P as Ne}from"./soundscape-DIq6dIOf.js";import{t as de}from"./scenes-sAaqe1oE.js";import"./site-DkAqR7CB.js";const xe=`
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p, int octaves) {
  float a = 0.5;
  float s = 0.0;
  float n = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    s += a * vnoise(p);
    n += a;
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s / n;
}
`,et=`
varying vec2 vUv;
uniform float uFace;
vec3 faceDir() {
  float a = vUv.x * 2.0 - 1.0;
  float b = vUv.y * 2.0 - 1.0;
  vec3 d;
  if (uFace < 0.5) d = vec3(1.0, -b, -a);
  else if (uFace < 1.5) d = vec3(-1.0, -b, a);
  else if (uFace < 2.5) d = vec3(a, 1.0, b);
  else if (uFace < 3.5) d = vec3(a, -1.0, -b);
  else if (uFace < 4.5) d = vec3(a, -b, 1.0);
  else d = vec3(-a, -b, -1.0);
  return normalize(d);
}
`,At=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,Tt=`
${xe}
${et}
uniform float uSea;

vec3 srgb(float r, float g, float b) { return vec3(r, g, b) / 255.0; }

float continents(vec3 p) {
  vec3 w = vec3(vnoise(p * 2.2 + 7.0), vnoise(p * 2.2 + vec3(0.0, 5.0, 0.0)), vnoise(p * 2.2 + vec3(0.0, 0.0, 9.0))) - 0.5;
  float c = fbm(p * 2.3 + w * 1.1, 5);
  // A fine octave breaks coasts into bays, peninsulas and island chains.
  c += (fbm(p * 9.0, 3) - 0.5) * 0.09;
  return c;
}

void main() {
  vec3 p = faceDir();
  float lat = abs(p.y);
  float e = continents(p) - uSea;
  float depth = clamp(-e / 0.2, 0.0, 1.0);
  float land = clamp(e / 0.17, 0.0, 1.0);

  // Land height: broad swells, long ridged ranges where the land is high, rough ground everywhere.
  float ridge = 1.0 - abs(vnoise(p * 5.0 + 3.0) * 2.0 - 1.0);
  ridge *= ridge;
  float ridge2 = 1.0 - abs(vnoise(p * 13.0 + 1.0) * 2.0 - 1.0);
  // Ranges: ridged noise in five octaves gives long crests with branching spurs, and they gather in belts rather than everywhere.
  float crest = 0.0;
  {
    float amp = 0.5;
    vec3 rq = p * 6.0 + 3.0;
    for (int i = 0; i < 5; i++) {
      float n = 1.0 - abs(vnoise(rq) * 2.0 - 1.0);
      crest += amp * n * n;
      rq = rq * 2.1 + vec3(1.3, 7.1, 2.9);
      amp *= 0.5;
    }
    crest /= 0.97;
  }
  float belt = 0.04 + 0.96 * smoothstep(0.52, 0.74, vnoise(p * 3.0 + 8.0));
  float massif = smoothstep(0.15, 0.6, land) * belt;
  float hl = land * 0.3 + massif * crest * 0.8 + (fbm(p * 17.0, 3) - 0.5) * 0.1 * smoothstep(0.03, 0.35, land);
  hl = clamp(hl, 0.0, 1.0);
  float A = e >= 0.0 ? 0.5 + 0.5 * hl : 0.5 - 0.5 * depth;

  float moist = clamp((fbm(p * 4.2 + vec3(4.0, 0.0, 8.0), 4) - 0.5) * 2.6 + 0.5, 0.0, 1.0);
  float polar = lat + (fbm(p * 7.0, 3) - 0.5) * 0.11;
  float temp = 1.0 - pow(lat, 1.5) - hl * 0.45;

  vec3 col;
  if (e < 0.0) {
    float d = depth + (fbm(p * 28.0, 2) - 0.5) * 0.08;
    col = mix(srgb(78.0, 188.0, 200.0), srgb(42.0, 122.0, 184.0), smoothstep(0.0, 0.28, d));
    col = mix(col, srgb(23.0, 72.0, 154.0), smoothstep(0.22, 0.6, d));
    col = mix(col, srgb(15.0, 47.0, 107.0), smoothstep(0.55, 1.0, d));
    // Long pale plumes where rivers and currents stain the shallows.
    col = mix(col, srgb(94.0, 196.0, 176.0), smoothstep(0.72, 0.9, vnoise(p * 21.0)) * (1.0 - smoothstep(0.0, 0.2, d)) * 0.5);
    col = mix(col, srgb(224.0, 238.0, 246.0), smoothstep(0.86, 0.92, polar));
  } else {
    vec3 grass = srgb(98.0, 160.0, 70.0);
    vec3 meadow = srgb(142.0, 184.0, 87.0);
    vec3 forest = srgb(38.0, 104.0, 58.0);
    vec3 deepForest = srgb(26.0, 82.0, 48.0);
    vec3 savanna = srgb(190.0, 174.0, 88.0);
    vec3 desert = srgb(216.0, 174.0, 99.0);
    vec3 redDesert = srgb(196.0, 132.0, 84.0);
    vec3 rock = srgb(124.0, 116.0, 106.0);
    vec3 darkRock = srgb(88.0, 82.0, 76.0);
    vec3 snow = srgb(242.0, 246.0, 250.0);
    vec3 tundra = srgb(170.0, 186.0, 176.0);
    vec3 beach = srgb(236.0, 219.0, 166.0);

    // Plains: meadow to forest by moisture; savanna and desert where it is dry.
    col = mix(meadow, grass, smoothstep(0.2, 0.42, moist));
    col = mix(col, forest, smoothstep(0.42, 0.66, moist));
    col = mix(col, deepForest, smoothstep(0.8, 1.0, moist) * 0.7);
    // A few real deserts in the subtropics, a thin savanna fringe where it is merely dry; most land stays green.
    float arid = smoothstep(0.72, 0.86, vnoise(p * 2.1 + 11.0)) * smoothstep(0.08, 0.2, lat) * (1.0 - smoothstep(0.34, 0.52, lat));
    float dry = max(smoothstep(0.14, 0.04, moist) * 0.55, arid) * (1.0 - smoothstep(0.45, 0.65, lat));
    vec3 sand = mix(desert, redDesert, smoothstep(0.4, 0.7, vnoise(p * 9.0 + 5.0)));
    // Dunes: long soft streaks in the sand.
    sand *= 0.93 + 0.14 * vnoise(vec3(p.x * 80.0, p.y * 22.0, p.z * 80.0));
    col = mix(col, savanna, smoothstep(0.0, 0.7, dry) * 0.8);
    col = mix(col, sand, smoothstep(0.6, 1.0, dry));
    // Farmland: a patchwork over the gentle, wet plains.
    // Highlands: forest thins to rock, rock to snow.
    float strata = vnoise(vec3(p.x * 40.0, p.y * 90.0, p.z * 40.0));
    // Hypsometric tint: green lowlands, dry brown foothills, grey rock, white above the snow line.
    vec3 foothill = srgb(128.0, 134.0, 88.0);
    col = mix(col, foothill, smoothstep(0.4, 0.6, hl) * 0.55);
    vec3 high = mix(rock, darkRock, strata * 0.8 + ridge * 0.3);
    col = mix(col, high, smoothstep(0.6, 0.78, hl));
    col = mix(col, snow, smoothstep(0.76, 0.92, hl + (strata - 0.5) * 0.1 - smoothstep(0.5, 1.0, temp) * 0.05));
    col = mix(col, tundra, smoothstep(0.2, 0.05, temp) * smoothstep(0.62, 0.78, lat) * (1.0 - smoothstep(0.5, 0.65, hl)));
    // Rivers wind down from the high ground; lakes fill some basins.
    float river = 1.0 - smoothstep(0.0, 0.011, abs(vnoise(p * 7.5 + vec3(1.0, 0.0, 2.0)) - 0.5) + (fbm(p * 30.0, 2) - 0.5) * 0.004);
    float river2 = 1.0 - smoothstep(0.0, 0.007, abs(vnoise(p * 15.0 + vec3(5.0, 3.0, 1.0)) - 0.5));
    float lake = smoothstep(0.84, 0.88, vnoise(p * 10.0 + 5.0)) * smoothstep(0.35, 0.12, hl);
    float rivers = max(river, river2 * 0.8) * smoothstep(0.03, 0.12, hl) * (1.0 - smoothstep(0.55, 0.7, hl)) * (1.0 - smoothstep(0.8, 0.9, polar));
    // (rivers, lakes and fields are drawn per pixel, in the lit pass)
    // Where the land meets the sea.
    col = mix(beach, col, smoothstep(0.0, 0.045, hl) * 0.96 + 0.04);
    col = mix(col, srgb(224.0, 232.0, 238.0), smoothstep(0.84, 0.9, polar));
  }
  gl_FragColor = vec4(col, A);
}
`,Pt=`
${xe}
${et}
uniform samplerCube uMap;
uniform vec3 uStorm;
uniform vec3 uStormA;
uniform vec3 uStormB;
uniform float uHasStorm;

void main() {
  vec3 p = faceDir();
  float lat = abs(p.y);

  vec3 w = vec3(vnoise(p * 1.8 + 3.0), vnoise(p * 1.8 + vec3(0.0, 6.0, 0.0)), vnoise(p * 1.8 + 9.0)) - 0.5;
  float cl = fbm(p * 6.0 + w * 3.2, 6);
  // Belts of weather: a band of towering cloud at the equator, storm tracks in the mid-latitudes, clear dry horse latitudes between.
  cl += 0.07 * cos(lat * 11.0) - 0.03;
  // Scattered cumulus: small separate patches among the big systems, all round the globe.
  cl += (fbm(p * 12.0 + w * 4.0, 3) - 0.5) * 0.11;

  // A great spiral storm: arms winding in around a clear eye.
  if (uHasStorm > 0.5) {
    float dotc = dot(p, uStorm);
    float r = acos(clamp(dotc, -1.0, 1.0));
    if (r < 0.2) {
      vec3 u = p - uStorm * dotc;
      float theta = atan(dot(u, uStormB), dot(u, uStormA));
      float arm = pow(0.5 + 0.5 * cos(2.0 * theta - r * 38.0 + 2.0 * fbm(p * 20.0, 2)), 1.4);
      float mask = smoothstep(0.2, 0.04, r);
      cl += mask * (0.7 * arm - 0.3) - 0.55 * smoothstep(0.04, 0.012, r);
    }
  }

  float cirrus = fbm(vec3(p.x * 2.5, p.y * 14.0, p.z * 2.5) + w * 2.0, 4);

  // Lights: dense along coasts and rivers on low ground, in clusters, with a sparkle of single lamps.
  vec4 m = texture(uMap, p);
  float hl = max(m.a - 0.5, 0.0) * 2.0;
  float isLand = step(0.5, m.a);
  float lowland = smoothstep(0.55, 0.15, hl) * smoothstep(0.005, 0.04, hl) * (1.0 - smoothstep(0.7, 0.85, lat));
  float region = fbm(p * 6.0 + vec3(2.0, 1.0, 5.0), 4);
  float metro = smoothstep(0.5, 0.72, region);
  float grid = step(0.62, hash13(floor(p * 560.0)));
  float core = smoothstep(0.66, 0.82, fbm(p * 22.0 + 4.0, 3)) * metro;
  float lights = isLand * lowland * (metro * (0.35 + 0.65 * grid) * 0.8 + core);

  gl_FragColor = vec4(cl, lights, cirrus, 1.0);
}
`,zt=`
uniform samplerCube uMap;
uniform float uRadius;
uniform float uRelief;
varying vec3 vDir;
varying vec3 vW;
void main() {
  vec3 d = normalize(position);
  float a = textureLod(uMap, d, 1.0).a;
  float h = max(a - 0.5, 0.0) * 2.0 * uRelief;
  vec3 p = d * (uRadius + h);
  vDir = d;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,Rt=`
${xe}
uniform samplerCube uMap;
uniform samplerCube uAir;
uniform mat3 uModel;
uniform vec3 uSun;
uniform vec3 uSunColor;
uniform vec3 uNight;
uniform float uCloudAngle;
uniform float uCloudHeight;
uniform float uRadius;
uniform float uRelief;
varying vec3 vDir;
varying vec3 vW;

vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}
// A turned copy of the sphere's coordinates, so layers of noise do not all line up on the same grid.
vec3 turn(vec3 v) {
  return vec3(0.36 * v.x + 0.48 * v.y - 0.8 * v.z, -0.8 * v.x + 0.6 * v.y, 0.48 * v.x + 0.64 * v.y + 0.6 * v.z);
}

void main() {
  vec3 d0 = normalize(vDir);
  float dist = length(cameraPosition - vW);
  float detailFade = 1.0 - smoothstep(80.0, 260.0, dist);
  // Wobble where we look the map up: shorelines, rivers and ridges lose the straight edges between texels.
  vec3 wob = vec3(vnoise(d0 * 210.0), vnoise(d0 * 210.0 + 4.0), vnoise(d0 * 210.0 + 8.0)) - 0.5;
  vec3 d = normalize(d0 + wob * 0.0016 * detailFade);
  vec4 m = texture(uMap, d);
  vec3 col = m.rgb;
  float A = m.a;
  bool water = A < 0.5;
  vec3 up = abs(d.y) > 0.98 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(d, up));
  vec3 t2 = cross(d, t1);
  vec3 sunL = uSun * uModel;

  // Fine detail, faded with distance so it never shimmers: it is what keeps the ground crisp from up close.
  float dn = vnoise(turn(d) * 150.0) * 0.45 + vnoise(turn(d) * 430.0 + 7.0) * 0.35 + vnoise(d * 1100.0 + 3.0) * 0.2;
  col *= 1.0 + (dn - 0.5) * mix(0.3, 0.06, smoothstep(0.508, 0.492, A)) * detailFade;
  float hl = max(A - 0.5, 0.0) * 2.0;
  float lat = abs(d.y);
  if (!water) {
    // Fields: irregular patches of crop and fallow over the greener lowlands.
    float green = smoothstep(1.05, 1.4, col.g / max(col.r, 0.02));
    vec3 fw = turn(d) * 120.0 + (vec3(vnoise(d * 55.0), vnoise(d * 55.0 + 5.0), vnoise(d * 55.0 + 9.0)) - 0.5) * 4.0;
    float fieldPatch = vnoise(fw);
    float farmland = green * smoothstep(0.3, 0.1, hl) * smoothstep(0.38, 0.55, vnoise(d * 6.0 + 2.0)) * detailFade;
    vec3 crop = mix(col * vec3(0.82, 0.96, 0.7), col * vec3(1.45, 1.2, 0.62), smoothstep(0.4, 0.62, fieldPatch));
    col = mix(col, crop, farmland * 0.8);
    // Rivers: thin and brisk in the hills, widening toward the coast and opening into the sea. Lakes sit in basins well inland.
    float meander = (vnoise(d * 90.0) - 0.5) * 0.012 + (vnoise(d * 230.0) - 0.5) * 0.004;
    float downstream = 1.0 - smoothstep(0.0, 0.45, hl);
    float width = mix(0.005, 0.02, downstream * downstream);
    float river = 1.0 - smoothstep(width * 0.45, width, abs(vnoise(d * 7.5 + vec3(1.0, 0.0, 2.0)) - 0.5 + meander));
    float river2 = 1.0 - smoothstep(width * 0.3, width * 0.65, abs(vnoise(d * 15.0 + vec3(5.0, 3.0, 1.0)) - 0.5 + meander * 0.7));
    float source = 1.0 - smoothstep(0.5, 0.68, hl);
    float rivers = max(river, river2 * 0.85) * source * (1.0 - smoothstep(0.8, 0.9, lat));
    // A lake needs land on every side, a good way off: sample the map a short distance each way.
    float lakeReach = 0.032;
    float inland = min(
      min(texture(uMap, normalize(d + t1 * lakeReach)).a, texture(uMap, normalize(d - t1 * lakeReach)).a),
      min(texture(uMap, normalize(d + t2 * lakeReach)).a, texture(uMap, normalize(d - t2 * lakeReach)).a)
    );
    float lakeShape = smoothstep(0.82, 0.85, vnoise(d * 11.0 + 5.0) + (vnoise(d * 60.0) - 0.5) * 0.04);
    float lake = lakeShape * smoothstep(0.52, 0.56, inland) * smoothstep(0.06, 0.14, hl) * smoothstep(0.5, 0.3, hl);
    float lakeRim = lakeShape * smoothstep(0.52, 0.56, inland) * smoothstep(0.06, 0.14, hl) * smoothstep(0.5, 0.3, hl) * (1.0 - smoothstep(0.85, 0.87, vnoise(d * 11.0 + 5.0)));
    vec3 riverColor = mix(vec3(0.2, 0.5, 0.74), vec3(0.27, 0.62, 0.78), downstream);
    col = mix(col, vec3(0.5, 0.62, 0.42), lakeRim * 0.35);
    col = mix(col, riverColor, rivers * 0.92);
    col = mix(col, vec3(0.16, 0.42, 0.66), lake * 0.95);
  }

  if (water && A > 0.45) {
    float meanderW = (vnoise(d * 90.0) - 0.5) * 0.012 + (vnoise(d * 230.0) - 0.5) * 0.004;
    float mouth = 1.0 - smoothstep(0.009, 0.02, abs(vnoise(d * 7.5 + vec3(1.0, 0.0, 2.0)) - 0.5 + meanderW));
    float mouth2 = 1.0 - smoothstep(0.006, 0.013, abs(vnoise(d * 15.0 + vec3(5.0, 3.0, 1.0)) - 0.5 + meanderW * 0.7));
    col = mix(col, vec3(0.38, 0.7, 0.74), max(mouth, mouth2 * 0.85) * smoothstep(0.45, 0.495, A) * 0.55);
  }

  // Relief from the height map: slope along two tangents.
  float eps = 0.0045;
  float h1 = textureLod(uMap, normalize(d + t1 * eps), 1.5).a - textureLod(uMap, normalize(d - t1 * eps), 1.5).a;
  float h2 = textureLod(uMap, normalize(d + t2 * eps), 1.5).a - textureLod(uMap, normalize(d - t2 * eps), 1.5).a;
  float k = water ? 0.0 : 1.8 * (uRelief * 2.0) / (2.0 * eps * uRadius);
  vec3 slope = (t1 * h1 + t2 * h2) * k;
  // Fine relief on the hills: the slope of a small noise field, so ridges have texture the map cannot hold.
  float step0 = 0.0007;
  float r0 = vnoise(turn(d) * 300.0);
  float r1 = vnoise(turn(normalize(d + t1 * step0)) * 300.0);
  float r2 = vnoise(turn(normalize(d + t2 * step0)) * 300.0);
  slope += (t1 * (r1 - r0) + t2 * (r2 - r0)) / step0 * 0.0006 * smoothstep(0.08, 0.5, hl) * detailFade * (water ? 0.0 : 1.0);
  vec3 nLocal = normalize(d - slope);
  vec3 n = normalize(uModel * nLocal);
  vec3 s = normalize(uModel * d);
  vec3 v = normalize(cameraPosition - vW);

  float lit = dot(s, uSun);
  float day = smoothstep(-0.04, 0.2, lit);
  float f = dot(n, uSun);
  float diff = clamp(f, 0.0, 1.0);
  // Lit mostly smoothly, with a touch of poster-like stepping to keep the hand-made look.
  float stepped = floor(diff * 4.0 + 0.5) / 4.0;
  float shade = 0.4 + 0.72 * mix(diff, stepped, 0.55);
  // Ridges throw shadows across the valleys when the sun is low: march toward the sun along the height map.
  float peakShadow = 0.0;
  if (!water) {
    vec3 sT = sunL - d * dot(sunL, d);
    float sLen = length(sT);
    float cosZ = dot(d, sunL);
    if (sLen > 1e-4 && cosZ > 0.0) {
      sT /= sLen;
      float tanE = min(cosZ / sqrt(max(1.0 - cosZ * cosZ, 0.001)), 6.0);
      float h0 = hl * uRelief;
      for (int i = 1; i <= 6; i++) {
        float run = 0.0025 * pow(float(i), 1.7);
        float hq = max(textureLod(uMap, normalize(d + sT * run), 0.5).a - 0.5, 0.0) * 2.0 * uRelief;
        peakShadow = max(peakShadow, smoothstep(0.0, 2.5, hq - h0 - run * uRadius * tanE));
      }
    }
  }
  shade *= 1.0 - 0.6 * peakShadow;

  // Shadows of the clouds, thrown toward the sun's opposite side.
  float cosS = max(dot(d, sunL), 0.2);
  vec3 q = normalize(d + sunL * (uCloudHeight / uRadius) / cosS);
  float shadowDensity = texture(uAir, rotY(q, -uCloudAngle)).r;
  float shadow = smoothstep(0.52, 0.64, shadowDensity) * 0.3 * smoothstep(0.15, 0.5, lit);

  vec3 dayCol = col * shade * uSunColor * (1.0 - shadow * vec3(0.8, 0.75, 0.55));
  vec3 nightCol = col * uNight;
  vec3 outc = mix(nightCol, dayCol, day);

  // The line between day and night burns orange.
  float band = exp(-pow(lit / 0.1, 2.0));
  outc = mix(outc, outc * vec3(1.55, 0.82, 0.58) + vec3(0.1, 0.03, 0.0), band * 0.7);

  // A hard little glint of the sun on open water.
  if (water && dot(col, vec3(0.33)) < 0.7) {
    vec3 r = reflect(-uSun, s);
    float spec = pow(max(dot(r, v), 0.0), 900.0) * day;
    outc += vec3(1.0, 0.94, 0.78) * smoothstep(0.08, 0.7, spec) * 0.85;
    float broad = pow(max(dot(r, v), 0.0), 60.0) * day;
    outc += vec3(0.5, 0.42, 0.28) * broad * 0.18;
  }

  // Lights of the cities, hidden under cloud.
  float lights = texture(uAir, d).g;
  float cover = smoothstep(0.5, 0.62, texture(uAir, rotY(d, -uCloudAngle)).r);
  float night = smoothstep(0.04, -0.2, lit);
  // Up close the glow breaks into single lamps; far away it stays a soft sprawl.
  vec3 lp = d * 800.0;
  vec3 lid = floor(lp);
  vec3 lf = fract(lp) - 0.5;
  vec3 loff = (vec3(hash13(lid + 1.3), hash13(lid + 2.7), hash13(lid + 4.1)) - 0.5) * 0.5;
  float lampDot = smoothstep(0.3, 0.0, length(lf - loff)) * step(0.5, hash13(lid));
  float lamp = lights * mix(1.0, 0.15 + 3.2 * lampDot, detailFade);
  outc += vec3(1.0, 0.7, 0.34) * lamp * night * (1.0 - cover) * 2.4;

  // Air thickening toward the limb.
  float fr = pow(1.0 - max(dot(s, v), 0.0), 3.6);
  vec3 haze = mix(vec3(0.04, 0.09, 0.2), vec3(0.34, 0.62, 1.0), day) + vec3(1.0, 0.45, 0.2) * band * 0.35;
  outc += haze * fr * 0.7;

  gl_FragColor = vec4(outc, 1.0);
}
`,Ct=`
uniform samplerCube uAir;
uniform float uRadius0;
uniform float uLift;
uniform float uLayer;
varying vec3 vDir;
varying vec3 vW;
void main() {
  vDir = normalize(position);
  // The tops of thick cloud stand up from the deck, more so in the upper layers: that is what gives the horizon a ragged, deep edge.
  float dens = textureLod(uAir, vDir, 1.0).r;
  float lift = smoothstep(0.5, 0.8, dens) * uLift * (0.3 + 0.7 * uLayer);
  vec4 world = modelMatrix * vec4(vDir * (uRadius0 + lift), 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,It=`
${xe}
uniform samplerCube uAir;
uniform mat3 uModel;
uniform vec3 uSun;
uniform vec3 uSunCloud;
uniform vec3 uSunColor;
uniform vec3 uNight;
uniform float uCloudAngle;
uniform float uLayer;
varying vec3 vDir;
varying vec3 vW;
vec3 rotY(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}
void main() {
  vec3 d = normalize(vDir);
  float dist = length(cameraPosition - vW);
  vec4 a = texture(uAir, d);
  float fineFade = 1.0 - smoothstep(60.0, 220.0, dist);
  float fine = ((vnoise(d * 160.0) - 0.5) * 0.05 + (vnoise(d * 420.0) - 0.5) * 0.03) * fineFade;
  float dens = a.r + fine;
  // Each layer needs a little more density than the one below, so the deck is widest at the bottom and the cores rise highest.
  float body = smoothstep(0.52, 0.6, dens) * 0.95;
  float veil = uLayer < 0.01 ? smoothstep(0.58, 0.85, a.b) * 0.3 * (1.0 - body) : 0.0;
  float alpha = max(body, veil);
  if (alpha < 0.01) discard;

  vec3 s = normalize(uModel * rotY(d, uCloudAngle));
  vec3 v = normalize(cameraPosition - vW);
  float lit = dot(s, uSun);
  float day = smoothstep(-0.04, 0.2, lit);

  // Tops catch the sun: compare the density here with the density a little toward the sun.
  float toward = texture(uAir, normalize(d + uSunCloud * 0.0035)).r;
  float away = texture(uAir, normalize(d - uSunCloud * 0.0035)).r;
  float relief = clamp((dens - toward) * 12.0 + (away - dens) * 5.0, -0.35, 0.35);
  float thick = smoothstep(0.58, 0.82, dens);
  // Lower layers sit in the shade of the ones above; the highest tops catch the most light.
  float shade = 0.94 + 0.08 * thick - 0.2 * relief * (1.0 - veil);
  shade = floor(shade * 5.0 + 0.5) / 5.0 * 0.6 + shade * 0.4;

  vec3 dayCol = vec3(0.97, 0.98, 1.0) * shade * uSunColor;
  vec3 col = mix(uNight, dayCol, day);
  float band = exp(-pow(lit / 0.1, 2.0));
  col = mix(col, col * vec3(1.5, 0.85, 0.6) + vec3(0.08, 0.03, 0.0), band * 0.7);
  float fr = pow(1.0 - max(dot(s, v), 0.0), 2.4);
  vec3 haze = mix(vec3(0.04, 0.09, 0.2), vec3(0.32, 0.58, 0.98), day);
  col += haze * fr * 0.3;
  // Seen edge-on at the horizon the stacked layers would read as lines; a little noise per layer turns them into soft depth.
  float grain = hash13(vec3(gl_FragCoord.xy, uLayer * 13.0 + 1.0));
  // Cloud seen edge-on is a flat plate: dissolve it before it can become one, so the horizon is carried by the lifted tops.
  alpha *= smoothstep(0.05, 0.3, max(dot(s, v), 0.0));
  alpha *= 1.0 - 0.2 * smoothstep(0.5, 0.95, fr) * grain;
  gl_FragColor = vec4(col, alpha);
}
`,ae=600,le=new b(0,-660,0),Lt=10,qe=11,Be=0,Vt=4,Ft=`
varying vec3 vWorld;
uniform vec3 uCenter;
uniform float uPlanet;
uniform vec3 uSun;
void main() {
  vec3 ro = cameraPosition - uCenter;
  vec3 rd = normalize(vWorld - cameraPosition);
  float tc = -dot(ro, rd);
  if (tc <= 0.0) discard;
  vec3 closest = ro + rd * tc;
  float b = length(closest);
  // Rays that strike the ground are the planet's own business; this is only the air seen past its edge.
  if (b <= uPlanet) discard;
  float h = b - uPlanet;
  // Air thins exponentially with height: a hard bright line at the limb, a soft glow above it, nothing beyond.
  float core = exp(-h / 2.4);
  float halo = exp(-h / 9.0) * 0.35;
  float lit = dot(normalize(closest), uSun);
  float day = smoothstep(-0.15, 0.35, lit);
  float band = exp(-pow(lit / 0.12, 2.0));
  vec3 low = mix(vec3(0.1, 0.2, 0.42), vec3(0.62, 0.88, 1.0), day);
  vec3 high = mix(vec3(0.03, 0.07, 0.2), vec3(0.2, 0.46, 1.0), day);
  vec3 col = mix(low, high, smoothstep(0.0, 9.0, h));
  col = mix(col, vec3(1.0, 0.55, 0.22), band * 0.7);
  float strength = (core * 0.9 + halo) * (0.18 + 0.82 * day + band * 0.5);
  gl_FragColor = vec4(col * strength, 1.0);
}
`,Et=`
attribute float aV;
attribute float aPhi;
uniform vec3 uSun;
varying float vV;
varying float vPhi;
varying float vNight;
void main() {
  vV = aV;
  vPhi = aPhi;
  vec3 s = normalize(mat3(modelMatrix) * normalize(position));
  vNight = smoothstep(0.05, -0.25, dot(s, uSun));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Gt=`
uniform float uTime;
varying float vV;
varying float vPhi;
varying float vNight;
void main() {
  float fold = sin(vPhi * 23.0 + uTime * 0.35 + sin(vPhi * 7.0 - uTime * 0.17) * 2.2);
  float curtain = pow(0.5 + 0.5 * fold, 2.2);
  float patchy = 0.55 + 0.45 * sin(vPhi * 5.0 + uTime * 0.12);
  float body = pow(1.0 - vV, 1.5) * smoothstep(0.0, 0.1, vV);
  vec3 col = mix(vec3(0.15, 1.0, 0.5), vec3(0.65, 0.3, 1.0), pow(vV, 1.3));
  float a = body * curtain * patchy * vNight * 1.5;
  gl_FragColor = vec4(col * a, 1.0);
}
`;function We(e,o,s,n){const r=new ne({vertexShader:At,fragmentShader:s,uniforms:{uFace:{value:0},...n},depthTest:!1,depthWrite:!1}),f=new je(2,2),l=new F(f,r);l.frustumCulled=!1;const c=new Ke;c.add(l);const m=new st(-1,1,1,-1,0,1),v=e.getRenderTarget();e.setRenderTarget(o);const x=e.compileAsync(c,m);return e.setRenderTarget(v),{ready:x,run(){const I=e.getRenderTarget();for(let L=0;L<6;L++)r.uniforms.uFace.value=L,e.setRenderTarget(o,L),e.render(c,m);e.setRenderTarget(I),f.dispose(),r.dispose()}}}async function _t(e,o,s={}){const n=new O;n.position.copy(le);const r=typeof matchMedia=="function"&&matchMedia("(pointer: coarse)").matches,f=r?512:1536,l=r?384:768,c=e.own(new Ie(f,{type:at,format:Fe,generateMipmaps:!0,minFilter:Ve,magFilter:Le})),m=e.own(new Ie(l,{type:nt,format:Fe,generateMipmaps:!0,minFilter:Ve,magFilter:Le})),v=We(o,c,Tt,{uSea:{value:.5}}),x=s.storm?.clone().normalize()??new b(0,1,0),I=new b().crossVectors(x,Math.abs(x.y)>.9?new b(1,0,0):new b(0,1,0)).normalize(),L=new b().crossVectors(x,I),i=We(o,m,Pt,{uMap:{value:c.texture},uStorm:{value:x},uStormA:{value:I},uStormB:{value:L},uHasStorm:{value:s.storm?1:0}});await Promise.all([v.ready,i.ready]),v.run(),i.run();const t={value:new Ee},y={value:new b(0,1,0)},u={value:new b(1,1,1)},h={value:0},w=e.own(new ne({vertexShader:zt,fragmentShader:Rt,uniforms:{uMap:{value:c.texture},uAir:{value:m.texture},uModel:t,uSun:y,uSunColor:u,uNight:{value:new b(.2,.25,.4)},uCloudAngle:h,uCloudHeight:{value:qe+Be*.5},uRadius:{value:ae},uRelief:{value:Lt}}})),p=new F(e.own(new K(1,256,128)),w);p.frustumCulled=!1,n.add(p);const S=new O;n.add(S);const a={value:new b(0,1,0)},g=1,M=e.own(new K(1,256,128));for(let W=0;W<g;W++){const j=e.own(new ne({vertexShader:Ct,fragmentShader:It,uniforms:{uAir:{value:m.texture},uModel:t,uCloudAngle:h,uSun:y,uSunCloud:a,uSunColor:u,uNight:{value:new b(.12,.15,.27)},uLayer:{value:0},uRadius0:{value:ae+qe+0*Be},uLift:{value:Vt}},transparent:!0,depthWrite:!1})),d=new F(M,j);d.frustumCulled=!1,d.renderOrder=2+W,S.add(d)}const E=ae+26,U=e.own(new ne({vertexShader:"varying vec3 vWorld; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",fragmentShader:Ft,uniforms:{uCenter:{value:le.clone()},uPlanet:{value:ae},uSun:y},side:Pe,transparent:!0,depthWrite:!1,blending:ce})),z=new F(e.own(new K(E,64,32)),U);z.position.copy(le),z.renderOrder=5,z.frustumCulled=!1;const T=[],V=[],P=[],R=160;for(const W of[-1,1])for(let C=0;C<R;C++){const j=C/R*Math.PI*2,d=(C+1)/R*Math.PI*2,A=(q,G)=>{const Z=1.17+.05*Math.sin(q*3+1)+.03*Math.sin(q*7),ee=ae+5+G*42;return[Math.cos(q)*Math.cos(Z)*ee,W*Math.sin(Z)*ee,Math.sin(q)*Math.cos(Z)*ee]},N=[[j,0],[d,0],[d,1],[j,0],[d,1],[j,1]];for(const[q,G]of N)T.push(...A(q,G)),V.push(G),P.push(q)}const _=e.own(new Se);_.setAttribute("position",new se(T,3)),_.setAttribute("aV",new se(V,1)),_.setAttribute("aPhi",new se(P,1));const B=e.own(new ne({vertexShader:Et,fragmentShader:Gt,uniforms:{uSun:y,uTime:{value:0}},transparent:!0,depthWrite:!1,side:ze,blending:ce})),$=new F(_,B);$.frustumCulled=!1,n.add($);const D=new O;D.add(n,z);const Y=new Ee;return{root:D,spin:n,clouds:S,update({sun:W,sunColor:C,time:j}){y.value.copy(W),u.value.set(...C),B.uniforms.uTime.value=j,n.updateMatrixWorld(!0),t.value.setFromMatrix4(n.matrixWorld),h.value=S.rotation.y,Y.copy(t.value).invert(),a.value.copy(W).applyMatrix3(Y);const d=Math.cos(-S.rotation.y),A=Math.sin(-S.rotation.y),{x:N,y:q,z:G}=a.value;a.value.set(d*N+A*G,q,-A*N+d*G)}}}const Dt=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,kt=`
varying vec2 vUv;
uniform float uAlpha;
void main() {
  // The head is at uv.y = 1; the tail fades to nothing behind it and the edges fall off quickly.
  float along = pow(vUv.y, 2.2);
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float head = smoothstep(0.93, 1.0, vUv.y);
  vec3 col = mix(vec3(1.0, 0.5, 0.2), vec3(1.0, 0.95, 0.85), head);
  gl_FragColor = vec4(col * (along * across * across * 0.9 + head * across) * uAlpha, 1.0);
}
`;function Ut(e){const o=new O,s=(u,h)=>u+Math.random()*(h-u),n=e.glow([[0,"rgba(255,255,255,1)"],[.2,"rgba(190,210,255,0.75)"],[.55,"rgba(120,150,255,0.18)"],[1,"rgba(0,0,0,0)"]]),r=Array.from({length:3},()=>{const u=new Re(e.own(new Ce({map:n,blending:ce,depthWrite:!1,transparent:!0,opacity:0})));return u.visible=!1,o.add(u),{sprite:u,age:99,life:1,size:20,pulses:[0,.18,.31]}});let f=3;const l=new b,c=e.own(new je(1,1));c.translate(0,-.5,0);const m=Array.from({length:3},()=>{const u=e.own(new ne({vertexShader:Dt,fragmentShader:kt,uniforms:{uAlpha:{value:0}},transparent:!0,depthWrite:!1,blending:ce,side:ze})),h=new F(c,u);return h.visible=!1,h.frustumCulled=!1,o.add(h),{mesh:h,material:u,age:99,life:1,from:new b,vel:new b,length:10}});let v=6;const x=new Ae,I=new b,L=new b,i=new b,t=new b,y=(u,h,w)=>{const p=s(h,w),S=s(0,Math.PI*2);return u.set(Math.sin(p)*Math.cos(S),-Math.cos(p),Math.sin(p)*Math.sin(S)*.9-Math.sin(p)*.25),u.normalize()};return{group:o,update(u,h,w,p,S){if(f-=h,f<=0){f=s(2.5,9);const a=r.find(g=>g.age>g.life);if(a){for(let g=0;g<8;g++)if(y(l,.04,.42),l.dot(w)<-.08||g===7&&l.dot(w)<.2){a.sprite.position.copy(l).multiplyScalar(ae+7).add(le),a.age=0,a.life=.7,a.size=s(16,34),a.pulses=[0,s(.12,.2),s(.26,.4)],a.sprite.visible=!0,l.dot(w)<-.08&&S("lightning");break}}}for(const a of r){if(a.age+=h,a.age>a.life){a.sprite.visible=!1;continue}let g=0;for(let M=0;M<a.pulses.length;M++){const E=a.age-a.pulses[M];E>0&&(g=Math.max(g,Math.exp(-E*14)*(M===0?1:.7)))}a.sprite.material.opacity=g,a.sprite.scale.setScalar(a.size*(.8+g*.4))}if(v-=h,v<=0){v=s(14,38);const a=m.find(g=>g.age>g.life);if(a){y(l,.08,.34),a.from.copy(l).multiplyScalar(ae+48).add(le);const g=new b(-l.z,0,l.x).normalize().multiplyScalar(Math.random()<.5?1:-1);a.vel.copy(g).multiplyScalar(.8).addScaledVector(l,-.55).normalize().multiplyScalar(s(95,140)),a.age=0,a.life=s(.8,1.2),a.length=s(10,18),a.mesh.visible=!0}}for(const a of m){if(a.age+=h,a.age>a.life){a.mesh.visible=!1;continue}const g=a.age/a.life;t.copy(a.from).addScaledVector(a.vel,a.age),i.copy(a.vel).normalize(),L.copy(p).sub(t).normalize(),I.crossVectors(i,L).normalize(),x.makeBasis(I.multiplyScalar(.28),i.multiplyScalar(a.length),L),x.setPosition(t),a.mesh.matrixAutoUpdate=!1,a.mesh.matrix.copy(x),a.material.uniforms.uAlpha.value=Math.sin(g*Math.PI)*.95}}}}function Nt(e){if(!e.index)return e.computeVertexNormals(),e;const o=e.toNonIndexed();return e.dispose(),o.computeVertexNormals(),o}function qt(e=11){const o=[],s=f=>(o.push(f),f),n=s(new rt(new Uint8Array([70,140,205,255]),4,1,it));n.minFilter=n.magFilter=lt,n.needsUpdate=!0;let r=e;return{own:s,toon:(f,l={})=>s(new ct({color:f,emissive:l.emissive??"#000000",...l.map?{map:l.map}:{},vertexColors:l.vertexColors??!1,gradientMap:n})),glow(f){const l=document.createElement("canvas");l.width=l.height=128;const c=l.getContext("2d"),m=c.createRadialGradient(64,64,0,64,64,64);for(const[x,I]of f)m.addColorStop(x,I);c.fillStyle=m,c.fillRect(0,0,128,128);const v=s(new $e(l));return v.colorSpace=Qe,v},rand:()=>(r=r*16807%2147483647)/2147483647,dispose(){for(const f of o)f.dispose()}}}const Bt=(e,o,s,n)=>{let r=Math.imul(e,374761393)+Math.imul(o,668265263)+Math.imul(s,1274126177)+Math.imul(n,1103515245)|0;return r=Math.imul(r^r>>>13,1274126177),r^=r>>>16,(r>>>0)/4294967295};function Wt(e,o,s,n=0){const r=Math.floor(e),f=Math.floor(o),l=Math.floor(s),c=e-r,m=o-f,v=s-l,x=c*c*(3-2*c),I=m*m*(3-2*m),L=v*v*(3-2*v),i=(S,a,g)=>Bt(r+S,f+a,l+g,n),t=i(0,0,0)+(i(1,0,0)-i(0,0,0))*x,y=i(0,1,0)+(i(1,1,0)-i(0,1,0))*x,u=i(0,0,1)+(i(1,0,1)-i(0,0,1))*x,h=i(0,1,1)+(i(1,1,1)-i(0,1,1))*x,w=t+(y-t)*I,p=u+(h-u)*I;return w+(p-w)*L}function Oe(e,o,s,n,r=0){let f=0,l=.5,c=0;for(let m=0;m<n;m++)f+=l*Wt(e,o,s,r+m*17),c+=l,e*=2.03,o*=2.03,s*=2.03,l*=.5;return f/c}const tt=(e,o,s)=>Math.min(Math.max(e,o),s),me=(e,o,s)=>e+(o-e)*s,ye=(e,o,s)=>{const n=tt((s-e)/(o-e),0,1);return n*n*(3-2*n)},fe=Math.PI*2,Ot=(e,o)=>{const s=e*Math.PI/180,n=o*Math.PI/180;return new b(Math.sin(s)*Math.cos(n),Math.sin(n),-Math.cos(s)*Math.cos(n))};function Xt(e,o){const s=document.createElement("canvas");s.width=128,s.height=64;const n=s.getContext("2d");n.fillStyle="#1b3573",n.fillRect(0,0,128,64),n.fillStyle="#2a4b95";for(let f=0;f<o;f++)for(let l=0;l<4;l++)n.fillRect(f*128/o+2,l*16+2,128/o-4,12);n.strokeStyle="#d6b45a",n.lineWidth=4,n.strokeRect(0,0,128,64);const r=e.own(new $e(s));return r.colorSpace=Qe,r}function Xe(e,o,s){const n=new Re(e.own(new Ce({map:e.glow([[0,"#ffffff"],[.25,o],[1,"rgba(0,0,0,0)"]]),blending:ce,depthWrite:!1,transparent:!0})));return n.scale.setScalar(s),n}function Ht(e){const o=new O,s=e.toon("#c8ccd2"),n=e.toon("#5d6470"),r=e.toon("#eceff3"),f=e.toon("#d6aa48",{emissive:"#2a1c04"}),l=new dt(1,3);{const z=l.getAttribute("position"),T=[],V=Array.from({length:9},()=>{const R=e.rand()*2-1,_=e.rand()*fe,B=Math.sqrt(1-R*R);return{c:new b(B*Math.cos(_),R,B*Math.sin(_)),size:.1+e.rand()*.16}}),P=new b;for(let R=0;R<z.count;R++){P.fromBufferAttribute(z,R).normalize();let _=1+(Oe(P.x*3,P.y*3,P.z*3,3,71)-.5)*.025,B=0;for(const Y of V){const W=Math.acos(Math.min(1,P.dot(Y.c)));if(W<Y.size){const C=W/Y.size;_-=.035*(1-C*C),B=Math.max(B,1-C*.6)}else W<Y.size*1.25&&(_+=.008)}const $=ye(.46,.56,Oe(P.x*1.7+3,P.y*1.7,P.z*1.7,3,73));z.setXYZ(R,P.x*_,P.y*_,P.z*_);const D=.78-$*.22-B*.1;T.push(D*.98,D*.97,D*.93)}l.setAttribute("color",new se(T,3)),Nt(l)}const c=new F(e.own(l),e.toon("#ffffff",{vertexColors:!0}));c.position.copy(Ot(-58,-11).multiplyScalar(1700)),c.scale.setScalar(62),o.add(c);const m=new O,v=new F(e.own(new X(46,1.1,1.1)),n);m.add(v);const x=new F(e.own(new k(2.5,2.5,22,10)),r);x.rotation.x=Math.PI/2,m.add(x);const I=new F(e.own(new K(3.1,8,6)),s);m.add(I);for(const z of[-1,1]){const T=new F(e.own(new k(1.9,1.9,13,9)),r);T.rotation.z=Math.PI/2,T.position.set(z*9.5,0,0),m.add(T);const V=new F(e.own(new k(1.2,1.9,1.6,9)),s);V.rotation.z=z*Math.PI/2,V.position.set(z*16.8,0,0),m.add(V)}const L=[],i=Xt(e,10),t=e.toon("#ffffff",{map:i,emissive:"#0a1a44"}),y=e.own(new X(10.5,.14,6.2));for(const z of[-22,-12.5,12.5,22]){const T=new O;T.position.set(z,0,0);for(const P of[-1,1]){const R=new F(y,t);R.position.set(0,0,P*3.9),T.add(R)}const V=new F(e.own(new X(.4,.4,8.4)),n);T.add(V),m.add(T),L.push(T)}const u=new F(e.own(new K(1.5,8,4,0,fe,0,Math.PI/2)),r);u.position.set(0,3.7,0),u.rotation.x=-.5,m.add(u);const h=new F(e.own(new k(.15,.15,1.4,5)),n);h.position.set(0,3.1,0),m.add(h);const w=Xe(e,"#ff5a4a",9);w.position.set(-24,1.5,0),m.add(w),m.scale.setScalar(1.25),o.add(m);const p=new O,S=new F(e.own(new X(3,3,4.2)),f);p.add(S);const a=new F(e.own(new X(3.2,.5,4.4)),n);a.position.y=1.7,p.add(a);for(const z of[-1,1]){const T=new F(e.own(new k(.14,.14,2.6,5)),s);T.rotation.z=Math.PI/2,T.position.set(z*2.8,0,0),p.add(T);const V=new F(e.own(new X(7.4,.12,3.4)),t);V.position.set(z*7.4,0,0),p.add(V)}const g=new F(e.own(new k(.12,.12,2.2,5)),s);g.position.set(0,-2.4,.4),p.add(g);const M=new F(e.own(new K(1.7,9,4,0,fe,0,Math.PI/2)),r);M.position.set(0,-3.6,.4),M.rotation.x=Math.PI,p.add(M);const E=new F(e.own(new ge(.3,1.2,5)),n);E.position.set(0,0,-2.8),E.rotation.x=-Math.PI/2,p.add(E);const U=Xe(e,"#9fd3ff",4);return U.position.set(0,2.4,0),p.add(U),p.scale.setScalar(.85),o.add(p),{group:o,update(z,T){const V=(z+150)%900/900;m.position.set(-700+V*1500,-62-Math.sin(V*fe)*6,-540),m.rotation.set(.12,.4+z*.006,.05),L.forEach((P,R)=>P.rotation.x=z*.03+R*.4),w.material.opacity=.35+.65*Math.max(0,Math.sin(z*2.4)),p.position.set(-300+Math.sin(z*.012)*14+z*.45,-40+Math.sin(z*.02)*3,-230),p.rotation.y+=T*.045,p.rotation.x=.35+Math.sin(z*.05)*.1,U.material.opacity=.3+.7*Math.max(0,Math.sin(z*1.7+1))}}}const He=[.84,.66,.26],J=[.78,.8,.84],Ye=[.94,.95,.96],te=[.2,.22,.27],oe=[.15,.27,.58],Yt=[.3,.44,.78];function ue(e){const o=e.map(({geometry:n,at:r=[0,0,0],color:f,turn:l=[0,0,0]})=>{const c=n.index?n.toNonIndexed():n.clone();c.deleteAttribute("uv"),l[0]&&c.rotateX(l[0]),l[1]&&c.rotateY(l[1]),l[2]&&c.rotateZ(l[2]),c.translate(r[0],r[1],r[2]);const m=[];for(let v=0;v<c.getAttribute("position").count;v++)m.push(...f);return c.setAttribute("color",new se(m,3)),c}),s=xt(o);return s.computeVertexNormals(),s}const H=(e,o,s)=>new X(e,o,s),Q=(e,o,s=8)=>new k(e,e,o,s),he=[{name:"comsat",scale:1,make:()=>ue([{geometry:H(1.6,1.6,2.2),color:He},{geometry:H(1.7,.3,2.3),at:[0,.95,0],color:te},{geometry:Q(.14,1.6,6),at:[1.6,0,0],color:J,turn:[0,0,Math.PI/2]},{geometry:Q(.14,1.6,6),at:[-1.6,0,0],color:J,turn:[0,0,Math.PI/2]},{geometry:H(4.4,.1,1.8),at:[3,0,0],color:oe},{geometry:H(4.4,.1,1.8),at:[-3,0,0],color:oe},{geometry:new K(.8,8,4,0,Math.PI*2,0,Math.PI/2),at:[0,1.4,.5],color:Ye,turn:[-.5,0,0]},{geometry:Q(.05,.9,5),at:[0,1.3,.4],color:J}])},{name:"flat",scale:.8,make:()=>ue([{geometry:H(3.2,.14,1.5),color:te},{geometry:H(3,.02,1.35),at:[0,.09,0],color:Yt},{geometry:Q(.1,1,6),at:[2.1,0,0],color:J,turn:[0,0,Math.PI/2]},{geometry:H(6.2,.06,1.4),at:[5.2,0,0],color:oe},{geometry:H(.5,.3,.5),at:[0,-.2,.3],color:J}])},{name:"cube",scale:.6,make:()=>ue([{geometry:H(1,1,1),color:J},{geometry:H(.9,.06,1.1),at:[.95,0,0],color:oe},{geometry:H(.9,.06,1.1),at:[-.95,0,0],color:oe},{geometry:Q(.025,1.6,4),at:[0,1.1,0],color:te},{geometry:H(.5,.5,.05),at:[0,0,.53],color:te}])},{name:"scope",scale:1.1,make:()=>ue([{geometry:Q(.9,3.8,10),color:Ye,turn:[Math.PI/2,0,0]},{geometry:Q(.78,.2,10),at:[0,0,1.95],color:te,turn:[Math.PI/2,0,0]},{geometry:Q(1,.8,10),at:[0,0,-2.2],color:He,turn:[Math.PI/2,0,0]},{geometry:H(1.2,.14,.14),at:[1.5,0,-2.2],color:J},{geometry:H(1.2,.14,.14),at:[-1.5,0,-2.2],color:J},{geometry:H(3.2,.08,1.3),at:[3.1,0,-2.2],color:oe},{geometry:H(3.2,.08,1.3),at:[-3.1,0,-2.2],color:oe}])},{name:"stage",scale:.9,make:()=>ue([{geometry:Q(.8,4.2,9),color:J,turn:[Math.PI/2,0,0]},{geometry:new k(.45,.9,.9,9),at:[0,0,-2.5],color:te,turn:[Math.PI/2,0,0]},{geometry:Q(.82,.25,9),at:[0,0,.8],color:te,turn:[Math.PI/2,0,0]}])}];function Zt(e){const o=new O,s=e.toon("#ffffff",{vertexColors:!0,emissive:"#10131a"}),n=new b(0,1,0),r=e.rand,f=he.map(()=>[]),l=(u,h,w,p,S,a,g=1)=>{const M=new b(Math.cos(p),S,Math.sin(p)).normalize(),E=n.clone().sub(M.clone().multiplyScalar(n.dot(M))).normalize(),U=new b().crossVectors(M,E);f[u].push({kind:u,u:E,v:U,radius:h,omega:w,phase:a,tumble:u===4?.4+r()*.5:.02+r()*.06,tumbleAxis:new b(r()-.5,r()-.5,r()-.5).normalize(),size:g})};for(let u=0;u<34;u++){const h=Math.floor(r()*he.length),p=600+(200+Math.pow(r(),1.3)*330),a=(r()<.5?1:-1)*(.004+r()*.007)*Math.pow(660/p,1.5),g=Math.pow(r(),1.4)*520;l(h,p,a,r()*Math.PI*2,(r()-.5)*.26,-a*g,.8+r()*.5)}for(let u=0;u<4;u++){const h=790+r()*120,w=(r()<.5?1:-1)*(.006+r()*.004);l(Math.floor(r()*3),h,w,r()*Math.PI*2,(r()-.5)*.2,-w*(3+r()*18),1)}for(let u=0;u<2;u++){const h=830+u*60+r()*20,w=(u%2?-1:1)*.0075,p=r()*Math.PI*2,S=(r()-.5)*.14,a=30+u*150+r()*60,g=6+Math.floor(r()*3);for(let M=0;M<g;M++)l(1,h,w,p,S,-w*a+M*.011*Math.sign(w),1.1)}const c=he.map((u,h)=>{const w=new ut(e.own(u.make()),s,Math.max(f[h].length,1));return w.count=f[h].length,w.frustumCulled=!1,o.add(w),w}),m=new Je,v=new b,x=new b,I=new b,L=new b,i=new Ae,t=new Ae,y=he.map(()=>new b);return{group:o,focus:y,update(u){f.forEach((h,w)=>{const p=c[w];h.forEach((S,a)=>{const g=S.phase+S.omega*u,M=Math.cos(g),E=Math.sin(g);x.copy(S.u).multiplyScalar(M).addScaledVector(S.v,E),I.copy(S.v).multiplyScalar(M).addScaledVector(S.u,-E).multiplyScalar(Math.sign(S.omega)),v.copy(le).addScaledVector(x,S.radius);const U=v.length(),z=he[w].scale*S.size*Math.max(1,U/200);L.crossVectors(x,I),i.makeBasis(L,x,I),t.makeRotationAxis(S.tumbleAxis,S.tumble*u),m.matrix.identity(),m.matrix.multiply(i).multiply(t),m.matrix.scale(new b(z,z,z)),m.matrix.setPosition(v),a===0&&y[w].copy(v),p.setMatrixAt(a,m.matrix)}),p.instanceMatrix.needsUpdate=!0})}}}const pe=[.95,.955,.96],ve=[.11,.115,.14];function re(e,o,s){const n=e.index?e.toNonIndexed():e;n.computeVertexNormals();const r=n.getAttribute("position"),f=n.getAttribute("normal"),l=new Float32Array(r.count*3),c=new b,m=new b;for(let v=0;v<r.count/3;v++){c.set(0,0,0);for(let i=0;i<3;i++)c.add(new b(r.getX(v*3+i),r.getY(v*3+i),r.getZ(v*3+i)).multiplyScalar(1/3));m.set(f.getX(v*3),f.getY(v*3),f.getZ(v*3));const x=o(c,m),I=Math.sin((v+s)*12.9898)*43758.5453,L=1+(I-Math.floor(I)-.5)*.07;for(let i=0;i<3;i++)l.set([x[0]*L,x[1]*L,x[2]*L],(v*3+i)*3)}return n.setAttribute("color",new se(l,3)),n}function jt(e){const o=new O,s=new O;o.add(s);const n=e.toon("#ffffff",{vertexColors:!0});n.side=ze;const r=e.toon("#f1f2f4"),f=e.toon("#a3a8b0"),l=e.toon("#4a4f58"),c=e.toon("#1c1e23"),m=e.toon("#cfd1cc");m.side=Pe;const v=e.toon("#d6aa46",{emissive:"#2d1f05"}),x=e.toon("#c8a24e",{emissive:"#22170a"}),I=e.toon("#12203a",{emissive:"#0a1a38"}),L=e.toon("#2a4b95",{emissive:"#0a1a44"}),i=e.own,t=(d,A,N=0,q=0,G=0,Z=s)=>{const ee=new F(i(d),A);return ee.position.set(N,q,G),Z.add(ee),ee},y=(d,A)=>{const N=new mt(d.map(([q,G])=>new ft(q,G)),A);return N.rotateX(Math.PI/2),N},u=(d,A)=>A.y<-.25?ve:pe,h=re(y([[.001,-18.6],[2,-18.6],[2.35,-18],[2.7,-16.4],[2.78,-13],[2.78,-8]],14),u,1);t(h,n);const w=re(y([[2.78,10],[2.76,12.5],[2.58,14.6],[2.2,16.6],[1.55,18.1],[.8,18.9],[.001,19.3]],14),(d,A)=>d.z>18.1||A.y<-.25?ve:pe,2);t(w,n);const p=new k(2.78,2.78,18,14,1,!0,-(Math.PI/2+.35),Math.PI+.7);p.rotateX(Math.PI/2),p.translate(0,0,1),t(re(p,u,3),n);const S=new k(2.7,2.7,18,14,1,!0,-(Math.PI/2+.35),Math.PI+.7);S.rotateX(Math.PI/2),S.translate(0,0,1),t(S,m);for(let d=-7;d<=9;d+=2){const A=new Me(2.66,.07,4,14,Math.PI+.7);A.rotateZ(Math.PI-.35),A.translate(0,0,d),t(A,f)}t(new X(2.4,.15,17.6),f,0,-2.5,1);const a=2.78*Math.cos(.35),g=2.78*Math.sin(.35);for(const d of[-1,1]){const A=new O;A.position.set(d*a,g,0),A.scale.x=d,A.rotation.z=-2.55*d,s.add(A);const N=new k(2.82,2.82,17.6,8,1,!0,Math.PI/2+.35,Math.PI/2-.35);N.rotateX(Math.PI/2),N.translate(-a,-g,1);const q=new F(i(re(N,()=>[.84,.86,.9],4+d)),n);A.add(q);const G=new k(2.74,2.74,17.6,8,1,!0,Math.PI/2+.35,Math.PI/2-.35);G.rotateX(Math.PI/2),G.translate(-a,-g,1),A.add(new F(i(G),m))}const M=new O;M.position.set(0,-.6,-2.4),s.add(M),t(new k(1.25,1.25,6.6,10).rotateX(Math.PI/2),x,0,0,0,M);for(const d of[-3.4,3.4])t(new k(1.32,1.32,.25,10).rotateX(Math.PI/2),f,0,0,d,M);for(const d of[-1.8,0,1.8])t(new k(1.31,1.31,.12,10).rotateX(Math.PI/2),l,0,0,d,M);for(const d of[-1,1])t(new X(.12,1.5,5.4),L,d*1.45,.15,0,M);t(new k(.07,.07,1.8,5),f,0,1.8,.4,M);const E=t(new K(.85,9,4,0,Math.PI*2,0,Math.PI/2),r,0,2.7,.4,M);E.rotation.x=-.6;for(const d of[-3,3])t(new Me(1.55,.1,4,12,Math.PI).rotateZ(Math.PI),l,0,0,d,M),t(new X(.3,1.3,.3),l,0,-1.7,d,M);t(new k(1.35,1.35,3.2,12).rotateX(Math.PI/2),r,0,-.3,7.6),t(new k(1.4,1.4,.3,12).rotateX(Math.PI/2),f,0,-.3,6);const U=t(new Me(.62,.1,5,12),f,0,1.1,7.6);U.rotation.x=Math.PI/2,t(new k(.58,.58,.12,12),l,0,1.08,7.6);const z=new Je;z.position.set(0,1.35,7.6),s.add(z);for(const d of[-1,1]){t(new X(.08,.08,16),v,d*2.78,1.05,1);for(const A of[-6,-1,4,8.5])t(new X(.08,.28,.08),f,d*2.78,.9,A)}const T=new O;T.position.set(-2.55,1.25,8.2),s.add(T),t(new K(.5,8,6),r,0,0,0,T);const V=new O;V.rotation.set(-.7,.18,.35),T.add(V),t(new k(.2,.22,6.2,8).translate(0,3.1,0),r,0,0,0,V);const P=new O;P.position.y=6.2,V.add(P),t(new K(.4,8,6),f,0,0,0,P);const R=new O;R.rotation.set(2.3,0,.1),P.add(R),t(new k(.17,.19,6.4,8).translate(0,3.2,0),r,0,0,0,R);const _=new O;_.position.y=6.4,R.add(_),t(new K(.3,8,6),f,0,0,0,_),t(new X(.35,.8,.35),l,0,.55,0,_),t(new k(.16,.16,.3,6).rotateX(Math.PI/2),c,.3,.2,.2,P),t(new k(.14,.14,.26,6).rotateX(Math.PI/2),c,.25,.7,0,_);const B=new Ge;B.moveTo(-7.2,2.3),B.lineTo(-13.3,9.6),B.lineTo(-17.2,9.6),B.lineTo(-17.2,2.3),B.closePath();const $=new _e(B,{depth:.45,bevelEnabled:!1});$.rotateY(-Math.PI/2),$.translate(.22,0,0),t(re($,(d,A)=>Math.abs(A.x)<.3?ve:pe,5),n);for(const d of[-1,1]){const A=new Ge;A.moveTo(2.5,-6),A.lineTo(4.8,-1.2),A.lineTo(12.2,12),A.lineTo(12.2,14.8),A.lineTo(2.5,17.2),A.closePath();const N=new _e(A,{depth:.4,bevelEnabled:!1});N.rotateX(-Math.PI/2),N.translate(0,-.9,0);const q=new F(i(re(N,(ee,ot)=>ot.y>.5?pe:ve,6+d)),n);q.scale.x=d,s.add(q);const G=new F(i(new X(8.6,.05,.08)),l);G.position.set(d*7.4,-.48,-12.8),G.rotation.y=d*-.17,s.add(G),t(new K(1.15,9,7),r,d*1.65,2.05,-15.2).scale.set(1,1,3.1),t(new ge(.5,.9,8).rotateX(Math.PI/2),l,d*1.65,2.05,-18.4)}for(const[d,A]of[[0,1.1],[-1.2,-.65],[1.2,-.65]])t(new ge(.85,2.1,9,1,!0).rotateX(Math.PI/2),l,d,A,-19),t(new ge(.4,1,8).rotateX(Math.PI/2),c,d,A,-18.4);t(new X(5,.5,.2),f,0,.25,-18.55);for(const d of[-1.05,-.35,.35,1.05]){const A=t(new X(.62,.5,.06),I,d,2.12,15);A.rotation.x=.55,A.rotation.y=d*-.25}for(const d of[-1,1]){const A=t(new X(.06,.5,.7),I,d*1.55,1.7,14.3);A.rotation.z=d*-.5}for(const[d,A,N]of[[0,1,18.3],[-1.1,.4,18],[1.1,.4,18],[-2.7,1.2,-16.2],[2.7,1.2,-16.2]])t(new X(.35,.28,.3),c,d,A,N);t(new k(.07,.07,1.4,5),f,2.5,1.7,5.3),t(new K(.95,9,4,0,Math.PI*2,0,Math.PI/2),r,2.5,2.4,5.3).rotation.z=-.5;const D=(d,A,N,q,G)=>{const Z=new Re(e.own(new Ce({map:e.glow([[0,"#ffffff"],[.22,d],[1,"rgba(0,0,0,0)"]]),blending:ce,depthWrite:!1,transparent:!0})));return Z.scale.setScalar(A),Z.position.set(N,q,G),s.add(Z),Z},Y=D("#ff3030",1.6,-12.1,-.55,-13.6),W=D("#3dff6a",1.6,12.1,-.55,-13.6),C=D("#ffffff",3.4,0,9.9,-16.8),j=new ht("#fff1d8",0,24,1.6);return j.position.set(0,2.3,3.5),s.add(j),{group:o,hatch:z,bayLight:j,update(d){Y.material.opacity=.55+.3*Math.sin(d*1.3),W.material.opacity=.55+.3*Math.sin(d*1.3+2),C.material.opacity=Math.pow(Math.max(0,Math.sin(d*2.1)),14),T.rotation.y=Math.sin(d*.05)*.05,V.rotation.x=-.7+Math.sin(d*.04+1)*.03,R.rotation.x=2.3+Math.sin(d*.045)*.04,M.rotation.z=Math.sin(d*.03)*.01}}}const ie=[new b(.1,-.55,.95),new b(-.75,-.7,.55),new b(-1.5,-.85,-.5)];function Kt(e){const o=new O,s=e.toon("#ffffff",{vertexColors:!0,emissive:"#15171c"}),n=e.toon("#d9ad3c",{emissive:"#2b1d05"}),r=e.toon("#aab0b9"),f=new F(new Se,s),l=new F(new Se,n);f.frustumCulled=!1,l.frustumCulled=!1,o.add(f,l);const c=new F(e.own(new k(.3,.34,.5,9)),r);o.add(c);const m=72,v=8,x=new b(0,1,0),I=new b,L=new Te,i=new b,t=new b,y=new b,u=(a,g,M,E)=>{const U=ie[ie.length-1],z=i.copy(g).sub(U),T=z.length();t.crossVectors(z,x).normalize(),y.crossVectors(t,z).normalize();for(let P=0;P<ie.length;P++)E[P].copy(ie[P]).addScaledVector(t,Math.sin(a*.3+P)*.04+M*.06).addScaledVector(y,Math.sin(a*.23+P*2)*.03+M*.05);const V=E.length-ie.length;for(let P=1;P<=V;P++){const R=P/V,_=Math.sin(Math.PI*Math.min(R*1.08,1))*.9,B=Math.sin(R*5.2+a*.21)*1.9+Math.sin(R*9.1-a*.33)*.55,$=Math.sin(R*4.1+a*.17+1.7)*1.4;E[ie.length+P-1].copy(U).addScaledVector(z,R).addScaledVector(t,B*_*(T/38)+M*.12).addScaledVector(y,$*_*(T/38)+M*.1)}return E},h=Array.from({length:10},()=>new b),w=Array.from({length:10},()=>new b),p=(a,g,M)=>{const E=new pt(a,m,g,v,!1);if(M){const U=E.getAttribute("position").count,z=new Float32Array(U*3);for(let T=0;T<=m;T++){const P=T%2===0?[.98,.98,.99]:[.55,.58,.64];for(let R=0;R<=v;R++)z.set(P,(T*(v+1)+R)*3)}E.setAttribute("color",new se(z,3))}return E};let S=0;return{group:o,update(a,g){if(S++%2)return;const M=new De(u(a,g,0,h).map(U=>U.clone()),!1,"catmullrom",.5),E=new De(u(a+1.2,g,1,w).map(U=>U.clone()),!1,"catmullrom",.5);f.geometry.dispose(),f.geometry=p(M,.04,!0),l.geometry.dispose(),l.geometry=p(E,.02,!1),I.copy(M.getTangentAt(1)),L.setFromUnitVectors(x,I),c.position.copy(M.getPointAt(1)),c.quaternion.copy(L)},dispose(){f.geometry.dispose(),l.geometry.dispose()}}}const $t=`
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Qt=`
varying vec3 vDir;
uniform vec3 uSun;
uniform vec3 uSunColor;
uniform float uTime;

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.07 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}

// One layer of stars: a point in every cell that has one.
vec3 stars(vec3 d, float scale, float size, float density, float boost) {
  vec3 p = d * scale;
  vec3 id = floor(p);
  vec3 f = fract(p) - 0.5;
  float h = hash(id);
  if (h > density) return vec3(0.0);
  vec3 off = (vec3(hash(id + 1.7), hash(id + 5.3), hash(id + 9.1)) - 0.5) * 0.6;
  float dist = length(f - off);
  float twinkle = 0.78 + 0.22 * sin(uTime * (0.8 + h * 5.0) + h * 80.0);
  float bright = smoothstep(size, 0.0, dist) * twinkle * (0.35 + 0.65 * hash(id + 8.8)) * boost;
  vec3 tint = mix(vec3(0.68, 0.8, 1.0), vec3(1.0, 0.86, 0.7), hash(id + 3.3));
  return tint * bright;
}

void main() {
  vec3 d = normalize(vDir);
  vec3 col = vec3(0.004, 0.006, 0.014);

  // The galaxy: a soft band, torn by dust, brightest toward its middle.
  vec3 gn = normalize(vec3(0.42, 0.64, 0.64));
  float across = dot(d, gn);
  float band = exp(-across * across * 14.0);
  float clouds = fbm(d * 3.2 + 4.0);
  float dust = smoothstep(0.42, 0.62, fbm(d * 7.0 + 11.0));
  vec3 galaxy = mix(vec3(0.16, 0.2, 0.42), vec3(0.5, 0.34, 0.3), smoothstep(0.35, 0.7, clouds));
  col += galaxy * band * (0.16 + 0.48 * clouds) * (1.0 - 0.7 * dust);
  float core = exp(-pow(dot(d, normalize(vec3(-0.5, 0.5, 0.7))) * 2.2, 2.0));
  col += vec3(0.4, 0.28, 0.2) * core * band * 0.18;

  // Stars: sparse and sharp far from the band, crowded in it.
  float crowd = 1.0 + band * 1.6;
  col += stars(d, 46.0, 0.17, 0.4 * crowd, 1.0);
  col += stars(d, 90.0, 0.2, 0.34 * crowd, 0.9);
  col += stars(d, 180.0, 0.24, 0.24 * crowd, 0.8);
  col += stars(d, 24.0, 0.16, 0.06, 2.4);

  // The sun: a hard disc, a tight halo and a wide, faint breath.
  float sd = max(dot(d, uSun), 0.0);
  float disc = smoothstep(0.99965, 0.99985, sd);
  float halo = pow(sd, 260.0) * 0.55 + pow(sd, 40.0) * 0.1 + pow(sd, 6.0) * 0.025;
  col += uSunColor * (disc * 2.4 + halo);

  gl_FragColor = vec4(col, 1.0);
}
`,we=73.42;function Jt(e){const{ctx:o,out:s,rand:n}=e,r=i=>{const t=o.createStereoPanner();return t.pan.value=i,t};Mt(e,{root:we,level:.07,semitones:[0,7,12,19,24]}),e.every(26,50,()=>bt(e,we/2,n(14,20),.05),4),e.every(22,52,()=>St(e,Ue(we*4,e.pick(Ne)+e.pick([0,12,12,19])),{gain:.03,decay:13,pan:n(-.6,.6),wet:1.3}),7);const f=e.keep(o.createBufferSource());f.buffer=e.brown,f.loop=!0;const l=o.createBiquadFilter();l.type="lowpass",l.frequency.value=260;const c=o.createGain();c.gain.value=.1,f.connect(l).connect(c).connect(s),f.start(0,n(0,9));const m=e.keep(o.createBufferSource());m.buffer=e.noise,m.loop=!0;const v=o.createBiquadFilter();v.type="bandpass",v.frequency.value=3200,v.Q.value=.7;const x=o.createGain();x.gain.value=.0045,m.connect(v).connect(x).connect(s),m.start(0,n(0,9));for(const[i,t]of[[118,.0042],[236.5,.0016]]){const y=e.keep(o.createOscillator());y.frequency.value=i;const u=o.createGain();u.gain.value=t;const h=e.keep(o.createOscillator());h.frequency.value=.07+i*1e-4;const w=o.createGain();w.gain.value=t*.5,h.connect(w).connect(u.gain),y.connect(u).connect(s),y.start(),h.start()}const I=()=>{const i=o.currentTime+.05,t=e.keep(o.createBufferSource());t.buffer=e.noise;const y=o.createBiquadFilter();y.type="bandpass",y.frequency.value=780,y.Q.value=.6;const u=o.createBiquadFilter();u.type="lowpass",u.frequency.value=1700;const h=o.createGain(),w=n(.028,.04),p=n(1.25,1.5),S=n(.2,.34),a=n(1.9,2.4);h.gain.setValueAtTime(1e-4,i),h.gain.linearRampToValueAtTime(w,i+p*.7),h.gain.linearRampToValueAtTime(w*.75,i+p),h.gain.linearRampToValueAtTime(1e-4,i+p+.18),h.gain.setValueAtTime(1e-4,i+p+S),h.gain.linearRampToValueAtTime(w*.9,i+p+S+.5),h.gain.exponentialRampToValueAtTime(1e-4,i+p+S+a),y.frequency.setValueAtTime(700,i),y.frequency.linearRampToValueAtTime(980,i+p),y.frequency.setValueAtTime(900,i+p+S),y.frequency.linearRampToValueAtTime(560,i+p+S+a),t.connect(y).connect(u).connect(h).connect(s),t.start(i,n(0,8)),t.stop(i+p+S+a+.2)};e.every(4.2,7.6,()=>{Math.random()>.2&&I()},2);const L=()=>{const i=o.currentTime+.05,t=n(-.3,.3),y=n(1.6,3.4),u=e.keep(o.createBufferSource());u.buffer=e.noise;const h=o.createBiquadFilter();h.type="bandpass",h.frequency.value=n(1500,2400),h.Q.value=3;const w=o.createGain();w.gain.setValueAtTime(1e-4,i),w.gain.linearRampToValueAtTime(.012,i+.02),w.gain.setValueAtTime(.012,i+y),w.gain.linearRampToValueAtTime(1e-4,i+y+.03);const p=e.keep(o.createOscillator());p.type="square",p.frequency.value=n(9,17);const S=o.createGain();S.gain.value=.005,p.connect(S).connect(w.gain),p.start(i),p.stop(i+y+.1),u.connect(h).connect(w).connect(r(t)).connect(s);const a=o.createGain();a.gain.value=.5,w.connect(a).connect(e.send),u.start(i,n(0,8)),u.stop(i+y+.1);const g=e.keep(o.createOscillator());g.type="sine",g.frequency.value=Ue(we*8,e.pick(Ne));const M=o.createGain();M.gain.setValueAtTime(1e-4,i+y+.1),M.gain.exponentialRampToValueAtTime(.012,i+y+.12),M.gain.exponentialRampToValueAtTime(1e-4,i+y+1.1),g.connect(M).connect(r(t)).connect(s),M.connect(a),g.start(i+y+.1),g.stop(i+y+1.2)};return e.every(55,120,L,25),{event(i){if(i!=="lightning")return;const t=o.currentTime+n(.05,.25),y=e.keep(o.createOscillator());y.frequency.setValueAtTime(n(46,58),t),y.frequency.exponentialRampToValueAtTime(30,t+1.2);const u=o.createGain();u.gain.setValueAtTime(1e-4,t),u.gain.exponentialRampToValueAtTime(n(.018,.03),t+.06),u.gain.exponentialRampToValueAtTime(1e-4,t+1.6),y.connect(u).connect(r(n(-.4,.4))).connect(s),y.start(t),y.stop(t+1.7);const h=e.keep(o.createOscillator());h.type="triangle",h.frequency.setValueAtTime(118,t),h.frequency.exponentialRampToValueAtTime(64,t+1);const w=o.createGain();w.gain.setValueAtTime(1e-4,t),w.gain.exponentialRampToValueAtTime(.008,t+.08),w.gain.exponentialRampToValueAtTime(1e-4,t+1.2),h.connect(w).connect(s),h.start(t),h.stop(t+1.3)},dispose(){}}}const eo=-.46,to=-.32,oo=.0075,Ze=.5,ao=.0026,be=new b(-19,-9.5,-36),no=.48,so=2.3,ro=-.05;async function io({renderer:e,reducedMotion:o,settled:s}){const n=performance.now(),r=D=>$.onEvent?.(D),f=["localhost","127.0.0.1","[::1]"].includes(location.hostname)||location.hostname.endsWith(".localhost"),l=f?new URLSearchParams(location.search):new URLSearchParams,c=D=>l.has(D)?Number(l.get(D)):null,m=qt(),v=new Ke,x=new wt(64,16/9,.05,6e3);x.rotation.order="YXZ",v.add(x);const I={uSun:{value:new b(0,1,0)},uSunColor:{value:new b(1,.95,.85)},uTime:{value:0}},L=new F(m.own(new K(3e3,40,20)),m.own(new ne({vertexShader:$t,fragmentShader:Qt,uniforms:I,side:Pe,depthWrite:!1,depthTest:!1,fog:!1})));L.frustumCulled=!1,L.renderOrder=-10,v.add(L);const i=new gt("#0d1736","#3e6cae",.4);v.add(i);const t=new yt("#fff3e0",2.6);v.add(t);const y=new Te().setFromEuler(new ke(c("lat")??.9,c("lon")??2.1,.35)),u=new b(-.2,.95,-.24).normalize().applyQuaternion(y.clone().invert());await s;const h=await _t(m,e,{storm:u});v.add(h.root),await de();const w=Ht(m);v.add(w.group),await de();const p=Ut(m);v.add(p.group),await de();const S=Zt(m);v.add(S.group),await de();const a=jt(m);a.group.scale.setScalar(c("sscale")??no),v.add(a.group),await de();const g=Kt(m);v.add(g.group);const M=new b,E=new b(1,0,.22).normalize(),U=new Te,z=new b(Math.sin(Ze),0,-Math.cos(Ze)),T=new b,V=[1,1,1],P=o?0:1,R=o?.35:1;let _=(c("at")??0)+0;const B=(D,Y,W)=>{_+=Y*R;const C=_,j=c("sun")!==null?c("sun")*Math.PI/180:to+C*oo;T.copy(z).multiplyScalar(Math.cos(j)),T.y=Math.sin(j),T.normalize();const d=1-ye(0,.55,Math.abs(T.y));V[0]=1,V[1]=me(1,.78,d),V[2]=me(1,.55,d),U.setFromAxisAngle(E,-C*ao),h.spin.quaternion.copy(U).multiply(y),h.clouds.rotation.y=C*6e-4,h.update({sun:T,sunColor:V,time:C,pixels:e.domElement.height||800}),I.uSun.value.copy(T),I.uSunColor.value.set(V[0],V[1]*.97,V[2]*.92),I.uTime.value=C;const A=ye(-.5,-.38,T.y);t.position.copy(T).multiplyScalar(100),t.color.setRGB(1,me(.96,.82,d),me(.9,.64,d)),t.intensity=2.8*A,i.intensity=.32+.55*ye(-.1,.6,T.y);const N=c("pitch")!==null?c("pitch")*Math.PI/180:tt(eo-W.y*.9+Math.sin(C*.09+1)*.012*P,-1.3,.45),q=c("yaw")!==null?c("yaw")*Math.PI/180:-.04*Math.sin(C*.021)*P-W.x*1.15;if(x.position.set(Math.sin(C*.17)*.04*P,Math.sin(C*.23+1)*.03*P,Math.sin(C*.13+2)*.03*P),x.rotation.set(N,q,Math.sin(C*.05)*.012*P+Math.sin(C*.31)*.002*P),c("far")!==null&&(x.position.set(0,-660+c("far"),0),x.rotation.set(-Math.PI/2,c("yaw")!==null?c("yaw")*Math.PI/180:0,0)),c("sat")!==null){const G=S.focus[c("sat")],Z=5;x.position.set(G.x+4*Z,G.y+2.5*Z,G.z+8*Z),x.lookAt(G)}L.position.copy(x.position),w.update(C,Y*R),S.update(C),a.group.position.set((c("sx")??be.x)+Math.sin(C*.021)*.7,(c("sy")??be.y)+Math.sin(C*.017+1)*.5,(c("sz")??be.z)+Math.sin(C*.013+2)*.8),a.group.rotation.set(ro+Math.sin(C*.019)*.03,(c("syaw")??so)+Math.sin(C*.011)*.05,.12+Math.sin(C*.015+1)*.03,"YXZ"),a.update(C),a.bayLight.intensity=16*(1-A),a.hatch.getWorldPosition(M),g.update(C,M),p.update(C,Y*R,T,x.position,r)};f&&(e.getContext().finish(),console.debug(`[space] built in ${Math.round(performance.now()-n)} ms (including the GPU bake)`)),f&&(window.__space={scene:v,camera:x,planet:h,props:w,life:p,shuttle:a,tether:g,reorient:(D,Y,W=.35)=>y.setFromEuler(new ke(D,Y,W))});const $={scene:v,camera:x,update:B,resize(D){x.aspect=D,x.fov=D<1.2?Math.min(88,2*Math.atan(Math.tan(64*Math.PI/360)*Math.min(1.2/D,1.45))*180/Math.PI):64,x.updateProjectionMatrix()},dispose(){v.traverse(D=>{D.isInstancedMesh&&D.dispose()}),g.dispose(),m.dispose()}};return $}const fo={id:"space",title:"The Overview",caption:"A hundred thousand people are asleep down there, and you can see none of them.",palette:["#05060f","#3a78c0"],toneMapping:vt,sound:Jt,create:io};export{fo as space};
