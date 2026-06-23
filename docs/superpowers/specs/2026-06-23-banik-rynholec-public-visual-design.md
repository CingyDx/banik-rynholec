# TJ Banik Rynholec Public Visual Design

## 1. Direction

The accepted direction is **matchday editorial**: a confident local sports identity built from the existing crest, real venue photography, condensed display typography, dense fixture information, and crisp black/white/green bands. It must feel like a living football club rather than a generic municipal or template website.

Accepted concept references:

- `docs/design/concepts/homepage-first-viewport.png`
- `docs/design/concepts/homepage-continuation.png`
- `docs/design/concepts/homepage-mobile.png`

## 2. First Viewport

- A compact black header contains the supplied crest, club name, essential navigation, and one booking command.
- The real Rynholec pitch photograph is full-width and remains recognizable. The image has no green color wash or decorative blur.
- The H1 is the literal name `TJ BANÍK RYNHOLEC` in a tall condensed display face.
- Supporting copy is `Fotbal, sport a areál pro celý Rynholec`.
- The primary command is `Rezervovat areál`.
- The upcoming-program band enters the first desktop and mobile viewport so visitors immediately see that the site is operational.

## 3. Section Order

1. Header, venue hero, and upcoming-program entry.
2. Full upcoming-program list.
3. Team strip: `Přípravka`, `Žáci`, `A tým`, `Stará garda`.
4. Sports-complex section with the pitch, gym, and sauna.
5. Club-news rail.
6. Contact and footer band.

Supporting routes reuse the same header, typography, band rhythm, rules, and command styles without repeating the homepage hero.

## 4. Design System

### Color

- True black and near-black for header, team band, news band, and footer.
- True white for primary page surfaces and reversed text.
- Deep forest green from the supplied crest for brand anchoring.
- Brighter grass green for commands, focus, and directional details.
- Cool gray for secondary text and rules.
- Warm yellow is limited to dates and match-state emphasis.
- No beige, purple, blue gradient, glow, or decorative color orb.

### Typography

- Condensed display sans for the club name, page titles, section titles, dates, and team labels.
- Neutral highly legible sans for navigation, body copy, controls, and metadata.
- Letter spacing remains zero. Font sizes do not scale directly with viewport width.
- Mobile headings wrap intentionally and never overlap imagery or controls.

### Geometry

- Corners use 0-6px radii.
- Layouts prefer open bands, rules, schedule rows, and media frames over card grids.
- Green/black diagonal stripes derived from the lower crest shape are the only decorative motif.
- Buttons are rectangular commands with deliberate type and an arrow/calendar icon where useful.
- Familiar controls use Lucide icons; the menu control has a stable 44px minimum touch target.

## 5. Allowed First-Viewport Copy

- `TJ BANÍK RYNHOLEC`
- `Domů`
- `Klub`
- `Týmy`
- `Novinky`
- `Kalendář`
- `Areál`
- `Kontakt`
- `Fotbal, sport a areál pro celý Rynholec`
- `Rezervovat areál`
- `Nejbližší program`
- `A tým`
- `Žáci`
- `Přípravka`

No eyebrow, badge, fake statistic, promotional claim, or invented trophy may be added above the fold.

## 6. Assets

- The supplied PDF is the source of truth for the crest. The website uses a transparent raster export without redrawing or changing the mark.
- The municipality sports-complex photographs are temporary first-look assets and must keep source attribution in project documentation.
- The current municipality images are low resolution. The first look may use them for review, but launch quality requires original-size photos or a new club photo set.
- Concept imagery is a layout reference, not evidence of exact venue detail and not a substitute for the real photo files.

## 7. Responsive Behavior

- Desktop keeps schedule information in dense horizontal rows.
- Mobile changes schedule rows to a stacked date/time/team structure without turning the whole page into identical cards.
- The header collapses to crest, club name, and icon menu.
- The venue remains recognizable in the mobile crop.
- Every fixed-format control and media element has stable dimensions so content cannot shift the layout.
- The page must have no horizontal overflow at 390px width.

## 8. Motion And Interaction

- Header and navigation state changes are quick and restrained.
- Schedule and editorial links use directional underline/arrow motion.
- The mobile menu opens as a practical navigation surface and traps no keyboard focus.
- `prefers-reduced-motion` disables non-essential transitions.

## 9. Verification Standard

- Browser renders are compared directly with all three accepted concept images.
- Verification covers first-viewport balance, exact copy, typography, palette, image crop, schedule density, section order, icon treatment, and mobile overflow.
- The implementation is not complete while a fixable visual mismatch, clipped element, missing image, inert menu, or placeholder route remains.

