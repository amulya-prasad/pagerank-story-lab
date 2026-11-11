# The Influence Experiment — Stats & Scribbles

A standalone, Vercel-ready Next.js/TypeScript PageRank storytelling lab.

## Run locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Create a GitHub repository, push this project, then import it at https://vercel.com/new. Framework preset: **Next.js**. No environment variables or backend required.

## Features

- Personal name, editable player node, photo upload for every node
- 10 starter tech figures plus 6 optional figures, custom participants
- Interactive directed network, draggable nodes, orbit and community views
- Editable endorsement matrix, follower-vs-PageRank scatterplot, rank-history chart
- Four guided, narrated experiments with explanations next to each plot
- Leaderboards for PageRank and raw incoming endorsements
- Damping factor, undo, JSON export, share links (without uploaded photos)

## Images

Select a person, then use **Upload portrait**. Uploaded photos are browser-session-only and aren't sent to a server. To ship permanent photos, add appropriately licensed files under `public/portraits/` and assign `photo: '/portraits/filename.webp'` to the corresponding person in `lib/network.ts`. For example, add `photo` to a catalog entry. Do not commit photos without permission to use them.

## Educational assumptions

All links between public figures are synthetic and fictional. The graph does **not** claim to represent real-world endorsements, professional connections, or actual influence. PageRank is computed with a standard iterative algorithm and uniform redistribution for dangling nodes.

## Architecture

- `lib/network.ts`: graph model, catalog, scenarios, PageRank
- `components/Lab.tsx`: interactive state, storytelling, charts, controls
- `components/NetworkGraph.tsx`: network layouts and interactions
- `components/Portrait.tsx`: image-backed circular avatars
- `app/globals.css`: editorial visual design

## Known constraints

Large uploaded photos are not included in share links; JSON export includes image data. Rank-history captures graph edits and scenario runs, but not every drag movement. No real-world social graph is fetched.
