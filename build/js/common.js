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
        initDatepicker();
        initScrollbar();
        initScroll();
        initAbout();
        initFileinput();
        initAlphabet();
        initAntispam();
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
        $('.js-mask__numeric').inputmask("numeric");
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
        $(".js-agent-search").select2({
            theme: 'agents',
            width: '100%',
            language: {
                inputTooShort: function (a) {
                    return "Пожалуйста, введите " + (a.minimum - a.input.length) + " или больше символов"
                },
            },
            ajax: {
                url: "https://api.myjson.com/bins/okyvi",
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term, // search term
                        action: 'agent_search'
                    };
                },
                processResults: function (data) {
//                    console.log(data);
                    var results = $.map(data, function (value, key) {
                        return {
                            id: key,
                            text: value.pagetitle,
                            agent: value
                        };
                    });
//                    console.log(results);
                    return {
                        results: results,
                    };
                },
                cache: true
            },
            templateResult: formatResult,
            templateSelection: formatSelection,
            escapeMarkup: function (markup) {
                return markup;
            }, // let our custom formatter work
            minimumInputLength: 3,
            maximumSelectionLength: 1,
        });
        function formatResult(item) {
            if (item.loading) {
                return 'поиск…';
            }
            return '<div class="select2-result-agent"><strong>' +
                    item.agent.pagetitle + '</strong><br>' + item.agent.value + '</div>';
        }
        function formatSelection(item) {
            return item.agent.pagetitle;
        }
        $('.js-agent-search').on('select2:select', function (e) {
            var data = e.params.data;
//            console.log(data);
            window.location = data.agent.uri
        });
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
        init();
        $(document).on('pdopage_load', function (e, config, response) {
            init();
        });
        $(document).on('mse2_load', function(e, data) {
            init();
        });
        function init() {
            $('.js-realty-list-slider[data-init="false"]').each(function () {
                var $togglers = $(this).find('.js-realty-list-slider__img-wrapper');
                var $counter = $(this).find('.js-realty-list-slider__counter');
                $togglers.each(function (i) {
                    $(this).on('mouseover', function () {
                        $togglers.removeClass('_active');
                        $(this).addClass('_active');
                        $counter.text(i + 1);
                    });
                });
                $(this).data('init', 'true');
            });
        }
    }

    function initTabs() {
        $('.js-tabs').each(function (index, elem) {
            $(elem).easytabs({
                // для вложенных табов используем data
                tabs: typeof $(elem).data('tabs') === 'undefined' ? '.js-tabs__list > li' : $(elem).data('tabs'),
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
                    $inputs = $(elem).find('input'),
                    from = $inputs.first()[0],
                    to = $inputs.last()[0];
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
//                    format: {
//                        to: function (value) {
//                            return parseInt(value);
//                        },
//                        from: function (value) {
//                            return value;
//                        }
//                    },
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
                        var suffix = getNumEnding(parseInt(slider.noUiSlider.get()), [' год', ' года', ' лет']);
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
                    $paymentSumPicker = $(this).find('.js-picker__target')[0],
                    $age = $(this).find('.js-hypothec__age'),
                    $credit = $(this).find('.js-hypothec__credit'),
                    $slider = $(this).find('.js-hypothec__slider'),
                    $items = $(this).find('.js-hypothec__item'),
                    $scroll = $(this).find('.js-hypothec__scroll');
            var rate = [];
            $items.each(function () {
                rate.push(parseFloat($(this).find('.js-hypothec__rate').text().replace(",", ".")) || 0);
            });
//            console.log(rate);
            var rateME = [];
            $items.each(function () {
                rateME.push(parseFloat($(this).find('.js-hypothec__rateME').text().replace(",", ".")) || 0);
            });
//            console.log(rateME);
            var credit = 0;
            var age = $age.val();
            var percent;
            $cost.inputmask("numeric", {
                suffix: ' руб.',
                oncomplete: function () {
                    cost = $(this).val();
                    $paymentSum.prop('max', cost);
                    $paymentSumPicker.noUiSlider.updateOptions({
                        range: {
                            'min': 0,
                            'max': cost
                        }
                    });
                    $paymentSum.trigger('change');
                }
            });
            $paymentSum.on('change', function () {
                percent = $(this).val() * 100 / cost;
                if (percent > 100) {
                    percent = 100;
                    $(this).val(cost);
                }
                credit = calcCredit(cost, percent);
                $paymentPercent.val(percent);
                $credit.val(credit);
                $items.each(function (i, el) {
                    $(el).find('.js-hypothec__first').text(formatPrice($paymentSum.val()));
                    $(el).find('.js-hypothec__permonth').text(formatPrice(calcPerMonth(credit, rate[i], age)));
                    $(el).find('.js-hypothec__permonthME').text(formatPrice(calcPerMonth(credit, rateME[i], age)));
                    $(el).find('.js-hypothec__economy').text(formatPrice(calcPerMonth(credit, rate[i], age) * 12 * age - calcPerMonth(credit, rateME[i], age) * 12 * age));
                });
            });
            $paymentSum.inputmask("numeric", {
                suffix: ' руб.',
                oncomplete: function () {
                    $(this).parents('.js-picker').find('.js-picker__target')[0].noUiSlider.set($(this).val());
                }
            });
            $paymentSum.trigger('change');
            $age.on('change', function () {
                age = $age.val();
                $items.each(function (i, el) {
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
            // filters, каждый селект фильтрует отдельно
            var style = [];
            $(this).find('.js-hypothec__filter').each(function () {
                var fName = $(this).data('hypothec-filter'),
                        className = 'filter-' + fName;
                style.push('.' + className + '{display:none !important}');
                var $checkboxes = $(this).find('input[type=checkbox]');
                $checkboxes.on('change', function () {
                    var $checked = $checkboxes.filter(':checked');
                    if ($checked.length) {
                        $items.removeClass(className);
                        var f = [];
                        $checked.each(function () {
                            f.push(':not([data-filter-' + $(this).val() + '])');
                        });
                        $items.filter('.js-hypothec__item' + f.join('')).addClass(className);
                    } else {
                        $items.removeClass(className);
                    }
                });
            });
            $('<style>' + style.join('') + '</style>').appendTo('head')
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
        $('.js-hypothec__show-btn').on('click', function (e) {
            e.preventDefault();
            var $t = $(this).parents('.js-hypothec').find('.js-hypothec__show-target');
            if ($t.length) {
                var offset = $t.offset().top - 40;
                if ($('.header__main').css('position') === 'fixed') {
                    offset -= $('.header__main').outerHeight(true);
                }
                $('html, body').animate({scrollTop: offset}, 300);
            }
        });
    }

    function initDatepicker() {
        var datepickerVisible = false;
        var commonOptions = {
            position: 'top left',
            onShow: function (inst, animationCompleted) {
                if (animationCompleted) {
                    datepickerVisible = true;
                }
            },
            onHide: function (inst, animationCompleted) {
                if (animationCompleted) {
                    datepickerVisible = false;
                }
            }
        };
        $('.js-datetimepicker').datepicker(Object.assign({
            minDate: new Date(),
            timepicker: true,
            dateTimeSeparator: ', ',
        }, commonOptions));
        $('.js-datepicker-range').datepicker(Object.assign({
            range: true,
            multipleDatesSeparator: ' - ',
        }, commonOptions));
        $('.js-datetimepicker, .js-datepicker-range').on('click', function () {
            if (datepickerVisible) {
                var datepicker = $('.js-datetimepicker, .js-datepicker-range').data('datepicker');
                datepicker.hide();
            }
        });
    }

    function initScrollbar() {
        $('.js-scrollbar').scrollbar();
        var w = $(window).outerWidth();
        if (w < appConfig.breakpoint.md) {
            $('.js-scrollbar-sm').scrollbar();
            $('.js-scrollbar-sm-md').scrollbar();
        }
        if (w < appConfig.breakpoint.lg) {
            $('.js-scrollbar-sm-md').scrollbar();
        }
        if (w >= appConfig.breakpoint.md && w < appConfig.breakpoint.lg) {
            $('.js-scrollbar-md').scrollbar();
        }
        if (w >= appConfig.breakpoint.md) {
            $('.js-scrollbar-md-lg').scrollbar();
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
            if ($(window).outerWidth() >= appConfig.breakpoint.md
                    && $(window).outerWidth() < appConfig.breakpoint.lg) {
                $('.js-scrollbar-md').scrollbar();
            } else {
                $('.js-scrollbar-md').scrollbar('destroy');
            }
            if (w < appConfig.breakpoint.lg) {
                $('.js-scrollbar-sm-md').scrollbar();
            } else {
                $('.js-scrollbar-sm-md').scrollbar('destroy');
            }
            if ($(window).outerWidth() >= appConfig.breakpoint.md) {
                $('.js-scrollbar-md-lg').scrollbar();
            } else {
                $('.js-scrollbar-md-lg').scrollbar('destroy');
            }
            if ($(window).outerWidth() >= appConfig.breakpoint.lg) {
                $('.js-scrollbar-lg').scrollbar();
            } else {
                $('.js-scrollbar-lg').scrollbar('destroy');
            }
        });
//        $('.js-scrollbar-hot').scrollbar();
    }

    /**
     * Прокрутка по ссылке до элемента
     */
    function initScroll() {
        $('.js-scroll').on('click', function (e) {
            e.preventDefault();
            var $target = $($(this).attr('href'));
            if ($target.length) {
                var offset = $target.offset().top - 40;
                if ($('.header__main').css('position') === 'fixed') {
                    offset -= $('.header__main').outerHeight(true);
                }
                if ($('.header').css('position') === 'fixed') {
                    offset -= $('.header').outerHeight();
                }
                $('html,body').animate({scrollTop: offset}, 300);
            }
        });
    }
    function initAbout() {
        $('.js-about-hystory__year-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            slidesToShow: 5,
            slidesToScroll: 1,
            centerMode: true,
            vertical: true,
            centerPadding: '50px',
            asNavFor: '.js-about-hystory__content-slider',
            focusOnSelect: true,
            mobileFirst: true,
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md - 1,
                    settings: {
                        centerPadding: '70px'
                    }
                }
            ]
        });
        $('.js-about-hystory__year-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
//                console.log(slick);
            $(this).find('._sibling').removeClass('_sibling');
            $(slick.$slides[nextSlide]).next().addClass('_sibling');
            $(slick.$slides[nextSlide]).prev().addClass('_sibling');
        });
        $('.js-about-hystory__content-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            asNavFor: '.js-about-hystory__year-slider',
            adaptiveHeight: true,
            draggable: false
        });
    }

    function initFileinput() {
        $('.js-fileinput__cnt').each(function () {
            $(this).data('default', $(this).text());
        });
        $('.js-fileinput').on('change', function (e) {
            if (this.files) {
                var fileName = $(this).val().split('\\').pop();
                $(this).parent().find('.js-fileinput__cnt').text(fileName);
            }
        });
    }

    function initAntispam() {
        setTimeout(function () {
            $('input[name="email3"],input[name="info"],input[name="text"]').attr('value', '').val('');
        }, 5000);
    }

    function initAlphabet() {
        $('.js-alphabet input').on('change', function () {
            $('.js-alphabet li').removeClass('_active');
            if ($(this).prop('checked')) {
                $(this).parents('li').addClass('_active');
            }
        });
        $('.js-alphabet a').on('click', function (e) {
            e.preventDefault();
            $('.js-alphabet li').removeClass('_active');
            $(this).parents('li').addClass('_active');
            if (typeof mSearch2 !== 'undefined') {
                mSearch2.reset();
            }
        });
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRUYWJzKCk7XHJcbiAgICAgICAgaW5pdFJhbmdlKCk7XHJcbiAgICAgICAgaW5pdEdhbGxlcnkoKTtcclxuICAgICAgICBpbml0SHlwb3RoZWMoKTtcclxuICAgICAgICBpbml0RGF0ZXBpY2tlcigpO1xyXG4gICAgICAgIGluaXRTY3JvbGxiYXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsKCk7XHJcbiAgICAgICAgaW5pdEFib3V0KCk7XHJcbiAgICAgICAgaW5pdEZpbGVpbnB1dCgpO1xyXG4gICAgICAgIGluaXRBbHBoYWJldCgpO1xyXG4gICAgICAgIGluaXRBbnRpc3BhbSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaW5pdFNtYWxsU2xpZGVycygpO1xyXG4vLyAgICAgICAgaW5pdE1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYWluU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciB0aW1lID0gYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQgLyAxMDAwO1xyXG4gICAgICAgIHZhciAkYmFyID0gJCgnLmpzLW1haW4tc2xpZGVyLWJhcicpLFxyXG4gICAgICAgICAgICAgICAgJHNsaWNrID0gJCgnLmpzLXNsaWRlci1tYWluJyksXHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB0aWNrLFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWU7XHJcblxyXG4gICAgICAgIGlmICgkc2xpY2subGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICRzbGljay5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzcGVlZDogYXBwQ29uZmlnLnNsaWRlckZhZGVTcGVlZFxyXG4vLyAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzbGljay5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSA8IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfcmlnaHQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9sZWZ0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgICAgICAkYmFyLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDAgKyAnJSdcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5yZW1vdmVDbGFzcygnX2ZhZGUgX2xlZnQgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHN0YXJ0UHJvZ3Jlc3NiYXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNsaWNrLm9uKHtcclxuICAgICAgICAgICAgbW91c2VlbnRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vdXNlbGVhdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgIHJlc2V0UHJvZ3Jlc3NiYXIoKTtcclxuICAgICAgICAgICAgcGVyY2VudFRpbWUgPSAwO1xyXG4vLyAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGljayA9IHNldEludGVydmFsKGludGVydmFsLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbnRlcnZhbCgpIHtcclxuICAgICAgICAgICAgaWYgKGlzUGF1c2UgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50VGltZSArPSAxIC8gKHRpbWUgKyAwLjEpO1xyXG4gICAgICAgICAgICAgICAgJGJhci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBwZXJjZW50VGltZSArIFwiJVwiXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50VGltZSA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2xpY2suc2xpY2soJ3NsaWNrTmV4dCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzZXRQcm9ncmVzc2JhcigpIHtcclxuICAgICAgICAgICAgJGJhci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDAgKyAnJSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXJ0UHJvZ3Jlc3NiYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNtYWxsU2xpZGVycygpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGw6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbC5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMjUlJyxcclxuLy8gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzgwcHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtYWdlbnRzLXNsaWRlcicpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgJGFnZW50ID0gJCgnLmpzLWFnZW50cy1zbGlkZXIgLl9hY3RpdmUgLmpzLWFnZW50cy1zbGlkZXJfX3Nob3J0Jyk7XHJcbiAgICAgICAgICAgIHZhciAkZnVsbCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19pbWcnKS5hdHRyKCdzcmMnLCAkYWdlbnQuZGF0YSgnYWdlbnQtaW1nJykpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbmFtZScpLnRleHQoJGFnZW50LmRhdGEoJ2FnZW50LW5hbWUnKSk7XHJcbiAgICAgICAgICAgIHZhciBwaG9uZSA9ICRhZ2VudC5kYXRhKCdhZ2VudC1waG9uZScpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fcGhvbmUgYScpLnRleHQocGhvbmUpLmF0dHIoJ2hyZWYnLCAndGVsOicgKyBwaG9uZS5yZXBsYWNlKC9bLVxcc10vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIGxpbmsgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbGluaycpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbGluayBhJykudGV4dChsaW5rKS5hdHRyKCdocmVmJywgJy8vOicgKyBsaW5rKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1lbnUoKSB7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcltocmVmPVwiJyArIGhyZWYgKyAnXCJdJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJChocmVmKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS5fYWN0aXZlJykubGVuZ3RoID09IDAgPyAkKCcuanMtbWVudS1vdmVybGF5JykuaGlkZSgpIDogJCgnLmpzLW1lbnUtb3ZlcmxheScpLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlciwgLmpzLW1lbnUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LXNlY29uZC10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXNlY29uZCcpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1hc2soKSB7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3RlbCcpLmlucHV0bWFzayh7XHJcbiAgICAgICAgICAgIG1hc2s6ICcrOSAoOTk5KSA5OTktOTktOTknXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgSW5wdXRtYXNrLmV4dGVuZEFsaWFzZXMoe1xyXG4gICAgICAgICAgICAnbnVtZXJpYyc6IHtcclxuICAgICAgICAgICAgICAgIGF1dG9Vbm1hc2s6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzaG93TWFza09uSG92ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcmFkaXhQb2ludDogXCIsXCIsXHJcbiAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvcjogXCIgXCIsXHJcbiAgICAgICAgICAgICAgICBkaWdpdHM6IDAsXHJcbiAgICAgICAgICAgICAgICBhbGxvd01pbnVzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGF1dG9Hcm91cDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0QWxpZ246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19udW1lcmljJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiKTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3knKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmUnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19hZ2UnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQu9C10YInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3BlcmNlbnQnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3ksIC5qcy1tYXNrX19zcXVhcmUsIC5qcy1tYXNrX19wZXJjZW50Jykub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgZm9yIHJlbW92ZSBzdWZmaXhcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9JbnB1dG1hc2svaXNzdWVzLzE1NTFcclxuICAgICAgICAgICAgdmFyIHYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodiA9PSAwIHx8IHYgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudmFsKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3Qtc2VhcmNoJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9ICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2l0ZW0nKTtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID09PSAwID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdF9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXNlbGVjdCcpLmFkZENsYXNzKCdfYWN0aXZlJykudG9nZ2xlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm5vdCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX29wZW5lZCBfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgICAgICQoXCIuanMtYWdlbnQtc2VhcmNoXCIpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2FnZW50cycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIGxhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFRvb1Nob3J0OiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcItCf0L7QttCw0LvRg9C50YHRgtCwLCDQstCy0LXQtNC40YLQtSBcIiArIChhLm1pbmltdW0gLSBhLmlucHV0Lmxlbmd0aCkgKyBcIiDQuNC70Lgg0LHQvtC70YzRiNC1INGB0LjQvNCy0L7Qu9C+0LJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWpheDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLm15anNvbi5jb20vYmlucy9va3l2aVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTogcGFyYW1zLnRlcm0sIC8vIHNlYXJjaCB0ZXJtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FnZW50X3NlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAkLm1hcChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHZhbHVlLnBhZ2V0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50OiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRTZWxlY3Rpb24sXHJcbiAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24gKG1hcmt1cCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcclxuICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcclxuICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAzLFxyXG4gICAgICAgICAgICBtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAn0L/QvtC40YHQuuKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2VsZWN0Mi1yZXN1bHQtYWdlbnRcIj48c3Ryb25nPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWdlbnQucGFnZXRpdGxlICsgJzwvc3Ryb25nPjxicj4nICsgaXRlbS5hZ2VudC52YWx1ZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRTZWxlY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5hZ2VudC5wYWdldGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1hZ2VudC1zZWFyY2gnKS5vbignc2VsZWN0MjpzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUucGFyYW1zLmRhdGE7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRhdGEuYWdlbnQudXJpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFZhbGlkYXRlKCkge1xyXG4gICAgICAgICQudmFsaWRhdG9yLmFkZE1ldGhvZChcInBob25lXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbChlbGVtZW50KSB8fCAvXlxcK1xcZFxcc1xcKFxcZHszfVxcKVxcc1xcZHszfS1cXGR7Mn0tXFxkezJ9JC8udGVzdCh2YWx1ZSk7XHJcbiAgICAgICAgfSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIG1vYmlsZSBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoZXJyb3IsIGVsZW1lbnQpIHt9LFxyXG4gICAgICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwicGhvbmVcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtdmFsaWRhdGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS52YWxpZGF0ZShvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5RmlsdGVycygpIHtcclxuICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdHlwZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXRpdGxlJykudGV4dCgkKHRoaXMpLmRhdGEoJ2ZpbHRlcnMtdGl0bGUnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBhc3N3b3JkKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtcGFzc3dvcmQnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZHJvcGJveC96eGN2Ym5cclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IFwiLi9qcy9saWJzL3p4Y3Zibi5qc1wiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcclxuICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24gKHNjcmlwdCwgdGV4dFN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyB6eGN2Ym4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh6eGN2Ym4pID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0genhjdmJuKHZhbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyk7XHJcbiAgICAgICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zIF80Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyByZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3NTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtc2xpZGVyLXJldmlld3MnKTtcclxuICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMgX2JpZycsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5sZyxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGJpZyA9ICQoJy5yZXZpZXdzX19saXN0Ll9iaWcgLnJldmlld3NfX2xpc3RfX2l0ZW0nKTtcclxuICAgICAgICB2YXIgY3VycmVudCA9IDA7XHJcbiAgICAgICAgaWYgKCRiaWcubGVuZ3RoICYmICRzbGlkZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAkc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyQmlnKCkge1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVPdXQoKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRCaWcoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItcmV2aWV3cyAuc2xpY2stY3VycmVudCAucmV2aWV3c19fbGlzdF9faXRlbV9faW5uZXInKS5jbG9uZSgpLmFwcGVuZFRvKCRiaWcpO1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAkYmlnLnBhcmVudCgpLmNzcygnaGVpZ2h0JywgJGJpZy5vdXRlckhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHkoKSB7XHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJbZGF0YS1pbml0PVwiZmFsc2VcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdG9nZ2xlcnMgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2ltZy13cmFwcGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNvdW50ZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2NvdW50ZXInKTtcclxuICAgICAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlcnMucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY291bnRlci50ZXh0KGkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdpbml0JywgJ3RydWUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUYWJzKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICAvLyDQtNC70Y8g0LLQu9C+0LbQtdC90L3Ri9GFINGC0LDQsdC+0LIg0LjRgdC/0L7Qu9GM0LfRg9C10LwgZGF0YVxyXG4gICAgICAgICAgICAgICAgdGFiczogdHlwZW9mICQoZWxlbSkuZGF0YSgndGFicycpID09PSAndW5kZWZpbmVkJyA/ICcuanMtdGFic19fbGlzdCA+IGxpJyA6ICQoZWxlbSkuZGF0YSgndGFicycpLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxDb250ZXh0OiAkKGVsZW0pLmhhc0NsYXNzKCdqcy10YWJzX2Rpc2Nvbm5lY3RlZCcpID8gJCgnLmpzLXRhYnNfX2NvbnRlbnQnKSA6ICQoZWxlbSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKS52YWwoJGNsaWNrZWQuYXR0cignaHJlZicpKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3NldFBvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoJ3NlbGVjdCcsICQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcuanMtcGlja2VyJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQgPSAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX2lucHV0JylbMF07XHJcbiAgICAgICAgICAgIGlmIChzbGlkZXIgJiYgaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW4gPSBwYXJzZUludChpbnB1dC5nZXRBdHRyaWJ1dGUoJ21pbicpKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSBwYXJzZUludChpbnB1dC5nZXRBdHRyaWJ1dGUoJ21heCcpKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgbWluO1xyXG4gICAgICAgICAgICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHZhbCxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0OiBbdHJ1ZSwgZmFsc2VdLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdG86IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBzbGlkZXIubm9VaVNsaWRlci5nZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX2lucHV0JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBpbnB1dC5pbnB1dG1hc2s7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiYgaW5wdXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1tYXNrX19hZ2UnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3VmZml4ID0gZ2V0TnVtRW5kaW5nKHBhcnNlSW50KHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKSwgWyfCoNCz0L7QtCcsICfCoNCz0L7QtNCwJywgJ8Kg0LvQtdGCJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLm9wdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHYWxsZXJ5KCkge1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5X19zbGlkZXInLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5JykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgdmFyICRzbGlkZXIgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fc2xpZGVyJyk7XHJcbiAgICAgICAgICAgIHZhciAkY3VycmVudCA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpZGVyLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJGN1cnJlbnQudGV4dCgrK2N1cnJlbnRTbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fdG90YWwnKS50ZXh0KCRzbGlkZXIuZmluZCgnLnNsaWRlJykubGVuZ3RoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXROdW1FbmRpbmcoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SHlwb3RoZWMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29zdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jb3N0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICRjb3N0LnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXBlcmNlbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyID0gJCh0aGlzKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkYWdlID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2FnZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjcmVkaXQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY3JlZGl0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlciA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzY3JvbGwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2Nyb2xsJyk7XHJcbiAgICAgICAgICAgIHZhciByYXRlID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGUpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZU1FID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVNRS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGVNRScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlTUUpO1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gMDtcclxuICAgICAgICAgICAgdmFyIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBwZXJjZW50O1xyXG4gICAgICAgICAgICAkY29zdC5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW0ucHJvcCgnbWF4JywgY29zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IGNvc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAkKHRoaXMpLnZhbCgpICogMTAwIC8gY29zdDtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50ID4gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudCA9IDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbChjb3N0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyZWRpdCA9IGNhbGNDcmVkaXQoY29zdCwgcGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQudmFsKHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJGNyZWRpdC52YWwoY3JlZGl0KTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZmlyc3QnKS50ZXh0KGZvcm1hdFByaWNlKCRwYXltZW50U3VtLnZhbCgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aCcpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGhNRScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19lY29ub215JykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpICogMTIgKiBhZ2UgLSBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkgKiAxMiAqIGFnZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcGlja2VyJykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0ubm9VaVNsaWRlci5zZXQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjcm9sbC5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZmlsdGVycywg0LrQsNC20LTRi9C5INGB0LXQu9C10LrRgiDRhNC40LvRjNGC0YDRg9C10YIg0L7RgtC00LXQu9GM0L3QvlxyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBbXTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpbHRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZOYW1lID0gJCh0aGlzKS5kYXRhKCdoeXBvdGhlYy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2ZpbHRlci0nICsgZk5hbWU7XHJcbiAgICAgICAgICAgICAgICBzdHlsZS5wdXNoKCcuJyArIGNsYXNzTmFtZSArICd7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNoZWNrYm94ZXMgPSAkKHRoaXMpLmZpbmQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJyk7XHJcbiAgICAgICAgICAgICAgICAkY2hlY2tib3hlcy5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2hlY2tlZCA9ICRjaGVja2JveGVzLmZpbHRlcignOmNoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoZWNrZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hlY2tlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYucHVzaCgnOm5vdChbZGF0YS1maWx0ZXItJyArICQodGhpcykudmFsKCkgKyAnXSknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJy5qcy1oeXBvdGhlY19faXRlbScgKyBmLmpvaW4oJycpKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnPHN0eWxlPicgKyBzdHlsZS5qb2luKCcnKSArICc8L3N0eWxlPicpLmFwcGVuZFRvKCdoZWFkJylcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGF5bWVudChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgLSBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlLCBhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjcmVkaXQgKiAoKHJhdGUgLyAxMjAwLjApIC8gKDEuMCAtIE1hdGgucG93KDEuMCArIHJhdGUgLyAxMjAwLjAsIC0oYWdlICogMTIpKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UHJpY2UocHJpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByaWNlLnRvU3RyaW5nKCkucmVwbGFjZSgvLi9nLCBmdW5jdGlvbiAoYywgaSwgYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgJiYgYyAhPT0gXCIuXCIgJiYgISgoYS5sZW5ndGggLSBpKSAlIDMpID8gJyAnICsgYyA6IGM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zaG93LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0ID0gJCh0aGlzKS5wYXJlbnRzKCcuanMtaHlwb3RoZWMnKS5maW5kKCcuanMtaHlwb3RoZWNfX3Nob3ctdGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgIGlmICgkdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RGF0ZXBpY2tlcigpIHtcclxuICAgICAgICB2YXIgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY29tbW9uT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICd0b3AgbGVmdCcsXHJcbiAgICAgICAgICAgIG9uU2hvdzogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25IaWRlOiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgdGltZXBpY2tlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0ZVRpbWVTZXBhcmF0b3I6ICcsICcsXHJcbiAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICQoJy5qcy1kYXRlcGlja2VyLXJhbmdlJykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgcmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgIG11bHRpcGxlRGF0ZXNTZXBhcmF0b3I6ICcgLSAnLFxyXG4gICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAkKCcuanMtZGF0ZXRpbWVwaWNrZXIsIC5qcy1kYXRlcGlja2VyLXJhbmdlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZXBpY2tlclZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlcGlja2VyID0gJCgnLmpzLWRhdGV0aW1lcGlja2VyLCAuanMtZGF0ZXBpY2tlci1yYW5nZScpLmRhdGEoJ2RhdGVwaWNrZXInKTtcclxuICAgICAgICAgICAgICAgIGRhdGVwaWNrZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNjcm9sbGJhcigpIHtcclxuICAgICAgICAkKCcuanMtc2Nyb2xsYmFyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgdmFyIHcgPSAkKHdpbmRvdykub3V0ZXJXaWR0aCgpO1xyXG4gICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAmJiB3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZFxyXG4gICAgICAgICAgICAgICAgICAgICYmICQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zY3JvbGxiYXItaG90Jykuc2Nyb2xsYmFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9GA0L7QutGA0YPRgtC60LAg0L/QviDRgdGB0YvQu9C60LUg0LTQviDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRTY3JvbGwoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKCQodGhpcykuYXR0cignaHJlZicpKTtcclxuICAgICAgICAgICAgaWYgKCR0YXJnZXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHRhcmdldC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXInKS5vdXRlckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBvZmZzZXR9LCAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbml0QWJvdXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIHZlcnRpY2FsOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNTBweCcsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWFib3V0LWh5c3RvcnlfX2NvbnRlbnQtc2xpZGVyJyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJykub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuX3NpYmxpbmcnKS5yZW1vdmVDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLm5leHQoKS5hZGRDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLnByZXYoKS5hZGRDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9fY29udGVudC1zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInLFxyXG4gICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGaWxlaW5wdXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbGVpbnB1dF9fY250JykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnZGVmYXVsdCcsICQodGhpcykudGV4dCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZmlsZWlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSAkKHRoaXMpLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5qcy1maWxlaW5wdXRfX2NudCcpLnRleHQoZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFudGlzcGFtKCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZW1haWwzXCJdLGlucHV0W25hbWU9XCJpbmZvXCJdLGlucHV0W25hbWU9XCJ0ZXh0XCJdJykuYXR0cigndmFsdWUnLCAnJykudmFsKCcnKTtcclxuICAgICAgICB9LCA1MDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWxwaGFiZXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFscGhhYmV0IGlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFscGhhYmV0IGxpJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hbHBoYWJldCBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWxwaGFiZXQgbGknKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtU2VhcmNoMiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIG1TZWFyY2gyLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGY4O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lJaXdpYzI5MWNtTmxjeUk2V3lKamIyMXRiMjR1YW5NaVhTd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lhbEYxWlhKNUtHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJRndpZFhObElITjBjbWxqZEZ3aU8xeHlYRzVjY2x4dUlDQWdJQ1FvWkc5amRXMWxiblFwTG5KbFlXUjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVYSEpjYmlBZ0lDQjlLVHRjY2x4dUlDQWdJRnh5WEc1OUtUc2lYU3dpWm1sc1pTSTZJbU52YlcxdmJpNXFjeUo5Il0sImZpbGUiOiJjb21tb24uanMifQ==
