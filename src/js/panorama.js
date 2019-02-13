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