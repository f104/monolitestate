jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initPanorama());
    });

    function initPanorama() {
        var $cnt = $('.js-panorama'),
            $toggler = $('.js-panorama__toggler');
        if ($cnt.length == 0 || !ymaps.panorama.isSupported()) {
            return;
        }

        var geo = $cnt.data('geo');
        if (geo) {
            geo = geo.split(',');
            geo[0] = parseFloat(geo[0]);
            geo[1] = parseFloat(geo[1]);
        } else {
            return;
        }
        
        $toggler.on('click', function(){
            if ($cnt.hasClass('_active')) {
                $(this).text('Смотреть панораму');
                $cnt.removeClass('_active');
            } else {
                $(this).text('Смотреть фотографии');
                $cnt.addClass('_active');
            }
        });

        ymaps.panorama.locate(geo).done(
            function (panoramas) {
                if (panoramas.length > 0) {
                    $toggler.addClass('_active');
                    var player = new ymaps.panorama.Player(
                            'panorama',
                            panoramas[0],
                            {
                                controls: ['zoomControl','fullscreenControl'],
                                lookAt: geo
                            }
                    );
                    player.events.add('destroy', function(){
                        $cnt.removeClass('_active');
                    });
                }
            },
            function (error) {
                console.log(error.message);
            }
        );
        
//        if ($toggler.hasClass('_active')) {
            $('.js-gallery-nav').on('beforeChange', function () {
                if ($cnt.hasClass('_active')) {
                    $toggler.click();
                }
            });
//        }

    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYW5vcmFtYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRQYW5vcmFtYSgpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYW5vcmFtYSgpIHtcclxuICAgICAgICB2YXIgJGNudCA9ICQoJy5qcy1wYW5vcmFtYScpLFxyXG4gICAgICAgICAgICAkdG9nZ2xlciA9ICQoJy5qcy1wYW5vcmFtYV9fdG9nZ2xlcicpO1xyXG4gICAgICAgIGlmICgkY250Lmxlbmd0aCA9PSAwIHx8ICF5bWFwcy5wYW5vcmFtYS5pc1N1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBnZW8gPSAkY250LmRhdGEoJ2dlbycpO1xyXG4gICAgICAgIGlmIChnZW8pIHtcclxuICAgICAgICAgICAgZ2VvID0gZ2VvLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGdlb1swXSA9IHBhcnNlRmxvYXQoZ2VvWzBdKTtcclxuICAgICAgICAgICAgZ2VvWzFdID0gcGFyc2VGbG9hdChnZW9bMV0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHRvZ2dsZXIub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKCRjbnQuaGFzQ2xhc3MoJ19hY3RpdmUnKSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KCfQodC80L7RgtGA0LXRgtGMINC/0LDQvdC+0YDQsNC80YMnKTtcclxuICAgICAgICAgICAgICAgICRjbnQucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudGV4dCgn0KHQvNC+0YLRgNC10YLRjCDRhNC+0YLQvtCz0YDQsNGE0LjQuCcpO1xyXG4gICAgICAgICAgICAgICAgJGNudC5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHltYXBzLnBhbm9yYW1hLmxvY2F0ZShnZW8pLmRvbmUoXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChwYW5vcmFtYXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYW5vcmFtYXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0b2dnbGVyLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllciA9IG5ldyB5bWFwcy5wYW5vcmFtYS5QbGF5ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGFub3JhbWEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFub3JhbWFzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiBbJ3pvb21Db250cm9sJywnZnVsbHNjcmVlbkNvbnRyb2wnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29rQXQ6IGdlb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmV2ZW50cy5hZGQoJ2Rlc3Ryb3knLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY250LnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIFxyXG4vLyAgICAgICAgaWYgKCR0b2dnbGVyLmhhc0NsYXNzKCdfYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWdhbGxlcnktbmF2Jykub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkY250Lmhhc0NsYXNzKCdfYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlci5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6InBhbm9yYW1hLmpzIn0=
