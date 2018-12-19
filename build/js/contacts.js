jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSlider();
        ymaps.ready(initMap);
    });

    function initSlider() {
        var $slider = $('.js-contacts-slider'),
            $scroller = $('.js-contacts-scroller');
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
            if (offset.length > 3) {
                $scroller.animate({scrollLeft: offset[nextSlide]}, 500);
            }
        });
    }

    function initMap() {
        var map, geocode = [], placemarks = [], $slider = $('.js-contacts-slider');

        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            openBalloon(nextSlide);
        });

        map = new ymaps.Map("map", {
            center: [56.326887, 44.005986],
            zoom: 13,
            controls: []
        });
        map.behaviors.disable('scrollZoom');

        $('.js-map__zoom').on('click', function () {
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        });

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                );
        // чтобы открыть первый балун после завершения всех геокодеров
        var len = $('.js-contacts-scroller__link').length;
        $('.js-contacts-scroller__link').each(function (index) {
            var geo = $(this).data('geo');
            if (geo) {
                ymaps.geocode(geo, {
                    results: 1
                }).then(function (res) {
                    var firstGeoObject = res.geoObjects.get(0),
                            coords = firstGeoObject.geometry.getCoordinates();
                    var placemark = new ymaps.Placemark(coords,
                            {
                                className: '_dot',
                                slide: index
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
                    placemarks.push(placemark);
                    if (index == len - 1) {
                        openBalloon(0);
                    }
                });
            }
        });
        
        function openBalloon(index) {
            map.geoObjects.each(function (el) {
                var i = el.properties.get('slide');
                if (i == index) {
                    var coords = el.geometry.getCoordinates();
                    el.properties.set('className', '_dot _primary');
                    map.panTo(coords);
                } else {
                    el.properties.set('className', '_dot');
                }
            });
        }

    }

});