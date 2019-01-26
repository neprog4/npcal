# npcal
Simple pure javascript date picker with calendar

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
        



