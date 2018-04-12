jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSlider();
        ymaps.ready(initMap);
    });

    function initSlider() {
        var $slider = $('.js-contacts-slider');
        var $scroller = $('.js-contacts-scroller');
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
            $scroller.animate({scrollLeft: offset[nextSlide]}, 500);
        });
    }

    function initMap() {
        var map, placemarks = [], $slider = $('.js-contacts-slider');

        $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            openBalloon(nextSlide);
        });

        map = new ymaps.Map("map", {
            center: [56.326887, 44.005986],
            zoom: 13,
            controls: []
        });
        map.behaviors.disable('scrollZoom');
        
        $('.js-map__zoom').on('click', function(){
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        })

        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark {{ properties.className }}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.content }}</span></div>'
                );

        $('.js-contacts-scroller__link').each(function () {
            var geo = $(this).data('geo');
            if (geo) {
                geo = geo.split(',');
                geo[0] = parseFloat(geo[0]);
                geo[1] = parseFloat(geo[1]);
                placemarks.push(geo)
            }
        });
        for (var i = 0, len = placemarks.length; i < len; i++) {
            var placemark = new ymaps.Placemark(placemarks[i],
                    {
                        className: '_dot',
                        slide: i,
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
        }
        openBalloon(0);

        function openBalloon(index) {
            var pl;
            for (var i = 0, len = placemarks.length; i < len; i++) {
                pl = map.geoObjects.get(i);
                pl.properties.set('className', '_dot');
            }
            pl = map.geoObjects.get(index);
            if (pl) {
                var coords = pl.geometry.getCoordinates();
                pl.properties.set('className', '_dot _primary');
                map.panTo(coords);
            }
        }
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb250YWN0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbGlkZXIoKTtcclxuICAgICAgICB5bWFwcy5yZWFkeShpbml0TWFwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtY29udGFjdHMtc2xpZGVyJyk7XHJcbiAgICAgICAgdmFyICRzY3JvbGxlciA9ICQoJy5qcy1jb250YWN0cy1zY3JvbGxlcicpO1xyXG4gICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gW107XHJcbiAgICAgICAgdmFyIHBhZGRpbmcgPSBwYXJzZUludCgkc2Nyb2xsZXIuY3NzKCdwYWRkaW5nLWxlZnQnKSkgKyAkc2Nyb2xsZXIub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICAkc2Nyb2xsZXIuZmluZCgnLmpzLWNvbnRhY3RzLXNjcm9sbGVyX19saW5rJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICBvZmZzZXQucHVzaCgkKHRoaXMpLm9mZnNldCgpLmxlZnQgLSBwYWRkaW5nKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzbGlkZXIub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICRzY3JvbGxlci5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHZhciAkYSA9ICQoJHNjcm9sbGVyLmZpbmQoJy5qcy1jb250YWN0cy1zY3JvbGxlcl9fbGluaycpW25leHRTbGlkZV0pO1xyXG4gICAgICAgICAgICAkYS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkc2Nyb2xsZXIuYW5pbWF0ZSh7c2Nyb2xsTGVmdDogb2Zmc2V0W25leHRTbGlkZV19LCA1MDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcbiAgICAgICAgdmFyIG1hcCwgcGxhY2VtYXJrcyA9IFtdLCAkc2xpZGVyID0gJCgnLmpzLWNvbnRhY3RzLXNsaWRlcicpO1xyXG5cclxuICAgICAgICAkc2xpZGVyLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICBvcGVuQmFsbG9vbihuZXh0U2xpZGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtYXAgPSBuZXcgeW1hcHMuTWFwKFwibWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMzI2ODg3LCA0NC4wMDU5ODZdLFxyXG4gICAgICAgICAgICB6b29tOiAxMyxcclxuICAgICAgICAgICAgY29udHJvbHM6IFtdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJCgnLmpzLW1hcF9fem9vbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciB6ID0gbWFwLmdldFpvb20oKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oYXNDbGFzcygnX2luJykgPyB6KysgOiB6LS07XHJcbiAgICAgICAgICAgIG1hcC5zZXRab29tKHosIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrWm9vbVJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB2YXIgdHBsID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwbGFjZW1hcmsge3sgcHJvcGVydGllcy5jbGFzc05hbWUgfX1cIj48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz48c3Bhbj57eyBwcm9wZXJ0aWVzLmNvbnRlbnQgfX08L3NwYW4+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLWNvbnRhY3RzLXNjcm9sbGVyX19saW5rJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnZW8gPSAkKHRoaXMpLmRhdGEoJ2dlbycpO1xyXG4gICAgICAgICAgICBpZiAoZ2VvKSB7XHJcbiAgICAgICAgICAgICAgICBnZW8gPSBnZW8uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgIGdlb1swXSA9IHBhcnNlRmxvYXQoZ2VvWzBdKTtcclxuICAgICAgICAgICAgICAgIGdlb1sxXSA9IHBhcnNlRmxvYXQoZ2VvWzFdKTtcclxuICAgICAgICAgICAgICAgIHBsYWNlbWFya3MucHVzaChnZW8pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGxhY2VtYXJrcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcGxhY2VtYXJrID0gbmV3IHltYXBzLlBsYWNlbWFyayhwbGFjZW1hcmtzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnX2RvdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlOiBpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uTGF5b3V0OiB0cGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1JlY3RhbmdsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKHBsYWNlbWFyayk7XHJcbiAgICAgICAgICAgIHBsYWNlbWFyay5ldmVudHMuYWRkKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBlLmdldCgndGFyZ2V0JykucHJvcGVydGllcy5nZXQoJ3NsaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpbmRleCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcGVuQmFsbG9vbigwKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb3BlbkJhbGxvb24oaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIHBsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGxhY2VtYXJrcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcGwgPSBtYXAuZ2VvT2JqZWN0cy5nZXQoaSk7XHJcbiAgICAgICAgICAgICAgICBwbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwbCA9IG1hcC5nZW9PYmplY3RzLmdldChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChwbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IHBsLmdlb21ldHJ5LmdldENvb3JkaW5hdGVzKCk7XHJcbiAgICAgICAgICAgICAgICBwbC5wcm9wZXJ0aWVzLnNldCgnY2xhc3NOYW1lJywgJ19kb3QgX3ByaW1hcnknKTtcclxuICAgICAgICAgICAgICAgIG1hcC5wYW5Ubyhjb29yZHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJjb250YWN0cy5qcyJ9
