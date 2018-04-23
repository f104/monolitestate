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
        initRange();
        initGallery();
        initHypothec();
        initDatepicker()
        initScrollbar()
        initAntispam()
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
            $('.js-agents-slider .agents-slider__item').off('click');
            $('.js-agents-slider:not(.slick-initialized)').slick({
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
            $('.js-agents-slider').on('afterChange', function (event, slick, currentSlide) {
//                console.log(slick);
                $(this).find('._active').removeClass('_active');
                $(slick.$slides[currentSlide]).addClass('_active');
                setAgentsPresentation();
            });
        } else {
            $('.js-agents-slider.slick-initialized').slick('unslick');
            initAgentsPresentation();
        }
    }

    function initAgentsPresentation() {
        if ($(window).outerWidth() >= appConfig.breakpoint.md) {
            $('.js-agents-slider .agents-slider__item').on('click', function () {
                $(this).parent().find('._active').removeClass('_active');
                $(this).addClass('_active');
                setAgentsPresentation();
            });
        }
    }

    function setAgentsPresentation() {
        if ($('.js-agents-slider').length) {
            var $agent = $('.js-agents-slider ._active .js-agents-slider__short');
            var $full = $('.js-agents-slider__full');
            $full.find('.js-agents-slider__full__img').attr('src', $agent.data('agent-img'));
            $full.find('.js-agents-slider__full__name').text($agent.data('agent-name'));
            var phone = $agent.data('agent-phone');
            $full.find('.js-agents-slider__full__phone a').text(phone).attr('href', 'tel:' + phone.replace(/[-\s]/g, ''));
            var link = $agent.data('agent-link');
            $full.find('.js-agents-slider__full__link a').text(link).attr('href', '//:' + link);
        }
    }

    function initMenu() {
        $('.js-menu-toggler').on('click', function (e) {
            e.preventDefault();
            var href = $(this).attr('href');
            $('.js-menu-toggler[href="' + href + '"]').toggleClass('_active');
            $(href).toggleClass('_active');
            $('.js-menu._active').length == 0 ? $('.js-menu-overlay').hide() : $('.js-menu-overlay').show();
        });
        $('.js-menu-overlay').on('click', function (e) {
            $('.js-menu-toggler, .js-menu').removeClass('_active');
            $(this).hide()
        });
        $('.js-menu-second-toggler').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('_active');
            $('.js-menu-second').toggleClass('_active');
        });
    }

    function initMask() {
        $('.js-mask__tel').inputmask({
            mask: '+9 (999) 999-99-99'
        });
        Inputmask.extendAliases({
            'numeric': {
                autoUnmask: true,
                showMaskOnHover: false,
                radixPoint: ",",
                groupSeparator: " ",
                digits: 0,
                allowMinus: false,
                autoGroup: true,
                rightAlign: false,
                unmaskAsNumber: true
            }
        });
        $('.js-mask__currency').inputmask("numeric", {
            suffix: ' руб.'
        });
        $('.js-mask__square').inputmask("numeric", {
            suffix: ' м²'
        });
        $('.js-mask__age').inputmask("numeric", {
            suffix: ' лет'
        });
        $('.js-mask__percent').inputmask("numeric", {
            suffix: '%'
        });
        $('.js-mask__currency, .js-mask__square, .js-mask__percent').on('blur', function () {
            // need for remove suffix
            // https://github.com/RobinHerbots/Inputmask/issues/1551
            var v = $(this).val();
            if (v == 0 || v == '') {
                $(this).val('');
            }
        });
    }

    function initPopup() {
        var options = {
            baseClass: '_popup',
            autoFocus: false,
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
        $.fn.select2.defaults.set("theme", "custom");
        $.fn.select2.defaults.set("minimumResultsForSearch", Infinity);
        $('.js-select2').select2();
        $(window).on('resize', function () {
            $('.js-select2').select2();
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
        $('.js-realty-list-slider').each(function () {
            var $togglers = $(this).find('.js-realty-list-slider__img-wrapper');
            var $counter = $(this).find('.js-realty-list-slider__counter');
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
                tabs: '.js-tabs__list > li',
                panelContext: $(elem).hasClass('js-tabs_disconnected') ? $('.js-tabs__content') : $(elem)
            });
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                $(elem).find('.js-tabs__select').val($clicked.attr('href')).change();
                $target.find('.slick-initialized').slick('setPosition');
                $target.find('.js-select2').select2();
            });
            $(elem).find('.js-tabs__select').on('change', function () {
                $(elem).easytabs('select', $(this).val());
            });
        });
    }

    function initRange() {
        $('.js-range').each(function (index, elem) {
            var slider = $(elem).find('.js-range__target')[0],
                    from = $(elem).find('.js-range__from')[0],
                    to = $(elem).find('.js-range__to')[0];
            if (slider && from && to) {
                var min = parseInt(from.value) || 0,
                        max = parseInt(to.value) || 0;
                noUiSlider.create(slider, {
                    start: [
                        min,
                        max
                    ],
                    connect: true,
                    range: {
                        'min': min,
                        'max': max
                    }
                });
                var snapValues = [from, to];
                slider.noUiSlider.on('update', function (values, handle) {
                    snapValues[handle].value = Math.round(values[handle]);
                });
                from.addEventListener('change', function () {
                    slider.noUiSlider.set([this.value, null]);
                });
                to.addEventListener('change', function () {
                    slider.noUiSlider.set([null, this.value]);
                });
            }
        });

        $('.js-picker').each(function (index, elem) {
            var slider = $(elem).find('.js-picker__target')[0],
                    input = $(elem).find('.js-picker__input')[0];
            if (slider && input) {
                var min = parseInt(input.getAttribute('min')) || 0,
                        max = parseInt(input.getAttribute('max')) || 0,
                        val = parseInt(input.value) || min;
                noUiSlider.create(slider, {
                    start: val,
                    connect: [true, false],
                    format: {
                        to: function (value) {
                            return parseInt(value);
                        },
                        from: function (value) {
                            return value;
                        }
                    },
                    range: {
                        'min': min,
                        'max': max
                    }
                });
                slider.noUiSlider.on('update', function () {
                    input.value = slider.noUiSlider.get();
                    $(elem).find('.js-picker__input').trigger('change');
                    var mask = input.inputmask;
                    if (mask && input.classList.contains('js-mask__age')) {
                        var suffix = getNumEnding(slider.noUiSlider.get(), [' год', ' года', ' лет']);
                        mask.option({
                            suffix: suffix
                        });
                    }
                });
                input.addEventListener('change', function () {
                    slider.noUiSlider.set(this.value);
                });
            }
        });
    }

    function initGallery() {
        $('.js-gallery-nav').slick({
            dots: false,
            arrows: true,
            infinite: false,
            slidesToShow: 6,
            slidesToScroll: 1,
            focusOnSelect: true,
            asNavFor: '.js-gallery__slider',
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md,
                    settings: {
                        slidesToShow: 3
                    }
                }
            ],
        });
        $('.js-gallery').each(function (i, el) {
            var $slider = $(el).find('.js-gallery__slider');
            var $current = $(el).find('.js-gallery__current');
            $slider.slick({
                dots: false,
                arrows: true,
                infinite: false,
                asNavFor: '.js-gallery-nav',
                responsive: [
                    {
                        breakpoint: appConfig.breakpoint.md,
                        settings: {
                            arrows: false
                        }
                    }
                ],
            });
            $slider.on('afterChange', function (event, slick, currentSlide) {
                $current.text(++currentSlide);
            });
            $(el).find('.js-gallery__total').text($slider.find('.slide').length);
        });
    }

    /**
     * Функция возвращает окончание для множественного числа слова на основании числа и массива окончаний
     * param  iNumber Integer Число на основе которого нужно сформировать окончание
     * param  aEndings Array Массив слов или окончаний для чисел (1, 4, 5),
     *         например ['яблоко', 'яблока', 'яблок']
     * return String
     * 
     * https://habrahabr.ru/post/105428/
     */
    function getNumEnding(iNumber, aEndings) {
        var sEnding, i;
        iNumber = iNumber % 100;
        if (iNumber >= 11 && iNumber <= 19) {
            sEnding = aEndings[2];
        } else {
            i = iNumber % 10;
            switch (i)
            {
                case (1):
                    sEnding = aEndings[0];
                    break;
                case (2):
                case (3):
                case (4):
                    sEnding = aEndings[1];
                    break;
                default:
                    sEnding = aEndings[2];
            }
        }
        return sEnding;
    }

    function initHypothec() {
        $('.js-hypothec').each(function () {
            var $cost = $(this).find('.js-hypothec__cost'),
                    cost = $cost.val(),
                    $paymentPercent = $(this).find('.js-hypothec__payment-percent'),
                    $paymentSum = $(this).find('.js-hypothec__payment-sum'),
                    $age = $(this).find('.js-hypothec__age'),
                    $credit = $(this).find('.js-hypothec__credit'),
                    $slider = $(this).find('.js-hypothec__slider'),
                    $slides = $slider.find('.slide'),
                    $scroll = $(this).find('.js-hypothec__scroll');
            var rate = [];
            $slider.find('.js-hypothec__rate').each(function () {
                rate.push(parseFloat($(this).text().replace(",", ".")) || 0);
            });
            var rateME = [];
            $slider.find('.js-hypothec__rateME').each(function () {
                rateME.push(parseFloat($(this).text().replace(",", ".")) || 0);
            });
            var credit = 0;
            var age = $age.val();
            $paymentPercent.on('change', function () {
                $paymentSum.val(calcPayment(cost, $paymentPercent.val()));
                credit = calcCredit(cost, $paymentPercent.val());
                $credit.val(credit);
                $slides.each(function (i, el) {
                    $(el).find('.js-hypothec__permonth').text(formatPrice(calcPerMonth(credit, rate[i], age)));
                    $(el).find('.js-hypothec__permonthME').text(formatPrice(calcPerMonth(credit, rateME[i], age)));
                    $(el).find('.js-hypothec__economy').text(formatPrice(calcPerMonth(credit, rate[i], age) * 12 * age - calcPerMonth(credit, rateME[i], age) * 12 * age));
                });
            });
            $paymentPercent.trigger('change');
            $age.on('change', function () {
                age = $age.val();
                $slides.each(function (i, el) {
                    $(el).find('.js-hypothec__permonth').text(formatPrice(calcPerMonth(credit, rate[i], age)));
                    $(el).find('.js-hypothec__permonthME').text(formatPrice(calcPerMonth(credit, rateME[i], age)));
                    $(el).find('.js-hypothec__economy').text(formatPrice(calcPerMonth(credit, rate[i], age) * 12 * age - calcPerMonth(credit, rateME[i], age) * 12 * age));
                });
            });
            $scroll.find('.hypothec__list__item').each(function (i) {
                $(this).find('a').on('click', function (e) {
                    e.preventDefault();
                    $slider.slick('slickGoTo', i);
                });
            });
        });
        function calcPayment(cost, percent) {
            return Math.ceil(cost * percent / 100);
        }
        function calcCredit(cost, percent) {
            return cost - Math.ceil(cost * percent / 100);
        }
        function calcPerMonth(credit, rate, age) {
            return Math.ceil(credit * ((rate / 1200.0) / (1.0 - Math.pow(1.0 + rate / 1200.0, -(age * 12)))));
        }
        function formatPrice(price) {
            return price.toString().replace(/./g, function (c, i, a) {
                return i && c !== "." && !((a.length - i) % 3) ? ' ' + c : c;
            });
        }
        $('.js-hypothec__slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: '15px',
            focusOnSelect: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md - 1,
                    settings: {
                        dots: false,
                        fade: true,
                        draggable: false,
                        centerPadding: '0px'
                    }
                }
            ]
        });
        var $t = $('.js-hypothec__show-target');
        if ($t.length) {
            var offset = $t.offset().top - 40;
            if ($('.header__main').css('position') === 'fixed') {
                offset += $('.header__main').outerHeight(true);
            }
            $('.js-hypothec__show-btn').on('click', function (e) {
                e.preventDefault();
                $('html, body').animate({scrollTop: offset}, 300);
            });
        }
    }

    function initDatepicker() {
        var datepicker_visible = false;
        $('.js-datetimepicker').datepicker({
            minDate: new Date(),
            timepicker: true,
            dateTimeSeparator: ', ',
            position: 'top left',
            onShow: function (inst, animationCompleted) {
                if (animationCompleted) {
                    datepicker_visible = true;
                }
            },
            onHide: function (inst, animationCompleted) {
                if (animationCompleted) {
                    datepicker_visible = false;
                }
            }
        });
        $('.js-datetimepicker').on('click', function () {
            if (datepicker_visible) {
                var datepicker = $('.js-datetimepicker').data('datepicker');
                datepicker.hide();
            }
        });
    }

    function initScrollbar() {
        $('.js-scrollbar').scrollbar();
        var w = $(window).outerWidth();
        if (w < appConfig.breakpoint.md) {
            $('.js-scrollbar-sm').scrollbar();
        }
        if (w >= appConfig.breakpoint.md && w < appConfig.breakpoint.lg) {
            $('.js-scrollbar-md').scrollbar();
        }
        if (w >= appConfig.breakpoint.lg) {
            $('.js-scrollbar-lg').scrollbar();
        }
        $(window).on('resize', function () {
            if ($(window).outerWidth() < appConfig.breakpoint.md) {
                $('.js-scrollbar-sm').scrollbar();
            } else {
                $('.js-scrollbar-sm').scrollbar('destroy');
            }
        });
        $(window).on('resize', function () {
            if ($(window).outerWidth() >= appConfig.breakpoint.md
                    && $(window).outerWidth() < appConfig.breakpoint.lg) {
                $('.js-scrollbar-md').scrollbar();
            } else {
                $('.js-scrollbar-md').scrollbar('destroy');
            }
        });
        $(window).on('resize', function () {
            if ($(window).outerWidth() >= appConfig.breakpoint.lg) {
                $('.js-scrollbar-lg').scrollbar();
            } else {
                $('.js-scrollbar-lg').scrollbar('destroy');
            }
        });
//        $('.js-scrollbar-hot').scrollbar();
    }

    function initAntispam() {
        setTimeout(function () {
            $('input[name="email3"],input[name="info"],input[name="text"]').attr('value', '').val('');
        }, 5000);
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRUYWJzKCk7XHJcbiAgICAgICAgaW5pdFJhbmdlKCk7XHJcbiAgICAgICAgaW5pdEdhbGxlcnkoKTtcclxuICAgICAgICBpbml0SHlwb3RoZWMoKTtcclxuICAgICAgICBpbml0RGF0ZXBpY2tlcigpXHJcbiAgICAgICAgaW5pdFNjcm9sbGJhcigpXHJcbiAgICAgICAgaW5pdEFudGlzcGFtKClcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICB2YXIgJGJhciA9ICQoJy5qcy1tYWluLXNsaWRlci1iYXInKSxcclxuICAgICAgICAgICAgICAgICRzbGljayA9ICQoJy5qcy1zbGlkZXItbWFpbicpLFxyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcjpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcicpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLWFnZW50cy1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5fYWN0aXZlIC5qcy1hZ2VudHMtc2xpZGVyX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHNdL2csICcnKSk7XHJcbiAgICAgICAgICAgIHZhciBsaW5rID0gJGFnZW50LmRhdGEoJ2FnZW50LWxpbmsnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX2xpbmsgYScpLnRleHQobGluaykuYXR0cignaHJlZicsICcvLzonICsgbGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoaHJlZikudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCA9PSAwID8gJCgnLmpzLW1lbnUtb3ZlcmxheScpLmhpZGUoKSA6ICQoJy5qcy1tZW51LW92ZXJsYXknKS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXIsIC5qcy1tZW51JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJy5qcy1tYXNrX190ZWwnKS5pbnB1dG1hc2soe1xyXG4gICAgICAgICAgICBtYXNrOiAnKzkgKDk5OSkgOTk5LTk5LTk5J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIElucHV0bWFzay5leHRlbmRBbGlhc2VzKHtcclxuICAgICAgICAgICAgJ251bWVyaWMnOiB7XHJcbiAgICAgICAgICAgICAgICBhdXRvVW5tYXNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2hvd01hc2tPbkhvdmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJhZGl4UG9pbnQ6IFwiLFwiLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTZXBhcmF0b3I6IFwiIFwiLFxyXG4gICAgICAgICAgICAgICAgZGlnaXRzOiAwLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dNaW51czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhdXRvR3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByaWdodEFsaWduOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3knKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmUnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19hZ2UnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQu9C10YInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3BlcmNlbnQnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3ksIC5qcy1tYXNrX19zcXVhcmUsIC5qcy1tYXNrX19wZXJjZW50Jykub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgZm9yIHJlbW92ZSBzdWZmaXhcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9JbnB1dG1hc2svaXNzdWVzLzE1NTFcclxuICAgICAgICAgICAgdmFyIHYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodiA9PSAwIHx8IHYgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudmFsKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3Qtc2VhcmNoJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9ICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2l0ZW0nKTtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID09PSAwID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdF9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXNlbGVjdCcpLmFkZENsYXNzKCdfYWN0aXZlJykudG9nZ2xlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm5vdCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX29wZW5lZCBfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWYWxpZGF0ZSgpIHtcclxuICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoXCJwaG9uZVwiLCBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uYWwoZWxlbWVudCkgfHwgL15cXCtcXGRcXHNcXChcXGR7M31cXClcXHNcXGR7M30tXFxkezJ9LVxcZHsyfSQvLnRlc3QodmFsdWUpO1xyXG4gICAgICAgIH0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBtb2JpbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7fSxcclxuICAgICAgICAgICAgcnVsZXM6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcInBob25lXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXZhbGlkYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudmFsaWRhdGUob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eUZpbHRlcnMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXR5cGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10aXRsZScpLnRleHQoJCh0aGlzKS5kYXRhKCdmaWx0ZXJzLXRpdGxlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXNzd29yZCgpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXBhc3N3b3JkJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi4vanMvbGlicy96eGN2Ym4uanNcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChzY3JpcHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24gKGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgenhjdmJuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoenhjdmJuKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHp4Y3Zibih2YWwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpO1xyXG4gICAgICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMyBfNCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgcmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZXZpZXdzU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciAkc2xpZGVyID0gJCgnLmpzLXNsaWRlci1yZXZpZXdzJyk7XHJcbiAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkb3RzQ2xhc3M6ICdzbGljay1kb3RzIF9iaWcnLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyICRiaWcgPSAkKCcucmV2aWV3c19fbGlzdC5fYmlnIC5yZXZpZXdzX19saXN0X19pdGVtJyk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAwO1xyXG4gICAgICAgIGlmICgkYmlnLmxlbmd0aCAmJiAkc2xpZGVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgJHNsaWRlclxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyQmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjbGVhckJpZygpIHtcclxuICAgICAgICAgICAgJGJpZy5mYWRlT3V0KCkuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmlnKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXJldmlld3MgLnNsaWNrLWN1cnJlbnQgLnJldmlld3NfX2xpc3RfX2l0ZW1fX2lubmVyJykuY2xvbmUoKS5hcHBlbmRUbygkYmlnKTtcclxuICAgICAgICAgICAgJGJpZy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgJGJpZy5wYXJlbnQoKS5jc3MoJ2hlaWdodCcsICRiaWcub3V0ZXJIZWlnaHQodHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5KCkge1xyXG4gICAgICAgICQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0b2dnbGVycyA9ICQodGhpcykuZmluZCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcl9faW1nLXdyYXBwZXInKTtcclxuICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRjb3VudGVyLnRleHQoaSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUYWJzKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICB0YWJzOiAnLmpzLXRhYnNfX2xpc3QgPiBsaScsXHJcbiAgICAgICAgICAgICAgICBwYW5lbENvbnRleHQ6ICQoZWxlbSkuaGFzQ2xhc3MoJ2pzLXRhYnNfZGlzY29ubmVjdGVkJykgPyAkKCcuanMtdGFic19fY29udGVudCcpIDogJChlbGVtKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChlbGVtKS5iaW5kKCdlYXN5dGFiczphZnRlcicsIGZ1bmN0aW9uIChldmVudCwgJGNsaWNrZWQsICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXRhYnNfX3NlbGVjdCcpLnZhbCgkY2xpY2tlZC5hdHRyKCdocmVmJykpLmNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygnc2V0UG9zaXRpb24nKTtcclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicygnc2VsZWN0JywgJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSYW5nZSgpIHtcclxuICAgICAgICAkKCcuanMtcmFuZ2UnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkKGVsZW0pLmZpbmQoJy5qcy1yYW5nZV9fZnJvbScpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX3RvJylbMF07XHJcbiAgICAgICAgICAgIGlmIChzbGlkZXIgJiYgZnJvbSAmJiB0bykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGZyb20udmFsdWUpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KHRvLnZhbHVlKSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNuYXBWYWx1ZXMgPSBbZnJvbSwgdG9dO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXBWYWx1ZXNbaGFuZGxlXS52YWx1ZSA9IE1hdGgucm91bmQodmFsdWVzW2hhbmRsZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmcm9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQoW3RoaXMudmFsdWUsIG51bGxdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdG8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbbnVsbCwgdGhpcy52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnLmpzLXBpY2tlcicpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX19pbnB1dCcpWzBdO1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVyICYmIGlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoaW5wdXQuZ2V0QXR0cmlidXRlKCdtaW4nKSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQoaW5wdXQuZ2V0QXR0cmlidXRlKCdtYXgnKSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IG1pbjtcclxuICAgICAgICAgICAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB2YWwsXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogW3RydWUsIGZhbHNlXSxcclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBzbGlkZXIubm9VaVNsaWRlci5nZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX2lucHV0JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBpbnB1dC5pbnB1dG1hc2s7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiYgaW5wdXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1tYXNrX19hZ2UnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3VmZml4ID0gZ2V0TnVtRW5kaW5nKHNsaWRlci5ub1VpU2xpZGVyLmdldCgpLCBbJ8Kg0LPQvtC0JywgJ8Kg0LPQvtC00LAnLCAnwqDQu9C10YInXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2sub3B0aW9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdhbGxlcnkoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnktbmF2Jykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNixcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnlfX3NsaWRlcicsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnknKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19zbGlkZXInKTtcclxuICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX2N1cnJlbnQnKTtcclxuICAgICAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnktbmF2JyxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzbGlkZXIub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkY3VycmVudC50ZXh0KCsrY3VycmVudFNsaWRlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X190b3RhbCcpLnRleHQoJHNsaWRlci5maW5kKCcuc2xpZGUnKS5sZW5ndGgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldE51bUVuZGluZyhpTnVtYmVyLCBhRW5kaW5ncykge1xyXG4gICAgICAgIHZhciBzRW5kaW5nLCBpO1xyXG4gICAgICAgIGlOdW1iZXIgPSBpTnVtYmVyICUgMTAwO1xyXG4gICAgICAgIGlmIChpTnVtYmVyID49IDExICYmIGlOdW1iZXIgPD0gMTkpIHtcclxuICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGkgPSBpTnVtYmVyICUgMTA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMSk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMik6XHJcbiAgICAgICAgICAgICAgICBjYXNlICgzKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1sxXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzRW5kaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRIeXBvdGhlYygpIHtcclxuICAgICAgICAkKCcuanMtaHlwb3RoZWMnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRjb3N0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2Nvc3QnKSxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0ID0gJGNvc3QudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtcGVyY2VudCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtc3VtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGFnZSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19hZ2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY3JlZGl0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2NyZWRpdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2xpZGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlcyA9ICRzbGlkZXIuZmluZCgnLnNsaWRlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjcm9sbCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zY3JvbGwnKTtcclxuICAgICAgICAgICAgdmFyIHJhdGUgPSBbXTtcclxuICAgICAgICAgICAgJHNsaWRlci5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGUucHVzaChwYXJzZUZsb2F0KCQodGhpcykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZU1FID0gW107XHJcbiAgICAgICAgICAgICRzbGlkZXIuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlTUUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVNRS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS50ZXh0KCkucmVwbGFjZShcIixcIiwgXCIuXCIpKSB8fCAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS52YWwoY2FsY1BheW1lbnQoY29zdCwgJHBheW1lbnRQZXJjZW50LnZhbCgpKSk7XHJcbiAgICAgICAgICAgICAgICBjcmVkaXQgPSBjYWxjQ3JlZGl0KGNvc3QsICRwYXltZW50UGVyY2VudC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkY3JlZGl0LnZhbChjcmVkaXQpO1xyXG4gICAgICAgICAgICAgICAgJHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50LnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAkYWdlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBhZ2UgPSAkYWdlLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgJHNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjcm9sbC5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGF5bWVudChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgLSBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlLCBhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjcmVkaXQgKiAoKHJhdGUgLyAxMjAwLjApIC8gKDEuMCAtIE1hdGgucG93KDEuMCArIHJhdGUgLyAxMjAwLjAsIC0oYWdlICogMTIpKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UHJpY2UocHJpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByaWNlLnRvU3RyaW5nKCkucmVwbGFjZSgvLi9nLCBmdW5jdGlvbiAoYywgaSwgYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgJiYgYyAhPT0gXCIuXCIgJiYgISgoYS5sZW5ndGggLSBpKSAlIDMpID8gJyAnICsgYyA6IGM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyICR0ID0gJCgnLmpzLWh5cG90aGVjX19zaG93LXRhcmdldCcpO1xyXG4gICAgICAgIGlmICgkdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0Lm9mZnNldCgpLnRvcCAtIDQwO1xyXG4gICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3Nob3ctYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RGF0ZXBpY2tlcigpIHtcclxuICAgICAgICB2YXIgZGF0ZXBpY2tlcl92aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIHRpbWVwaWNrZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGVUaW1lU2VwYXJhdG9yOiAnLCAnLFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ3RvcCBsZWZ0JyxcclxuICAgICAgICAgICAgb25TaG93OiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcl92aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25IaWRlOiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlcl92aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZGF0ZXRpbWVwaWNrZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlcGlja2VyX3Zpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlcGlja2VyID0gJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZXBpY2tlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsYmFyKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGxiYXInKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB2YXIgdyA9ICQod2luZG93KS5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kICYmIHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZFxyXG4gICAgICAgICAgICAgICAgICAgICYmICQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zY3JvbGxiYXItaG90Jykuc2Nyb2xsYmFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFudGlzcGFtKCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZW1haWwzXCJdLGlucHV0W25hbWU9XCJpbmZvXCJdLGlucHV0W25hbWU9XCJ0ZXh0XCJdJykuYXR0cigndmFsdWUnLCAnJykudmFsKCcnKTtcclxuICAgICAgICB9LCA1MDAwKTtcclxuICAgIH1cclxuXHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGY4O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lJaXdpYzI5MWNtTmxjeUk2V3lKamIyMXRiMjR1YW5NaVhTd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lhbEYxWlhKNUtHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJRndpZFhObElITjBjbWxqZEZ3aU8xeHlYRzVjY2x4dUlDQWdJQ1FvWkc5amRXMWxiblFwTG5KbFlXUjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVYSEpjYmlBZ0lDQjlLVHRjY2x4dUlDQWdJRnh5WEc1OUtUc2lYU3dpWm1sc1pTSTZJbU52YlcxdmJpNXFjeUo5Il0sImZpbGUiOiJjb21tb24uanMifQ==
