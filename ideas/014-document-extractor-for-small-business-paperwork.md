---
title: "Document extractor for small-business paperwork"
status: spark
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/14
created: 2026-10-29
updated: 2026-10-29
---

# Document extractor for small-business paperwork

**The spark** (one or two lines)
A model that reads invoices, bills or forms and returns structured fields (name, date, amount, items), starting with one industry's documents.

**Why it's interesting**
1. Businesses already pay people to type data from documents, and the saving is easy to measure.
2. Recurring revenue, and a data moat: every corrected document improves the model on that industry's formats.
3. Skills overlap with the LLM series (#12), and it fits LocalAI (#8).

**First step, if I were to try it**
Collect 20 to 30 sample bills with personal details blanked out. After Episode 11, build a small extractor demo with a human-review step and honest accuracy numbers.

_Risk: accuracy. One wrong number loses trust, so it needs review and audit trails. Chosen as the side project next to the Kural Advisor._

_Suggested by Claude (brainstorm, 29 Oct 2026)._
