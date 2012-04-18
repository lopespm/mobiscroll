(function ($) {

    $.scroller.themes.jqm = {
        init: function(elm) {
            $('a', elm).removeClass('dwb').attr('data-role', 'button');
            elm.trigger('create');
        }
    }

})(jQuery);
