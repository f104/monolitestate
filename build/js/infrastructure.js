jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initLegend();
        ymaps.ready(initMap);
    });

    function initLegend() {
        $('.js-infrastructure__legend__toggler').on('click', function (e) {
            e.preventDefault();
            var $t = $(this), $c = $('.js-infrastructure__legend__list');
            $t.toggleClass('_active');
            $c.slideToggle();
            $t.text($t.hasClass('_active') ? 'Показать легенду' : 'Скрыть легенду');
        });
    }

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

        $('.js-map__zoom').on('click', function () {
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        })

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}">\n\
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg>\n\
                    <span><i class="icon-{{ properties.type }}"></i></span>\n\
                </div>'
                ),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="map__balloon {% if properties.logo %}_logo{% endif %}">\n\
                        {% if properties.logo %}<span class="map__balloon__logo"><img src="{{ properties.logo }}"></span>{% endif %}\n\
                        <span class="map__balloon__content">\n\
                            <span class="map__balloon__title">{{ properties.title }}</span>\n\
                            <span class="map__balloon__address">{{ properties.address }}</span>\n\
                        </span>\n\
                    </div>');

        for (var i = 0, len = data.length; i < len; i++) {
            var placemark = new ymaps.Placemark(data[i].geo,
                    {
                        idx: i,
                        type: data[i].type,
                        className: '_' + data[i].type,
                        title: data[i].title,
                        address: data[i].address,
                        logo: data[i].logo || null
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

        function openBalloon(index) {
            for (var i = 0, len = data.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.properties.set('className', '_' + tmp.properties.get('type'));
            }
            var pl = map.geoObjects.get(index);
            if (pl && !pl.balloon.isOpen()) {
                pl.properties.set('className', '_open _' + pl.properties.get('type'));
            }
        }
        
        $('.js-infrastructure__legend__list input').on('change', function () {
            var $pm = $('.placemark._' + $(this).data('type'));
            $(this).prop('checked') ? $pm.show() : $pm.hide();
            closeAllBalloons();
        });
        
        function closeAllBalloons() {
            for (var i = 0, len = data.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.balloon.close();
                tmp.properties.set('className', '_' + tmp.properties.get('type'));
            }
        }

    }

});