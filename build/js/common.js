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
            $('.js-scrollbar-sm .scrollbar-outer').scrollbar();
        }
        if ($(window).outerWidth() < appConfig.breakpoint.lg) {
            $('.js-scrollbar-md .scrollbar-outer').scrollbar();
        }
        $(window).on('resize', function () {
            if ($(window).outerWidth() < appConfig.breakpoint.md) {
                $('.js-scrollbar-sm .scrollbar-outer').scrollbar();
            } else {
                $('.js-scrollbar-sm .scrollbar-outer').scrollbar('destroy');
            }
        });
        $(window).on('resize', function () {
            if ($(window).outerWidth() < appConfig.breakpoint.lg) {
                $('.js-scrollbar-md .scrollbar-outer').scrollbar();
            } else {
                $('.js-scrollbar-md .scrollbar-outer').scrollbar('destroy');
            }
        });
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
        function initSelect2() {
            $('.js-select2').select2({
                theme: 'custom',
                minimumResultsForSearch: Infinity,
            });
        }
        initSelect2();
        $(window).on('resize', function () {
            initSelect2();
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
                tabs: '.js-tabs__list > li'
            });
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                $(elem).find('.js-tabs__select').val($clicked.attr('href')).change();
                $target.find('.slick-initialized').slick('setPosition');
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

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRUYWJzKCk7XHJcbiAgICAgICAgaW5pdFJhbmdlKCk7XHJcbiAgICAgICAgaW5pdEdhbGxlcnkoKTtcclxuICAgICAgICBpbml0SHlwb3RoZWMoKTtcclxuICAgICAgICBpbml0RGF0ZXBpY2tlcigpXHJcblxyXG4gICAgICAgICQoJy5qcy1zY3JvbGxiYXInKS5zY3JvbGxiYXIoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbi8vICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1haW5TbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCAvIDEwMDA7XHJcbiAgICAgICAgdmFyICRiYXIgPSAkKCcuanMtbWFpbi1zbGlkZXItYmFyJyksXHJcbiAgICAgICAgICAgICAgICAkc2xpY2sgPSAkKCcuanMtc2xpZGVyLW1haW4nKSxcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRpY2ssXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50VGltZTtcclxuXHJcbiAgICAgICAgaWYgKCRzbGljay5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgJHNsaWNrLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNwZWVkOiBhcHBDb25maWcuc2xpZGVyRmFkZVNwZWVkXHJcbi8vICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlIDwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgICAgICRiYXIuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzbGljay5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLnJlbW92ZUNsYXNzKCdfZmFkZSBfbGVmdCBfcmlnaHQnKTtcclxuICAgICAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2xpY2sub24oe1xyXG4gICAgICAgICAgICBtb3VzZWVudGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW91c2VsZWF2ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc3RhcnRQcm9ncmVzc2JhcigpIHtcclxuICAgICAgICAgICAgcmVzZXRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgICAgICBwZXJjZW50VGltZSA9IDA7XHJcbi8vICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aWNrID0gc2V0SW50ZXJ2YWwoaW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGludGVydmFsKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNQYXVzZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lICs9IDEgLyAodGltZSArIDAuMSk7XHJcbiAgICAgICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUaW1lICsgXCIlXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRUaW1lID49IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzbGljay5zbGljaygnc2xpY2tOZXh0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXNldFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U21hbGxTbGlkZXJzKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbDpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50cyAuYWdlbnRzLWxpc3RfX2l0ZW0nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMjUlJyxcclxuLy8gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzgwcHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMgLmFnZW50cy1saXN0X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXNsaWRlci1hZ2VudHMnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1zbGlkZXItYWdlbnRzIC5fYWN0aXZlIC5qcy1zbGlkZXItYWdlbnRzX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHNdL2csICcnKSk7XHJcbiAgICAgICAgICAgIHZhciBsaW5rID0gJGFnZW50LmRhdGEoJ2FnZW50LWxpbmsnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX2xpbmsgYScpLnRleHQobGluaykuYXR0cignaHJlZicsICcvLzonICsgbGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbSAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtIC5zY3JvbGxiYXItb3V0ZXInKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20gLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyW2hyZWY9XCInICsgaHJlZiArICdcIl0nKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKGhyZWYpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51Ll9hY3RpdmUnKS5sZW5ndGggPT0gMCA/ICQoJy5qcy1tZW51LW92ZXJsYXknKS5oaWRlKCkgOiAkKCcuanMtbWVudS1vdmVybGF5Jykuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyLCAuanMtbWVudScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGlkZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kLXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFzaygpIHtcclxuICAgICAgICAkKCcuanMtbWFza19fdGVsJykuaW5wdXRtYXNrKHtcclxuICAgICAgICAgICAgbWFzazogJys5ICg5OTkpIDk5OS05OS05OSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBJbnB1dG1hc2suZXh0ZW5kQWxpYXNlcyh7XHJcbiAgICAgICAgICAgICdudW1lcmljJzoge1xyXG4gICAgICAgICAgICAgICAgYXV0b1VubWFzazogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNob3dNYXNrT25Ib3ZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICByYWRpeFBvaW50OiBcIixcIixcclxuICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yOiBcIiBcIixcclxuICAgICAgICAgICAgICAgIGRpZ2l0czogMCxcclxuICAgICAgICAgICAgICAgIGFsbG93TWludXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXV0b0dyb3VwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRBbGlnbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1bm1hc2tBc051bWJlcjogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fYWdlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LvQtdGCJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19wZXJjZW50JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJyUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5LCAuanMtbWFza19fc3F1YXJlLCAuanMtbWFza19fcGVyY2VudCcpLm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIGZvciByZW1vdmUgc3VmZml4XHJcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JpbkhlcmJvdHMvSW5wdXRtYXNrL2lzc3Vlcy8xNTUxXHJcbiAgICAgICAgICAgIHZhciB2ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKHYgPT0gMCB8fCB2ID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbCgnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UG9wdXAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJhc2VDbGFzczogJ19wb3B1cCcsXHJcbiAgICAgICAgICAgIGF1dG9Gb2N1czogZmFsc2UsXHJcbiAgICAgICAgICAgIGJ0blRwbDoge1xyXG4gICAgICAgICAgICAgICAgc21hbGxCdG46ICc8c3BhbiBkYXRhLWZhbmN5Ym94LWNsb3NlIGNsYXNzPVwiZmFuY3lib3gtY2xvc2Utc21hbGxcIj48c3BhbiBjbGFzcz1cImxpbmtcIj7Ql9Cw0LrRgNGL0YLRjDwvc3Bhbj48L3NwYW4+JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1wb3B1cCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJC5mYW5jeWJveC5jbG9zZSgpO1xyXG4gICAgICAgIH0pLmZhbmN5Ym94KG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgJGNudCA9ICQod2luZG93LmxvY2F0aW9uLmhhc2gpO1xyXG4gICAgICAgICAgICBpZiAoJGNudC5sZW5ndGggJiYgJGNudC5oYXNDbGFzcygncG9wdXAtY250JykpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkY250LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2VsZWN0KCkge1xyXG4gICAgICAgIC8vIGN1c3RvbSBzZWxlY3RcclxuICAgICAgICAkKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0Jykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzZWxlY3Qtc2VhcmNoJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSA9PT0gMCA/ICQodGhpcykuc2hvdygpIDogJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHNlbGVjdDJcclxuICAgICAgICBmdW5jdGlvbiBpbml0U2VsZWN0MigpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgICAgIHRoZW1lOiAnY3VzdG9tJyxcclxuICAgICAgICAgICAgICAgIG1pbmltdW1SZXN1bHRzRm9yU2VhcmNoOiBJbmZpbml0eSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluaXRTZWxlY3QyKCk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGluaXRTZWxlY3QyKCk7XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoJ29wZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VmFsaWRhdGUoKSB7XHJcbiAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKFwicGhvbmVcIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKGVsZW1lbnQpIHx8IC9eXFwrXFxkXFxzXFwoXFxkezN9XFwpXFxzXFxkezN9LVxcZHsyfS1cXGR7Mn0kLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICB9LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge30sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCJwaG9uZVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy12YWxpZGF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnZhbGlkYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHlGaWx0ZXJzKCkge1xyXG4gICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10eXBlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdGl0bGUnKS50ZXh0KCQodGhpcykuZGF0YSgnZmlsdGVycy10aXRsZScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgaWYgKCQoJy5qcy1wYXNzd29yZCcpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kcm9wYm94L3p4Y3ZiblxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogXCIuL2pzL2xpYnMvenhjdmJuLmpzXCIsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcInNjcmlwdFwiLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbiAoc2NyaXB0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uIChqcXhociwgc2V0dGluZ3MsIGV4Y2VwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBsb2FkaW5nIHp4Y3ZibicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHp4Y3ZibikgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSB6eGN2Ym4odmFsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY250ID0gJCh0aGlzKS5zaWJsaW5ncygnLmlucHV0LWhlbHAnKTtcclxuICAgICAgICAgICAgICAgIGNudC5yZW1vdmVDbGFzcygnXzAgXzEgXzIgXzMgXzQnKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY250LmFkZENsYXNzKCdfJyArIHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5rZXl1cCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmV2aWV3c1NsaWRlcigpIHtcclxuICAgICAgICB2YXIgJHNsaWRlciA9ICQoJy5qcy1zbGlkZXItcmV2aWV3cycpO1xyXG4gICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cyBfYmlnJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50LmxnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciAkYmlnID0gJCgnLnJldmlld3NfX2xpc3QuX2JpZyAucmV2aWV3c19fbGlzdF9faXRlbScpO1xyXG4gICAgICAgIHZhciBjdXJyZW50ID0gMDtcclxuICAgICAgICBpZiAoJGJpZy5sZW5ndGggJiYgJHNsaWRlci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICRzbGlkZXJcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50U2xpZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gY3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJCaWcoKSB7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZU91dCgpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJpZygpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1yZXZpZXdzIC5zbGljay1jdXJyZW50IC5yZXZpZXdzX19saXN0X19pdGVtX19pbm5lcicpLmNsb25lKCkuYXBwZW5kVG8oJGJpZyk7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICRiaWcucGFyZW50KCkuY3NzKCdoZWlnaHQnLCAkYmlnLm91dGVySGVpZ2h0KHRydWUpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eSgpIHtcclxuICAgICAgICAkKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdG9nZ2xlcnMgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2ltZy13cmFwcGVyJyk7XHJcbiAgICAgICAgICAgIHZhciAkY291bnRlciA9ICQodGhpcykuZmluZCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcl9fY291bnRlcicpO1xyXG4gICAgICAgICAgICAkdG9nZ2xlcnMuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0b2dnbGVycy5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAkY291bnRlci50ZXh0KGkgKyAxKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VGFicygpIHtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoe1xyXG4gICAgICAgICAgICAgICAgdGFiczogJy5qcy10YWJzX19saXN0ID4gbGknXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmJpbmQoJ2Vhc3l0YWJzOmFmdGVyJywgZnVuY3Rpb24gKGV2ZW50LCAkY2xpY2tlZCwgJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0JykudmFsKCRjbGlja2VkLmF0dHIoJ2hyZWYnKSkuY2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCdzZXRQb3NpdGlvbicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoJ3NlbGVjdCcsICQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX2Zyb20nKVswXSxcclxuICAgICAgICAgICAgICAgICAgICB0byA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190bycpWzBdO1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVyICYmIGZyb20gJiYgdG8pIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW4gPSBwYXJzZUludChmcm9tLnZhbHVlKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSBwYXJzZUludCh0by52YWx1ZSkgfHwgMDtcclxuICAgICAgICAgICAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBzbmFwVmFsdWVzID0gW2Zyb20sIHRvXTtcclxuICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAodmFsdWVzLCBoYW5kbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbmFwVmFsdWVzW2hhbmRsZV0udmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlc1toYW5kbGVdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZnJvbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFt0aGlzLnZhbHVlLCBudWxsXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQoW251bGwsIHRoaXMudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gc2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS5maW5kKCcuanMtcGlja2VyX19pbnB1dCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXNrID0gaW5wdXQuaW5wdXRtYXNrO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrICYmIGlucHV0LmNsYXNzTGlzdC5jb250YWlucygnanMtbWFza19fYWdlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IGdldE51bUVuZGluZyhzbGlkZXIubm9VaVNsaWRlci5nZXQoKSwgWyfCoNCz0L7QtCcsICfCoNCz0L7QtNCwJywgJ8Kg0LvQtdGCJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLm9wdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHYWxsZXJ5KCkge1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5X19zbGlkZXInLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5JykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgdmFyICRzbGlkZXIgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fc2xpZGVyJyk7XHJcbiAgICAgICAgICAgIHZhciAkY3VycmVudCA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpZGVyLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJGN1cnJlbnQudGV4dCgrK2N1cnJlbnRTbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fdG90YWwnKS50ZXh0KCRzbGlkZXIuZmluZCgnLnNsaWRlJykubGVuZ3RoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXROdW1FbmRpbmcoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SHlwb3RoZWMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29zdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jb3N0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICRjb3N0LnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXBlcmNlbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRhZ2UgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fYWdlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNyZWRpdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jcmVkaXQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZXMgPSAkc2xpZGVyLmZpbmQoJy5zbGlkZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzY3JvbGwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2Nyb2xsJyk7XHJcbiAgICAgICAgICAgIHZhciByYXRlID0gW107XHJcbiAgICAgICAgICAgICRzbGlkZXIuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlLnB1c2gocGFyc2VGbG9hdCgkKHRoaXMpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIHJhdGVNRSA9IFtdO1xyXG4gICAgICAgICAgICAkc2xpZGVyLmZpbmQoJy5qcy1oeXBvdGhlY19fcmF0ZU1FJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlTUUucHVzaChwYXJzZUZsb2F0KCQodGhpcykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gMDtcclxuICAgICAgICAgICAgdmFyIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgICRwYXltZW50UGVyY2VudC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRTdW0udmFsKGNhbGNQYXltZW50KGNvc3QsICRwYXltZW50UGVyY2VudC52YWwoKSkpO1xyXG4gICAgICAgICAgICAgICAgY3JlZGl0ID0gY2FsY0NyZWRpdChjb3N0LCAkcGF5bWVudFBlcmNlbnQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgJGNyZWRpdC52YWwoY3JlZGl0KTtcclxuICAgICAgICAgICAgICAgICRzbGlkZXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRwYXltZW50UGVyY2VudC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRzbGlkZXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY3JvbGwuZmluZCgnLmh5cG90aGVjX19saXN0X19pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1BheW1lbnQoY29zdCwgcGVyY2VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY0NyZWRpdChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0IC0gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZSwgYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY3JlZGl0ICogKChyYXRlIC8gMTIwMC4wKSAvICgxLjAgLSBNYXRoLnBvdygxLjAgKyByYXRlIC8gMTIwMC4wLCAtKGFnZSAqIDEyKSkpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFByaWNlKHByaWNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmljZS50b1N0cmluZygpLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24gKGMsIGksIGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpICYmIGMgIT09IFwiLlwiICYmICEoKGEubGVuZ3RoIC0gaSkgJSAzKSA/ICcgJyArIGMgOiBjO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXREYXRlcGlja2VyKCkge1xyXG4gICAgICAgIHZhciBkYXRlcGlja2VyX3Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAkKCcuanMtZGF0ZXRpbWVwaWNrZXInKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgdGltZXBpY2tlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0ZVRpbWVTZXBhcmF0b3I6ICcsICcsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAndG9wIGxlZnQnLFxyXG4gICAgICAgICAgICBvblNob3c6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyX3Zpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkhpZGU6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyX3Zpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXJfdmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKCcuanMtZGF0ZXRpbWVwaWNrZXInKS5kYXRhKCdkYXRlcGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlcGlja2VyLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zjg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaUlpd2ljMjkxY21ObGN5STZXeUpqYjIxdGIyNHVhbk1pWFN3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWFsRjFaWEo1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lGd2lkWE5sSUhOMGNtbGpkRndpTzF4eVhHNWNjbHh1SUNBZ0lDUW9aRzlqZFcxbGJuUXBMbkpsWVdSNUtHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dVhISmNiaUFnSUNCOUtUdGNjbHh1SUNBZ0lGeHlYRzU5S1RzaVhTd2labWxzWlNJNkltTnZiVzF2Ymk1cWN5SjkiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
