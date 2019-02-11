jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initChart();
        initSlider();
        initTooltip();
        if ($('#map').length) {
            ymaps.ready(initMap);
        }

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
        if (!$('.analytic-clients__list').length)
            return;
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
        if (typeof Chart == 'undefined')
            return;
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
                    intersect: false,
                    position: 'average',
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
            fillColor: 'violet',
            strokeColor: '#ffffff',
            opacity: 0.7,
            strokeWidth: 2,
        });
        map.geoObjects.add(myPolygon);

    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmFseXRpYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJqUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRDaGFydCgpO1xyXG4gICAgICAgIGluaXRTbGlkZXIoKTtcclxuICAgICAgICBpbml0VG9vbHRpcCgpO1xyXG4gICAgICAgIGlmICgkKCcjbWFwJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHltYXBzLnJlYWR5KGluaXRNYXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGluaXRUb29sdGlwKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXRhYnMnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICAkKGVsZW0pLmJpbmQoJ2Vhc3l0YWJzOmFmdGVyJywgZnVuY3Rpb24gKGV2ZW50LCAkY2xpY2tlZCwgJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgaW5pdFRvb2x0aXAoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2xpZGVyKCkge1xyXG4gICAgICAgICQoJy5qcy1hbmFseXRpY19fc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA2LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogNixcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50LmxnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VG9vbHRpcCgpIHtcclxuICAgICAgICBpZiAoISQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0JykubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdmFyICR0LCB0aW1lciwgbGlzdE9mZnNldCA9ICQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0Jykub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICAkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdF9faXRlbSBpbWcnKS5vZmYoJ21vdXNlZW50ZXInKTtcclxuICAgICAgICAkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdF9faXRlbSBpbWcnKS5vZmYoJ21vdXNlbGVhdmUnKTtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuYW5hbHl0aWMtY2xpZW50c19fbGlzdF9faXRlbSBpbWcnKS5vbignbW91c2VlbnRlcicsIGVudGVyKTtcclxuICAgICAgICAgICAgJCgnLmFuYWx5dGljLWNsaWVudHNfX2xpc3RfX2l0ZW0gaW1nJykub24oJ21vdXNlbGVhdmUnLCBsZWF2ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVudGVyKCkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwID0gJChfdGhpcykucGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAkdCA9ICRwLmZpbmQoJy5hbmFseXRpYy1jbGllbnRzX190b29sdGlwJykuY2xvbmUoKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICdsZWZ0JzogJHAub2Zmc2V0KCkubGVmdCAtIGxpc3RPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3RyYW5zZm9ybSc6ICd0cmFuc2xhdGVYKC00MHB4KScsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICR0LmFwcGVuZFRvKCQoJy5hbmFseXRpYy1jbGllbnRzX19saXN0JykpO1xyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBsZWF2ZSgpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAkdCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICR0LmZhZGVPdXQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q2hhcnQoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBDaGFydCA9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udENvbG9yID0gJyMxMzEzMTMnO1xyXG4gICAgICAgIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udEZhbWlseSA9ICdMYXRvLCBzYW5zLXNlcmlmJztcclxuICAgICAgICB2YXIgY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFydFwiKTtcclxuICAgICAgICBpZiAoIWN0eClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBteUNoYXJ0ID0gbmV3IENoYXJ0KGN0eCwge1xyXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIGxhYmVsczogW1wiMjAxM1wiLCBcIjIwMTRcIiwgXCIyMDE1XCIsIFwiMjAxNlwiLCBcIjIwMTdcIiwgXCIyMDE4XCJdLFxyXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnMS3QutC+0LzQvdCw0YLQvdGL0LUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzc1MDAwLCA3MTAwMCwgNjgwMDAsIDczMDAwLCA3OTAwMCwgNzEwMDBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjYTZkODI0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjYTZkODI0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDNcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcyLdC60L7QvNC90LDRgtC90YvQtScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbNjUwMDAsIDYwMDAwLCA2NjAwMCwgNjUwMDAsIDU4MDAwLCA2ODAwMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZWE2MTgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmZWE2MTgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogM1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzMt0LrQvtC80L3QsNGC0L3Ri9C1JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFs2MzAwMCwgNTgwMDAsIDQ5MDAwLCA2NjAwMCwgNTAwMDAsIDY0MDAwXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2VhNWY4MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnI2VhNWY4MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnNC3QutC+0LzQvdCw0YLQvdGL0LUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzQ1MDAwLCA0NzAwMCwgNDMwMDAsIDQyMDAwLCA0OTAwMCwgMzgwMDBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDNhN2VkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjNDNhN2VkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdG9vbHRpcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYXZlcmFnZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2luZGV4JyxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcblxyXG4gICAgICAgIHZhciBtYXA7XHJcblxyXG4gICAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJtYXBcIiwge1xyXG4gICAgICAgICAgICBjZW50ZXI6IFs1Ni4zMDE5NjcsIDQ0LjAxMTk5M10sXHJcbiAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICBjb250cm9sczogWyd6b29tQ29udHJvbCddXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XHJcblxyXG4gICAgICAgIHZhciBteVBvbHlnb24gPSBuZXcgeW1hcHMuUG9seWdvbihbXHJcbiAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgIFs1Ni4yODcwNDAsIDQzLjk5NjUzNV0sXHJcbiAgICAgICAgICAgICAgICBbNTYuMjkxMjQwLCA0NC4wMzUzMzBdLFxyXG4gICAgICAgICAgICAgICAgWzU2LjI3NzY4MiwgNDQuMDI4ODA3XSxcclxuICAgICAgICAgICAgICAgIFs1Ni4yNjI3ODEsIDQ0LjAwNzE3OF0sXHJcbiAgICAgICAgICAgICAgICBbNTYuMjczODYyLCA0My45OTM0NDVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICBdLCB7XHJcbiAgICAgICAgICAgIGhpbnRDb250ZW50OiBcItCp0ZHQu9C+0LrQvtCy0YHQutC40Lkg0KXRg9GC0L7RgFwiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBmaWxsQ29sb3I6ICd2aW9sZXQnLFxyXG4gICAgICAgICAgICBzdHJva2VDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwLjcsXHJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChteVBvbHlnb24pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pOyJdLCJmaWxlIjoiYW5hbHl0aWMuanMifQ==
