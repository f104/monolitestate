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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmFseXRpYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRDaGFydCgpO1xyXG4gICAgICAgIGluaXRTbGlkZXIoKTtcclxuICAgICAgICBpbml0VG9vbHRpcCgpO1xyXG4gICAgICAgIHltYXBzLnJlYWR5KGluaXRNYXApO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaW5pdFRvb2x0aXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpbml0VG9vbHRpcCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbGlkZXIoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFuYWx5dGljX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiA2LFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogNFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUb29sdGlwKCkge1xyXG4gICAgICAgIHZhciAkdCwgdGltZXIsIGxpc3RPZmZzZXQgPSAkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdCcpLm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3RfX2l0ZW0gaW1nJykub2ZmKCdtb3VzZWVudGVyJyk7XHJcbiAgICAgICAgJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3RfX2l0ZW0gaW1nJykub2ZmKCdtb3VzZWxlYXZlJyk7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3RfX2l0ZW0gaW1nJykub24oJ21vdXNlZW50ZXInLCBlbnRlcik7XHJcbiAgICAgICAgICAgICQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0X19pdGVtIGltZycpLm9uKCdtb3VzZWxlYXZlJywgbGVhdmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlbnRlcigpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcCA9ICQoX3RoaXMpLnBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgJHQgPSAkcC5maW5kKCcuYW5hbHl0aWMtY2xpZW50c19fdG9vbHRpcCcpLmNsb25lKCkuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAnbGVmdCc6ICRwLm9mZnNldCgpLmxlZnQgLSBsaXN0T2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICd0cmFuc2Zvcm0nOiAndHJhbnNsYXRlWCgtNDBweCknLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkdC5hcHBlbmRUbygkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdCcpKTtcclxuICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gbGVhdmUoKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgJHQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAkdC5mYWRlT3V0KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdENoYXJ0KCkge1xyXG4gICAgICAgIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udENvbG9yID0gJyMxMzEzMTMnO1xyXG4gICAgICAgIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udEZhbWlseSA9ICdMYXRvLCBzYW5zLXNlcmlmJztcclxuICAgICAgICB2YXIgY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFydFwiKTtcclxuICAgICAgICBpZiAoIWN0eClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBteUNoYXJ0ID0gbmV3IENoYXJ0KGN0eCwge1xyXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogW1wiMjAxM1wiLCBcIjIwMTRcIiwgXCIyMDE1XCIsIFwiMjAxNlwiLCBcIjIwMTdcIiwgXCIyMDE4XCJdLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnMS3QutC+0LzQvdCw0YLQvdGL0LUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzc1MDAwLCA3MTAwMCwgNjgwMDAsIDczMDAwLCA3OTAwMCwgNzEwMDBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjYTZkODI0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjYTZkODI0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcyLdC60L7QvNC90LDRgtC90YvQtScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbNjUwMDAsIDYwMDAwLCA2NjAwMCwgNjUwMDAsIDU4MDAwLCA2ODAwMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZWE2MTgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWE2MTgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogM1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzMt0LrQvtC80L3QsNGC0L3Ri9C1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFs2MzAwMCwgNTgwMDAsIDQ5MDAwLCA2NjAwMCwgNTAwMDAsIDY0MDAwXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2VhNWY4MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI2VhNWY4MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnNC3QutC+0LzQvdCw0YLQvdGL0LUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzQ1MDAwLCA0NzAwMCwgNDMwMDAsIDQyMDAwLCA0OTAwMCwgMzgwMDBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDNhN2VkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNDNhN2VkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ25lYXJlc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdpbmRleCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xyXG4gICAgICAgIHZhciBtYXA7XHJcblxyXG4gICAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IFs1Ni4zMDE5NjcsIDQ0LjAxMTk5M10sXHJcbiAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICBjb250cm9sczogWyd6b29tQ29udHJvbCddXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcblxyXG4gICAgICAgIHZhciBteVBvbHlnb24gPSBuZXcgeW1hcHMuUG9seWdvbihbXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIFs1Ni4yODcwNDAsIDQzLjk5NjUzNV0sXHJcbiAgICAgICAgICAgICAgICBbNTYuMjkxMjQwLCA0NC4wMzUzMzBdLFxyXG4gICAgICAgICAgICAgICAgWzU2LjI3NzY4MiwgNDQuMDI4ODA3XSxcclxuICAgICAgICAgICAgICAgIFs1Ni4yNjI3ODEsIDQ0LjAwNzE3OF0sXHJcbiAgICAgICAgICAgICAgICBbNTYuMjczODYyLCA0My45OTM0NDVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICBdLCB7XHJcbiAgICAgICAgICAgIGhpbnRDb250ZW50OiBcItCp0ZHQu9C+0LrQvtCy0YHQutC40Lkg0KXRg9GC0L7RgFwiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBmaWxsQ29sb3I6ICcjZmY5ZDAwJyxcclxuICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgICAgICAgb3BhY2l0eTogMC43LFxyXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuZ2VvT2JqZWN0cy5hZGQobXlQb2x5Z29uKTtcclxuXHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImFuYWx5dGljLmpzIn0=
