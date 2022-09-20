---
layout: post
title: Exact closed-form solution for the multilateral Geary-Khamis price index method
subtitle: A simple and elegant linear algebra solution to the Geary-Khamis method without iteration
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

An [alternative method](https://www.tandfonline.com/doi/full/10.1080/07350015.2020.1816176) is to use matrix operations, which is much more efficient. The problem of finding the $\vec{b}$ vector can be solved using the following system of equations:

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

The caveat to using this matrix method is that the matrix $M = I_{N}-C+R$ should be invertible or equivalently $\det(M) \neq 0$. The matrix $M$ being singular is extremely rare and in such cases one may be tempted to use the [Moore-Penrose pseudoinverse](https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse) to compute the best fit solution for $\vec{b}$, but this will lead to a non-unique solution in some cases. Therefore the iterative method should be used as a fallback when the matrix $M$ is not invertible.

The code below is the implementation of the Geary-Khamis method using matrices. It is written in Python and uses the `numpy` and `pandas` library to solve the system of equations using the matrix method, but also the iterative method as a fallback. The matrix method is extremely efficient with a significantly shorter runtime.

```python
def geary_khamis(
    df: pd.DataFrame,
    price_col: str = 'price',
    quantity_col: str = 'quantity',
    date_col: str = 'month',
    product_id_col: str = 'id',
    method_type: str = 'matrix'
) -> List:
    """
    Geary-Khamis price index method

    Params:
        df: pd.DataFrame
            The dataframe containing the data.
        price_col: str
            The name of the price column.
        quantity_col: str
            The name of the quantity column.
        date_col: str
            The name of the date column.
        product_id_col: str
            The name of the product id column.
        method_type: str
            The type of method to use. Either 'matrix' or 'iterative'.

	Returns:
		List of price indices
	"""
    if method_type not in ('matrix', 'iterative'):
        raise ValueError('The method type must be `matrix` or `iterative`')

    # We need to deal with missing values and reshape the df for the
    # required vectors and matrices.
    df = df.dropna(how='all', axis=1).T.fillna(0)

    # Get number of unique products for the size of the vectors and
    # matrices.
    N = len(df.index.unique(level=product_id_col))

    # Matrices for the prices, quantities and weights.
    prices = df.loc[price_col]
    quantities = df.loc[quantity_col]
    weights = df.loc['weights']

    # Use iterative method directly if specified.
    if method_type == 'iterative':
        return _geary_khamis_iterative(prices, quantities)

    # Inverse of diagonal matrix with total quantities for each good over all
    # time periods as diagonal elements and matrix product of weights and
    # transpose of quantities to produce a square matrix, both required for C
    # matrix.
    q_matrix_inverse = np.diag(1/quantities.T.sum())
    prod_weights_qt_matrix = weights @ quantities.T

    # Product of above matrices to give the C square matrix, with the fixed
    # identity and R matrix, and c vector all required determine the quality
    # adjustment factors b.
    C_matrix = q_matrix_inverse @ prod_weights_qt_matrix
    R_matrix = np.zeros(shape=(N, N))
    R_matrix[:1] = 1
    
    # Define combo matrix used for isolating the singular matrices and
    # calculating the index values from the combo matrix `I_n - C + R`.
    combo_matrix = np.identity(N) - C_matrix + R_matrix
    
    if abs(np.linalg.det(combo_matrix)) <= 1e-7:
        # Fallback to iterative method for singular matrices.
        return _geary_khamis_iterative(prices, quantities)
    else:
        # Primary matrix method for non-singular matrices.
        return _geary_khamis_matrix(prices, quantities, combo_matrix)

def _geary_khamis_iterative(
    prices: pd.DataFrame,
    quantities: pd.DataFrame,
    no_of_iterations: int = 100,
    precision: float = 1e-8,
) -> pd.Series:
    """
    Geary-Khamis iterative method.
    
    Params:
        prices : pd.DataFrame
            The price dataframe.
        quantities : pd.DataFrame
            The quantity dataframe.
        no_of_iterations : int, defaults to 100
            The number of iterations to perform.
        precision : float, defaults to 1e-8
            The precision to use for the iterative method.

    Returns:
        pd.Series
            The price index values.
    """
    # Initialise index vals as 1's to find the solution with iteration.
    price_levels = pd.Series(1.0, index=prices.columns)
    quantity_share = quantities.T / quantities.sum(axis=1)

    # Iterate until we reach the set level of precision, or after a set
    # number of iterations if they do not converge.
    for _ in range(no_of_iterations):
        # Obtain matrices for iterative calculation.
        deflated_prices = prices / price_levels
        factors = diag(deflated_prices @ quantity_share)

        # Calculate new price levels from previous value.
        new_price_levels = (
            diag(prices.T @ quantities)
            .div(quantities.T @ factors)
            .squeeze()
        )

        pl_abs_diff = abs(price_levels - new_price_levels)
        
        if (pl_abs_diff <= precision).all():
            # Break loop when we reach given precision for final price levels.
            break
        else:
            # Otherwise set price level for next iteration.
            price_levels = new_price_levels

    # Normalize by first period for final output.
    return price_levels / price_levels.iloc[0]

def _geary_khamis_matrix(
    prices: pd.DataFrame,
    quantities: pd.DataFrame,
    combo_matrix: pd.DataFrame,
) -> pd.Series:
    """
    Geary-Khamis matrix method.
	
    Params:
        prices : pd.DataFrame
            The price dataframe.
        quantities : pd.DataFrame
            The quantity dataframe.
        combo_matrix : pd.DataFrame
            The combo matrix.
    
    Returns:
        pd.Series
            The price index values.
    """
    # Calculation of the vector b (factors) required to produce the
    # price levels. Corresponds to `b = [I_n - C + R]^-1 [1,0,..,0]^T`.
    # We use the Moore-Penrose inverse for the matrix inverse.
    factors = np.linalg.pinv(combo_matrix) @ np.eye(len(prices.index), 1)

    # Determine price levels to compute the final index values.
    price_levels = diag(prices.T @ quantities).div(quantities.T @ factors)

    # Normalize price levels to first period for final index values.
    index_vals = price_levels / price_levels.iloc[0]

    # Output as Pandas series for dynamic window.
    return index_vals.iloc[:, 0]
```