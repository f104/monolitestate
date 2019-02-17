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
        
        if (!$('.js-panorama').length) {
            return;
        }
        var loaded = false;
        
        $('.js-tabs').bind('easytabs:after', function (event, $clicked, $target) {
            var $p = $target.find('.js-panorama');
            if ($p.length && !loaded) {
                $.ajax({
                    url: 'js/libs/pannellum.js',
                    dataType: "script",
                    cache: true,
                    success: function () {
                        loaded = true;
                        drawPanorama();
                    }
                });
            }
        });
        
        function drawPanorama() {
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
                            url: '//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug',
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
                                url: '//api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkZXRhaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TGVnZW5kKCk7XHJcbiAgICAgICAgaW5pdE1hcCgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5UGFub3JhbWEoKTtcclxuICAgICAgICBpbml0UGFub3JhbWEoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRMZWdlbmQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWluZnJhc3RydWN0dXJlX19sZWdlbmRfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcyksICRjID0gJCgnLmpzLWluZnJhc3RydWN0dXJlX19sZWdlbmRfX2xpc3QnKTtcclxuICAgICAgICAgICAgJHQudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJGMuc2xpZGVUb2dnbGUoKTtcclxuICAgICAgICAgICAgJHQudGV4dCgkdC5oYXNDbGFzcygnX2FjdGl2ZScpID8gJ9Cf0L7QutCw0LfQsNGC0Ywg0LvQtdCz0LXQvdC00YMnIDogJ9Ch0LrRgNGL0YLRjCDQu9C10LPQtdC90LTRgycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYW5vcmFtYSgpIHtcclxuICAgICAgICAkKCcuanMtcGFub3JhbWEtZ2FsbGVyeS1uYXYnKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA2LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtcGFub3JhbWEtZ2FsbGVyeV9fc2xpZGVyJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogM1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtcGFub3JhbWEtZ2FsbGVyeScpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgIHZhciAkc2xpZGVyID0gJChlbCkuZmluZCgnLmpzLXBhbm9yYW1hLWdhbGxlcnlfX3NsaWRlcicpO1xyXG4gICAgICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3dpcGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLXBhbm9yYW1hLWdhbGxlcnktbmF2JyxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCEkKCcuanMtcGFub3JhbWEnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJCgnLmpzLXRhYnMnKS5iaW5kKCdlYXN5dGFiczphZnRlcicsIGZ1bmN0aW9uIChldmVudCwgJGNsaWNrZWQsICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgdmFyICRwID0gJHRhcmdldC5maW5kKCcuanMtcGFub3JhbWEnKTtcclxuICAgICAgICAgICAgaWYgKCRwLmxlbmd0aCAmJiAhbG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJ2pzL2xpYnMvcGFubmVsbHVtLmpzJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdQYW5vcmFtYSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gZHJhd1Bhbm9yYW1hKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFub3JhbWEnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbWcgPSAkKHRoaXMpLmRhdGEoJ3Bhbm9yYW1hJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW1nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZpZXdlciA9IHBhbm5lbGx1bS52aWV3ZXIodGhpcywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJlcXVpcmVjdGFuZ3VsYXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwYW5vcmFtYVwiOiBpbWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGZvdlwiOiAxMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXV0b0xvYWRcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHRhYnMgPSAkKHRoaXMpLnBhcmVudHMoJy5qcy10YWJzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCR0YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFicy5iaW5kKCdlYXN5dGFiczphZnRlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdlci5nZXRSZW5kZXJlcigpLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLnNldFlhdyh2aWV3ZXIuZ2V0WWF3KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2FsbGVyeVBhbm9yYW1hKCkge1xyXG4gICAgICAgIHZhciAkY250ID0gJCgnLmpzLWRldGFpbC1wYW5vcmFtYScpLFxyXG4gICAgICAgICAgICAgICAgJHRvZ2dsZXIgPSAkKCcuanMtZGV0YWlsLXBhbm9yYW1hX190b2dnbGVyJyksXHJcbiAgICAgICAgICAgICAgICBsb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAoJGNudC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZ2VvID0gJCgnLmpzLWRldGFpbC1wYW5vcmFtYScpLmRhdGEoJ2dlbycpO1xyXG4gICAgICAgIGlmIChnZW8pIHtcclxuICAgICAgICAgICAgZ2VvID0gZ2VvLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIGdlb1swXSA9IHBhcnNlRmxvYXQoZ2VvWzBdKTtcclxuICAgICAgICAgICAgZ2VvWzFdID0gcGFyc2VGbG9hdChnZW9bMV0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnZW9bMF0gPT09IDAgfHwgZ2VvWzFdID09PSAwKSB7XHJcbiAgICAgICAgICAgICRjbnQucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJHRvZ2dsZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkdG9nZ2xlci5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmhhc0NsYXNzKCdfYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudGV4dCgn0KHQvNC+0YLRgNC10YLRjCDQv9Cw0L3QvtGA0LDQvNGDJyk7XHJcbiAgICAgICAgICAgICAgICAkY250LnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoJ9Ch0LzQvtGC0YDQtdGC0Ywg0YTQvtGC0L7Qs9GA0LDRhNC40LgnKTtcclxuICAgICAgICAgICAgICAgICRjbnQuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoeW1hcHMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnLy9hcGktbWFwcy55YW5kZXgucnUvMi4xLz9sYW5nPXJ1X1JVJm1vZGU9ZGVidWcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bWFwcy5yZWFkeShkcmF3R2FsbGVyeVBhbm9yYW1hKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeW1hcHMucmVhZHkoZHJhd0dhbGxlcnlQYW5vcmFtYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmhhc0NsYXNzKCdfYWN0aXZlJykpIHtcclxuICAgICAgICAgICAgICAgICR0b2dnbGVyLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZHJhd0dhbGxlcnlQYW5vcmFtYSgpIHtcclxuICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgJGNudC5yZW1vdmVDbGFzcygnX2xvYWRpbmcnKTtcclxuXHJcbiAgICAgICAgICAgIHltYXBzLnBhbm9yYW1hLmxvY2F0ZShnZW8pLmRvbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHBhbm9yYW1hcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFub3JhbWFzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgeW1hcHMucGFub3JhbWEuUGxheWVyKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGFub3JhbWEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYW5vcmFtYXNbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzOiBbJ3pvb21Db250cm9sJywgJ2Z1bGxzY3JlZW5Db250cm9sJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb29rQXQ6IGdlb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLmV2ZW50cy5hZGQoJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNudC5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY250LmFkZENsYXNzKCdfcGFub3JhbWEtbmYnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcblxyXG4gICAgICAgIGlmICghJCgnI21hcCcpLmxlbmd0aCB8fCB0eXBlb2YgKGFwcC5tYXBEYXRhKSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRvdWNoOiBmYWxzZSxcclxuICAgICAgICAgICAgaGFzaDogZmFsc2VcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1kZXRhaWwtbWFwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmF0dHIoJ2hyZWYnKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKCcjJyArICQodGhpcykuYXR0cignaHJlZicpLnN1YnN0cigxKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJHRhcmdldCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsb2FkZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoeW1hcHMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvL2FwaS1tYXBzLnlhbmRleC5ydS8yLjEvP2xhbmc9cnVfUlUmbW9kZT1kZWJ1ZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5bWFwcy5yZWFkeShkcmF3TWFwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHltYXBzLnJlYWR5KGRyYXdNYXApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnLmpzLXRhYnMnKS5iaW5kKCdlYXN5dGFiczphZnRlcicsIGZ1bmN0aW9uIChldmVudCwgJGNsaWNrZWQsICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgdmFyICRtYXAgPSAkdGFyZ2V0LmZpbmQoJyNtYXAnKTtcclxuICAgICAgICAgICAgaWYgKCRtYXAubGVuZ3RoICYmICFsb2FkZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHltYXBzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGAvL2FwaS1tYXBzLnlhbmRleC5ydS8yLjEvP2xhbmc9cnVfUlUmbW9kZT1kZWJ1Z2AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcInNjcmlwdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeW1hcHMucmVhZHkoZHJhd01hcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeW1hcHMucmVhZHkoZHJhd01hcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZHJhd01hcCgpIHtcclxuICAgICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgJCgnI21hcCcpLnJlbW92ZUNsYXNzKCdfbG9hZGluZycpO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGFwcC5tYXBEYXRhLm9iamVjdC5nZW8gPSBKU09OLnBhcnNlKGFwcC5tYXBEYXRhLm9iamVjdC5nZW8pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoJ21hcCcsIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlcjogYXBwLm1hcERhdGEub2JqZWN0Lmdlb1swXSxcclxuICAgICAgICAgICAgICAgIHpvb206IDEzLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IFtdXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0cGxPYmplY3QgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGFjZW1hcmsge3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz48c3Bhbj57eyBwcm9wZXJ0aWVzLmNvbnRlbnQgfX08L3NwYW4+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgdHBsSW5mcmFzdHJ1Y3R1cmUgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayBfe3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+PGkgY2xhc3M9XCJpY29uLXt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+PC9pPjwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICB0cGxCYWxsb29uID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtYXBfX2JhbGxvb24geyUgaWYgcHJvcGVydGllcy5sb2dvICV9X2xvZ297JSBlbmRpZiAlfVwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHslIGlmIHByb3BlcnRpZXMubG9nbyAlfTxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19sb2dvXCI+PGltZyBzcmM9XCJ7eyBwcm9wZXJ0aWVzLmxvZ28gfX1cIj48L3NwYW4+eyUgZW5kaWYgJX1cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fY29udGVudFwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fdGl0bGVcIj57eyBwcm9wZXJ0aWVzLnRpdGxlIH19PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fYWRkcmVzc1wiPnt7IHByb3BlcnRpZXMuYWRkcmVzcyB9fTwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nKTtcclxuICAgICAgICAgICAgLy8gb2JqZWN0XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcHAubWFwRGF0YS5vYmplY3QuZ2VvLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2VtYXJrID0gbmV3IHltYXBzLlBsYWNlbWFyayhhcHAubWFwRGF0YS5vYmplY3QuZ2VvW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdfZG90IF9wcmltYXJ5IF9vYmplY3QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGFwcC5tYXBEYXRhLm9iamVjdC50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IGFwcC5tYXBEYXRhLm9iamVjdC5hZGRyZXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbE9iamVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXBwLm1hcERhdGEuaW5mcmFzdHJ1Y3R1cmUgPSBKU09OLnBhcnNlKGFwcC5tYXBEYXRhLmluZnJhc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaW5mcmFzdHJ1Y3R1cmVcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGRhdGEgPSBhcHAubWFwRGF0YS5pbmZyYXN0cnVjdHVyZSwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlbWFyayA9IG5ldyB5bWFwcy5QbGFjZW1hcmsoZGF0YVtpXS5nZW8sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGFbaV0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogZGF0YVtpXS5pY29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGFbaV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBkYXRhW2ldLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dvOiBkYXRhW2ldLmxvZ28gfHwgbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uTGF5b3V0OiB0cGxJbmZyYXN0cnVjdHVyZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBwbGFjZW1hcmsuZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZS5nZXQoJ3RhcmdldCcpLnByb3BlcnRpZXMuZ2V0KCdpZHgnKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIG9wZW5CYWxsb29uKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX19saXN0IGlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGNsb3NlQWxsQmFsbG9vbnMoKTtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gJCh0aGlzKS5kYXRhKCd0eXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsLnByb3BlcnRpZXMuZ2V0KCd0eXBlJykgPT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5vcHRpb25zLnNldChcInZpc2libGVcIiwgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjbG9zZUFsbEJhbGxvb25zKCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1hcC5nZW9PYmplY3RzLmdldExlbmd0aCgpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG1wID0gbWFwLmdlb09iamVjdHMuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRtcC5iYWxsb29uLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgdG1wLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnXycgKyB0bXAucHJvcGVydGllcy5nZXQoJ3R5cGUnKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChtYXAuZ2VvT2JqZWN0cy5nZXRMZW5ndGgoKSA+IDEpIHtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXRCb3VuZHMobWFwLmdlb09iamVjdHMuZ2V0Qm91bmRzKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vINC90LUg0L/QvtC90Y/QuyDQv9C+0YfQtdC80YMg0LIg0L3QvtC70Ywg0YHRgtCw0LLQuNGC0YHRjyDQuNC90L7Qs9C00LBcclxuICAgICAgICAgICAgaWYgKG1hcC5nZXRab29tKCkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgcG0gPSBtYXAuZ2VvT2JqZWN0cy5nZXQoMCk7XHJcbiAgICAgICAgICAgIHBtLmJhbGxvb24ub3BlbigpO1xyXG5cclxuICAgICAgICAgICAgJCgnLmpzLW1hcF9fem9vbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oeiwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxufSk7Il0sImZpbGUiOiJkZXRhaWwuanMifQ==
