import { useEffect, useRef } from 'react'

// Every ad and the "FREE homepage" badge open this video at 3 seconds
export const AD_URL = 'https://youtu.be/eioYulMp_5k?si=HXhGqI4CviCrAcje&t=3'
const ADS = [
  { horror: true, title: 'THE SHROUD - Now Showing!', img: 'ghost.jpg', alt: 'A ghost in a white sheet and sunglasses standing in a dark parking garage',
    text: 'It has been waiting in the parking garage since 1996. Rated R for Really Scary. Coming to a theater near you... if you dare!', link: 'Click here for tickets!' },
  { horror: false, title: 'Shellfish Synergy Lunch', img: 'lobster.jpg', alt: 'Two cooked red lobsters piled together',
    text: 'Feeling stuck in your career? Our lobsters have been there. Pinch your way to the top at our Networking Lunch. Bring business cards!', link: 'Click here to book a claw!' },
  { horror: true, title: 'THE SHROUD - Midnight Screening', img: 'ghost.jpg', alt: 'A ghost in a white sheet and sunglasses standing in a dark parking garage',
    text: "Nobody leaves the parking garage. Nobody. Four tickets left for the midnight show. Bring a friend. Or don't.", link: 'Click here before it finds you!' },
  { horror: false, title: 'Lobster Lunch - Limited Claws', img: 'lobster.jpg', alt: 'Close-up of red lobster claws and legs',
    text: 'Your next promotion is in the claws. Network over seafood and leave with a new job offer. Lunch is on us. Mostly.', link: 'Click here to reserve a seat!' },
]

type Ad = { el: HTMLDivElement; x: number; y: number; ux: number; uy: number; started: boolean; bursting: boolean; burstUntil: number; nextBurst: number }

// Screensaver-style float: linear motion, bounce off the viewport edges. Ported 1:1 from the vanilla page.
export function Ads() {
  const refs = useRef<HTMLDivElement[]>([])
  useEffect(() => {
    const els = refs.current
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const SLOW = 30, FAST = 600, BURST = 2.5, COOLDOWN = 12 // px per second, seconds
    const state: Ad[] = els.map((el, i) => {
      const angle = (i * 73 + 20) * Math.PI / 180
      return { el, x: 0, y: 0, ux: Math.cos(angle), uy: Math.sin(angle), started: false, bursting: false, burstUntil: 0, nextBurst: performance.now() + (4 + i * 3) * 1000 }
    })

    const place = () => state.forEach((s, i) => {
      const maxX = Math.max(0, innerWidth - s.el.offsetWidth), maxY = Math.max(0, innerHeight - s.el.offsetHeight)
      if (reduce) {
        s.x = i % 2 ? maxX : 0; s.y = i < 2 ? 0 : maxY
      } else {
        s.x = Math.min(s.x, maxX); s.y = Math.min(s.y, maxY)
        if (!s.started) { s.x = Math.random() * maxX; s.y = Math.random() * maxY; s.started = true }
      }
      s.el.style.transform = `translate(${s.x}px, ${s.y}px)`
    })

    let last = performance.now(), raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      state.forEach(s => {
        if (s.el.hidden) return
        const maxX = Math.max(0, innerWidth - s.el.offsetWidth), maxY = Math.max(0, innerHeight - s.el.offsetHeight)
        if (!s.bursting && now >= s.nextBurst) { s.bursting = true; s.burstUntil = now + BURST * 1000 }
        if (s.bursting && now >= s.burstUntil) { s.bursting = false; s.nextBurst = now + COOLDOWN * 1000 }
        const speed = s.bursting ? FAST : SLOW
        s.x += s.ux * speed * dt; s.y += s.uy * speed * dt
        if (s.x <= 0) { s.x = 0; s.ux = Math.abs(s.ux) }
        if (s.x >= maxX) { s.x = maxX; s.ux = -Math.abs(s.ux) }
        if (s.y <= 0) { s.y = 0; s.uy = Math.abs(s.uy) }
        if (s.y >= maxY) { s.y = maxY; s.uy = -Math.abs(s.uy) }
        s.el.style.transform = `translate(${s.x}px, ${s.y}px)`
      })
      raf = requestAnimationFrame(frame)
    }

    // Close hides one ad; when all are closed, they all come back 12 s later.
    let reopenTimer: ReturnType<typeof setTimeout> | undefined
    const reopen = () => {
      state.forEach((s, i) => { s.el.hidden = false; s.started = false; s.bursting = false; s.nextBurst = performance.now() + (4 + i * 3) * 1000 })
      place()
    }
    const closers = els.map(el => {
      const close = () => {
        el.hidden = true
        if (!reopenTimer && els.every(a => a.hidden)) reopenTimer = setTimeout(() => { reopenTimer = undefined; reopen() }, 12000)
      }
      el.querySelector('.tb-btn')!.addEventListener('click', close)
      return () => el.querySelector('.tb-btn')!.removeEventListener('click', close)
    })

    addEventListener('resize', place)
    place()
    if (!reduce) raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(reopenTimer)
      removeEventListener('resize', place); closers.forEach(off => off())
    }
  }, [])

  return ADS.map((ad, i) => (
    <div key={i} ref={el => { if (el) refs.current[i] = el }} className={ad.horror ? 'ad horror' : 'ad'} role="complementary" aria-label="Advertisement">
      <div className="titlebar">
        <span>{ad.title}</span>
        <span className="tb-btns"><button type="button" className="tb-btn" aria-label="Close advertisement" /></span>
      </div>
      <img src={`/images/${ad.img}`} alt={ad.alt} />
      <div className="ad-body">
        <p>{ad.text}</p>
        <a className="ad-link" href={AD_URL}>{ad.link}</a>
      </div>
    </div>
  ))
}
