/*
    +--------------------------------------+
    |  NPCalendar by neprog@gmail.com      |
    |  (Simple date picker with calendar)  |
    +--------------------------------------+

    Feel free to modify, improve and share this script, there's no any licence.
    I'll be glad if You provide me link to modified, improved script.
    It will work in IE9 and greater, not supported IE8 and earlier versions.


    For date piker can be used div, span, p, ... input elements can't be used.
    Navigation :
        month name - click and get list of months
        prev, next - year selector
        year       - if selected year clicked, it will jump to year of current date, not selected one.

    By paramaters you can change day and month names, can be addapted to you language

    File must be loaded in the Head of html document, initializing calendar after desired dom element or on very end of body tag.
    By this calendar, 1st day of week is monday.
    Usage :
        npInitCal(containerDomElement [,parameters]);

    Paramaters :
        delimiter : int     0: . (period), 1: - (hyphen), 2: / (slash)
        format : int        0: ddmmyyyy, 1: yyyymmdd, 2: yyyyddmm, 3: mmddyyyy
        days : []           array of string, name list of days in week, must be 7 (notice: script will take only first 3 letters if there's provided longer words)
        months: []          array of string, list of month names, must be 12

    Methods :
        setDate(newDate)    - set new date to calendar, must be string variable and in setted format and delimiter format
        getDate()           - will return selected date in string variable, in setted format and delimiter
        setYMD(y,m,d)       - set new date to calendar where: y-year, m-month (must be between 1 and 12, it's not zero based), d-day in month
                              if provided day is greater then max days in selected month, script will set for day last day of month
        getYMD()            - will return object of selected date 
                              (element.getYMD().day, element.getYMD().month - not zero based, element.getYMD().year)

        If DOM element isn't calendar made by this script, setDate(newDate) will do nothing and getDate() will return null value

    Example :
        <head>
            <link rel="stylesheet" href="npcal.css" />
            <script type="text/javascript" src="npcal.js"></script>
        </head>
        <body>
            <div id="myCal"></div>  
            <!-- date picker calendar with default settings (english day and month names, delimite is . (period), format id ddmmyyyy -->
            
            <div id="newCal" np-value="2019-05-26"></div>
            <!-- date picker with set date. Paramaters are set to default day and month names but delimitier : 1 (- hyphen) and format : 1 (yyyymmdd) 
                 Note: If defined date format and delimiter in paramaters and in np-value are differenet, both will be used by default and
                       defined date will be ignored, will be set current date
            -->
            <input type="button" value="Set new date for myCal" onclick="setnd();" />
            <input type="button" value="Get date value from myCal" onclick="getdt(); />

            <script type="text/javascript">
                npInitCal('myCal');
                npInitCal('newCal', {
                    delimiter: 1,
                    format: 1,
                    days: ['pon','uto','sre','cet','pet','sub','ned']  //day names in serbian language
                });
                function setnd() {
                    var mc = document.getElementById('myCal');
                    mc.setDate('01.01.2019');
                }
                function getnd() {
                    alert(document.getElementById('myCal').getDate());
                }
            </script>
        </body>
*/

//ele-div container (use empty div/span/p). input field(s) can't be used for calendar
function npInitCal(ele, param) {
    var cnt = (typeof ele === 'object' ? ele : document.getElementById(ele));
    cnt.className = 'npContainer';
    var cs = window.getComputedStyle(cnt);
    if (cs.getPropertyValue('position') == 'static') { cnt.style.position = 'relative'; }
    //create date picker
    var pk = document.createElement('div');
    pk.className = 'npPicker'; pk.setAttribute('onclick', 'npShowCal(this);');
    cnt.appendChild(pk);
    //setting parameters
    if (param == undefined) {
        param = {};
        param.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        param.months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'Oktober', 'November', 'December'];
        param.delimiter = 0;
        param.format = 0;
    } else {
        if (param.days == undefined || param.days == null || param.days.length != 7) {
            param.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        } else {
            var dd = param.days;
            for (var i = 0; i < dd.length; i++) {
                if (dd[i].length > 3) { param.days[i] = dd[i].toString().substr(0, 3);}
            }
        }
        if (param.delimiter == undefined || param.delimiter == null || param.delimiter < 0 || param.delimiter > 2) { param.delimiter = 0; }
        if (param.format == undefined || param.format == null || param.format < 0 || param.format > 3) { param.format = 0; }
        if (param.months == undefined || param.months == null || param.months.length != 12) {
            param.months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'Oktober', 'November', 'December'];
        }
    }
    //parameters will be stored under each calendar container
    cnt.setAttribute('np-param', JSON.stringify(param));
    var vl = cnt.getAttribute('np-value'); //selected date is stored into attribute called np-value
    if (vl == null || vl == '') {
        vl = npRetDateString(cnt); //show current date
    } else {
        vl = npRetVerDate(cnt, vl); //show manually added date (eg. <div id="myCal" np-value="2019-01-26"></div>
    }
    cnt.setAttribute('np-value', vl);
    pk.innerHTML = vl;
    npGenCal(cnt);
}

