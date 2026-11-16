import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Modern Purple surfaces and text, with accents from the author's portfolio
// (happyc0der.github.io): violet #a78bfa, fuchsia #e879f9, green #4ade80,
// rose #f43f5e. Code is coloured from the roles: keywords from accent, strings from
// success, literals from pro, names from danger, variables from warning.
const { theme } = makeColors({
  label: 'Purple',
  only: 'dark',
  roles: { accent: '#a78bfa', danger: '#f43f5e', success: '#4ade80', warning: '#ffcb6b', pro: '#e879f9' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#12052e',
        'surface-1': '#150735',
        'surface-2': '#190a3c',
        'surface-3': '#1e1044',
        'text-primary': '#e4dcff',
        'text-secondary': '#9a9af0',
        'text-muted': '#8a84a8',
      },
      // The whole grey ramp in purple, so every part drawn from grey (borders,
      // dividers, hover fills, chart greys, disabled text) follows the theme.
      stops: {
        // The light end is violet: in dark mode every hover, selected and pressed
        // fill and most borders are this step at low opacity, in sidebars and menus too.
        0: '#e3daff', 10: '#dcd2fd', 20: '#ddd6f9', 30: '#e0daf6', 40: '#e2dbfd', 50: '#e4dcff',
        60: '#dcd9ea', 70: '#d6d2e6', 80: '#d1cde2', 90: '#cfcbdb', 100: '#c9c4e4', 150: '#b5aee6',
        200: '#9a9af0', 250: '#948fd6', 300: '#8f8ac4', 350: '#8d87b6', 400: '#8a84a8', 450: '#766f9c',
        500: '#655d8e', 550: '#544b7c', 600: '#463d6c', 650: '#3c3262', 700: '#342a58', 750: '#2a1f4c',
        800: '#1e1044', 810: '#1c0e41', 820: '#1b0c3f', 830: '#190a3c', 840: '#170838', 850: '#150735',
        860: '#140632', 870: '#130631', 880: '#13052f', 890: '#12052e', 900: '#12052e',
      },
    },
    // Diffs and pull-request states, from the portfolio's palette.
    git: {
      added: '#4ade80', removed: '#f43f5e', modified: '#60a5fa', merged: '#a78bfa',
      closed: '#f43f5e', conflicting: '#f78c6c', draft: '#8f8aa3',
    },
  },
})

// A small fixed pseudo-random sequence, so the scene is the same every time.
const rand = (() => {
  let s = 20261115
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
})()

// The portfolio's globe: a sphere drawn from dots, one per commit, lit from the top left.
function globeDots(cx: number, cy: number, r: number): string {
  const dots: string[] = []
  for (let lat = -80; lat <= 80; lat += 8) {
    const ring = Math.cos((lat * Math.PI) / 180)
    const count = Math.max(6, Math.round(46 * ring))
    for (let i = 0; i < count; i++) {
      const lon = (i / count) * Math.PI * 2
      const z = ring * Math.cos(lon)
      if (z < -0.05) continue // back of the sphere
      const x = cx + r * ring * Math.sin(lon)
      const y = cy - r * Math.sin((lat * Math.PI) / 180)
      const light = 0.25 + 0.75 * Math.max(0, z) * (0.6 + 0.4 * (1 - (lat + 80) / 160))
      const twinkle = rand() < 0.3 ? ` class="t" style="animation-delay:${(-rand() * 7).toFixed(1)}s"` : ''
      dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.3 + 1.1 * Math.max(0, z)).toFixed(2)}" opacity="${light.toFixed(2)}"${twinkle}/>`)
    }
  }
  return dots.join('')
}

