jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSlider();
        ymaps.ready(initMap);
    });

    function initSlider() {
        var $slider = $('.js-contacts-slider'),
            $scroller = $('.js-contacts-scroller');
        $slider.slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md - 1,
                    settings: {
                        dots: false
                    }
                }
            ]
        });
        var offset = [];
        var padding = parseInt($scroller.css('padding-left')) + $scroller.offset().left;
        $scroller.find('.js-contacts-scroller__link').each(function (i) {
            offset.push($(this).offset().left - padding);
            $(this).on('click', function (e) {
                e.preventDefault();
                $slider.slick('slickGoTo', i);
            });
        });
        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            $scroller.find('._active').removeClass('_active');
            var $a = $($scroller.find('.js-contacts-scroller__link')[nextSlide]);
            $a.addClass('_active');
            if (offset.length > 3) {
                $scroller.animate({scrollLeft: offset[nextSlide]}, 500);
            }
        });
    }

    function initMap() {
        var map, geocode = [], placemarks = [], $slider = $('.js-contacts-slider');

        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            openBalloon(nextSlide);
        });

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
        });

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                );
        // чтобы открыть первый балун после завершения всех геокодеров
        var len = $('.js-contacts-scroller__link').length;
        $('.js-contacts-scroller__link').each(function (index) {
            var geo = $(this).data('geo');
            if (geo) {
                ymaps.geocode(geo, {
                    results: 1
                }).then(function (res) {
                    var firstGeoObject = res.geoObjects.get(0),
                            coords = firstGeoObject.geometry.getCoordinates();
                    var placemark = new ymaps.Placemark(coords,
                            {
                                className: '_dot',
                                slide: index
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
                    placemark.events.add('click', function (e) {
                        var index = e.get('target').properties.get('slide');
                        $slider.slick('slickGoTo', index);
                    });
                    placemarks.push(placemark);
                    if (index == len - 1) {
                        openBalloon(0);
                    }
                });
            }
        });
        
        function openBalloon(index) {
            map.geoObjects.each(function (el) {
                var i = el.properties.get('slide');
                if (i == index) {
                    var coords = el.geometry.getCoordinates();
                    el.properties.set('className', '_dot _primary');
                    map.panTo(coords);
                } else {
                    el.properties.set('className', '_dot');
                }
            });
        }

    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb250YWN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbGlkZXIoKTtcclxuICAgICAgICB5bWFwcy5yZWFkeShpbml0TWFwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtY29udGFjdHMtc2xpZGVyJyksXHJcbiAgICAgICAgICAgICRzY3JvbGxlciA9ICQoJy5qcy1jb250YWN0cy1zY3JvbGxlcicpO1xyXG4gICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gW107XHJcbiAgICAgICAgdmFyIHBhZGRpbmcgPSBwYXJzZUludCgkc2Nyb2xsZXIuY3NzKCdwYWRkaW5nLWxlZnQnKSkgKyAkc2Nyb2xsZXIub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICAkc2Nyb2xsZXIuZmluZCgnLmpzLWNvbnRhY3RzLXNjcm9sbGVyX19saW5rJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICBvZmZzZXQucHVzaCgkKHRoaXMpLm9mZnNldCgpLmxlZnQgLSBwYWRkaW5nKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzbGlkZXIub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICRzY3JvbGxlci5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHZhciAkYSA9ICQoJHNjcm9sbGVyLmZpbmQoJy5qcy1jb250YWN0cy1zY3JvbGxlcl9fbGluaycpW25leHRTbGlkZV0pO1xyXG4gICAgICAgICAgICAkYS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2V0Lmxlbmd0aCA+IDMpIHtcclxuICAgICAgICAgICAgICAgICRzY3JvbGxlci5hbmltYXRlKHtzY3JvbGxMZWZ0OiBvZmZzZXRbbmV4dFNsaWRlXX0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIHZhciBtYXAsIGdlb2NvZGUgPSBbXSwgcGxhY2VtYXJrcyA9IFtdLCAkc2xpZGVyID0gJCgnLmpzLWNvbnRhY3RzLXNsaWRlcicpO1xyXG5cclxuICAgICAgICAkc2xpZGVyLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICBvcGVuQmFsbG9vbihuZXh0U2xpZGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtYXAgPSBuZXcgeW1hcHMuTWFwKFwibWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMzI2ODg3LCA0NC4wMDU5ODZdLFxyXG4gICAgICAgICAgICB6b29tOiAxMyxcclxuICAgICAgICAgICAgY29udHJvbHM6IFtdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcblxyXG4gICAgICAgICQoJy5qcy1tYXBfX3pvb20nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnX2luJykgPyB6KysgOiB6LS07XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKHosIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIHt7IHByb3BlcnRpZXMuY2xhc3NOYW1lIH19XCI+PHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCA4LjIwMiAxMS4xMTNcIiBjbGFzcz1cIlwiPjxwYXRoIGQ9XCJNNC4xMDEgMTEuMTEzYzIuNzM0LTMuMTIgNC4xMDEtNS40NDIgNC4xMDEtNi45NjhDOC4yMDIgMS44NTUgNi4zNjYgMCA0LjEwMSAwIDEuODM2IDAgMCAxLjg1NiAwIDQuMTQ1YzAgMS41MjYgMS4zNjcgMy44NDkgNC4xMDEgNi45Njh6XCIgZmlsbD1cIiNmZmZcIj48L3BhdGg+PC9zdmc+PHNwYW4+e3sgcHJvcGVydGllcy5jb250ZW50IH19PC9zcGFuPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgLy8g0YfRgtC+0LHRiyDQvtGC0LrRgNGL0YLRjCDQv9C10YDQstGL0Lkg0LHQsNC70YPQvSDQv9C+0YHQu9C1INC30LDQstC10YDRiNC10L3QuNGPINCy0YHQtdGFINCz0LXQvtC60L7QtNC10YDQvtCyXHJcbiAgICAgICAgdmFyIGxlbiA9ICQoJy5qcy1jb250YWN0cy1zY3JvbGxlcl9fbGluaycpLmxlbmd0aDtcclxuICAgICAgICAkKCcuanMtY29udGFjdHMtc2Nyb2xsZXJfX2xpbmsnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgZ2VvID0gJCh0aGlzKS5kYXRhKCdnZW8nKTtcclxuICAgICAgICAgICAgaWYgKGdlbykge1xyXG4gICAgICAgICAgICAgICAgeW1hcHMuZ2VvY29kZShnZW8sIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiAxXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZmlyc3RHZW9PYmplY3QgPSByZXMuZ2VvT2JqZWN0cy5nZXQoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMgPSBmaXJzdEdlb09iamVjdC5nZW9tZXRyeS5nZXRDb29yZGluYXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGFjZW1hcmsgPSBuZXcgeW1hcHMuUGxhY2VtYXJrKGNvb3JkcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdfZG90JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbGlkZTogaW5kZXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkxheW91dDogdHBsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1hcmsuZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBlLmdldCgndGFyZ2V0JykucHJvcGVydGllcy5nZXQoJ3NsaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzbGlkZXIuc2xpY2soJ3NsaWNrR29UbycsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1hcmtzLnB1c2gocGxhY2VtYXJrKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT0gbGVuIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuQmFsbG9vbigwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIG9wZW5CYWxsb29uKGluZGV4KSB7XHJcbiAgICAgICAgICAgIG1hcC5nZW9PYmplY3RzLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSA9IGVsLnByb3BlcnRpZXMuZ2V0KCdzbGlkZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGkgPT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gZWwuZ2VvbWV0cnkuZ2V0Q29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBlbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QgX3ByaW1hcnknKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXAucGFuVG8oY29vcmRzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWwucHJvcGVydGllcy5zZXQoJ2NsYXNzTmFtZScsICdfZG90Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImNvbnRhY3RzLmpzIn0=
