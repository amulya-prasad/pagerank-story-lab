# The Influence Experiment
### An Interactive PageRank Lab by Stats & Scribbles

*What makes someone influential? Is it the number of people who know them, or the importance of the people who do?*

Imagine two startup founders. Kevin knows thousands of people. Dave knows barely a hundred. But one afternoon, Dave meets someone extraordinarily influential.

Does that one connection matter more than Kevin's thousands?

**The Influence Experiment** is an interactive network laboratory exploring reputation, authority, and influence through **PageRank**. It is part of **Stats & Scribbles**, a project about storytelling through mathematics, algorithms, and simulations.

## 01. The mathematics of influence

PageRank was developed by Larry Page and Sergey Brin to rank webpages using the structure of links between them. Its key insight is simple: **not all connections carry equal weight**.

A node endorsed by important nodes can receive a higher PageRank than one with more endorsements from less important nodes.

For a node \(i\), the PageRank equation is:

$$
PR(i) = \frac{1-d}{N} + d\sum_{j\rightarrow i}\frac{PR(j)}{L(j)}
$$

Where:

| Symbol | Meaning |
|---|---|
| \(PR(i)\) | PageRank score of node \(i\) |
| \(d\) | Damping factor, commonly 0.85 |
| \(N\) | Number of nodes |
| \(j \rightarrow i\) | A directed link from \(j\) to \(i\) |
| \(L(j)\) | Number of outgoing links from node \(j\) |

The algorithm repeatedly updates scores until they converge. Nodes without outgoing links have their probability redistributed uniformly.

### The random surfer

Imagine someone moving through a network. At each step, they either follow a link from their current node or jump to a randomly selected node. The damping factor determines the relative likelihood of following a link. PageRank represents the long-run probability of visiting each node.

## 02. Enter the network

Add your name to a fictional network of technology personalities and experiment with connections. An arrow **A → B** means **A endorses B**; authority flows toward B.

You can:

- Add and customize participants, including your own node.
- Create, remove, and redirect endorsements.
- Drag nodes in the free network layout.
- Explore community clusters and an influence orbit.
- Upload portraits for nodes.
- Adjust the damping factor and compare scores.
- Inspect the endorsement matrix, scatterplot, rank history, and leaderboards.
- Undo changes and export or share graph configurations.

**Larger portraits indicate higher PageRank scores**, not necessarily more incoming endorsements.

## 03. Four guided experiments

### Experiment 01 — The Popularity Paradox

**Question:** Does having more endorsements necessarily make someone more influential?

Compare the **incoming endorsement leaderboard** with the **PageRank leaderboard**, then inspect the **follower-versus-PageRank scatterplot**. A node with relatively few endorsements may outrank a more frequently endorsed node if its incoming links come from authoritative sources.

**Try:** Find two nodes whose endorsement counts and PageRank positions disagree.

**Takeaway:** Popularity and structural authority are different measurements.

### Experiment 02 — The Power of One Connection

**Question:** Can one endorsement reshape the rankings?

Add a link from a high-ranking node to your own, then compare the resulting score with an endorsement from a lower-ranking node. The benefit depends on the source's authority **and** how many outgoing endorsements that source already has.

**Try:** Record your PageRank before and after adding each link. Undo between trials for a fair comparison.

**Takeaway:** Who endorses you matters, but their attention is divided among their outgoing links.

### Experiment 03 — The Echo Chamber

**Question:** How does authority behave inside tightly connected communities?

Use the **community-cluster view** and **endorsement matrix** to examine links within and between groups. Add connections inside one group, then create bridges to other groups and compare the PageRank distribution.

**Try:** Contrast an internally connected community with the same community after adding cross-group links.

**Takeaway:** Network structure affects where authority accumulates and how it spreads; internal density alone does not guarantee global importance.

### Experiment 04 — The Random Surfer

**Question:** How much do PageRank rankings depend on the damping factor?

Lower damping makes random jumps more influential and generally flattens score differences. Higher damping gives the link structure greater influence.

**Try:** Compare rankings at several damping values using the **leaderboard**, **influence orbit**, and **rank-history chart**.

**Takeaway:** Rankings reflect both the network and the algorithm's assumptions.

> Experiment titles and descriptions are educational guides. If the scenario buttons in `lib/network.ts` use different names or presets, align these sections with the actual application behavior.

## 04. Reading the visualizations

| Visualization | What it shows |
|---|---|
| Directed network | Who endorses whom and where authority flows |
| Community clusters | Connections within and between groups |
| Influence orbit | Relative importance according to PageRank |
| Endorsement matrix | The directed links in the graph |
| Incoming endorsements vs. PageRank | Popularity compared with structural authority |
| Rank-history chart | Ranking changes after edits and scenario runs |
| Leaderboards | PageRank compared with raw incoming endorsement counts |

## 05. Questions to explore

- Can a node with five endorsements outrank one with fifty?
- Does the highest-ranked node always provide the biggest boost?
- What happens when a powerful node endorses many additional people?
- Can a small community outrank a larger one?
- What changes when a central node is removed?
- Which nodes are most sensitive to damping?

## 06. How the lab works

The network is a directed graph \(G=(V,E)\), where \(V\) is the set of participants and \(E\) is the set of endorsements. PageRank is computed iteratively, including uniform redistribution for dangling nodes. The application is built with **Next.js**, **TypeScript**, **React**, and interactive **SVG** graphics.

### Project structure

| File | Purpose |
|---|---|
| `lib/network.ts` | Graph model, catalog, scenarios, PageRank computation |
| `components/Lab.tsx` | Application state, charts, storytelling, controls |
| `components/NetworkGraph.tsx` | Network layouts and interactions |
| `components/Portrait.tsx` | Circular portrait rendering |
| `app/globals.css` | Visual design and responsive styling |

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To check the production build:

```bash
npm run build
```

## 07. Data and image notes

**All connections between public figures are synthetic and fictional.** They do not represent verified endorsements, real-world professional relationships, or measured influence. PageRank measures structural importance **within the graph supplied**, not intelligence, achievement, or real-world worth.

Uploaded portraits are browser-session-only and are not sent to an application backend. Share links exclude uploaded image data; JSON exports may include it. To add permanent images, place appropriately licensed files under `public/portraits/` and reference them in `lib/network.ts`. Do not commit images without permission to use them.

Rank history captures graph edits and scenario runs, but not every drag movement. No real-world social graph is fetched.

## 08. Beyond search engines

The mathematics of PageRank can be applied to citation networks, knowledge graphs, dependency networks, and other directed systems. Its interpretation always depends on what nodes and links mean.

**Is influence something we possess, or something the network gives us?**

---

*Stats & Scribbles — Stories told through mathematics, algorithms, and a little computational mischief.*

**Explore the network. Change the connections. See who matters.**
