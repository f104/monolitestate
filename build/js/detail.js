jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

    function initMap() {
        
        if (!$('#map').length || typeof(app.newMapData) !== 'object') return;
        
        var map = new ymaps.Map("map", {
            center: app.newMapData.coords.center,
            zoom: app.newMapData.coords.zoom,
            controls: []
        });
        map.behaviors.disable('scrollZoom');
        
        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                );
        for (var i = 0, len = app.newMapData.placemarks.length; i < len; i++) {
            var placemark = new ymaps.Placemark(app.newMapData.placemarks[i].coords,
                    {
                        className: '_dot _primary',
                        idx: i,
                    },
                    {
                        iconLayout: tpl,
                        iconShape: {
                            type: 'Rectangle',
                            coordinates: [
                                [-15.5, -42], [15.5, 0]
                            ]
                        }
                    });
            map.geoObjects.add(placemark);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkZXRhaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB5bWFwcy5yZWFkeShpbml0TWFwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCEkKCcjbWFwJykubGVuZ3RoIHx8IHR5cGVvZihhcHAubmV3TWFwRGF0YSkgIT09ICdvYmplY3QnKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IGFwcC5uZXdNYXBEYXRhLmNvb3Jkcy5jZW50ZXIsXHJcbiAgICAgICAgICAgIHpvb206IGFwcC5uZXdNYXBEYXRhLmNvb3Jkcy56b29tLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgdHBsID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGFjZW1hcmsge3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz48c3Bhbj57eyBwcm9wZXJ0aWVzLmNvbnRlbnQgfX08L3NwYW4+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXBwLm5ld01hcERhdGEucGxhY2VtYXJrcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcGxhY2VtYXJrID0gbmV3IHltYXBzLlBsYWNlbWFyayhhcHAubmV3TWFwRGF0YS5wbGFjZW1hcmtzW2ldLmNvb3JkcyxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ19kb3QgX3ByaW1hcnknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJy5qcy1tYXBfX3pvb20nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnX2luJykgPyB6KysgOiB6LS07XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKHosIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pOyJdLCJmaWxlIjoiZGV0YWlsLmpzIn0=
