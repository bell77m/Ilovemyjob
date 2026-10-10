import { useEffect, useRef, useState } from 'react'
import { sfx } from '../lib/sfx'

// Marker href for every ad link: MemeAds catches the click (meme, then Clippy). Goes nowhere without JS.
export const AD_URL = '#ad'
const ADS = [
  { horror: true, title: 'THE SHROUD - Now Showing!', img: 'ghost.jpg', alt: 'A ghost in a white sheet and sunglasses standing in a dark parking garage',
    text: 'It has been waiting in the parking garage since 1996. Rated R for Really Scary. Coming to a theater near you... if you dare!', link: 'Click here for tickets!',
    sticker: 'R-RATED!', scarce: 'Only # tickets left!' },
  { horror: false, title: 'Shellfish Synergy Lunch', img: 'lobster.jpg', alt: 'Two cooked red lobsters piled together',
    text: 'Feeling stuck in your career? Our lobsters have been there. Pinch your way to the top at our Networking Lunch. Bring business cards!', link: 'Click here to book a claw!',
    sticker: 'FREE LUNCH*', scarce: 'Only # claws left!' },
  { horror: true, title: 'THE SHROUD - Midnight Screening', img: 'ghost.jpg', alt: 'A ghost in a white sheet and sunglasses standing in a dark parking garage',
    text: "Nobody leaves the parking garage. Nobody. Bring a friend. Or don't.", link: 'Click here before it finds you!',
    sticker: 'BOO!', scarce: 'Only # survivors left!' },
  { horror: false, title: 'Lobster Lunch - Limited Claws', img: 'lobster.jpg', alt: 'Close-up of red lobster claws and legs',
    text: 'Your next promotion is in the claws. Network over seafood and leave with a new job offer. Lunch is on us. Mostly.', link: 'Click here to reserve a seat!',
    sticker: '100% FREE!', scarce: 'Only # seats left!' },
]

// Fake urgency: counts 5 down to 1, then quietly "restocks". `#` in the text is the number.
function Scarcity({ text }: { text: string }) {
  const [n, setN] = useState(5)
  useEffect(() => {
    const t = setInterval(() => setN(v => (v > 1 ? v - 1 : 5)), 2000)
    return () => clearInterval(t)
  }, [])
  return <p className="scarce">{text.replace('#', String(n))}</p>
}

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
        // offsetWidth 0 = closed, or hidden by CSS on small screens
        if (!reopenTimer && els.every(a => !a.offsetWidth)) reopenTimer = setTimeout(() => { reopenTimer = undefined; reopen() }, 12000)
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
      <span className="sticker" aria-hidden="true">{ad.sticker}</span>
      <img src={`/images/${ad.img}`} alt={ad.alt} />
      <div className="ad-body">
        <p>{ad.text}</p>
        <Scarcity text={ad.scarce} />
        <a className="ad-link" href={AD_URL}>{ad.link}</a>
      </div>
    </div>
  ))
}

const BANNERS = [
  { cls: 'bn-red', img: 'bn-punch', head: 'PUNCH THE RECRUITER!', sub: 'Hit him 3 times and WIN a job offer!!!' },
  { cls: 'bn-navy', img: 'bn-recruiter', head: 'Lonely recruiters in YOUR area', sub: 'want to connect with you. Click to accept!' },
  { cls: 'bn-black', img: 'bn-trophy', head: 'Congratulations!!! You are our 1,000,000th applicant', sub: 'Claim your FREE unpaid internship now' },
  { cls: 'bn-teal', img: 'bn-money', head: 'Earn $5,000/week as a Thought Leader', sub: 'From home! No skills needed. Ask me how!' },
  { cls: 'bn-yellow', img: 'bn-ram', head: 'Download more RAM for your resume', sub: '100% FREE. Recruiters HATE this one trick' },
]

// Classic 468x60 rotating banner. `start` lets two banners on one page show different ads.
export function BannerAd({ start = 0 }: { start?: number }) {
  const [i, setI] = useState(start)
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % BANNERS.length), 6000)
    return () => clearInterval(t)
  }, [])
  const b = BANNERS[i % BANNERS.length]
  return (
    <div className="banner-ad" role="complementary" aria-label="Advertisement">
      <span className="small">Advertisement</span>
      <a href={AD_URL} className={`banner ${b.cls}`} aria-live="off">
        {/* Decorative clip art: the text already says everything */}
        <img src={`/images/${b.img}.webp`} alt="" width={52} height={52} />
        <span className="banner-text"><b>{b.head}</b><span>{b.sub}</span></span>
      </a>
    </div>
  )
}

