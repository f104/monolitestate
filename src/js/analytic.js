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