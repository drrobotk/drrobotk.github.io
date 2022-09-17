---
layout: post
title: Mathematics
subtitle: LaTeX test
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/saga.jpg
#share-img: /assets/img/path.jpg
tags: [latex]
date: 2022-09-04
last-updated: 2022-09-04
---

{% include mathjax.html type="post" %}


The Geary-Khamis method involves calculated a set of quality adjustment factors, $b_n$, simultaneously with the price levels, $P_t$. The two equations that determine both of these are:

$$
\begin{aligned}
b_{n}&=\sum_{t=1}^{T}\left[\frac{q_{t n}}{q_{n}}\right]\left[\frac{p_{t n}}{P_{t}}\right]
\nonumber \\
P_{t}&=\frac{p^{t} \cdot q^{t}}{ \vec{b} \cdot q^{t}}
\end{aligned}
$$

These equations can be solved by an iterative method, where a set of $b_n$ are arbitrarily chosen, which can then be used to calculate an initial vector of price levels. This vector of prices is then used to generate a new $b$ vector, and so on until the changes become smaller than some threshold. 

An alternative method is to use matrix operations. The problem of finding the $\vec{b}$ vector can be solved using the following system of equations:

$$
\left[I_{N}-C\right] \vec{b}=0_{N}
$$

where $I_n$ is the $N \times N$ identity matrix, $0_N$ is an $N$-dimensional vector of zeroes and $C$ is the $N \times N$ matrix given by,

$$
C=\hat{q}^{-1} \sum_{t=1}^{T} s^{t} q^{t \mathbf{T}}
$$

where $\hat{q}^{-1}$ is the inverse of an $N \times N$ diagonal matrix $\hat{q}$, where the diagonal elements are the total quantities purchased for each good over all time periods, $s^{t}$ is a vector of the expenditure shares for time period $t$, and $q^{t \mathbf{T}}$ is the transpose of the vector of quantities purchased in time period $t$. It can be shown that the matrix $[I - C]$ is singular since:

$$
\bigg(\sum_{t=1}^T q^{t \mathbf{T}}\bigg) C = \sum_{t=1}^T q^{t \mathbf{T}}
$$

So a normalisation is required to solve for $\vec{b}$ and we can use the constraint:

$$
\sum_{n=1}^{N} b_{n} q_{n}=1
$$

which is, in matrix form can be expressed as, 

$$
\vec{c}=R\left[\begin{array}{c}
	b_{1} q_{1} \\
	\vdots \\
	b_{N} q_{N}
\end{array}\right]
= \left[\begin{array}{c}
	1 \\
	0 \\
	\vdots \\
	0
\end{array}\right]
$$

where $\vec{c}$ is an $N \times 1$ vector and the $R$ is the $N \times N$ matrix,

$$
R=\left[\begin{array}{cccc}
	1 & 1 & \ldots & 1 \\
	0 & \ldots & \ldots & 0 \\
	\vdots & & & \vdots \\
	0 & \ldots & \ldots & 0
\end{array}\right]
$$

Adding the constraint to the original equation we now have the solution for $\vec{b}$,

$$
\vec{b}=\left[I_{N}-C+R\right]^{-1} \vec{c}
$$

Once the $\vec{b}$ vector has been calculated, the price levels can be computed from the equation:

$$
P_{t} =\frac{p^{t} \cdot q^{t}}{ \vec{b} \cdot q^{t}}
$$

The price index values can be determined by normalizing the price levels by the first period as,

$$
I_{t} = \frac{P_{t}}{P_{0}}
$$