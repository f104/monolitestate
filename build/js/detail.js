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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkZXRhaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TGVnZW5kKCk7XHJcbiAgICAgICAgaW5pdFBhbm9yYW1hKCk7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TGVnZW5kKCkge1xyXG4gICAgICAgICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX190b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHQgPSAkKHRoaXMpLCAkYyA9ICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX19saXN0Jyk7XHJcbiAgICAgICAgICAgICR0LnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICRjLnNsaWRlVG9nZ2xlKCk7XHJcbiAgICAgICAgICAgICR0LnRleHQoJHQuaGFzQ2xhc3MoJ19hY3RpdmUnKSA/ICfQn9C+0LrQsNC30LDRgtGMINC70LXQs9C10L3QtNGDJyA6ICfQodC60YDRi9GC0Ywg0LvQtdCz0LXQvdC00YMnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFub3JhbWEoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYW5lbGx1bSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLXBhbm9yYW1hLWdhbGxlcnktbmF2Jykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNixcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLXBhbm9yYW1hLWdhbGxlcnlfX3NsaWRlcicsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXBhbm9yYW1hLWdhbGxlcnknKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWwpLmZpbmQoJy5qcy1wYW5vcmFtYS1nYWxsZXJ5X19zbGlkZXInKTtcclxuICAgICAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN3aXBlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1wYW5vcmFtYS1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciB2ID0gW107XHJcbiAgICAgICAgJCgnLmpzLXBhbm9yYW1hJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBpbWcgPSAkKHRoaXMpLmRhdGEoJ3Bhbm9yYW1hJyk7XHJcbiAgICAgICAgICAgIGlmIChpbWcpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2aWV3ZXIgPSBwYW5uZWxsdW0udmlld2VyKHRoaXMsIHtcclxuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJlcXVpcmVjdGFuZ3VsYXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcInBhbm9yYW1hXCI6IGltZyxcclxuICAgICAgICAgICAgICAgICAgICBcImhmb3ZcIjogMTIwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYXV0b0xvYWRcIjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyICR0YWJzID0gJCh0aGlzKS5wYXJlbnRzKCcuanMtdGFicycpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCR0YWJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0YWJzLmJpbmQoJ2Vhc3l0YWJzOmFmdGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ZXIuZ2V0UmVuZGVyZXIoKS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlld2VyLnNldFlhdyh2aWV3ZXIuZ2V0WWF3KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkKCcjbWFwJykubGVuZ3RoIHx8IHR5cGVvZiAoYXBwLm1hcERhdGEpICE9PSAnb2JqZWN0JylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhcHAubWFwRGF0YS5vYmplY3QuZ2VvID0gSlNPTi5wYXJzZShhcHAubWFwRGF0YS5vYmplY3QuZ2VvKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IGFwcC5tYXBEYXRhLm9iamVjdC5nZW9bMF0sXHJcbiAgICAgICAgICAgIHpvb206IDEzLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuXHJcbiAgICAgICAgdmFyIHRwbE9iamVjdCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIHt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA4LjIwMiAxMS4xMTNcIiBjbGFzcz1cIlwiPjxwYXRoIGQ9XCJNNC4xMDEgMTEuMTEzYzIuNzM0LTMuMTIgNC4xMDEtNS40NDIgNC4xMDEtNi45NjhDOC4yMDIgMS44NTUgNi4zNjYgMCA0LjEwMSAwIDEuODM2IDAgMCAxLjg1NiAwIDQuMTQ1YzAgMS41MjYgMS4zNjcgMy44NDkgNC4xMDEgNi45Njh6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+PHNwYW4+e3sgcHJvcGVydGllcy5jb250ZW50IH19PC9zcGFuPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICB0cGxJbmZyYXN0cnVjdHVyZSA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGFjZW1hcmsgX3t7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPlxcblxcXHJcbiAgICAgICAgICAgICAgICA8c3Bhbj48aSBjbGFzcz1cImljb24te3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj48L2k+PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgIDwvZGl2PidcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIHRwbEJhbGxvb24gPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibWFwX19iYWxsb29uIHslIGlmIHByb3BlcnRpZXMubG9nbyAlfV9sb2dveyUgZW5kaWYgJX1cIj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIHslIGlmIHByb3BlcnRpZXMubG9nbyAlfTxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19sb2dvXCI+PGltZyBzcmM9XCJ7eyBwcm9wZXJ0aWVzLmxvZ28gfX1cIj48L3NwYW4+eyUgZW5kaWYgJX1cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19jb250ZW50XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtYXBfX2JhbGxvb25fX3RpdGxlXCI+e3sgcHJvcGVydGllcy50aXRsZSB9fTwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fYWRkcmVzc1wiPnt7IHByb3BlcnRpZXMuYWRkcmVzcyB9fTwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgPC9kaXY+Jyk7XHJcbiAgICAgICAgLy8gb2JqZWN0XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFwcC5tYXBEYXRhLm9iamVjdC5nZW8ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHBsYWNlbWFyayA9IG5ldyB5bWFwcy5QbGFjZW1hcmsoYXBwLm1hcERhdGEub2JqZWN0Lmdlb1tpXSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ19kb3QgX3ByaW1hcnkgX29iamVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBhcHAubWFwRGF0YS5vYmplY3QudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IGFwcC5tYXBEYXRhLm9iamVjdC5hZGRyZXNzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbE9iamVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUljb25PbkJhbGxvb25PcGVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkxheW91dDogdHBsQmFsbG9vbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFwcC5tYXBEYXRhLmluZnJhc3RydWN0dXJlID0gSlNPTi5wYXJzZShhcHAubWFwRGF0YS5pbmZyYXN0cnVjdHVyZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaW5mcmFzdHJ1Y3R1cmVcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgZGF0YSA9IGFwcC5tYXBEYXRhLmluZnJhc3RydWN0dXJlLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGFjZW1hcmsgPSBuZXcgeW1hcHMuUGxhY2VtYXJrKGRhdGFbaV0uZ2VvLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZGF0YVtpXS50eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGRhdGFbaV0uaWNvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGRhdGFbaV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IGRhdGFbaV0uYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nbzogZGF0YVtpXS5sb2dvIHx8IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkxheW91dDogdHBsSW5mcmFzdHJ1Y3R1cmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1JlY3RhbmdsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhbGxvb25MYXlvdXQ6IHRwbEJhbGxvb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhbGxvb25DbG9zZUJ1dHRvbjogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKHBsYWNlbWFyayk7XHJcbi8vICAgICAgICAgICAgcGxhY2VtYXJrLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuLy8gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZS5nZXQoJ3RhcmdldCcpLnByb3BlcnRpZXMuZ2V0KCdpZHgnKTtcclxuLy8gICAgICAgICAgICAgICAgb3BlbkJhbGxvb24oaW5kZXgpO1xyXG4vLyAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCgnLmpzLWluZnJhc3RydWN0dXJlX19sZWdlbmRfX2xpc3QgaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjbG9zZUFsbEJhbGxvb25zKCk7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gJCh0aGlzKS5kYXRhKCd0eXBlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZCA9ICQodGhpcykucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5lYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsLnByb3BlcnRpZXMuZ2V0KCd0eXBlJykgPT0gdHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsLm9wdGlvbnMuc2V0KFwidmlzaWJsZVwiLCBjaGVja2VkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2VBbGxCYWxsb29ucygpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1hcC5nZW9PYmplY3RzLmdldExlbmd0aCgpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICB0bXAuYmFsbG9vbi5jbG9zZSgpO1xyXG4vLyAgICAgICAgICAgICAgICB0bXAucHJvcGVydGllcy5zZXQoJ2NsYXNzTmFtZScsICdfJyArIHRtcC5wcm9wZXJ0aWVzLmdldCgndHlwZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hcC5nZW9PYmplY3RzLmdldExlbmd0aCgpID4gMSkge1xyXG4gICAgICAgICAgICBtYXAuc2V0Qm91bmRzKG1hcC5nZW9PYmplY3RzLmdldEJvdW5kcygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g0L3QtSDQv9C+0L3Rj9C7INC/0L7Rh9C10LzRgyDQsiDQvdC+0LvRjCDRgdGC0LDQstC40YLRgdGPINC40L3QvtCz0LTQsFxyXG4gICAgICAgIGlmIChtYXAuZ2V0Wm9vbSgpID09IDApIHtcclxuICAgICAgICAgICAgbWFwLnNldFpvb20oMTMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHBtID0gbWFwLmdlb09iamVjdHMuZ2V0KDApO1xyXG4gICAgICAgIHBtLmJhbGxvb24ub3BlbigpO1xyXG5cclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgeiA9IG1hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICBtYXAuc2V0Wm9vbSh6LCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImRldGFpbC5qcyJ9
