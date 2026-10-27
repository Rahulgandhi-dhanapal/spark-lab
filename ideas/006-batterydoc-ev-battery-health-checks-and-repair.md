---
title: "BatteryDoc: EV battery health checks and repair"
status: spark
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/6
created: 2026-10-27
updated: 2026-10-27
---

# BatteryDoc: EV battery health checks and repair

**The spark** (one or two lines)
Test, diagnose and repair electric scooter and e-bike batteries: replace dead cells instead of the whole pack, and give a battery health certificate when a used EV is sold.

**Why it's interesting**
1. Millions of electric two-wheelers sold in India in 2021–24 now have 3–5 year old batteries that are losing range.
2. A new pack costs a big share of the scooter's price, and there is almost no trusted repair or used-EV battery check.
3. It's RoboLab with a business model: electronics skills plus software for the health report.

**First step, if I were to try it**
1. Learn BMS and cell testing on old laptop batteries.
2. Talk to 5 EV mechanics in Chennai about what fails most.

_Suggested by Claude (future-needs brainstorm, 27 Oct 2026)._

## Progress log

### 2026-10-27 · @Rahulgandhi-dhanapal

<!-- spark-lab:analysis -->
## 🤖 Claude · VC review: BatteryDoc

**Verdict: the strongest long-term business on the board, but the hardest to start safely.** Demand grows every year whether you're ready or not. The risk is safety and OEM lock-in, not demand.

| | Score |
|---|---|
| Problem is real | 8/10 |
| Market size | 8/10 (grows with every EV sold) |
| Feasibility for this team | 4/10 today, 7/10 after training |
| Moat | 6/10 (skills, test data, trust) |
| Investable today | 3/10 |

### ❌ What's wrong
1. **Lithium is dangerous.** A bad repair can mean a fire in someone's home. India already had a wave of e-scooter fires in 2022, so liability is real.
2. **Brands lock their batteries.** Many OEMs use proprietary BMS software, and opening a pack usually voids the warranty. Under warranty, owners go to the brand, not you.
3. **Cell sourcing.** Matching quality cells is hard, and cheap grey-market cells are how repair shops get a bad name.
4. **"Battery health certificate" needs credibility.** Nobody trusts a certificate from an unknown startup until a buyer, lender or insurer accepts it.

### 🤔 Why it's wrong
- The idea starts from **repair**, which is the riskiest part, instead of **testing**, which is safe, cheap and builds the data and trust you need for everything else.
- Your timing should follow warranty expiry. The paying customer appears only *after* the 3-year warranty ends.

### 🔧 How to make it right
1. **Start with testing, not repair:** offer a 20-minute battery health check (capacity, internal resistance, cell balance) and a simple report. No opening the pack and no fire risk.
2. **Sell the check to used-EV buyers and sellers first:** one clear moment of pain ("is this second-hand Ather worth ₹45k?"). Partner with used-vehicle dealers.
3. **Get formal training and safety kit** before any pack repair: a fireproof workspace, spot welder, insulation testing and proper PPE.
4. **Build the dataset.** Every test adds to a picture of how battery health ages by brand and model. That data is the long-term moat, and could later be sold to lenders and insurers for used-EV loans.
5. **Repair only out-of-warranty packs,** with a written warranty of your own.

### 🌍 The space
| Player | What they do | Lesson |
|---|---|---|
| Brand service centres (Ola, Ather, TVS…) | Replace whole packs under warranty | They don't want to repair cells. The gap opens after warranty |
| Battery recyclers and second-life companies (e.g. Lohum, Attero) | Recycle cells and reuse them in storage | They're your exit route for dead cells, not competitors |
| Informal local repair shops | Cheap cell swaps, mixed quality | Trust and safety are your differentiators |
| Battery Waste Management Rules, 2022 | Extended producer responsibility for batteries | Regulation will push toward formal, documented repair and recycling |

**Next step:** build a basic battery tester (ESP32 + load + voltage and current sensing) as the first RoboLab project. It's the product prototype and a learning project in one.
