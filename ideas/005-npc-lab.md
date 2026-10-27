---
title: "NPC lab"
status: spark
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/5
created: 2026-10-26
updated: 2026-10-27
---

# NPC lab

**The spark** (one or two lines)
Let's create a agent or model that act as a NPC with full autonomy.

Like we can feed particular persons psychology and habits to a agent and make it behave like him..like mirofish but for indian demographic 
**Why it's interesting**
1. We can create a video where all kind of npc interact with each other like a bigboss - GTA GAME. Like give a task and see what agent is doing

2. Prediction like if I release this product or service how Indian demographic people would react to that -market analysis

**First step, if I were to try it**
1. Try and learn about methods to collect about building small models and data need to make a anonymous decision about something

## Progress log

### 2026-10-27 · @Rahulgandhi-dhanapal

<!-- spark-lab:analysis -->
## 🤖 Claude · VC review: NPC Lab

**Verdict: the most exciting idea on the board, but split it in two.** The **entertainment** version is feasible now. The **market prediction** version is a real market with very well-funded competitors and a hard validation problem.

| | Entertainment | Market prediction |
|---|---|---|
| Problem is real | 5/10 | 8/10 |
| Market size | 6/10 | 9/10 |
| Feasibility for this team | 8/10 | 3/10 |
| Moat | 3/10 | 5/10 (if India-specific data) |
| Investable today | 2/10 | 2/10 |

### ❌ What's wrong
1. **Two very different products are mixed together:** a Bigg Boss/GTA-style show (content) and a consumer prediction engine (B2B SaaS). Different customers, different skills.
2. **"Build small models" is the wrong first step.** You don't need to train anything. Existing LLMs plus persona prompts plus memory are enough. That's how the Stanford "Generative Agents" paper and MiroFish work.
3. **LLM personas are biased toward the English-speaking internet.** Simulated "Indian demographics" will mostly reproduce urban, English-speaking stereotypes, not a farmer in Tiruvannamalai.
4. **Predictions you can't verify are worthless.** Without comparing them to real survey results, nobody can trust that "Indians would react like X".
5. **"Feed a particular person's psychology"** to mimic a real person needs that person's consent.

### 🤔 Why it's wrong
- In market simulation, the moat is **proof that your simulations match reality**, and that needs real human data to calibrate against. That's expensive and slow.
- The competitors raised hundreds of millions to solve exactly this, and a two-person team can't out-build them on the general problem.

### 🔧 How to make it right
1. **Start with entertainment (2–3 weekends):** *"10 AI agents in a Bigg Boss house: Chennai edition"*. Personas such as an auto driver, an IT techie and a filter-coffee uncle, with daily tasks and evictions. Publish it on the YouTube idea's channel.
2. **Use existing tools:** an LLM API plus a simple loop for memory and reflection, or fork **MiroFish** or **CAMEL-AI's OASIS** instead of building from scratch.
3. **If the show gets traction, test prediction on a small scale:** pick **one narrow India niche** (e.g. *"How would Chennai IT workers react to this food delivery offer?"*), run the simulation, then **run a real 100-person survey** and compare. If the two match, that's your moat and your pitch deck.
4. **Use fictional personas, not real people,** unless you have consent.

### 🌍 The space
| Player | What they do | Lesson |
|---|---|---|
| **Simile** (Stanford Generative Agents team) | AI-simulated consumer populations to replace focus groups; $100M Series A (Feb 2026) | The category is real and hot, but funded at a level you can't match head-on |
| **Aaru** | AI prediction engine simulating consumers; Series A reported at up to $1B valuation (Dec 2025) | Investors pay for this. The winner is whoever proves accuracy |
| **MiroFish** (open source, AGPL) | A swarm of thousands of agents on a simulated social network to predict trends | Start from this, don't rebuild it. Note that AGPL licensing matters if you commercialise |
| **India-specific simulation** | Mostly empty | Your real gap, but only defensible with Indian ground-truth data |

**Next step:** build a 5-agent Bigg Boss prototype this weekend and record a 60-second short of the funniest moment.

