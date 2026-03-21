---
layout: post
title: "Releasing my PhD thesis code — KSE integrability in supergravity, extended to any theory"
subtitle: "From legacy Cadabra notebooks to a unified AI-assisted driver for D=4,5,6,10,11"
date: 2026-03-21
last-updated: 2026-03-21
tags: [supergravity, KSE, integrability, cadabra, clifford algebra, phd, black holes, string theory]
permalink: /py_integrability_sugra/
---

{% include mathjax.html type="post" %}

It has been several years since I submitted my PhD thesis and the accompanying papers. For a long time, the code and calculations sat in a collection of standalone Cadabra notebooks — functional, verified, but not in a form that was easy to share or extend. With the help of AI tools, I have finally had the time and energy to clean everything up, unify it under a single driver, and release it publicly.

My PhD thesis, [*Dynamical supersymmetry enhancement of black hole horizons*](https://arxiv.org/abs/1910.01080) (arXiv:1910.01080), investigates how near the horizons of supersymmetric black holes in supergravity, the number of preserved supersymmetries doubles — the **horizon conjecture** — proved across IIA, massive IIA (Romans), and D=5 supergravity. The companion paper [*Symmetry enhancement of Killing horizons in D=6 supergravity*](https://arxiv.org/abs/1912.04249) (arXiv:1912.04249) extends the analysis to six-dimensional gauged supergravity.

The structural argument at the heart of both works rests on **KSE integrability**: proving that the integrability conditions of the Killing Spinor Equations are automatically satisfied on-shell. This is the Lichnerowicz-type argument that allows one to trade global analysis of the KSEs for local algebraic conditions — verified symbolically, for each theory, using Cadabra2.

The code and full reference are at **[github.com/drrobotk/py_integrability_sugra](https://github.com/drrobotk/py_integrability_sugra)**, released under [CC BY-NC 4.0](https://github.com/drrobotk/py_integrability_sugra/blob/main/LICENSE). If you use this work, please cite arXiv:1910.01080 and arXiv:1912.04249.

---

# py_integrability_sugra

Symbolic verification of **Killing Spinor Equation (KSE) integrability conditions** for supergravity theories in D = 4, 5, 6, 9, 10, 11 dimensions, using the [Cadabra2](https://cadabra.science/) computer algebra system.

All computations are driven by a unified Python script (`integrability_driver.py`) that reads theory data from a structured JSON schema (`theories.json`). Legacy standalone scripts for each theory are preserved in `legacy/`.

---

## Contents

- [Mathematical Background](#mathematical-background)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Theory Reference](#theory-reference)
  - [D=11 Supergravity](#d11-supergravity)
  - [D=10 Type IIA (Massless)](#d10-type-iia-massless)
  - [D=10 Type IIA (Romans Mass)](#d10-type-iia-romans-mass)
  - [D=10 Heterotic](#d10-heterotic)
  - [D=9 NS-NS Supergravity](#d9-ns-ns-supergravity)
  - [D=5 Vector Multiplets (Ungauged)](#d5-vector-multiplets-ungauged)
  - [D=5 Vector Multiplets (Gauged)](#d5-vector-multiplets-gauged)
  - [D=5 Minimal](#d5-minimal)
  - [D=6 N=(1,0)](#d6-n10)
  - [D=4 Einstein–Maxwell](#d4-einsteinmaxwell)
  - [D=4 Minimal Gauged](#d4-minimal-gauged)
- [Unified Driver](#unified-driver)
- [theories.json Schema](#theoriesjson-schema)
- [Extending to New Theories](#extending-to-new-theories)
- [Verified Results](#verified-results)
- [Known Limitations](#known-limitations)
- [References](#references)

---

## Mathematical Background

### KSE Integrability

A supergravity field configuration admits a supersymmetric Killing spinor $\varepsilon$ if it satisfies the **Killing Spinor Equations (KSEs)**:

$$\mathcal{D}_a \varepsilon :=\nabla_a \varepsilon + \Psi_a \varepsilon = 0 \qquad \text{(gravitino KSE)}$$

$$\mathcal{A}\, \varepsilon = 0 \qquad \text{(dilatino / gaugino KSE)}$$

where \(\Psi_a\) is the supercovariant connection — a matrix-valued 1-form built from the bosonic fields — and $\mathcal{A}$ is the dilatino or gaugino operator.

**Integrability** requires the curvature of $\mathcal{D}$ to annihilate any Killing spinor:

$$[\mathcal{D}_a,\, \mathcal{D}_b]\,\varepsilon = 0$$

Expanding the gravitino commutator yields the **gravitino integrability operator**:

$$\mathcal{I}_a :=-\frac{1}{2}R_{ab}\Gamma^b + \Gamma^b\nabla_a\Psi_b - \Gamma^b\nabla_b\Psi_a + \Gamma^b[\Psi_a, \Psi_b] - \nabla_a\mathcal{A} - \Psi_a\mathcal{A} + \mathcal{A}\Psi_a + \Phi_a\mathcal{A}$$

(the precise form depends on the theory; the last three terms are present only when a dilatino KSE exists).

### The Main Theorem

The integrability conditions are **consequences** of the bosonic field equations and Bianchi identities. For any on-shell field configuration:

$$\mathcal{I}_a\,\varepsilon =\sum_i C_i \cdot \Gamma^{\cdots}\,\varepsilon$$

where each coefficient \(C_i\) is a linear combination of **on-shell residuals** (EOM or Bianchi) that vanish on any solution. This guarantees that one need only solve the KSEs directly.

### Lichnerowicz Argument

The converse also holds: the KSEs together with a *subset* of the field equations imply the *full* set of equations of motion (via a spinorial Lichnerowicz identity). This is the structural result used to classify all supersymmetric near-horizon geometries.

### Residual Notation

All equations of motion and Bianchi identities are written in **residual form**:

| Symbol | Meaning |
|--------|---------|
| \(E_{ab}\) | Einstein equation residual |
| $F\Phi$ | Dilaton equation residual |
| \(FH_{ab}\) | \(H_{3}\)-field equation residual |
| \(FF_a\) | Maxwell / gauge field equation residual |
| \(FG_{abc}\) | 4-form field equation residual |
| \(BH_{abcd}\) | \(H_{3}\)-field Bianchi residual |
| \(BF_{abc}\) | 2-form Bianchi residual |
| \(BG_{abcde}\) | 4-form Bianchi residual |

All residuals vanish on any solution to the field equations.

### Computation Pipeline

Each integrability operator is processed by a 9-step Cadabra2 algorithm:

1. **KSE substitution** — substitute \(\Psi_a\), $\mathcal{A}$, $\mathcal{N}$ by their expressions in bosonic fields
2. **Field equation substitution** — replace \(R_{ab}\), \(\nabla^c H_{abc}\), etc., introducing EOM residuals
3. **Clifford expansion** (3 passes) — `join_gamma` + `distribute`
4. **Leibniz rule** — `product_rule` expands $\nabla$ on products
5. **Clifford expansion** (2 passes) + `unwrap`
6. **Second field substitution** — handles new EOM terms from step 4
7. **Bianchi substitution** — replaces $\nabla H \cdot \Gamma$ contractions by Bianchi residuals
8. **$\varepsilon \to \Gamma$** — replaces the $\varepsilon$-tensor by $\pm C\,\Gamma$ (or $+\Gamma$ in $D=11$)
9. **Cleanup** — expand $\nabla(e^{n\Phi})$, simplify $e^{n\Phi}\cdot e^{m\Phi}$, apply $C^2=1$, $i^2=-1$, factor out $C$

The Cadabra `post_process` hook fires after every algorithm step: `sort_product` → `eliminate_kronecker` → `canonicalise` → `collect_terms`.

---

## String/M-Theory Origins

All the supergravity theories studied here arise as low-energy limits of string/M-theory compactifications. The diagram below shows the principal descent relations. D=11 supergravity sits at the top as the unique maximal theory; all others emerge by dimensional reduction or duality.

```
D=11 SUGRA (unique)
│
├── ×S¹ ──────────────────────► D=10 Type IIA (massless)
│                                       │
│                               + Romans mass m ──► D=10 Type IIA (massive)
│
├── ×CY₃ ─────────────────────► D=5 N=2 ungauged (M-theory on CY₃)
│                                       │
│                               + U(1) gauging ──► D=5 N=2 gauged
│
├── ×CY₃ × S¹ ───────────────► D=4 N=2 (M-theory on CY₃, or IIA on CY₃)
│
├── ×K3 ──────────────────────► D=7 N=1 (not yet in driver)
│
└── ×S¹/ℤ₂ (Hořava-Witten) ──► D=10 Heterotic E₈×E₈
                                        │
                                ×T⁴ ───► D=6 N=(1,0)
                                        │
                                ×CY₃ ──► D=4 N=1
```

### D=11 → Type IIA

The most direct reduction: compactify D=11 on a circle $S^1$ of radius \(R_{11}\), truncating all Kaluza–Klein modes with masses \(\sim 1/R_{11}\). The metric decomposes as in ([Dimensional Reduction](#dimensional-reduction-to-iia)), identifying the dilaton \(e^\Phi = R_{11}^{3/2}\), the RR 1-form \(A_\mu\) as the Kaluza–Klein gauge field, and the NS-NS 2-form \(B_{\mu\nu}\) plus RR 3-form \(C_{\mu\nu\rho}\) from the D=11 3-form potential. The $D=11$ gravitino gives both the IIA gravitino and dilatino.

### D=11 → D=5 N=2 (M-theory on \(CY_3\))

Compactify M-theory on a Calabi–Yau threefold \(CY_3\) with Hodge numbers $h^{(1,1)}, h^{(2,1)}$ (see [D=5 Vector Multiplets (Ungauged)](#d5-vector-multiplets-ungauged)). The massless spectrum contains:

- **Gravity multiplet**: \(g_{\mu\nu}\), graviphoton \(A^0_\mu\), gravitino
- **$h^{(1,1)}-1$ vector multiplets**: each contains a vector \(A^I_\mu\), a real scalar $X^I$ (Kähler modulus), and a gaugino
- **$h^{(2,1)}+1$ hypermultiplets**: complex structure moduli and universal hypermultiplet

The Kähler moduli satisfy the very-special-geometry constraint \(C_{IJK}X^IX^JX^K = 1\) where \(C_{IJK}\) are the triple intersection numbers of \(CY_3\). Hypermultiplets decouple from stationary solutions and are set to constants. The resulting 5d action is exactly that encoded in `d5_vector_ungauged`.

### D=5 Ungauged → D=5 Gauged

The gauged theory is obtained by turning on a $U(1)$ subgroup of the \(SU(2)_R\) automorphism group of the $\mathcal{N}=2$ algebra. This is equivalent to gauging a linear combination \(V_I A^I_\mu\) of the abelian vectors with coupling $\chi$. The scalar potential \(U = 9V_IV_J(X^IX^J - \frac{1}{2}Q^{IJ})\) arises from the $D$-term of the gauging. The D=5 gauged theory also arises from type IIB supergravity compactified on $S^5$.

### D=11 → D=4 N=2 (M-theory on \(CY_3\), or IIA on \(CY_3\))

Two equivalent paths:
- **M-theory on \(CY_3\)**: gives 5d N=2 as above; further reducing on $S^1$ gives 4d N=2
- **Type IIA on \(CY_3\)**: directly gives 4d N=2 with $h^{(1,1)}$ vector multiplets and $h^{(2,1)}+1$ hypermultiplets

The 4d Einstein–Maxwell theory in `d4_einstein_maxwell` is the simplest case ($h^{(1,1)}=1$, no vector multiplets beyond the graviphoton). The gauged version `d4_minimal_gauged` adds an \(AdS_4\) vacuum stabilised by the cosmological constant $\Lambda = -3/\ell^2$.

### D=11 / Hořava–Witten → D=10 Heterotic

M-theory on the orbifold \(S^1/\mathbb{Z}_2\) (Hořava–Witten construction) gives D=10 heterotic \(E_8\times E_8\) supergravity at low energy. The two fixed-point boundaries of the interval each carry an \(E_8\) gauge multiplet. In the weak-coupling limit the interval shrinks and one recovers the perturbative heterotic string. The D=10 heterotic supergravity encoded in `d10_heterotic` is the effective field theory of this construction, with a single (abelianised) gauge 2-form \(F_{ab}\).

The heterotic string also has an $SO(32)$ variant (related to Type I by S-duality); the NS-NS sector supergravity is the same in both cases.

### D=10 Heterotic → D=6 N=(1,0)

Compactify heterotic string theory on the torus $T^4$. Generically this gives D=6 with N=(1,1) or N=(2,0) supersymmetry depending on the gauge bundle. With a non-trivial gauge bundle satisfying \(\int_{T^4} \text{tr}F^2 = \int_{T^4} R^2\) (the anomaly cancellation condition), one breaks to D=6 N=(1,0), which is the theory encoded in `d6_n10`. The bosonic content (metric, anti-self-dual 3-form $H$, gauge 2-form $F$, dilaton $\Phi$) matches the tensor + vector multiplet sector.

Alternatively, M-theory on $K3$ gives D=7 with 16 supercharges; further compactification or orbifolding gives D=6 N=(1,0).

### D=10 Heterotic / IIA → D=4 N=1

Compactify heterotic string theory on a Calabi–Yau threefold \(CY_3\). With holonomy group $SU(3)\subset SO(6)$, this preserves $\mathcal{N}=1$ supersymmetry in D=4. The resulting supergravity has a Kähler potential determined by the CY moduli and is the effective theory of the heterotic landscape. The D=4 theories in `d4_einstein_maxwell` and `d4_minimal_gauged` are truncations of this richer structure to the gravity + gauge sector.

### Massive IIA from Romans deformation

The Romans mass $m$ cannot be obtained as a standard Kaluza–Klein reduction of D=11 supergravity — it is an intrinsically 10-dimensional deformation. It can be thought of as a vacuum expectation value for the dual of a 0-form field strength. The theory exists consistently at the quantum level (as a type IIA string background) and its near-horizon geometries include \(AdS_4\times S^6\) and warped $AdS$ vacua relevant to ABJM theory.

---

## Installation

### Cadabra2

Cadabra2 is a computer algebra system specialised for field theory. It provides both a notebook GUI and a Python library (`cadabra2`).

#### macOS — Homebrew (recommended)

```bash
brew install cadabra2
```

The Python library lands at:

```
/opt/homebrew/Cellar/cadabra2/<version>/libexec/lib/python3.13/site-packages
```

#### Linux / macOS — From Source

```bash
sudo apt-get install cmake python3-dev libgmp-dev libpcre3-dev \
     libboost-all-dev libgtkmm-3.0-dev python3-matplotlib

git clone https://github.com/kpeeters/cadabra2.git
cd cadabra2 && mkdir build && cd build
cmake .. -DENABLE_JUPYTER=OFF
make -j4 && sudo make install
```

See [cadabra.science/download.html](https://cadabra.science/download.html) for full instructions.

#### Verify

```bash
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 -c "from cadabra2 import *; print('Cadabra2 OK')"
```

### Python

The driver uses Cadabra's bundled Python 3.13. No additional packages are needed.

> **Important**: Always invoke scripts with Cadabra's own Python binary. The `cadabra2` C extension is linked against it specifically.

```bash
# Correct
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py d11_supergravity

# Wrong — system Python cannot import cadabra2
python3 integrability_driver.py d11_supergravity
```

---

## Quick Start

```bash
# List available theories
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py --list

# Run one theory
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py d11_supergravity
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py d10_iia
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py d6_n10

# Run all theories
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py --all
```

Define an alias for convenience:

```bash
alias cdbpy="/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3"
cdbpy integrability_driver.py --all
```

---

## Theory Reference

---

### D=11 Supergravity

**Theory**: The unique maximal ($\mathcal{N}=1$) supergravity in eleven dimensions. Supersymmetry completely fixes the theory. The field content consists of the graviton \(G_{MN}\) (44 off-shell components), the 3-form potential \(A^{(3)}_{MNP}\) (84 components), and the gravitino \(\psi_M\) (128 fermionic components) — matching exactly the massless spectrum of type II string theory.

**Fields**: metric \(G_{MN}\), 3-form \(A_{MNP}\), 4-form field strength \(G_{MNPQ}\)

$$G_{MNPQ} = 4\partial_{[M}A_{NPQ]}$$

**Index range**: $M,N,\ldots \in \{0,1,\ldots,10\}$

#### Bosonic Action

$$
(16\pi G_N^{(11)})\, S^{(11)} =\int d^{11}x\,\sqrt{-G}\left(R - \frac{1}{48}G_{M_1 M_2 M_3 M_4}G^{M_1 M_2 M_3 M_4}\right) - \frac{1}{6}\int A^{(3)}\wedge G^{(4)}\wedge G^{(4)}
$$

The last term is the Chern–Simons coupling, which is essential for the field equations to be consistent.

#### Field Equations

Einstein equation:

$$
R_{MN} =\frac{1}{12}\,G_{M L_1 L_2 L_3}\,G_N{}^{L_1 L_2 L_3} - \frac{1}{144}\,G_{MN}\,G_{L_1 L_2 L_3 L_4}G^{L_1 L_2 L_3 L_4}
$$

4-form equation (with Chern–Simons source):

$$
d{\star G^{(4)}} =\frac{1}{2}\,G^{(4)}\wedge G^{(4)}
$$

Bianchi identity: $dG^{(4)} = 0$.

#### Supersymmetry Variations

Bosonic fields:

$$
\delta e^a{}_M = i\,\bar{\varepsilon}\,\Gamma^a\psi_M, \qquad \delta A_{M_1 M_2 M_3} = 3i\,\bar{\varepsilon}\,\Gamma_{[M_1 M_2}\psi_{M_3]}
$$

Gravitino:

$$
\delta\psi_M = \nabla_M\varepsilon + \left(-\frac{1}{288}\,\Gamma_M{}^{L_1 L_2 L_3 L_4}G_{L_1 L_2 L_3 L_4} + \frac{1}{36}\,G_{M L_1 L_2 L_3}\Gamma^{L_1 L_2 L_3}\right)\varepsilon
$$

#### Gravitino KSE

The KSE is the vanishing of \(\delta\psi_M\) on the bosonic background:

$$
\mathcal{D}_a\varepsilon = \nabla_a\varepsilon + \Psi_a\varepsilon = 0
$$

$$
\Psi_a =-\frac{1}{288}\,\Gamma_a{}^{bcde}\,G_{bcde} + \frac{1}{36}\,G_{abcd}\,\Gamma^{bcd}
$$

No dilatino or gaugino KSE. No chirality matrix.

#### Dimensional Reduction to IIA

Writing the eleven-dimensional metric as

$$
G_{MN} = e^{-2\Phi/3}\begin{pmatrix} g_{\mu\nu} + e^{2\Phi}A_\mu A_\nu & e^{2\Phi}A_\mu \\ e^{2\Phi}A_\nu & e^{2\Phi} \end{pmatrix}
$$

and reducing the 3-form as \(A_{MNP} \to C_{\mu\nu\rho}\) (three 10d legs) and \(B_{\mu\nu} = A_{\mu\nu,10}\) (one leg in the 11th direction), one recovers type IIA supergravity on \(\mathcal{M}_{10}\).

#### Field Equations (residual form, Cadabra conventions)

$$R_{ab} = \frac{1}{12}G_{acde}G_b{}^{cde} - \frac{1}{144}\delta_{ab}G^2 + E_{ab}$$

$$\nabla^d G_{abcd} = -\frac{1}{1152}\,\varepsilon_{abc}{}^{defghijk}G_{defg}G_{hijk} + FG_{abc}$$

#### Epsilon Identity (D=11: no $i$, no $C$)

$$\varepsilon^{a_1\cdots a_{11}} = +\,\Gamma^{a_1\cdots a_{11}}$$

#### Integrability Result (gravitino)

$$
\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b + \frac{5}{144}BG_a{}^{bcde}\Gamma_{bcde} - \frac{1}{288}BG^{bcdef}\Gamma_{abcdef} + \frac{1}{72}FG^{bcd}\Gamma_{abcd} - \frac{1}{12}FG_a{}^{bc}\Gamma_{bc}
$$

All coefficients multiply on-shell residuals, confirming automatic satisfaction of the integrability condition.

---

### D=10 Type IIA (Massless)

**Theory**: Type IIA supergravity obtained by dimensional reduction of D=11 supergravity on \(\mathcal{M}_{10}\times S^1\). Non-chiral theory with two Majorana (non-Weyl) spinors. The chirality matrix \(\Gamma_{11}\) distinguishes the NS-NS sector (odd) from the RR sector (even).

**Fields**: metric \(g_{\mu\nu}\), dilaton $\Phi$, NS-NS 2-form \(B_{\mu\nu}\), RR 1-form \(A_\mu\), RR 3-form \(C_{\mu\nu\rho}\)

**Field strengths**:

$$F = dA, \quad H = dB, \quad G = dC - H\wedge A$$

**Index range**: $\mu,\nu,\ldots \in \{0,1,\ldots,9\}$

#### Bianchi Identities

$$dF = 0, \qquad dH = 0, \qquad dG = F\wedge H$$

#### Bosonic Action (string frame)

$$
\begin{aligned}
S &= \int\sqrt{-g}\left[e^{-2\Phi}\left(R + 4\nabla_\mu\Phi\nabla^\mu\Phi - \frac{1}{12}H_{\lambda_1\lambda_2\lambda_3}H^{\lambda_1\lambda_2\lambda_3}\right) \right. \\
&\quad \left. - \frac{1}{4}F_{\mu\nu}F^{\mu\nu} - \frac{1}{48}G_{\mu_1\cdots\mu_4}G^{\mu_1\cdots\mu_4}\right] \\
&\quad + \frac{1}{2}\int dC\wedge dC\wedge B
\end{aligned}
$$

#### Field Equations

Einstein equation:

$$
\begin{aligned}
R_{\mu\nu} &= -2\nabla_\mu\nabla_\nu\Phi + \frac{1}{4}H_{\mu\lambda_1\lambda_2}H_\nu{}^{\lambda_1\lambda_2} + \frac{1}{2}e^{2\Phi}F_{\mu\lambda}F_\nu{}^\lambda + \frac{1}{12}e^{2\Phi}G_{\mu\lambda_1\lambda_2\lambda_3}G_\nu{}^{\lambda_1\lambda_2\lambda_3} \\
&\quad + g_{\mu\nu}\left(-\frac{1}{8}e^{2\Phi}F^2 - \frac{1}{96}e^{2\Phi}G^2\right)
\end{aligned}
$$

Dilaton equation:

$$
\nabla^2\Phi = 2(\partial\Phi)^2 - \frac{1}{12}H^2 + \frac{3}{8}e^{2\Phi}F^2 + \frac{1}{96}e^{2\Phi}G^2
$$

2-form (RR) equation:

$$
\nabla^\mu F_{\mu\nu} + \frac{1}{6}H^{\lambda_1\lambda_2\lambda_3}G_{\lambda_1\lambda_2\lambda_3\nu} = 0
$$

3-form (NS-NS) equation:

$$
\begin{aligned}
\nabla_\lambda\!\left(e^{-2\Phi}H^{\lambda\mu\nu}\right) &= -\frac{1}{1152}\,\varepsilon^{\mu\nu\lambda_1\cdots\lambda_8}G_{\lambda_1\lambda_2\lambda_3\lambda_4}G_{\lambda_5\lambda_6\lambda_7\lambda_8} \\
&\quad + \frac{1}{2}G^{\mu\nu\lambda_1\lambda_2}F_{\lambda_1\lambda_2}
\end{aligned}
$$

4-form (RR) equation:

$$
\nabla_\mu G^{\mu\nu_1\nu_2\nu_3} + \frac{1}{144}\,\varepsilon^{\nu_1\nu_2\nu_3\lambda_1\cdots\lambda_7}G_{\lambda_1\lambda_2\lambda_3\lambda_4}H_{\lambda_5\lambda_6\lambda_7} = 0
$$

#### Chirality Matrix

The chirality matrix \(\Gamma_{11} = C\) satisfies:

$$
\Gamma_{\mu_1\cdots\mu_{10}} = -\varepsilon_{\mu_1\cdots\mu_{10}}\,\Gamma_{11}
$$

Commutation with gamma matrices:

| Gamma rank | Relation with \(C = \Gamma_{11}\) |
|---|---|
| Odd: $\Gamma^\mu$, $\Gamma^{\mu\nu\rho}$, $\Gamma^{\mu\nu\rho\sigma\kappa}$, ... | \(\{\Gamma^{a_1\cdots a_{2k+1}},\, C\} = 0\) |
| Even: $\Gamma^{\mu\nu}$, $\Gamma^{\mu\nu\rho\sigma}$, ... | \([\Gamma^{a_1\cdots a_{2k}},\, C] = 0\) |

#### Supersymmetry Variations

Bosonic fields:

$$
\delta e^a = \bar{\varepsilon}\,\Gamma^a\psi, \quad \delta B_{(2)} = 2\bar{\varepsilon}\,\Gamma_{11}\Gamma_{(1)}\psi, \quad \delta\Phi = \frac{1}{2}\bar{\varepsilon}\,\lambda
$$

Gravitino:

$$
\begin{aligned}
\delta\psi_\mu &= \nabla_\mu\varepsilon + \frac{1}{8}H_{\mu\nu_1\nu_2}\Gamma^{\nu_1\nu_2}\Gamma_{11}\varepsilon \\
&\quad + \frac{1}{16}e^\Phi F_{\nu_1\nu_2}\Gamma^{\nu_1\nu_2}\Gamma_\mu\Gamma_{11}\varepsilon + \frac{1}{8\cdot 4!}e^\Phi G_{\nu_1\cdots\nu_4}\Gamma^{\nu_1\cdots\nu_4}\Gamma_\mu\varepsilon
\end{aligned}
$$

Dilatino:

$$
\begin{aligned}
\delta\lambda &= \partial_\mu\Phi\,\Gamma^\mu\varepsilon + \frac{1}{12}H_{\mu_1\mu_2\mu_3}\Gamma^{\mu_1\mu_2\mu_3}\Gamma_{11}\varepsilon \\
&\quad + \frac{3}{8}e^\Phi F_{\mu_1\mu_2}\Gamma^{\mu_1\mu_2}\Gamma_{11}\varepsilon + \frac{1}{4\cdot 4!}e^\Phi G_{\mu_1\cdots\mu_4}\Gamma^{\mu_1\cdots\mu_4}\varepsilon
\end{aligned}
$$

#### KSEs

Setting $m=0$ (massless case), the KSEs \(\mathcal{D}_\mu\varepsilon = 0\) and $\mathcal{A}\varepsilon = 0$ become (using $C$ for \(\Gamma_{11}\)):

$$
\Psi_a = -\frac{1}{8}H_{abc}\,\Gamma^{bc} + e^\Phi\left[-\frac{1}{16}F_{bc}\,\Gamma_a\Gamma^{bc} - \frac{1}{192}G_{bcde}\,\Gamma_a\Gamma^{bcde}\right]\!C
$$

$$
\mathcal{A} = \nabla_a\Phi\,\Gamma^a - \frac{1}{12}H_{abc}\,\Gamma^{abc} + e^\Phi\left[-\frac{3}{16}F_{ab}\,\Gamma^{ab} + \frac{1}{96}G_{abcd}\,\Gamma^{abcd}\right]\!C
$$

#### Supercovariant Connection and Integrability

The gravitino integrability condition is:

$$\Gamma^\nu[\mathcal{D}_\mu,\mathcal{D}_\nu]\varepsilon - [\mathcal{D}_\mu,\mathcal{A}]\varepsilon + \Phi_\mu\mathcal{A}\varepsilon = 0$$

The auxiliary connection \(\Phi_\mu\) is:

$$
\begin{aligned}
\Phi_\mu &= \frac{1}{192}e^\Phi G_{\lambda_1\cdots\lambda_4}\Gamma^{\lambda_1\cdots\lambda_4}\Gamma_\mu \\
&\quad + C\!\left(\frac{1}{4}H_{\mu\lambda_1\lambda_2}\Gamma^{\lambda_1\lambda_2} - \frac{1}{16}e^\Phi F_{\lambda_1\lambda_2}\Gamma^{\lambda_1\lambda_2}\Gamma_\mu\right)
\end{aligned}
$$

The dilatino integrability condition is:

$$\Gamma^\mu[\mathcal{D}_\mu,\mathcal{A}]\varepsilon + \theta\,\mathcal{A}\varepsilon = 0$$

where the scalar $\theta$ is:

$$
\theta = -2\nabla_\mu\Phi\,\Gamma^\mu + C\left(\frac{1}{12}H_{\lambda_1\lambda_2\lambda_3}\Gamma^{\lambda_1\lambda_2\lambda_3} - \frac{1}{2}e^\Phi F_{\lambda_1\lambda_2}\Gamma^{\lambda_1\lambda_2}\right)
$$

#### Integrability Results

**Gravitino**:

$$
\begin{aligned}
\mathcal{I}_a = &-\frac{1}{2}E_a{}^b\Gamma_b + e^\Phi\left(-\frac{5}{192}BG_a{}^{bcde}\Gamma_{bcde} + \frac{1}{192}BG^{bcdef}\Gamma_{abcdef} - \frac{1}{48}FG^{bcd}\Gamma_{abcd} + \frac{1}{16}FG_a{}^{bc}\Gamma_{bc}\right) \\
&+ C\left(-\frac{1}{6}BH_a{}^{bcd}\Gamma_{bcd} - \frac{1}{4}FH_a{}^b\Gamma_b - \frac{3}{16}e^\Phi BF_a{}^{bc}\Gamma_{bc} + \frac{1}{16}e^\Phi BF^{bcd}\Gamma_{abcd} - \frac{1}{8}e^\Phi FF^b\Gamma_{ab} + \frac{1}{8}e^\Phi FF_a\right)
\end{aligned}
$$

**Dilatino**:

$$
\begin{aligned}
\mathcal{J} = &\,F\Phi + e^\Phi\left(\frac{1}{96}BG^{abcde}\Gamma_{abcde} - \frac{1}{24}FG^{abc}\Gamma_{abc}\right) \\
&+ C\left(\frac{1}{12}BH^{abcd}\Gamma_{abcd} + \frac{1}{4}FH^{ab}\Gamma_{ab} - \frac{3}{8}e^\Phi BF^{abc}\Gamma_{abc} + \frac{3}{4}e^\Phi FF^a\Gamma_a\right)
\end{aligned}
$$

---

### D=10 Type IIA (Romans Mass)

**Theory**: Massive deformation of type IIA supergravity (Romans 1986). The mass parameter $m$ deforms the field strengths and introduces a cosmological constant-like term. The massless theory is recovered in the limit $m \to 0$.

**Additional parameter**: Romans mass $m$ (denoted $\kappa$ in the Cadabra code)

#### Modified Field Strengths

$$
\tilde{F} = dA + mB, \qquad H = dB, \qquad \tilde{G} = dC - H\wedge A + \frac{m}{2}\,B\wedge B
$$

#### Modified Bianchi Identities

$$
d\tilde{F} = mH, \qquad dH = 0, \qquad d\tilde{G} = \tilde{F}\wedge H
$$

The standard Bianchi $dF = 0$ is replaced by $d\tilde{F} = mH$, which encodes the mass deformation.

#### Bosonic Action (string frame)

$$
\begin{aligned}
S = \int\bigg[&\sqrt{-g}\bigg(e^{-2\Phi}\left(R + 4(\partial\Phi)^2 - \frac{1}{12}H^2\right) - \frac{1}{4}\tilde{F}^2 - \frac{1}{48}\tilde{G}^2 - \frac{1}{2}m^2\bigg) \\
&+ \frac{1}{2}\,dC\wedge dC\wedge B + \frac{m}{6}\,dC\wedge B\wedge B\wedge B + \frac{m^2}{40}\,B^{\wedge 5}\bigg]
\end{aligned}
$$

#### Modified Field Equations

Einstein equation (mass term adds \(-\frac{1}{4}e^{2\Phi}m^2 g_{\mu\nu}\)):

$$
R_{\mu\nu} = -2\nabla_\mu\nabla_\nu\Phi + \frac{1}{4}H_\mu{}^2 + \frac{1}{2}e^{2\Phi}\tilde{F}_\mu{}^2 + \frac{1}{12}e^{2\Phi}\tilde{G}_\mu{}^2 + g_{\mu\nu}\left(-\frac{1}{8}e^{2\Phi}\tilde{F}^2 - \frac{1}{96}e^{2\Phi}\tilde{G}^2 - \frac{1}{4}e^{2\Phi}m^2\right)
$$

Dilaton equation (mass term adds $+\frac{5}{4}e^{2\Phi}m^2$):

$$
\nabla^2\Phi = 2(\partial\Phi)^2 - \frac{1}{12}H^2 + \frac{3}{8}e^{2\Phi}\tilde{F}^2 + \frac{1}{96}e^{2\Phi}\tilde{G}^2 + \frac{5}{4}e^{2\Phi}m^2
$$

3-form equation (mass term adds \(-mF_{\mu\nu}\)):

$$
\nabla_\lambda\left(e^{-2\Phi}H^{\lambda\mu\nu}\right) = m\tilde{F}^{\mu\nu} + \frac{1}{2}\tilde{G}^{\mu\nu\lambda_1\lambda_2}\tilde{F}_{\lambda_1\lambda_2} - \frac{1}{1152}\,\varepsilon^{\mu\nu\lambda_1\cdots\lambda_8}\tilde{G}_{\lambda_1\lambda_2\lambda_3\lambda_4}\tilde{G}_{\lambda_5\lambda_6\lambda_7\lambda_8}
$$

#### Modified KSEs

The mass parameter $m$ appears in both the gravitino and dilatino KSEs:

$$
\Psi_a = -\frac{1}{8}H_{abc}\,\Gamma^{bc} + e^\Phi\left[\frac{m}{8}\,\Gamma_a - \frac{1}{16}\tilde{F}_{bc}\,\Gamma_a\Gamma^{bc} - \frac{1}{192}\tilde{G}_{bcde}\,\Gamma_a\Gamma^{bcde}\right]\!C
$$

$$
\mathcal{A} = \nabla_a\Phi\,\Gamma^a - \frac{1}{12}H_{abc}\,\Gamma^{abc} + e^\Phi\left[\frac{5m}{8} - \frac{3}{16}\tilde{F}_{ab}\,\Gamma^{ab} + \frac{1}{96}\tilde{G}_{abcd}\,\Gamma^{abcd}\right]\!C
$$

The Cadabra code uses $\kappa$ for the Romans mass $m$. Setting $\kappa = 0$ recovers the massless IIA theory.

#### Integrability Results

Same structure as massless IIA. The mass term $m^2$ enters the Einstein and dilaton residuals \(E_{ab}\) and $F\Phi$, which vanish on-shell. The integrability output is formally identical to massless IIA with $F$, $G$ replaced by $\tilde{F}$, $\tilde{G}$.

---

### D=10 Heterotic

**Theory**: Heterotic string supergravity (NS-NS sector). Three KSEs: gravitino \(\Psi_a\), dilatino $\mathcal{A}$, gaugino $\mathcal{N}$. No chirality matrix. The \(E_8\times E_8\) or $SO(32)$ gauge group enters through the non-abelian 2-form \(F_{ab}\).

**Fields**: metric \(g_{ab}\), dilaton $\Phi$, NS-NS 3-form \(H_{abc}\), gauge 2-form \(F_{ab}\)

**Index range**: $a,b,\ldots \in \{0,1,\ldots,9\}$

#### Bosonic Action

$$
S = \frac{1}{2\kappa_{10}^2}\int d^{10}x\,\sqrt{-g}\,e^{-2\Phi}\left(R + 4\nabla_\mu\Phi\nabla^\mu\Phi - \frac{1}{12}H_{\mu\nu\rho}H^{\mu\nu\rho} - \frac{1}{4}F_{\mu\nu}F^{\mu\nu}\right)
$$

#### Field Equations and Bianchi Identities

$$
E_{\mu\nu} = R_{\mu\nu} + 2\nabla_\mu\nabla_\nu\Phi - \frac{1}{4}H_{\mu\lambda_1\lambda_2}H_\nu{}^{\lambda_1\lambda_2} = 0
$$

$$
F\Phi = \nabla^2\Phi - 2(\partial\Phi)^2 + \frac{1}{12}H^2 = 0
$$

$$
FH_{\mu\nu} = \nabla^\rho\left(e^{-2\Phi}H_{\mu\nu\rho}\right) = 0
$$

$$
FF_\mu = \nabla^\nu\left(e^{-2\Phi}F_{\mu\nu}\right) - \frac{1}{2}e^{-2\Phi}H_{\mu\nu\rho}F^{\nu\rho} = 0
$$

$$
BH_{\mu\nu\rho\sigma} = \nabla_{[\mu}H_{\nu\rho\sigma]} = 0, \qquad BF_{\mu\nu\rho} = \nabla_{[\mu}F_{\nu\rho]} = 0
$$

Note: the dilaton equation $F\Phi = 0$ is implied by the other equations and Bianchi identities via:

$$
\nabla_\nu(F\Phi) = -2E_{\nu\lambda}\nabla^\lambda\Phi + \nabla^\mu(E_{\mu\nu}) - \frac{1}{2}\nabla_\nu(E^\mu{}_\mu) - \frac{1}{3}BH_\nu{}^{\lambda_1\lambda_2\lambda_3}H_{\lambda_1\lambda_2\lambda_3} + \frac{1}{4}FH_{\lambda_1\lambda_2}H_\nu{}^{\lambda_1\lambda_2}
$$

#### KSEs

$$
\mathcal{D}_\mu\varepsilon = \nabla_\mu\varepsilon - \frac{1}{8}H_{\mu\nu\rho}\,\Gamma^{\nu\rho}\varepsilon = 0
$$

$$
\mathcal{A}\varepsilon = \nabla_\mu\Phi\,\Gamma^\mu\varepsilon - \frac{1}{12}H_{\mu\nu\rho}\,\Gamma^{\mu\nu\rho}\varepsilon = 0
$$

$$
\mathcal{F}\varepsilon = F_{\mu\nu}\,\Gamma^{\mu\nu}\varepsilon = 0
$$

#### Integrability Conditions

The integrability conditions of the three KSEs express as commutator identities:

$$
\Gamma^\nu[\mathcal{D}_\mu,\mathcal{D}_\nu]\varepsilon - [\mathcal{D}_\mu,\mathcal{A}]\varepsilon =\left(-\frac{1}{2}E_{\mu\nu}\Gamma^\nu - \frac{1}{4}e^{2\Phi}FH_{\mu\nu}\Gamma^\nu - \frac{1}{6}BH_{\mu\nu\rho\lambda}\Gamma^{\nu\rho\lambda}\right)\varepsilon
$$

$$
\Gamma^\mu[\mathcal{D}_\mu,\mathcal{A}]\varepsilon - 2\mathcal{A}^2\varepsilon =\left(F\Phi - \frac{1}{4}e^{2\Phi}FH_{\mu\nu}\Gamma^{\mu\nu} - \frac{1}{12}BH_{\mu\nu\rho\lambda}\Gamma^{\mu\nu\rho\lambda}\right)\varepsilon
$$

$$
\Gamma^\mu[\mathcal{D}_\mu,\mathcal{F}]\varepsilon + [\mathcal{F},\mathcal{A}]\varepsilon =\left(-2e^{2\Phi}FF_\mu\Gamma^\mu + BF_{\mu\nu\rho}\Gamma^{\mu\nu\rho}\right)\varepsilon
$$

All right-hand sides vanish on-shell, confirming integrability.

#### Epsilon Identities (D=10)

$$\varepsilon_{ijk\,abcdefg}\,\Gamma^{ijk} \to -6C\,\Gamma_{abcdefg}$$

$$\Gamma^{ij}\,\varepsilon_{a\,ij\,bcdefgh} \to 2C\,\Gamma_{abcdefgh}$$

$$\Gamma^{j}\,\varepsilon_{aj\,bcdefghi} \to -C\,\Gamma_{abcdefghi}$$

$$\varepsilon^{a_1\cdots a_{10}} = -C\,\Gamma^{a_1\cdots a_{10}}$$

#### Integrability Results

**Gravitino**:

$$\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{1}{6}BH_a{}^{bcd}\Gamma_{bcd} - \frac{1}{4}FH_a{}^b\Gamma_b$$

**Dilatino**:

$$\mathcal{J} = F\Phi - \frac{1}{12}BH^{abcd}\Gamma_{abcd} - \frac{1}{4}FH^{ab}\Gamma_{ab}$$

**Gaugino**:

$$\mathcal{K} = BF^{abc}\Gamma_{abc} - 2FF^a\Gamma_a$$

---

### D=9 NS-NS Supergravity

**Theory**: NS-NS sector of string theory effective action in $D=9$. Dimensional analogue of $D=10$ heterotic (NS-NS sector, no gauge field or gaugino). Two KSEs: gravitino $\Psi_a$ and dilatino $\mathcal{A}$. No chirality matrix exists in odd spacetime dimension.

**Fields**: metric $g_{ab}$, dilaton $\Phi$, NS-NS 3-form $H_{abc}$

**Index range**: $a,b,\ldots \in \{0,1,\ldots,8\}$

#### Bosonic Action

$$
S = \frac{1}{2\kappa_9^2}\int d^9x\,\sqrt{-g}\,e^{-2\Phi}\left(R + 4\nabla_a\Phi\nabla^a\Phi - \frac{1}{12}H_{abc}H^{abc}\right)
$$

#### Field Equations and Bianchi Identities

$$
E_{ab} = R_{ab} + 2\nabla_a\nabla_b\Phi - \frac{1}{4}H_{acd}H_b{}^{cd} = 0
$$

$$
F\Phi = \nabla^2\Phi - 2(\partial\Phi)^2 + \frac{1}{12}H^2 = 0, \qquad FH_{ab} = \nabla^c H_{abc} - 2H_{abc}\nabla^c\Phi = 0
$$

$$
BH_{abcd} = \nabla_{[a}H_{bcd]} = 0
$$

#### KSEs

The string-frame KSE connections are identical to those of $D=10$ heterotic (dimension-independent):

$$
\mathcal{D}_a\varepsilon = \nabla_a\varepsilon - \frac{1}{8}H_{abc}\,\Gamma^{bc}\varepsilon = 0, \qquad \mathcal{A}\varepsilon = \nabla_a\Phi\,\Gamma^a\varepsilon - \frac{1}{12}H_{abc}\,\Gamma^{abc}\varepsilon = 0
$$

#### Integrability Results

**Gravitino**:

$$\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{1}{6}BH_a{}^{bcd}\Gamma_{bcd} - \frac{1}{4}FH_a{}^b\Gamma_b$$

**Dilatino**:

$$\mathcal{J} = F\Phi - \frac{1}{12}BH^{abcd}\Gamma_{abcd} - \frac{1}{4}FH^{ab}\Gamma_{ab}$$

Both results are structurally identical to the $D=10$ heterotic gravitino and dilatino (absent the gaugino sector), reflecting the dimension-independence of the NS-NS string-frame equations. No epsilon $\to$ Gamma identity is needed: the maximum Gamma rank in the computation is 5, well below the $D=9$ volume-form rank of 9.

---

### D=5 Vector Multiplets (Ungauged)

**Theory**: $\mathcal{N}=2$ supergravity coupled to $k$ abelian vector multiplets, obtained from M-theory compactification on a Calabi–Yau threefold \(CY_3\) with Hodge numbers \(h_{(1,1)}, h_{(2,1)}\) and intersection numbers \(C_{IJK}\).

**Fields**: metric \(g_{\mu\nu}\), gauge fields \(A^I_\mu\), scalars $X^I$, scalar metric \(Q_{IJ}\)

**Index range**: $\mu,\nu \in \{0,...,4\}$; \(I,J,K \in \{1,...,h_{(1,1)}\}\)

#### Very Special Geometry

The scalars $X^I$ parametrise a **very special real manifold** $\mathcal{N}$ defined by the cubic constraint:

$$\mathcal{V}(X) =\frac{1}{6}\,C_{IJK}X^I X^J X^K =1$$

The constants \(C_{IJK}\) are the triple intersection numbers of \(CY_3\). The scalar metric is:

$$Q_{IJ} =-\frac{1}{2}\frac{\partial^2\ln\mathcal{V}}{\partial X^I\partial X^J}\bigg|_{\mathcal{V}=1} =-\frac{1}{2}C_{IJK}X^K + \frac{9}{2}X_I X_J$$

The dual coordinate is \(X_I = \frac{1}{6}C_{IJK}X^JX^K\), and the constraint becomes \(X^I X_I = 1\). Key identities:

$$X_I = \frac{2}{3}Q_{IJ}X^J, \qquad \partial_a X_I = -\frac{2}{3}Q_{IJ}\partial_a X^J, \qquad X^I\partial_a X_I = X_I\partial_a X^I = 0$$

#### Bosonic Action

The five-dimensional action obtained from M-theory reduction on \(CY_3\):

$$
\begin{aligned}
S_5 &= -\frac{1}{4\pi^2}\int d^5x\,\sqrt{-g}\left(R - Q_{IJ}\partial_\mu X^I\partial^\mu X^J - \frac{1}{2}Q_{IJ}F^I{}_{\mu\nu}F^{J\mu\nu}\right) \\
&\quad + \frac{C_{IJK}}{24\pi^2}\int A^I\wedge F^J\wedge F^K
\end{aligned}
$$

The last term is the five-dimensional Chern–Simons coupling, which descends from the eleven-dimensional Chern–Simons term. Supersymmetry forces the same metric \(Q_{IJ}\) to appear in both the scalar and vector kinetic terms.

#### Field Equations

Einstein equation:

$$
E_{\mu\nu} = R_{\mu\nu} - Q_{IJ}\left(F^I{}_{\mu\lambda}F^J{}_\nu{}^\lambda + \nabla_\mu X^I\nabla_\nu X^J - \frac{1}{6}g_{\mu\nu}F^I{}_{\rho\sigma}F^{J\rho\sigma}\right) = 0
$$

Maxwell equations:

$$
FF_{I\mu} = \nabla^\nu(Q_{IJ}F^J{}_{\mu\nu}) - \frac{1}{16}\,\varepsilon_\mu{}^{\nu\rho\lambda\kappa}C_{IJK}F^J{}_{\nu\rho}F^K{}_{\lambda\kappa} = 0
$$

Scalar field equations:

$$
\begin{aligned}
FX_I &= \nabla^2 X_I - \left(\frac{1}{6}C_{IMN} - \frac{1}{2}C_{MNK}X_I X^K\right)\nabla_\mu X^M\nabla^\mu X^N \\
&+ \frac{1}{2}F^M{}_{\mu\nu}F^{N\mu\nu}\left(C_{INP}X_M X^P - \frac{1}{6}C_{IMN} - 6X_I X_M X_N + \frac{1}{6}C_{MNJ}X_I X^J\right) = 0
\end{aligned}
$$

Bianchi identity:

$$BF^I{}_{\mu\nu\rho} = \nabla_{[\mu}F^I{}_{\nu\rho]} = 0$$

#### Decomposition $F^I = FX^I + G^I$

It is useful to decompose the gauge field strengths into components parallel and perpendicular to \(X_I\):

$$F^I = FX^I + G^I, \qquad X_I F^I = F, \qquad X_I G^I = 0$$

In terms of $F$ and $G^I$, the Einstein equation splits as:

$$
\begin{aligned}
E_{\mu\nu} &= R_{\mu\nu} - \frac{3}{2}F_{\mu\rho}F_\nu{}^\rho + \frac{1}{4}g_{\mu\nu}F^2 \\
&\quad - Q_{IJ}\!\left(\nabla_\mu X^I\nabla_\nu X^J + G^I{}_{\mu\rho}G^J{}_\nu{}^\rho - \frac{1}{6}g_{\mu\nu}G^I{}_{\rho\sigma}G^{J\rho\sigma}\right) = 0
\end{aligned}
$$

The Maxwell equation splits as:

$$FF_{I\mu} = X_I FF_\mu + FG_{I\mu} = 0$$

The Bianchi identity splits as:

$$BF^I{}_{\mu\nu\rho} = X^I BF_{\mu\nu\rho} + BG^I{}_{\mu\nu\rho} = 0$$

#### KSEs

The full KSEs expressed in terms of $F^I$:

$$
\mathcal{D}_\mu\varepsilon = \nabla_\mu\varepsilon + \frac{i}{8}X_I\left(\Gamma_\mu{}^{\nu\rho} - 4\delta_\mu{}^\nu\Gamma^\rho\right)F^I{}_{\nu\rho}\,\varepsilon = 0
$$

$$
\mathcal{A}^I\varepsilon = \left[\left(\delta^J{}_I - X^I X_J\right)F^J{}_{\mu\nu}\Gamma^{\mu\nu} + 2i\Gamma^\mu\partial_\mu X^I\right]\varepsilon = 0
$$

After the $F^I = FX^I + G^I$ decomposition:

$$
\mathcal{D}_\mu\varepsilon = \nabla_\mu\varepsilon + \frac{i}{8}\left(\Gamma_\mu{}^{\nu\rho} - 4\delta_\mu{}^\nu\Gamma^\rho\right)F_{\nu\rho}\,\varepsilon = 0
$$

$$
\mathcal{A}^I\varepsilon = G^I{}_{\mu\nu}\Gamma^{\mu\nu}\varepsilon + 2i\nabla_\mu X^I\Gamma^\mu\varepsilon = 0
$$

The spinor $\varepsilon$ is a Dirac spinor of $Spin(4,1)$.

#### Supercovariant Connection

The supercovariant curvature \(\mathcal{R}_{\mu\nu}\), defined by the commutator relation

$$[\mathcal{D}_\mu,\mathcal{D}_\nu]\varepsilon = \mathcal{R}_{\mu\nu}\varepsilon$$

involves the auxiliary connection:

$$
\Phi_{I\mu} = \frac{3i}{8}\nabla_\mu X_I + Q_{IJ}\left(-\frac{1}{6}G^J{}_{\mu\nu}\Gamma^\nu + \frac{1}{24}G^J{}_{\nu\rho}\Gamma_\mu{}^{\nu\rho}\right)
$$

#### Integrability Conditions

Gravitino integrability condition:

$$
\begin{aligned}
\Gamma^\nu[\mathcal{D}_\mu,\mathcal{D}_\nu]\varepsilon + \Phi_{I\mu}\mathcal{A}^I\varepsilon &= -\frac{1}{2}E_{\mu\nu}\Gamma^\nu\varepsilon \\
&\quad + i\!\left(-\frac{3}{4}BF_{\mu\nu\rho}\Gamma^{\nu\rho} + \frac{1}{8}BF_{\nu\rho\lambda}\Gamma_\mu{}^{\nu\rho\lambda} - \frac{1}{4}FF_\nu\Gamma_\mu{}^\nu + \frac{1}{2}FF_\mu\right)\!\varepsilon
\end{aligned}
$$

Scalar/gaugino integrability condition:

$$
\begin{aligned}
&\frac{i}{3}\Gamma^\mu[\mathcal{D}_\mu,\mathcal{A}_I]\varepsilon + \theta_{IJ}\mathcal{A}^J\varepsilon = FX_I\,\varepsilon \\
&\quad + \frac{i}{3}\!\left[\left(Q_{IJ} - \frac{3}{2}X_I X_J\right)BG^J{}_{\mu\nu\rho}\Gamma^{\mu\nu\rho} - 2\left(\delta^J{}_I - X^J X_I\right)FG_{J\mu}\Gamma^\mu\right]\!\varepsilon
\end{aligned}
$$

where the auxiliary connection \(\theta_{IJ}\) is:

$$
\theta_{IJ} = X_I\left(-\frac{3i}{4}\nabla_\mu X_J\Gamma^\mu + \frac{1}{12}Q_{JK}G^K{}_{\mu\nu}\Gamma^{\mu\nu}\right) + \frac{1}{24}C_{IJK}\mathcal{A}^K
$$

#### Integrability Result (Cadabra output, before very-special-geometry simplification)

The raw driver output contains:

$$
\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{3}{4}i\,BF^I{}_a{}^{bc}X_I\Gamma_{bc} + \frac{1}{8}i\,BF^{I\,bcd}X_I\Gamma_{abcd} + \ldots + (\text{VSG terms})
$$

The VSG (very-special-geometry) remainder terms involve \(Q_{IJ}\nabla X^I\nabla X^J\), \(F^IF^JQ_{IJ}\), \(X_IX_JF^IF^J\), and \(C_{IJK}F^IF^JX^K\). These cancel via the calabi/back/vanish substitution dictionaries (not yet encoded in `theories.json`).

---

### D=5 Vector Multiplets (Gauged)

**Theory**: Gauged extension of the D=5 vector-multiplet theory, obtained by gauging a $U(1)$ subgroup of the $SU(2)$ R-symmetry group with gauge coupling $\chi$ and coupling constants \(V_I\). Equivalently obtained from type IIB compactification on $S^5$.

**Additional parameter**: gauging parameter $\chi$, coupling constants \(V_I\)

#### Modified Action

$$
S_\text{gauged} = S_\text{ungauged} + \int d^5x\,\sqrt{-g}\,2\chi^2 U
$$

where the scalar potential is:

$$
U = 9\,V_I V_J\left(X^I X^J - \frac{1}{2}Q^{IJ}\right)
$$

with \(V_I\) constants and $Q^{IJ}$ the inverse of \(Q_{IJ}\).

#### Modified Einstein Equation

$$
E_{\mu\nu} = R_{\mu\nu} - Q_{IJ}\left(F^I{}_{\mu\lambda}F^J{}_\nu{}^\lambda + \nabla_\mu X^I\nabla_\nu X^J - \frac{1}{6}g_{\mu\nu}F^I{}_{\rho\sigma}F^{J\rho\sigma}\right) + \frac{2}{3}\chi^2 U\,g_{\mu\nu} = 0
$$

#### Modified Scalar Field Equations

The scalar equations gain additional $\chi^2$ terms:

$$
FX_I = (\text{ungauged terms}) + 3\chi^2 V_M V_N\left(\frac{1}{2}C_{IJK}Q^{MJ}Q^{NK} + X_I(Q^{MN} - 2X^M X^N)\right) = 0
$$

#### Modified KSEs

The gravitino KSE gains additional gauge terms:

$$
\mathcal{D}_\mu\varepsilon = \nabla_\mu\varepsilon + \frac{i}{8}X_I\left(\Gamma_\mu{}^{\nu\rho} - 4\delta_\mu{}^\nu\Gamma^\rho\right)F^I{}_{\nu\rho}\,\varepsilon + \chi\left(-\frac{3i}{2}V_I A^I{}_\mu + \frac{1}{2}V_I X^I\Gamma_\mu\right)\varepsilon = 0
$$

The gaugino/scalar KSE gains a mass-like term:

$$
\mathcal{A}^I\varepsilon = \left[\left(\delta^J{}_I - X^I X_J\right)F^J{}_{\mu\nu}\Gamma^{\mu\nu} + 2i\Gamma^\mu\partial_\mu X^I - 6i\chi\left(Q^{IJ} - \frac{2}{3}X^I X^J\right)V_J\right]\varepsilon = 0
$$

#### Modified Supercovariant Connection

The auxiliary connection \(\Phi_{I\mu}\) gains an additional term:

$$
\Phi_{I\mu} = \frac{3i}{8}\nabla_\mu X_I + Q_{IJ}\left(-\frac{1}{6}F^J{}_{\mu\nu}\Gamma^\nu + \frac{1}{24}F^J{}_{\nu\rho}\Gamma_\mu{}^{\nu\rho}\right) + \frac{i}{4}\chi V_I\Gamma_\mu
$$

The \(\theta_{IJ}\) connection gains:

$$
\theta_{IJ} = (\text{ungauged terms}) + \frac{i}{2}\chi\left(X_I V_J + C_{IJL}Q^{LM}V_M\right)
$$

#### Integrability Result

Same structure as ungauged, with the gauging parameter $\chi$ appearing inside \(E_{ab}\) (cosmological term). The Cadabra output contains \(V_I\nabla X^I\), \(V_IV_JX^IX^J\) terms that vanish via the very-special-geometry constraint.

---

### D=5 Minimal

**Theory**: Minimal $\mathcal{N}=1$ supergravity with a single U(1) gauge field and Chern–Simons coupling. This is the $k=1$, \(C_{111}=1\) limit of the vector-multiplet theory with $X^1 = 1$ (no moduli).

**Fields**: metric \(g_{ab}\), Maxwell 2-form \(F_{ab}\)

**Index range**: $a,b,\ldots \in \{0,1,2,3,4\}$

#### Bosonic Action

$$
S = \frac{1}{16\pi G_5}\int d^5x\,\sqrt{-g}\left(R - \frac{3}{4}F_{ab}F^{ab}\right) + \frac{1}{4\pi G_5}\frac{1}{4\sqrt{3}}\int A\wedge F\wedge F
$$

#### Gravitino KSE

$$\Psi_a = \frac{i}{8}\left(\Gamma_a{}^{bc} - 4\delta_a{}^b\Gamma^c\right)F_{bc}$$

#### Field Equations

$$R_{ab} = \frac{3}{2}F_{ac}F_b{}^c - \frac{1}{4}\delta_{ab}F^2 + E_{ab}$$

$$\nabla^b F_{ab} = \frac{1}{4}\varepsilon_a{}^{ijkl}F_{ij}F_{kl} + FF_a$$

#### Epsilon Identity (Chern–Simons)

$$\varepsilon^{abcde} = -i\,\Gamma^{abcde}$$

#### Integrability Result (gravitino)

$$\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{3}{4}i\,BF_a{}^{bc}\Gamma_{bc} + \frac{1}{8}i\,BF^{bcd}\Gamma_{abcd} - \frac{1}{4}i\,FF^b\Gamma_{ab} + \frac{1}{2}i\,FF_a$$

---

### D=6 N=(1,0)

**Theory**: Chiral $\mathcal{N}=(1,0)$ supergravity coupled to a tensor multiplet. Three KSEs: gravitino \(\Psi_a\), dilatino $\mathcal{A}$, gaugino $\mathcal{N}$. Rich dilaton structure with fractional exponential weights $e^{\pm\Phi/4}$, $e^{\pm\Phi/2}$.

**Fields**: metric \(g_{ab}\), anti-self-dual 3-form \(H_{abc}\), gauge 2-form \(F_{ab} = dA\), dilaton $\Phi$, gauge coupling $g$

**Index range**: $a,b,\ldots \in \{0,1,2,3,4,5\}$

#### KSEs (dilaton frame)

$$\Psi_a = -ig A_a + \frac{1}{48}\,e^{\Phi/2}\,H_{bcd}\,\Gamma^{bcd}\Gamma_a$$

$$\mathcal{A} = \nabla_a\Phi\,\Gamma^a - \frac{1}{6}\,e^{\Phi/2}\,H_{abc}\,\Gamma^{abc}$$

$$\mathcal{N} = e^{\Phi/4}\,F_{ab}\,\Gamma^{ab} - 8ig\,e^{-\Phi/4}$$

Auxiliary connections:

$$\mu_a = \frac{1}{8}\nabla_a\Phi + \frac{1}{96}\,e^{\Phi/2}\,H_{bcd}\,\Gamma^{bcd}\Gamma_a$$

$$\lambda_a = \frac{1}{64}\left(e^{\Phi/4}F_{cd}\,\Gamma_a\Gamma^{cd} - 8\,e^{\Phi/4}F_{ab}\,\Gamma^b + 8ig\,e^{-\Phi/4}\Gamma_a\right)$$

#### Integrability Operators

$$\mathcal{I}_a = -\frac{1}{2}R_{ab}\Gamma^b + \Gamma^b\nabla_a\Psi_b - \Gamma^b\nabla_b\Psi_a + \Gamma^b[\Psi_a, \Psi_b] + \mu_a\mathcal{A} + \lambda_a\mathcal{N}$$

$$
\begin{aligned}
\mathcal{J} &= \Gamma^a\!\left(\nabla_a\mathcal{A} + \Psi_a\mathcal{A} - \mathcal{A}\Psi_a\right) - \frac{1}{24}\,e^{\Phi/2}\,H_{abc}\,\Gamma^{abc}\mathcal{A} \\
&\quad + \left(\frac{1}{8}\,e^{\Phi/4}F_{ab}\,\Gamma^{ab} + ig\,e^{-\Phi/4}\right)\mathcal{N}
\end{aligned}
$$

$$
\begin{aligned}
\mathcal{K} &= \Gamma^a\!\left(\nabla_a\mathcal{N} + \Psi_a\mathcal{N} - \mathcal{N}\Psi_a\right) - \frac{1}{4}[\mathcal{A},\mathcal{N}] \\
&\quad + \frac{1}{4}\Gamma^a\nabla_a\Phi\cdot\mathcal{N} - \frac{1}{2}\,e^{\Phi/4}F_{ab}\,\Gamma^{ab}\mathcal{A}
\end{aligned}
$$

#### Field Equations

$$
\begin{aligned}
R_{ab} &= \frac{1}{4}\nabla_a\Phi\nabla_b\Phi + \frac{1}{2}e^{\Phi/2}\!\left(F_{ac}F_b{}^c - \frac{1}{8}F^2\delta_{ab}\right) \\
&\quad + \frac{1}{4}e^\Phi\!\left(H_{acd}H_b{}^{cd} - \frac{1}{6}H^2\delta_{ab}\right) + 2g^2 e^{-\Phi/2}\delta_{ab} + E_{ab}
\end{aligned}
$$

$$\nabla^c H_{abc} = -H_{abc}\nabla^c\Phi + FH_{ab}$$

$$\nabla^a\nabla_a\Phi = \frac{1}{4}e^{\Phi/2}F^2 + \frac{1}{6}e^\Phi H^2 - 8g^2 e^{-\Phi/2} + F\Phi$$

#### Cleanup Rules (critical for gaugino)

The dilaton derivative expansions are:

$$
\begin{aligned}
\nabla_a e^{\Phi/2} &= \tfrac{1}{2}e^{\Phi/2}\nabla_a\Phi, & \nabla_a e^{\Phi/4} &= \tfrac{1}{4}e^{\Phi/4}\nabla_a\Phi \\
\nabla_a e^{-\Phi/4} &= -\tfrac{1}{4}e^{-\Phi/4}\nabla_a\Phi, & \nabla_a e^{-\Phi/2} &= -\tfrac{1}{2}e^{-\Phi/2}\nabla_a\Phi
\end{aligned}
$$

These must be applied before any product simplifications, or the gaugino result will contain unsimplified $\nabla(e^{n\Phi})$ terms.

#### Integrability Results

**Gravitino**:

$$
\begin{aligned}
\mathcal{I}_a &= -\frac{1}{2}E_a{}^b\Gamma_b + \frac{1}{12}\,e^{\Phi/2}\,BH_a{}^{bcd}\Gamma_{bcd} \\
&\quad - \frac{1}{48}\,e^{\Phi/2}\,BH^{bcde}\Gamma_{abcde} - \frac{1}{16}\,e^{\Phi/2}\,FH^{bc}\Gamma_{abc} + \frac{1}{8}\,e^{\Phi/2}\,FH_a{}^b\Gamma_b
\end{aligned}
$$

**Dilatino**:

$$\mathcal{J} = F\Phi - \frac{1}{6}\,e^{\Phi/2}\,BH^{abcd}\Gamma_{abcd} - \frac{1}{2}\,e^{\Phi/2}\,FH^{ab}\Gamma_{ab}$$

**Gaugino**:

$$\mathcal{K} = e^{\Phi/4}\,BF^{abc}\Gamma_{abc} - 2\,e^{\Phi/4}\,FF^a\Gamma_a$$

---

### D=4 Einstein–Maxwell

**Theory**: Pure $\mathcal{N}=2$ supergravity with U(1) gauge field. No dilaton, no cosmological constant.

**Fields**: metric \(g_{ab}\), Maxwell 2-form \(F_{ab}\)

**Index range**: $a,b,\ldots \in \{0,1,2,3\}$

#### Gravitino KSE

$$\Psi_a = \frac{i}{4}F_{bc}\,\Gamma_a{}^{bc} - \frac{i}{2}F_{ab}\,\Gamma^b$$

#### Field Equations

$$R_{ab} = 2F_{ac}F_b{}^c - \frac{1}{2}\delta_{ab}F^2 + E_{ab}, \qquad \nabla^b F_{ab} = FF_a$$

#### Bianchi Identities

$$\nabla_a F_{bc}\,\Gamma^{bc} \to 2\nabla_b F_{ac}\,\Gamma^{bc} + 3\,BF_{abc}\,\Gamma^{bc}$$

$$\nabla_b F_{cd}\,\Gamma_a{}^{bcd} \to BF_{bcd}\,\Gamma_a{}^{bcd}$$

#### Epsilon Identity

$$\varepsilon^{abcde} = -i\,\Gamma^{abcde}$$

#### Integrability Result (gravitino)

$$\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{3}{4}i\,BF_a{}^{bc}\Gamma_{bc} + \frac{1}{4}i\,BF^{bcd}\Gamma_{abcd} - \frac{1}{2}i\,FF^b\Gamma_{ab} + \frac{1}{2}i\,FF_a$$

---

### D=4 Minimal Gauged

**Theory**: $\mathcal{N}=2$ Einstein–Maxwell with cosmological constant $\Lambda = -3/\ell^2$ (AdS\(_4\) vacuum).

**Fields**: metric \(g_{ab}\), Maxwell 2-form \(F_{ab}\), gauge potential \(A_a\), AdS radius $\ell$

**Index range**: $a,b,\ldots \in \{0,1,2,3\}$

#### Gravitino KSE

$$\Psi_a = \frac{i}{4}F_{bc}\,\Gamma_a\Gamma^{bc} - i F_{ab}\,\Gamma^b - \frac{i}{2\ell}\,\Gamma_a - \frac{1}{\ell}\,A_a$$

#### Field Equations

$$R_{ab} = \frac{3}{\ell^2}\delta_{ab} + 2F_{ac}F_b{}^c - \frac{1}{2}\delta_{ab}F^2 + E_{ab}, \qquad \nabla^b F_{ab} = FF_a$$

#### Integrability Result (gravitino)

The cosmological constant contributions cancel upon using the Einstein equation:

$$\mathcal{I}_a = -\frac{1}{2}E_a{}^b\Gamma_b - \frac{3}{4}i\,BF_a{}^{bc}\Gamma_{bc} + \frac{1}{4}i\,BF^{bcd}\Gamma_{abcd} - \frac{1}{2}i\,FF^b\Gamma_{ab} + \frac{1}{2}i\,FF_a$$

---

## Unified Driver

The driver `integrability_driver.py` reads all theory data from `theories.json` and dispatches to the appropriate pipeline for each computation. Three pipeline variants are supported:

- **Standard** — the 9-step pipeline (substitute, Clifford, Leibniz, unwrap, field equations, Bianchi, epsilon identities, final Clifford, cleanup). Used for all minimal and non-matter-coupled theories.
- **VSG gravitino** — standard pipeline followed by very-special-geometry simplification (*calabi*, *back*, *vanish* rules) that resolves \(Q_{IJ}\), \(C_{IJK}\), \(X^I\) algebraic relations. Used for D=5 vector multiplet gravitino computations.
- **VSG scalar** — a custom pipeline with 3 KSE passes, intermediate calabi simplification, and extensive VSG post-processing. Used for D=5 vector multiplet scalar/gaugino computations.

Pipeline selection is automatic via the `pipeline_per_computation` field in `theories.json`.

### Command-line Usage

```bash
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py [theory_id]
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py [theory_id] --op gravitino
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py --list
/opt/homebrew/Cellar/cadabra2/2.5.14/libexec/bin/python3 integrability_driver.py --all
```

Use `--op` to run a single computation (e.g. `--op gravitino` or `--op scalar`).

### Available Theory IDs

| ID | D | Description |
|----|---|-------------|
| `d4_einstein_maxwell` | 4 | Pure N=2 + U(1), no Λ |
| `d4_minimal_gauged` | 4 | N=2 + U(1) + AdS₄ |
| `d5_minimal` | 5 | Minimal N=1 + Chern–Simons |
| `d5_vector_ungauged` | 5 | N=2 + vector multiplets |
| `d5_vector_gauged` | 5 | N=2 + vector multiplets + gauging |
| `d6_n10` | 6 | N=(1,0) + tensor + gauge multiplet |
| `d11_supergravity` | 11 | Unique maximal SUGRA |
| `d10_heterotic` | 10 | Heterotic NS-NS |
| `d10_iia` | 10 | Type IIA (NS-NS + RR, massless + Romans) |

### Python API

```python
from integrability_driver import run_theory, THEORIES, setup_kernel

results = run_theory('d11_supergravity')
results = run_theory('d5_vector_gauged', operator_filter='scalar')
print(list(THEORIES.keys()))
```

---

## theories.json Schema

All substitution strings use Cadabra LaTeX notation (backslash-escaped).

### Required Fields

```jsonc
{
  "id": "d11_supergravity",
  "description": "...",
  "dimension": 11,
  "index_range": "0..10",
  "kse": "{\\Psi_{a} -> ...}",
  "field_equations": "{R_{a b} -> ..., \\nabla^{d}{G_{a b c d}} -> ...}",
  "bianchi_identities": "{\\nabla_{a}{G_{b c d e}}\\Gamma^{b c d e} -> ...}",
  "integrability_operators": {
    "gravitino": "-\\frac{1}{2}R_{a b}\\Gamma^{b} + ..."
  }
}
```

### Optional Fields

| Field | Type | Purpose |
|-------|------|---------|
| `epsilon_identities` | list | Applied in order at step 7 |
| `cleanup_rules` | list | Applied in order at step 9 |
| `chirality_commutation` | object | `anti_commuting_with_C`, `commuting_with_C` lists |
| `internal_indices` | object | For matter-multiplet indices I,J,K,... |
| `extra_field_sub` | bool | Second field substitution for gauge potential theories |
| `kse_per_computation` | dict | Per-operator KSE override |
| `field_equations_per_computation` | dict | Per-operator field equation override |
| `bianchi_per_computation` | dict | Per-operator Bianchi override |
| `epsilon_extra_per_computation` | dict | Per-operator extra epsilon rule |
| `pipeline_per_computation` | dict | Maps computation name to pipeline variant (`standard`, `vsg_gravitino`, `vsg_scalar`) |
| `kernel_per_computation` | dict | Per-operator kernel modifications (extra commuting/noncommuting declarations) |
| `vsg` | object | Very-special-geometry rules: `calabi_gravitino`, `calabi_scalar`, `back_gravitino`, `back_scalar`, `vanish` |
| `references` | list | Key paper citations |
| `physics_notes` | string | Physical context and conventions |

### Internal Indices Schema

```jsonc
"internal_indices": {
  "symbols": "{I,J,K,L,M,N,O,P,Q,R}",
  "position": "spinor, position=fixed, position=independent",
  "depends": ["F^{I}_{a b}", "X^{I}", "X_{I}"],
  "symmetric": ["Q_{I J}", "C_{I J K}"],
  "tableau_symmetry": [{"symbol": "F^{I}_{a b}", "spec": "shape={1,1}, indices={1,2}"}],
  "noncommuting_with_gamma": ["{\\Psi_{a}, A^{I}, \\Gamma_{#}}"],
  "commuting": ["{X_{I}, V_{I}, C_{I J K}}"]
}
```

---

## Extending to New Theories

### Step 1 — Add a JSON entry to `theories.json`

Minimum required: `id`, `description`, `dimension`, `index_range`, `kse`, `field_equations`, `bianchi_identities`, `integrability_operators`.

### Step 2 — Critical rules

**Spaced indices in chirality commutation** (Cadabra parses `abc` as a single symbol — always use spaces):

```jsonc
// CORRECT
"anti_commuting_with_C": ["\\Gamma^{a}", "\\Gamma^{a b c}", "\\Gamma^{a b c d e}"]

// WRONG — rule never fires
"anti_commuting_with_C": ["\\Gamma^{a}", "\\Gamma^{abc}", "\\Gamma^{abcde}"]
```

**Fully distributed operator strings** (no outer parentheses):

```jsonc
// CORRECT
"gravitino": "... - \\nabla_{a}{A} - \\Psi_{a}A + A\\Psi_{a} + \\Phi_{a}A"

// WRONG — causes parsing differences vs standalone
"gravitino": "... - (\\nabla_{a}{A} + \\Psi_{a}A - A\\Psi_{a}) + \\Phi_{a}A"
```

**Dilaton derivative cleanup rules** — include every power of $e^{n\Phi}$ that appears in the KSE:

```jsonc
"cleanup_rules": [
  "\\nabla_{a}{\\exp{\\Phi}} -> \\exp{\\Phi}\\nabla_{a}{\\Phi}",
  "\\nabla_{a}{\\exp{\\frac{1}{2}\\Phi}} -> \\frac{1}{2}\\exp{\\frac{1}{2}\\Phi}\\nabla_{a}{\\Phi}",
  "\\nabla_{a}{\\exp{\\frac{1}{4}\\Phi}} -> \\frac{1}{4}\\exp{\\frac{1}{4}\\Phi}\\nabla_{a}{\\Phi}",
  "\\nabla_{a}{\\exp{-\\frac{1}{4}\\Phi}} -> -\\frac{1}{4}\\exp{-\\frac{1}{4}\\Phi}\\nabla_{a}{\\Phi}"
]
```

**Use `extra_field_sub: true`** when the KSE contains \(A_a\) (gauge potential). This applies the Maxwell field equation a second time after `product_rule` generates new \(\nabla_a A_b\) terms.

**Use power notation `X**2`** — Cadabra parses `X^{2}` as $X$ with index 2.

### Step 3 — Verification Checklist

- [ ] Driver result matches standalone script exactly
- [ ] All multi-index Gamma strings in `chirality_commutation` have spaces between every index
- [ ] Operator strings are fully distributed
- [ ] All $e^{n\Phi}$ powers in KSE have corresponding `∇(exp(...)) →` cleanup rules
- [ ] If matter indices appear, add `internal_indices` block

### Step 4 — Debugging

Add `display(ex)` after each pipeline step in both driver and standalone, then compare step by step. The first divergence reveals the root cause:

```python
substitute(ex, kse)
substitute(ex, field)
substitute(ex, kse)
print("After step 1:")
display(ex)  # compare with standalone here
```

| Divergence at step | Likely cause |
|--------------------|-------------|
| Step 1 — sign flip | C commutation rule not firing (spacing bug) |
| Step 9 — extra ∇ terms | Missing `∇(exp(...))` cleanup rule |
| Zero result | Kernel not reset, or `SelfNonCommuting` missing |
| Crash | Undeclared index type — add `internal_indices` |

---

## Verified Results

| Theory | Operator | Status |
|--------|----------|--------|
| D=4 Einstein–Maxwell | gravitino | ✓ matches standalone |
| D=4 Minimal Gauged | gravitino | ✓ matches standalone |
| D=5 Minimal | gravitino | ✓ matches standalone |
| D=5 Vector Ungauged | gravitino, scalar | ✓ both match standalone (VSG pipeline) |
| D=5 Vector Gauged | gravitino, scalar | ✓ both match standalone (VSG pipeline) |
| D=6 N=(1,0) | gravitino, dilatino, gaugino | ✓ all 3 match standalone |
| D=11 Supergravity | gravitino | ✓ matches standalone |
| D=10 Heterotic | gravitino, dilatino, gaugino | ✓ all 3 match standalone |
| D=10 Type IIA | gravitino, dilatino | ✓ both match standalone |
| D=9 NS-NS | gravitino, dilatino | ✓ both verified (standalone) |

---

## Known Limitations

**Romans mass / massive IIA**: The `d10_iia` theory in `theories.json` uses the Romans mass parameter $\kappa$. Setting $\kappa = 0$ in the KSEs gives the massless theory; the integrability result is the same in both cases because mass terms enter only through \(E_{ab}\) and $F\Phi$ residuals which vanish on-shell.

**Index alphabet**: The driver uses 16 spacetime indices `{a,...,p}`. Theories with $D > 16$ would need an extended alphabet.

**Cadabra version**: Tested against Cadabra2 2.5.14 (Homebrew, macOS Apple Silicon). The Python API is stable but `join_gamma` behaviour may differ across minor versions.

---

## Repository Structure

```
py_integrability_sugra/
├── README.md                     # This file
├── theories.json                 # Unified theory schema
├── integrability_driver.py       # Unified computation driver
├── docs/
│   └── project_notes.md          # Research notes and debugging guide
└── legacy/                       # Original standalone scripts (one per theory)
    ├── integrability_d4.py
    ├── integrability_d5_minimal.py
    ├── integrability_d5_vector_gauged.py
    ├── integrability_d6.py
    ├── integrability_d10_iia.py
    ├── integrability_d11.py
    └── integrability_heterotic.py
```

---

## References

- **Cadabra2**: P. Peeters, *Introducing Cadabra: A symbolic computer algebra system for field theory problems*, [hep-th/0701238](https://arxiv.org/abs/hep-th/0701238)
- **D=11 SUGRA**: E. Cremmer, B. Julia, J. Scherk, *Supergravity theory in eleven dimensions*, Phys. Lett. B **76** (1978) 409
- **Type IIA / IIB**: M.B. Green, J.H. Schwarz, E. Witten, *Superstring Theory* Vol. 2, Cambridge University Press
- **Massive IIA**: L.J. Romans, *Massive N=2a supergravity in ten dimensions*, Phys. Lett. B **169** (1986) 374
- **D=5 N=2 ungauged**: B. de Wit, H. Nicolai, *d=11 supergravity with local SU(8) invariance*; also A. Cadavid, A. Ceresole, R. D'Auria, S. Ferrara, *Eleven-dimensional supergravity compactified on Calabi-Yau threefolds*, Phys. Lett. B **357** (1995) 76
- **D=5 gauged**: M. Günaydin, G. Sierra, P.K. Townsend, *Gauging the d=5 Maxwell-Einstein supergravity theories*, Nucl. Phys. B **242** (1984) 244
- **Heterotic**: P. Candelas et al., *Vacuum configurations for superstrings*, Nucl. Phys. B **258** (1985) 46
- **KSE integrability**: U. Gran, J. Gutowski, G. Papadopoulos, various JHEP papers on classification of supersymmetric solutions
- **Spinor conventions**: Appendix conventions for $Spin(9,1)$ and $Spin(4,1)$ Clifford algebras
