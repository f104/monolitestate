jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initChart();
        initSlider();
        initTooltip();
        ymaps.ready(initMap);

        $(window).on('resize', function () {
            initTooltip();
        });
        $('.js-tabs').each(function (index, elem) {
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                initTooltip();
            });
        });
    });

    function initSlider() {
        $('.js-analytic__slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 6,
            slidesToScroll: 6,
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.lg,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 4
                    }
                },
                {
                    breakpoint: appConfig.breakpoint.md,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                }
            ]
        });
    }

    function initTooltip() {
        if (!$('.analytic-clients__list').length) return;
        var $t, timer, listOffset = $('.analytic-clients__list').offset().left;
        $('.analytic-clients__list__item img').off('mouseenter');
        $('.analytic-clients__list__item img').off('mouseleave');
        if ($(window).outerWidth() >= appConfig.breakpoint.lg) {
            $('.analytic-clients__list__item img').on('mouseenter', enter);
            $('.analytic-clients__list__item img').on('mouseleave', leave);
        }
        function enter() {
            var _this = this;
            timer = setTimeout(function () {
                var $p = $(_this).parent();
                $t = $p.find('.analytic-clients__tooltip').clone().css({
                    'left': $p.offset().left - listOffset,
                    'transform': 'translateX(-40px)',
                });
                $t.appendTo($('.analytic-clients__list'));
            }, 200);
        }
        function leave() {
            clearTimeout(timer);
            if (typeof $t !== 'undefined') {
                $t.fadeOut().remove();
            }
        }
    }

    function initChart() {
        Chart.defaults.global.defaultFontColor = '#131313';
        Chart.defaults.global.defaultFontFamily = 'Lato, sans-serif';
        var ctx = document.getElementById("chart");
        if (!ctx)
            return;
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["2013", "2014", "2015", "2016", "2017", "2018"],
                datasets: [
                    {
                        label: '1-комнатные',
                        fill: false,
                        data: [75000, 71000, 68000, 73000, 79000, 71000],
                        backgroundColor: '#a6d824',
                        borderColor: '#a6d824',
                        borderWidth: 3
                    },
                    {
                        label: '2-комнатные',
                        fill: false,
                        data: [65000, 60000, 66000, 65000, 58000, 68000],
                        backgroundColor: '#fea618',
                        borderColor: '#fea618',
                        borderWidth: 3
                    },
                    {
                        label: '3-комнатные',
                        fill: false,
                        data: [63000, 58000, 49000, 66000, 50000, 64000],
                        backgroundColor: '#ea5f82',
                        borderColor: '#ea5f82',
                        borderWidth: 3
                    },
                    {
                        label: '4-комнатные',
                        fill: false,
                        data: [45000, 47000, 43000, 42000, 49000, 38000],
                        backgroundColor: '#43a7ed',
                        borderColor: '#43a7ed',
                        borderWidth: 3
                    }
                ]
            },
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    position: 'nearest',
                    mode: 'index',
                }
            }
        });
    }

    function initMap() {
        if (!$('#map').length) return;
        
        var map;

        map = new ymaps.Map("map", {
            center: [56.301967, 44.011993],
            zoom: 12,
            controls: ['zoomControl']
        });
        map.behaviors.disable('scrollZoom');

        var myPolygon = new ymaps.Polygon([
            [
                [56.287040, 43.996535],
                [56.291240, 44.035330],
                [56.277682, 44.028807],
                [56.262781, 44.007178],
                [56.273862, 43.993445]
            ]
        ], {
            hintContent: "Щёлоковский Хутор"
        }, {
            fillColor: '#ff9d00',
            strokeColor: '#ffffff',
            opacity: 0.7,
            strokeWidth: 2,
        });
        map.geoObjects.add(myPolygon);

    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmFseXRpYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRDaGFydCgpO1xyXG4gICAgICAgIGluaXRTbGlkZXIoKTtcclxuICAgICAgICBpbml0VG9vbHRpcCgpO1xyXG4gICAgICAgIHltYXBzLnJlYWR5KGluaXRNYXApO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaW5pdFRvb2x0aXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpbml0VG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbGlkZXIoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFuYWx5dGljX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiA2LFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogNFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUb29sdGlwKCkge1xyXG4gICAgICAgIGlmICghJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3QnKS5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICB2YXIgJHQsIHRpbWVyLCBsaXN0T2Zmc2V0ID0gJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3QnKS5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0X19pdGVtIGltZycpLm9mZignbW91c2VlbnRlcicpO1xyXG4gICAgICAgICQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0X19pdGVtIGltZycpLm9mZignbW91c2VsZWF2ZScpO1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0X19pdGVtIGltZycpLm9uKCdtb3VzZWVudGVyJywgZW50ZXIpO1xyXG4gICAgICAgICAgICAkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdF9faXRlbSBpbWcnKS5vbignbW91c2VsZWF2ZScsIGxlYXZlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZW50ZXIoKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHAgPSAkKF90aGlzKS5wYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgICR0ID0gJHAuZmluZCgnLmFuYWx5dGljLWNsaWVudHNfX3Rvb2x0aXAnKS5jbG9uZSgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgJ2xlZnQnOiAkcC5vZmZzZXQoKS5sZWZ0IC0gbGlzdE9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICAndHJhbnNmb3JtJzogJ3RyYW5zbGF0ZVgoLTQwcHgpJyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHQuYXBwZW5kVG8oJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3QnKSk7XHJcbiAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGxlYXZlKCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mICR0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgJHQuZmFkZU91dCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRDaGFydCgpIHtcclxuICAgICAgICBDaGFydC5kZWZhdWx0cy5nbG9iYWwuZGVmYXVsdEZvbnRDb2xvciA9ICcjMTMxMzEzJztcclxuICAgICAgICBDaGFydC5kZWZhdWx0cy5nbG9iYWwuZGVmYXVsdEZvbnRGYW1pbHkgPSAnTGF0bywgc2Fucy1zZXJpZic7XHJcbiAgICAgICAgdmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcnRcIik7XHJcbiAgICAgICAgaWYgKCFjdHgpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB2YXIgbXlDaGFydCA9IG5ldyBDaGFydChjdHgsIHtcclxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbHM6IFtcIjIwMTNcIiwgXCIyMDE0XCIsIFwiMjAxNVwiLCBcIjIwMTZcIiwgXCIyMDE3XCIsIFwiMjAxOFwiXSxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzEt0LrQvtC80L3QsNGC0L3Ri9C1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFs3NTAwMCwgNzEwMDAsIDY4MDAwLCA3MzAwMCwgNzkwMDAsIDcxMDAwXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2E2ZDgyNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI2E2ZDgyNCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnMi3QutC+0LzQvdCw0YLQvdGL0LUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzY1MDAwLCA2MDAwMCwgNjYwMDAsIDY1MDAwLCA1ODAwMCwgNjgwMDBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmVhNjE4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZmVhNjE4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICczLdC60L7QvNC90LDRgtC90YvQtScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbNjMwMDAsIDU4MDAwLCA0OTAwMCwgNjYwMDAsIDUwMDAwLCA2NDAwMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlYTVmODInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNlYTVmODInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogM1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzQt0LrQvtC80L3QsNGC0L3Ri9C1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFs0NTAwMCwgNDcwMDAsIDQzMDAwLCA0MjAwMCwgNDkwMDAsIDM4MDAwXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzQzYTdlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzQzYTdlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRvb2x0aXBzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICduZWFyZXN0JyxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAnaW5kZXgnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1hcCgpIHtcclxuICAgICAgICBpZiAoISQoJyNtYXAnKS5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgbWFwO1xyXG5cclxuICAgICAgICBtYXAgPSBuZXcgeW1hcHMuTWFwKFwibWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMzAxOTY3LCA0NC4wMTE5OTNdLFxyXG4gICAgICAgICAgICB6b29tOiAxMixcclxuICAgICAgICAgICAgY29udHJvbHM6IFsnem9vbUNvbnRyb2wnXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xyXG5cclxuICAgICAgICB2YXIgbXlQb2x5Z29uID0gbmV3IHltYXBzLlBvbHlnb24oW1xyXG4gICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICBbNTYuMjg3MDQwLCA0My45OTY1MzVdLFxyXG4gICAgICAgICAgICAgICAgWzU2LjI5MTI0MCwgNDQuMDM1MzMwXSxcclxuICAgICAgICAgICAgICAgIFs1Ni4yNzc2ODIsIDQ0LjAyODgwN10sXHJcbiAgICAgICAgICAgICAgICBbNTYuMjYyNzgxLCA0NC4wMDcxNzhdLFxyXG4gICAgICAgICAgICAgICAgWzU2LjI3Mzg2MiwgNDMuOTkzNDQ1XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgXSwge1xyXG4gICAgICAgICAgICBoaW50Q29udGVudDogXCLQqdGR0LvQvtC60L7QstGB0LrQuNC5INCl0YPRgtC+0YBcIlxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgZmlsbENvbG9yOiAnI2ZmOWQwMCcsXHJcbiAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNyxcclxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKG15UG9seWdvbik7XHJcblxyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJhbmFseXRpYy5qcyJ9
