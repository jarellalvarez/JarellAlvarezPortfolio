---
title: Making Framework Designer easier to learn
slug: copperleaf
company: Copperleaf
role: Product Designer II, promoted to III
timeline: 6-month design cycle (at Copperleaf Oct 2021 to Jul 2024)
team: Product Manager, Dev Team Lead, Director of UX Research, Design Team
tools: Figma, Dovetail, Whimsical, Jira, Mural, Pendo
protected: true
status: draft 2, for Jarell's review
---

<!-- DRAFT 2. Every fact comes from the case study deck.
     Lines marked [JARELL] are questions, not copy. -->

## Overview

Copperleaf makes decision software for people who manage critical infrastructure. Framework Designer is the part where a company defines what "value" means to them, so every investment gets scored the same way.

It was powerful and hard to learn. Our own customer success and tech sales teams struggled to build demos in it, and clients got lost watching them.

I led design on a 6-month cycle to figure out where people were getting stuck and what would help the most, the fastest.

**What came out of it**

- A resource map shipped inside the product
- A first version of a guided assistant, tried out through Pendo with no developer time, which saved an estimated 3 months of build
- A usability baseline (SUS 64.7) the team could measure future changes against

## The problem

Changing a value model used to mean writing C#. That made the technical team a bottleneck and meant consultants couldn't be trained on it.

Framework Designer fixed that on paper. In practice, new hires were slow to build demos, the demos came out too complex, and clients couldn't find the data they cared about.

> It's really hard to make any changes to a questionnaire specifically, like maybe you need to remove a prompt or you need to change the order.

Internal NPS for the tool ranged from -10 to +25.

We set targets up front: cut training time by 10%, cut time and frustration on client calls by 15%, and cut misclicks by 40%.

The timing mattered. Copperleaf was heading toward an IPO and wanted to package Framework Designer for clients. Our internal teams were the testing ground. If they couldn't use it comfortably, clients wouldn't either.

## What made it hard

- I wasn't the knowledge owner. Value modelling is deep, and I had to learn it while designing for it.
- The users were split: technical and non-technical, senior and brand new.
- People build models in very different ways (copy and paste, from scratch, editing someone else's), so there was no single start and end point to design around.
- Anything new had to fit the existing design system.
- It was my first project at this scale.

The tension that ran through the whole thing was flexibility versus step-by-step guidance. Experts wanted freedom. New people wanted a path.

## Finding the real issue

The brief was broad: make the experience better for our CX users. I worked with the PM, dev lead and our Director of UX Research to turn that into a question we could answer.

> Where are users getting tripped up in Framework Designer's core workflow, and why?

**Round one: 13 interviews** to understand use cases and find the root cause. I documented everything in Dovetail, grouped it into themes, and prioritized the themes with the triad against the existing roadmap.

One theme kept coming up. Navigation was nested inside nested inside nested, and people felt lost.

**Round two: 10 contextual inquiry sessions in one week.** People shared their screen and ran real tasks in a test environment, then filled out a SUS questionnaire.

- SUS score: 64.7, a D-. Below 68 points to serious usability problems.
- Only one person completed the tasks.

That gave us a baseline and confirmed the problem was real, not a feeling.

## Decision 1: get 23 ideas out fast, then cut

I didn't want to polish one idea and defend it. I used a straw man approach: quick, rough UI pieces that people could react to and tear apart.

I sketched 23 solutions, tagged each one with the research finding that justified it, and took them to the PM and UX Research Director. We chose based on two things: slow adoption was hurting experienced users, and new users couldn't turn theory into practice. Shorter training time was the goal that served both.

Before going further, I showed the rough concepts to developers. I wanted to know what was feasible before anyone fell in love with something we couldn't build. That conversation opened up the potential for something more conversational, including integrating with bots.

Three directions made it through:

1. **Overworld map.** A visual map of the whole framework so you can see where you are and jump anywhere.
2. **Choose Your Own Adventure.** Step-by-step guides that walk you through a task in order.
3. **Clippy.** An assistant that sits beside the existing interface and helps in context.

## Decision 2: test all three and let users rank them

I built mid-fi prototypes of all three and tested them with 6 users over 4 days. Same scenario each time: create a prompt from scratch and add it to a questionnaire. Then each person ranked the three.

| Solution | Score (out of 18) | What people said |
| --- | --- | --- |
| Clippy assistant | 15 | Right amount of guidance without changing the UI they already knew |
| Choose Your Own Adventure | 14 | Easy to follow, fewer mistakes, but they missed the normal menu |
| Overworld map | 7 | Helpful once found, but the map button was hard to spot |

> Right amount of guidance again, without necessarily having to go down a completely different path with the UI.

The most visual idea came last. People didn't want a new interface. They wanted help inside the one they had.

The assistant won, with a catch: it was the least visual, so people couldn't see their progress. The fix was a hybrid that borrowed the map and a stepper from the other two.

## Decision 3: ship the small thing first, and skip the dev queue

Developer estimates put the assistant at up to 3 months for one developer. The map was about 1.

So we split it.

**First, the map.** Before handoff I presented it to the design team, and the feedback changed the direction late. The PMs and I realigned: the real need was helping people understand the framework, more than redesigning navigation. The map became a resource guide with overviews, diagrams and definitions. We kept it as a flat, static page on purpose to fit the budget and timeline, and reused a pattern from another Copperleaf product (help icon, hover card, full-page modal). It also set the pattern for other help resources that followed.

**Then the assistant.** The idea was a helper for building value frameworks, sitting inside the tool people already used. Instead of waiting for a dev slot, I used Pendo, which we already had, in two ways: to see how people were using Framework Designer today, and to put a first version of the assistant experience in front of them. No developer time, value to users right away, and an estimated 3 months saved. It also let us keep learning before committing engineering to a full build.

## Results

- Resource guide shipped in the product
- First version of the assistant tried through Pendo, with about 3 months of dev time saved
- Three directions tested with users before any build: assistant 15, guides 14, map 7 (out of 18)
- SUS baseline of 64.7 set for measuring future changes

[JARELL] If you have any follow-up numbers against the three targets (training time, client calls, misclicks), they go here. Without them this section stays as is.

> You excelled in staying focused on the original problem, collaborating effectively, and aligning on solutions.
> Sharmeen, Design Manager, Copperleaf

## What I learned

**Ask sooner.** I wasn't the expert on value models. Asking is better than assuming, and there's no shame in it.

**Bring the design team in at every stage.** I waited until the end, and their feedback changed the direction right before handoff. It got resolved, but it caused a miscommunication between teams that didn't need to happen.

**Share research with developers as it comes in.** They wanted it, and their early feedback is what opened up the assistant idea.

A lot of this job turned out to be translating between people who each understood one part of the problem. Some days translator, some days therapist.

---

## Images needed (from the deck)

1. Framework Designer before: the nested navigation
2. Interview synthesis board (themes)
3. Straw man sketches, a few of the 23
4. The three mid-fi prototypes side by side
5. Ranking results
6. Shipped resource guide
7. Assistant in Pendo

[JARELL] The PDFs are compressed, so I'll need these exported from Figma at full size.
