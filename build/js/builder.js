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
        
        // может придти json  с пустыми placemarks
        var pmFound = false;
        for (var j = 0, len1 = app.builderMapData.length; j < len1; j++) {
            if (app.builderMapData[j].placemarks.length) {
                pmFound = true;
                break;
            }
        }
        if (!pmFound) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidWlsZGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXBwLmJ1aWxkZXJNYXBEYXRhID09ICd1bmRlZmluZWQnIHx8IGFwcC5idWlsZGVyTWFwRGF0YS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgJCgnLmJ1aWxkZXItbWFwJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g0LzQvtC20LXRgiDQv9GA0LjQtNGC0LgganNvbiAg0YEg0L/Rg9GB0YLRi9C80LggcGxhY2VtYXJrc1xyXG4gICAgICAgIHZhciBwbUZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDAsIGxlbjEgPSBhcHAuYnVpbGRlck1hcERhdGEubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChhcHAuYnVpbGRlck1hcERhdGFbal0ucGxhY2VtYXJrcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHBtRm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFwbUZvdW5kKSB7XHJcbiAgICAgICAgICAgICQoJy5idWlsZGVyLW1hcCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbWFwO1xyXG5cclxuICAgICAgICBtYXAgPSBuZXcgeW1hcHMuTWFwKFwibWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMzI2ODg3LCA0NC4wMDU5ODZdLFxyXG4gICAgICAgICAgICB6b29tOiAxMyxcclxuICAgICAgICAgICAgY29udHJvbHM6IFtdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcblxyXG4gICAgICAgIHZhciB0cGwgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayB7eyBwcm9wZXJ0aWVzLmNsYXNzTmFtZSB9fVwiPjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPjxzcGFuPjwvc3Bhbj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgdHBsQmFsbG9vbiA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtYXBfX2JhbGxvb24gX29iamVjdFwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWFwX19iYWxsb29uX19sb2dvXCI+PGltZyBzcmM9XCJ7eyBwcm9wZXJ0aWVzLmltZyB9fVwiPjwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fY29udGVudFwiPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1hcF9fYmFsbG9vbl9fdGl0bGVcIj57eyBwcm9wZXJ0aWVzLnRpdGxlIH19PC9zcGFuPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiL3t7IHByb3BlcnRpZXMubGluayB9fVwiIGNsYXNzPVwibWFwX19iYWxsb29uX19saW5rXCI+0J/QvtC00YDQvtCx0L3QtdC1PC9hPlxcblxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cXG5cXFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAodmFyIGogPSAwLCBsZW4xID0gYXBwLmJ1aWxkZXJNYXBEYXRhLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXBwLmJ1aWxkZXJNYXBEYXRhW2pdLnBsYWNlbWFya3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwbGFjZW1hcmsgPSBuZXcgeW1hcHMuUGxhY2VtYXJrKGFwcC5idWlsZGVyTWFwRGF0YVtqXS5wbGFjZW1hcmtzW2ldLmNvb3JkcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnX2RvdCBfcHJpbWFyeScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWc6IGFwcC5idWlsZGVyTWFwRGF0YVtqXS5pbWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYXBwLmJ1aWxkZXJNYXBEYXRhW2pdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluazogYXBwLmJ1aWxkZXJNYXBEYXRhW2pdLmxpbmssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChwbGFjZW1hcmspO1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtYXJrLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5lYWNoKGZ1bmN0aW9uIChwbCwgaSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX2RvdCBfcHJpbWFyeScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbCA9IGUuZ2V0KCd0YXJnZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICBwbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcC5zZXRCb3VuZHMobWFwLmdlb09iamVjdHMuZ2V0Qm91bmRzKCksIHtcclxuICAgICAgICAgICAgY2hlY2tab29tUmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgIHpvb21NYXJnaW46IDUwLFxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobWFwLmdlb09iamVjdHMuZ2V0TGVuZ3RoKCkgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH0sIHRoaXMpO1xyXG5cclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgeiA9IG1hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICBtYXAuc2V0Wm9vbSh6LCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJidWlsZGVyLmpzIn0=
