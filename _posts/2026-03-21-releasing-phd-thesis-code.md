---
layout: post
title: "Releasing my PhD thesis code — KSE integrability in supergravity, now extended to any theory"
subtitle: "From legacy Cadabra notebooks to a unified AI-assisted driver for D=4,5,6,10,11"
date: 2026-03-21
last-updated: 2026-03-21
tags: [supergravity, KSE, integrability, cadabra, phd, black holes, string theory]
---

{% include mathjax.html type="post" %}

It has been several years since I submitted my PhD thesis and the accompanying papers. For a long time, the code and calculations sat in a collection of standalone Cadabra notebooks — functional, verified, but not in a form that was easy to share or extend. With the help of AI tools, I have finally had the time and energy to clean everything up, unify it under a single driver, and release it publicly.

## The thesis work

My PhD thesis, [*Dynamical supersymmetry enhancement of black hole horizons*](https://arxiv.org/abs/1910.01080) (arXiv:1910.01080), investigates a remarkable phenomenon: near the horizons of supersymmetric black holes in supergravity, the number of preserved supersymmetries doubles. This is the **horizon conjecture** — proved in the thesis for IIA, massive IIA (Romans), and D=5 supergravity.

The companion paper [*Symmetry enhancement of Killing horizons in D=6 supergravity*](https://arxiv.org/abs/1912.04249) (arXiv:1912.04249) extends the analysis to six-dimensional gauged supergravity with tensor and vector multiplets.

The structural argument at the heart of both works rests on **KSE integrability**: proving that the integrability conditions of the Killing Spinor Equations (KSEs) are automatically satisfied on-shell, i.e. on any field configuration satisfying the bosonic equations of motion and Bianchi identities. This is the Lichnerowicz-type argument that allows one to trade global analysis of the KSEs for local algebraic conditions.

### What are KSEs?

A supergravity field configuration admits a supersymmetric Killing spinor $\varepsilon$ if it satisfies:

$$\mathcal{D}_a \varepsilon := \nabla_a \varepsilon + \Psi_a \varepsilon = 0 \qquad \text{(gravitino KSE)}$$

$$\mathcal{A}\,\varepsilon = 0 \qquad \text{(dilatino / gaugino KSE)}$$

The **integrability** of these equations requires:

$$[\mathcal{D}_a,\,\mathcal{D}_b]\,\varepsilon = 0$$

Expanding this commutator gives the **gravitino integrability operator** $\mathcal{I}_a$. The main theorem is that on any solution to the field equations, $\mathcal{I}_a\,\varepsilon = 0$ holds identically — because every term in $\mathcal{I}_a$ is proportional to an on-shell residual (Einstein equation, Bianchi identity, etc.) that vanishes on-shell.

Verifying this symbolically, for each theory, was the computational backbone of the thesis.

## The code

All computations were performed using [Cadabra2](https://cadabra.science/), a computer algebra system designed specifically for field theory calculations involving tensor index gymnastics, Clifford algebra, and spinor identities.

The repository is at: **[github.com/drrobotk/py_integrability_sugra](https://github.com/drrobotk/py_integrability_sugra)**

A full rendered reference page (with all equations typeset) is at: **[drrobotk.github.io/py_integrability_sugra](https://drrobotk.github.io/py_integrability_sugra/)**

### What's in the repository

- **`integrability_driver.py`** — a unified driver that reads theory data from a JSON schema and runs the full 9-step integrability pipeline for any theory
- **`theories.json`** — structured definitions for all theories: KSEs, field equations, Bianchi identities, integrability operators, chirality rules, cleanup rules
- **`legacy/`** — the original standalone scripts for each theory, preserved as-is from the thesis work
- Verified results for **D=4, 5, 6, 10, 11** supergravity theories

### Verified theories

| Theory | Operators | Status |
|---|---|---|
| D=4 Einstein–Maxwell | gravitino | verified |
| D=4 minimal gauged | gravitino | verified |
| D=5 minimal | gravitino | verified |
| D=5 vector multiplets (ungauged) | gravitino | partial — VSG simplification pending |
| D=5 vector multiplets (gauged) | gravitino | partial — VSG simplification pending |
| D=6 N=(1,0) | gravitino, dilatino, gaugino | verified (all 3) |
| D=11 supergravity | gravitino | verified |
| D=10 heterotic | gravitino, dilatino, gaugino | verified (all 3) |
| D=10 type IIA (massless) | gravitino, dilatino | verified (both) |

## The role of AI

The original thesis code consisted of separate, bespoke scripts for each theory — each hundreds of lines long, sharing no common infrastructure. Extending to a new theory meant copying, modifying, and debugging from scratch.

With AI assistance, I was able to:

1. **Understand and document** the common structure across all theories (the 9-step pipeline), which was implicit in the original code but never written down explicitly
2. **Refactor** the standalone scripts into a unified JSON schema + driver architecture
3. **Debug** subtle issues (index spacing in Cadabra declarations, operator string parenthesisation, kernel state contamination between computations) that would have taken days to track down manually
4. **Write** this reference page and documentation

The result is a system where adding a new supergravity theory requires only writing a JSON block — no new code.

## What's next

The pending work includes:

- **D=5 very-special-geometry simplification**: the ungauged and gauged vector multiplet theories produce correct on-shell residuals plus unsimplified scalar terms involving $Q_{IJ}$, $C_{IJK}$, and $X^I$. These simplify via the Calabi–Yau constraints ($C_{IJK}X^I X^J X^K = 1$ and its covariant derivatives), but this requires a separate schema extension.
- **D=7 supergravity**: a standalone script exists but is not yet in `theories.json`
- **Massive IIA (Romans)**: the KSE structure differs from the massless case by adding a Romans mass parameter $m$; extending the driver to handle this is straightforward once the JSON fields are defined

All of this is original research — the calculations, the operator expressions, the verification strategy. The code is released under a [CC BY-NC 4.0 licence](https://github.com/drrobotk/py_integrability_sugra/blob/main/LICENSE): you are free to use and adapt it for non-commercial academic purposes, with attribution.

If you use this work, please cite:

> U. Kayani, *Dynamical supersymmetry enhancement of black hole horizons*, PhD thesis, arXiv:1910.01080 (2019)

> U. Kayani, *Symmetry enhancement of Killing horizons in D=6 supergravity*, arXiv:1912.04249 (2019)
