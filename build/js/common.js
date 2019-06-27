$(document).ready(function () {
    app.initialize();
});

var app = {
    initialized: false,
    body: $('body'),

    initialize: function () {
        $('.js-hide-empty').each(function () {
            if (!$(this).find('.js-hide-empty__cnt > *').length) {
                $(this).remove();
            }
        });
        this.initLogo();
        this.initPseudoSelect(this.body);
        this.initPseudoSelectSearch(this.body);
        this.initScrollbar();
        this.initTabs();
        this.initMask();
        this.initRange();
        this.initChess();
        this.initChessFilter();
        this.initFRPromo();
        this.initUp();
        this.initialized = true;
    },

    initUp: function () {
        var $btn = $(".js-up");
        if (!$btn.length) {
            return;
        }
        var breakpoint = $(window).outerHeight() / 2;
        $(window).on('scroll', function () {
            if ($(this).scrollTop() > breakpoint) {
                $btn.addClass('_active');
            } else {
                $btn.removeClass('_active');
            }
        });
        $btn.on('click', function () {
            $("html, body").animate({scrollTop: 0}, 500);
        });
    },
    
    initLogo: function () {
        var timeout = appConfig.logoUpdateTimeout || 3000,
                $logo = $('.js-logo'), newSrc = $logo.data('newsrc'),
                $newLogo = $('<img>');
        $newLogo.attr('src', newSrc);
        $newLogo.on('load', function () {
            setTimeout(function () {
                $logo.parent().css('width', $logo.outerWidth());
                $logo.fadeOut(function () {
                    $logo.attr('src', $newLogo.attr('src'));
                    $logo.fadeIn(function () {
                        $logo.parent().css('width', 'auto');
                    });
                });
            }, timeout);
        });
    },

    /** custom select 
     * @param $cnt container
     */
    initPseudoSelect: function ($cnt) {
        $cnt.find('.js-select').on('click', function (e) {
            e.stopPropagation();
        });
        $cnt.find('.js-select__toggler').on('click', function () {
            $('.js-select').removeClass('_active');
            $(this).parents('.js-select').addClass('_active').toggleClass('_opened');
            $('.js-select').not('._active').removeClass('_opened');
        });
        if (!app.initialized) {
            $(window).on('click', function () {
                $('.js-select').removeClass('_opened _active');
            });
        }
    },

    /** custom select search
     * @param $cnt container
     */
    initPseudoSelectSearch: function ($cnt) {
        $cnt.find('.js-select-search').each(function (index, element) {
            var $items = $(element).find('.js-select-search__item');
            $(element).find('.js-select-search__input')
                    .on('keyup', function () {
                        var query = $(this).val().trim().toLowerCase();
//                console.log(query);
                        if (query.length) {
                            $items.each(function () {
                                $(this).data('select-search').toLowerCase().indexOf(query) != -1 ? $(this).show() : $(this).hide();
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
    
    initScrollbar: function () {
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
    },

    initTabs: function () {
        $('.js-tabs').each(function (index, elem) {
            var tabsSelector = typeof $(elem).data('tabs') === 'undefined' ? '.js-tabs__list > li' : $(elem).data('tabs');
            var $select = $(elem).find('.js-tabs__select'), withSelect = $select.length;
            $(elem).easytabs({
                // для вложенных табов используем data
                tabs: tabsSelector,
                panelContext: $(elem).hasClass('js-tabs_disconnected') ? $('.js-tabs__content') : $(elem),
                updateHash: false,
            });
            if (withSelect) {
                $(elem).find(tabsSelector).find('a').each(function () {
                    var value = $(this).attr('href'),
                            text = $(this).data('select') || $(this).text();
                    $select.append('<option value="' + value + '">' + text + '</option>');
                });
                $select.on('change', function () {
                    $(elem).easytabs('select', $(this).val());
                });
            }
            $(elem).find(tabsSelector).find('a:not(.disabled)').first().click();
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                if (withSelect) {
                    $select.val($clicked.attr('href')).change();
                }
                $target.find('.slick-initialized').slick('setPosition');
                $target.find('.js-select2').select2();
            });
        });
    },

    initMask: function () {
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
    },

    initRange: function () {
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
                        var suffix = app.getNumEnding(parseInt(slider.noUiSlider.get()), [' год', ' года', ' лет']);
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
                $priceWrapper = $('.js-chess-info__price-wrapper'),
                $pricePerSquareWrapper = $('.js-chess-info__pricePerSquare-wrapper'),
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
            data.price != 0 ? $priceWrapper.show() : $priceWrapper.hide();
            data.pricePerSquare != 0 ? $pricePerSquareWrapper.show() : $pricePerSquareWrapper.hide();
            if ($('.js-hypothec__cost').length > 0) {
                $('.js-hypothec__cost').val(data.filterPrice).trigger('change');
                $('.js-hypothec__payment-sum').val(data.filterPrice / 2).trigger('change');
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
        // chess link in filter result
        function initLink() {
            if (typeof (mSearch2) != 'undefined') {
                $('.js-chess__link').on('click', function () {
                    var query = $.param(mSearch2.getFilters());
                    // window.location = $(this).attr('href') + '?' + query;
                    window.open($(this).attr('href') + '?' + query, '_blank');
                    return false;
                });
            }
        }
        initLink();
        $(document).on('mse2_load', function (e, data) {
            initLink();
        });

        var $form = $('.js-chess-filter'),
                $items = $('.js-chess-filter__item'),
                areaMin = null, areaMax = null,
                priceMin = null, priceMax = null,
                sliderPrice = $form.find('[name="price_min"]').parents('.js-range').find('.js-range__target')[0],
                sliderArea = $form.find('[name="area_min"]').parents('.js-range').find('.js-range__target')[0],
                total = $items.length - $items.filter('._sold').length;
        if ($form.length === 0 || $items.length === 0)
            return;
        this.setChessTotal(total);
        $items.filter('[data-filter-area]').each(function () {
            var area = parseFloat($(this).data('filter-area'));
            if (!areaMin || area < areaMin) {
                areaMin = Math.floor(area);
            }
            if (!areaMax || area > areaMax) {
                areaMax = Math.ceil(area);
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
            if ($items.filter('[data-filter-rooms="' + $(this).val() + '"]').length === 0) {
                $(this).parent().remove();
            }
        });
        sliderPrice.noUiSlider.updateOptions({
            start: [
                priceMin,
                priceMax
            ],
            range: {
                'min': priceMin,
                'max': priceMax
            }
        }, true // Boolean 'fireSetEvent'
                );
        sliderArea.noUiSlider.updateOptions({
            start: [
                areaMin,
                areaMax
            ],
            range: {
                'min': areaMin,
                'max': areaMax
            }
        }, true // Boolean 'fireSetEvent'
                );

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
                                if (typeof ($_item.data('filter-price')) !== 'undefined' && $_item.data('filter-price') !== '') {
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

        // handle get filters
        var filters = {}, hash, hashes;
        hashes = decodeURIComponent(window.location.search.substr(1));
        if (hashes.length) {
            hashes = hashes.split('&');
            for (var i in hashes) {
                if (hashes.hasOwnProperty(i)) {
                    hash = hashes[i].split('=');
                    if (typeof hash[1] != 'undefined') {
                        filters[hash[0]] = hash[1];
                    }
                }
            }
            // console.log(filters);
            if (filters.length !== 0) {
                if (typeof (filters.komnatnye) != 'undefined') {
                    var rooms = filters['komnatnye'].split(',');
                    $.each(rooms, function (i, v) {
                        var input = $form.find('[name="rooms"]').filter('[value="' + v + '"]');
                        if (input) {
                            input.prop('checked', true);
                        }
                    });
                    // $form.find('[name="rooms"]').filter('[value="' + filters.komnatnye + '"]').prop('checked', true);
                }
                if (typeof (filters['appchessresidential|area']) != 'undefined') {
                    var area = filters['appchessresidential|area'].split(',');
                    sliderArea.noUiSlider.set(area);
                }
                if (typeof (filters['appchessresidential|price']) != 'undefined') {
                    var price = filters['appchessresidential|price'].split(',');
                    sliderPrice.noUiSlider.set(price);
                }
                $form.find('[name="rooms"]').trigger('change');
            }
        }

    },

    setChessTotal: function (total) {
        var endings = ['квартира', 'квартиры', 'квартир'];
        $('.js-chess-filter__total').text(total + ' ' + app.getNumEnding(total, endings));
    },

    /**
     * fixed right promo
     */
    initFRPromo: function () {
        var $cnt = $('.js-fr');
        if (!$cnt.length) {
            return;
        }
        $('.js-fr__toggler').on('click', function () {
            $cnt.toggleClass('_active');
        });
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
    getNumEnding: function (iNumber, aEndings) {
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
        initPopup();
        initSelect();
        initValidate();
        initRealtyFilters();
        initRealty();
//        initPassword();
        initEasyPassword();
        initGallery();
        initHypothec();
        initDatepicker();
        initScroll();
        initAbout();
        initFileinput();
        initAlphabet();
        initAntispam();
        initReviews();
    });

    $(window).on('resize', function () {
        initSmallSliders();
//        initMenu();
    });

    $(document).on('pdopage_load', function (e, config, response) {
        initReviews();
    });

    function initMainSlider() {
        var time = appConfig.sliderAutoplaySpeed / 1000;
        $('.js-slider-main').each(function () {
            var $bar = $(this).find('.js-slider-main__bar'),
                    $slick = $(this).find('.js-slider-main__slider'),
                    isPause = false,
                    tick,
                    percentTime;

            if ($slick.length === 0) {
                return;
            }
            var total = $slick.find('.slide').length

            $slick.slick({
                dots: total > 1,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                adaptiveHeight: true,
                speed: appConfig.sliderFadeSpeed
                        //            autoplaySpeed: appConfig.sliderAutoplaySpeed,
            });

            if (total === 1) {
                $bar.parent().remove();
                return;
            }

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
//                return false;
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
        });



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
            $full.find('.js-agents-slider__full__phone a')
                    .text(phone.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5'))
                    .attr('href', 'tel:' + phone.replace(/[-\s()]/g, ''));
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
            if (href) {
                $('.js-menu-toggler[href="' + href + '"]').toggleClass('_active');
            } else {
                href = $(this).data('href');
                $('.js-menu-toggler[data-href="' + href + '"]').toggleClass('_active');
            }
            $(href).toggleClass('_active');
            if ($('.js-menu._active').length) {
                $('.js-menu-overlay').show();
                $('body').addClass('menu-opened');
            } else {
                $('.js-menu-overlay').hide();
                $('body').removeClass('menu-opened');
            }
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

    function initPopup() {
        var options = {
            baseClass: '_popup',
            autoFocus: false,
            btnTpl: {
                smallBtn: '<span data-fancybox-close class="fancybox-close-small"><span class="link">Закрыть</span></span>',
            },
            touch: false,
        };
        $('.js-popup').on('click', function () {
            $.fancybox.close();
            var href = $(this).attr('href') || $(this).data('href');
            if (href) {
                var $target = $('#' + href.substr(1));
                var data = $(this).data();
                if ($target.length && data) {
                    for (var k in data) {
                        var $input = $target.find('[name="' + k + '"]');
                        if ($input.length) {
                            $input.val(data[k]);
                        }
                    }
                }
            }
            $.fancybox.open($target, options);
            return false;
        });
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

    /**
     * Плохой: 8 знаков, остальных проверок нет
     Средний: 10 знаков, мин одна буква, мин одна одна цифра
     Хороший: 12 знаков, плюс проверка на спецзнак и заглавную
     */
    function initEasyPassword() {
        var specials = /[!@#$%^&~]/;
        $('.js-password').on('keyup', function () {
            var val = $(this).val().trim(),
                    cnt = $(this).siblings('.input-help'),
                    score = 0;
            cnt.removeClass('_0 _1 _2 _3');
            if (val.length) {
                if (val.length >= appConfig.minPasswordLength) {
                    score = 1;
                    if (val.length >= 10 && val.search(/\d/) !== -1 && val.search(/\D/) !== -1) {
                        score = 2;
                        if (val.length >= 12 && val.search(/[A-Z]/) !== -1 && val.search(specials) !== -1) {
                            score = 3;
                        }
                    }
                }
                cnt.addClass('_' + score);
            }
        });
        $('.js-password').keyup();
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

    function initGallery() {
        $('.js-gallery-nav').slick({
            lazyLoad: 'ondemand',
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
                lazyLoad: 'ondemand',
                dots: false,
                arrows: true,
                infinite: true,
                swipeToSlide: true,
                touchThreshold: 10,
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
            var $links = $slider.find('.slide:not(.slick-cloned)');
            $(el).find('.js-gallery__total').text($links.length);
            $links.on('click', function () {
                $.fancybox.open($links, {
                    loop: true
                }, $links.index(this));

                return false;
            });
        });
    }

    function initReviews() {
        function checkOuter() {
            $('.js-reviews__outer').each(function () {
                var $inner = $(this).find('.js-reviews__inner');
                if ($inner.outerHeight() <= $(this).outerHeight()) {
                    $(this).parents('.js-reviews').removeClass('_fade');
                } else {
                    $(this).parents('.js-reviews').addClass('_fade');
                }
            });
        }
        function roll($item) {
            if (!$item.hasClass('_fade')) {
                return;
            }
            var $toggler = $item.find('.js-reviews__toggler');
            var height = null;
            if ($item.hasClass('_opened')) {
                height = $item.data('height');
                $toggler.text($toggler.data('rolldown'));
                $item.animate({height: height}, 400, function () {
                    $item.removeClass('_opened');
                    $item.css('height', '');
                });
            } else {
                var $parent = $item.parent().height($item.outerHeight());
                var $clone = $item.clone().addClass('_cloned').width($item.outerWidth()).appendTo($parent);
                height = $clone.outerHeight();
                $clone.remove();
                $item.data('height', $item.outerHeight());
                $item.addClass('_opened');
                $item.animate({height: height}, 400, function () {
                    $toggler.text($toggler.data('rollup'));
                });
            }
        }
        $('.js-reviews__toggler, .js-reviews__outer').on('click', function () {
            roll($(this).parents('.js-reviews'));
        });
        $(window).on('resize', function () {
            $('.js-reviews').removeClass('_opened').css('height', '');
            $('.js-reviews__toggler').each(function () {
                $(this).text($(this).data('rolldown'));
            });
            checkOuter();
        });
        checkOuter();
        $('.js-reviews').each(function () {
            var $links = $(this).find('.js-reviews__slide');
            $links.on('click', function () {
                $.fancybox.open($links, {
                    loop: true
                }, $links.index(this));
                return false;
            });
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
        var style = [];
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
                    $scroll = $(this).find('.js-hypothec__scroll'),
                    $total = $(this).find('.js-hypothec__show-target');
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
                oncomplete: recalcPayments
            });
            $cost.on("change", recalcPayments);
            function recalcPayments() {
                cost = $(this).val();
                $paymentSum.prop('max', cost);
                $paymentSumPicker.noUiSlider.updateOptions({
                    range: {
                        'min': 0,
                        'max': cost
                    }
                });
                $paymentSumPicker.noUiSlider.set(cost / 2);
                $paymentSum.trigger('change');
            }
            ;
            $paymentSum.on('change', function () {
                percent = $(this).val() * 100 / cost;
                if (percent > 100) {
                    percent = 100;
                    $(this).val(cost);
                }
                credit = calcCredit(cost, percent);
                $paymentPercent.val(percent).trigger('change');
                $credit.val(credit).trigger('change');
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
            $scroll.find('.hypothec-list__item').each(function (i) {
                $(this).find('.hypothec-list__item__inner').on('click', function (e) {
                    e.preventDefault();
                    console.log(i)
                    $slider.slick('slickGoTo', i);
                });
            });
            // filters, каждый селект фильтрует отдельно
            $(this).find('.js-hypothec__filter').each(function () {
                var fName = $(this).data('hypothec-filter'),
                        className = 'filter-' + fName;
                style.push('.' + className + '{display:none !important}');
                // псевдоселекты
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
                    setTotal($total, $items);
                });
            });
            // инпуты
            $paymentPercent.on('change', function () {
                var val = parseInt($(this).val()), className = 'filter-first';
                $items.filter('[data-filter-first]').each(function () {
                    if (parseInt($(this).data('filter-first')) > val) {
                        $(this).addClass(className);
                    } else {
                        $(this).removeClass(className);
                    }
                });
            }).trigger('change');
            $credit.on('change', function () {
                var val = parseInt($(this).val()), className = 'filter-min';
                $items.filter('[data-filter-min]').each(function () {
                    if (parseInt($(this).data('filter-min')) > val) {
                        $(this).addClass(className);
                    } else {
                        $(this).removeClass(className);
                    }
                });
                setTotal($total, $items);
            }).trigger('change');
            style.push('.filter-minyear{display:none !important}');
            style.push('.filter-maxyear{display:none !important}');
            $age.on('change', function () {
                var val = parseInt($(this).val());
                $items.filter('[data-filter-minyear]').each(function () {
                    if (parseInt($(this).data('filter-minyear')) > val) {
                        $(this).addClass('filter-minyear');
                    } else {
                        $(this).removeClass('filter-minyear');
                    }
                });
                $items.filter('[data-filter-maxyear]').each(function () {
                    if (parseInt($(this).data('filter-maxyear')) < val) {
                        $(this).addClass('filter-maxyear');
                    } else {
                        $(this).removeClass('filter-maxyear');
                    }
                });
                setTotal($total, $items);
            }).trigger('change');
        });
        if (style.length) {
            var uniqueStyle = [];
            $.each(style, function (i, el) {
                if ($.inArray(el, uniqueStyle) === -1) {
                    uniqueStyle.push(el);
                }
            });
            $('<style>' + uniqueStyle.join('') + '</style>').appendTo('head')
        }

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
        function setTotal($target, $items) {
            var total = $items.length - $items.filter('[class*="filter"]').length;
            var a = getNumEnding(total, ['Найдена', 'Найдено', 'Найдено']);
            var b = getNumEnding(total, ['ипотечная программа', 'ипотечные программы', 'ипотечных программ']);
            $target.text([a, total, b].join(' '));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgYm9keTogJCgnYm9keScpLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRMb2dvKCk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0KHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0U2VhcmNoKHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VGFicygpO1xyXG4gICAgICAgIHRoaXMuaW5pdE1hc2soKTtcclxuICAgICAgICB0aGlzLmluaXRSYW5nZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdENoZXNzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3NGaWx0ZXIoKTtcclxuICAgICAgICB0aGlzLmluaXRGUlByb21vKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VXAoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRidG4gPSAkKFwiLmpzLXVwXCIpO1xyXG4gICAgICAgIGlmICghJGJ0bi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYnJlYWtwb2ludCA9ICQod2luZG93KS5vdXRlckhlaWdodCgpIC8gMjtcclxuICAgICAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCQodGhpcykuc2Nyb2xsVG9wKCkgPiBicmVha3BvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAkYnRuLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkYnRuLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZSh7c2Nyb2xsVG9wOiAwfSwgNTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGluaXRMb2dvOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBhcHBDb25maWcubG9nb1VwZGF0ZVRpbWVvdXQgfHwgMzAwMCxcclxuICAgICAgICAgICAgICAgICRsb2dvID0gJCgnLmpzLWxvZ28nKSwgbmV3U3JjID0gJGxvZ28uZGF0YSgnbmV3c3JjJyksXHJcbiAgICAgICAgICAgICAgICAkbmV3TG9nbyA9ICQoJzxpbWc+Jyk7XHJcbiAgICAgICAgJG5ld0xvZ28uYXR0cignc3JjJywgbmV3U3JjKTtcclxuICAgICAgICAkbmV3TG9nby5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9nby5wYXJlbnQoKS5jc3MoJ3dpZHRoJywgJGxvZ28ub3V0ZXJXaWR0aCgpKTtcclxuICAgICAgICAgICAgICAgICRsb2dvLmZhZGVPdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2dvLmF0dHIoJ3NyYycsICRuZXdMb2dvLmF0dHIoJ3NyYycpKTtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nby5mYWRlSW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkbG9nby5wYXJlbnQoKS5jc3MoJ3dpZHRoJywgJ2F1dG8nKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqIGN1c3RvbSBzZWxlY3QgXHJcbiAgICAgKiBAcGFyYW0gJGNudCBjb250YWluZXJcclxuICAgICAqL1xyXG4gICAgaW5pdFBzZXVkb1NlbGVjdDogZnVuY3Rpb24gKCRjbnQpIHtcclxuICAgICAgICAkY250LmZpbmQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRjbnQuZmluZCgnLmpzLXNlbGVjdF9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXNlbGVjdCcpLmFkZENsYXNzKCdfYWN0aXZlJykudG9nZ2xlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm5vdCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghYXBwLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICQod2luZG93KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKiBjdXN0b20gc2VsZWN0IHNlYXJjaFxyXG4gICAgICogQHBhcmFtICRjbnQgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIGluaXRQc2V1ZG9TZWxlY3RTZWFyY2g6IGZ1bmN0aW9uICgkY250KSB7XHJcbiAgICAgICAgJGNudC5maW5kKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0JylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpICE9IC0xID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgZm9yIG1GaWx0ZXIyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGluaXRTY3JvbGxiYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtc2Nyb2xsYmFyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgdmFyIHcgPSAkKHdpbmRvdykub3V0ZXJXaWR0aCgpO1xyXG4gICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAmJiB3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZFxyXG4gICAgICAgICAgICAgICAgICAgICYmICQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZCcpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3IDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zY3JvbGxiYXItaG90Jykuc2Nyb2xsYmFyKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRUYWJzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXRhYnMnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgdGFic1NlbGVjdG9yID0gdHlwZW9mICQoZWxlbSkuZGF0YSgndGFicycpID09PSAndW5kZWZpbmVkJyA/ICcuanMtdGFic19fbGlzdCA+IGxpJyA6ICQoZWxlbSkuZGF0YSgndGFicycpO1xyXG4gICAgICAgICAgICB2YXIgJHNlbGVjdCA9ICQoZWxlbSkuZmluZCgnLmpzLXRhYnNfX3NlbGVjdCcpLCB3aXRoU2VsZWN0ID0gJHNlbGVjdC5sZW5ndGg7XHJcbiAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoe1xyXG4gICAgICAgICAgICAgICAgLy8g0LTQu9GPINCy0LvQvtC20LXQvdC90YvRhSDRgtCw0LHQvtCyINC40YHQv9C+0LvRjNC30YPQtdC8IGRhdGFcclxuICAgICAgICAgICAgICAgIHRhYnM6IHRhYnNTZWxlY3RvcixcclxuICAgICAgICAgICAgICAgIHBhbmVsQ29udGV4dDogJChlbGVtKS5oYXNDbGFzcygnanMtdGFic19kaXNjb25uZWN0ZWQnKSA/ICQoJy5qcy10YWJzX19jb250ZW50JykgOiAkKGVsZW0pLFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlSGFzaDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5maW5kKHRhYnNTZWxlY3RvcikuZmluZCgnYScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignaHJlZicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9ICQodGhpcykuZGF0YSgnc2VsZWN0JykgfHwgJCh0aGlzKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNlbGVjdC5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgdmFsdWUgKyAnXCI+JyArIHRleHQgKyAnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Qub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKCdzZWxlY3QnLCAkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoZWxlbSkuZmluZCh0YWJzU2VsZWN0b3IpLmZpbmQoJ2E6bm90KC5kaXNhYmxlZCknKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3QudmFsKCRjbGlja2VkLmF0dHIoJ2hyZWYnKSkuY2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCdzZXRQb3NpdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRNYXNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3RlbCcpLmlucHV0bWFzayh7XHJcbiAgICAgICAgICAgIG1hc2s6ICcrOSAoOTk5KSA5OTktOTktOTknXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgSW5wdXRtYXNrLmV4dGVuZEFsaWFzZXMoe1xyXG4gICAgICAgICAgICAnbnVtZXJpYyc6IHtcclxuICAgICAgICAgICAgICAgIGF1dG9Vbm1hc2s6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzaG93TWFza09uSG92ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcmFkaXhQb2ludDogXCIsXCIsXHJcbiAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvcjogXCIgXCIsXHJcbiAgICAgICAgICAgICAgICBkaWdpdHM6IDAsXHJcbiAgICAgICAgICAgICAgICBhbGxvd01pbnVzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGF1dG9Hcm91cDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0QWxpZ246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19udW1lcmljJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiKTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3knKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmUnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmVfZmlsdGVyJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsicsXHJcbiAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeV9maWx0ZXInKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJyxcclxuICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2FnZScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC70LXRgidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fcGVyY2VudCcpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICclJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeSwgLmpzLW1hc2tfX3NxdWFyZSwgLmpzLW1hc2tfX3BlcmNlbnQnKS5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gbmVlZCBmb3IgcmVtb3ZlIHN1ZmZpeFxyXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vUm9iaW5IZXJib3RzL0lucHV0bWFzay9pc3N1ZXMvMTU1MVxyXG4gICAgICAgICAgICB2YXIgdiA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgIGlmICh2ID09IDAgfHwgdiA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRSYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy1yYW5nZScpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSAkKGVsZW0pLmZpbmQoJy5qcy1yYW5nZV9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJGlucHV0cyA9ICQoZWxlbSkuZmluZCgnaW5wdXQnKSxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tID0gJGlucHV0cy5maXJzdCgpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvID0gJGlucHV0cy5sYXN0KClbMF07XHJcbiAgICAgICAgICAgIGlmIChzbGlkZXIgJiYgZnJvbSAmJiB0bykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGZyb20udmFsdWUpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KHRvLnZhbHVlKSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNuYXBWYWx1ZXMgPSBbZnJvbSwgdG9dO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXBWYWx1ZXNbaGFuZGxlXS52YWx1ZSA9IE1hdGgucm91bmQodmFsdWVzW2hhbmRsZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmcm9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQoW3RoaXMudmFsdWUsIG51bGxdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdG8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbbnVsbCwgdGhpcy52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJChlbGVtKS5oYXNDbGFzcygnanMtY2hlc3MtcmFuZ2UnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCdlbmQnLCBmdW5jdGlvbiAodmFsdWVzLCBoYW5kbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnW25hbWU9XCJwcmljZV9tYXhcIl0nKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcuanMtcGlja2VyJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQgPSAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX2lucHV0JylbMF07XHJcbiAgICAgICAgICAgIGlmIChzbGlkZXIgJiYgaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW4gPSBwYXJzZUludChpbnB1dC5nZXRBdHRyaWJ1dGUoJ21pbicpKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSBwYXJzZUludChpbnB1dC5nZXRBdHRyaWJ1dGUoJ21heCcpKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgbWluO1xyXG4gICAgICAgICAgICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHZhbCxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0OiBbdHJ1ZSwgZmFsc2VdLFxyXG4vLyAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdG86IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUpO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBzbGlkZXIubm9VaVNsaWRlci5nZXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX2lucHV0JykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBpbnB1dC5pbnB1dG1hc2s7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiYgaW5wdXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1tYXNrX19hZ2UnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3VmZml4ID0gYXBwLmdldE51bUVuZGluZyhwYXJzZUludChzbGlkZXIubm9VaVNsaWRlci5nZXQoKSksIFsnwqDQs9C+0LQnLCAnwqDQs9C+0LTQsCcsICfCoNC70LXRgiddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5vcHRpb24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdENoZXNzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWNoZXNzLXRvb2x0aXBfX2NvbnRlbnQnKS5wYXJlbnQoKS5ob3ZlcihhcHAuc2hvd0NoZXNzVG9vbHRpcCwgYXBwLmhpZGVDaGVzc1Rvb2x0aXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgJHRhcmdldCA9IHtcclxuICAgICAgICAgICAgdGl0bGU6ICQoJy5qcy1jaGVzcy1pbmZvX190aXRsZScpLFxyXG4gICAgICAgICAgICBhcmVhOiAkKCcuanMtY2hlc3MtaW5mb19fYXJlYScpLFxyXG4gICAgICAgICAgICBwcmljZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlJyksXHJcbiAgICAgICAgICAgIHByaWNlUGVyU3F1YXJlOiAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2VQZXJTcXVhcmUnKSxcclxuICAgICAgICAgICAgZmxvb3I6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcicpLFxyXG4gICAgICAgICAgICBmbG9vcnNUb3RhbDogJCgnLmpzLWNoZXNzLWluZm9fX2Zsb29yc1RvdGFsJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlYyA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYycpLFxyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlciA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYy13cmFwcGVyJyksXHJcbiAgICAgICAgICAgICAgICAkcHJpY2VXcmFwcGVyID0gJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlLXdyYXBwZXInKSxcclxuICAgICAgICAgICAgICAgICRwcmljZVBlclNxdWFyZVdyYXBwZXIgPSAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2VQZXJTcXVhcmUtd3JhcHBlcicpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQgPSAkKCcuanMtY2hlc3MtaW5mb19faW1nRmxhdCcpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yID0gJCgnLmpzLWNoZXNzLWluZm9fX2ltZ0Zsb29yJyksXHJcbiAgICAgICAgICAgICAgICAkdGFicyA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJzJyksXHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3IgPSAkKCcuanMtY2hlc3MtaW5mb19fdGFiRmxvb3InKSxcclxuICAgICAgICAgICAgICAgICR0YWJGbGF0ID0gJCgnLmpzLWNoZXNzLWluZm9fX3RhYkZsYXQnKSxcclxuICAgICAgICAgICAgICAgICRmb3JtID0gJCgnLmpzLWNoZXNzLWluZm9fX2Zvcm0nKSxcclxuICAgICAgICAgICAgICAgIGluaXQgPSBmYWxzZTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbS5fYWN0aXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ19zZWxlY3RlZCcpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbScpLnJlbW92ZUNsYXNzKCdfc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICR0YXJnZXRba2V5XS50ZXh0KGRhdGFba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJGZvcm0udmFsKGRhdGEuZm9ybSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmh5cG90aGVjKSB7XHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWMudGV4dChkYXRhLmh5cG90aGVjKTtcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGF0YS5wcmljZSAhPSAwID8gJHByaWNlV3JhcHBlci5zaG93KCkgOiAkcHJpY2VXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICAgICAgZGF0YS5wcmljZVBlclNxdWFyZSAhPSAwID8gJHByaWNlUGVyU3F1YXJlV3JhcHBlci5zaG93KCkgOiAkcHJpY2VQZXJTcXVhcmVXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICAgICAgaWYgKCQoJy5qcy1oeXBvdGhlY19fY29zdCcpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1oeXBvdGhlY19fY29zdCcpLnZhbChkYXRhLmZpbHRlclByaWNlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1oeXBvdGhlY19fcGF5bWVudC1zdW0nKS52YWwoZGF0YS5maWx0ZXJQcmljZSAvIDIpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmltZ0ZsYXQpIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0LmF0dHIoJ2hyZWYnLCBkYXRhLmltZ0ZsYXQpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuZmluZCgnaW1nJykuYXR0cignc3JjJywgZGF0YS5pbWdGbGF0KTtcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0LnNob3coKTtcclxuICAgICAgICAgICAgICAgICR0YWJGbGF0LnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICR0YWJGbGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5pbWdGbG9vcikge1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLmF0dHIoJ2hyZWYnLCBkYXRhLmltZ0Zsb29yKTtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCBkYXRhLmltZ0Zsb29yKTtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICR0YWJGbG9vci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCR0YWJzLmZpbmQoJ2xpOnZpc2libGUnKS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgJHRhYnMuZmluZCgnbGk6dmlzaWJsZScpLmZpcnN0KCkuZmluZCgnYScpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogJHRhcmdldC50aXRsZS5vZmZzZXQoKS50b3AgLSAxMDBcclxuICAgICAgICAgICAgICAgIH0sIDUwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbS5fYWN0aXZlJykuZmlyc3QoKS5jbGljaygpO1xyXG4gICAgICAgIGluaXQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICAkY2hlc3NUb29sdGlwOiBudWxsLFxyXG4gICAgJGNoZXNzVG9vbHRpcFRpbWVvdXQ6IG51bGwsXHJcblxyXG4gICAgc2hvd0NoZXNzVG9vbHRpcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXBUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkc2VsZi5vZmZzZXQoKTtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAgPSAkc2VsZi5maW5kKCcuanMtY2hlc3MtdG9vbHRpcF9fY29udGVudCcpLmNsb25lKCk7XHJcbiAgICAgICAgICAgIGFwcC4kY2hlc3NUb29sdGlwLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AgKyAyOCxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0ICsgMTAsXHJcbiAgICAgICAgICAgIH0pLmFwcGVuZFRvKCQoJ2JvZHknKSkuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICB9LCAzMDApO1xyXG4gICAgfSxcclxuXHJcbiAgICBoaWRlQ2hlc3NUb29sdGlwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KGFwcC4kY2hlc3NUb29sdGlwVGltZW91dCk7XHJcbiAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAucmVtb3ZlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRDaGVzc0ZpbHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIGNoZXNzIGxpbmsgaW4gZmlsdGVyIHJlc3VsdFxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRMaW5rKCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIChtU2VhcmNoMikgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1jaGVzc19fbGluaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkLnBhcmFtKG1TZWFyY2gyLmdldEZpbHRlcnMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2luZG93LmxvY2F0aW9uID0gJCh0aGlzKS5hdHRyKCdocmVmJykgKyAnPycgKyBxdWVyeTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cub3BlbigkKHRoaXMpLmF0dHIoJ2hyZWYnKSArICc/JyArIHF1ZXJ5LCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaW5pdExpbmsoKTtcclxuICAgICAgICAkKGRvY3VtZW50KS5vbignbXNlMl9sb2FkJywgZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgaW5pdExpbmsoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyICRmb3JtID0gJCgnLmpzLWNoZXNzLWZpbHRlcicpLFxyXG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJCgnLmpzLWNoZXNzLWZpbHRlcl9faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IG51bGwsIGFyZWFNYXggPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBudWxsLCBwcmljZU1heCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJQcmljZSA9ICRmb3JtLmZpbmQoJ1tuYW1lPVwicHJpY2VfbWluXCJdJykucGFyZW50cygnLmpzLXJhbmdlJykuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgIHNsaWRlckFyZWEgPSAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWluXCJdJykucGFyZW50cygnLmpzLXJhbmdlJykuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgIHRvdGFsID0gJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJy5fc29sZCcpLmxlbmd0aDtcclxuICAgICAgICBpZiAoJGZvcm0ubGVuZ3RoID09PSAwIHx8ICRpdGVtcy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLnNldENoZXNzVG90YWwodG90YWwpO1xyXG4gICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1hcmVhXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJlYSA9IHBhcnNlRmxvYXQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItYXJlYScpKTtcclxuICAgICAgICAgICAgaWYgKCFhcmVhTWluIHx8IGFyZWEgPCBhcmVhTWluKSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhTWluID0gTWF0aC5mbG9vcihhcmVhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWFyZWFNYXggfHwgYXJlYSA+IGFyZWFNYXgpIHtcclxuICAgICAgICAgICAgICAgIGFyZWFNYXggPSBNYXRoLmNlaWwoYXJlYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItcHJpY2VdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmljZSA9IHBhcnNlSW50KCQodGhpcykuZGF0YSgnZmlsdGVyLXByaWNlJykpO1xyXG4gICAgICAgICAgICBpZiAoIXByaWNlTWluIHx8IHByaWNlIDwgcHJpY2VNaW4pIHtcclxuICAgICAgICAgICAgICAgIHByaWNlTWluID0gcHJpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFwcmljZU1heCB8fCBwcmljZSA+IHByaWNlTWF4KSB7XHJcbiAgICAgICAgICAgICAgICBwcmljZU1heCA9IHByaWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJhcmVhX21pblwiXScpLmF0dHIoJ3ZhbHVlJywgYXJlYU1pbikuYXR0cignbWluJywgYXJlYU1pbikuYXR0cignbWF4JywgYXJlYU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJhcmVhX21heFwiXScpLmF0dHIoJ3ZhbHVlJywgYXJlYU1heCkuYXR0cignbWluJywgYXJlYU1pbikuYXR0cignbWF4JywgYXJlYU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9taW5cIl0nKS5hdHRyKCd2YWx1ZScsIHByaWNlTWluKS5hdHRyKCdtaW4nLCBwcmljZU1pbikuYXR0cignbWF4JywgcHJpY2VNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicHJpY2VfbWF4XCJdJykuYXR0cigndmFsdWUnLCBwcmljZU1heCkuYXR0cignbWluJywgcHJpY2VNaW4pLmF0dHIoJ21heCcsIHByaWNlTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInJvb21zXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItcm9vbXM9XCInICsgJCh0aGlzKS52YWwoKSArICdcIl0nKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzbGlkZXJQcmljZS5ub1VpU2xpZGVyLnVwZGF0ZU9wdGlvbnMoe1xyXG4gICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4sXHJcbiAgICAgICAgICAgICAgICBwcmljZU1heFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgJ21pbic6IHByaWNlTWluLFxyXG4gICAgICAgICAgICAgICAgJ21heCc6IHByaWNlTWF4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlIC8vIEJvb2xlYW4gJ2ZpcmVTZXRFdmVudCdcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgc2xpZGVyQXJlYS5ub1VpU2xpZGVyLnVwZGF0ZU9wdGlvbnMoe1xyXG4gICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgYXJlYU1pbixcclxuICAgICAgICAgICAgICAgIGFyZWFNYXhcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICdtaW4nOiBhcmVhTWluLFxyXG4gICAgICAgICAgICAgICAgJ21heCc6IGFyZWFNYXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRydWUgLy8gQm9vbGVhbiAnZmlyZVNldEV2ZW50J1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgJGZvcm0uZmluZCgnaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSAkZm9ybS5zZXJpYWxpemVBcnJheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWE6IFthcmVhTWluLCBhcmVhTWF4XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpY2U6IFtwcmljZU1pbiwgcHJpY2VNYXhdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tczogW11cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGZvcm1EYXRhKTtcclxuICAgICAgICAgICAgJC5lYWNoKGZvcm1EYXRhLCBmdW5jdGlvbiAobiwgdikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHYubmFtZSA9PSAnYXJlYV9taW4nICYmIHYudmFsdWUgIT0gYXJlYU1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMuYXJlYVswXSA9IHBhcnNlSW50KHYudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHYubmFtZSA9PSAnYXJlYV9tYXgnICYmIHYudmFsdWUgIT0gYXJlYU1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMuYXJlYVsxXSA9IHBhcnNlSW50KHYudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHYubmFtZSA9PSAncHJpY2VfbWluJyAmJiB2LnZhbHVlICE9IHByaWNlTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wcmljZVswXSA9IHBhcnNlSW50KHYudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHYubmFtZSA9PSAncHJpY2VfbWF4JyAmJiB2LnZhbHVlICE9IHByaWNlTWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5wcmljZVsxXSA9IHBhcnNlSW50KHYudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHYubmFtZSA9PSAncm9vbXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5yb29tcy5wdXNoKHYudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMuYXJlYVswXSA9PSBhcmVhTWluICYmIGZpbHRlcnMuYXJlYVsxXSA9PSBhcmVhTWF4KVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGZpbHRlcnMuYXJlYTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMucHJpY2VbMF0gPT0gcHJpY2VNaW4gJiYgZmlsdGVycy5wcmljZVsxXSA9PSBwcmljZU1heClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLnByaWNlO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5yb29tcy5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLnJvb21zO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbHRlcnMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGZpbHRlcnMpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmFkZENsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSB0cnVlLCAkX2l0ZW0gPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChmaWx0ZXJzLCBmdW5jdGlvbiAoaywgdikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FyZWEnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItYXJlYScpKSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyZWEgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoJF9pdGVtLmRhdGEoJ2ZpbHRlci1hcmVhJykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZWEgPCB2WzBdIHx8IGFyZWEgPiB2WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwcmljZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoJF9pdGVtLmRhdGEoJ2ZpbHRlci1wcmljZScpKSAhPT0gJ3VuZGVmaW5lZCcgJiYgJF9pdGVtLmRhdGEoJ2ZpbHRlci1wcmljZScpICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJpY2UgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoJF9pdGVtLmRhdGEoJ2ZpbHRlci1wcmljZScpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmljZSA8IHZbMF0gfHwgcHJpY2UgPiB2WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyb29tcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoJF9pdGVtLmRhdGEoJ2ZpbHRlci1yb29tcycpKSA9PT0gJ3VuZGVmaW5lZCcgfHwgdi5pbmRleE9mKCRfaXRlbS5kYXRhKCdmaWx0ZXItcm9vbXMnKS50b1N0cmluZygpKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDaGVzc1RvdGFsKCRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCcuX2ZpbHRlcmVkJykubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q2hlc3NUb3RhbCh0b3RhbCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGhhbmRsZSBnZXQgZmlsdGVyc1xyXG4gICAgICAgIHZhciBmaWx0ZXJzID0ge30sIGhhc2gsIGhhc2hlcztcclxuICAgICAgICBoYXNoZXMgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkpO1xyXG4gICAgICAgIGlmIChoYXNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhc2hlcyA9IGhhc2hlcy5zcGxpdCgnJicpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGhhc2hlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGhhc2hlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhc2hbMV0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc1toYXNoWzBdXSA9IGhhc2hbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZpbHRlcnMpO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGZpbHRlcnMua29tbmF0bnllKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByb29tcyA9IGZpbHRlcnNbJ2tvbW5hdG55ZSddLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKHJvb21zLCBmdW5jdGlvbiAoaSwgdikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSAkZm9ybS5maW5kKCdbbmFtZT1cInJvb21zXCJdJykuZmlsdGVyKCdbdmFsdWU9XCInICsgdiArICdcIl0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyAkZm9ybS5maW5kKCdbbmFtZT1cInJvb21zXCJdJykuZmlsdGVyKCdbdmFsdWU9XCInICsgZmlsdGVycy5rb21uYXRueWUgKyAnXCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxhcmVhJ10pICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZWEgPSBmaWx0ZXJzWydhcHBjaGVzc3Jlc2lkZW50aWFsfGFyZWEnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlckFyZWEubm9VaVNsaWRlci5zZXQoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChmaWx0ZXJzWydhcHBjaGVzc3Jlc2lkZW50aWFsfHByaWNlJ10pICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByaWNlID0gZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxwcmljZSddLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyUHJpY2Uubm9VaVNsaWRlci5zZXQocHJpY2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q2hlc3NUb3RhbDogZnVuY3Rpb24gKHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIGVuZGluZ3MgPSBbJ9C60LLQsNGA0YLQuNGA0LAnLCAn0LrQstCw0YDRgtC40YDRiycsICfQutCy0LDRgNGC0LjRgCddO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1maWx0ZXJfX3RvdGFsJykudGV4dCh0b3RhbCArICcgJyArIGFwcC5nZXROdW1FbmRpbmcodG90YWwsIGVuZGluZ3MpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaXhlZCByaWdodCBwcm9tb1xyXG4gICAgICovXHJcbiAgICBpbml0RlJQcm9tbzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkY250ID0gJCgnLmpzLWZyJyk7XHJcbiAgICAgICAgaWYgKCEkY250Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1mcl9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGNudC50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBnZXROdW1FbmRpbmc6IGZ1bmN0aW9uIChpTnVtYmVyLCBhRW5kaW5ncykge1xyXG4gICAgICAgIHZhciBzRW5kaW5nLCBpO1xyXG4gICAgICAgIGlOdW1iZXIgPSBpTnVtYmVyICUgMTAwO1xyXG4gICAgICAgIGlmIChpTnVtYmVyID49IDExICYmIGlOdW1iZXIgPD0gMTkpIHtcclxuICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGkgPSBpTnVtYmVyICUgMTA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMSk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMik6XHJcbiAgICAgICAgICAgICAgICBjYXNlICgzKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1sxXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzRW5kaW5nO1xyXG4gICAgfSxcclxuXHJcbn1cclxuXHJcbmpRdWVyeShmdW5jdGlvbiAoKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaW5pdE1haW5TbGlkZXIoKTtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbiAgICAgICAgaW5pdFJldmlld3NTbGlkZXIoKTtcclxuICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgaW5pdE1lbnUoKTtcclxuICAgICAgICBpbml0UG9wdXAoKTtcclxuICAgICAgICBpbml0U2VsZWN0KCk7XHJcbiAgICAgICAgaW5pdFZhbGlkYXRlKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eUZpbHRlcnMoKTtcclxuICAgICAgICBpbml0UmVhbHR5KCk7XHJcbi8vICAgICAgICBpbml0UGFzc3dvcmQoKTtcclxuICAgICAgICBpbml0RWFzeVBhc3N3b3JkKCk7XHJcbiAgICAgICAgaW5pdEdhbGxlcnkoKTtcclxuICAgICAgICBpbml0SHlwb3RoZWMoKTtcclxuICAgICAgICBpbml0RGF0ZXBpY2tlcigpO1xyXG4gICAgICAgIGluaXRTY3JvbGwoKTtcclxuICAgICAgICBpbml0QWJvdXQoKTtcclxuICAgICAgICBpbml0RmlsZWlucHV0KCk7XHJcbiAgICAgICAgaW5pdEFscGhhYmV0KCk7XHJcbiAgICAgICAgaW5pdEFudGlzcGFtKCk7XHJcbiAgICAgICAgaW5pdFJldmlld3MoKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbigncGRvcGFnZV9sb2FkJywgZnVuY3Rpb24gKGUsIGNvbmZpZywgcmVzcG9uc2UpIHtcclxuICAgICAgICBpbml0UmV2aWV3cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1haW5TbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCAvIDEwMDA7XHJcbiAgICAgICAgJCgnLmpzLXNsaWRlci1tYWluJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkYmFyID0gJCh0aGlzKS5maW5kKCcuanMtc2xpZGVyLW1haW5fX2JhcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGljayA9ICQodGhpcykuZmluZCgnLmpzLXNsaWRlci1tYWluX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50VGltZTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkc2xpY2subGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHRvdGFsID0gJHNsaWNrLmZpbmQoJy5zbGlkZScpLmxlbmd0aFxyXG5cclxuICAgICAgICAgICAgJHNsaWNrLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IHRvdGFsID4gMSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodG90YWwgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICRiYXIucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRzbGljay5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgICAgICAgICAkYmFyLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLnJlbW92ZUNsYXNzKCdfZmFkZSBfbGVmdCBfcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgIHN0YXJ0UHJvZ3Jlc3NiYXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkc2xpY2sub24oe1xyXG4gICAgICAgICAgICAgICAgbW91c2VlbnRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1vdXNlbGVhdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4vLyAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50VGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBpbnRlcnZhbCgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lICs9IDEgLyAodGltZSArIDAuMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGJhci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJjZW50VGltZSA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVzZXRQcm9ncmVzc2JhcigpIHtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0UHJvZ3Jlc3NiYXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U21hbGxTbGlkZXJzKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbDpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlciAuYWdlbnRzLXNsaWRlcl9faXRlbScpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXI6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcyNSUnLFxyXG4vLyAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnODBweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXInKS5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlci5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlciAuYWdlbnRzLXNsaWRlcl9faXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQoJy5qcy1hZ2VudHMtc2xpZGVyJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciAkYWdlbnQgPSAkKCcuanMtYWdlbnRzLXNsaWRlciAuX2FjdGl2ZSAuanMtYWdlbnRzLXNsaWRlcl9fc2hvcnQnKTtcclxuICAgICAgICAgICAgdmFyICRmdWxsID0gJCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGwnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX2ltZycpLmF0dHIoJ3NyYycsICRhZ2VudC5kYXRhKCdhZ2VudC1pbWcnKSk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19uYW1lJykudGV4dCgkYWdlbnQuZGF0YSgnYWdlbnQtbmFtZScpKTtcclxuICAgICAgICAgICAgdmFyIHBob25lID0gJGFnZW50LmRhdGEoJ2FnZW50LXBob25lJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19waG9uZSBhJylcclxuICAgICAgICAgICAgICAgICAgICAudGV4dChwaG9uZS5yZXBsYWNlKC9eKFxcKzcpKFxcZHszfSkoXFxkezN9KShcXGR7Mn0pKFxcZHsyfSkvLCAnJDEgKCQyKSAkMy0kNC0kNScpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHMoKV0vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIG1haWwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbWFpbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbWFpbCBhJykudGV4dChtYWlsKS5hdHRyKCdocmVmJywgJ21haWx0bzonICsgbWFpbCk7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtdXJsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX191cmwgYScpLmF0dHIoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcl9fdXJsJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgIGlmIChocmVmKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyW2hyZWY9XCInICsgaHJlZiArICdcIl0nKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaHJlZiA9ICQodGhpcykuZGF0YSgnaHJlZicpO1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcltkYXRhLWhyZWY9XCInICsgaHJlZiArICdcIl0nKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoaHJlZikudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCQoJy5qcy1tZW51Ll9hY3RpdmUnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ21lbnUtb3BlbmVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5JykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdtZW51LW9wZW5lZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXIsIC5qcy1tZW51JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b3VjaDogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtcG9wdXAnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQuZmFuY3lib3guY2xvc2UoKTtcclxuICAgICAgICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKSB8fCAkKHRoaXMpLmRhdGEoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCgnIycgKyBocmVmLnN1YnN0cigxKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9ICQodGhpcykuZGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCR0YXJnZXQubGVuZ3RoICYmIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICRpbnB1dCA9ICR0YXJnZXQuZmluZCgnW25hbWU9XCInICsgayArICdcIl0nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRpbnB1dC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbnB1dC52YWwoZGF0YVtrXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCR0YXJnZXQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgICAgICQoXCIuanMtYWdlbnQtc2VhcmNoXCIpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2FnZW50cycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIGxhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFRvb1Nob3J0OiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcItCf0L7QttCw0LvRg9C50YHRgtCwLCDQstCy0LXQtNC40YLQtSBcIiArIChhLm1pbmltdW0gLSBhLmlucHV0Lmxlbmd0aCkgKyBcIiDQuNC70Lgg0LHQvtC70YzRiNC1INGB0LjQvNCy0L7Qu9C+0LJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWpheDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLm15anNvbi5jb20vYmlucy9va3l2aVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTogcGFyYW1zLnRlcm0sIC8vIHNlYXJjaCB0ZXJtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FnZW50X3NlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAkLm1hcChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHZhbHVlLnBhZ2V0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50OiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRTZWxlY3Rpb24sXHJcbiAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24gKG1hcmt1cCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcclxuICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcclxuICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAzLFxyXG4gICAgICAgICAgICBtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAn0L/QvtC40YHQuuKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2VsZWN0Mi1yZXN1bHQtYWdlbnRcIj48c3Ryb25nPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWdlbnQucGFnZXRpdGxlICsgJzwvc3Ryb25nPjxicj4nICsgaXRlbS5hZ2VudC52YWx1ZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRTZWxlY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5hZ2VudC5wYWdldGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1hZ2VudC1zZWFyY2gnKS5vbignc2VsZWN0MjpzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUucGFyYW1zLmRhdGE7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRhdGEuYWdlbnQudXJpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWYWxpZGF0ZSgpIHtcclxuICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoXCJwaG9uZVwiLCBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uYWwoZWxlbWVudCkgfHwgL15cXCtcXGRcXHNcXChcXGR7M31cXClcXHNcXGR7M30tXFxkezJ9LVxcZHsyfSQvLnRlc3QodmFsdWUpO1xyXG4gICAgICAgIH0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBtb2JpbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7fSxcclxuICAgICAgICAgICAgcnVsZXM6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcInBob25lXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXZhbGlkYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudmFsaWRhdGUob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eUZpbHRlcnMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXR5cGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10aXRsZScpLnRleHQoJCh0aGlzKS5kYXRhKCdmaWx0ZXJzLXRpdGxlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXNzd29yZCgpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXBhc3N3b3JkJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi4vanMvbGlicy96eGN2Ym4uanNcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChzY3JpcHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24gKGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgenhjdmJuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoenhjdmJuKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHp4Y3Zibih2YWwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpO1xyXG4gICAgICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMyBfNCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgcmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/Qu9C+0YXQvtC5OiA4INC30L3QsNC60L7Qsiwg0L7RgdGC0LDQu9GM0L3Ri9GFINC/0YDQvtCy0LXRgNC+0Log0L3QtdGCXHJcbiAgICAg0KHRgNC10LTQvdC40Lk6IDEwINC30L3QsNC60L7Qsiwg0LzQuNC9INC+0LTQvdCwINCx0YPQutCy0LAsINC80LjQvSDQvtC00L3QsCDQvtC00L3QsCDRhtC40YTRgNCwXHJcbiAgICAg0KXQvtGA0L7RiNC40Lk6IDEyINC30L3QsNC60L7Qsiwg0L/Qu9GO0YEg0L/RgNC+0LLQtdGA0LrQsCDQvdCwINGB0L/QtdGG0LfQvdCw0Log0Lgg0LfQsNCz0LvQsNCy0L3Rg9GOXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRFYXN5UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgdmFyIHNwZWNpYWxzID0gL1shQCMkJV4mfl0vO1xyXG4gICAgICAgICQoJy5qcy1wYXNzd29yZCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAwO1xyXG4gICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zJyk7XHJcbiAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSBhcHBDb25maWcubWluUGFzc3dvcmRMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gMTAgJiYgdmFsLnNlYXJjaCgvXFxkLykgIT09IC0xICYmIHZhbC5zZWFyY2goL1xcRC8pICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoID49IDEyICYmIHZhbC5zZWFyY2goL1tBLVpdLykgIT09IC0xICYmIHZhbC5zZWFyY2goc3BlY2lhbHMpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY250LmFkZENsYXNzKCdfJyArIHNjb3JlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3NTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtc2xpZGVyLXJldmlld3MnKTtcclxuICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMgX2JpZycsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5sZyxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGJpZyA9ICQoJy5yZXZpZXdzX19saXN0Ll9iaWcgLnJldmlld3NfX2xpc3RfX2l0ZW0nKTtcclxuICAgICAgICB2YXIgY3VycmVudCA9IDA7XHJcbiAgICAgICAgaWYgKCRiaWcubGVuZ3RoICYmICRzbGlkZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAkc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyQmlnKCkge1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVPdXQoKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRCaWcoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItcmV2aWV3cyAuc2xpY2stY3VycmVudCAucmV2aWV3c19fbGlzdF9faXRlbV9faW5uZXInKS5jbG9uZSgpLmFwcGVuZFRvKCRiaWcpO1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAkYmlnLnBhcmVudCgpLmNzcygnaGVpZ2h0JywgJGJpZy5vdXRlckhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHkoKSB7XHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyW2RhdGEtaW5pdD1cImZhbHNlXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRvZ2dsZXJzID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19pbWctd3JhcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICAgICAkdG9nZ2xlcnMuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvdW50ZXIudGV4dChpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnaW5pdCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2FsbGVyeSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FsbGVyeS1uYXYnKS5zbGljayh7XHJcbiAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNixcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnlfX3NsaWRlcicsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnknKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19zbGlkZXInKTtcclxuICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX2N1cnJlbnQnKTtcclxuICAgICAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzd2lwZVRvU2xpZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB0b3VjaFRocmVzaG9sZDogMTAsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpZGVyLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJGN1cnJlbnQudGV4dCgrK2N1cnJlbnRTbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgJGxpbmtzID0gJHNsaWRlci5maW5kKCcuc2xpZGU6bm90KC5zbGljay1jbG9uZWQpJyk7XHJcbiAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X190b3RhbCcpLnRleHQoJGxpbmtzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICRsaW5rcy5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJGxpbmtzLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSwgJGxpbmtzLmluZGV4KHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZXZpZXdzKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrT3V0ZXIoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZXZpZXdzX19vdXRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRpbm5lciA9ICQodGhpcykuZmluZCgnLmpzLXJldmlld3NfX2lubmVyJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJGlubmVyLm91dGVySGVpZ2h0KCkgPD0gJCh0aGlzKS5vdXRlckhlaWdodCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcmV2aWV3cycpLnJlbW92ZUNsYXNzKCdfZmFkZScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1yZXZpZXdzJykuYWRkQ2xhc3MoJ19mYWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiByb2xsKCRpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmICghJGl0ZW0uaGFzQ2xhc3MoJ19mYWRlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgJHRvZ2dsZXIgPSAkaXRlbS5maW5kKCcuanMtcmV2aWV3c19fdG9nZ2xlcicpO1xyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKCRpdGVtLmhhc0NsYXNzKCdfb3BlbmVkJykpIHtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9ICRpdGVtLmRhdGEoJ2hlaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJHRvZ2dsZXIudGV4dCgkdG9nZ2xlci5kYXRhKCdyb2xsZG93bicpKTtcclxuICAgICAgICAgICAgICAgICRpdGVtLmFuaW1hdGUoe2hlaWdodDogaGVpZ2h0fSwgNDAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbS5jc3MoJ2hlaWdodCcsICcnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkaXRlbS5wYXJlbnQoKS5oZWlnaHQoJGl0ZW0ub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNsb25lID0gJGl0ZW0uY2xvbmUoKS5hZGRDbGFzcygnX2Nsb25lZCcpLndpZHRoKCRpdGVtLm91dGVyV2lkdGgoKSkuYXBwZW5kVG8oJHBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAkY2xvbmUub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgICRjbG9uZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICRpdGVtLmRhdGEoJ2hlaWdodCcsICRpdGVtLm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgICAgICRpdGVtLmFuaW1hdGUoe2hlaWdodDogaGVpZ2h0fSwgNDAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXIudGV4dCgkdG9nZ2xlci5kYXRhKCdyb2xsdXAnKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtcmV2aWV3c19fdG9nZ2xlciwgLmpzLXJldmlld3NfX291dGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByb2xsKCQodGhpcykucGFyZW50cygnLmpzLXJldmlld3MnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZXZpZXdzJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKS5jc3MoJ2hlaWdodCcsICcnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXJldmlld3NfX3RvZ2dsZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudGV4dCgkKHRoaXMpLmRhdGEoJ3JvbGxkb3duJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hlY2tPdXRlcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNoZWNrT3V0ZXIoKTtcclxuICAgICAgICAkKCcuanMtcmV2aWV3cycpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGxpbmtzID0gJCh0aGlzKS5maW5kKCcuanMtcmV2aWV3c19fc2xpZGUnKTtcclxuICAgICAgICAgICAgJGxpbmtzLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkbGlua3MsIHtcclxuICAgICAgICAgICAgICAgICAgICBsb29wOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LCAkbGlua3MuaW5kZXgodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXROdW1FbmRpbmcoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SHlwb3RoZWMoKSB7XHJcbiAgICAgICAgdmFyIHN0eWxlID0gW107XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29zdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jb3N0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICRjb3N0LnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXBlcmNlbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyID0gJCh0aGlzKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkYWdlID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2FnZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjcmVkaXQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY3JlZGl0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlciA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzY3JvbGwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2Nyb2xsJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHRvdGFsID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3Nob3ctdGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgIHZhciByYXRlID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGUpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZU1FID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVNRS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGVNRScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlTUUpO1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gMDtcclxuICAgICAgICAgICAgdmFyIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBwZXJjZW50O1xyXG4gICAgICAgICAgICAkY29zdC5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiByZWNhbGNQYXltZW50c1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJGNvc3Qub24oXCJjaGFuZ2VcIiwgcmVjYWxjUGF5bWVudHMpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiByZWNhbGNQYXltZW50cygpIHtcclxuICAgICAgICAgICAgICAgIGNvc3QgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRTdW0ucHJvcCgnbWF4JywgY29zdCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bVBpY2tlci5ub1VpU2xpZGVyLnVwZGF0ZU9wdGlvbnMoe1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogY29zdFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIubm9VaVNsaWRlci5zZXQoY29zdCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRTdW0udHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudCA9ICQodGhpcykudmFsKCkgKiAxMDAgLyBjb3N0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcmNlbnQgPiAxMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50ID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykudmFsKGNvc3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3JlZGl0ID0gY2FsY0NyZWRpdChjb3N0LCBwZXJjZW50KTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudC52YWwocGVyY2VudCkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAkY3JlZGl0LnZhbChjcmVkaXQpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19maXJzdCcpLnRleHQoZm9ybWF0UHJpY2UoJHBheW1lbnRTdW0udmFsKCkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRwYXltZW50U3VtLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJyxcclxuICAgICAgICAgICAgICAgIG9uY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1waWNrZXInKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXS5ub1VpU2xpZGVyLnNldCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRwYXltZW50U3VtLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAkYWdlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBhZ2UgPSAkYWdlLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aCcpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGhNRScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19lY29ub215JykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpICogMTIgKiBhZ2UgLSBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkgKiAxMiAqIGFnZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2Nyb2xsLmZpbmQoJy5oeXBvdGhlYy1saXN0X19pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuaHlwb3RoZWMtbGlzdF9faXRlbV9faW5uZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpKVxyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZXIuc2xpY2soJ3NsaWNrR29UbycsIGkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBmaWx0ZXJzLCDQutCw0LbQtNGL0Lkg0YHQtdC70LXQutGCINGE0LjQu9GM0YLRgNGD0LXRgiDQvtGC0LTQtdC70YzQvdC+XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19maWx0ZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmTmFtZSA9ICQodGhpcykuZGF0YSgnaHlwb3RoZWMtZmlsdGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9ICdmaWx0ZXItJyArIGZOYW1lO1xyXG4gICAgICAgICAgICAgICAgc3R5bGUucHVzaCgnLicgKyBjbGFzc05hbWUgKyAne2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50fScpO1xyXG4gICAgICAgICAgICAgICAgLy8g0L/RgdC10LLQtNC+0YHQtdC70LXQutGC0YtcclxuICAgICAgICAgICAgICAgIHZhciAkY2hlY2tib3hlcyA9ICQodGhpcykuZmluZCgnaW5wdXRbdHlwZT1jaGVja2JveF0nKTtcclxuICAgICAgICAgICAgICAgICRjaGVja2JveGVzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICRjaGVja2VkID0gJGNoZWNrYm94ZXMuZmlsdGVyKCc6Y2hlY2tlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkY2hlY2tlZC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjaGVja2VkLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZi5wdXNoKCc6bm90KFtkYXRhLWZpbHRlci0nICsgJCh0aGlzKS52YWwoKSArICddKScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignLmpzLWh5cG90aGVjX19pdGVtJyArIGYuam9pbignJykpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNldFRvdGFsKCR0b3RhbCwgJGl0ZW1zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8g0LjQvdC/0YPRgtGLXHJcbiAgICAgICAgICAgICRwYXltZW50UGVyY2VudC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpLCBjbGFzc05hbWUgPSAnZmlsdGVyLWZpcnN0JztcclxuICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1maXJzdF0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItZmlyc3QnKSkgPiB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICRjcmVkaXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKSwgY2xhc3NOYW1lID0gJ2ZpbHRlci1taW4nO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLW1pbl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItbWluJykpID4gdmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXRUb3RhbCgkdG90YWwsICRpdGVtcyk7XHJcbiAgICAgICAgICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICBzdHlsZS5wdXNoKCcuZmlsdGVyLW1pbnllYXJ7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgIHN0eWxlLnB1c2goJy5maWx0ZXItbWF4eWVhcntkaXNwbGF5Om5vbmUgIWltcG9ydGFudH0nKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLW1pbnllYXJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KCQodGhpcykuZGF0YSgnZmlsdGVyLW1pbnllYXInKSkgPiB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZmlsdGVyLW1pbnllYXInKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdmaWx0ZXItbWlueWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLW1heHllYXJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KCQodGhpcykuZGF0YSgnZmlsdGVyLW1heHllYXInKSkgPCB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZmlsdGVyLW1heHllYXInKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdmaWx0ZXItbWF4eWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2V0VG90YWwoJHRvdGFsLCAkaXRlbXMpO1xyXG4gICAgICAgICAgICB9KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc3R5bGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciB1bmlxdWVTdHlsZSA9IFtdO1xyXG4gICAgICAgICAgICAkLmVhY2goc3R5bGUsIGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShlbCwgdW5pcXVlU3R5bGUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaXF1ZVN0eWxlLnB1c2goZWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnPHN0eWxlPicgKyB1bmlxdWVTdHlsZS5qb2luKCcnKSArICc8L3N0eWxlPicpLmFwcGVuZFRvKCdoZWFkJylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNQYXltZW50KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjb3N0ICogcGVyY2VudCAvIDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNDcmVkaXQoY29zdCwgcGVyY2VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29zdCAtIE1hdGguY2VpbChjb3N0ICogcGVyY2VudCAvIDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGUsIGFnZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNyZWRpdCAqICgocmF0ZSAvIDEyMDAuMCkgLyAoMS4wIC0gTWF0aC5wb3coMS4wICsgcmF0ZSAvIDEyMDAuMCwgLShhZ2UgKiAxMikpKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRQcmljZShwcmljZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJpY2UudG9TdHJpbmcoKS5yZXBsYWNlKC8uL2csIGZ1bmN0aW9uIChjLCBpLCBhKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaSAmJiBjICE9PSBcIi5cIiAmJiAhKChhLmxlbmd0aCAtIGkpICUgMykgPyAnICcgKyBjIDogYztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFRvdGFsKCR0YXJnZXQsICRpdGVtcykge1xyXG4gICAgICAgICAgICB2YXIgdG90YWwgPSAkaXRlbXMubGVuZ3RoIC0gJGl0ZW1zLmZpbHRlcignW2NsYXNzKj1cImZpbHRlclwiXScpLmxlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGEgPSBnZXROdW1FbmRpbmcodG90YWwsIFsn0J3QsNC50LTQtdC90LAnLCAn0J3QsNC50LTQtdC90L4nLCAn0J3QsNC50LTQtdC90L4nXSk7XHJcbiAgICAgICAgICAgIHZhciBiID0gZ2V0TnVtRW5kaW5nKHRvdGFsLCBbJ9C40L/QvtGC0LXRh9C90LDRjyDQv9GA0L7Qs9GA0LDQvNC80LAnLCAn0LjQv9C+0YLQtdGH0L3Ri9C1INC/0YDQvtCz0YDQsNC80LzRiycsICfQuNC/0L7RgtC10YfQvdGL0YUg0L/RgNC+0LPRgNCw0LzQvCddKTtcclxuICAgICAgICAgICAgJHRhcmdldC50ZXh0KFthLCB0b3RhbCwgYl0uam9pbignICcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlY19fc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBtb2JpbGVGaXJzdDogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kIC0gMSxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzBweCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3Nob3ctYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHQgPSAkKHRoaXMpLnBhcmVudHMoJy5qcy1oeXBvdGhlYycpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2hvdy10YXJnZXQnKTtcclxuICAgICAgICAgICAgaWYgKCR0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0Lm9mZnNldCgpLnRvcCAtIDQwO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXJfX21haW4nKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcl9fbWFpbicpLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogb2Zmc2V0fSwgMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXREYXRlcGlja2VyKCkge1xyXG4gICAgICAgIHZhciBkYXRlcGlja2VyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBjb21tb25PcHRpb25zID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogJ3RvcCBsZWZ0JyxcclxuICAgICAgICAgICAgb25TaG93OiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlclZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkhpZGU6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24gKGZvcm1hdHRlZERhdGUsIGRhdGUsIGluc3QpIHtcclxuICAgICAgICAgICAgICAgIGluc3QuJGVsLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtZGF0ZXRpbWVwaWNrZXInKS5kYXRlcGlja2VyKE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICB0aW1lcGlja2VyOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRlVGltZVNlcGFyYXRvcjogJywgJyxcclxuICAgICAgICB9LCBjb21tb25PcHRpb25zKSk7XHJcbiAgICAgICAgJCgnLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5lYWNoKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgICAgICB2YXIgbWluID0gbmV3IERhdGUoJCh0aGlzKS5kYXRhKCdtaW4nKSkgfHwgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBtYXggPSBuZXcgRGF0ZSgkKHRoaXMpLmRhdGEoJ21heCcpKSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIoT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICAgICAgICBtaW5EYXRlOiBtaW4sXHJcbiAgICAgICAgICAgICAgICBtYXhEYXRlOiBtYXgsXHJcbiAgICAgICAgICAgICAgICByYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG11bHRpcGxlRGF0ZXNTZXBhcmF0b3I6ICcgLSAnLFxyXG4gICAgICAgICAgICB9LCBjb21tb25PcHRpb25zKSk7XHJcbiAgICAgICAgICAgIHZhciBkYXRlcGlja2VyID0gJCh0aGlzKS5kYXRhKCdkYXRlcGlja2VyJyk7XHJcbiAgICAgICAgICAgIGRhdGVwaWNrZXIuc2VsZWN0RGF0ZShbbWluLCBtYXhdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZGF0ZXRpbWVwaWNrZXIsIC5qcy1kYXRlcGlja2VyLXJhbmdlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZXBpY2tlclZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlcGlja2VyID0gJCgnLmpzLWRhdGV0aW1lcGlja2VyLCAuanMtZGF0ZXBpY2tlci1yYW5nZScpLmRhdGEoJ2RhdGVwaWNrZXInKTtcclxuICAgICAgICAgICAgICAgIGRhdGVwaWNrZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9GA0L7QutGA0YPRgtC60LAg0L/QviDRgdGB0YvQu9C60LUg0LTQviDRjdC70LXQvNC10L3RgtCwXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRTY3JvbGwoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKCQodGhpcykuYXR0cignaHJlZicpKTtcclxuICAgICAgICAgICAgaWYgKCR0YXJnZXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHRhcmdldC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXInKS5vdXRlckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBvZmZzZXR9LCAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbml0QWJvdXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIHZlcnRpY2FsOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNTBweCcsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWFib3V0LWh5c3RvcnlfX2NvbnRlbnQtc2xpZGVyJyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJykub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuX3NpYmxpbmcnKS5yZW1vdmVDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLm5leHQoKS5hZGRDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLnByZXYoKS5hZGRDbGFzcygnX3NpYmxpbmcnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9fY29udGVudC1zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInLFxyXG4gICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGaWxlaW5wdXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbGVpbnB1dF9fY250JykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykuZGF0YSgnZGVmYXVsdCcsICQodGhpcykudGV4dCgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZmlsZWlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZU5hbWUgPSAkKHRoaXMpLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5qcy1maWxlaW5wdXRfX2NudCcpLnRleHQoZmlsZU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFudGlzcGFtKCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPVwiZW1haWwzXCJdLGlucHV0W25hbWU9XCJpbmZvXCJdLGlucHV0W25hbWU9XCJ0ZXh0XCJdJykuYXR0cigndmFsdWUnLCAnJykudmFsKCcnKTtcclxuICAgICAgICB9LCA1MDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWxwaGFiZXQoKSB7XHJcbiAgICAgICAgJCgnLmpzLWFscGhhYmV0IGlucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFscGhhYmV0IGxpJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCQodGhpcykucHJvcCgnY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hbHBoYWJldCBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWxwaGFiZXQgbGknKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJ2xpJykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtU2VhcmNoMiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIG1TZWFyY2gyLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pOyJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
