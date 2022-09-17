---
layout: post
title: Markov chains
subtitle: Discrete-time Markov chains
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/markov.png
#share-img: /assets/img/path.jpg
tags: [markov chains, discrete-time, stochastic processes]
date: 2022-09-17
last-updated: 2022-09-17
---
A first-order Markov chain process is characterized by the Markov property, which states that the conditional probability distribution for the system at the next time period depends only on the current state of the system, and not on the state of the system at any previous time periods. A finite-state discrete-time Markov chain is a stochastic process that consists of a finite number of states and transition probabilities among the different states. The process evolves through successive time periods known as steps.

{% include mathjax.html type="post" %}

#### Discrete-time Markov Chain
Let a stochastic process $S = \{X_0, X_1, \cdots, X_n\}$ be a sequence of discrete random variables. Then the sequence $S$ is a Markov Chain if it satisfies the Markov property:

$$\begin{align}
\mathcal{P}(X_{t+1} = j | X_t = i, X_{t-1}, \cdots, X_1, X_0) &= \mathcal{P}(X_{t+1} = j | X_t = i) \nonumber \\
&= \mathcal{P}(X_{t} = j | X_{t-1} = i) \nonumber \\
&= \mathcal{P}(X_{1} = j | X_{0} = i)  \ ,
\end{align}$$

for all $t=0,1,\cdots, n$ and all possible states $i, j = 1, \cdots, m$.

Thus, such a Markov chain process is memoryless. Consequently, it can be used for describing systems that follow a chain of linked events, where what happens next depends only on the current state of the system. A Markov chain with memory is a process satisfying,

$$\begin{align}
\mathcal{P}(X_{t+1} = j | X_t = i, X_{t-1}, \cdots, X_1, X_0) = \mathcal{P}(X_{t+1} = j | X_t = i, X_{t-1}, \cdots, X_{n-p}) \nonumber \ ,
\end{align}$$

for all $ n > p$. In this type of Markov chain, the future state depends on the past $p$ states where $p=1$ is equivalent to the usual Markov property. 

<center>
<img src="/assets/img/markov.png" alt="isolated" width="300"/>
</center>

If the state space is finite, then the transition probability can be represented by a matrix $P$ whose $(i,j)$th element is given by:

$$\begin{align}
P_{i j} = \mathcal{P}(X_{t+1} = j | X_t = i) \geq 0, \, \, \, \, \, \, \sum_{j=1}^m P_{i j} = 1 \ .
\end{align}$$

This matrix is also known as the one-step probability matrix, i.e. the $P_{i j}$ is the probability of moving from state $i$ to state $j$ in one-step in the chain. Similarly the $(i,j)$th element of the $k$-step probability matrix $P^{(k)}$ is,

$$\begin{align}
P_{ij}^{(k)} &= \mathcal{P}(X_{t+k}=j | X_{t} = i) \ ,
\nonumber \\
&= \mathcal{P}(X_k = j | X_0 = i) \ ,
\nonumber \\
&\geq 0 \ ,
\end{align}$$

and,

$$\begin{align}
\sum_{j=1}^m P_{ij}^{(k)} = 1 \ , \, \, \, \text{ for }k = 0, \cdots, n \ .
\end{align}$$

This can be written in terms of the one-state transition matrix as $P_{ij}^{(k)} = (P^k)_{i j}$. As expected for $k=0,1$ we have,

$$\begin{align}
P^{(0)} = I_m, \, \, \, \, P^{(1)} = P \ .
\end{align}$$

where $I_m$ is the $m \times m$ identity matrix and $P$ is the one-step transition matrix. The Chapman-Kolmogorov equation is,

$$\begin{align}
P_{ij}^{(n)} = \sum_{\ell=1}^m P_{i \ell}^{(m)} P_{\ell j}^{(n-m)} \ .
\end{align}$$

This allows us to write the general property,

$$\begin{align}
P^{(n + m)} = P^{(n)} P^{(m)} \ .
\end{align}$$

The steady state vector $\pi$ is defined as,

$$\begin{align}
\lim_{n \rightarrow \infty} P_{ij}^{(n)} = \pi_j, \, \, \, \, \, \,  \sum_{j=1}^m \pi_j = 1 \ .
\end{align}$$

We can determine this from,

$$\begin{align}
\pi P = \pi \ .
\end{align}$$