//generate calendar
function npGenCal(cnt) {
    var param = JSON.parse(cnt.getAttribute('np-param'));
    var dym = npGetDMY(cnt);
    var div = document.createElement('div');
    div.className = 'npCalendar';
    //header: month ddl, year, year selectors
    var hdr = document.createElement('div');
    hdr.className = 'npCalHeader npInbox';
    var tbl = document.createElement('table');
    tbl.setAttribute('cellpadding', '0'); tbl.setAttribute('cellspacing', '0'); tbl.className = 'npInbox';
    var row = tbl.insertRow();
    var cell = row.insertCell();
    cell.innerHTML = param.months[dym.m]; cell.setAttribute('np-month', dym.m); cell.setAttribute('onclick', 'npShowMonth(this);'); //month selector
    cell = row.insertCell(); cell.innerHTML = '&#9664;'; cell.setAttribute('onclick', 'npChYear(this,0);'); //prev year selector
    cell = row.insertCell(); cell.innerHTML = dym.y; cell.setAttribute('np-year', dym.y); cell.setAttribute('onclick', 'npChYear(this,2);'); //show selected year
    cell = row.insertCell(); cell.innerHTML = '&#9654;'; cell.setAttribute('onclick', 'npChYear(this,1);'); //next year selector
    hdr.appendChild(tbl);
    div.appendChild(hdr);
    //day names  - header
    hdr = document.createElement('div');
    hdr.className = 'npCalDaysHdr npInbox';
    tbl = document.createElement('table');
    tbl.setAttribute('cellpadding', '0'); tbl.setAttribute('cellspacing', '0'); tbl.className = 'npInbox'; tbl.setAttribute('style', 'height:100%;');
    var row = tbl.insertRow();
    for (var i = 0; i < param.days.length; i++) {
        cell = row.insertCell(); cell.innerHTML = param.days[i];
    }
    hdr.appendChild(tbl);
    div.appendChild(hdr);
    //create table with days in month
    var cl = document.createElement('div');
    cl.className = 'npCalDaysCnt npInbox';
    cl.setAttribute('np-day', dym.d);
    var ct = document.createElement('table'); ct.setAttribute('cellspacing', '2'); ct.className = 'npInbox';
    for (var i = 0; i < 6; i++) {
        var row = ct.insertRow();
        for (var x = 0; x < 7; x++) {
            var cell = row.insertCell();
            cell.setAttribute('onclick', 'npSelDate(this);');
            if (x == 5) { cell.className = 'npCalDay6'; } else if (x == 6) { cell.className = 'npCalDay7'; } else { cell.className = 'npCalDay'; }
        }
    }
    cl.appendChild(ct);
    div.appendChild(cl);
    var mn = document.createElement('div'); mn.className = 'npMonth';
    for (var i = 0; i < param.months.length; i++) {
        var mm = document.createElement('div');
        mm.innerHTML = param.months[i]; mm.className = 'npMonthBtn'; mm.setAttribute('np-monthValue', i);
        mm.setAttribute('onclick', 'npSelMonth(this);');
        mn.appendChild(mm);
    }
    div.appendChild(mn);
    cnt.appendChild(div);
    npShowMD(cnt);
}

