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