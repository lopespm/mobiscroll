(function ($) {

    var date = new Date(),
        defaults = {
            dateFormat: 'mm/dd/yy',
            dateOrder: 'mmddy',
            ampm: true,
            seconds: false,
            timeFormat: 'hh:ii A',
            startYear: date.getFullYear() - 100,
            endYear: date.getFullYear() + 1,
            monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            shortYearCutoff: '+10',
            monthText: 'Month',
            dayText: 'Day',
            yearText: 'Year',
            hourText: 'Hours',
            minuteText: 'Minutes',
            secText: 'Seconds',
            ampmText: '&nbsp;',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        },
        preset = function() {
            // Set year-month-day order
            var inst = this,
                s = $.extend({}, defaults, inst.settings),
                p = s.preset,
                m = Math.round(s.rows / 2),
                ty = s.dateOrder.search(/y/i),
                tm = s.dateOrder.search(/m/i),
                td = s.dateOrder.search(/d/i),
                yOrd = ty < tm ? (ty < td ? 0 : 1) : (ty < td ? 1 : 2),
                mOrd = tm < ty ? (tm < td ? 0 : 1) : (tm < td ? 1 : 2),
                dOrd = td < ty ? (td < tm ? 0 : 1) : (td < tm ? 1 : 2);

            return {
                /**
                 *
                 */
                wheels: function() {
                    var wheels = [];
                    if (p.match(/date/i)) {
                        var w = {};
                        for (var k = 0; k < 3; k++) {
                            if (k == yOrd) {
                                w[s.yearText] = {};
                                for (var i = s.startYear; i <= s.endYear; i++)
                                    w[s.yearText][i] = s.dateOrder.search(/yy/i) < 0 ? i.toString().substr(2, 2) : i.toString();
                            }
                            else if (k == mOrd) {
                                w[s.monthText] = {};
                                for (var i = 0; i < 12; i++)
                                    w[s.monthText][i] =
                                        (s.dateOrder.search(/MM/) < 0 ?
                                        (s.dateOrder.search(/M/) < 0 ?
                                        (s.dateOrder.search(/mm/) < 0 ? (i + 1) : (i < 9) ? ('0' + (i + 1)) : (i + 1)) : s.monthNamesShort[i]) : s.monthNames[i]);
                            }
                            else if (k == dOrd) {
                                w[s.dayText] = {};
                                for (var i = 1; i < 32; i++)
                                    w[s.dayText][i] = s.dateOrder.search(/dd/i) < 0 ? i : (i < 10) ? ('0' + i) : i;
                            }
                        }
                        wheels.push(w);
                    }
                    if (p.match(/time/i)) {
                        s.stepHour = (s.stepHour < 1) ? 1 : parseInt(s.stepHour);
                        s.stepMinute = (s.stepMinute < 1) ? 1 : parseInt(s.stepMinute);
                        s.stepSecond = (s.stepSecond < 1) ? 1 : parseInt(s.stepSecond);
                        var w = {};
                        w[s.hourText] = {};
                        for (var i = (s.ampm ? 1 : 0); i < (s.ampm ? 13 : 24); i += s.stepHour)
                            w[s.hourText][i] = (i < 10) ? ('0' + i) : i;
                        w[s.minuteText] = {};
                        for (var i = 0; i < 60; i += s.stepMinute)
                            w[s.minuteText][i] = (i < 10) ? ('0' + i) : i;
                        if (s.seconds) {
                            w[s.secText] = {};
                            for (var i = 0; i < 60; i += s.stepSecond)
                                w[s.secText][i] = (i < 10) ? ('0' + i) : i;
                        }
                        if (s.ampm) {
                            w[s.ampmText] = {};
                            w[s.ampmText]['AM'] = 'AM';
                            w[s.ampmText]['PM'] = 'PM';
                        }
                        wheels.push(w);
                    }
                    return wheels;
                },
                /**
                 *
                 */
                formatResult: function(d) {
                    var that = $.scroller;
                    if (p == 'date') {
                        return that.formatDate(s.dateFormat, new Date(d[yOrd], d[mOrd], d[dOrd]), s);
                    }
                    else if (p == 'datetime') {
                        var hour = (s.ampm) ? ((d[s.seconds ? 6 : 5] == 'PM' && (d[3] - 0) < 12) ? (d[3] - 0 + 12) : (d[s.seconds ? 6 : 5] == 'AM' && (d[3] == 12) ? 0 : d[3])) : d[3];
                        return that.formatDate(s.dateFormat + ' ' + s.timeFormat, new Date(d[yOrd], d[mOrd], d[dOrd], hour, d[4], s.seconds ? d[5] : null), s);
                    }
                    else if (p == 'time') {
                        var hour = (s.ampm) ? ((d[s.seconds ? 3 : 2] == 'PM' && (d[0] - 0) < 12) ? (d[0] - 0 + 12) : (d[s.seconds ? 3 : 2] == 'AM' && (d[0] == 12) ? 0 : d[0])) : d[0];
                        return that.formatDate(s.timeFormat, new Date(1970, 0, 1, hour, d[1], s.seconds ? d[2] : null), s);
                    }
                },
                /**
                 *
                 */
                parseValue: function(val) {
                    var that = $.scroller,
                        result = [];
                    if (p == 'date') {
                        try { var d = that.parseDate(s.dateFormat, val, s); } catch (e) { var d = new Date(); };
                        result[yOrd] = d.getFullYear();
                        result[mOrd] = d.getMonth();
                        result[dOrd] = d.getDate();
                    }
                    else if (p == 'time') {
                        try { var d = that.parseDate(s.timeFormat, val, s); } catch (e) { var d = new Date(); };
                        var hour = d.getHours();
                        result[0] = (s.ampm) ? (hour > 12 ? (hour - 12) : (hour == 0 ? 12 : hour)) : hour;
                        result[1] = d.getMinutes();
                        if (s.seconds) result[2] = d.getSeconds();
                        if (s.ampm) result[s.seconds ? 3 : 2] = hour > 11 ? 'PM' : 'AM';
                    }
                    else if (p == 'datetime') {
                        try { var d = that.parseDate(s.dateFormat + ' ' + s.timeFormat, val, s); } catch (e) { var d = new Date(); };
                        var hour = d.getHours();
                        result[yOrd] = d.getFullYear();
                        result[mOrd] = d.getMonth();
                        result[dOrd] = d.getDate();
                        result[3] = (s.ampm) ? (hour > 12 ? (hour - 12) : (hour == 0 ? 12 : hour)) : hour;
                        result[4] = d.getMinutes();
                        if (s.seconds) result[5] = d.getSeconds();
                        if (s.ampm) result[s.seconds ? 6 : 5] = hour > 11 ? 'PM' : 'AM';
                    }
                    return result;
                },
                /**
                 *
                 */
                validate: function(i, dw) {
                    if (p.match(/date/i) && ((i == yOrd) || (i == mOrd) || (i == -1))) {
                        var days = 32 - new Date(inst.temp[yOrd], inst.temp[mOrd], 32).getDate() - 1;
                        var day = $('ul:eq(' + dOrd + ')', dw);
                        $('li', day).show();
                        $('li:gt(' + days + ')', day).hide();
                        if (inst.temp[dOrd] > days) {
                            inst.scroll(day, m - days - 1);
                            inst.temp[dOrd] = $('li:eq(' + days + ')', day).data('val');
                        }
                    }
                },
                methods: {
                    /**
                    * Returns the currently selected date.
                    * @return {Date}
                    */
                    getDate: function() {
                        var inst = $(this).data('scroller');
                        if (inst) {
                            var d = inst.values,
                                s = inst.settings,
                                p = s.preset;
                            if (p == 'date')
                                return new Date(d[yOrd], d[mOrd], d[dOrd]);
                            if (p == 'time') {
                                var hour = (s.ampm) ? ((d[s.seconds ? 3 : 2] == 'PM' && (d[0] - 0) < 12) ? (d[0] - 0 + 12) : (d[s.seconds ? 3 : 2] == 'AM' && (d[0] == 12) ? 0 : d[0])) : d[0];
                                return new Date(1970, 0, 1, hour, d[1], s.seconds ? d[2] : null);
                            }
                            if (p == 'datetime') {
                                var hour = (s.ampm) ? ((d[s.seconds ? 6 : 5] == 'PM' && (d[3] - 0) < 12) ? (d[3] - 0 + 12) : (d[s.seconds ? 6 : 5] == 'AM' && (d[3] == 12) ? 0 : d[3])) : d[3];
                                return new Date(d[yOrd], d[mOrd], d[dOrd], hour, d[4], s.seconds ? d[5] : null);
                            }
                        }
                    },
                    /**
                    * Sets the selected date
                    * @param {Date} d - Date to select.
                    * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
                    */
                    setDate: function(d, fill) {
                        if (fill == undefined) fill = false;
                        return this.each(function () {
                            var inst = $(this).data('scroller');
                            if (inst) {
                                var s = inst.settings,
                                p = s.preset;
                                if (p.match(/date/i)) {
                                    inst.temp[yOrd] = d.getFullYear();
                                    inst.temp[mOrd] = d.getMonth();
                                    inst.temp[dOrd] = d.getDate();
                                }
                                if (p == 'time') {
                                    var hour = d.getHours();
                                    inst.temp[0] = (s.ampm) ? (hour > 12 ? (hour - 12) : (hour == 0 ? 12 : hour)) : hour;
                                    inst.temp[1] = d.getMinutes();
                                    if (s.seconds) inst.temp[2] = d.getSeconds();
                                    if (s.ampm) inst.temp[s.seconds ? 3 : 2] = hour > 11 ? 'PM' : 'AM';
                                }
                                if (p == 'datetime') {
                                    var hour = d.getHours();
                                    inst.temp[3] = (s.ampm) ? (hour > 12 ? (hour - 12) : (hour == 0 ? 12 : hour)) : hour;
                                    inst.temp[4] = d.getMinutes();
                                    if (s.seconds) inst.temp[5] = d.getSeconds();
                                    if (s.ampm) inst.temp[s.seconds ? 6 : 5] = hour > 11 ? 'PM' : 'AM';
                                }
                                inst.setValue(fill);
                            }
                        });
                    }
                }
            }
        };

    $.scroller.presets.date = preset;
    $.scroller.presets.datetime = preset;
    $.scroller.presets.time = preset;

    /**
    * Format a date into a string value with a specified format.
    * @param {String} format - Output format.
    * @param {Date} date - Date to format.
    * @param {Object} settings - Settings.
    * @return {String} - Returns the formatted date string.
    */
    $.scroller.formatDate = function (format, date, settings) {
        if (!date) return null;
        var s = $.extend({}, defaults, settings),
            // Check whether a format character is doubled
            look = function(m) {
                var n = 0;
                while (i + 1 < format.length && format.charAt(i + 1) == m) { n++; i++; };
                return n;
            },
            // Format a number, with leading zero if necessary
            f1 = function(m, val, len) {
                var n = '' + val;
                if (look(m))
                    while (n.length < len)
                        n = '0' + n;
                return n;
            },
            // Format a name, short or long as requested
            f2 = function(m, val, s, l) {
                return (look(m) ? l[val] : s[val]);
            },
            output = '',
            literal = false;
        for (var i = 0; i < format.length; i++) {
            if (literal)
                if (format.charAt(i) == "'" && !look("'"))
                    literal = false;
                else
                    output += format.charAt(i);
            else
                switch (format.charAt(i)) {
                    case 'd':
                        output += f1('d', date.getDate(), 2);
                        break;
                    case 'D':
                        output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
                        break;
                    case 'o':
                        output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
                        break;
                    case 'm':
                        output += f1('m', date.getMonth() + 1, 2);
                        break;
                    case 'M':
                        output += f2('M', date.getMonth(), s.monthNamesShort, s.monthNames);
                        break;
                    case 'y':
                        output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                        break;
                    case 'h':
                        var h = date.getHours();
                        output += f1('h', (h > 12 ? (h - 12) : (h == 0 ? 12 : h)), 2);
                        break;
                    case 'H':
                        output += f1('H', date.getHours(), 2);
                        break;
                    case 'i':
                        output += f1('i', date.getMinutes(), 2);
                        break;
                    case 's':
                        output += f1('s', date.getSeconds(), 2);
                        break;
                    case 'a':
                        output += date.getHours() > 11 ? 'pm' : 'am';
                        break;
                    case 'A':
                        output += date.getHours() > 11 ? 'PM' : 'AM';
                        break;
                    case "'":
                        if (look("'"))
                            output += "'";
                        else
                            literal = true;
                        break;
                    default:
                        output += format.charAt(i);
                }
        }
        return output;
    }

    /**
    * Extract a date from a string value with a specified format.
    * @param {String} format - Input format.
    * @param {String} value - String to parse.
    * @param {Object} settings - Settings.
    * @return {Date} - Returns the extracted date.
    */
    $.scroller.parseDate = function (format, value, settings) {
        var def = new Date();
        if (!format || !value) return def;
        value = (typeof value == 'object' ? value.toString() : value + '');
        var s = $.extend({}, defaults, settings),
            year = def.getFullYear(),
            month = def.getMonth() + 1,
            day = def.getDate(),
            doy = -1,
            hours = def.getHours(),
            minutes = def.getMinutes(),
            seconds = def.getSeconds(),
            ampm = -1,
            literal = false,
            // Check whether a format character is doubled
            lookAhead = function(match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches)
                    iFormat++;
                return matches;
            },
            // Extract a number from the string value
            getNumber = function(match) {
                lookAhead(match);
                var size = (match == '@' ? 14 : (match == '!' ? 20 :
                    (match == 'y' ? 4 : (match == 'o' ? 3 : 2))));
                var digits = new RegExp('^\\d{1,' + size + '}');
                var num = value.substr(iValue).match(digits);
                if (!num)
                    throw 'Missing number at position ' + iValue;
                iValue += num[0].length;
                return parseInt(num[0], 10);
            },
            // Extract a name from the string value and convert to an index
            getName = function(match, s, l) {
                var names = (lookAhead(match) ? l : s);
                for (var i = 0; i < names.length; i++) {
                    if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
                        iValue += names[i].length;
                        return i + 1;
                    }
                }
                throw 'Unknown name at position ' + iValue;
            },
            // Confirm that a literal character matches the string value
            checkLiteral = function() {
                if (value.charAt(iValue) != format.charAt(iFormat))
                    throw 'Unexpected literal at position ' + iValue;
                iValue++;
            },
            iValue = 0;

        for (var iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal)
                if (format.charAt(iFormat) == "'" && !lookAhead("'"))
                    literal = false;
                else
                    checkLiteral();
            else
                switch (format.charAt(iFormat)) {
                    case 'd':
                        day = getNumber('d');
                        break;
                    case 'D':
                        getName('D', s.dayNamesShort, s.dayNames);
                        break;
                    case 'o':
                        doy = getNumber('o');
                        break;
                    case 'm':
                        month = getNumber('m');
                        break;
                    case 'M':
                        month = getName('M', s.monthNamesShort, s.monthNames);
                        break;
                    case 'y':
                        year = getNumber('y');
                        break;
                    case 'H':
                        hours = getNumber('H');
                        break;
                    case 'h':
                        hours = getNumber('h');
                        break;
                    case 'i':
                        minutes = getNumber('i');
                        break;
                    case 's':
                        seconds = getNumber('s');
                        break;
                    case 'a':
                        ampm = getName('a', ['am', 'pm'], ['am', 'pm']) - 1;
                        break;
                    case 'A':
                        ampm = getName('A', ['am', 'pm'], ['am', 'pm']) - 1;
                        break;
                    case "'":
                        if (lookAhead("'"))
                            checkLiteral();
                        else
                            literal = true;
                        break;
                    default:
                        checkLiteral();
                }
        }
        if (year < 100)
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= s.shortYearCutoff ? 0 : -100);
        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                var dim = 32 - new Date(year, month - 1, 32).getDate();
                if (day <= dim)
                    break;
                month++;
                day -= dim;
            } while (true);
        }
        hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));
        //if (ampm && hours < 12) hours += 12;
        var date = new Date(year, month - 1, day, hours, minutes, seconds);
        if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day)
            throw 'Invalid date'; // E.g. 31/02/*
        return date;
    }

})(jQuery);
