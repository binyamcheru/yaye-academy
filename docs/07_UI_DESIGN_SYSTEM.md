# 07 — Yaye Academy UI Design System

This document defines the visual and interaction direction for Yaye Academy.
Use it with the product specification and build rules when creating any page.

---

## 1. Design idea

Yaye Academy should feel like a **technical workshop combined with a modern
academic publication**.

The interface must communicate:

- practical training
- credible instruction
- visible progress
- operational clarity
- a direct relationship to Yaye Tech

Do not make the product look like a generic SaaS dashboard or an AI-generated
landing-page template.

---

## 2. Brand relationship

Use the existing YayeTech logo and its established blue/teal color family.

The preferred lockup is:

```text
[YayeTech logo] | ACADEMY
```

Yaye Academy is a Yaye Tech product, not a separate unrelated company.

Primary message:

> Training the people who build the future.

---

## 3. Color system

```text
Yaye blue          #1E6082  Primary actions and brand anchors
Yaye teal          #3BA6A6  Progress, active states, and highlights
Pale blue          #D9EAF3  Tinted surfaces and selected rows
Deep ink           #102631  Primary text and dark surfaces
Warm paper         #F7F5EF  Public-page background
White              #FFFFFF  Working surfaces
Achievement ochre  #C6922B  Certificates and completion moments
Danger             #B5473E  Destructive and failure states
```

Color must communicate meaning. Avoid decorative gradients.

---

## 4. Typography

- Use a condensed technical display style for large headings and numbers.
- Use a highly readable sans-serif style for body copy and controls.
- Use monospace sparingly for program codes, batch IDs, dates, scores, and
  technical metadata.
- Keep headings compact and intentional. Avoid oversized text that leaves the
  rest of the page empty.

---

## 5. Shape and spacing

- Prefer straight edges and small corner radii.
- Use visible rules, dividers, and aligned columns to organize information.
- Reserve large rounded surfaces for one important focal element, not every
  section.
- Use a consistent 4/8-pixel spacing rhythm.
- Public pages may be spacious; dashboards should be compact and efficient.

---

## 6. Page language

### Public pages

Use an editorial grid. Programs should resemble professional course prospectuses
or syllabi, with program codes, access type, duration, level, and next batch.

### Learner workspace

Prioritize today's work, continue learning, deadlines, feedback, sessions, and a
clear progress matrix. Avoid turning every metric into a floating card.

### Lesson workspace

Use a curriculum rail, focused reading column, clear completion action, and Q&A
that feels like instructor office hours.

### Instructor workspace

Prioritize review queues, unanswered questions, session schedules, and learner
progress. Use tables and structured lists when they communicate more efficiently
than cards.

### Admin workspace

Use an operational layout with dense tables, meaningful filters, status markers,
and side panels for focused create/edit tasks.

### Certificates

Use a formal print-friendly composition with strong Yaye Tech identity and no
template designer.

---

## 7. Interaction rules

- Motion should explain state changes and normally last 150–220ms.
- Hover states should use color, underline, or a small positional shift—not glow.
- Provide visible keyboard focus on every interactive control.
- Respect reduced-motion preferences.
- Build loading, empty, error, success, and forbidden states intentionally.
- Mobile learner navigation may simplify into a compact bottom or top navigation.
- Instructor and admin interfaces should remain desktop-efficient.

---

## 8. Anti-template rules

Do not use:

- purple or multicolor gradients
- glowing blobs
- glassmorphism as the main surface treatment
- excessive pills and rounded cards
- random emojis
- generic three-card feature sections
- meaningless charts or vanity counters
- stock technology illustrations
- repeated fade-in animations
- centered text for every section
- placeholder claims presented as real company statistics

Prefer authentic instructor photography, learner work, code examples, technical
diagrams, and Yaye Tech project material when approved assets are available.
