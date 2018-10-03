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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkZXRhaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TGVnZW5kKCk7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TGVnZW5kKCkge1xyXG4gICAgICAgICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX190b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHQgPSAkKHRoaXMpLCAkYyA9ICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX19saXN0Jyk7XHJcbiAgICAgICAgICAgICR0LnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICRjLnNsaWRlVG9nZ2xlKCk7XHJcbiAgICAgICAgICAgICR0LnRleHQoJHQuaGFzQ2xhc3MoJ19hY3RpdmUnKSA/ICfQn9C+0LrQsNC30LDRgtGMINC70LXQs9C10L3QtNGDJyA6ICfQodC60YDRi9GC0Ywg0LvQtdCz0LXQvdC00YMnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG5cclxuICAgICAgICBpZiAoISQoJyNtYXAnKS5sZW5ndGggfHwgdHlwZW9mIChhcHAubWFwRGF0YSkgIT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGFwcC5tYXBEYXRhLm9iamVjdC5nZW8gPSBKU09OLnBhcnNlKGFwcC5tYXBEYXRhLm9iamVjdC5nZW8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbWFwID0gbmV3IHltYXBzLk1hcChcIm1hcFwiLCB7XHJcbiAgICAgICAgICAgIGNlbnRlcjogYXBwLm1hcERhdGEub2JqZWN0Lmdlb1swXSxcclxuICAgICAgICAgICAgem9vbTogMTMsXHJcbiAgICAgICAgICAgIGNvbnRyb2xzOiBbXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xyXG5cclxuICAgICAgICB2YXIgdHBsT2JqZWN0ID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGFjZW1hcmsge3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz48c3Bhbj57eyBwcm9wZXJ0aWVzLmNvbnRlbnQgfX08L3NwYW4+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIHRwbEluZnJhc3RydWN0dXJlID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayBfe3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA4LjIwMiAxMS4xMTNcIiBjbGFzcz1cIlwiPjxwYXRoIGQ9XCJNNC4xMDEgMTEuMTEzYzIuNzM0LTMuMTIgNC4xMDEtNS40NDIgNC4xMDEtNi45NjhDOC4yMDIgMS44NTUgNi4zNjYgMCA0LjEwMSAwIDEuODM2IDAgMCAxLjg1NiAwIDQuMTQ1YzAgMS41MjYgMS4zNjcgMy44NDkgNC4xMDEgNi45Njh6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+XFxuXFxcclxuICAgICAgICAgICAgICAgIDxzcGFuPjxpIGNsYXNzPVwiaWNvbi17eyBwcm9wZXJ0aWVzLmNsYXNzTmFtZSB9fVwiPjwvaT48L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgdHBsQmFsbG9vbiA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtYXBfX2JhbGxvb24geyUgaWYgcHJvcGVydGllcy5sb2dvICV9X2xvZ297JSBlbmRpZiAlfVwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgeyUgaWYgcHJvcGVydGllcy5sb2dvICV9PHNwYW4gY2xhc3M9XCJtYXBfX2JhbGxvb25fX2xvZ29cIj48aW1nIHNyYz1cInt7IHByb3BlcnRpZXMubG9nbyB9fVwiPjwvc3Bhbj57JSBlbmRpZiAlfVxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtYXBfX2JhbGxvb25fX2NvbnRlbnRcIj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fdGl0bGVcIj57eyBwcm9wZXJ0aWVzLnRpdGxlIH19PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19hZGRyZXNzXCI+e3sgcHJvcGVydGllcy5hZGRyZXNzIH19PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj4nKTtcclxuICAgICAgICAvLyBvYmplY3RcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXBwLm1hcERhdGEub2JqZWN0Lmdlby5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcGxhY2VtYXJrID0gbmV3IHltYXBzLlBsYWNlbWFyayhhcHAubWFwRGF0YS5vYmplY3QuZ2VvW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnX2RvdCBfcHJpbWFyeSBfb2JqZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGFwcC5tYXBEYXRhLm9iamVjdC50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogYXBwLm1hcERhdGEub2JqZWN0LmFkZHJlc3NcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkxheW91dDogdHBsT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uU2hhcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLTE1LjUsIC00Ml0sIFsxNS41LCAwXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlSWNvbk9uQmFsbG9vbk9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uQ2xvc2VCdXR0b246IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhcHAubWFwRGF0YS5pbmZyYXN0cnVjdHVyZSA9IEpTT04ucGFyc2UoYXBwLm1hcERhdGEuaW5mcmFzdHJ1Y3R1cmUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGluZnJhc3RydWN0dXJlXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGRhdGEgPSBhcHAubWFwRGF0YS5pbmZyYXN0cnVjdHVyZSwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcGxhY2VtYXJrID0gbmV3IHltYXBzLlBsYWNlbWFyayhkYXRhW2ldLmdlbyxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGFbaV0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBkYXRhW2ldLmljb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBkYXRhW2ldLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBkYXRhW2ldLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ286IGRhdGFbaV0ubG9nbyB8fCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbEluZnJhc3RydWN0dXJlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uU2hhcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLTE1LjUsIC00Ml0sIFsxNS41LCAwXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlSWNvbk9uQmFsbG9vbk9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uQ2xvc2VCdXR0b246IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4vLyAgICAgICAgICAgIHBsYWNlbWFyay5ldmVudHMuYWRkKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbi8vICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGUuZ2V0KCd0YXJnZXQnKS5wcm9wZXJ0aWVzLmdldCgnaWR4Jyk7XHJcbi8vICAgICAgICAgICAgICAgIG9wZW5CYWxsb29uKGluZGV4KTtcclxuLy8gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJy5qcy1pbmZyYXN0cnVjdHVyZV9fbGVnZW5kX19saXN0IGlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY2xvc2VBbGxCYWxsb29ucygpO1xyXG4gICAgICAgICAgICB2YXIgdHlwZSA9ICQodGhpcykuZGF0YSgndHlwZScpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKTtcclxuICAgICAgICAgICAgbWFwLmdlb09iamVjdHMuZWFjaChmdW5jdGlvbiAoZWwsIGkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbC5wcm9wZXJ0aWVzLmdldCgndHlwZScpID09IHR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbC5vcHRpb25zLnNldChcInZpc2libGVcIiwgY2hlY2tlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlQWxsQmFsbG9vbnMoKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtYXAuZ2VvT2JqZWN0cy5nZXRMZW5ndGgoKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gbWFwLmdlb09iamVjdHMuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgdG1wLmJhbGxvb24uY2xvc2UoKTtcclxuLy8gICAgICAgICAgICAgICAgdG1wLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnXycgKyB0bXAucHJvcGVydGllcy5nZXQoJ3R5cGUnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXAuZ2VvT2JqZWN0cy5nZXRMZW5ndGgoKSA+IDEpIHtcclxuICAgICAgICAgICAgbWFwLnNldEJvdW5kcyhtYXAuZ2VvT2JqZWN0cy5nZXRCb3VuZHMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vINC90LUg0L/QvtC90Y/QuyDQv9C+0YfQtdC80YMg0LIg0L3QvtC70Ywg0YHRgtCw0LLQuNGC0YHRjyDQuNC90L7Qs9C00LBcclxuICAgICAgICBpZiAobWFwLmdldFpvb20oKSA9PSAwKSB7XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKDEzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBwbSA9IG1hcC5nZW9PYmplY3RzLmdldCgwKTtcclxuICAgICAgICBwbS5iYWxsb29uLm9wZW4oKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLW1hcF9fem9vbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHogPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhhc0NsYXNzKCdfaW4nKSA/IHorKyA6IHotLTtcclxuICAgICAgICAgICAgbWFwLnNldFpvb20oeiwge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tab29tUmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJkZXRhaWwuanMifQ==
