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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbmZyYXN0cnVjdHVyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRMZWdlbmQoKTtcclxuICAgICAgICB5bWFwcy5yZWFkeShpbml0TWFwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRMZWdlbmQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWluZnJhc3RydWN0dXJlX19sZWdlbmRfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcyksICRjID0gJCgnLmpzLWluZnJhc3RydWN0dXJlX19sZWdlbmRfX2xpc3QnKTtcclxuICAgICAgICAgICAgJHQudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJGMuc2xpZGVUb2dnbGUoKTtcclxuICAgICAgICAgICAgJHQudGV4dCgkdC5oYXNDbGFzcygnX2FjdGl2ZScpID8gJ9Cf0L7QutCw0LfQsNGC0Ywg0LvQtdCz0LXQvdC00YMnIDogJ9Ch0LrRgNGL0YLRjCDQu9C10LPQtdC90LTRgycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBtYXAsIHBsYWNlbWFya3MgPSBbXTtcclxuXHJcbiAgICAgICAgbWFwID0gbmV3IHltYXBzLk1hcChcIm1hcFwiLCB7XHJcbiAgICAgICAgICAgIGNlbnRlcjogWzU2LjMyNjg4NywgNDQuMDA1OTg2XSxcclxuICAgICAgICAgICAgem9vbTogMTMsXHJcbiAgICAgICAgICAgIGNvbnRyb2xzOiBbXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xyXG5cclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgeiA9IG1hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICBtYXAuc2V0Wm9vbSh6LCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIHt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPjxpIGNsYXNzPVwiaWNvbi17eyBwcm9wZXJ0aWVzLnR5cGUgfX1cIj48L2k+PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgdHBsQmFsbG9vbiA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtYXBfX2JhbGxvb24geyUgaWYgcHJvcGVydGllcy5sb2dvICV9X2xvZ297JSBlbmRpZiAlfVwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHslIGlmIHByb3BlcnRpZXMubG9nbyAlfTxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19sb2dvXCI+PGltZyBzcmM9XCJ7eyBwcm9wZXJ0aWVzLmxvZ28gfX1cIj48L3NwYW4+eyUgZW5kaWYgJX1cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fY29udGVudFwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fdGl0bGVcIj57eyBwcm9wZXJ0aWVzLnRpdGxlIH19PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fYWRkcmVzc1wiPnt7IHByb3BlcnRpZXMuYWRkcmVzcyB9fTwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHBsYWNlbWFyayA9IG5ldyB5bWFwcy5QbGFjZW1hcmsoZGF0YVtpXS5nZW8sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGFbaV0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnXycgKyBkYXRhW2ldLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhW2ldLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBkYXRhW2ldLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ286IGRhdGFbaV0ubG9nbyB8fCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUljb25PbkJhbGxvb25PcGVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkxheW91dDogdHBsQmFsbG9vbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICAgICAgcGxhY2VtYXJrLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGUuZ2V0KCd0YXJnZXQnKS5wcm9wZXJ0aWVzLmdldCgnaWR4Jyk7XHJcbiAgICAgICAgICAgICAgICBvcGVuQmFsbG9vbihpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXAuc2V0Qm91bmRzKG1hcC5nZW9PYmplY3RzLmdldEJvdW5kcygpKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlbkJhbGxvb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICB0bXAucHJvcGVydGllcy5zZXQoJ2NsYXNzTmFtZScsICdfJyArIHRtcC5wcm9wZXJ0aWVzLmdldCgndHlwZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcGwgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAocGwgJiYgIXBsLmJhbGxvb24uaXNPcGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX29wZW4gXycgKyBwbC5wcm9wZXJ0aWVzLmdldCgndHlwZScpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAkKCcuanMtaW5mcmFzdHJ1Y3R1cmVfX2xlZ2VuZF9fbGlzdCBpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkcG0gPSAkKCcucGxhY2VtYXJrLl8nICsgJCh0aGlzKS5kYXRhKCd0eXBlJykpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSA/ICRwbS5zaG93KCkgOiAkcG0uaGlkZSgpO1xyXG4gICAgICAgICAgICBjbG9zZUFsbEJhbGxvb25zKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gY2xvc2VBbGxCYWxsb29ucygpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICB0bXAuYmFsbG9vbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgdG1wLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnXycgKyB0bXAucHJvcGVydGllcy5nZXQoJ3R5cGUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJpbmZyYXN0cnVjdHVyZS5qcyJ9
