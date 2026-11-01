# Siddhant Pardeshi — The Builder's Playground

Portfolio website: editorial design, playable backend explanations, Byte the capybara guide,
a dedicated recruiter view, and automatic publishing through GitHub Pages.

**Live URL:** https://siddhant-pardeshi.github.io/
**Recruiter view:** https://siddhant-pardeshi.github.io/recruiter.html

---

## 1. Run it locally

Any static server works. From this folder:

```
npx serve .            # or: python -m http.server 8080
```

Then open http://localhost:3000 (or :8080). Opening `index.html` directly from disk also works.

## 2. Where the content lives (single source of truth)

| What | Where |
|---|---|
| All facts, links, skills, achievements, credentials | `js/content.js` |
| LinkedIn posts (curated) | `js/content.js` → `postsConfig.posts` |
| GitHub featured repos + descriptions | `js/content.js` → `repos` |
| Gallery photos & captions | `js/content.js` → `galleryItems` |
| "More builds" projects | `js/content.js` → `moreProjects` |
| About-section portrait | `js/content.js` → `site.aboutPortrait` + `assets/portrait/` |
| Availability text | `js/content.js` → `site.availability` |
| Resume PDF | `assets/resume/Siddhant_Pardeshi_General_Resume.pdf` |
| Live GitHub stats | `data/github-snapshot.json` (auto-generated — never hand-edit) |

**Photo asset map** (owner-supplied, renamed for the web):
`assets/portrait/` formal portraits · `assets/hackathons/metro-hackathon/` OpenAI
DevDay Exchange – Metro Hackathon Pune · `assets/hackathons/fusion-2026/` Fusion @
SKNCOE · `assets/hackathons/genspark/` Genspark community event ·
`assets/events/tech-meetups/` community meetups & office visits ·
`assets/hobby/jivdhan-trek/` Jivdhan Fort trek & camping. Two event videos play
in the lightbox. To add more: drop files in the matching folder, add a
`galleryItems` record, push.

**Every change publishes itself:** edit → commit → push to `main`. The `Deploy portfolio`
workflow builds and publishes to Pages automatically. That's the whole release process.

## 3. Adding LinkedIn posts (owner-maintained)

LinkedIn member-post retrieval requires approved API access that doesn't exist yet, so posts are
curated by you — honestly labeled on the site as owner-maintained (never as a live feed).

In `js/content.js` → `postsConfig`:

```js
posts: [
  {
    id: "p1",                              // anything unique
    url: "https://www.linkedin.com/feed/update/urn:li:activity:…",  // real post URL
    title: "Short headline",
    excerpt: "One or two lines you approve of",
    publishedAt: "2026-05-20",             // optional ISO date
    featuredRank: 1                        // 1 = most popular (leads the spotlight)
  }
]
```

- **Popular order:** set `featuredRank` (1, 2, 3…). Lower number = higher rank. A new post never
  displaces your #1 unless you renumber.
- **Latest post:** set `latestPostId` to the post YOU confirm is newest. It is chosen
  independently of popularity.
- **Featured spotlight:** `featuredPostId` (defaults to rank 1).
- Then set `postsUpdatedAt: "2026-11-01"` (or the edit date).
- Optional verified figures: `reactions: 123` + `measuredAt: "2026-11-01"` — figures only ever
  show with their snapshot date.
- Byte's menu ("Read the featured/latest LinkedIn post") and the recruiter view pick these up
  automatically.

## 4. Adding photos

1. Drop files into the right folder:
   - `assets/hackathons/metro-hackathon/`, `assets/hackathons/autonomous-ui-testing/`,
     `assets/hackathons/fusion-2026/` — event photos
   - `assets/portrait/` — your portrait
   - `assets/certificates/` — certificate scans
   - `assets/projects/banknest/ | lifedrop/ | metromind/` — screenshots
2. In `js/content.js` → `galleryItems`, change/add a record:

```js
{
  id: "g-metro-photo1",
  src: "assets/hackathons/metro-hackathon/team-photo-1.jpg",
  category: "team",                       // hackathons | team | projects | certificates | portrait
  caption: "Team UrbanSync during the final demo",   // describe the ACTUAL photo
  eventName: "Metro Hackathon Pune",
  date: "2026-05-18"                      // optional
}
```

