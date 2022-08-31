---
layout: post
title: Using requests library with AJAX in Python to get data from a JavaScript website
subtitle: Replaying AJAX routines instead of using Selenium
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/ajax.png
#share-img: /assets/img/path.jpg
tags: [JavaScript, python, ajax, requests]
date: 2022-08-30
last-updated: 2022-08-31
---

In the past, we used libraries such as urllib or requests to read or download data from webpages, but things started falling apart with dynamic websites.

Due to the increasing popularity of modern JavaScript frameworks such as React, Angular, and Vue, more and more websites are now built dynamically with JavaScript. This poses a challenge for web scraping because the HTML markup is not available in the source code. Therefore, we cannot scrape these JavaScript webpages directly and may need to render them as regular HTML markup first. 

For such tasks, particularly where we have to interact with the web browser, selenium is the usual go-to library which uses an automated web browser called a web driver. However, this can be more resource heavy than using the requests library. 

The way that JavaScript calls work is that the browser makes a request to the server, using AJAX routines, and the server returns the data to the browser. 

<img src="/assets/img/ajax.png" alt="isolated" width="300"/>

It turns out we can intercept the AJAX routines from the page and reproduce/replay them to get the same data without a browser.

As an example, let us consider a use case which has been covered in the following guide:

[Using selenium and Pandas in Python to get table data from a JavaScript website](https://medium.com/@michaelstvnhodge/using-selenium-in-python-to-get-table-data-from-a-javascript-website-13292863bfa4 "Using selenium and Pandas in Python to get table data from a JavaScript website")

The guide above uses selenium to obtain a table data from a JavaScript website, in particular to obtain the available appointments for the UK Passport Fast Track service. The main URL for the service is [https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml](https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml) and this service uses JavaScript to render its webpage as you navigate through the options, which require user input.

We will attempt to scrape the same table data using requests by replaying AJAX routines.

<img src="/assets/img/source.png" alt="isolated" width="600"/>

<img src="/assets/img/network.png" alt="isolated" width="600"/>

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

    Params:
        MAIN_URL: str
            The main URL of the website.
    
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
        MAIN_URL: str
            The main URL of the website.
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

Always try to reproduce the AJAX routines before trying something more complicated or heavy like using an automated browser.

