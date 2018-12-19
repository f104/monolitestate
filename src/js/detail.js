jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initLegend();
        initPanorama();
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

    function initPanorama() {
        if (typeof panellum === undefined) {
            return;
        }
        $('.js-panorama-gallery-nav').slick({
            dots: false,
            arrows: true,
            infinite: false,
            slidesToShow: 6,
            slidesToScroll: 1,
            focusOnSelect: true,
            asNavFor: '.js-panorama-gallery__slider',
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md,
                    settings: {
                        slidesToShow: 3
                    }
                }
            ],
        });
        $('.js-panorama-gallery').each(function (i, el) {
            var $slider = $(el).find('.js-panorama-gallery__slider');
            $slider.slick({
                dots: false,
                arrows: true,
                infinite: false,
                swipeToSlide: true,
                swipe: false,
                draggable: false,
                asNavFor: '.js-panorama-gallery-nav',
                responsive: [
                    {
                        breakpoint: appConfig.breakpoint.md,
                        settings: {
                            arrows: false
                        }
                    }
                ],
            });
        });
        $('.js-panorama').each(function () {
            var img = $(this).data('panorama');
            if (img) {
                pannellum.viewer(this, {
                    "type": "equirectangular",
                    "panorama": img,
                    "hfov": 120
                });
            }
        });
    }

    function initMap() {

        if (!$('#map').length || typeof (app.mapData) !== 'object')
            return;

        try {
            app.mapData.object.geo = JSON.parse(app.mapData.object.geo);
        } catch (e) {
            console.log(e);
        }

        var map = new ymaps.Map("map", {
            center: app.mapData.object.geo[0],
            zoom: 13,
            controls: []
        });
        map.behaviors.disable('scrollZoom');

        var tplObject = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                ),
                tplInfrastructure = ymaps.templateLayoutFactory.createClass(
                        '<div class="placemark _{{ properties.className }}">\n\
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg>\n\
                <span><i class="icon-{{ properties.className }}"></i></span>\n\
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
        // object
        for (var i = 0, len = app.mapData.object.geo.length; i < len; i++) {
            var placemark = new ymaps.Placemark(app.mapData.object.geo[i],
                    {
                        className: '_dot _primary _object',
                        title: app.mapData.object.title,
                        address: app.mapData.object.address
                    },
                    {
                        iconLayout: tplObject,
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
        }

        try {
            app.mapData.infrastructure = JSON.parse(app.mapData.infrastructure);
        } catch (e) {
            console.log(e);
        }
        // infrastructure
        for (var i = 0, data = app.mapData.infrastructure, len = data.length; i < len; i++) {
            var placemark = new ymaps.Placemark(data[i].geo,
                    {
                        type: data[i].type,
                        className: data[i].icon,
                        title: data[i].title,
                        address: data[i].address,
                        logo: data[i].logo || null
                    },
                    {
                        iconLayout: tplInfrastructure,
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
//            placemark.events.add('click', function (e) {
//                var index = e.get('target').properties.get('idx');
//                openBalloon(index);
//            });
        }

        $('.js-infrastructure__legend__list input').on('change', function () {
            closeAllBalloons();
            var type = $(this).data('type'),
                    checked = $(this).prop('checked');
            map.geoObjects.each(function (el, i) {
                if (el.properties.get('type') == type) {
                    el.options.set("visible", checked);
                }
            })
        });

        function closeAllBalloons() {
            for (var i = 0, len = map.geoObjects.getLength(); i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.balloon.close();
//                tmp.properties.set('className', '_' + tmp.properties.get('type'));
            }
        }

        if (map.geoObjects.getLength() > 1) {
            map.setBounds(map.geoObjects.getBounds());
        }
        // не понял почему в ноль ставится иногда
        if (map.getZoom() == 0) {
            map.setZoom(13);
        }

        var pm = map.geoObjects.get(0);
        pm.balloon.open();

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