Element.prototype.setDate = function (newDate) {
    if (this.getAttribute('np-value') != undefined) {
        var nd = npRetVerDate(this, newDate);
        this.setAttribute('np-value', nd);
        this.querySelector('.npPicker').innerHTML = nd;
        npSetCalendarClosed(this);
    }
}
//Month value must be between 1 and 12; If day is greater then max days in month it will set last day of month
Element.prototype.setYMD = function (year, month, day) {
    if (this.getAttribute('np-value') != undefined && month >= 1 && month <= 12) {
        var maxDays = new Date(year, month, 0).getDate();
        if (day > maxDays) { day = maxDays; }
        var nd = new Date(year, month - 1, day);
        var newD = npRetDateString(this, day, month, year);
        this.setAttribute('np-value', newD);
        this.querySelector('.npPicker').innerHTML = newD;
        npSetCalendarClosed(this);
    }
}
Element.prototype.getDate = function () {
    return this.getAttribute('np-value');
}
Element.prototype.getYMD = function () {
    if (this.getAttribute('np-value') != undefined) {
        var res = {};
        var rr = npGetDMY(this);
        res.day = rr.d; res.month = rr.m + 1; res.year = rr.y;
        return res;
    }
}
//select day and store selected date into np-value
function npSelDate(cell) {
    var cnt = cell.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    var y = parseInt(cnt.querySelector('[np-year]').getAttribute('np-year'));
    var m = parseInt(cnt.querySelector('[np-month]').getAttribute('np-month'));
    var d = parseInt(cell.innerHTML);
    cnt.querySelector('[np-day]').setAttribute('np-day', d);
    var nd = npRetDateString(cnt, d, m + 1, y);
    cnt.querySelector('.npPicker').innerHTML = nd;
    cnt.setAttribute('np-value', nd);
    cnt.querySelector('.npCalendar').style.display = 'none';
}
//year selector (prev/next)
function npChYear(cell, tip) {
    if (tip == undefined || tip < 0 || tip > 2) { tip = 2; }
    var cnt = cell.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    var cy = cell.parentNode.cells[2];
    var y = parseInt(cy.getAttribute('np-year'));
    switch (tip) {
        case 0:
            y -= 1; break;
        case 1:
            y += 1; break;
        case 2:
            var dt = new Date(); y = dt.getFullYear(); break;
    }
    cy.innerHTML = y; cy.setAttribute('np-year', y);
    npShowMD(cnt);
}
//show month dropdown selector
function npShowMonth(cell) {
    var cnt = cell.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    var ms = cnt.querySelector('[np-month]').getAttribute('np-month');
    var mm = cnt.getElementsByTagName('div')[5];
    if (mm.style.display == '' || mm.style.display == 'none') {
        mm.style.display = 'block';
        var dd = mm.getElementsByTagName('div');
        for (var i = 0; i < dd.length - 1; i++) {
            if (dd[i].getAttribute('np-monthValue') == ms) {
                dd[i].style.fontWeight = 'bold';
            } else {
                dd[i].style.fontWeight = 'normal';
            }
        }
    } else {
        mm.style.display = 'none';
    }
}
//selecting desired month
function npSelMonth(div) {
    var cnt = div.parentNode.parentNode.parentNode;
    var mn = cnt.querySelector('[np-month]');
    mn.innerHTML = div.innerHTML; mn.setAttribute('np-month', div.getAttribute('np-monthValue'));
    div.parentNode.style.display = 'none';
    npShowMD(cnt);
}
//regenerating days in month after every month and year change
function npShowMD(cnt) {
    var dmy = npGetDMY(cnt);
    var cd = new Date();
    var m = parseInt(cnt.querySelector('[np-month]').getAttribute('np-month'));
    var y = parseInt(cnt.querySelector('[np-year]').getAttribute('np-year'));
    var maxDays = new Date(y, m + 1, 0).getDate();
    var sd = new Date(y, m, 1).getDay(); //1st day in week (0-nedelja, 1-ponedeljak, ...)
    if (sd == 0) { sd = 7; }
    var td = cnt.querySelector('[np-day]').getElementsByTagName('td');
    var cc = 1;
    for (var i = 0; i < td.length; i++) {
        if (i >= sd - 1 && i <= sd + maxDays - 2) {
            td[i].style.visibility = 'visible';
            if (cc < 10) { td[i].innerHTML = '0' + cc; } else { td[i].innerHTML = cc; }
            if (i % 7 == 5) { td[i].className = 'npCalDay6'; } else if (i % 7 == 6) { td[i].className = 'npCalDay7' } else { td[i].className = 'npCalDay'; }
            if (m == dmy.m && y == dmy.y && cc == dmy.d) {
                td[i].className = 'npSelDay';
            } else if (m == cd.getMonth() && y == cd.getFullYear() && cc == cd.getDate()) {
                td[i].className = 'npCurrDay';
            }
            cc += 1;
        } else {
            td[i].style.visibility = 'hidden';
        }
    }
}