const PEOPLE = [
  { name: 'Chad', title: 'Founder & CEO of Chad', bg: '#cc0000' },
  { name: 'Brenda', title: 'Bot. 500+ connections', bg: '#008080' },
  { name: 'Gary', title: 'Synergy Evangelist', bg: '#000080' },
  { name: 'Your Ex', title: 'Open to Work (on themselves)', bg: '#800080' },
  { name: 'Kevin', title: 'Thought Leader, Thinks a Lot', bg: '#808000' },
]

const JOBS = [
  { title: 'Unpaid Intern', note: '10+ years experience required' },
  { title: 'Junior CEO', note: 'Must be a "rockstar ninja"' },
  { title: 'Chief Vibes Officer', note: 'Salary: exposure' },
  { title: 'Entry Level', note: 'PhD preferred, 5 kids max' },
]
const TAGS = [['#Grateful', '1.2M'], ['#Hustle', '980K'], ['#AgreeQuestionMark', '640K'], ['#HumbledToAnnounce', '420K'], ['#MondayMotivation', '3']]

// Side columns fill the empty desktop margins; CSS hides them when the screen is too narrow.
export function Skyscrapers() {
  // One list of clicked buttons ("Chad", "job:Junior CEO") keeps every joke state in one place
  const [clicked, setClicked] = useState<string[]>([])
  const click = (k: string) => setClicked(v => [...v, k])
  return (
    <>
      <div className="sky sky-left">
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>PREMIUM 96</span></div>
          <div className="sky-body">
            <b className="sky-head">GO PREMIUM!</b>
            <img src="/images/bn-trophy.webp" alt="" width={120} height={120} />
            <p>See who viewed your profile!</p>
            <p className="small">(It was nobody.)</p>
            <ul>
              <li>InMail people who block you</li>
              <li>Gold badge nobody notices</li>
              <li>Feel slightly superior</li>
            </ul>
            <p className="sky-price">$49.95<span>/mo</span></p>
            <p className="small">First month free. Cancel by fax.</p>
            <a className="sky-btn" href={AD_URL}>UPGRADE NOW</a>
          </div>
        </aside>
        <aside className="window" aria-label="Hot jobs">
          <div className="titlebar"><span>Hot Jobs 4 U</span></div>
          <ul className="sky-body sky-list">
            {JOBS.map(j => (
              <li key={j.title}>
                <b>{j.title}</b><br /><span className="small">{j.note}</span><br />
                <button type="button" disabled={clicked.includes('job:' + j.title)} onClick={() => click('job:' + j.title)}>
                  {clicked.includes('job:' + j.title) ? 'Rejected (automated)' : 'Easy Apply'}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>WORK FROM HOME!!!</span></div>
          <div className="sky-body">
            <b className="sky-head">$5,000/WEEK</b>
            <img src="/images/bn-money.webp" alt="" width={120} height={120} />
            <p>Local mom makes millions typing "Agree?" under posts!</p>
            <p className="small">Results not typical. Or real.</p>
            <a className="sky-btn" href={AD_URL}>TELL ME HOW</a>
          </div>
        </aside>
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>Resume Scanner 96</span></div>
          <div className="sky-body">
            <p><b>WARNING:</b> Your resume has 0 buzzwords!</p>
            <div className="sky-bar" aria-hidden="true"><span /></div>
            <p className="small">Missing: synergy, rockstar, ninja, passionate</p>
            <a className="sky-btn" href={AD_URL}>FIX MY RESUME</a>
          </div>
        </aside>
      </div>
      <div className="sky sky-right">
        <aside className="window" aria-label="People you may know">
          <div className="titlebar"><span>People You May Know</span></div>
          <ul className="sky-body sky-list">
            {PEOPLE.map(p => (
              <li key={p.name} className="pymk">
                <span className="pymk-pic" style={{ background: p.bg }} aria-hidden="true">{p.name[0]}</span>
                <span><b>{p.name}</b><br /><span className="small">{p.title}</span><br />
                  <button type="button" disabled={clicked.includes(p.name)} onClick={() => click(p.name)}>
                    {clicked.includes(p.name) ? 'Pending forever' : '+ Connect'}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </aside>
        <aside className="window" aria-label="Trending hashtags">
          <div className="titlebar"><span>Trending #Hashtags</span></div>
          <ol className="sky-body sky-tags">
            {TAGS.map(([tag, n]) => <li key={tag}><b>{tag}</b> <span className="small">{n} followers</span></li>)}
          </ol>
        </aside>
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>LinkedIn Learning 96</span></div>
          <div className="sky-body">
            <p><b>Course:</b> How to Cry in a Post (Professionally)</p>
            <div className="sky-bar" aria-hidden="true"><span /></div>
            <p className="small">99% complete. Forever.</p>
            <a className="sky-btn" href={AD_URL}>RESUME COURSE</a>
          </div>
        </aside>
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>Recruiters Near U</span></div>
          <div className="sky-body">
            <img src="/images/bn-recruiter.webp" alt="" width={120} height={120} />
            <p><b>3 lonely recruiters</b> want to "pick your brain"!</p>
            <p className="small">Unpaid. 45 minutes. Camera on.</p>
            <a className="sky-btn" href={AD_URL}>CHAT NOW</a>
          </div>
        </aside>
        <aside className="window" aria-label="Advertisement">
          <div className="titlebar"><span>FREE RAM.EXE</span></div>
          <div className="sky-body">
            <b className="sky-head">DOWNLOAD MORE RAM</b>
            <img src="/images/bn-ram.webp" alt="" width={120} height={120} />
            <p>Fit 40 more skills on your resume!</p>
            <p className="small">Totally not a virus.</p>
            <a className="sky-btn" href={AD_URL}>DOWNLOAD</a>
          </div>
        </aside>
      </div>
    </>
  )
}

const MEMES = [
  { img: 'meme-cat.webp', alt: 'A serious cat in a business suit between two laptops', top: 'When the ad says "free lunch"', bottom: "But it's a 3-hour webinar" },
  { img: 'meme-cry.webp', alt: 'A man in a suit crying while smiling with two thumbs up', top: 'Me after accepting the unpaid internship', bottom: 'So grateful for this opportunity' },
  { img: 'meme-dog.webp', alt: 'A golden retriever in glasses and a tie at two old computers', top: 'You clicked an ad', bottom: "Congrats, you're a qualified lead now" },
  { img: 'lobster.jpg', alt: 'Two cooked red lobsters piled together', top: 'Came for the networking lunch', bottom: 'Was the lunch' },
  { img: 'ghost.jpg', alt: 'A ghost in a white sheet and sunglasses in a parking garage', top: 'The recruiter who ghosted you', bottom: 'Still viewing your profile daily' },
  { img: 'meme-dog.webp', alt: 'A golden retriever in glasses and a tie at two old computers', top: 'Me reading the job description', bottom: 'Already clicked Easy Apply' },
  { img: 'meme-cry.webp', alt: 'A man in a suit crying while smiling with two thumbs up', top: 'Rejected by an automated email', bottom: 'Thrilled to share this learning moment' },
  { img: 'meme-cat.webp', alt: 'A serious cat in a business suit between two laptops', top: 'Boss: we are a family here', bottom: 'Me: so I can nap on the keyboard?' },
]

// Every ad click shows a meme first. One capture listener covers every ad link on the page,
// so new ads get memes for free. "Claim prize" summons Clippy.
export function MemeAds() {
  const ref = useRef<HTMLDialogElement>(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    let first = true
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.(`a[href="${AD_URL}"]`)
      if (!a) return
      e.preventDefault()
      // Start at a random meme, then walk the list so repeat clicks never show the same one twice in a row
      setN(v => (first ? Math.floor(Math.random() * MEMES.length) : v + 1))
      first = false
      sfx.tada()
      if (ref.current && !ref.current.open) ref.current.showModal()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  const m = MEMES[n % MEMES.length]
  return (
    <dialog ref={ref} className="dialog window" aria-labelledby="meme-title">
      <div className="titlebar"><span id="meme-title">You won a FREE meme!</span></div>
      <div className="meme">
        <img src={`/images/${m.img}`} alt={m.alt} />
        <span className="meme-top">{m.top}</span>
        <span className="meme-bottom">{m.bottom}</span>
      </div>
      <p className="small center">Meme #{n + 1} of &infin;. Share with your network!</p>
      <button type="button" className="sky-btn meme-go" onClick={() => { ref.current?.close(); dispatchEvent(new Event('clippy')) }}>CLAIM YOUR PRIZE</button>
      <form method="dialog" className="buttons meme-actions">
        <button type="button" onClick={() => setN(v => v + 1)}>Next meme</button>
        <button className="default">Close</button>
      </form>
    </dialog>
  )
}
