# Storypop: picture stories for kids

An Expo (React Native) app for iPhone, iPad, Android phones and Android tablets. It has no backend. Built-in stories ship inside the app, and stories that kids make stay on the device.

The goal is to grow imagination, attention span and critical thinking. Every story has a cast of characters and a few learning prompts built in.

## What's in it

| Area | What it does | Code |
|------|--------------|------|
| **Home** | Animated hero scene, the featured Big Story, "coming soon" teasers, and the genre grid | `src/screens/Home.tsx` |
| **Library** | 6 genres × 6 stories × 15 pages: 540 pages, about 20,000 words of dialogue-rich text | `src/content/stories/*.ts` |
| **Characters** | About 70 drawn characters and objects with soft 3D shading and ground shadows. No emoji | `src/avatars.ts`, `src/AvatarView.tsx` |
| **Scenes** | Shaded backdrops with animated characters. Scenes marked `motion` play like a short clip and have a ↻ Replay button | `src/Scene.tsx` |
| **Reader** | Cover → "Meet the characters" → pages with a 3D page turn → The End. **Read to me** reads aloud and turns pages by itself, pausing on prompts | `src/screens/Reader.tsx` |
| **Learning prompts** | **Predict** (what happens next?), **Think** (a "why" question with choices and gentle hints), **Imagine** (open, no wrong answer), **Find it** (tap the character in the scene) | `src/content/dsl.ts` (`Prompt`) |
| **The Big Story** | "The Night the Moon Got Stuck": 5 chapters × 3 heroes × 3 pages. Switch point of view on any chapter | `src/content/sagas.ts`, `src/screens/SagaScreen.tsx` |
| **Make a story** | Guided builder: genre, hero, friend and place, then 5 "what happens next?" steps | `src/content/builder.ts`, `src/screens/Builder.tsx` |
| **Make my own version** | Copies any built-in story into My stories to edit | `App.tsx` (`remix`) |
| **My stories** | Kids' own stories. Any page's scene can be swapped for a photo | `src/screens/Library.tsx`, `src/screens/Editor.tsx` |
| **Share** | A grown-ups-only gate, then a picture-book PDF opens in the system share sheet | `src/ParentGate.tsx`, `src/share.ts` |

## Run it

```bash
cd ~/Money/store-apps/shortstories
npx expo start --ios          # iPhone simulator
```

**iPad:** run one simulator at a time. Shut down the iPhone simulator, boot an iPad in DeviceHub (Xcode → Open Developer Tool → DeviceHub), then run the same command.

**Android emulator:** start a phone or tablet emulator from Android Studio's Device Manager, then run `npx expo start --android`.

**Real phone or tablet:** install Expo Go, run `npx expo start`, and scan the QR code. This works on Android too.

## What to test

**Characters and scenes**
- [ ] No emoji characters anywhere. Every person, animal and object is a shaded drawing standing on a soft shadow
- [ ] Characters bob, hop, float and spin. Motion scenes move across the screen, and ↻ Replay restarts them

**Reading**
- [ ] The second page of every built-in story is "Meet the characters", with avatars, names and a line about each
- [ ] Long pages scroll up and down, and swiping left and right still turns pages
- [ ] **Think:** a wrong answer gives a gentle hint, and the right answer turns green and shows the lesson
- [ ] **Find it:** tapping the wrong thing gives a buzz, and tapping the right character says "You found it!"
- [ ] **Predict / Imagine:** the button marks the prompt as done
- [ ] **Read to me** reads the page, then the question, and waits. After you answer, it says the response and turns the page
- [ ] The progress bar at the bottom fills as you read

**Phone and tablet layout**
- [ ] iPhone: the picture, text and prompt fit on one page or scroll smoothly
- [ ] iPad: bigger text and pictures. Rotation and Split View don't cut anything off

**Big Story, builder, sharing**
- [ ] Big Story: pick a hero, finish a chapter, then "What did X see?" switches hero
- [ ] Builder: the hero and friend pickers show drawn avatars. All 7 steps work
- [ ] Share: the PDF shows the drawn characters on each page

## Add or edit stories

Stories use a compact notation (full guide at the top of `src/content/dsl.ts`):

```ts
{
  id: 'my-story', genre: 'ocean', title: 'My Story', blurb: 'One line for the list.',
  cast: { finn: { name: 'Finn', about: 'A shy little fish.', look: { kind: 'fish' } } },
  pages: [
    ['Page text with “dialogue”.', 'ocean | finn@.3 float, shell@.7 d.2 s.6 none | bubbles'],
    ['More text.', 'ocean | finn@.1->.8 float | motion', 'find:finn Can you find Finn?'],
  ],
}
```

- **Scene:** `backdrop | actors | flags`
  - Backdrops: `meadow forest ocean space castle night snow desert`
  - Actors are written `name@x[->to] [dN] [sN] [anim] [flip]`. `dN` is depth, from 0 (front) to 1 (back). `sN` is size.
  - Animations: `bob hop spin float walk none`
  - Flags: `motion stars snow bubbles sparkles`
  - `name` is a cast id or any drawing kind. Add `#hex` to recolour it, for example `fish#7CC8FF`.
- **Prompts:**
  - `predict: …`
  - `imagine: …`
  - `find:<actor> …`
  - `think: Question? | wrong | *right | wrong >> lesson`
- Every drawing kind is listed in `kinds` in `src/avatars.ts`.

After editing, run the content checker. It fails on any typo in a scene or prompt:

```bash
npx tsx scripts/check-content.ts
```

To see every drawing on one sheet: `npx tsx scripts/gallery.ts gallery.svg`, then open the file.

## Future releases

All of these show as non-tappable 🚧 **Coming soon** cards (`src/ComingSoon.tsx`). App Review rejects buttons that lead nowhere (guideline 2.1). Remove each card when its feature ships.

- **AI "describe your story":** turns a free-text idea into a story. It needs a small server and has a cost per story. The card is on Home and in the builder.
- **Story Series:** long manga-style serials: 3 seasons per series, 72 chapters per season, with a new chapter each week. The card is on Home.
  - **Plan:** the same page notation, nested as series → season → chapter. The app would save reading progress per chapter and add a "Continue reading" row on Home.
  - **Delivery:** 216 chapters is too much to ship inside the app. Chapters should download from a simple hosted JSON file (free static hosting), so new chapters go out without an App Store update.
  - **Content:** the series story will be supplied separately. Plain text per chapter is fine; it gets converted to the page notation.

## Checks

```bash
npx tsc --noEmit
npx expo-doctor
npx tsx scripts/check-content.ts
```