function npGetDMY(cnt) {
    var res = {}, param = JSON.parse(cnt.getAttribute('np-param'));
    var dt = cnt.getAttribute('np-value');
    var del = ['.', '-', '/'];
    var qq = dt.toString().split(del[param.delimiter]);
    switch (param.format) {
        case 0:
            res.d = parseInt(qq[0]); res.m = parseInt(qq[1]) - 1; res.y = parseInt(qq[2]);
            break;
        case 1:
            res.d = parseInt(qq[2]); res.m = parseInt(qq[1]) - 1; res.y = parseInt(qq[0]);
            break;
        case 2:
            res.d = parseInt(qq[1]); res.m = parseInt(qq[2]) - 1; res.y = parseInt(qq[0]);
            break;
        case 3:
            res.d = parseInt(qq[1]); res.m = parseInt(qq[0]) - 1; res.y = parseInt(qq[2]);
            break;
    }
    return res;
}

//verify date format, date value and return in desired format (how is set in param/npPar)
//validating in combination with set format
function npRetVerDate(cnt, dt) {
    var rr, day, month, year, res, npPar = JSON.parse(cnt.getAttribute('np-param'));
    if (dt.indexOf('.') > -1) {
        //tacka
        rr = dt.toString().split('.');
    } else if (dt.indexOf('-') > -1) {
        rr = dt.toString().split('-');
    } else if (dt.indexOf('/') > -1) {
        rr = dt.toString().split('/');
    } else {
        //fail, incorrect delimiter char, return current date with (pre)defined params
        rr = null;
    }
    if (rr == null) {
        res = npRetDateString(cnt);
    } else {
        if (npPar.format == undefined || npPar.format == null) { npPar.format = 0; }
        switch (npPar.format) {
            case 0:
                day = parseInt(rr[0]); month = parseInt(rr[1]); year = parseInt(rr[2]); break;
            case 1:
                day = parseInt(rr[2]); month = parseInt(rr[1]); year = parseInt(rr[0]); break;
            case 2:
                day = parseInt(rr[1]); month = parseInt(rr[2]); year = parseInt(rr[0]); break;
            case 3:
                day = parseInt(rr[1]); month = parseInt(rr[0]); year = parseInt(rr[2]); break;
        }
        if (day < 1 || month < 1 || month > 12 || year < 0) {
            res = npRetDateString(cnt);
        } else {
            var maxDays = new Date(year, month - 1, 0).getDate();
            if (day > maxDays) { res = npRetDateString(cnt); } else { res = npRetDateString(cnt, day, month, year); }
        }
    }
    return res;
}

function npRetDateString(cnt, day, month, year) {
    var res = '', npPar = JSON.parse(cnt.getAttribute('np-param'));
    var del = ['.', '-', '/'];
    var dl = del[npPar.delimiter];
    if (day == undefined || month == undefined || year == undefined) {
        var dt = new Date();
        day = dt.getDate(); month = dt.getMonth() + 1; year = dt.getFullYear();
    }
    var d = (day < 10 ? '0' + day.toString() : day.toString()), m = (month < 10 ? '0' + month.toString() : month.toString());
    switch (npPar.format) {
        case 0: //ddmmyyyy
            res = d + dl + m + dl + year.toString(); break;
        case 1: //yyyymmdd
            res = year.toString() + dl + m + dl + d; break;
        case 2: //yyyyddmm
            res = year.toString() + dl + d + dl + m; break;
        case 3:
            res = m + dl + d + dl + year.toString(); break;
    }
    return res;
}
//show calendar
function npShowCal(cnt) {
    var pos = cnt.getBoundingClientRect();
    var cal = cnt.parentNode.getElementsByTagName('div')[1];
    if (cal.style.display == '' || cal.style.display == 'none') {
        cal.style.display = 'block';
        var tp = (pos.top + pos.height + 268 > window.innerHeight ? -270 : pos.height + 2);
        var tl = (pos.left + 254 > window.innerWidth ? cnt.offsetWidth - 254 : 0);
        cal.style.top = tp.toString() + 'px'; cal.style.left = tl.toString() + 'px';
        npShowMD(cnt.parentNode);
    } else {
        var cc = cnt.parentNode;
        npSetCalendarClosed(cc);
        cal.style.display = 'none';
        cnt.parentNode.getElementsByTagName('div')[5].style.display = 'none';
    }
}
function npSetCalendarClosed(cnt) {
    var dmy = npGetDMY(cnt);
    var param = JSON.parse(cnt.getAttribute('np-param'));
    cnt.querySelector('[np-day]').setAttribute('np-day', dmy.d);
    cnt.querySelector('[np-month]').setAttribute('np-month', dmy.m);
    cnt.querySelector('[np-month]').innerHTML = param.months[dmy.m];
    cnt.querySelector('[np-year]').setAttribute('np-year', dmy.y);
    cnt.querySelector('[np-year]').innerHTML = dmy.y;
}
