---
title: "nest - a food review app"
status: spark
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/1
created: 2026-10-26
updated: 2026-10-27
---

# nest - a food review app

**The spark** (one or two lines)

1. This app lets user to add review about the food they have eaten and restarunt that they have visited and recipes that they have tried.
2. people can create a trails of their food journey and publish it ex the ultimate biriyani trails.
3. community members can follow others food trails based on their taste.  

**Why it's interesting**
how about we expand further then food, like a review platform for everything like electronics, service centers, cources....

**First step, if I were to try it**
repo : https://github.com/Rahulgandhi-dhanapal/pfecnest



## Progress log

### 2026-10-27 · @Rahulgandhi-dhanapal

<!-- spark-lab:analysis -->
## 🤖 Claude · VC review: Nest

**Verdict: strong builder, unproven product.** Would I invest today? Not yet. Bring 8 weeks of retention data from one area and I take the meeting.

| | Score |
|---|---|
| Problem is real | 7/10 |
| Market size (India food discovery) | 8/10 |
| Feasibility for this team | 9/10 (it's already built) |
| Moat | 4/10 |
| Investable today | 3/10 |

*Reviewed from the `pfecnest` repo (about 185 commits, 17–22 Oct): takes, taste match, trails with hidden stops, map, journeys, month recap, recipes, shopping list, Ask Nest, admin. Eat Together is designed.*

### ✅ What's genuinely good
- **The thesis is sharp:** "Zomato tells you what's open and discounted. Nest tells you what people with *your* taste loved. No stars, nothing paid for by restaurants."
- **Product details show real taste:** hidden trail stops with a stable fuzzy area (you thought about triangulation!), the after-dinner nudge to collect takes, and a Wrapped-style month recap people will want to share.
- **Engineering quality is far above typical early-stage work:** RLS on every table, CI, ADRs, tests.

### ❌ What's wrong
1. **Zero users, ten features.** Nobody outside the team has used it, yet recipes, the shopping list, ingredient pricing, Ask Nest and Eat Together exist.
2. **Taste matching has a density problem.** A match only works when many people have reviewed the *same* places. With 50 users spread across Chennai, the core promise ("people with your taste") shows up empty.
3. **No answer yet on place data after the Google purge.** OSM restaurant coverage in Chennai is patchy, and the Google Places API costs money and restricts caching.
4. **No business model, and the obvious one is ruled out.** "Nothing paid by restaurants" kills ads, which is how this category earns money.
5. **The real competitor is Instagram, not Zomato.** Chennai finds its biryani through reels like "Top 5 biryani spots in Chennai." Trails compete with that content.

### 🤔 Why it's wrong
- Building is comfortable and users are scary, so the repo optimises for building. CLAUDE.md even says the goal is "production-grade work as a way to learn." That's a valid goal, **but it's a portfolio goal, not a startup goal**.
- Your own rule says "a feature that doesn't make a take, taste match or trail better waits." Recipes and the shopping list break that rule. They're a second product.
- Social and taste products die without density. Features can't fix an empty network.

### 🔧 How to make it right
1. **Feature freeze.** Hide recipes, the shopping list and Eat Together behind a flag. Keep takes, taste match, trails, the public share page, and journeys/recap.
2. **Build one dense network.** Launch only on **OMR** (IT corridor, your seed data is already there). Pitch it as "Where do people like you eat near the office?" and aim for 30–50 people from 2–3 offices.
3. **Make trails a tool for creators.** Get 5–10 Chennai food creators to publish trails. Their reels link to the public trail page, which leads to "Follow in Nest". That's your growth loop, and the share page you designed is exactly right for it.
4. **Solve place data simply:** creators and admins add places when a trail needs them. Don't try to cover the whole city.
5. **Track 3 numbers:** takes per active user per week, percentage of users who follow a trail and check in at one or more stops, and week-4 retention.
6. **Kill or pivot rule:** if fewer than 20% are still active at week 4, rethink before writing more code.

### 🌍 The space
| Player | What they do | Lesson for Nest |
|---|---|---|
| **Beli** (US) | Rank restaurants against each other, friends' lists, gamified | Proof that "taste and friends, not stars" can scale. Reported 100M+ ratings with almost no revenue, so monetisation is hard even at scale |
| **Zomato / Swiggy / Google Maps** | Listings, stars, delivery, deals | Don't fight on coverage. Link out to them |
| **Instagram / YouTube food creators** | Where discovery *actually* happens in India | Partner with them, don't compete with them |
| **Zomato's old social features** | Followers and foodie levels, faded over time | Social on top of listings didn't stick. Social has to be the core |

### ❓ Question to answer first
Is Nest a **portfolio** project or a **startup**? Both are fine. Portfolio means keep building the enterprise way. Startup means stop building and get 50 OMR users this month.

