jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initPanorama);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYW5vcmFtYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHltYXBzLnJlYWR5KGluaXRQYW5vcmFtYSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFub3JhbWEoKSB7XHJcbiAgICAgICAgdmFyICRjbnQgPSAkKCcuanMtcGFub3JhbWEnKSxcclxuICAgICAgICAgICAgJHRvZ2dsZXIgPSAkKCcuanMtcGFub3JhbWFfX3RvZ2dsZXInKTtcclxuICAgICAgICBpZiAoJGNudC5sZW5ndGggPT0gMCB8fCAheW1hcHMucGFub3JhbWEuaXNTdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZ2VvID0gJGNudC5kYXRhKCdnZW8nKTtcclxuICAgICAgICBpZiAoZ2VvKSB7XHJcbiAgICAgICAgICAgIGdlbyA9IGdlby5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICBnZW9bMF0gPSBwYXJzZUZsb2F0KGdlb1swXSk7XHJcbiAgICAgICAgICAgIGdlb1sxXSA9IHBhcnNlRmxvYXQoZ2VvWzFdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgICR0b2dnbGVyLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmhhc0NsYXNzKCdfYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudGV4dCgn0KHQvNC+0YLRgNC10YLRjCDQv9Cw0L3QvtGA0LDQvNGDJyk7XHJcbiAgICAgICAgICAgICAgICAkY250LnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoJ9Ch0LzQvtGC0YDQtdGC0Ywg0YTQvtGC0L7Qs9GA0LDRhNC40LgnKTtcclxuICAgICAgICAgICAgICAgICRjbnQuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB5bWFwcy5wYW5vcmFtYS5sb2NhdGUoZ2VvKS5kb25lKFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAocGFub3JhbWFzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFub3JhbWFzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlci5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgeW1hcHMucGFub3JhbWEuUGxheWVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Bhbm9yYW1hJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhbm9yYW1hc1swXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sczogWyd6b29tQ29udHJvbCcsJ2Z1bGxzY3JlZW5Db250cm9sJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9va0F0OiBnZW9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5ldmVudHMuYWRkKCdkZXN0cm95JywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNudC5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuLy8gICAgICAgIGlmICgkdG9nZ2xlci5oYXNDbGFzcygnX2FjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJGNudC5oYXNDbGFzcygnX2FjdGl2ZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXIuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJwYW5vcmFtYS5qcyJ9
