---
layout: post
title: Introduction to Pyscript
subtitle: PyScript is a HTML framework to create Python apps in the browser
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/pyscript.jpg
#share-img: /assets/img/path.jpg
tags: [latex]
date: 2022-09-19
last-updated: 2022-09-19
---

## Say Hello to PyScript

PyScript is a framework that allows users to create rich Python applications in the browser using HTML's interface and the power of Pyodide, WASM, and modern web technologies. The PyScript framework provides users at every experience level with access to an expressive, easy-to-learn programming language with countless applications.

What is PyScript? Well, here are some of the core components:

* Python in the browser: Enable drop-in content, external file hosting, and application hosting without the reliance on server-side configuration
* Python ecosystem: Run many popular packages of Python and the scientific stack (such as numpy, pandas, scikit-learn, and more)
* Python with JavaScript: Bi-directional communication between Python and Javascript objects and namespaces
* Environment management: Allow users to define what packages and files to include for the page code to run
* Visual application development: Use readily available curated UI components, such as buttons, containers, text boxes, and more
* Flexible framework: A flexible framework that can be leveraged to create and share new pluggable and extensible components directly in Python

All that to say… PyScript is just HTML, only a bit (okay, maybe a lot) more powerful, thanks to the rich and accessible ecosystem of Python libraries.



```python
<link rel="icon" type="image/png" href="favicon.png" />
<link rel="stylesheet" href="https://pyscript.net/alpha/pyscript.css" />

<script defer src="https://pyscript.net/alpha/pyscript.js"></script>

<div id="pandas">
<py-env>
- pandas
</py-env>
<py-script>
import pandas as pd

df = pd.DataFrame({
    'a': [1, 2, 3],
    'b': [4, 5, 6]
})

df
</py-script>
</div>
```


<!-- {% include pyscript.html type="post" %}

<div id="pandas">
<py-env>
- pandas
</py-env>
<py-script>
import pandas as pd

df = pd.DataFrame({
    'a': [1, 2, 3],
    'b': [4, 5, 6]
})

df
</py-script>
</div> -->