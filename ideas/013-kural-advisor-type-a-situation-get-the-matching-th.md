---
title: "Kural Advisor: type a situation, get the matching Thirukkural"
status: spark
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/13
created: 2026-10-29
updated: 2026-10-29
---

# Kural Advisor: type a situation, get the matching Thirukkural

**The spark** (one or two lines)
A small app where someone describes a situation ("a friend betrayed my trust") and gets the best-matching Thirukkural in Tamil, its meaning in English, and a line on how it applies.

**Why it's interesting**
1. It is the capstone of the "Zero to Tiny GPT" series (see #12) and uses tokens, embeddings and fine-tuning together.
2. Personal and shareable, so it works well for Shorts and for a first public demo.
3. The data exists: `tk120404/thirukkural` (Apache-2.0), 1,330 kurals with explanations.

**First step, if I were to try it**
Run the data-check notebook in Colab (count rows, check empty fields, try a simple word-match search). Then in Episode 5, replace word matching with embedding search.

_Notes: a from-scratch tiny model cannot do this alone. Use embedding search to find the kural, and optionally fine-tune a small pretrained model for the explanation. Tamil quality of small models must be tested. Commentary text is modern work, so check rights before any paid product._

_Suggested by Claude (brainstorm, 29 Oct 2026)._
