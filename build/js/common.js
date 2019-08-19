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
        this.initJsLink();
        this.initialized = true;
    },

    initJsLink: function () {
        $('.js-link').each(function(){
           var href = $(this).data('href');
           var target = $(this).data('target');
           if (href) {
               $(this).on('click', function(){
                   window.open(href, target || '_self')
               });
           }
        });
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
                $(elem).find(tabsSelector).find('a, [data-href]').each(function () {
                    var value = $(this).attr('href') || $(this).data('href'),
                            text = $(this).data('select') || $(this).text();
                    $select.append('<option value="' + value + '">' + text + '</option>');
                });
                $select.on('change', function () {
                    $(elem).easytabs('select', $(this).val());
                });
            }
            $(elem).find(tabsSelector).find('a:not(.disabled), [data-href]:not(.disabled)').first().click();
            $(elem).bind('easytabs:after', function (event, $clicked, $target) {
                if (withSelect) {
                    var href = $clicked.attr('href') || $clicked.data('href');
                    $select.val(href).change();
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
    
    /** Выделение квартиры в шахматке и обновление информации о квартире */
    chessSelectFlat: function($flat, scrollToInfo) {
        var $this = $flat;
//            if ($this.hasClass('_selected'))
//                return;
        var $target = {
            cnt: $('.js-chess-info'),
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
            $form = $('.js-chess-info__form');

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
        if (scrollToInfo) {
            var scroll = $target.cnt.offset().top;
            if ($target.cnt.outerHeight() <= $(window).outerHeight()) {
                scroll -= ($(window).outerHeight() - $target.cnt.outerHeight());
            }
            $("html, body").animate({
                scrollTop: scroll
            }, 500);
        }
    },

    initChess: function () {
        if ($(window).outerWidth() >= appConfig.breakpoint.lg) {
            $('.js-chess-tooltip__content').parent().hover(app.showChessTooltip, app.hideChessTooltip);
        }
        $('.js-chess-info__item._active').on('click', function() {
            app.chessSelectFlat($(this), true);
        });
        $('.js-chess-info__item._active').first().click();
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
            $items.removeClass('_selected');
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
            var $notFilteredItems = $items.filter('._active:not(._filtered)');
            if ($notFilteredItems.length) {
                app.chessSelectFlat($notFilteredItems.first(), false);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgYm9keTogJCgnYm9keScpLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRMb2dvKCk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0KHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0U2VhcmNoKHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VGFicygpO1xyXG4gICAgICAgIHRoaXMuaW5pdE1hc2soKTtcclxuICAgICAgICB0aGlzLmluaXRSYW5nZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdENoZXNzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3NGaWx0ZXIoKTtcclxuICAgICAgICB0aGlzLmluaXRGUlByb21vKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VXAoKTtcclxuICAgICAgICB0aGlzLmluaXRKc0xpbmsoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdEpzTGluazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy1saW5rJykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5kYXRhKCdocmVmJyk7XHJcbiAgICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuZGF0YSgndGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAgICAgICAgJCh0aGlzKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oaHJlZiwgdGFyZ2V0IHx8ICdfc2VsZicpXHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGluaXRVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkYnRuID0gJChcIi5qcy11cFwiKTtcclxuICAgICAgICBpZiAoISRidG4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGJyZWFrcG9pbnQgPSAkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSAvIDI7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnNjcm9sbFRvcCgpID4gYnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgJGJ0bi5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe3Njcm9sbFRvcDogMH0sIDUwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBpbml0TG9nbzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0aW1lb3V0ID0gYXBwQ29uZmlnLmxvZ29VcGRhdGVUaW1lb3V0IHx8IDMwMDAsXHJcbiAgICAgICAgICAgICAgICAkbG9nbyA9ICQoJy5qcy1sb2dvJyksIG5ld1NyYyA9ICRsb2dvLmRhdGEoJ25ld3NyYycpLFxyXG4gICAgICAgICAgICAgICAgJG5ld0xvZ28gPSAkKCc8aW1nPicpO1xyXG4gICAgICAgICRuZXdMb2dvLmF0dHIoJ3NyYycsIG5ld1NyYyk7XHJcbiAgICAgICAgJG5ld0xvZ28ub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZ28ucGFyZW50KCkuY3NzKCd3aWR0aCcsICRsb2dvLm91dGVyV2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICAkbG9nby5mYWRlT3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nby5hdHRyKCdzcmMnLCAkbmV3TG9nby5hdHRyKCdzcmMnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZ28uZmFkZUluKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZ28ucGFyZW50KCkuY3NzKCd3aWR0aCcsICdhdXRvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgdGltZW91dCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKiBjdXN0b20gc2VsZWN0IFxyXG4gICAgICogQHBhcmFtICRjbnQgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIGluaXRQc2V1ZG9TZWxlY3Q6IGZ1bmN0aW9uICgkY250KSB7XHJcbiAgICAgICAgJGNudC5maW5kKCcuanMtc2VsZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkY250LmZpbmQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIWFwcC5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfb3BlbmVkIF9hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKiogY3VzdG9tIHNlbGVjdCBzZWFyY2hcclxuICAgICAqIEBwYXJhbSAkY250IGNvbnRhaW5lclxyXG4gICAgICovXHJcbiAgICBpbml0UHNldWRvU2VsZWN0U2VhcmNoOiBmdW5jdGlvbiAoJGNudCkge1xyXG4gICAgICAgICRjbnQuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2gnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faXRlbScpO1xyXG4gICAgICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pbnB1dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzZWxlY3Qtc2VhcmNoJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPSAtMSA/ICQodGhpcykuc2hvdygpIDogJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIGZvciBtRmlsdGVyMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBpbml0U2Nyb2xsYmFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIHZhciB3ID0gJCh3aW5kb3cpLm91dGVyV2lkdGgoKTtcclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgJiYgdyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWRcclxuICAgICAgICAgICAgICAgICAgICAmJiAkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWhvdCcpLnNjcm9sbGJhcigpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0VGFiczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRhYnNTZWxlY3RvciA9IHR5cGVvZiAkKGVsZW0pLmRhdGEoJ3RhYnMnKSA9PT0gJ3VuZGVmaW5lZCcgPyAnLmpzLXRhYnNfX2xpc3QgPiBsaScgOiAkKGVsZW0pLmRhdGEoJ3RhYnMnKTtcclxuICAgICAgICAgICAgdmFyICRzZWxlY3QgPSAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKSwgd2l0aFNlbGVjdCA9ICRzZWxlY3QubGVuZ3RoO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKHtcclxuICAgICAgICAgICAgICAgIC8vINC00LvRjyDQstC70L7QttC10L3QvdGL0YUg0YLQsNCx0L7QsiDQuNGB0L/QvtC70YzQt9GD0LXQvCBkYXRhXHJcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzU2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICBwYW5lbENvbnRleHQ6ICQoZWxlbSkuaGFzQ2xhc3MoJ2pzLXRhYnNfZGlzY29ubmVjdGVkJykgPyAkKCcuanMtdGFic19fY29udGVudCcpIDogJChlbGVtKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUhhc2g6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHdpdGhTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCh0YWJzU2VsZWN0b3IpLmZpbmQoJ2EsIFtkYXRhLWhyZWZdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS5hdHRyKCdocmVmJykgfHwgJCh0aGlzKS5kYXRhKCdocmVmJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdzZWxlY3QnKSB8fCAkKHRoaXMpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIj4nICsgdGV4dCArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHNlbGVjdC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoJ3NlbGVjdCcsICQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChlbGVtKS5maW5kKHRhYnNTZWxlY3RvcikuZmluZCgnYTpub3QoLmRpc2FibGVkKSwgW2RhdGEtaHJlZl06bm90KC5kaXNhYmxlZCknKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBocmVmID0gJGNsaWNrZWQuYXR0cignaHJlZicpIHx8ICRjbGlja2VkLmRhdGEoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LnZhbChocmVmKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3NldFBvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdE1hc2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtbWFza19fdGVsJykuaW5wdXRtYXNrKHtcclxuICAgICAgICAgICAgbWFzazogJys5ICg5OTkpIDk5OS05OS05OSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBJbnB1dG1hc2suZXh0ZW5kQWxpYXNlcyh7XHJcbiAgICAgICAgICAgICdudW1lcmljJzoge1xyXG4gICAgICAgICAgICAgICAgYXV0b1VubWFzazogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNob3dNYXNrT25Ib3ZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICByYWRpeFBvaW50OiBcIixcIixcclxuICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yOiBcIiBcIixcclxuICAgICAgICAgICAgICAgIGRpZ2l0czogMCxcclxuICAgICAgICAgICAgICAgIGFsbG93TWludXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXV0b0dyb3VwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRBbGlnbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1bm1hc2tBc051bWJlcjogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX251bWVyaWMnKS5pbnB1dG1hc2soXCJudW1lcmljXCIpO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3NxdWFyZScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC8wrInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3NxdWFyZV9maWx0ZXInKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJyxcclxuICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5X2ZpbHRlcicpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICB1bm1hc2tBc051bWJlcjogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fYWdlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LvQtdGCJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19wZXJjZW50JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJyUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5LCAuanMtbWFza19fc3F1YXJlLCAuanMtbWFza19fcGVyY2VudCcpLm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIGZvciByZW1vdmUgc3VmZml4XHJcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JpbkhlcmJvdHMvSW5wdXRtYXNrL2lzc3Vlcy8xNTUxXHJcbiAgICAgICAgICAgIHZhciB2ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKHYgPT0gMCB8fCB2ID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbCgnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFJhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgkKGVsZW0pLmhhc0NsYXNzKCdqcy1jaGVzcy1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ2VuZCcsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbbmFtZT1cInByaWNlX21heFwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbi8vICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB0bzogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IGlucHV0LmlucHV0bWFzaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmJiBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLW1hc2tfX2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBhcHAuZ2V0TnVtRW5kaW5nKHBhcnNlSW50KHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKSwgWyfCoNCz0L7QtCcsICfCoNCz0L7QtNCwJywgJ8Kg0LvQtdGCJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLm9wdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLyoqINCS0YvQtNC10LvQtdC90LjQtSDQutCy0LDRgNGC0LjRgNGLINCyINGI0LDRhdC80LDRgtC60LUg0Lgg0L7QsdC90L7QstC70LXQvdC40LUg0LjQvdGE0L7RgNC80LDRhtC40Lgg0L4g0LrQstCw0YDRgtC40YDQtSAqL1xyXG4gICAgY2hlc3NTZWxlY3RGbGF0OiBmdW5jdGlvbigkZmxhdCwgc2Nyb2xsVG9JbmZvKSB7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJGZsYXQ7XHJcbi8vICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdfc2VsZWN0ZWQnKSlcclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciAkdGFyZ2V0ID0ge1xyXG4gICAgICAgICAgICBjbnQ6ICQoJy5qcy1jaGVzcy1pbmZvJyksXHJcbiAgICAgICAgICAgIHRpdGxlOiAkKCcuanMtY2hlc3MtaW5mb19fdGl0bGUnKSxcclxuICAgICAgICAgICAgYXJlYTogJCgnLmpzLWNoZXNzLWluZm9fX2FyZWEnKSxcclxuICAgICAgICAgICAgcHJpY2U6ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZScpLFxyXG4gICAgICAgICAgICBwcmljZVBlclNxdWFyZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlUGVyU3F1YXJlJyksXHJcbiAgICAgICAgICAgIGZsb29yOiAkKCcuanMtY2hlc3MtaW5mb19fZmxvb3InKSxcclxuICAgICAgICAgICAgZmxvb3JzVG90YWw6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcnNUb3RhbCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgICAgICRoeXBvdGhlYyA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYycpLFxyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyID0gJCgnLmpzLWNoZXNzLWluZm9fX2h5cG90aGVjLXdyYXBwZXInKSxcclxuICAgICAgICAgICAgJHByaWNlV3JhcHBlciA9ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZS13cmFwcGVyJyksXHJcbiAgICAgICAgICAgICRwcmljZVBlclNxdWFyZVdyYXBwZXIgPSAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2VQZXJTcXVhcmUtd3JhcHBlcicpLFxyXG4gICAgICAgICAgICAkaW1nRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbGF0JyksXHJcbiAgICAgICAgICAgICRpbWdGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbG9vcicpLFxyXG4gICAgICAgICAgICAkdGFicyA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJzJyksXHJcbiAgICAgICAgICAgICR0YWJGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbG9vcicpLFxyXG4gICAgICAgICAgICAkdGFiRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbGF0JyksXHJcbiAgICAgICAgICAgICRmb3JtID0gJCgnLmpzLWNoZXNzLWluZm9fX2Zvcm0nKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0nKS5yZW1vdmVDbGFzcygnX3NlbGVjdGVkJyk7XHJcbiAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICR0YXJnZXRba2V5XS50ZXh0KGRhdGFba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRmb3JtLnZhbChkYXRhLmZvcm0pO1xyXG4gICAgICAgIGlmIChkYXRhLmh5cG90aGVjKSB7XHJcbiAgICAgICAgICAgICRoeXBvdGhlYy50ZXh0KGRhdGEuaHlwb3RoZWMpO1xyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLnNob3coKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wcmljZSAhPSAwID8gJHByaWNlV3JhcHBlci5zaG93KCkgOiAkcHJpY2VXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICBkYXRhLnByaWNlUGVyU3F1YXJlICE9IDAgPyAkcHJpY2VQZXJTcXVhcmVXcmFwcGVyLnNob3coKSA6ICRwcmljZVBlclNxdWFyZVdyYXBwZXIuaGlkZSgpO1xyXG4gICAgICAgIGlmICgkKCcuanMtaHlwb3RoZWNfX2Nvc3QnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1oeXBvdGhlY19fY29zdCcpLnZhbChkYXRhLmZpbHRlclByaWNlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLnZhbChkYXRhLmZpbHRlclByaWNlIC8gMikudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmltZ0ZsYXQpIHtcclxuICAgICAgICAgICAgJGltZ0ZsYXQuYXR0cignaHJlZicsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LnNob3coKTtcclxuICAgICAgICAgICAgJHRhYkZsYXQuc2hvdygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgJHRhYkZsYXQuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5pbWdGbG9vcikge1xyXG4gICAgICAgICAgICAkaW1nRmxvb3IuYXR0cignaHJlZicsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAkaW1nRmxvb3IuZmluZCgnaW1nJykuYXR0cignc3JjJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICRpbWdGbG9vci5zaG93KCk7XHJcbiAgICAgICAgICAgICR0YWJGbG9vci5zaG93KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJGltZ0Zsb29yLmhpZGUoKTtcclxuICAgICAgICAgICAgJHRhYkZsb29yLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCR0YWJzLmZpbmQoJ2xpOnZpc2libGUnKS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAkdGFicy5maW5kKCdsaTp2aXNpYmxlJykuZmlyc3QoKS5maW5kKCdhJykuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNjcm9sbFRvSW5mbykge1xyXG4gICAgICAgICAgICB2YXIgc2Nyb2xsID0gJHRhcmdldC5jbnQub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5jbnQub3V0ZXJIZWlnaHQoKSA8PSAkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsIC09ICgkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSAtICR0YXJnZXQuY250Lm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRDaGVzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykucGFyZW50KCkuaG92ZXIoYXBwLnNob3dDaGVzc1Rvb2x0aXAsIGFwcC5oaWRlQ2hlc3NUb29sdGlwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0uX2FjdGl2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhcHAuY2hlc3NTZWxlY3RGbGF0KCQodGhpcyksIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtLl9hY3RpdmUnKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICB9LFxyXG5cclxuICAgICRjaGVzc1Rvb2x0aXA6IG51bGwsXHJcbiAgICAkY2hlc3NUb29sdGlwVGltZW91dDogbnVsbCxcclxuXHJcbiAgICBzaG93Q2hlc3NUb29sdGlwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRzZWxmLm9mZnNldCgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcCA9ICRzZWxmLmZpbmQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykuY2xvbmUoKTtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCArIDI4LFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyAxMCxcclxuICAgICAgICAgICAgfSkuYXBwZW5kVG8oJCgnYm9keScpKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoYXBwLiRjaGVzc1Rvb2x0aXBUaW1lb3V0KTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcC5yZW1vdmUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdENoZXNzRmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY2hlc3MgbGluayBpbiBmaWx0ZXIgcmVzdWx0XHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdExpbmsoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKG1TZWFyY2gyKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLWNoZXNzX19saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9ICQucGFyYW0obVNlYXJjaDIuZ2V0RmlsdGVycygpKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cubG9jYXRpb24gPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKSArICc/JyArIHF1ZXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKCQodGhpcykuYXR0cignaHJlZicpICsgJz8nICsgcXVlcnksICdfYmxhbmsnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpbml0TGluaygpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdtc2UyX2xvYWQnLCBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBpbml0TGluaygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgJGZvcm0gPSAkKCcuanMtY2hlc3MtZmlsdGVyJyksXHJcbiAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKCcuanMtY2hlc3MtZmlsdGVyX19pdGVtJyksXHJcbiAgICAgICAgICAgICAgICBhcmVhTWluID0gbnVsbCwgYXJlYU1heCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbiA9IG51bGwsIHByaWNlTWF4ID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHNsaWRlclByaWNlID0gJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9taW5cIl0nKS5wYXJlbnRzKCcuanMtcmFuZ2UnKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVyQXJlYSA9ICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9taW5cIl0nKS5wYXJlbnRzKCcuanMtcmFuZ2UnKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgdG90YWwgPSAkaXRlbXMubGVuZ3RoIC0gJGl0ZW1zLmZpbHRlcignLl9zb2xkJykubGVuZ3RoO1xyXG4gICAgICAgIGlmICgkZm9ybS5sZW5ndGggPT09IDAgfHwgJGl0ZW1zLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2V0Q2hlc3NUb3RhbCh0b3RhbCk7XHJcbiAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLWFyZWFdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmVhID0gcGFyc2VGbG9hdCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1hcmVhJykpO1xyXG4gICAgICAgICAgICBpZiAoIWFyZWFNaW4gfHwgYXJlYSA8IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4gPSBNYXRoLmZsb29yKGFyZWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1heCB8fCBhcmVhID4gYXJlYU1heCkge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1heCA9IE1hdGguY2VpbChhcmVhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1wcmljZV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHByaWNlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItcHJpY2UnKSk7XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNaW4gfHwgcHJpY2UgPCBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXByaWNlTWF4IHx8IHByaWNlID4gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4ID0gcHJpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWluXCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWluKS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWF4XCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWF4KS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNaW4pLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIHByaWNlTWF4KS5hdHRyKCdtaW4nLCBwcmljZU1pbikuYXR0cignbWF4JywgcHJpY2VNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1yb29tcz1cIicgKyAkKHRoaXMpLnZhbCgpICsgJ1wiXScpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNsaWRlclByaWNlLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbixcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAnbWluJzogcHJpY2VNaW4sXHJcbiAgICAgICAgICAgICAgICAnbWF4JzogcHJpY2VNYXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRydWUgLy8gQm9vbGVhbiAnZmlyZVNldEV2ZW50J1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICBzbGlkZXJBcmVhLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICBhcmVhTWluLFxyXG4gICAgICAgICAgICAgICAgYXJlYU1heFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgJ21pbic6IGFyZWFNaW4sXHJcbiAgICAgICAgICAgICAgICAnbWF4JzogYXJlYU1heFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSAvLyBCb29sZWFuICdmaXJlU2V0RXZlbnQnXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAkZm9ybS5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcygnX3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSA9ICRmb3JtLnNlcmlhbGl6ZUFycmF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYTogW2FyZWFNaW4sIGFyZWFNYXhdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogW3ByaWNlTWluLCBwcmljZU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZm9ybURhdGEpO1xyXG4gICAgICAgICAgICAkLmVhY2goZm9ybURhdGEsIGZ1bmN0aW9uIChuLCB2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdhcmVhX21pbicgJiYgdi52YWx1ZSAhPSBhcmVhTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5hcmVhWzBdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdhcmVhX21heCcgJiYgdi52YWx1ZSAhPSBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5hcmVhWzFdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdwcmljZV9taW4nICYmIHYudmFsdWUgIT0gcHJpY2VNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnByaWNlWzBdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdwcmljZV9tYXgnICYmIHYudmFsdWUgIT0gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnByaWNlWzFdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdyb29tcycpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnJvb21zLnB1c2godi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5hcmVhWzBdID09IGFyZWFNaW4gJiYgZmlsdGVycy5hcmVhWzFdID09IGFyZWFNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5hcmVhO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5wcmljZVswXSA9PSBwcmljZU1pbiAmJiBmaWx0ZXJzLnByaWNlWzFdID09IHByaWNlTWF4KVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGZpbHRlcnMucHJpY2U7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnJvb21zLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGZpbHRlcnMucm9vbXM7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoZmlsdGVycykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuYWRkQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IHRydWUsICRfaXRlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGZpbHRlcnMsIGZ1bmN0aW9uIChrLCB2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYXJlYSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoJF9pdGVtLmRhdGEoJ2ZpbHRlci1hcmVhJykpICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJlYSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJlYSA8IHZbMF0gfHwgYXJlYSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpICE9PSAndW5kZWZpbmVkJyAmJiAkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaWNlIDwgdlswXSB8fCBwcmljZSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Jvb21zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykpID09PSAndW5kZWZpbmVkJyB8fCB2LmluZGV4T2YoJF9pdGVtLmRhdGEoJ2ZpbHRlci1yb29tcycpLnRvU3RyaW5nKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwoJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJy5fZmlsdGVyZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgJG5vdEZpbHRlcmVkSXRlbXMgPSAkaXRlbXMuZmlsdGVyKCcuX2FjdGl2ZTpub3QoLl9maWx0ZXJlZCknKTtcclxuICAgICAgICAgICAgaWYgKCRub3RGaWx0ZXJlZEl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgYXBwLmNoZXNzU2VsZWN0RmxhdCgkbm90RmlsdGVyZWRJdGVtcy5maXJzdCgpLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gaGFuZGxlIGdldCBmaWx0ZXJzXHJcbiAgICAgICAgdmFyIGZpbHRlcnMgPSB7fSwgaGFzaCwgaGFzaGVzO1xyXG4gICAgICAgIGhhc2hlcyA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKSk7XHJcbiAgICAgICAgaWYgKGhhc2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGFzaGVzID0gaGFzaGVzLnNwbGl0KCcmJyk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaGFzaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzaGVzLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFzaFsxXSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZmlsdGVycyk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVycy5rb21uYXRueWUpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvb21zID0gZmlsdGVyc1sna29tbmF0bnllJ10uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2gocm9vbXMsIGZ1bmN0aW9uIChpLCB2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9ICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5maWx0ZXIoJ1t2YWx1ZT1cIicgKyB2ICsgJ1wiXScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5maWx0ZXIoJ1t2YWx1ZT1cIicgKyBmaWx0ZXJzLmtvbW5hdG55ZSArICdcIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChmaWx0ZXJzWydhcHBjaGVzc3Jlc2lkZW50aWFsfGFyZWEnXSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJlYSA9IGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8YXJlYSddLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyQXJlYS5ub1VpU2xpZGVyLnNldChhcmVhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8cHJpY2UnXSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJpY2UgPSBmaWx0ZXJzWydhcHBjaGVzc3Jlc2lkZW50aWFsfHByaWNlJ10uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJQcmljZS5ub1VpU2xpZGVyLnNldChwcmljZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInJvb21zXCJdJykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDaGVzc1RvdGFsOiBmdW5jdGlvbiAodG90YWwpIHtcclxuICAgICAgICB2YXIgZW5kaW5ncyA9IFsn0LrQstCw0YDRgtC40YDQsCcsICfQutCy0LDRgNGC0LjRgNGLJywgJ9C60LLQsNGA0YLQuNGAJ107XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWZpbHRlcl9fdG90YWwnKS50ZXh0KHRvdGFsICsgJyAnICsgYXBwLmdldE51bUVuZGluZyh0b3RhbCwgZW5kaW5ncykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpeGVkIHJpZ2h0IHByb21vXHJcbiAgICAgKi9cclxuICAgIGluaXRGUlByb21vOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRjbnQgPSAkKCcuanMtZnInKTtcclxuICAgICAgICBpZiAoISRjbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWZyX190b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkY250LnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGdldE51bUVuZGluZzogZnVuY3Rpb24gKGlOdW1iZXIsIGFFbmRpbmdzKSB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRQb3B1cCgpO1xyXG4gICAgICAgIGluaXRTZWxlY3QoKTtcclxuICAgICAgICBpbml0VmFsaWRhdGUoKTtcclxuICAgICAgICBpbml0UmVhbHR5RmlsdGVycygpO1xyXG4gICAgICAgIGluaXRSZWFsdHkoKTtcclxuLy8gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRFYXN5UGFzc3dvcmQoKTtcclxuICAgICAgICBpbml0R2FsbGVyeSgpO1xyXG4gICAgICAgIGluaXRIeXBvdGhlYygpO1xyXG4gICAgICAgIGluaXREYXRlcGlja2VyKCk7XHJcbiAgICAgICAgaW5pdFNjcm9sbCgpO1xyXG4gICAgICAgIGluaXRBYm91dCgpO1xyXG4gICAgICAgIGluaXRGaWxlaW5wdXQoKTtcclxuICAgICAgICBpbml0QWxwaGFiZXQoKTtcclxuICAgICAgICBpbml0QW50aXNwYW0oKTtcclxuICAgICAgICBpbml0UmV2aWV3cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaW5pdFNtYWxsU2xpZGVycygpO1xyXG4vLyAgICAgICAgaW5pdE1lbnUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgIGluaXRSZXZpZXdzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICAkKCcuanMtc2xpZGVyLW1haW4nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRiYXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1zbGlkZXItbWFpbl9fYmFyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrID0gJCh0aGlzKS5maW5kKCcuanMtc2xpZGVyLW1haW5fX3NsaWRlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICB0aWNrLFxyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICAgICAgaWYgKCRzbGljay5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG90YWwgPSAkc2xpY2suZmluZCgnLnNsaWRlJykubGVuZ3RoXHJcblxyXG4gICAgICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdG90YWwgPiAxLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzcGVlZDogYXBwQ29uZmlnLnNsaWRlckZhZGVTcGVlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGF1dG9wbGF5U3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0b3RhbCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgJGJhci5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHNsaWNrLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSA8IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgICAgICRiYXIuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAgKyAnJSdcclxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpY2sub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWVudGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNQYXVzZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbW91c2VsZWF2ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHN0YXJ0UHJvZ3Jlc3NiYXIoKSB7XHJcbi8vICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJlc2V0UHJvZ3Jlc3NiYXIoKTtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGljayA9IHNldEludGVydmFsKGludGVydmFsLCAxMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGludGVydmFsKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzUGF1c2UgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBwZXJjZW50VGltZSArIFwiJVwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRUaW1lID49IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2xpY2suc2xpY2soJ3NsaWNrTmV4dCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZXNldFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICAgICAgJGJhci5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcjpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcicpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLWFnZW50cy1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5fYWN0aXZlIC5qcy1hZ2VudHMtc2xpZGVyX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3Bob25lIGEnKVxyXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0KHBob25lLnJlcGxhY2UoL14oXFwrNykoXFxkezN9KShcXGR7M30pKFxcZHsyfSkoXFxkezJ9KS8sICckMSAoJDIpICQzLSQ0LSQ1JykpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hyZWYnLCAndGVsOicgKyBwaG9uZS5yZXBsYWNlKC9bLVxccygpXS9nLCAnJykpO1xyXG4gICAgICAgICAgICB2YXIgbWFpbCA9ICRhZ2VudC5kYXRhKCdhZ2VudC1tYWlsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19tYWlsIGEnKS50ZXh0KG1haWwpLmF0dHIoJ2hyZWYnLCAnbWFpbHRvOicgKyBtYWlsKTtcclxuICAgICAgICAgICAgdmFyIHVybCA9ICRhZ2VudC5kYXRhKCdhZ2VudC11cmwnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3VybCBhJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyX191cmwnKS5hdHRyKCdocmVmJywgdXJsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1lbnUoKSB7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBocmVmID0gJCh0aGlzKS5kYXRhKCdocmVmJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyW2RhdGEtaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChocmVmKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbWVudS1vcGVuZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ21lbnUtb3BlbmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlciwgLmpzLW1lbnUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LXNlY29uZC10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXNlY29uZCcpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBvcHVwKCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBiYXNlQ2xhc3M6ICdfcG9wdXAnLFxyXG4gICAgICAgICAgICBhdXRvRm9jdXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBidG5UcGw6IHtcclxuICAgICAgICAgICAgICAgIHNtYWxsQnRuOiAnPHNwYW4gZGF0YS1mYW5jeWJveC1jbG9zZSBjbGFzcz1cImZhbmN5Ym94LWNsb3NlLXNtYWxsXCI+PHNwYW4gY2xhc3M9XCJsaW5rXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+PC9zcGFuPicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRvdWNoOiBmYWxzZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1wb3B1cCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJC5mYW5jeWJveC5jbG9zZSgpO1xyXG4gICAgICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpIHx8ICQodGhpcykuZGF0YSgnaHJlZicpO1xyXG4gICAgICAgICAgICBpZiAoaHJlZikge1xyXG4gICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKCcjJyArIGhyZWYuc3Vic3RyKDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gJCh0aGlzKS5kYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGggJiYgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJGlucHV0ID0gJHRhcmdldC5maW5kKCdbbmFtZT1cIicgKyBrICsgJ1wiXScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGlucHV0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGlucHV0LnZhbChkYXRhW2tdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJHRhcmdldCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcclxuICAgICAgICAgICAgdmFyICRjbnQgPSAkKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcclxuICAgICAgICAgICAgaWYgKCRjbnQubGVuZ3RoICYmICRjbnQuaGFzQ2xhc3MoJ3BvcHVwLWNudCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJGNudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNlbGVjdCgpIHtcclxuICAgICAgICAvLyBzZWxlY3QyXHJcbiAgICAgICAgJC5mbi5zZWxlY3QyLmRlZmF1bHRzLnNldChcInRoZW1lXCIsIFwiY3VzdG9tXCIpO1xyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiLCBJbmZpbml0eSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgIH0pO1xyXG4vLyAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCdvcGVuJyk7XHJcbiAgICAgICAgJChcIi5qcy1hZ2VudC1zZWFyY2hcIikuc2VsZWN0Mih7XHJcbiAgICAgICAgICAgIHRoZW1lOiAnYWdlbnRzJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgbGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIGlucHV0VG9vU2hvcnQ6IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwi0J/QvtC20LDQu9GD0LnRgdGC0LAsINCy0LLQtdC00LjRgtC1IFwiICsgKGEubWluaW11bSAtIGEuaW5wdXQubGVuZ3RoKSArIFwiINC40LvQuCDQsdC+0LvRjNGI0LUg0YHQuNC80LLQvtC70L7QslwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhamF4OiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkubXlqc29uLmNvbS9iaW5zL29reXZpXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgZGVsYXk6IDI1MCxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxOiBwYXJhbXMudGVybSwgLy8gc2VhcmNoIHRlcm1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnYWdlbnRfc2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0cyA9ICQubWFwKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdmFsdWUucGFnZXRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQ6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiByZXN1bHRzLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVSZXN1bHQ6IGZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgdGVtcGxhdGVTZWxlY3Rpb246IGZvcm1hdFNlbGVjdGlvbixcclxuICAgICAgICAgICAgZXNjYXBlTWFya3VwOiBmdW5jdGlvbiAobWFya3VwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya3VwO1xyXG4gICAgICAgICAgICB9LCAvLyBsZXQgb3VyIGN1c3RvbSBmb3JtYXR0ZXIgd29ya1xyXG4gICAgICAgICAgICBtaW5pbXVtSW5wdXRMZW5ndGg6IDMsXHJcbiAgICAgICAgICAgIG1heGltdW1TZWxlY3Rpb25MZW5ndGg6IDEsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UmVzdWx0KGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICfQv9C+0LjRgdC64oCmJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdC1hZ2VudFwiPjxzdHJvbmc+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hZ2VudC5wYWdldGl0bGUgKyAnPC9zdHJvbmc+PGJyPicgKyBpdGVtLmFnZW50LnZhbHVlICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFNlbGVjdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmFnZW50LnBhZ2V0aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWFnZW50LXNlYXJjaCcpLm9uKCdzZWxlY3QyOnNlbGVjdCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5wYXJhbXMuZGF0YTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZGF0YS5hZ2VudC51cmlcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFZhbGlkYXRlKCkge1xyXG4gICAgICAgICQudmFsaWRhdG9yLmFkZE1ldGhvZChcInBob25lXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbChlbGVtZW50KSB8fCAvXlxcK1xcZFxcc1xcKFxcZHszfVxcKVxcc1xcZHszfS1cXGR7Mn0tXFxkezJ9JC8udGVzdCh2YWx1ZSk7XHJcbiAgICAgICAgfSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIG1vYmlsZSBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoZXJyb3IsIGVsZW1lbnQpIHt9LFxyXG4gICAgICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwicGhvbmVcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtdmFsaWRhdGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS52YWxpZGF0ZShvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5RmlsdGVycygpIHtcclxuICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdHlwZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXRpdGxlJykudGV4dCgkKHRoaXMpLmRhdGEoJ2ZpbHRlcnMtdGl0bGUnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBhc3N3b3JkKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtcGFzc3dvcmQnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZHJvcGJveC96eGN2Ym5cclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IFwiLi9qcy9saWJzL3p4Y3Zibi5qc1wiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcclxuICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24gKHNjcmlwdCwgdGV4dFN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyB6eGN2Ym4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh6eGN2Ym4pID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0genhjdmJuKHZhbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyk7XHJcbiAgICAgICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zIF80Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyByZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQn9C70L7RhdC+0Lk6IDgg0LfQvdCw0LrQvtCyLCDQvtGB0YLQsNC70YzQvdGL0YUg0L/RgNC+0LLQtdGA0L7QuiDQvdC10YJcclxuICAgICDQodGA0LXQtNC90LjQuTogMTAg0LfQvdCw0LrQvtCyLCDQvNC40L0g0L7QtNC90LAg0LHRg9C60LLQsCwg0LzQuNC9INC+0LTQvdCwINC+0LTQvdCwINGG0LjRhNGA0LBcclxuICAgICDQpdC+0YDQvtGI0LjQuTogMTIg0LfQvdCw0LrQvtCyLCDQv9C70Y7RgSDQv9GA0L7QstC10YDQutCwINC90LAg0YHQv9C10YbQt9C90LDQuiDQuCDQt9Cw0LPQu9Cw0LLQvdGD0Y5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdEVhc3lQYXNzd29yZCgpIHtcclxuICAgICAgICB2YXIgc3BlY2lhbHMgPSAvWyFAIyQlXiZ+XS87XHJcbiAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY250ID0gJCh0aGlzKS5zaWJsaW5ncygnLmlucHV0LWhlbHAnKSxcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDA7XHJcbiAgICAgICAgICAgIGNudC5yZW1vdmVDbGFzcygnXzAgXzEgXzIgXzMnKTtcclxuICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoID49IGFwcENvbmZpZy5taW5QYXNzd29yZExlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSAxMCAmJiB2YWwuc2VhcmNoKC9cXGQvKSAhPT0gLTEgJiYgdmFsLnNlYXJjaCgvXFxELykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlID0gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gMTIgJiYgdmFsLnNlYXJjaCgvW0EtWl0vKSAhPT0gLTEgJiYgdmFsLnNlYXJjaChzcGVjaWFscykgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgc2NvcmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmV2aWV3c1NsaWRlcigpIHtcclxuICAgICAgICB2YXIgJHNsaWRlciA9ICQoJy5qcy1zbGlkZXItcmV2aWV3cycpO1xyXG4gICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cyBfYmlnJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50LmxnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciAkYmlnID0gJCgnLnJldmlld3NfX2xpc3QuX2JpZyAucmV2aWV3c19fbGlzdF9faXRlbScpO1xyXG4gICAgICAgIHZhciBjdXJyZW50ID0gMDtcclxuICAgICAgICBpZiAoJGJpZy5sZW5ndGggJiYgJHNsaWRlci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICRzbGlkZXJcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50U2xpZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gY3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJCaWcoKSB7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZU91dCgpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJpZygpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1yZXZpZXdzIC5zbGljay1jdXJyZW50IC5yZXZpZXdzX19saXN0X19pdGVtX19pbm5lcicpLmNsb25lKCkuYXBwZW5kVG8oJGJpZyk7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICRiaWcucGFyZW50KCkuY3NzKCdoZWlnaHQnLCAkYmlnLm91dGVySGVpZ2h0KHRydWUpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eSgpIHtcclxuICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3Bkb3BhZ2VfbG9hZCcsIGZ1bmN0aW9uIChlLCBjb25maWcsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKGRvY3VtZW50KS5vbignbXNlMl9sb2FkJywgZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJbZGF0YS1pbml0PVwiZmFsc2VcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdG9nZ2xlcnMgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2ltZy13cmFwcGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNvdW50ZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2NvdW50ZXInKTtcclxuICAgICAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlcnMucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY291bnRlci50ZXh0KGkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdpbml0JywgJ3RydWUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHYWxsZXJ5KCkge1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLnNsaWNrKHtcclxuICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA2LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeV9fc2xpZGVyJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogM1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtZ2FsbGVyeScpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgIHZhciAkc2xpZGVyID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX3NsaWRlcicpO1xyXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnQgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fY3VycmVudCcpO1xyXG4gICAgICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHRvdWNoVGhyZXNob2xkOiAxMCxcclxuICAgICAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnktbmF2JyxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzbGlkZXIub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkY3VycmVudC50ZXh0KCsrY3VycmVudFNsaWRlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciAkbGlua3MgPSAkc2xpZGVyLmZpbmQoJy5zbGlkZTpub3QoLnNsaWNrLWNsb25lZCknKTtcclxuICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX3RvdGFsJykudGV4dCgkbGlua3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgJGxpbmtzLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkbGlua3MsIHtcclxuICAgICAgICAgICAgICAgICAgICBsb29wOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LCAkbGlua3MuaW5kZXgodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3MoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tPdXRlcigpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXJldmlld3NfX291dGVyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGlubmVyID0gJCh0aGlzKS5maW5kKCcuanMtcmV2aWV3c19faW5uZXInKTtcclxuICAgICAgICAgICAgICAgIGlmICgkaW5uZXIub3V0ZXJIZWlnaHQoKSA8PSAkKHRoaXMpLm91dGVySGVpZ2h0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1yZXZpZXdzJykucmVtb3ZlQ2xhc3MoJ19mYWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXJldmlld3MnKS5hZGRDbGFzcygnX2ZhZGUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJvbGwoJGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKCEkaXRlbS5oYXNDbGFzcygnX2ZhZGUnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciAkdG9nZ2xlciA9ICRpdGVtLmZpbmQoJy5qcy1yZXZpZXdzX190b2dnbGVyJyk7XHJcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAoJGl0ZW0uaGFzQ2xhc3MoJ19vcGVuZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gJGl0ZW0uZGF0YSgnaGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAkdG9nZ2xlci50ZXh0KCR0b2dnbGVyLmRhdGEoJ3JvbGxkb3duJykpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW0uYW5pbWF0ZSh7aGVpZ2h0OiBoZWlnaHR9LCA0MDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmNzcygnaGVpZ2h0JywgJycpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICRpdGVtLnBhcmVudCgpLmhlaWdodCgkaXRlbS5vdXRlckhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgIHZhciAkY2xvbmUgPSAkaXRlbS5jbG9uZSgpLmFkZENsYXNzKCdfY2xvbmVkJykud2lkdGgoJGl0ZW0ub3V0ZXJXaWR0aCgpKS5hcHBlbmRUbygkcGFyZW50KTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9ICRjbG9uZS5vdXRlckhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgJGNsb25lLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW0uZGF0YSgnaGVpZ2h0JywgJGl0ZW0ub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW0uYW5pbWF0ZSh7aGVpZ2h0OiBoZWlnaHR9LCA0MDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlci50ZXh0KCR0b2dnbGVyLmRhdGEoJ3JvbGx1cCcpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1yZXZpZXdzX190b2dnbGVyLCAuanMtcmV2aWV3c19fb3V0ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJvbGwoJCh0aGlzKS5wYXJlbnRzKCcuanMtcmV2aWV3cycpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXJldmlld3MnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpLmNzcygnaGVpZ2h0JywgJycpO1xyXG4gICAgICAgICAgICAkKCcuanMtcmV2aWV3c19fdG9nZ2xlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS50ZXh0KCQodGhpcykuZGF0YSgncm9sbGRvd24nKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGVja091dGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2hlY2tPdXRlcigpO1xyXG4gICAgICAgICQoJy5qcy1yZXZpZXdzJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkbGlua3MgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZXZpZXdzX19zbGlkZScpO1xyXG4gICAgICAgICAgICAkbGlua3Mub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRsaW5rcywge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3A6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sICRsaW5rcy5pbmRleCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldE51bUVuZGluZyhpTnVtYmVyLCBhRW5kaW5ncykge1xyXG4gICAgICAgIHZhciBzRW5kaW5nLCBpO1xyXG4gICAgICAgIGlOdW1iZXIgPSBpTnVtYmVyICUgMTAwO1xyXG4gICAgICAgIGlmIChpTnVtYmVyID49IDExICYmIGlOdW1iZXIgPD0gMTkpIHtcclxuICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGkgPSBpTnVtYmVyICUgMTA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMSk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMik6XHJcbiAgICAgICAgICAgICAgICBjYXNlICgzKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1sxXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzRW5kaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRIeXBvdGhlYygpIHtcclxuICAgICAgICB2YXIgc3R5bGUgPSBbXTtcclxuICAgICAgICAkKCcuanMtaHlwb3RoZWMnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRjb3N0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2Nvc3QnKSxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0ID0gJGNvc3QudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtcGVyY2VudCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtc3VtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICRhZ2UgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fYWdlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNyZWRpdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jcmVkaXQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19pdGVtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjcm9sbCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zY3JvbGwnKSxcclxuICAgICAgICAgICAgICAgICAgICAkdG90YWwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2hvdy10YXJnZXQnKTtcclxuICAgICAgICAgICAgdmFyIHJhdGUgPSBbXTtcclxuICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmF0ZS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGUnKS50ZXh0KCkucmVwbGFjZShcIixcIiwgXCIuXCIpKSB8fCAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2cocmF0ZSk7XHJcbiAgICAgICAgICAgIHZhciByYXRlTUUgPSBbXTtcclxuICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmF0ZU1FLnB1c2gocGFyc2VGbG9hdCgkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcmF0ZU1FJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGVNRSk7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgdmFyIHBlcmNlbnQ7XHJcbiAgICAgICAgICAgICRjb3N0LmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJyxcclxuICAgICAgICAgICAgICAgIG9uY29tcGxldGU6IHJlY2FsY1BheW1lbnRzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkY29zdC5vbihcImNoYW5nZVwiLCByZWNhbGNQYXltZW50cyk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY2FsY1BheW1lbnRzKCkge1xyXG4gICAgICAgICAgICAgICAgY29zdCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS5wcm9wKCdtYXgnLCBjb3N0KTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBjb3N0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bVBpY2tlci5ub1VpU2xpZGVyLnNldChjb3N0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICRwYXltZW50U3VtLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gJCh0aGlzKS52YWwoKSAqIDEwMCAvIGNvc3Q7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoY29zdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcmVkaXQgPSBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50LnZhbChwZXJjZW50KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICRjcmVkaXQudmFsKGNyZWRpdCkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpcnN0JykudGV4dChmb3JtYXRQcmljZSgkcGF5bWVudFN1bS52YWwoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0uaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICAgICAgb25jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXBpY2tlcicpLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLm5vVWlTbGlkZXIuc2V0KCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0udHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICRhZ2Uub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY3JvbGwuZmluZCgnLmh5cG90aGVjLWxpc3RfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5oeXBvdGhlYy1saXN0X19pdGVtX19pbm5lcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGkpXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGZpbHRlcnMsINC60LDQttC00YvQuSDRgdC10LvQtdC60YIg0YTQuNC70YzRgtGA0YPQtdGCINC+0YLQtNC10LvRjNC90L5cclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpbHRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZOYW1lID0gJCh0aGlzKS5kYXRhKCdoeXBvdGhlYy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2ZpbHRlci0nICsgZk5hbWU7XHJcbiAgICAgICAgICAgICAgICBzdHlsZS5wdXNoKCcuJyArIGNsYXNzTmFtZSArICd7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICAgICAvLyDQv9GB0LXQstC00L7RgdC10LvQtdC60YLRi1xyXG4gICAgICAgICAgICAgICAgdmFyICRjaGVja2JveGVzID0gJCh0aGlzKS5maW5kKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG4gICAgICAgICAgICAgICAgJGNoZWNrYm94ZXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJGNoZWNrZWQgPSAkY2hlY2tib3hlcy5maWx0ZXIoJzpjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGVja2VkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGYgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNoZWNrZWQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLnB1c2goJzpub3QoW2RhdGEtZmlsdGVyLScgKyAkKHRoaXMpLnZhbCgpICsgJ10pJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCcuanMtaHlwb3RoZWNfX2l0ZW0nICsgZi5qb2luKCcnKSkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VG90YWwoJHRvdGFsLCAkaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyDQuNC90L/Rg9GC0YtcclxuICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSksIGNsYXNzTmFtZSA9ICdmaWx0ZXItZmlyc3QnO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLWZpcnN0XScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1maXJzdCcpKSA+IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGNyZWRpdC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpLCBjbGFzc05hbWUgPSAnZmlsdGVyLW1pbic7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWluXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1taW4nKSkgPiB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldFRvdGFsKCR0b3RhbCwgJGl0ZW1zKTtcclxuICAgICAgICAgICAgfSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLnB1c2goJy5maWx0ZXItbWlueWVhcntkaXNwbGF5Om5vbmUgIWltcG9ydGFudH0nKTtcclxuICAgICAgICAgICAgc3R5bGUucHVzaCgnLmZpbHRlci1tYXh5ZWFye2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50fScpO1xyXG4gICAgICAgICAgICAkYWdlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWlueWVhcl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItbWlueWVhcicpKSA+IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdmaWx0ZXItbWlueWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZpbHRlci1taW55ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWF4eWVhcl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItbWF4eWVhcicpKSA8IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdmaWx0ZXItbWF4eWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZpbHRlci1tYXh5ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXRUb3RhbCgkdG90YWwsICRpdGVtcyk7XHJcbiAgICAgICAgICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChzdHlsZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHVuaXF1ZVN0eWxlID0gW107XHJcbiAgICAgICAgICAgICQuZWFjaChzdHlsZSwgZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KGVsLCB1bmlxdWVTdHlsZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlU3R5bGUucHVzaChlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCc8c3R5bGU+JyArIHVuaXF1ZVN0eWxlLmpvaW4oJycpICsgJzwvc3R5bGU+JykuYXBwZW5kVG8oJ2hlYWQnKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1BheW1lbnQoY29zdCwgcGVyY2VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY0NyZWRpdChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0IC0gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZSwgYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY3JlZGl0ICogKChyYXRlIC8gMTIwMC4wKSAvICgxLjAgLSBNYXRoLnBvdygxLjAgKyByYXRlIC8gMTIwMC4wLCAtKGFnZSAqIDEyKSkpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFByaWNlKHByaWNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmljZS50b1N0cmluZygpLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24gKGMsIGksIGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpICYmIGMgIT09IFwiLlwiICYmICEoKGEubGVuZ3RoIC0gaSkgJSAzKSA/ICcgJyArIGMgOiBjO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VG90YWwoJHRhcmdldCwgJGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCdbY2xhc3MqPVwiZmlsdGVyXCJdJykubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgYSA9IGdldE51bUVuZGluZyh0b3RhbCwgWyfQndCw0LnQtNC10L3QsCcsICfQndCw0LnQtNC10L3QvicsICfQndCw0LnQtNC10L3QviddKTtcclxuICAgICAgICAgICAgdmFyIGIgPSBnZXROdW1FbmRpbmcodG90YWwsIFsn0LjQv9C+0YLQtdGH0L3QsNGPINC/0YDQvtCz0YDQsNC80LzQsCcsICfQuNC/0L7RgtC10YfQvdGL0LUg0L/RgNC+0LPRgNCw0LzQvNGLJywgJ9C40L/QvtGC0LXRh9C90YvRhSDQv9GA0L7Qs9GA0LDQvNC8J10pO1xyXG4gICAgICAgICAgICAkdGFyZ2V0LnRleHQoW2EsIHRvdGFsLCBiXS5qb2luKCcgJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlY19fc2hvdy1idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcykucGFyZW50cygnLmpzLWh5cG90aGVjJykuZmluZCgnLmpzLWh5cG90aGVjX19zaG93LXRhcmdldCcpO1xyXG4gICAgICAgICAgICBpZiAoJHQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBvZmZzZXR9LCAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERhdGVwaWNrZXIoKSB7XHJcbiAgICAgICAgdmFyIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNvbW1vbk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAndG9wIGxlZnQnLFxyXG4gICAgICAgICAgICBvblNob3c6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uSGlkZTogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoZm9ybWF0dGVkRGF0ZSwgZGF0ZSwgaW5zdCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdC4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlcicpLmRhdGVwaWNrZXIoT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIHRpbWVwaWNrZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGVUaW1lU2VwYXJhdG9yOiAnLCAnLFxyXG4gICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAkKCcuanMtZGF0ZXBpY2tlci1yYW5nZScpLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBtaW4gPSBuZXcgRGF0ZSgkKHRoaXMpLmRhdGEoJ21pbicpKSB8fCBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWF4JykpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG1pbixcclxuICAgICAgICAgICAgICAgIG1heERhdGU6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJyAtICcsXHJcbiAgICAgICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKHRoaXMpLmRhdGEoJ2RhdGVwaWNrZXInKTtcclxuICAgICAgICAgICAgZGF0ZXBpY2tlci5zZWxlY3REYXRlKFttaW4sIG1heF0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlcGlja2VyVmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKCcuanMtZGF0ZXRpbWVwaWNrZXIsIC5qcy1kYXRlcGlja2VyLXJhbmdlJykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZXBpY2tlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtC60YDRg9GC0LrQsCDQv9C+INGB0YHRi9C70LrQtSDQtNC+INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdFNjcm9sbCgpIHtcclxuICAgICAgICAkKCcuanMtc2Nyb2xsJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoJCh0aGlzKS5hdHRyKCdocmVmJykpO1xyXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIDQwO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXJfX21haW4nKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcl9fbWFpbicpLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcicpLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluaXRBYm91dCgpIHtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA1LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgdmVydGljYWw6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtYWJvdXQtaHlzdG9yeV9fY29udGVudC1zbGlkZXInLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBtb2JpbGVGaXJzdDogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kIC0gMSxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNzBweCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fc2libGluZycpLnJlbW92ZUNsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkubmV4dCgpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkucHJldigpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZpbGVpbnB1dCgpIHtcclxuICAgICAgICAkKCcuanMtZmlsZWlucHV0X19jbnQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdkZWZhdWx0JywgJCh0aGlzKS50ZXh0KCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9ICQodGhpcykudmFsKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLmpzLWZpbGVpbnB1dF9fY250JykudGV4dChmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QW50aXNwYW0oKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJlbWFpbDNcIl0saW5wdXRbbmFtZT1cImluZm9cIl0saW5wdXRbbmFtZT1cInRleHRcIl0nKS5hdHRyKCd2YWx1ZScsICcnKS52YWwoJycpO1xyXG4gICAgICAgIH0sIDUwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbHBoYWJldCgpIHtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtYWxwaGFiZXQgbGknKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFscGhhYmV0IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1TZWFyY2gyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgbVNlYXJjaDIucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJjb21tb24uanMifQ==
