$(document).ready(function () {
    app.initialize();
});

var app = {
    initialized: false,

    initialize: function () {
        $('.js-hide-empty').each(function () {
            if (!$(this).find('.js-hide-empty__cnt > *').length) {
                $(this).remove();
            }
        });
        this.initPseudoSelect();
        this.initPseudoSelectSearch();
        this.initTabs();
        this.initChess();
        this.initChessFilter();
        this.initialized = true;
    },

    initPseudoSelect: function () {
        // custom select
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
    },

    initPseudoSelectSearch: function () {
        // custom select search
        $('.js-select-search').each(function (index, element) {
            var $items = $(element).find('.js-select-search__item');
            $(element).find('.js-select-search__input')
                    .on('keyup', function () {
                        var query = $(this).val().trim().toLowerCase();
//                console.log(query);
                        if (query.length) {
                            $items.each(function () {
                                $(this).data('select-search').toLowerCase().indexOf(query) === 0 ? $(this).show() : $(this).hide();
                            });
                        } else {
                            $items.show();
                        }
                    })
                    .on('change', function () {
                        // need for mFilter2
                        return false;
                    });
        });
    },

    initTabs: function () {
        $('.js-tabs').each(function (index, elem) {
            var tabsSelector = typeof $(elem).data('tabs') === 'undefined' ? '.js-tabs__list > li' : $(elem).data('tabs');
            var $select = $(elem).find('.js-tabs__select'), withSelect = $select.length;
            $(elem).easytabs({
                // для вложенных табов используем data
                tabs: tabsSelector,
                panelContext: $(elem).hasClass('js-tabs_disconnected') ? $('.js-tabs__content') : $(elem)
            });
            if (withSelect) {
                $(tabsSelector).find('a').each(function () {
                    var value = $(this).attr('href'),
                        text = $(this).data('select') || $(this).text();
                    $select.append('<option value="'+value+'">'+text+'</option>');
                });
                $select.on('change', function () {
                    $(elem).easytabs('select', $(this).val());
                });
            }
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                if (withSelect) {
                    $select.val($clicked.attr('href')).change();
                }
                $target.find('.slick-initialized').slick('setPosition');
                $target.find('.js-select2').select2();
            });
        });
    },

    initChess: function () {
        if ($(window).outerWidth() >= appConfig.breakpoint.lg) {
            $('.js-chess-tooltip__content').parent().hover(app.showChessTooltip, app.hideChessTooltip);
        }
        var $target = {
            title: $('.js-chess-info__title'),
            area: $('.js-chess-info__area'),
            price: $('.js-chess-info__price'),
            pricePerSquare: $('.js-chess-info__pricePerSquare'),
            floor: $('.js-chess-info__floor'),
            floorsTotal: $('.js-chess-info__floorsTotal'),
        },
                $hypothec = $('.js-chess-info__hypothec'),
                $hypothecWrapper = $('.js-chess-info__hypothec-wrapper'),
                $imgFlat = $('.js-chess-info__imgFlat'),
                $imgFloor = $('.js-chess-info__imgFloor'),
                $tabs = $('.js-chess-info__tabs'),
                $tabFloor = $('.js-chess-info__tabFloor'),
                $tabFlat = $('.js-chess-info__tabFlat'),
                $form = $('.js-chess-info__form'),
                init = false;
        $('.js-chess-info__item._active').on('click', function () {
            var $this = $(this);
            if ($this.hasClass('_selected'))
                return;
            $('.js-chess-info__item').removeClass('_selected');
            $this.addClass('_selected');
            var data = $this.data();
            for (var key in $target) {
                $target[key].text(data[key]);
            }
            $form.val(data.form);
            if (data.hypothec) {
                $hypothec.text(data.hypothec);
                $hypothecWrapper.show();
            } else {
                $hypothecWrapper.hide();
            }
            if (data.imgFlat) {
                $imgFlat.attr('href', data.imgFlat);
                $imgFlat.find('img').attr('src', data.imgFlat);
                $imgFlat.show();
                $tabFlat.show();
            } else {
                $imgFlat.hide();
                $tabFlat.hide();
            }
            if (data.imgFloor) {
                $imgFloor.attr('href', data.imgFloor);
                $imgFloor.find('img').attr('src', data.imgFloor);
                $imgFloor.show();
                $tabFloor.show();
            } else {
                $imgFloor.hide();
                $tabFloor.hide();
            }
            if ($tabs.find('li:visible').length == 1) {
                $tabs.find('li:visible').first().find('a').click();
            }
            if (init) {
                $("html, body").animate({
                    scrollTop: $target.title.offset().top - 100
                }, 500);
            }
        });
        $('.js-chess-info__item._active').first().click();
        init = true;
    },

    $chessTooltip: null,
    $chessTooltipTimeout: null,

    showChessTooltip: function () {
        var $self = $(this);
        app.$chessTooltipTimeout = setTimeout(function () {
            var offset = $self.offset();
            app.$chessTooltip = $self.find('.js-chess-tooltip__content').clone();
            app.$chessTooltip.css({
                top: offset.top + 28,
                left: offset.left + 10,
            }).appendTo($('body')).addClass('_active');
        }, 300);
    },

    hideChessTooltip: function () {
        clearTimeout(app.$chessTooltipTimeout);
        app.$chessTooltip.remove();
    },

    initChessFilter: function () {
        var $form = $('.js-chess-filter'),
                $items = $('.js-chess-filter__item'),
                areaMin = null, areaMax = null,
                priceMin = null, priceMax = null,
                total = $items.length - $items.filter('._sold').length;
        if ($form.length === 0 || $items.length === 0)
            return;
        this.setChessTotal(total);
        $items.filter('[data-filter-area]').each(function () {
            var area = Math.round(parseFloat($(this).data('filter-area')));
            if (!areaMin || area < areaMin) {
                areaMin = area;
            }
            if (!areaMax || area > areaMax) {
                areaMax = area;
            }
        });
        $items.filter('[data-filter-price]').each(function () {
            var price = parseInt($(this).data('filter-price'));
            if (!priceMin || price < priceMin) {
                priceMin = price;
            }
            if (!priceMax || price > priceMax) {
                priceMax = price;
            }
        });
        $form.find('[name="area_min"]').attr('value', areaMin).attr('min', areaMin).attr('max', areaMax);
        $form.find('[name="area_max"]').attr('value', areaMax).attr('min', areaMin).attr('max', areaMax);
        $form.find('[name="price_min"]').attr('value', priceMin).attr('min', priceMin).attr('max', priceMax);
        $form.find('[name="price_max"]').attr('value', priceMax).attr('min', priceMin).attr('max', priceMax);
        $form.find('[name="rooms"]').each(function () {
            if ($items.filter('[data-filter-rooms="' + $(this).val() + '"]').length == 0) {
                $(this).parent().remove();
            }
        });

        $form.find('input').on('change', function () {
            var formData = $form.serializeArray(),
                    filters = {
                        area: [areaMin, areaMax],
                        price: [priceMin, priceMax],
                        rooms: []
                    };
//            console.log(formData);
            $.each(formData, function (n, v) {
                if (v.name == 'area_min' && v.value != areaMin) {
                    filters.area[0] = parseInt(v.value);
                }
                if (v.name == 'area_max' && v.value != areaMax) {
                    filters.area[1] = parseInt(v.value);
                }
                if (v.name == 'price_min' && v.value != priceMin) {
                    filters.price[0] = parseInt(v.value);
                }
                if (v.name == 'price_max' && v.value != priceMax) {
                    filters.price[1] = parseInt(v.value);
                }
                if (v.name == 'rooms') {
                    filters.rooms.push(v.value);
                }
            });
            if (filters.area[0] == areaMin && filters.area[1] == areaMax)
                delete filters.area;
            if (filters.price[0] == priceMin && filters.price[1] == priceMax)
                delete filters.price;
            if (filters.rooms.length == 0)
                delete filters.rooms;
//            console.log(filters);

            if (Object.keys(filters).length) {
                $items.addClass('_filtered');
                $items.each(function () {
                    var filtered = true, $_item = $(this);
                    $.each(filters, function (k, v) {
                        switch (k) {
                            case 'area':
                                if (typeof ($_item.data('filter-area')) !== 'undefined') {
                                    var area = Math.round(parseFloat($_item.data('filter-area')));
                                    if (area < v[0] || area > v[1]) {
                                        filtered = false;
                                    }
                                } else {
                                    filtered = false;
                                }
                                break;
                            case 'price':
                                if (typeof ($_item.data('filter-price')) !== 'undefined') {
                                    var price = Math.round(parseFloat($_item.data('filter-price')));
                                    if (price < v[0] || price > v[1]) {
                                        filtered = false;
                                    }
                                } else {
                                    filtered = false;
                                }
                                break;
                            case 'rooms':
                                if (typeof ($_item.data('filter-rooms')) === 'undefined' || v.indexOf($_item.data('filter-rooms').toString()) === -1) {
                                    filtered = false;
                                }
                                break;
                        }
                    })
                    if (filtered) {
                        $(this).removeClass('_filtered');
                    }
                });
                app.setChessTotal($items.length - $items.filter('._filtered').length);
            } else {
                $items.removeClass('_filtered');
                app.setChessTotal(total);
            }

        });
    },

    setChessTotal: function (total) {
        var endings = ['квартира', 'квартиры', 'квартир'];
        $('.js-chess-filter__total').text(total + ' ' + app.getNumEnding(total, endings));
    },

    /**
     * Функция возвращает окончание для множественного числа слова на основании числа и массива окончаний
     * param  iNumber Integer Число на основе которого нужно сформировать окончание
     * param  aEndings Array Массив слов или окончаний для чисел (1, 4, 5),
     *         например ['яблоко', 'яблока', 'яблок']
     * return String
     * 
     * https://habrahabr.ru/post/105428/
     */
    getNumEnding: function (iNumber, aEndings)
    {
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
    },

}

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
            $full.find('.js-agents-slider__full__phone a').text(phone).attr('href', 'tel:' + phone.replace(/[-\s()]/g, ''));
            var mail = $agent.data('agent-mail');
            $full.find('.js-agents-slider__full__mail a').text(mail).attr('href', 'mailto:' + mail);
            var url = $agent.data('agent-url');
            $full.find('.js-agents-slider__full__url a').attr('href', url);
            $('.js-agents-slider__url').attr('href', url);
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
        $('.js-mask__square_filter').inputmask("numeric", {
            suffix: ' м²',
            unmaskAsNumber: false
        });
        $('.js-mask__currency_filter').inputmask("numeric", {
            suffix: ' руб.',
            unmaskAsNumber: false
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
        $(document).on('mse2_load', function (e, data) {
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
                if ($(elem).hasClass('js-chess-range')) {
                    slider.noUiSlider.on('end', function (values, handle) {
                        $('[name="price_max"]').trigger('change');
                    });
                }
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
            infinite: true,
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
                infinite: true,
                swipeToSlide: true,
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
            },
            onSelect: function (formattedDate, date, inst) {
                inst.$el.trigger('change');
            }
        };
        $('.js-datetimepicker').datepicker(Object.assign({
            minDate: new Date(),
            timepicker: true,
            dateTimeSeparator: ', ',
        }, commonOptions));
        $('.js-datepicker-range').each(function (el) {
            var min = new Date($(this).data('min')) || null,
                    max = new Date($(this).data('max')) || new Date();
            $(this).datepicker(Object.assign({
                minDate: min,
                maxDate: max,
                range: true,
                multipleDatesSeparator: ' - ',
            }, commonOptions));
            var datepicker = $(this).data('datepicker');
            datepicker.selectDate([min, max]);
        });
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3QoKTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3RTZWFyY2goKTtcclxuICAgICAgICB0aGlzLmluaXRUYWJzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3MoKTtcclxuICAgICAgICB0aGlzLmluaXRDaGVzc0ZpbHRlcigpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0U2VhcmNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdCBzZWFyY2hcclxuICAgICAgICAkKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0JylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID09PSAwID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgZm9yIG1GaWx0ZXIyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFRhYnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciB0YWJzU2VsZWN0b3IgPSB0eXBlb2YgJChlbGVtKS5kYXRhKCd0YWJzJykgPT09ICd1bmRlZmluZWQnID8gJy5qcy10YWJzX19saXN0ID4gbGknIDogJChlbGVtKS5kYXRhKCd0YWJzJyk7XHJcbiAgICAgICAgICAgIHZhciAkc2VsZWN0ID0gJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0JyksIHdpdGhTZWxlY3QgPSAkc2VsZWN0Lmxlbmd0aDtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICAvLyDQtNC70Y8g0LLQu9C+0LbQtdC90L3Ri9GFINGC0LDQsdC+0LIg0LjRgdC/0L7Qu9GM0LfRg9C10LwgZGF0YVxyXG4gICAgICAgICAgICAgICAgdGFiczogdGFic1NlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxDb250ZXh0OiAkKGVsZW0pLmhhc0NsYXNzKCdqcy10YWJzX2Rpc2Nvbm5lY3RlZCcpID8gJCgnLmpzLXRhYnNfX2NvbnRlbnQnKSA6ICQoZWxlbSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICh3aXRoU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAkKHRhYnNTZWxlY3RvcikuZmluZCgnYScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignaHJlZicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdzZWxlY3QnKSB8fCAkKHRoaXMpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicrdmFsdWUrJ1wiPicrdGV4dCsnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Qub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKCdzZWxlY3QnLCAkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3QudmFsKCRjbGlja2VkLmF0dHIoJ2hyZWYnKSkuY2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCdzZXRQb3NpdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRDaGVzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykucGFyZW50KCkuaG92ZXIoYXBwLnNob3dDaGVzc1Rvb2x0aXAsIGFwcC5oaWRlQ2hlc3NUb29sdGlwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiAkKCcuanMtY2hlc3MtaW5mb19fdGl0bGUnKSxcclxuICAgICAgICAgICAgYXJlYTogJCgnLmpzLWNoZXNzLWluZm9fX2FyZWEnKSxcclxuICAgICAgICAgICAgcHJpY2U6ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZScpLFxyXG4gICAgICAgICAgICBwcmljZVBlclNxdWFyZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlUGVyU3F1YXJlJyksXHJcbiAgICAgICAgICAgIGZsb29yOiAkKCcuanMtY2hlc3MtaW5mb19fZmxvb3InKSxcclxuICAgICAgICAgICAgZmxvb3JzVG90YWw6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcnNUb3RhbCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWMgPSAkKCcuanMtY2hlc3MtaW5mb19faHlwb3RoZWMnKSxcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIgPSAkKCcuanMtY2hlc3MtaW5mb19faHlwb3RoZWMtd3JhcHBlcicpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQgPSAkKCcuanMtY2hlc3MtaW5mb19faW1nRmxhdCcpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yID0gJCgnLmpzLWNoZXNzLWluZm9fX2ltZ0Zsb29yJyksXHJcbiAgICAgICAgICAgICAgICAkdGFicyA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJzJyksXHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3IgPSAkKCcuanMtY2hlc3MtaW5mb19fdGFiRmxvb3InKSxcclxuICAgICAgICAgICAgICAgICR0YWJGbGF0ID0gJCgnLmpzLWNoZXNzLWluZm9fX3RhYkZsYXQnKSxcclxuICAgICAgICAgICAgICAgICRmb3JtID0gJCgnLmpzLWNoZXNzLWluZm9fX2Zvcm0nKSxcclxuICAgICAgICAgICAgICAgIGluaXQgPSBmYWxzZTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbS5fYWN0aXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ19zZWxlY3RlZCcpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbScpLnJlbW92ZUNsYXNzKCdfc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICR0YXJnZXRba2V5XS50ZXh0KGRhdGFba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJGZvcm0udmFsKGRhdGEuZm9ybSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmh5cG90aGVjKSB7XHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWMudGV4dChkYXRhLmh5cG90aGVjKTtcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuaW1nRmxhdCkge1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuYXR0cignaHJlZicsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCBkYXRhLmltZ0ZsYXQpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsYXQuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmltZ0Zsb29yKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuYXR0cignaHJlZicsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgICR0YWJGbG9vci5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsb29yLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJHRhYnMuZmluZCgnbGk6dmlzaWJsZScpLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAkdGFicy5maW5kKCdsaTp2aXNpYmxlJykuZmlyc3QoKS5maW5kKCdhJykuY2xpY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkdGFyZ2V0LnRpdGxlLm9mZnNldCgpLnRvcCAtIDEwMFxyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtLl9hY3RpdmUnKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICAgICAgaW5pdCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgICRjaGVzc1Rvb2x0aXA6IG51bGwsXHJcbiAgICAkY2hlc3NUb29sdGlwVGltZW91dDogbnVsbCxcclxuXHJcbiAgICBzaG93Q2hlc3NUb29sdGlwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRzZWxmLm9mZnNldCgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcCA9ICRzZWxmLmZpbmQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykuY2xvbmUoKTtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCArIDI4LFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyAxMCxcclxuICAgICAgICAgICAgfSkuYXBwZW5kVG8oJCgnYm9keScpKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoYXBwLiRjaGVzc1Rvb2x0aXBUaW1lb3V0KTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcC5yZW1vdmUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdENoZXNzRmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRmb3JtID0gJCgnLmpzLWNoZXNzLWZpbHRlcicpLFxyXG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJCgnLmpzLWNoZXNzLWZpbHRlcl9faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IG51bGwsIGFyZWFNYXggPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBudWxsLCBwcmljZU1heCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCcuX3NvbGQnKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCRmb3JtLmxlbmd0aCA9PT0gMCB8fCAkaXRlbXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItYXJlYV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZWEgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1pbiB8fCBhcmVhIDwgYXJlYU1pbikge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IGFyZWE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFhcmVhTWF4IHx8IGFyZWEgPiBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4ID0gYXJlYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1wcmljZV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHByaWNlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItcHJpY2UnKSk7XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNaW4gfHwgcHJpY2UgPCBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXByaWNlTWF4IHx8IHByaWNlID4gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4ID0gcHJpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWluXCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWluKS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWF4XCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWF4KS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNaW4pLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIHByaWNlTWF4KS5hdHRyKCdtaW4nLCBwcmljZU1pbikuYXR0cignbWF4JywgcHJpY2VNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1yb29tcz1cIicgKyAkKHRoaXMpLnZhbCgpICsgJ1wiXScpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRmb3JtLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhOiBbYXJlYU1pbiwgYXJlYU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlOiBbcHJpY2VNaW4sIHByaWNlTWF4XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgICQuZWFjaChmb3JtRGF0YSwgZnVuY3Rpb24gKG4sIHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWluJyAmJiB2LnZhbHVlICE9IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWF4JyAmJiB2LnZhbHVlICE9IGFyZWFNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21pbicgJiYgdi52YWx1ZSAhPSBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21heCcgJiYgdi52YWx1ZSAhPSBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3Jvb21zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucm9vbXMucHVzaCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmFyZWFbMF0gPT0gYXJlYU1pbiAmJiBmaWx0ZXJzLmFyZWFbMV0gPT0gYXJlYU1heClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLmFyZWE7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnByaWNlWzBdID09IHByaWNlTWluICYmIGZpbHRlcnMucHJpY2VbMV0gPT0gcHJpY2VNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5wcmljZTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMucm9vbXMubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5yb29tcztcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhmaWx0ZXJzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5hZGRDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gdHJ1ZSwgJF9pdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goZmlsdGVycywgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhcmVhJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmVhIDwgdlswXSB8fCBhcmVhID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaWNlIDwgdlswXSB8fCBwcmljZSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Jvb21zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykpID09PSAndW5kZWZpbmVkJyB8fCB2LmluZGV4T2YoJF9pdGVtLmRhdGEoJ2ZpbHRlci1yb29tcycpLnRvU3RyaW5nKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwoJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJy5fZmlsdGVyZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q2hlc3NUb3RhbDogZnVuY3Rpb24gKHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIGVuZGluZ3MgPSBbJ9C60LLQsNGA0YLQuNGA0LAnLCAn0LrQstCw0YDRgtC40YDRiycsICfQutCy0LDRgNGC0LjRgCddO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1maWx0ZXJfX3RvdGFsJykudGV4dCh0b3RhbCArICcgJyArIGFwcC5nZXROdW1FbmRpbmcodG90YWwsIGVuZGluZ3MpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQpNGD0L3QutGG0LjRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvtC60L7QvdGH0LDQvdC40LUg0LTQu9GPINC80L3QvtC20LXRgdGC0LLQtdC90L3QvtCz0L4g0YfQuNGB0LvQsCDRgdC70L7QstCwINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGH0LjRgdC70LAg0Lgg0LzQsNGB0YHQuNCy0LAg0L7QutC+0L3Rh9Cw0L3QuNC5XHJcbiAgICAgKiBwYXJhbSAgaU51bWJlciBJbnRlZ2VyINCn0LjRgdC70L4g0L3QsCDQvtGB0L3QvtCy0LUg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INGB0YTQvtGA0LzQuNGA0L7QstCw0YLRjCDQvtC60L7QvdGH0LDQvdC40LVcclxuICAgICAqIHBhcmFtICBhRW5kaW5ncyBBcnJheSDQnNCw0YHRgdC40LIg0YHQu9C+0LIg0LjQu9C4INC+0LrQvtC90YfQsNC90LjQuSDQtNC70Y8g0YfQuNGB0LXQuyAoMSwgNCwgNSksXHJcbiAgICAgKiAgICAgICAgINC90LDQv9GA0LjQvNC10YAgWyfRj9Cx0LvQvtC60L4nLCAn0Y/QsdC70L7QutCwJywgJ9GP0LHQu9C+0LonXVxyXG4gICAgICogcmV0dXJuIFN0cmluZ1xyXG4gICAgICogXHJcbiAgICAgKiBodHRwczovL2hhYnJhaGFici5ydS9wb3N0LzEwNTQyOC9cclxuICAgICAqL1xyXG4gICAgZ2V0TnVtRW5kaW5nOiBmdW5jdGlvbiAoaU51bWJlciwgYUVuZGluZ3MpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRSYW5nZSgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5KCk7XHJcbiAgICAgICAgaW5pdEh5cG90aGVjKCk7XHJcbiAgICAgICAgaW5pdERhdGVwaWNrZXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgaW5pdFNjcm9sbCgpO1xyXG4gICAgICAgIGluaXRBYm91dCgpO1xyXG4gICAgICAgIGluaXRGaWxlaW5wdXQoKTtcclxuICAgICAgICBpbml0QWxwaGFiZXQoKTtcclxuICAgICAgICBpbml0QW50aXNwYW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICB2YXIgJGJhciA9ICQoJy5qcy1tYWluLXNsaWRlci1iYXInKSxcclxuICAgICAgICAgICAgICAgICRzbGljayA9ICQoJy5qcy1zbGlkZXItbWFpbicpLFxyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcjpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcicpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLWFnZW50cy1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5fYWN0aXZlIC5qcy1hZ2VudHMtc2xpZGVyX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHMoKV0vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIG1haWwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbWFpbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbWFpbCBhJykudGV4dChtYWlsKS5hdHRyKCdocmVmJywgJ21haWx0bzonICsgbWFpbCk7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtdXJsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX191cmwgYScpLmF0dHIoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcl9fdXJsJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoaHJlZikudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCA9PSAwID8gJCgnLmpzLW1lbnUtb3ZlcmxheScpLmhpZGUoKSA6ICQoJy5qcy1tZW51LW92ZXJsYXknKS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXIsIC5qcy1tZW51JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJy5qcy1tYXNrX190ZWwnKS5pbnB1dG1hc2soe1xyXG4gICAgICAgICAgICBtYXNrOiAnKzkgKDk5OSkgOTk5LTk5LTk5J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIElucHV0bWFzay5leHRlbmRBbGlhc2VzKHtcclxuICAgICAgICAgICAgJ251bWVyaWMnOiB7XHJcbiAgICAgICAgICAgICAgICBhdXRvVW5tYXNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2hvd01hc2tPbkhvdmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJhZGl4UG9pbnQ6IFwiLFwiLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTZXBhcmF0b3I6IFwiIFwiLFxyXG4gICAgICAgICAgICAgICAgZGlnaXRzOiAwLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dNaW51czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhdXRvR3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByaWdodEFsaWduOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fbnVtZXJpYycpLmlucHV0bWFzayhcIm51bWVyaWNcIik7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlX2ZpbHRlcicpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC8wrInLFxyXG4gICAgICAgICAgICB1bm1hc2tBc051bWJlcjogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3lfZmlsdGVyJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19hZ2UnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQu9C10YInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3BlcmNlbnQnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3ksIC5qcy1tYXNrX19zcXVhcmUsIC5qcy1tYXNrX19wZXJjZW50Jykub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgZm9yIHJlbW92ZSBzdWZmaXhcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9JbnB1dG1hc2svaXNzdWVzLzE1NTFcclxuICAgICAgICAgICAgdmFyIHYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodiA9PSAwIHx8IHYgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudmFsKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgICAgICQoXCIuanMtYWdlbnQtc2VhcmNoXCIpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2FnZW50cycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIGxhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFRvb1Nob3J0OiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcItCf0L7QttCw0LvRg9C50YHRgtCwLCDQstCy0LXQtNC40YLQtSBcIiArIChhLm1pbmltdW0gLSBhLmlucHV0Lmxlbmd0aCkgKyBcIiDQuNC70Lgg0LHQvtC70YzRiNC1INGB0LjQvNCy0L7Qu9C+0LJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWpheDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLm15anNvbi5jb20vYmlucy9va3l2aVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTogcGFyYW1zLnRlcm0sIC8vIHNlYXJjaCB0ZXJtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FnZW50X3NlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAkLm1hcChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHZhbHVlLnBhZ2V0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50OiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRTZWxlY3Rpb24sXHJcbiAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24gKG1hcmt1cCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcclxuICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcclxuICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAzLFxyXG4gICAgICAgICAgICBtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAn0L/QvtC40YHQuuKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2VsZWN0Mi1yZXN1bHQtYWdlbnRcIj48c3Ryb25nPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWdlbnQucGFnZXRpdGxlICsgJzwvc3Ryb25nPjxicj4nICsgaXRlbS5hZ2VudC52YWx1ZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRTZWxlY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5hZ2VudC5wYWdldGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1hZ2VudC1zZWFyY2gnKS5vbignc2VsZWN0MjpzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUucGFyYW1zLmRhdGE7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRhdGEuYWdlbnQudXJpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFZhbGlkYXRlKCkge1xyXG4gICAgICAgICQudmFsaWRhdG9yLmFkZE1ldGhvZChcInBob25lXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbChlbGVtZW50KSB8fCAvXlxcK1xcZFxcc1xcKFxcZHszfVxcKVxcc1xcZHszfS1cXGR7Mn0tXFxkezJ9JC8udGVzdCh2YWx1ZSk7XHJcbiAgICAgICAgfSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIG1vYmlsZSBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoZXJyb3IsIGVsZW1lbnQpIHt9LFxyXG4gICAgICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwicGhvbmVcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtdmFsaWRhdGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS52YWxpZGF0ZShvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5RmlsdGVycygpIHtcclxuICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdHlwZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXRpdGxlJykudGV4dCgkKHRoaXMpLmRhdGEoJ2ZpbHRlcnMtdGl0bGUnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBhc3N3b3JkKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtcGFzc3dvcmQnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZHJvcGJveC96eGN2Ym5cclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IFwiLi9qcy9saWJzL3p4Y3Zibi5qc1wiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcclxuICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24gKHNjcmlwdCwgdGV4dFN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyB6eGN2Ym4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh6eGN2Ym4pID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0genhjdmJuKHZhbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyk7XHJcbiAgICAgICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zIF80Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyByZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3NTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtc2xpZGVyLXJldmlld3MnKTtcclxuICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMgX2JpZycsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5sZyxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGJpZyA9ICQoJy5yZXZpZXdzX19saXN0Ll9iaWcgLnJldmlld3NfX2xpc3RfX2l0ZW0nKTtcclxuICAgICAgICB2YXIgY3VycmVudCA9IDA7XHJcbiAgICAgICAgaWYgKCRiaWcubGVuZ3RoICYmICRzbGlkZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAkc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyQmlnKCkge1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVPdXQoKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRCaWcoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItcmV2aWV3cyAuc2xpY2stY3VycmVudCAucmV2aWV3c19fbGlzdF9faXRlbV9faW5uZXInKS5jbG9uZSgpLmFwcGVuZFRvKCRiaWcpO1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAkYmlnLnBhcmVudCgpLmNzcygnaGVpZ2h0JywgJGJpZy5vdXRlckhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHkoKSB7XHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyW2RhdGEtaW5pdD1cImZhbHNlXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRvZ2dsZXJzID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19pbWctd3JhcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICAgICAkdG9nZ2xlcnMuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvdW50ZXIudGV4dChpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnaW5pdCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgkKGVsZW0pLmhhc0NsYXNzKCdqcy1jaGVzcy1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ2VuZCcsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbbmFtZT1cInByaWNlX21heFwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbi8vICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB0bzogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IGlucHV0LmlucHV0bWFzaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmJiBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLW1hc2tfX2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBnZXROdW1FbmRpbmcocGFyc2VJbnQoc2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkpLCBbJ8Kg0LPQvtC0JywgJ8Kg0LPQvtC00LAnLCAnwqDQu9C10YInXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2sub3B0aW9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdhbGxlcnkoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnktbmF2Jykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA2LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeV9fc2xpZGVyJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogM1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZ2FsbGVyeScpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgIHZhciAkc2xpZGVyID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX3NsaWRlcicpO1xyXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnQgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fY3VycmVudCcpO1xyXG4gICAgICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzd2lwZVRvU2xpZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpZGVyLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJGN1cnJlbnQudGV4dCgrK2N1cnJlbnRTbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fdG90YWwnKS50ZXh0KCRzbGlkZXIuZmluZCgnLnNsaWRlJykubGVuZ3RoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXROdW1FbmRpbmcoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SHlwb3RoZWMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29zdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jb3N0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICRjb3N0LnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXBlcmNlbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyID0gJCh0aGlzKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkYWdlID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2FnZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjcmVkaXQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY3JlZGl0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlciA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzY3JvbGwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2Nyb2xsJyk7XHJcbiAgICAgICAgICAgIHZhciByYXRlID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGUpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZU1FID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVNRS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGVNRScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlTUUpO1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gMDtcclxuICAgICAgICAgICAgdmFyIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBwZXJjZW50O1xyXG4gICAgICAgICAgICAkY29zdC5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW0ucHJvcCgnbWF4JywgY29zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IGNvc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAkKHRoaXMpLnZhbCgpICogMTAwIC8gY29zdDtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50ID4gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudCA9IDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbChjb3N0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyZWRpdCA9IGNhbGNDcmVkaXQoY29zdCwgcGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQudmFsKHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJGNyZWRpdC52YWwoY3JlZGl0KTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZmlyc3QnKS50ZXh0KGZvcm1hdFByaWNlKCRwYXltZW50U3VtLnZhbCgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aCcpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGhNRScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19lY29ub215JykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpICogMTIgKiBhZ2UgLSBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkgKiAxMiAqIGFnZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcGlja2VyJykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0ubm9VaVNsaWRlci5zZXQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjcm9sbC5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZmlsdGVycywg0LrQsNC20LTRi9C5INGB0LXQu9C10LrRgiDRhNC40LvRjNGC0YDRg9C10YIg0L7RgtC00LXQu9GM0L3QvlxyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBbXTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpbHRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZOYW1lID0gJCh0aGlzKS5kYXRhKCdoeXBvdGhlYy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2ZpbHRlci0nICsgZk5hbWU7XHJcbiAgICAgICAgICAgICAgICBzdHlsZS5wdXNoKCcuJyArIGNsYXNzTmFtZSArICd7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNoZWNrYm94ZXMgPSAkKHRoaXMpLmZpbmQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJyk7XHJcbiAgICAgICAgICAgICAgICAkY2hlY2tib3hlcy5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2hlY2tlZCA9ICRjaGVja2JveGVzLmZpbHRlcignOmNoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoZWNrZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hlY2tlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYucHVzaCgnOm5vdChbZGF0YS1maWx0ZXItJyArICQodGhpcykudmFsKCkgKyAnXSknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJy5qcy1oeXBvdGhlY19faXRlbScgKyBmLmpvaW4oJycpKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnPHN0eWxlPicgKyBzdHlsZS5qb2luKCcnKSArICc8L3N0eWxlPicpLmFwcGVuZFRvKCdoZWFkJylcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGF5bWVudChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgLSBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlLCBhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjcmVkaXQgKiAoKHJhdGUgLyAxMjAwLjApIC8gKDEuMCAtIE1hdGgucG93KDEuMCArIHJhdGUgLyAxMjAwLjAsIC0oYWdlICogMTIpKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UHJpY2UocHJpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByaWNlLnRvU3RyaW5nKCkucmVwbGFjZSgvLi9nLCBmdW5jdGlvbiAoYywgaSwgYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgJiYgYyAhPT0gXCIuXCIgJiYgISgoYS5sZW5ndGggLSBpKSAlIDMpID8gJyAnICsgYyA6IGM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zaG93LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0ID0gJCh0aGlzKS5wYXJlbnRzKCcuanMtaHlwb3RoZWMnKS5maW5kKCcuanMtaHlwb3RoZWNfX3Nob3ctdGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgIGlmICgkdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RGF0ZXBpY2tlcigpIHtcclxuICAgICAgICB2YXIgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY29tbW9uT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICd0b3AgbGVmdCcsXHJcbiAgICAgICAgICAgIG9uU2hvdzogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25IaWRlOiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRlLCBkYXRlLCBpbnN0KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0LiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgdGltZXBpY2tlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0ZVRpbWVTZXBhcmF0b3I6ICcsICcsXHJcbiAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICQoJy5qcy1kYXRlcGlja2VyLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWluJykpIHx8IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gbmV3IERhdGUoJCh0aGlzKS5kYXRhKCdtYXgnKSkgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyKE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbWluLFxyXG4gICAgICAgICAgICAgICAgbWF4RGF0ZTogbWF4LFxyXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnIC0gJyxcclxuICAgICAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQodGhpcykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICBkYXRlcGlja2VyLnNlbGVjdERhdGUoW21pbiwgbWF4XSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyLCAuanMtZGF0ZXBpY2tlci1yYW5nZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXJWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5kYXRhKCdkYXRlcGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlcGlja2VyLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTY3JvbGxiYXIoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIHZhciB3ID0gJCh3aW5kb3cpLm91dGVyV2lkdGgoKTtcclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgJiYgdyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWRcclxuICAgICAgICAgICAgICAgICAgICAmJiAkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWhvdCcpLnNjcm9sbGJhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/RgNC+0LrRgNGD0YLQutCwINC/0L4g0YHRgdGL0LvQutC1INC00L4g0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGwnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCgkKHRoaXMpLmF0dHIoJ2hyZWYnKSk7XHJcbiAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogb2Zmc2V0fSwgMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5pdEFib3V0KCkge1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcclxuICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc3MHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9zaWJsaW5nJykucmVtb3ZlQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5uZXh0KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5wcmV2KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX2NvbnRlbnQtc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJyxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmlsZWlucHV0KCkge1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXRfX2NudCcpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2RlZmF1bHQnLCAkKHRoaXMpLnRleHQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWZpbGVpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVOYW1lID0gJCh0aGlzKS52YWwoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuanMtZmlsZWlucHV0X19jbnQnKS50ZXh0KGZpbGVOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbnRpc3BhbSgpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImVtYWlsM1wiXSxpbnB1dFtuYW1lPVwiaW5mb1wiXSxpbnB1dFtuYW1lPVwidGV4dFwiXScpLmF0dHIoJ3ZhbHVlJywgJycpLnZhbCgnJyk7XHJcbiAgICAgICAgfSwgNTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFscGhhYmV0KCkge1xyXG4gICAgICAgICQoJy5qcy1hbHBoYWJldCBpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCgnLmpzLWFscGhhYmV0IGxpJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbVNlYXJjaDIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBtU2VhcmNoMi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1WEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0FnSUZ4eVhHNTlLVHNpWFN3aVptbHNaU0k2SW1OdmJXMXZiaTVxY3lKOSJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