Keep the placeholder records you like; delete the ones replaced. The lightbox, filters, and
touch/swipe all work with real photos automatically. Until photos exist, tiles render as designed
illustrations clearly marked "photo coming soon" — never fake photos.

## 5. Automatic updates — source by source

| Source | Method | Freshness |
|---|---|---|
| Site content, photos, resume, posts | You edit + push → auto build & deploy | Event-driven (on push) |
| GitHub repo stats (stars/forks/updated) | `Refresh content` workflow, every ~15 min + manual run in the Actions tab | Periodic (GitHub may delay scheduled runs) |
| LinkedIn posts | Owner-curated in `content.js` | Manual (awaiting approved API access — documented, not claimed as live) |
| Open tabs | Pages check `data/version.json` on focus/every ~100 s and offer "Refresh view" | Real, no position jumps |

The GitHub sync only commits when repository data meaningfully changed — a fetch timestamp alone
never triggers a redeploy. Failures keep the last-known-good snapshot. Scheduled workflows pause
after 60 days of repo inactivity — just run the workflow manually or push to re-enable.

## 6. Manual refresh & recovery

- **Manual refresh:** Actions → "Refresh content" → Run workflow.
- **Manual deploy:** Actions → "Deploy portfolio to GitHub Pages" → Run workflow.
- **Bad deploy?** Revert the commit on `main` and push — the previous site returns on the next
  run. Failed validations never replace the working site (deploy needs the build job to pass).
- **Expired/failed syncs:** check the workflow log in Actions; tokens stay in GitHub's secret
  store, never in files.

## 7. Experience settings (visitor-facing)

Motion (Full / Reduced / Off — follows OS preference until changed) and Sound (off by default,
opt-in) live in the ⚙ nav control. Byte can be hidden and restored from the same panel.
Ctrl/Cmd+K opens the command palette anywhere.

## 7a-2. Sound design (opt-in, default OFF)

Every interaction has a signature sound behind the ⚙ **Sound: on** toggle — nothing
plays until the visitor opts in, and everything is synthesized locally with WebAudio
(no audio files, no CDN):

| Interaction | Sound |
|---|---|
| Trace a request | 4-note ascending signal arpeggio following the pulse |
| Transfer sim | step ticks per pipeline stage · major chord on commit · descending buzz on rollback |
| LifeDrop sim | water-drop sweep on approve · confirm chord on fulfill |
| Lightbox / polaroid | soft camera shutter |
| Filters, tour steps | tiny ticks |
| Palette / case studies | slide sweep |
| Section changes | two-note motif (Byte comments too) |
| Byte petting | purr with rumble vibrato + a little "mrrp!" tail |
| Byte dance / celebrate / excited | jingle / chime / boing |

Cooldowns prevent stacking; `tick` has its own shorter throttle. Sound state
persists in localStorage and never turns on automatically.

## 7b. Hand-tracked particles (webcam feature)

An opt-in, full-screen experience (hero → "Hand control ✋", Byte's menu, or Ctrl+K):
your hand drives a particle swarm — portal ring follows the palm, open hand bursts
it apart, a fist collapses it into a swirling sphere, ✌️ streams particles from
the fingertips.

**Privacy:** the camera is requested only when the overlay opens, and MediaPipe
HandLandmarker (WASM, loaded from jsDelivr) processes every frame **on-device**.
Nothing is recorded, stored, or uploaded — closing the overlay stops the camera
immediately.

**Behavior details:**
- ~6 MB engine + model download happens on first open, then is browser-cached.
- Works on phones (front camera) and desktops over HTTPS.
- Permission denied / no camera / offline → clear inline messages; the rest of
  the site is unaffected.
- Motion setting "Reduced" halves the particle count; "Off" disables the entry
  point with an explanatory toast.
- Dev check: open `?handfx-test=1` to run the overlay with a synthetic hand
  (no camera, no model) — useful for demos and automated testing.
- Tuning knobs live at the top of `js/handfx.js` (colors, particle target count,
  gesture thresholds in `classify()`).

## 8. Facts policy (please keep following it)

The site deliberately makes no unsupported claims: the hackathon result stays a **team** result,
AWS stays a **training credential** (not an exam pass), IT Vedant stays **in progress**, and no
dates, metrics, or roles were invented. When you add content, keep the same bar — recruiters
notice.
