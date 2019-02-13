jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initLegend();
        initMap();
        initGalleryPanorama();
        initPanorama();
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
        var v = [];
        $('.js-panorama').each(function () {
            var img = $(this).data('panorama');
            if (img) {
                var viewer = pannellum.viewer(this, {
                    "type": "equirectangular",
                    "panorama": img,
                    "hfov": 120,
                    "autoLoad": true,
                });
                var $tabs = $(this).parents('.js-tabs');
                if ($tabs.length) {
                    $tabs.bind('easytabs:after', function () {
                        viewer.getRenderer().resize();
                        viewer.setYaw(viewer.getYaw());
                    });
                }
            }
        });
    }

    function initGalleryPanorama() {
        var $cnt = $('.js-detail-panorama'),
                $toggler = $('.js-detail-panorama__toggler'),
                loaded = false;
        if ($cnt.length == 0) {
            return;
        }

        var geo = $('.js-detail-panorama').data('geo');
        if (geo) {
            geo = geo.split(',');
            geo[0] = parseFloat(geo[0]);
            geo[1] = parseFloat(geo[1]);
        } else {
            return;
        }

        if (geo[0] === 0 || geo[1] === 0) {
            $cnt.removeClass('_active');
            $toggler.remove();
        }

        $toggler.on('click', function () {
            if ($cnt.hasClass('_active')) {
                $(this).text('Смотреть панораму');
                $cnt.removeClass('_active');
            } else {
                $(this).text('Смотреть фотографии');
                $cnt.addClass('_active');
                if (!loaded) {
                    if (typeof (ymaps) === 'undefined') {
                        $.ajax({
                            url: `//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug`,
                            dataType: "script",
                            cache: true,
                            success: function () {
                                ymaps.ready(drawGalleryPanorama);
                            }
                        });
                    } else {
                        ymaps.ready(drawGalleryPanorama);
                    }
                }
            }
        });

        $('.js-gallery-nav').on('beforeChange', function () {
            if ($cnt.hasClass('_active')) {
                $toggler.click();
            }
        });

        function drawGalleryPanorama() {
            loaded = true;
            $cnt.removeClass('_loading');

            ymaps.panorama.locate(geo).done(
                    function (panoramas) {
                        if (panoramas.length > 0) {
                            var player = new ymaps.panorama.Player(
                                    'panorama',
                                    panoramas[0],
                                    {
                                        controls: ['zoomControl', 'fullscreenControl'],
                                        lookAt: geo
                                    }
                            );
                            player.events.add('destroy', function () {
                                $cnt.removeClass('_active');
                            });
                        } else {
                            $cnt.addClass('_panorama-nf');
                        }
                    },
                    function (error) {
                        console.log(error.message);
                    }
            );
        }
    }


    function initMap() {

        if (!$('#map').length || typeof (app.mapData) !== 'object')
            return;

        var loaded = false;

        var options = {
            baseClass: '_popup',
            autoFocus: false,
            btnTpl: {
                smallBtn: '<span data-fancybox-close class="fancybox-close-small"><span class="link">Закрыть</span></span>'
            },
            touch: false,
            hash: false
        };
        $('.js-detail-map').on('click', function () {
            $.fancybox.close();
            if ($(this).attr('href')) {
                var $target = $('#' + $(this).attr('href').substr(1));
                if ($target.length) {
                    $.fancybox.open($target, options);
                    if (!loaded) {
                        if (typeof (ymaps) === 'undefined') {
                            $.ajax({
                                url: `//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug`,
                                dataType: "script",
                                cache: true,
                                success: function () {
                                    ymaps.ready(drawMap);
                                }
                            });
                        } else {
                            ymaps.ready(drawMap);
                        }
                    }
                }
            }
            return false;
        });

        $('.js-tabs').bind('easytabs:after', function (event, $clicked, $target) {
            var $map = $target.find('#map');
            if ($map.length && !loaded) {
                if (typeof (ymaps) === 'undefined') {
                    $.ajax({
                        url: `//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug`,
                        dataType: "script",
                        cache: true,
                        success: function () {
                            ymaps.ready(drawMap);
                        }
                    });
                } else {
                    ymaps.ready(drawMap);
                }
            }
        });

        function drawMap() {
            loaded = true;
            $('#map').removeClass('_loading');

            try {
                app.mapData.object.geo = JSON.parse(app.mapData.object.geo);
            } catch (e) {
                console.log(e);
            }

            var map = new ymaps.Map('map', {
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
    }


});