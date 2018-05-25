jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

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

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span></span></div>'
                ),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="map__balloon _object">\n\
                        <span class="map__balloon__logo"><img src="{{ properties.img }}"></span>\n\
                        <span class="map__balloon__content">\n\
                            <span class="map__balloon__title">{{ properties.title }}</span>\n\
                            <a href="{{ properties.link }}" class="map__balloon__link">Подробнее</a>\n\
                        </span>\n\
                    </div>');

        for (var i = 0, len = data.length; i < len; i++) {
            var placemark = new ymaps.Placemark(data[i].geo,
                    {
                        idx: i,
                        className: '_dot',
                        img: data[i].img,
                        title: data[i].title,
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
        openBalloon(1);
        map.geoObjects.get(1).balloon.open();

        function openBalloon(index) {
            for (var i = 0, len = data.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.properties.set('className', '_dot');
            }
            var pl = map.geoObjects.get(index);
            if (pl && !pl.balloon.isOpen()) {
                pl.properties.set('className', '_dot _primary');
            }
        }

    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidWlsZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgbWFwLCBwbGFjZW1hcmtzID0gW107XHJcblxyXG4gICAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IFs1Ni4zMjY4ODcsIDQ0LjAwNTk4Nl0sXHJcbiAgICAgICAgICAgIHpvb206IDEzLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuXHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIHt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA4LjIwMiAxMS4xMTNcIiBjbGFzcz1cIlwiPjxwYXRoIGQ9XCJNNC4xMDEgMTEuMTEzYzIuNzM0LTMuMTIgNC4xMDEtNS40NDIgNC4xMDEtNi45NjhDOC4yMDIgMS44NTUgNi4zNjYgMCA0LjEwMSAwIDEuODM2IDAgMCAxLjg1NiAwIDQuMTQ1YzAgMS41MjYgMS4zNjcgMy44NDkgNC4xMDEgNi45Njh6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+PHNwYW4+PC9zcGFuPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICB0cGxCYWxsb29uID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1hcF9fYmFsbG9vbiBfb2JqZWN0XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtYXBfX2JhbGxvb25fX2xvZ29cIj48aW1nIHNyYz1cInt7IHByb3BlcnRpZXMuaW1nIH19XCI+PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19jb250ZW50XCI+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX190aXRsZVwiPnt7IHByb3BlcnRpZXMudGl0bGUgfX08L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJ7eyBwcm9wZXJ0aWVzLmxpbmsgfX1cIiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fbGlua1wiPtCf0L7QtNGA0L7QsdC90LXQtTwvYT5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XFxuXFxcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHBsYWNlbWFyayA9IG5ldyB5bWFwcy5QbGFjZW1hcmsoZGF0YVtpXS5nZW8sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ19kb3QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6IGRhdGFbaV0uaW1nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZGF0YVtpXS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkxheW91dDogdHBsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uU2hhcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLTE1LjUsIC00Ml0sIFsxNS41LCAwXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlSWNvbk9uQmFsbG9vbk9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uQ2xvc2VCdXR0b246IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4gICAgICAgICAgICBwbGFjZW1hcmsuZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZS5nZXQoJ3RhcmdldCcpLnByb3BlcnRpZXMuZ2V0KCdpZHgnKTtcclxuICAgICAgICAgICAgICAgIG9wZW5CYWxsb29uKGluZGV4KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcC5zZXRCb3VuZHMobWFwLmdlb09iamVjdHMuZ2V0Qm91bmRzKCkpO1xyXG4gICAgICAgIG9wZW5CYWxsb29uKDEpO1xyXG4gICAgICAgIG1hcC5nZW9PYmplY3RzLmdldCgxKS5iYWxsb29uLm9wZW4oKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlbkJhbGxvb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICB0bXAucHJvcGVydGllcy5zZXQoJ2NsYXNzTmFtZScsICdfZG90Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHBsID0gbWFwLmdlb09iamVjdHMuZ2V0KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKHBsICYmICFwbC5iYWxsb29uLmlzT3BlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBwbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QgX3ByaW1hcnknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImJ1aWxkZXIuanMifQ==
