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

Due to the increasing popularity of modern JavaScript frameworks such as React, Angular, and Vue, more and more websites are now built dynamically with JavaScript. This poses a challenge for web scraping because the HTML markup is not available in the source code. Therefore, we cannot scrape these JavaScript webpages directly and may need to render them as regular HTML markup first. For such tasks, where we have to interact with the web browser, selenium is your go-to library.

In the past, we used libraries such as urllib or requests to read or download data from webpages, but things started falling apart with dynamic websites. There is hope for some JavaScript websites where we can make use of AJAX to get data from the server. 

<img src="/assets/img/ajax.png" alt="isolated" width="300"/>

Using Requests generally results in faster and more concise code, while using Selenium makes development faster on Javascript heavy sites. 

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



