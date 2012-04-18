/*!
 * jQuery MobiScroll v1.6
 * http://mobiscroll.com
 *
 * Copyright 2010-2011, Acid Media
 * Licensed under the MIT license.
 *
 */
(function ($) {

    function Scroller(elm, settings) {
        var that = this,
            theme = $.extend({ defaults: {}, init: function() { } }, $.scroller.themes[settings.theme]),
            s = $.extend({}, defaults, theme.defaults, settings),
            dw,
            iv = {},
            tv = {},
            e = elm,
            elm = $(e),
            input = elm.is('input'),
            visible = false;

        that.settings = s;
        that.values = null;
        that.val = null;
        // Temporary values
        that.temp = null;

        // Private functions

        function setGlobals(t) {
            l = $('li:visible', t).length;
            h = s.height;
            m = Math.round(s.rows / 2);
            inst = that;
        }

        function formatHeader() {
            return s.headerText ? s.headerText.replace(/{value}/i, that.formatResult()) : '';
        }

        function scrollToPos() {
            // Set scrollers to position
            $('.dww ul', dw).each(function(i) {
                var x = $('li', this).index($('li[data-val="' + that.temp[i] + '"]', this));
                while ((x < 0) && (--that.temp[i] >= 0)) {
                    x = $('li', this).index($('li[data-val="' + that.temp[i] + '"]', this));
                }
                that.scroll($(this), Math.round(s.rows / 2) - (x < 0 ? 0 : x) - 1);
            });
            // Initial validate
            that.validate(-1);
        }

        function plus(t) {
            if (plustap) {
                var p = t.data('pos'),
                    val = p - 1;
                val = val < (m - l) ? (m - 1) : val;
                calc(t, val);
            }
            else {
                clearInterval(plustap);
            }
        }

        function minus(t) {
            if (minustap) {
                var p = t.data('pos'),
                    val = p + 1;
                val = val > (m - 1) ? (m - l) : val;
                calc(t, val);
            }
            else {
                clearInterval(minustap);
            }
        }

        /**
        * Enables the scroller and the associated input.
        */
        that.enable = function() {
            s.disabled = false;
            if (input)
                elm.prop('disabled', false);
        }

        /**
        * Disables the scroller and the associated input.
        */
        that.disable = function() {
            s.disabled = true;
            if (input)
                elm.prop('disabled', true);
        }

        /**
        * Scrolls target to the specified position
        * @param {Object} t - Target wheel jQuery object.
        * @param {Number} val - Value.
        * @param {Number} [time] - Duration of the animation, optional.
        */
        that.scroll = function(t, val, time, orig, index) {
            var h = s.height;
            //t.data('pos', val)
            t.attr('style', (time ? (prefix + '-transition:all ' + time.toFixed(1) + 's ease-out;') : '') + (has3d ? (prefix + '-transform:translate3d(0,' + (val * h) + 'px,0);') : ('top:' + (val * h) + 'px;')));

            function getVal(t, b, c, d) {
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            }

            if (time) {
                var i = 0;
                clearInterval(iv[index]);
                iv[index] = setInterval(function() {
                    i += 0.1;
                    t.data('pos', Math.round(getVal(i, orig, val - orig, time)));
                    if (i >= time) {
                        clearInterval(iv[index]);
                        t.data('pos', val);
                    }
                }, 100);
                // Show +/- buttons
                clearTimeout(tv[index]);
                tv[index] = setTimeout(function() {
                    if (!t.hasClass('dwa'))
                        t.closest('.dwwl').find('.dwwb').fadeIn('fast');
                }, time * 1000);
            }
            else {
                t.data('pos', val)
            }
        }

        /**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Boolean} [fill] - Also set the value of the associated input element. Default is true.
        */
        that.setValue = function (fill) {
            if (fill == undefined) fill = true;
            var v = that.formatResult();
            that.val = v;
            that.values = that.temp.slice(0);
            if (visible) scrollToPos();
            if (fill && input) elm.val(v).change();
        }

        /**
        * Extracts the selected wheel values form the string value.
        * @param {String} val - String to parse.
        * @return {Array} Array with the selected wheel values.
        */
        that.parseValue = function (val) {
            return that.preset.parseValue(val, that);
        }

        /**
        * Formats the selected wheel values form the required format.
        * @return {String} Formatted string.
        */
        that.formatResult = function () {
            return that.preset.formatResult(that.temp);
        }

        /**
        * Checks if the current selected values are valid together.
        * In case of date presets it checks the number of days in a month.
        * @param {Integer} i - Currently changed wheel index, -1 if initial validation.
        */
        that.validate = function(i) {
            // If target is month, show/hide days
            that.preset.validate(i, dw)
        }

        /**
         *
         */
        that.change = function () {
            var v = that.formatResult();
            if (s.display == 'inline' && input)
                elm.val(v);
            else
                $('.dwv', dw).html(formatHeader());
            s.onChange.call(e, v, that);
        }

        /**
        * Hides the scroller instance.
        */
        that.hide = function () {
            // If onClose handler returns false, prevent hide
            if (s.onClose.call(e, that.val, that) === false) return false;
            // Re-enable temporary disabled fields
            $('.dwtd').prop('disabled', false).removeClass('dwtd');
            elm.blur();
            // Hide wheels and overlay
            if (dw)
                dw.remove();
            //if (that.preset)
            //s.wheels = null;
            visible = false;
            // Stop positioning on window resize
            $(window).off('resize.dw');
        }

        /**
        * Shows the scroller instance.
        */
        that.show = function () {
            if (s.disabled || visible) return false;

            s.beforeShow.call(e, e, that);

            var hi = s.height,
                thi = s.rows * hi;

            that.init();

            // Create preset wheels
            s.wheels = that.preset.wheels();

            // Create wheels containers
            var html = '<div class="' + s.theme + '">' + (s.display == 'inline' ? '<div class="dw dwi">' : '<div class="dwo"></div><div class="dw">' + (s.headerText ? '<div class="dwv">' + formatHeader() + '</div>' : ''));
            for (var i = 0; i < s.wheels.length; i++) {
                html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : '') + (s.showLabel ? '' : ' dwhl') + '"><div class="dwwc dwrc">';
                // Create wheels
                for (var label in s.wheels[i]) {
                    html += '<div class="dwwl dwrc" style="height:' + thi + 'px;">' + (s.mode != 'scroller' ? '<div class="dwwb dwwbp" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>+</span></div><div class="dwwb dwwbm" style="height:' + hi + 'px;line-height:' + hi + 'px;"><span>&ndash;</span></div>' : '') + '<div class="dwl">' + label + '</div><div class="dww dwrc" style="height:' + thi + 'px;"><ul>';
                    // Create wheel values
                    for (var j in s.wheels[i][label]) {
                        html += '<li data-val="' + j + '" style="line-height:' + hi + 'px;">' + s.wheels[i][label][j] + '</li>';
                    }
                    html += '</ul><div class="dwwo"></div></div><div class="dwwol"></div></div>';
                }
                html += '<div class="dwcc"></div></div></div>';
            }
            html += (s.display != 'inline' ? '<div class="dwbc"><span class="dwbw dwb-s"><a href="#" class="dwb">' + s.setText + '</a></span><span class="dwbw dwb-c"><a href="#" class="dwb">' + s.cancelText + '</a></span></div>' : '<div class="dwcc"></div>') + '</div></div>';

            dw = $(html);

            scrollToPos();

            // Show
            s.display != 'inline' ? dw.appendTo('body') : input ? dw.insertAfter(elm) : elm.html(dw);
            visible = true;

            // Theme init
            theme.init(dw);

            // Set sizes
            $('.dww', dw).each(function() { $(this).width($(this).parent().width() < s.width ? s.width : $(this).parent().width()); });
            $('.dwwc', dw).each(function() {
                var w = 0;
                $('.dwwl', this).each(function() { w += $(this).outerWidth(true); });
                $(this).width(w);
            });
            $('.dwc', dw).each(function() {
                $(this).width($('.dwwc', this).outerWidth(true));
            });

            if (s.display != 'inline') {
                // Init buttons
                $('.dwb-s a', dw).click(function (e) {
                    that.setValue();
                    s.onSelect.call(e, that.val, that);
                    that.hide();
                    return false;
                });

                $('.dwb-c a', dw).click(function (e) {
                    s.onCancel.call(e, that.val, that);
                    that.hide();
                    return false;
                });

                // Disable inputs to prevent bleed through (Android bug)
                $(':input:not(:disabled)').addClass('dwtd');
                $(':input').prop('disabled', true);

                // Set position
                that.pos();
                $(window).on('resize.dw', function() { that.pos(); });
            }

            // Events
            dw.delegate('.dwwl', 'DOMMouseScroll mousewheel', function (e) {
                e.preventDefault();
                e = e.originalEvent;
                var delta = e.wheelDelta ? (e.wheelDelta / 120) : (e.detail ? (-e.detail / 3) : 0),
                    t = $('ul', this),
                    p = t.data('pos'),
                    val = Math.round(p + delta);
                setGlobals(t);
                calc(t, val);
            }).delegate('.dwb, .dwwb', START_EVENT, function (e) {
                // Active button
                $(this).addClass('dwb-a');
            }).delegate('.dwwbp', START_EVENT, function (e) {
                // + Button
                e.preventDefault();
                e.stopPropagation();
                var t = $(this).closest('.dwwl').find('ul');
                setGlobals(t);
                clearInterval(plustap);
                plustap = setInterval(function() { plus(t); }, s.delay);
                plus(t);
            }).delegate('.dwwbm', START_EVENT, function (e) {
                // - Button
                e.preventDefault();
                e.stopPropagation();
                var t = $(this).closest('.dwwl').find('ul');
                setGlobals(t);
                clearInterval(minustap);
                minustap = setInterval(function() { minus(t); }, s.delay);
                minus(t);
            }).delegate('.dwwl', START_EVENT, function (e) {
                // Scroll start
                if (!move && that.settings.mode != 'clickpick') {
                    e.preventDefault();
                    move = true;
                    target = $('ul', this).addClass('dwa');
                    $('.dwwb', this).fadeOut('fast');
                    pos = target.data('pos');
                    setGlobals(target);
                    start = getY(e);
                    startTime = new Date();
                    stop = start;
                    that.scroll(target, pos);
                }
            });
        }

        /**
        * Positions the scroller instance to the center of the viewport.
        */
        that.pos = function() {
            var totalw = 0,
                minw = 0,
                ww = $(window).width(),
                wh = $(window).height(),
                st = $(window).scrollTop(),
                o = $('.dwo', dw),
                d = $('.dw', dw),
                w,
                h;
            $('.dwc', dw).each(function() {
                w = $(this).outerWidth(true);
                totalw += w;
                minw = (w > minw) ? w : minw;
            });
            w = totalw > ww ? minw : totalw;
            d.width(w);
            w = d.outerWidth();
            h = d.outerHeight();
            d.css({ left: (ww - w) / 2, top: st + (wh - h) / 2 });
            o.height(0).height($(document).height());
        }

        /**
        * Scroller initialization.
        */
        that.init = function() {
            that.temp = ((input && that.val !== null && that.val != elm.val()) || that.values === null) ? that.parseValue(elm.val() ? elm.val() : '') : that.values.slice(0);
            that.setValue(false);
        }

        // Constructor

        that.preset = {
            wheels: function() { return s.wheels; },
            formatResult: s.formatResult,
            parseValue: s.parseValue,
            validate: s.validate,
            methods: {}
        }

        if (!s.wheels) {
            // Load preset
            $.extend(that.preset, $.scroller.presets[s.preset].call(this));
            $.extend(methods, that.preset.methods);
        }

        if (s.display == 'inline') {
            that.show();
        }
        else {
            that.init();
            // Set element readonly, save original state
            if (input && s.showOnFocus)
                elm.data('dwro', elm.prop('readonly')).prop('readonly', true);

            // Init show datewheel
            elm.addClass('scroller').off('focus.dw').on('focus.dw', function (e) {
                if (s.showOnFocus)
                    that.show();
            });
        }
    }

    function testProps(props) {
        for (var i in props) {
            if (mod[props[i]] !== undefined ) {
                return true;
            }
        }
        return false;
    }

    function testPrefix() {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms'];
        for (var p in prefixes) {
            if (testProps([prefixes[p] + 'Transform']))
                return '-' + prefixes[p].toLowerCase();
        }
        return '';
    }

    function getInst(e) {
        return $(e).data('scroller');
    }

    function getY(e) {
        return touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
    }

    function calc(t, val, anim, orig) {
        var dw = t.closest('.dw'),
            i = $('ul', dw).index(t);
        val = val > (m - 1) ? (m - 1) : val;
        val = val < (m - l) ? (m - l) : val;
        // Call scroll with animation (calc animation time)
        inst.scroll(t, val, anim ? (val == orig ? 0.1 : Math.abs((val - orig) * 0.1)) : 0, orig, i);
        // Set selected scroller value
        inst.temp[i] = $('li:eq(' + (m - 1 - val) + ')', t).data('val');
        // Validate
        inst.validate(i);
        // Set value text
        inst.change();
    }

    var plustap = false,
        minustap = false,
        h,
        m,
        l,
        inst, // Current instance
        date = new Date(),
        uuid = date.getTime(),
        move = false,
        target = null,
        start,
        stop,
        startTime,
        endTime,
        pos,
        mod = document.createElement(mod).style,
        has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']) && 'webkitPerspective' in document.documentElement.style,
        prefix = testPrefix(),
        touch = ('ontouchstart' in window),
        START_EVENT = touch ? 'touchstart' : 'mousedown',
        MOVE_EVENT = touch ? 'touchmove' : 'mousemove',
        END_EVENT = touch ? 'touchend' : 'mouseup',
        defaults = {
            // Options
            width: 80,
            height: 40,
            rows: 3,
            delay: 300,
            disabled: false,
            showOnFocus: true,
            showLabel: true,
            wheels: null,
            theme: '',
            headerText: '{value}',
            display: 'modal',
            mode: 'scroller',
            preset: 'date',
            setText: 'Set',
            cancelText: 'Cancel',
            // Events
            beforeShow: function() {},
            onClose: function() {},
            onSelect: function() {},
            onCancel: function() {},
            onChange: function() {},
            formatResult: function(d) {
                var out = '';
                for (var i = 0; i < d.length; i++) {
                    out += (i > 0 ? ' ' : '') + d[i];
                }
                return out;
            },
            parseValue: function(val, inst) {
                var w = inst.settings.wheels,
                    val = val.split(' '),
                    ret = [],
                    j = 0;
                for (var i = 0; i < w.length; i++) {
                    for (var l in w[i]) {
                        if (w[i][l][val[j]] !== undefined)
                            ret.push(val[j])
                        else
                            // Select first value from wheel
                            for (var v in w[i][l]) {
                                ret.push(v);
                                break;
                            }
                        j++;
                    }
                }
                return ret;
            },
            validate: function() {
                return true;
            }
        },

        methods = {
            init: function (options) {
                if (options === undefined) options = {};
                return this.each(function () {
                    if (!this.id) {
                        uuid += 1;
                        this.id = 'scoller' + uuid;
                    }
                    $(this).data('scroller', new Scroller(this, options));
                });
            },
            enable: function() {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) inst.enable();
                });
            },
            disable: function() {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) inst.disable();
                });
            },
            isDisabled: function() {
                var inst = getInst(this);
                if (inst)
                    return inst.settings.disabled;
            },
            option: function(option, value) {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        if (typeof option === 'object')
                            $.extend(inst.settings, option);
                        else
                            inst.settings[option] = value;
                        //inst.init();
                    }
                });
            },
            setValue: function(d, input) {
                if (input == undefined) input = false;
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.temp = d;
                        inst.setValue(d, input);
                    }
                });
            },
            getValue: function() {
                var inst = getInst(this);
                if (inst)
                    return inst.values;
            },
            show: function() {
                var inst = getInst(this);
                if (inst)
                    return inst.show();
            },
            hide: function() {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst)
                        inst.hide();
                });
            },
            destroy: function() {
                return this.each(function () {
                    var inst = getInst(this);
                    if (inst) {
                        inst.hide();
                        $(this).off('.dw').removeClass('scroller').removeData('scroller');
                        if ($(this).is(':input'))
                            $(this).prop('readonly', $(this).data('dwro'));
                    }
                });
            }
        };

    $(document).on(MOVE_EVENT, function (e) {
        if (move) {
            e.preventDefault();
            stop = getY(e);
            var val = pos + (stop - start) / h;
            val = val > (m - 1 + 1) ? (m - 1 + 1) : val;
            val = val < (m - l - 1) ? (m - l - 1) : val;
            inst.scroll(target, val);
        }
    });

    $(document).on(END_EVENT, function (e) {
        if (move) {
            e.preventDefault();
            target.removeClass('dwa');
            var time = new Date() - startTime,
                val = pos + (stop - start) / h;
            val = val > (m - 1 + 1) ? (m - 1 + 1) : val;
            val = val < (m - l - 1) ? (m - l - 1) : val;

            if (time < 300) {
                var speed = (stop - start) / time;
                var dist = (speed * speed) / (2 * 0.0006);
                if (stop - start < 0) dist = -dist;
            }
            else {
                var dist = stop - start;
            }
            //var dist = stop - start;
            calc(target, Math.round(pos + dist / h), true, Math.round(val));
            move = false;
            target = null;
        }
        clearInterval(plustap);
        clearInterval(minustap);
        plustap = false;
        minustap = false;
        $('.dwb-a').removeClass('dwb-a');
    });

    $.fn.scroller = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Unknown method');
        }
    }

    $.scroller = {
        /**
        * Set settings for all instances.
        * @param {Object} o - New default settings.
        */
        setDefaults: function(o) {
            $.extend(defaults, o);
        },
        presets: {},
        themes: {}
    }; //new Scroller(null, defaults);

})(jQuery);
