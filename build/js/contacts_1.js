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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb250YWN0c18xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaW5pdFNsaWRlcigpO1xyXG4gICAgICAgIHltYXBzLnJlYWR5KGluaXRNYXApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNsaWRlcigpIHtcclxuICAgICAgICB2YXIgJHNsaWRlciA9ICQoJy5qcy1jb250YWN0cy1zbGlkZXInKTtcclxuICAgICAgICB2YXIgJHNjcm9sbGVyID0gJCgnLmpzLWNvbnRhY3RzLXNjcm9sbGVyJyk7XHJcbiAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBtb2JpbGVGaXJzdDogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kIC0gMSxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSBbXTtcclxuICAgICAgICB2YXIgcGFkZGluZyA9IHBhcnNlSW50KCRzY3JvbGxlci5jc3MoJ3BhZGRpbmctbGVmdCcpKSArICRzY3JvbGxlci5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICRzY3JvbGxlci5maW5kKCcuanMtY29udGFjdHMtc2Nyb2xsZXJfX2xpbmsnKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgIG9mZnNldC5wdXNoKCQodGhpcykub2Zmc2V0KCkubGVmdCAtIHBhZGRpbmcpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWRlci5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgJHNjcm9sbGVyLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgdmFyICRhID0gJCgkc2Nyb2xsZXIuZmluZCgnLmpzLWNvbnRhY3RzLXNjcm9sbGVyX19saW5rJylbbmV4dFNsaWRlXSk7XHJcbiAgICAgICAgICAgICRhLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICRzY3JvbGxlci5hbmltYXRlKHtzY3JvbGxMZWZ0OiBvZmZzZXRbbmV4dFNsaWRlXX0sIDUwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICB2YXIgbWFwLCBwbGFjZW1hcmtzID0gW10sICRzbGlkZXIgPSAkKCcuanMtY29udGFjdHMtc2xpZGVyJyk7XHJcblxyXG4gICAgICAgICRzbGlkZXIub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIG9wZW5CYWxsb29uKG5leHRTbGlkZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IFs1Ni4zMjY4ODcsIDQ0LjAwNTk4Nl0sXHJcbiAgICAgICAgICAgIHpvb206IDEzLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuICAgICAgICBcclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHogPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhhc0NsYXNzKCdfaW4nKSA/IHorKyA6IHotLTtcclxuICAgICAgICAgICAgbWFwLnNldFpvb20oeiwge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tab29tUmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHZhciB0cGwgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayB7eyBwcm9wZXJ0aWVzLmNsYXNzTmFtZSB9fVwiPjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPjxzcGFuPnt7IHByb3BlcnRpZXMuY29udGVudCB9fTwvc3Bhbj48L2Rpdj4nXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAkKCcuanMtY29udGFjdHMtc2Nyb2xsZXJfX2xpbmsnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGdlbyA9ICQodGhpcykuZGF0YSgnZ2VvJyk7XHJcbiAgICAgICAgICAgIGlmIChnZW8pIHtcclxuICAgICAgICAgICAgICAgIGdlbyA9IGdlby5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgZ2VvWzBdID0gcGFyc2VGbG9hdChnZW9bMF0pO1xyXG4gICAgICAgICAgICAgICAgZ2VvWzFdID0gcGFyc2VGbG9hdChnZW9bMV0pO1xyXG4gICAgICAgICAgICAgICAgcGxhY2VtYXJrcy5wdXNoKGdlbylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwbGFjZW1hcmtzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGFjZW1hcmsgPSBuZXcgeW1hcHMuUGxhY2VtYXJrKHBsYWNlbWFya3NbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdfZG90JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGU6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25MYXlvdXQ6IHRwbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblNoYXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUmVjdGFuZ2xlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWy0xNS41LCAtNDJdLCBbMTUuNSwgMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQocGxhY2VtYXJrKTtcclxuICAgICAgICAgICAgcGxhY2VtYXJrLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGUuZ2V0KCd0YXJnZXQnKS5wcm9wZXJ0aWVzLmdldCgnc2xpZGUnKTtcclxuICAgICAgICAgICAgICAgICRzbGlkZXIuc2xpY2soJ3NsaWNrR29UbycsIGluZGV4KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wZW5CYWxsb29uKDApO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBvcGVuQmFsbG9vbihpbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgcGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwbGFjZW1hcmtzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBwbCA9IG1hcC5nZW9PYmplY3RzLmdldChpKTtcclxuICAgICAgICAgICAgICAgIHBsLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX2RvdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBsID0gbWFwLmdlb09iamVjdHMuZ2V0KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKHBsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gcGwuZ2VvbWV0cnkuZ2V0Q29vcmRpbmF0ZXMoKTtcclxuICAgICAgICAgICAgICAgIHBsLnByb3BlcnRpZXMuc2V0KCdjbGFzc05hbWUnLCAnX2RvdCBfcHJpbWFyeScpO1xyXG4gICAgICAgICAgICAgICAgbWFwLnBhblRvKGNvb3Jkcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImNvbnRhY3RzXzEuanMifQ==
