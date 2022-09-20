---
layout: post
title: Exact solution for the multilateral Geary-Khamis price index method using Linear Algebra
subtitle: A simple and elegant solution to the Geary-Khamis method without iteration
#cover-img: /assets/img/path.jpg
thumbnail-img: https://user-images.githubusercontent.com/51001263/164988385-855ceecf-a5e0-4073-8239-cb1f2304d244.png
#share-img: /assets/img/path.jpg
tags: [cpi, price index, geary-khamis, linear algebra]
date: 2021-09-20
last-updated: 2022-09-20
---
Price index methods are being used or currently being implemented by many statistical agencies around the world to calculate price indices e.g the Consumer Price Index (CPI) using bilateral or multilateral methods. The CPI in the UK is currently based on a bilateral method, but that will change in the future with the introduction of alternative data sources such as scanner or web-scraped data.

Multilateral methods simultaneously make use of all data over a given time period. The use of multilateral methods for calculating temporal price indices is relatively new internationally, but these methods have been shown to have some desirable properties relative to their bilateral method counterparts, in that they account for new and disappearing products (to remain representative of the market) while also reducing the scale of chain-drift.

{% include mathjax.html type="post" %}

The Geary-Khamis method is a multilateral method which involves calculated a set of quality adjustment factors, $b_n$, simultaneously with the price levels, $P_t$. The two equations that determine both of these are:

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