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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidWlsZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXBwLmJ1aWxkZXJNYXBEYXRhID09ICd1bmRlZmluZWQnIHx8IGFwcC5idWlsZGVyTWFwRGF0YS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgJCgnLmJ1aWxkZXItbWFwJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBtYXA7XHJcblxyXG4gICAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IFs1Ni4zMjY4ODcsIDQ0LjAwNTk4Nl0sXHJcbiAgICAgICAgICAgIHpvb206IDEzLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuXHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIHt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA4LjIwMiAxMS4xMTNcIiBjbGFzcz1cIlwiPjxwYXRoIGQ9XCJNNC4xMDEgMTEuMTEzYzIuNzM0LTMuMTIgNC4xMDEtNS40NDIgNC4xMDEtNi45NjhDOC4yMDIgMS44NTUgNi4zNjYgMCA0LjEwMSAwIDEuODM2IDAgMCAxLjg1NiAwIDQuMTQ1YzAgMS41MjYgMS4zNjcgMy44NDkgNC4xMDEgNi45Njh6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+PHNwYW4+PC9zcGFuPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICB0cGxCYWxsb29uID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1hcF9fYmFsbG9vbiBfb2JqZWN0XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtYXBfX2JhbGxvb25fX2xvZ29cIj48aW1nIHNyYz1cInt7IHByb3BlcnRpZXMuaW1nIH19XCI+PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19jb250ZW50XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX190aXRsZVwiPnt7IHByb3BlcnRpZXMudGl0bGUgfX08L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIve3sgcHJvcGVydGllcy5saW5rIH19XCIgY2xhc3M9XCJtYXBfX2JhbGxvb25fX2xpbmtcIj7Qn9C+0LTRgNC+0LHQvdC10LU8L2E+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+Jyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGxlbjEgPSBhcHAuYnVpbGRlck1hcERhdGEubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcHAuYnVpbGRlck1hcERhdGFbal0ucGxhY2VtYXJrcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlbWFyayA9IG5ldyB5bWFwcy5QbGFjZW1hcmsoYXBwLmJ1aWxkZXJNYXBEYXRhW2pdLnBsYWNlbWFya3NbaV0uY29vcmRzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdfZG90IF9wcmltYXJ5JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzogYXBwLmJ1aWxkZXJNYXBEYXRhW2pdLmltZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBhcHAuYnVpbGRlck1hcERhdGFbal0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rOiBhcHAuYnVpbGRlck1hcERhdGFbal0ubGluayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkxheW91dDogdHBsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1JlY3RhbmdsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUljb25PbkJhbGxvb25PcGVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhbGxvb25MYXlvdXQ6IHRwbEJhbGxvb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uQ2xvc2VCdXR0b246IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKHBsYWNlbWFyayk7XHJcbiAgICAgICAgICAgICAgICBwbGFjZW1hcmsuZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmVhY2goZnVuY3Rpb24gKHBsLCBpKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGwucHJvcGVydGllcy5zZXQoJ2NsYXNzTmFtZScsICdfZG90IF9wcmltYXJ5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsID0gZS5nZXQoJ3RhcmdldCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBsLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX2RvdCcpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbWFwLnNldEJvdW5kcyhtYXAuZ2VvT2JqZWN0cy5nZXRCb3VuZHMoKSwge1xyXG4gICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgem9vbU1hcmdpbjogNTAsXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXAuZ2VvT2JqZWN0cy5nZXRMZW5ndGgoKSA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxMyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgICQoJy5qcy1tYXBfX3pvb20nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnX2luJykgPyB6KysgOiB6LS07XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKHosIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImJ1aWxkZXIuanMifQ==
