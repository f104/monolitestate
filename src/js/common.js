jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initMainSlider();
        initSmallSliders();
        initReviewsSlider();
        initAgentsPresentation();
        setAgentsPresentation();
        initMenu();
        initMask();
        initPopup();
        initSelect();
        initValidate();
        initRealtyFilters();
        initRealty();
        initPassword();
        initTabs();

        $('.js-scrollbar').scrollbar();

    });

    $(window).on('resize', function () {
        initSmallSliders();
//        initMenu();
    });

    function initMainSlider() {
        var time = appConfig.sliderAutoplaySpeed / 1000;
        var $bar = $('.js-main-slider-bar'),
                $slick = $('.js-slider-main'),
                isPause = false,
                tick,
                percentTime;

        if ($slick.length === 0)
            return;

        $slick.slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            speed: appConfig.sliderFadeSpeed
//            autoplaySpeed: appConfig.sliderAutoplaySpeed,
        });
        $slick.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            if (currentSlide < nextSlide) {
                $(slick.$slides[currentSlide]).addClass('_fade _left');
                $(slick.$slides[nextSlide]).addClass('_fade _right');
            } else {
                $(slick.$slides[currentSlide]).addClass('_fade _right');
                $(slick.$slides[nextSlide]).addClass('_fade _left');
            }
            clearTimeout(tick);
            $bar.animate({
                width: 0 + '%'
            }, 100);
        });
        $slick.on('afterChange', function (event, slick, currentSlide) {
            $(slick.$slides[currentSlide]).removeClass('_fade _left _right');
            startProgressbar();
        });

        $slick.on({
            mouseenter: function () {
                isPause = true;
            },
            mouseleave: function () {
                isPause = false;
            }
        })

        function startProgressbar() {
            resetProgressbar();
            percentTime = 0;
//            isPause = false;
            tick = setInterval(interval, 10);
        }

        function interval() {
            if (isPause === false) {
                percentTime += 1 / (time + 0.1);
                $bar.css({
                    width: percentTime + "%"
                });
                if (percentTime >= 100) {
                    $slick.slick('slickNext');
                }
            }
        }


        function resetProgressbar() {
            $bar.css({
                width: 0 + '%'
            });
            clearTimeout(tick);
        }

        startProgressbar();

    }

    function initSmallSliders() {
        if ($(window).outerWidth() < appConfig.breakpoint.md) {
            $('.js-slider-small:not(.slick-initialized)').slick({
                dots: true,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                centerPadding: '15px',
                focusOnSelect: true,
            });
        } else {
            $('.js-slider-small.slick-initialized').slick('unslick');
        }
        if ($(window).outerWidth() < appConfig.breakpoint.md) {
            $('.js-slider-agents .agents-list__item').off('click');
            $('.js-slider-agents:not(.slick-initialized)').slick({
                dots: false,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                centerPadding: '25%',
//                centerPadding: '80px',
                focusOnSelect: true,
            });
            $('.js-slider-agents').on('afterChange', function (event, slick, currentSlide) {
//                console.log(slick);
                $(this).find('._active').removeClass('_active');
                $(slick.$slides[currentSlide]).addClass('_active');
                setAgentsPresentation();
            });
        } else {
            $('.js-slider-agents.slick-initialized').slick('unslick');
            initAgentsPresentation();
        }
    }

    function initAgentsPresentation() {
        if ($(window).outerWidth() >= appConfig.breakpoint.md) {
            $('.js-slider-agents .agents-list__item').on('click', function () {
                $(this).parent().find('._active').removeClass('_active');
                $(this).addClass('_active');
                setAgentsPresentation();
            });
        }
    }

    function setAgentsPresentation() {
        if ($('.js-slider-agents').length) {
            var $agent = $('.js-slider-agents ._active .js-slider-agents__short');
            var $full = $('.js-slider-agents__full');
            $full.find('.js-slider-agents__full__img').attr('src', $agent.data('agent-img'));
            $full.find('.js-slider-agents__full__name').text($agent.data('agent-name'));
            var phone = $agent.data('agent-phone');
            $full.find('.js-slider-agents__full__phone a').text(phone).attr('href', 'tel:' + phone.replace(/[-\s]/g, ''));
            var link = $agent.data('agent-link');
            $full.find('.js-slider-agents__full__link a').text(link).attr('href', '//:' + link);
        }
    }

    function initMenu() {
        if ($(window).outerWidth() < appConfig.breakpoint.md) {
            $('.js-menu .scrollbar-outer').scrollbar();
        }
        $(window).on('resize', function () {
            if ($(window).outerWidth() < appConfig.breakpoint.md) {
                $('.js-menu .scrollbar-outer').scrollbar();
            } else {
                $('.js-menu .scrollbar-outer').scrollbar('destroy');
            }
        });
        $('.js-menu-toggler').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('_active');
            $('.js-menu').toggleClass('_active');
            $('.js-menu-overlay').toggle();
        });
        $('.js-menu-overlay').on('click', function (e) {
            $('.js-menu-toggler').click();
        });
        $('.js-menu-second-toggler').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('_active');
            $('.js-menu-second').toggleClass('_active');
        });
    }

    function initMask() {
        $(':input').inputmask();
    }

    function initPopup() {
        var options = {
            baseClass: '_popup',
            btnTpl: {
                smallBtn: '<span data-fancybox-close class="fancybox-close-small"><span class="link">Закрыть</span></span>',
            },
        };
        $('.js-popup').on('click', function () {
            $.fancybox.close();
        }).fancybox(options);
        if (window.location.hash) {
            var $cnt = $(window.location.hash);
            if ($cnt.length && $cnt.hasClass('popup-cnt')) {
                $.fancybox.open($cnt, options);
            }
        }
    }

    function initSelect() {
        // custom select
        $('.js-select-search').each(function (index, element) {
            var $items = $(element).find('.js-select-search__item');
            $(element).find('.js-select-search__input').on('keyup', function () {
                var query = $(this).val().trim().toLowerCase();
//                console.log(query);
                if (query.length) {
                    $items.each(function () {
                        $(this).data('select-search').toLowerCase().indexOf(query) === 0 ? $(this).show() : $(this).hide();
                    });
                } else {
                    $items.show();
                }
            });
        });
        $('.js-select').on('click', function (e) {
            e.stopPropagation();
        });
        $('.js-select__toggler').on('click', function () {
            $('.js-select').removeClass('_active');
            $(this).parents('.js-select').addClass('_active').toggleClass('_opened');
            $('.js-select').not('._active').removeClass('_opened');
        });
        $(window).on('click', function () {
            $('.js-select').removeClass('_opened _active');
        });
        // select2
        $('.js-select2').select2({
            theme: 'custom',
            minimumResultsForSearch: Infinity,
        });
//        $('.js-select2').select2('open');
    }

    function initValidate() {
        $.validator.addMethod("phone", function (value, element) {
            return this.optional(element) || /^\+\d\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(value);
        }, "Please specify a valid mobile number");
        var options = {
            errorPlacement: function (error, element) {},
            rules: {
                phone: "phone"
            }
        };
        $('.js-validate').each(function () {
            $(this).validate(options);
        });
    }

    function initRealtyFilters() {
        $('.js-filters-realty-type').on('click', function () {
            $('.js-filters-realty-title').text($(this).data('filters-title'));
        });
    }

    function initPassword() {
        if ($('.js-password').length === 0) {
            return;
        }
        // https://github.com/dropbox/zxcvbn
        $.ajax({
            url: "./js/libs/zxcvbn.js",
            dataType: "script",
            cache: true
        })
                .done(function (script, textStatus) {
                    init();
                })
                .fail(function (jqxhr, settings, exception) {
                    console.log('Error loading zxcvbn');
                });

        function init() {
            $('.js-password').on('keyup', function () {
                if (typeof (zxcvbn) === 'undefined') {
                    return;
                }
                var val = $(this).val().trim(),
                        res = zxcvbn(val),
                        cnt = $(this).siblings('.input-help');
                cnt.removeClass('_0 _1 _2 _3 _4');
                if (val.length) {
                    cnt.addClass('_' + res.score);
                }
//                console.log(res.score);
            });
            $('.js-password').keyup();
        }
    }

    function initReviewsSlider() {
        var $slider = $('.js-slider-reviews');
        $slider.slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 3,
            focusOnSelect: true,
            adaptiveHeight: true,
            dotsClass: 'slick-dots _big',
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.lg,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
        var $big = $('.reviews__list._big .reviews__list__item');
        var current = 0;
        if ($big.length && $slider.length) {
            setBig();
            $slider
                    .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                        if (currentSlide != nextSlide) {
                            clearBig();
                        }
                        current = currentSlide;
                    })
                    .on('afterChange', function (event, slick, currentSlide) {
                        if (currentSlide != current) {
                            setBig();
                        }
                    });
        }
        function clearBig() {
            $big.fadeOut().empty();
        }
        function setBig() {
            $('.js-slider-reviews .slick-current .reviews__list__item__inner').clone().appendTo($big);
            $big.fadeIn();
            $big.parent().css('height', $big.outerHeight(true));
        }
    }

    function initRealty() {
        $('.js-realty__list__item__img-wrapper').each(function () {
            var $togglers = $(this).find('.js-realty__list__item__img-inner');
            var $counter = $(this).find('.js-realty__list__item__img-counter');
            $togglers.each(function (i) {
                $(this).on('mouseover', function () {
                    $togglers.removeClass('_active');
                    $(this).addClass('_active');
                    $counter.text(i + 1);
                });
            });
        });
    }

    function initTabs() {
        $('.js-tabs').each(function (index, elem) {
            $(elem).easytabs({
                tabs: '.js-tabs__list > li'
            });
            $(elem).bind('easytabs:after', function (event, $clicked) {
                $(elem).find('.js-tabs__select').val($clicked.attr('href')).change();
            });
            $(elem).find('.js-tabs__select').on('change', function () {
                $(elem).easytabs('select', $(this).val());
            });
        });
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
