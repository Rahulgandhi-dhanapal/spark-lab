---
title: "Tamil deep-tech tutorials: build your own LLM, in Tamil"
status: exploring
owners: []
issue: https://github.com/Rahulgandhi-dhanapal/spark-lab/issues/12
created: 2026-10-27
updated: 2026-10-29
---

# Tamil deep-tech tutorials: build your own LLM, in Tamil

**The spark** (one or two lines)
A Tamil-language YouTube tutorial channel for deep tech: "How to build your own LLM, in Tamil", then AI agents, robotics and more, explained step by step for Tamil-speaking students.

**Why it's interesting**
1. Most serious AI tutorials are in English. Lakhs of Tamil-medium and tier-2/3 college students would understand them much better in Tamil.
2. It gives our YouTube idea a real niche, and it documents what we're learning anyway (NPC Lab, RoboLab).
3. It could lead to courses, college workshops and a personal brand.

**First step, if I were to try it**
Record episode 1, "What is an LLM? Explained in Tamil, with a tiny example you can run in Google Colab", and share it with 3 college WhatsApp groups.


## Progress log

### 2026-10-27 · @Rahulgandhi-dhanapal

<!-- spark-lab:analysis -->
## 🤖 Claude · VC review: Tamil deep-tech tutorials

**Verdict: one of the best ideas on the board for this team.** It's cheap, starts now, uses what you're already learning, and gives the YouTube idea the niche it was missing. It's not venture-scale on its own, but it can become a strong education brand.

| | Score |
|---|---|
| Problem is real | 8/10 |
| Market size | 7/10 (Tamil speakers worldwide; ads pay less than English) |
| Feasibility for this team | 8/10 |
| Moat | 5/10 (trust, community and your persona build up over time) |
| Investable today | 3/10 as a channel, 6/10 later as an education business |

### ✅ What's genuinely good
- **A real gap:** basic coding in Tamil is well covered, but *deep* AI topics like transformers, tokenizers, fine-tuning and agents are rare in Tamil.
- **Learning in public is your advantage:** "I'm learning to build an LLM, come with me" is more relatable than a professor's lecture.
- **It connects your other ideas:** NPC Lab episodes, RoboLab builds and BatteryDoc's tester all become content.

### ❌ What's wrong
1. **"Build your own LLM" sets the wrong expectation.** You can't build ChatGPT at home. A from-scratch model on Colab will be a small, slightly silly text generator. If the title over-promises, comments will punish it.
2. **The audience is unclear.** Complete beginners, engineering students and working developers need very different videos.
3. **Ad money is low.** Regional-language ads usually pay much less than English ones. AdSense alone won't pay you.
4. **Credibility risk:** as an entry-level developer, one confidently wrong explanation can hurt the channel. Accuracy matters more than polish.
5. **Consistency:** tutorials take 10–20 hours each (research, code, recording, editing). Most channels stop by video 10.

### 🤔 Why it's wrong
- The idea starts from the most ambitious topic instead of a **learning path**. Audiences grow by following a series ("Episode 3 of 12"), not one big video.
- The business model is left as "YouTube", but in education the money is in **courses, workshops and jobs**, with YouTube as the marketing.

### 🔧 How to make it right
1. **Frame it honestly and make it compelling:** *"Let's build a tiny Tamil GPT from scratch: understand how ChatGPT works"*. The promise is understanding, not a ChatGPT replacement.
2. **Plan a 10-episode series:**
   1. What is an LLM (in Tamil, no code)
   2. Python and Colab setup
   3. **Tokenizers: why Tamil costs more tokens than English.** This is a great hook: English-trained tokenizers split Tamil into many more pieces, so Tamil text uses more tokens. That's a uniquely Tamil story.
   4. Building a bigram model
   5. Attention explained with Chennai examples
   6. A tiny transformer
   7. Training it on Tamil text (Thirukkural, Wikipedia)
   8. Fine-tuning an open model for Tamil
   9. Making a Tamil chatbot
   10. Building an AI agent (connects to NPC Lab)
3. **Use Tanglish where it helps:** keep technical terms in English and explain in Tamil. That's how Tamil students actually talk.
4. **Put all code on GitHub,** one Colab notebook per episode. Notebooks make tutorials shareable and searchable.
5. **Accuracy check:** before publishing, check each script against a trusted source, such as Karpathy's "Let's build GPT" or the original papers. Ask me to review the scripts too.
6. **Money comes later:** after about 1,000 engaged subscribers, add college workshops in Tamil Nadu (a strong local market), then a paid cohort course.
7. **Shorts first:** 60-second clips ("Why Tamil costs 3x tokens in ChatGPT") drive people to the long videos.

### 🌍 The space
| Player | What they do | Lesson |
|---|---|---|
| Tamil coding channels (e.g. Error Makes Clever) | Programming and career content in Tamil, with paid courses | Proof that Tamil tech education works and makes money through courses. Their focus is web dev and careers, not deep AI |
| GUVI (Chennai) | Coding courses in regional languages | The regional-language education business is validated |
| Andrej Karpathy ("Let's build GPT", nanoGPT) | The gold standard for building an LLM from scratch, in English | Your Tamil curriculum can follow this path, with full credit to the source |
| AI4Bharat (IIT Madras) | Open Indic datasets and models | Ready-made Tamil datasets and models for your episodes, and a source of credibility |
| Generic Tamil tech and gadget channels | Phone reviews, news | Big audiences, but no deep teaching. That's your gap |

### 🔗 How it connects to your board
- **Zennials POV YouTube:** this *is* its niche. Merge the two.
- **NPC Lab:** episodes 9–10, plus the Bigg Boss experiment as a special.
- **Data Mine Lab:** episode 3 shows why Tamil data is scarce, which is a natural lead-in to consent-based Tamil data work later.

