jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

    function initMap() {
        var map, geo = [[56.314953, 43.999951], [56.323889, 43.920087], [56.342388, 44.089517], [56.288103, 43.928842]];

        map = new ymaps.Map("map", {
            center: [56.25471469870076, 43.947964454589815],
            zoom: 12,
            controls: []
        });
        map.behaviors.disable('scrollZoom');

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                ),
                cnt = $('.onmap__content').html(),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="onmap__content">' + cnt + '</div>', {
                            build: function () {
                                tplBalloon.superclass.build.call(this);
                                $('.onmap__list .scrollbar-outer').scrollbar();
                            }
                        });
        for (var i = 0, len = geo.length; i < len; i++) {
            var placemark = new ymaps.Placemark(geo[i],
                    {
                        className: '_dot',
                        idx: i,
                    },
                    {
                        iconLayout: tpl,
                        iconShape: {
                            type: 'Rectangle',
                            coordinates: [
                                [-15.5, -42], [15.5, 0]
                            ]
                        },
                        hideIconOnBalloonOpen: false,
                        balloonLayout: tplBalloon,
                        balloonCloseButton: false
                    });
            map.geoObjects.add(placemark);
            placemark.events.add('click', function (e) {
                var index = e.get('target').properties.get('idx');
                openBalloon(index);
            });
        }
        if ($(window).outerWidth() > appConfig.breakpoint.md) {
            openBalloon(0);
            map.geoObjects.get(0).balloon.open();
        }

        function openBalloon(index) {
            for (var i = 0, len = geo.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.properties.set('className', '_dot');
            }
            var pl = map.geoObjects.get(index);
            if (pl && !pl.balloon.isOpen()) {
                var coords = pl.geometry.getCoordinates();
                pl.properties.set('className', '_dot _primary');
//                map.panTo(coords);
            }
        }

        $('.js-map__zoom').on('click', function () {
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        });
    }

});