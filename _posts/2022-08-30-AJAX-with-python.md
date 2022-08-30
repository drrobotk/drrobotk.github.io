---
layout: post
title: Using requests library with AJAX in Python to get data from a JavaScript website
subtitle: No more Selenium!
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/ajax.png
#share-img: /assets/img/path.jpg
tags: [javascript, python, ajax, requests]
date: 2022-08-30
last-updated: 2022-08-30
---

```python
import requests, re
from typing import Dict, Union
import dateutil.parser as dparser
from datetime import date as dt
from datetime import datetime, timedelta
import time

from bs4 import BeautifulSoup
import pandas as pd

session = requests.Session()

def get_insthash(MAIN_URL: str) -> str:
    """
    Get the insthash.
    Returns:
        str
            Instance hash.
    """
    data = session.get(MAIN_URL)
    soup = BeautifulSoup(data.text, 'html.parser')
    insthash_data = soup.find('input', {'name': 'I_INSTHASH'})
    if insthash_data is None:
        return None
    return insthash_data['value']

def get_ajax(
    MAIN_URL: str,
    insthash: str,
    params: Dict = None,
    init: bool = False,
) -> str:
    """
    Get the ajax text to process JS request.
    Params:
        insthash: str
            Instance hash.
        params: Dict
            Parameters to pass to the request.
        init: bool
            Whether to get the initial data or not.
    Returns:
        str
            The ajax text for the post request.
    """
    open_tag = f"<ajaxrequest><insthash>{insthash}</insthash><post url='{MAIN_URL}'>"
    if init:
        return open_tag + "</post><saving>TRUE</saving></ajaxrequest>"

    params_list = [f'{key}={value}' for key, value in params.items()]
    return open_tag + '&amp;'.join(params_list) + '</post></ajaxrequest>'
```

<img src="/assets/img/ajax.png" alt="isolated" width="300"/>

