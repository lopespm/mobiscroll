(function ($) {

    $.scroller.themes.jqm = {
        defaults: {
            jqmBodyTheme: 'c',
            jqmHeaderTheme:'b',
            jqmSetTheme: 'b',
            jqmCancelTheme: 'c'
        },
        init: function(elm, inst) {
            var s = inst.settings;
            $('.dw', elm).removeClass('dwbg').addClass('ui-overlay-shadow ui-corner-all ui-body-a');
            $('.dwb-s a', elm).attr('data-role', 'button').attr('data-theme', s.jqmSetTheme);
            $('.dwb-c a', elm).attr('data-role', 'button').attr('data-theme', s.jqmCancelTheme);
            $('.dwwb', elm).attr('data-role', 'button');
            $('.dwv', elm).addClass('ui-header ui-bar-' + s.jqmHeaderTheme);
            $('.dwwr', elm).addClass('ui-body-' + s.jqmBodyTheme);
            if (s.display != 'inline')
                $('.dw', elm).addClass('pop in');
            elm.trigger('create');
            // Hide on overlay click
            $('.dwo', elm).click(function() { inst.hide(); });
        }
    }

})(jQuery);
