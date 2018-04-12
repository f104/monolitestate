jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSlider();
        ymaps.ready(initMap);
    });

    function initSlider() {
        var $slider = $('.js-contacts-slider');
        var $scroller = $('.js-contacts-scroller');
        $slider.slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md - 1,
                    settings: {
                        dots: false
                    }
                }
            ]
        });
        var offset = [];
        var padding = parseInt($scroller.css('padding-left')) + $scroller.offset().left;
        $scroller.find('.js-contacts-scroller__link').each(function (i) {
            offset.push($(this).offset().left - padding);
            $(this).on('click', function (e) {
                e.preventDefault();
                $slider.slick('slickGoTo', i);
            });
        });
        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            $scroller.find('._active').removeClass('_active');
            var $a = $($scroller.find('.js-contacts-scroller__link')[nextSlide]);
            $a.addClass('_active');
            $scroller.animate({scrollLeft: offset[nextSlide]}, 500);
        });
    }

    function initMap() {
        var map, placemarks = [], $slider = $('.js-contacts-slider');

        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            openBalloon(nextSlide);
        });

        map = new ymaps.Map("map", {
            center: [56.326887, 44.005986],
            zoom: 13,
            controls: []
        });
        map.behaviors.disable('scrollZoom');
        
        $('.js-map__zoom').on('click', function(){
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        })

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                );

        $('.js-contacts-scroller__link').each(function () {
            var geo = $(this).data('geo');
            if (geo) {
                geo = geo.split(',');
                geo[0] = parseFloat(geo[0]);
                geo[1] = parseFloat(geo[1]);
                placemarks.push(geo)
            }
        });
        for (var i = 0, len = placemarks.length; i < len; i++) {
            var placemark = new ymaps.Placemark(placemarks[i],
                    {
                        className: '_dot',
                        slide: i,
                    },
                    {
                        iconLayout: tpl,
                        iconShape: {
                            type: 'Rectangle',
                            coordinates: [
                                [-15.5, -42], [15.5, 0]
                            ]
                        }
                    });
            map.geoObjects.add(placemark);
            placemark.events.add('click', function (e) {
                var index = e.get('target').properties.get('slide');
                $slider.slick('slickGoTo', index);
            });
        }
        openBalloon(0);

        function openBalloon(index) {
            var pl;
            for (var i = 0, len = placemarks.length; i < len; i++) {
                pl = map.geoObjects.get(i);
                pl.properties.set('className', '_dot');
            }
            pl = map.geoObjects.get(index);
            if (pl) {
                var coords = pl.geometry.getCoordinates();
                pl.properties.set('className', '_dot _primary');
                map.panTo(coords);
            }
        }
    }

});