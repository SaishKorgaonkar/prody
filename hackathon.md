# Hackathon Guidelines

This document defines the non-negotiable principles that every feature, UI decision, and engineering choice must follow throughout the hackathon.

Our objective is not simply to build a technically impressive system.

Our objective is to maximize our score across every judging criterion while remaining perfectly aligned with the Google DeepMind hackathon philosophy.

---

# Problem Statement

We are building under:

**Problem Statement 2**
Autonomous Orchestration with Managed Agents (Interactions API / Antigravity)

We are additionally targeting:

**Best Use of Gemma 4**
(Local-First Autonomous Agents)

Every feature should strengthen one or both of these categories.

---

# Product Philosophy

We are NOT building:

- another DevOps dashboard
- another cloud management console
- another deployment tool
- another chatbot

We ARE building:

An autonomous AI engineering team that enables developers, startups, vibe coders, and businesses to ship production-ready software without requiring infrastructure expertise.

---

# The Story We Want Judges To Remember

Today AI can build software.

Tomorrow AI should also deploy, secure, monitor, scale, and operate software.

We are building the missing engineering layer between AI-generated code and production.

---

# Core Principles

## AI does the work

The AI should actively perform engineering tasks.

Users should never manually configure infrastructure if AI can safely do it.

Every interaction should demonstrate autonomous execution rather than AI-assisted suggestions.

---

## Conversation over configuration

The primary interface is conversation.

Users describe goals.

AI plans.

AI executes.

AI explains.

Configuration screens should only exist when absolutely necessary.

---

## Engineering over dashboards

Dashboards are supporting elements.

They are never the product.

The experience should focus on live execution, reasoning, and autonomous actions.

Avoid static analytics pages.

Avoid CRUD interfaces.

Avoid traditional admin panels.

---

## Live systems over mockups

Everything demonstrated should be functional.

The judges explicitly evaluate working software.

Animations should represent real execution.

Infrastructure visualization should be connected to actual agent activity.

---

## Explain everything

Every autonomous decision must include reasoning.

Users should understand:

- why something happened
- what the AI is doing
- why it chose a specific action
- what impact the action has

---

## Business-first language

Never expose unnecessary infrastructure terminology.

Instead of:

"SQL Injection"

Say:

"This endpoint allows attackers to access customer information."

Instead of:

"Port 5432 is publicly exposed"

Say:

"Your database is currently reachable from the internet."

---

# User Experience Principles

The experience should feel like working alongside a senior engineering team.

Never make the user feel like they are operating cloud infrastructure.

Every interaction should reduce complexity.

The product should remain approachable for:

- startup founders
- solo developers
- vibe coders
- SMEs
- experienced engineers

---

# Agent Design Principles

Each agent must have:

- a clear responsibility
- independent reasoning
- observable actions
- visible collaboration
- explainable outputs

Agents should communicate naturally.

The user should clearly understand how work is delegated between them.

Agent collaboration is one of the strongest demonstrations of Problem Statement 2.

---

# Gemma Usage Principles

Gemma should perform tasks that benefit from:

- privacy
- offline execution
- low latency
- local state
- continuous monitoring

Gemma should not simply become another local chatbot.

It should demonstrate autonomous local intelligence.

---

# UI Principles

The UI should feel alive.

Avoid traditional enterprise dashboards.

Prefer:

- live execution
- animated infrastructure
- conversational updates
- agent activity
- execution timelines
- infrastructure evolution
- reasoning visualizations

Every screen should communicate progress.

Nothing should appear static.

---

# Demo Principles

The demo should tell a story.

Not showcase features.

Recommended flow:

Developer writes code.

↓

AI detects issues.

↓

AI fixes them.

↓

AI validates security.

↓

AI prepares infrastructure.

↓

AI deploys.

↓

Traffic increases.

↓

AI scales automatically.

↓

Developer never opens the cloud console.

The audience should immediately understand the value without technical explanation.

---

# Judging Optimization

Every feature should improve at least one judging category.

## Live Demo

Prioritize:

- visual execution
- reliability
- smooth transitions
- autonomous behavior

---

## Technical Depth

Show:

- multi-agent collaboration
- local AI
- cloud orchestration
- autonomous workflows
- reasoning
- recovery

Avoid unnecessary complexity that isn't visible.

---

## Creativity

Ask:

"Have judges likely seen this before?"

If yes,

find a better interaction model.

Novelty should come from the product experience, not just the architecture.

---

## Impact

Every feature should answer:

How does this help developers?

How does this help startups?

How does this help Indian SMEs?

Can this realistically become a product?

---

# Things We Must Avoid

Never build:

- a generic chatbot
- a deployment dashboard
- static monitoring screens
- manual workflows
- prompt → response demos
- fake animations
- mocked deployments
- fake infrastructure state

Everything shown should represent real execution.

---

# Success Criteria

By the end of the demo, judges should believe:

- this solves a real problem
- this is significantly different from existing DevOps tools
- this could become a real product
- the AI genuinely performs engineering work
- the system feels autonomous
- the UI feels modern and memorable
- the product removes operational complexity rather than adding another tool

---

# Guiding Question

Whenever implementing a feature, ask:

Does this make the user feel like they hired an experienced AI engineering team?

If the answer is no,

it probably doesn't belong in the product.