---
layout: post
title: Pyscript
subtitle: Demo showing how a Simple WebGL scene would work in PyScript tag 
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/saga.jpg
#share-img: /assets/img/path.jpg
tags: [latex]
date: 2022-09-04
last-updated: 2022-09-04
---

{% include pyscript.html type="post" %}


<div id="myscript">
<py-env>
- numpy
</py-env>
<py-script>
import numpy as np

def jevons(
    p0: np.array, 
    p1: np.array
) -> float:
    """
    Jevons bilateral index, using price information.
    """
    return np.prod((p1 / p0) ** (1 / len(p0)))

jevons(np.array([1, 2, 3]), np.array([2, 4, 6]))
</py-script>
</div>