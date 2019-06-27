jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

    function initMap() {
        if (typeof app.builderMapData == 'undefined' || app.builderMapData.length === 0) {
            $('.builder-map').remove();
            return;
        }
        
        // может придти json  с пустыми placemarks
        var pmFound = false;
        for (var j = 0, len1 = app.builderMapData.length; j < len1; j++) {
            if (app.builderMapData[j].placemarks.length) {
                pmFound = true;
                break;
            }
        }
        if (!pmFound) {
            $('.builder-map').remove();
            return;
        }

        var map;

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
                            <a href="/{{ properties.link }}" class="map__balloon__link">Подробнее</a>\n\
                        </span>\n\
                    </div>');
        
        for (var j = 0, len1 = app.builderMapData.length; j < len1; j++) {
            for (var i = 0, len = app.builderMapData[j].placemarks.length; i < len; i++) {
                var placemark = new ymaps.Placemark(app.builderMapData[j].placemarks[i].coords,
                        {
                            className: '_dot _primary',
                            img: app.builderMapData[j].img,
                            title: app.builderMapData[j].title,
                            link: app.builderMapData[j].link,
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
                    map.geoObjects.each(function (pl, i){
                        pl.properties.set('className', '_dot _primary');
                    });
                    var pl = e.get('target');
                    pl.properties.set('className', '_dot');
                });
            }
        }
        map.setBounds(map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 50,
        }).then(function () {
            if (map.geoObjects.getLength() == 1) {
                map.setZoom(13);
            }
         }, this);

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