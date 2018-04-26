jQuery(function () {
    "use strict";

    $(document).ready(function () {
        ymaps.ready(initMap);
    });

    function initMap() {
        var map, geo = [[56.314953, 43.999951], [56.323889, 43.920087], [56.342388, 44.089517], [56.288103, 43.928842]];

        map = new ymaps.Map("map", {
            center: [56.25471469870076, 43.947964454589815],
            zoom: 12,
            controls: []
        });
        map.behaviors.disable('scrollZoom');

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                ),
                cnt = $('.onmap__content').html(),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="onmap__content">' + cnt + '</div>', {
                            build: function () {
                                tplBalloon.superclass.build.call(this);
                                $('.onmap__list .scrollbar-outer').scrollbar();
                            }
                        });
        for (var i = 0, len = geo.length; i < len; i++) {
            var placemark = new ymaps.Placemark(geo[i],
                    {
                        className: '_dot',
                        idx: i,
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
        if ($(window).outerWidth() > appConfig.breakpoint.md) {
            openBalloon(0);
            map.geoObjects.get(0).balloon.open();
        }

        function openBalloon(index) {
            for (var i = 0, len = geo.length; i < len; i++) {
                var tmp = map.geoObjects.get(i);
                tmp.properties.set('className', '_dot');
            }
            var pl = map.geoObjects.get(index);
            if (pl && !pl.balloon.isOpen()) {
                var coords = pl.geometry.getCoordinates();
                pl.properties.set('className', '_dot _primary');
//                map.panTo(coords);
            }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvbm1hcF8xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgeW1hcHMucmVhZHkoaW5pdE1hcCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIHZhciBtYXAsIGdlbyA9IFtbNTYuMzE0OTUzLCA0My45OTk5NTFdLCBbNTYuMzIzODg5LCA0My45MjAwODddLCBbNTYuMzQyMzg4LCA0NC4wODk1MTddLCBbNTYuMjg4MTAzLCA0My45Mjg4NDJdXTtcclxuXHJcbiAgICAgICAgbWFwID0gbmV3IHltYXBzLk1hcChcIm1hcFwiLCB7XHJcbiAgICAgICAgICAgIGNlbnRlcjogWzU2LjI1NDcxNDY5ODcwMDc2LCA0My45NDc5NjQ0NTQ1ODk4MTVdLFxyXG4gICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgY29udHJvbHM6IFtdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcblxyXG4gICAgICAgIHZhciB0cGwgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayB7eyBwcm9wZXJ0aWVzLmNsYXNzTmFtZSB9fVwiPjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPjxzcGFuPnt7IHByb3BlcnRpZXMuY29udGVudCB9fTwvc3Bhbj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgY250ID0gJCgnLm9ubWFwX19jb250ZW50JykuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgdHBsQmFsbG9vbiA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJvbm1hcF9fY29udGVudFwiPicgKyBjbnQgKyAnPC9kaXY+Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cGxCYWxsb29uLnN1cGVyY2xhc3MuYnVpbGQuY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcub25tYXBfX2xpc3QgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZ2VvLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGFjZW1hcmsgPSBuZXcgeW1hcHMuUGxhY2VtYXJrKGdlb1tpXSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ19kb3QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUljb25PbkJhbGxvb25PcGVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkxheW91dDogdHBsQmFsbG9vbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFsbG9vbkNsb3NlQnV0dG9uOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICAgICAgcGxhY2VtYXJrLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGUuZ2V0KCd0YXJnZXQnKS5wcm9wZXJ0aWVzLmdldCgnaWR4Jyk7XHJcbiAgICAgICAgICAgICAgICBvcGVuQmFsbG9vbihpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgIG9wZW5CYWxsb29uKDApO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5nZXQoMCkuYmFsbG9vbi5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcGVuQmFsbG9vbihpbmRleCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZ2VvLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gbWFwLmdlb09iamVjdHMuZ2V0KGkpO1xyXG4gICAgICAgICAgICAgICAgdG1wLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX2RvdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBwbCA9IG1hcC5nZW9PYmplY3RzLmdldChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChwbCAmJiAhcGwuYmFsbG9vbi5pc09wZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IHBsLmdlb21ldHJ5LmdldENvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgICAgICAgICBwbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QgX3ByaW1hcnknKTtcclxuLy8gICAgICAgICAgICAgICAgbWFwLnBhblRvKGNvb3Jkcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJy5qcy1tYXBfX3pvb20nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnX2luJykgPyB6KysgOiB6LS07XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKHosIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pOyJdLCJmaWxlIjoib25tYXBfMS5qcyJ9