// The portfolio's contribution heat-grid: violet cells that fade in and out.
function heatGrid(x0: number, y0: number): string {
  const heat = ['#1f1b2b', '#4c3d8f', '#6d58c4', '#9b82f7', '#cdbffd']
  const cells: string[] = []
  for (let col = 0; col < 18; col++) {
    for (let row = 0; row < 7; row++) {
      const level = Math.min(4, Math.floor(rand() * rand() * 6))
      const pulse = level >= 2 ? ` class="h" style="animation-delay:${(-rand() * 9).toFixed(1)}s"` : ''
      cells.push(`<rect x="${x0 + col * 15}" y="${y0 + row * 15}" width="11" height="11" rx="2.5" fill="${heat[level]}"${pulse}/>`)
    }
  }
  return cells.join('')
}

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
.g{transform-box:fill-box;transform-origin:center;animation:drift 14s ease-in-out infinite alternate}
.g2{animation-duration:18s;animation-direction:alternate-reverse}
.g3{animation-duration:22s}
.globe{transform-box:fill-box;transform-origin:center;animation:spin 48s linear infinite}
.t{animation:tw 3.5s ease-in-out infinite}
.h{animation:cell 4.5s ease-in-out infinite}
.rule{transform-origin:0 0;animation:grow 2.4s cubic-bezier(.2,.7,.2,1) both}
.spark{animation:run 7s cubic-bezier(.45,0,.55,1) infinite}
@keyframes drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-140px,90px) scale(1.18)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes cell{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes grow{from{transform:scaleX(0)}}
@keyframes run{0%{transform:translateX(-200px);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(1800px);opacity:0}}
.grid{animation:pan 40s linear infinite}
.beam{transform-box:fill-box;transform-origin:center;animation:sweep 18s ease-in-out infinite alternate}
@keyframes pan{to{transform:translate(-48px,-48px)}}
@keyframes sweep{0%{transform:rotate(-8deg) translateX(-120px);opacity:.35}100%{transform:rotate(6deg) translateX(140px);opacity:.75}}
@media (prefers-reduced-motion:reduce){.g,.globe,.t,.h,.rule,.spark,.grid,.beam{animation:none}}
</style>
<defs>
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="95"/></filter>
<filter id="bb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
<radialGradient id="v" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#0d0225" stop-opacity="0"/><stop offset="100%" stop-color="#05010f" stop-opacity=".7"/></radialGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.1" fill="#a78bfa" opacity=".22"/></pattern>
<linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity="0"/><stop offset=".5" stop-color="#c4b5fd" stop-opacity=".22"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1600" height="1000" fill="#12052e"/>
<g filter="url(#b)">
<ellipse class="g" cx="230" cy="160" rx="400" ry="240" fill="#8b5cf6" opacity=".34"/>
<ellipse class="g g2" cx="1420" cy="860" rx="380" ry="230" fill="#e879f9" opacity=".2"/>
<ellipse class="g g3" cx="1260" cy="130" rx="320" ry="190" fill="#818cf8" opacity=".2"/>
<ellipse class="g g3" cx="180" cy="880" rx="340" ry="200" fill="#c084fc" opacity=".2"/>
<ellipse class="g g2" cx="800" cy="520" rx="520" ry="300" fill="#6d28d9" opacity=".16"/>
</g>
<g class="grid"><rect x="-48" y="-48" width="1700" height="1100" fill="url(#dots)"/></g>
<g filter="url(#bb)"><rect class="beam" x="300" y="-200" width="160" height="1400" fill="url(#bm)"/><rect class="beam" x="1050" y="-200" width="120" height="1400" fill="url(#bm)" style="animation-duration:23s"/></g>
<g class="globe" fill="#c4b5fd">${globeDots(1430, 820, 230)}</g>
<g opacity=".55">${heatGrid(1300, 60)}</g>
<rect class="rule" x="0" y="0" width="1600" height="1.5" fill="#a78bfa" opacity=".55"/>
<defs><linearGradient id="sp" x1="0" x2="1"><stop offset="0" stop-color="#c4b5fd" stop-opacity="0"/><stop offset=".8" stop-color="#e879f9"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
<rect class="spark" x="0" y="0" width="180" height="2" rx="1" fill="url(#sp)"/>
<rect width="1600" height="1000" fill="url(#v)"/>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'portfolio', glass: { blur: 10, tint: '#12052e', opacity: 0.35 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.theme.set(LOOK)
    // Shown at the bottom under this plugin's name, so it reads "purple + adblock".
    $.ui.status('+ adblock')

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Drifting violet glows, a dotted globe and a contribution grid" isInteractive />
  })
}