**Next step:** write the script for episode 1 (5–7 minutes, no code), record it with a phone and a cheap lapel mic, and post it this week. Track the percentage of viewers who watch past 50%.


### 2026-10-27 · @Rahulgandhi-dhanapal

## 🎯 Plan: make this channel your career-advancement project

Teaching is the fastest way to learn deeply, and every episode leaves public proof of skill. The aim is that in 6 months a hiring manager can open your GitHub and YouTube and see an applied-LLM engineer.

### Target role
**Applied AI / LLM engineer** (building products on top of models: fine-tuning, RAG, agents, evals). It's the most hireable path from where you are, and it matches the episodes.

### Each episode produces three things
1. **A Colab notebook on GitHub** with a clear README. This is portfolio proof.
2. **A video** (Tamil or Tanglish). This shows communication, which most engineers lack.
3. **A short written summary** (LinkedIn post or blog): "what I learned, what I got wrong".

### Episode to skill to proof
| Episodes | Skill you gain | Proof |
|---|---|---|
| 1-2 | Python, Colab, how LLMs work | Notebook + explainer |
| 3 | Tokenizers, Tamil tokenization cost | Small benchmark repo (a publishable finding) |
| 4-6 | Bigram, attention, tiny transformer (PyTorch) | `tiny-tamil-gpt` repo |
| 7 | Training loops, data cleaning, loss curves | Trained model + write-up |
| 8 | Fine-tuning (LoRA) on an open model | Fine-tuned Tamil model on Hugging Face |
| 9 | Chatbot + RAG over Tamil text | Live demo |
| 10 | Agents and evals | Agent repo, links to NPC Lab |

### Rules that keep the learning real
- **Learn first, then record.** Finish the notebook yourself before scripting the video.
- **Check every script against a trusted source** (Karpathy's "Let's build GPT", the original papers). I can review scripts.
- **Write a "what I got wrong" note** after each episode. It builds honesty and depth.
- **Keep one benchmark or finding original.** "Tamil costs N times more tokens" with real numbers is something you can cite in interviews.

### 90-day milestones
- **Day 30:** 4 episodes out, 4 repos, a pinned GitHub profile README, a LinkedIn post per episode.
- **Day 60:** episode 6 done (tiny transformer), tokenizer benchmark posted, shared in 5 college groups and with AI4Bharat.
- **Day 90:** fine-tuned model on Hugging Face, first college workshop booked, resume rewritten around the repos.

### Career moves this unlocks
- **Resume:** replace "learning AI" with links to 3 working repos and a channel.
- **Interviews:** you can explain attention and fine-tuning from memory because you taught them.
- **Network:** invite Tamil AI folks and AI4Bharat contributors to comment or appear as guests.
- **Paid work:** workshops, a Tamil cohort course, and freelance LocalAI projects (idea #8) all come from this credibility.

### Weekly rhythm (about 12 hours)
- Mon-Wed: study and build the notebook (6h)
- Thu: script and rehearse (2h)
- Fri-Sat: record and edit (3h)
- Sun: post the video, a LinkedIn summary and 2 Shorts (1h)

**First action:** create the GitHub repo `tamil-llm-from-scratch` with a README listing all 10 episodes, then start episode 1.


### 2026-10-29 · @Rahulgandhi-dhanapal

## Update: where this idea stands (29 Oct 2026)

**Status:** moving from "exploring" to "building" the first stage.

### What we decided
- **Series name and promise:** "Zero to Tiny GPT". The promise is understanding how an LLM is built by building a small one, not replacing ChatGPT. This addresses the "wrong expectation" point in the VC review.
- **12 episodes (0 to 11)** instead of 10, ordered by what is needed first, each with a real-world analogy, a replicable Google Colab code-along, and listed prerequisites: 0 Setup (Python, Colab, tensors), 1 Autocomplete (bigram counts), 2 Tokens, 3 How a model learns, 4 First neural language model, 5 Embeddings, 6 Word order, 7 Self-attention, 8 Multi-head attention, 9 Transformer block, 10 Train a tiny GPT, 11 From GPT to ChatGPT (fine-tune GPT-2).
- **Roadmap files:** the full plan is in the Project-axel folder (`docs/llm-roadmap.html`).
- **Pacing:** one episode every 1 to 2 weeks, about 3 to 6 months in total. Learn first, then record. Start with Episode 0 only.
- **Capstone (bonus Episode 12):** a Thirukkural scenario advisor (new idea issue: Kural Advisor).
- **Data check first:** `tk120404/thirukkural` (Apache-2.0) has all 1,330 kurals with Tamil text, English translation and explanations. A Colab data-check notebook is written; results of the first real run are pending.
- **Open choice:** the roadmap is in English so far. Tamil or Tanglish narration for the videos is still to be decided.

### Honest limits we agreed on
- A tiny GPT trained from scratch on 1,330 kurals cannot understand scenarios. The advisor uses embedding search first, then optional fine-tuning of a small pretrained model.
- A frontier-lab job is a multi-year path. This series is stage one: understanding plus public proof of work. A Stage 2 (math, deeper PyTorch, reproducing a paper) can follow.

### Next steps
1. Run the kural data-check notebook in Colab and review the output.
2. Write the Episode 0 notebook and video script.
3. Create the GitHub repo for the episode notebooks.

Related new ideas from this discussion are added as separate issues (Kural Advisor, document extractor, Tamil domain advisor, small specialised models).

---
_Generated by [Claude Code](https://claude.ai/code)_
