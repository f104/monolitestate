jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

    function initMap() {
        if (typeof data == 'undefined')
            return;

        var map, placemarks = [];

        map = new ymaps.Map("map", {
            center: [56.326887, 44.005986],
            zoom: 13,
            controls: []
        });
        map.behaviors.disable('scrollZoom');

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span></span></div>'
                ),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="map__balloon _object">\n\
                        <span class="map__balloon__logo"><img src="{{ properties.img }}"></span>\n\
                        <span class="map__balloon__content">\n\
                            <span class="map__balloon__title">{{ properties.title }}</span>\n\
                            <a href="{{ properties.link }}" class="map__balloon__link">Подробнее</a>\n\
                        </span>\n\
                    </div>');

        for (var i = 0, len = data.length; i < len; i++) {
            var placemark = new ymaps.Placemark(data[i].geo,
                    {
                        idx: i,
                        className: '_dot',
                        img: data[i].img,
                        title: data[i].title,
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
        map.setBounds(map.geoObjects.getBounds());
        openBalloon(1);
        map.geoObjects.get(1).balloon.open();

        function openBalloon(index) {
            for (var i = 0, len = data.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.properties.set('className', '_dot');
            }
            var pl = map.geoObjects.get(index);
            if (pl && !pl.balloon.isOpen()) {
                pl.properties.set('className', '_dot _primary');
            }
        }

    }

});