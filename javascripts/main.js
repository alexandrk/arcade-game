$(function() {

    /* add black background to navigation bar on scroll */
    $(window).on('scroll', function(){

        if ($('#navbar-collapse-1').offset().top > 50) {
            $('.navbar-inverse').addClass('top-nav-collapse');
        } else {
            $('.navbar-inverse').removeClass('top-nav-collapse');
        }

    })

    /* jQuery for page scrolling feature - requires jQuery Easing plugin */
    $(function() {
        $('a.page-scroll').bind('click', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });

    $('.hidden-warning').on('click', 'a', function(e){
        e.preventDefault();
        $('#game').toggle();
    })

});