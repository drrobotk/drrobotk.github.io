---
layout: post
title: Using requests library with AJAX in Python to get data from a JavaScript website
subtitle: Replaying AJAX routines instead of using Selenium
#cover-img: /assets/img/path.jpg
thumbnail-img: /assets/img/ajax.png
#share-img: /assets/img/path.jpg
tags: [JavaScript, python, ajax, requests]
date: 2022-08-30
last-updated: 2022-09-01
---
In the past, we used libraries such as urllib or requests to read or download data from webpages, but things started falling apart with dynamic websites.

Due to the increasing popularity of modern JavaScript frameworks such as React, Angular, and Vue, more and more websites are now built dynamically with JavaScript. This poses a challenge for web scraping because the HTML markup is not available in the source code. Therefore, we cannot scrape these JavaScript webpages directly and may need to render them as regular HTML markup first. 

For such tasks, particularly where we have to interact with the web browser, selenium is the usual go-to library which uses an automated web browser called a web driver. However, this can be more resource heavy than using the requests library. 

The way that JavaScript calls work is that the browser makes a request to the server, using AJAX routines, and the server returns the data to the browser. 

<img src="/assets/img/ajax.png" alt="isolated" width="300"/>

It turns out we can intercept the AJAX routines from the page and reproduce/replay them to get the same data without a browser.

As an example, let us consider a use case which has been covered in the following guide: [Using selenium and Pandas in Python to get table data from a JavaScript website](https://medium.com/@michaelstvnhodge/using-selenium-in-python-to-get-table-data-from-a-javascript-website-13292863bfa4 "Using selenium and Pandas in Python to get table data from a JavaScript website"). This work was completed by [@mshodge](https://github.com/mshodge) as part of the code for v1 of the GitHub repo [youshallnotpassport](https://github.com/mshodge/youshallnotpassport) behind the Twitter bot [@ukpassportcheck](https://twitter.com/ukpassportcheck "@ukpassportcheck"). This project was featured in a Telegraph article: [A data scientist found a way to beat the passport renewal queue – and save dozens of holidays](https://www.telegraph.co.uk/travel/advice/data-scientist-found-way-beat-passport-renewal-queue-save/ "A data scientist found a way to beat the passport renewal queue – and save dozens of holidays").

The guide above uses selenium to obtain a table data from a JavaScript website, in particular to obtain the available appointments for the UK Passport Fast Track service. The main URL for the service is [https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml](https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml) and this service uses JavaScript to render its webpage as you navigate through the options, which require user input.

We will use requests to scrape the same table data by replaying AJAX routines, instead of using a selenium webdriver. This work was implemented as part of v2 of [youshallnotpassport](https://github.com/mshodge/youshallnotpassport) which has significantly improved the speed and reliability of the scraping process, since it does not rely on installing and using a web driver.

The first step is to visit the url and view the network requests in developer mode. The following screenshots were taken from a Firefox browser.

We look for the first request to the server, which in this case is a POST request:

<img src="/assets/img/network1.png" alt="isolated" width="800"/>

The POST request contains the following request payload:

<img src="/assets/img/network2.png" alt="isolated" width="800"/>

Request payload (after formatting):
```html
<ajaxrequest>
<insthash>4101-d9689b26a765a87f</insthash>
<post url='https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml'>
</post>
<saving>TRUE</saving>
</ajaxrequest>
```

The shows the first request is to initialize the AJAX routines using an instance hash and the tag `saving` is set to `TRUE` to indicate that the following AJAX requests should be saved at each step.

We can find the instance hash by looking at the `insthash` tag contained in the source from the initial request to the url.

<img src="/assets/img/source.png" alt="isolated" width="800"/>

Now let's move to the next section of the application by appending dummy data:

<img src="/assets/img/dummy.png" alt="isolated" width="400"/>

and again checking the network requests for the request and response payload:

<img src="/assets/img/network4.png" alt="isolated" width="800"/>

Request payload (after formatting):
```html
<ajaxrequest>
<insthash>4101-d9689b26a765a87f</insthash>
<post url='https://www.passportappointment.service.gov.uk/outreach/PublicBooking.ofml'>
I_SUBMITCOUNT=1&amp;
I_INSTHASH=4101-d9689b26a765a87f&amp;
I_PAGENUM=4&amp;
I_JAVASCRIPTON=1&amp;
I_UTFENCODED=TRUE&amp;
I_ACCESS=&amp;
I_TABLELINK=&amp;
I_AJAXMODE=&amp;
I_SMALLSCREEN=&amp;
I_SECTIONHASH=d9689b26a765a87f_Section_start&amp;
FHC_Passport_count=&amp;
F_Passport_count=1&amp;
F_Applicant1_firstname=m&amp;
F_Applicant1_lastname=m&amp;
FD_Applicant1_dob=1&amp;
FM_Applicant1_dob=1&amp;
FY_Applicant1_dob=1990&amp;
F_Applicant2_firstname=&amp;
F_Applicant2_lastname=&amp;
FD_Applicant2_dob=&amp;
FM_Applicant2_dob=&amp;
FY_Applicant2_dob=&amp;
F_Applicant3_firstname=&amp;
F_Applicant3_lastname=&amp;
FD_Applicant3_dob=&amp;
FM_Applicant3_dob=&amp;
FY_Applicant3_dob=&amp;
F_Applicant4_firstname=&amp;
F_Applicant4_lastname=&amp;
FD_Applicant4_dob=&amp;
FM_Applicant4_dob=&amp;
FY_Applicant4_dob=&amp;
F_Applicant5_firstname=&amp;
F_Applicant5_lastname=&amp;
FD_Applicant5_dob=&amp;
FM_Applicant5_dob=&amp;
FY_Applicant5_dob=&amp;
BB_Next=
</post>
</ajaxrequest>
```

We can repeat this process for the other pages until we get to the page that contains the table data, making note of the AJAX routines that are called and the data in the request payload.

The following code can be used to find the instance hash from the source of the main url and to get the data required for the AJAX routine in the request payload.

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

The full code, including the AJAX request data for each page, can be viewed from [https://github.com/mshodge/youshallnotpassport/blob/main/scripts/appointments_ft.py](https://github.com/mshodge/youshallnotpassport/blob/main/scripts/appointments_ft.py)