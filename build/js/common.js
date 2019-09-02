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
        if (app.$chessTooltip) {
            app.$chessTooltip.remove();
        }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgYm9keTogJCgnYm9keScpLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRMb2dvKCk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0KHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0U2VhcmNoKHRoaXMuYm9keSk7XHJcbiAgICAgICAgdGhpcy5pbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VGFicygpO1xyXG4gICAgICAgIHRoaXMuaW5pdE1hc2soKTtcclxuICAgICAgICB0aGlzLmluaXRSYW5nZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdENoZXNzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3NGaWx0ZXIoKTtcclxuICAgICAgICB0aGlzLmluaXRGUlByb21vKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VXAoKTtcclxuICAgICAgICB0aGlzLmluaXRKc0xpbmsoKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdEpzTGluazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy1saW5rJykuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5kYXRhKCdocmVmJyk7XHJcbiAgICAgICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuZGF0YSgndGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAgICAgICAgJCh0aGlzKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oaHJlZiwgdGFyZ2V0IHx8ICdfc2VsZicpXHJcbiAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGluaXRVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkYnRuID0gJChcIi5qcy11cFwiKTtcclxuICAgICAgICBpZiAoISRidG4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGJyZWFrcG9pbnQgPSAkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSAvIDI7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnNjcm9sbFRvcCgpID4gYnJlYWtwb2ludCkge1xyXG4gICAgICAgICAgICAgICAgJGJ0bi5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGJ0bi5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe3Njcm9sbFRvcDogMH0sIDUwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBpbml0TG9nbzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB0aW1lb3V0ID0gYXBwQ29uZmlnLmxvZ29VcGRhdGVUaW1lb3V0IHx8IDMwMDAsXHJcbiAgICAgICAgICAgICAgICAkbG9nbyA9ICQoJy5qcy1sb2dvJyksIG5ld1NyYyA9ICRsb2dvLmRhdGEoJ25ld3NyYycpLFxyXG4gICAgICAgICAgICAgICAgJG5ld0xvZ28gPSAkKCc8aW1nPicpO1xyXG4gICAgICAgICRuZXdMb2dvLmF0dHIoJ3NyYycsIG5ld1NyYyk7XHJcbiAgICAgICAgJG5ld0xvZ28ub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGxvZ28ucGFyZW50KCkuY3NzKCd3aWR0aCcsICRsb2dvLm91dGVyV2lkdGgoKSk7XHJcbiAgICAgICAgICAgICAgICAkbG9nby5mYWRlT3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkbG9nby5hdHRyKCdzcmMnLCAkbmV3TG9nby5hdHRyKCdzcmMnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZ28uZmFkZUluKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGxvZ28ucGFyZW50KCkuY3NzKCd3aWR0aCcsICdhdXRvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSwgdGltZW91dCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKiBjdXN0b20gc2VsZWN0IFxyXG4gICAgICogQHBhcmFtICRjbnQgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIGluaXRQc2V1ZG9TZWxlY3Q6IGZ1bmN0aW9uICgkY250KSB7XHJcbiAgICAgICAgJGNudC5maW5kKCcuanMtc2VsZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkY250LmZpbmQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIWFwcC5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfb3BlbmVkIF9hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKiogY3VzdG9tIHNlbGVjdCBzZWFyY2hcclxuICAgICAqIEBwYXJhbSAkY250IGNvbnRhaW5lclxyXG4gICAgICovXHJcbiAgICBpbml0UHNldWRvU2VsZWN0U2VhcmNoOiBmdW5jdGlvbiAoJGNudCkge1xyXG4gICAgICAgICRjbnQuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2gnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faXRlbScpO1xyXG4gICAgICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pbnB1dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzZWxlY3Qtc2VhcmNoJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPSAtMSA/ICQodGhpcykuc2hvdygpIDogJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIGZvciBtRmlsdGVyMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBpbml0U2Nyb2xsYmFyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIHZhciB3ID0gJCh3aW5kb3cpLm91dGVyV2lkdGgoKTtcclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgJiYgdyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWRcclxuICAgICAgICAgICAgICAgICAgICAmJiAkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWhvdCcpLnNjcm9sbGJhcigpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0VGFiczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRhYnNTZWxlY3RvciA9IHR5cGVvZiAkKGVsZW0pLmRhdGEoJ3RhYnMnKSA9PT0gJ3VuZGVmaW5lZCcgPyAnLmpzLXRhYnNfX2xpc3QgPiBsaScgOiAkKGVsZW0pLmRhdGEoJ3RhYnMnKTtcclxuICAgICAgICAgICAgdmFyICRzZWxlY3QgPSAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKSwgd2l0aFNlbGVjdCA9ICRzZWxlY3QubGVuZ3RoO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKHtcclxuICAgICAgICAgICAgICAgIC8vINC00LvRjyDQstC70L7QttC10L3QvdGL0YUg0YLQsNCx0L7QsiDQuNGB0L/QvtC70YzQt9GD0LXQvCBkYXRhXHJcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzU2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICBwYW5lbENvbnRleHQ6ICQoZWxlbSkuaGFzQ2xhc3MoJ2pzLXRhYnNfZGlzY29ubmVjdGVkJykgPyAkKCcuanMtdGFic19fY29udGVudCcpIDogJChlbGVtKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUhhc2g6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHdpdGhTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCh0YWJzU2VsZWN0b3IpLmZpbmQoJ2EsIFtkYXRhLWhyZWZdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS5hdHRyKCdocmVmJykgfHwgJCh0aGlzKS5kYXRhKCdocmVmJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdzZWxlY3QnKSB8fCAkKHRoaXMpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIj4nICsgdGV4dCArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHNlbGVjdC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoJ3NlbGVjdCcsICQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChlbGVtKS5maW5kKHRhYnNTZWxlY3RvcikuZmluZCgnYTpub3QoLmRpc2FibGVkKSwgW2RhdGEtaHJlZl06bm90KC5kaXNhYmxlZCknKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBocmVmID0gJGNsaWNrZWQuYXR0cignaHJlZicpIHx8ICRjbGlja2VkLmRhdGEoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LnZhbChocmVmKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3NldFBvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdE1hc2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtbWFza19fdGVsJykuaW5wdXRtYXNrKHtcclxuICAgICAgICAgICAgbWFzazogJys5ICg5OTkpIDk5OS05OS05OSdcclxuICAgICAgICB9KTtcclxuICAgICAgICBJbnB1dG1hc2suZXh0ZW5kQWxpYXNlcyh7XHJcbiAgICAgICAgICAgICdudW1lcmljJzoge1xyXG4gICAgICAgICAgICAgICAgYXV0b1VubWFzazogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNob3dNYXNrT25Ib3ZlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICByYWRpeFBvaW50OiBcIixcIixcclxuICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yOiBcIiBcIixcclxuICAgICAgICAgICAgICAgIGRpZ2l0czogMCxcclxuICAgICAgICAgICAgICAgIGFsbG93TWludXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXV0b0dyb3VwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmlnaHRBbGlnbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1bm1hc2tBc051bWJlcjogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX251bWVyaWMnKS5pbnB1dG1hc2soXCJudW1lcmljXCIpO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3NxdWFyZScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC8wrInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3NxdWFyZV9maWx0ZXInKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJyxcclxuICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5X2ZpbHRlcicpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICB1bm1hc2tBc051bWJlcjogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fYWdlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LvQtdGCJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19wZXJjZW50JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJyUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5LCAuanMtbWFza19fc3F1YXJlLCAuanMtbWFza19fcGVyY2VudCcpLm9uKCdibHVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBuZWVkIGZvciByZW1vdmUgc3VmZml4XHJcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JpbkhlcmJvdHMvSW5wdXRtYXNrL2lzc3Vlcy8xNTUxXHJcbiAgICAgICAgICAgIHZhciB2ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKHYgPT0gMCB8fCB2ID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbCgnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFJhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgkKGVsZW0pLmhhc0NsYXNzKCdqcy1jaGVzcy1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ2VuZCcsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbbmFtZT1cInByaWNlX21heFwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbi8vICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB0bzogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IGlucHV0LmlucHV0bWFzaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmJiBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLW1hc2tfX2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBhcHAuZ2V0TnVtRW5kaW5nKHBhcnNlSW50KHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKSwgWyfCoNCz0L7QtCcsICfCoNCz0L7QtNCwJywgJ8Kg0LvQtdGCJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLm9wdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLyoqINCS0YvQtNC10LvQtdC90LjQtSDQutCy0LDRgNGC0LjRgNGLINCyINGI0LDRhdC80LDRgtC60LUg0Lgg0L7QsdC90L7QstC70LXQvdC40LUg0LjQvdGE0L7RgNC80LDRhtC40Lgg0L4g0LrQstCw0YDRgtC40YDQtSAqL1xyXG4gICAgY2hlc3NTZWxlY3RGbGF0OiBmdW5jdGlvbigkZmxhdCwgc2Nyb2xsVG9JbmZvKSB7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJGZsYXQ7XHJcbi8vICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdfc2VsZWN0ZWQnKSlcclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciAkdGFyZ2V0ID0ge1xyXG4gICAgICAgICAgICBjbnQ6ICQoJy5qcy1jaGVzcy1pbmZvJyksXHJcbiAgICAgICAgICAgIHRpdGxlOiAkKCcuanMtY2hlc3MtaW5mb19fdGl0bGUnKSxcclxuICAgICAgICAgICAgYXJlYTogJCgnLmpzLWNoZXNzLWluZm9fX2FyZWEnKSxcclxuICAgICAgICAgICAgcHJpY2U6ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZScpLFxyXG4gICAgICAgICAgICBwcmljZVBlclNxdWFyZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlUGVyU3F1YXJlJyksXHJcbiAgICAgICAgICAgIGZsb29yOiAkKCcuanMtY2hlc3MtaW5mb19fZmxvb3InKSxcclxuICAgICAgICAgICAgZmxvb3JzVG90YWw6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcnNUb3RhbCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgICAgICRoeXBvdGhlYyA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYycpLFxyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyID0gJCgnLmpzLWNoZXNzLWluZm9fX2h5cG90aGVjLXdyYXBwZXInKSxcclxuICAgICAgICAgICAgJHByaWNlV3JhcHBlciA9ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZS13cmFwcGVyJyksXHJcbiAgICAgICAgICAgICRwcmljZVBlclNxdWFyZVdyYXBwZXIgPSAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2VQZXJTcXVhcmUtd3JhcHBlcicpLFxyXG4gICAgICAgICAgICAkaW1nRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbGF0JyksXHJcbiAgICAgICAgICAgICRpbWdGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbG9vcicpLFxyXG4gICAgICAgICAgICAkdGFicyA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJzJyksXHJcbiAgICAgICAgICAgICR0YWJGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbG9vcicpLFxyXG4gICAgICAgICAgICAkdGFiRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbGF0JyksXHJcbiAgICAgICAgICAgICRmb3JtID0gJCgnLmpzLWNoZXNzLWluZm9fX2Zvcm0nKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0nKS5yZW1vdmVDbGFzcygnX3NlbGVjdGVkJyk7XHJcbiAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gICAgICAgIGZvciAodmFyIGtleSBpbiAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICR0YXJnZXRba2V5XS50ZXh0KGRhdGFba2V5XSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRmb3JtLnZhbChkYXRhLmZvcm0pO1xyXG4gICAgICAgIGlmIChkYXRhLmh5cG90aGVjKSB7XHJcbiAgICAgICAgICAgICRoeXBvdGhlYy50ZXh0KGRhdGEuaHlwb3RoZWMpO1xyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLnNob3coKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF0YS5wcmljZSAhPSAwID8gJHByaWNlV3JhcHBlci5zaG93KCkgOiAkcHJpY2VXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICBkYXRhLnByaWNlUGVyU3F1YXJlICE9IDAgPyAkcHJpY2VQZXJTcXVhcmVXcmFwcGVyLnNob3coKSA6ICRwcmljZVBlclNxdWFyZVdyYXBwZXIuaGlkZSgpO1xyXG4gICAgICAgIGlmICgkKCcuanMtaHlwb3RoZWNfX2Nvc3QnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1oeXBvdGhlY19fY29zdCcpLnZhbChkYXRhLmZpbHRlclByaWNlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLnZhbChkYXRhLmZpbHRlclByaWNlIC8gMikudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmltZ0ZsYXQpIHtcclxuICAgICAgICAgICAgJGltZ0ZsYXQuYXR0cignaHJlZicsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LnNob3coKTtcclxuICAgICAgICAgICAgJHRhYkZsYXQuc2hvdygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRpbWdGbGF0LmhpZGUoKTtcclxuICAgICAgICAgICAgJHRhYkZsYXQuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5pbWdGbG9vcikge1xyXG4gICAgICAgICAgICAkaW1nRmxvb3IuYXR0cignaHJlZicsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAkaW1nRmxvb3IuZmluZCgnaW1nJykuYXR0cignc3JjJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICRpbWdGbG9vci5zaG93KCk7XHJcbiAgICAgICAgICAgICR0YWJGbG9vci5zaG93KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJGltZ0Zsb29yLmhpZGUoKTtcclxuICAgICAgICAgICAgJHRhYkZsb29yLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCR0YWJzLmZpbmQoJ2xpOnZpc2libGUnKS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAkdGFicy5maW5kKCdsaTp2aXNpYmxlJykuZmlyc3QoKS5maW5kKCdhJykuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNjcm9sbFRvSW5mbykge1xyXG4gICAgICAgICAgICB2YXIgc2Nyb2xsID0gJHRhcmdldC5jbnQub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5jbnQub3V0ZXJIZWlnaHQoKSA8PSAkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsIC09ICgkKHdpbmRvdykub3V0ZXJIZWlnaHQoKSAtICR0YXJnZXQuY250Lm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoXCJodG1sLCBib2R5XCIpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxcclxuICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRDaGVzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykucGFyZW50KCkuaG92ZXIoYXBwLnNob3dDaGVzc1Rvb2x0aXAsIGFwcC5oaWRlQ2hlc3NUb29sdGlwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0uX2FjdGl2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBhcHAuY2hlc3NTZWxlY3RGbGF0KCQodGhpcyksIHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtLl9hY3RpdmUnKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICB9LFxyXG5cclxuICAgICRjaGVzc1Rvb2x0aXA6IG51bGwsXHJcbiAgICAkY2hlc3NUb29sdGlwVGltZW91dDogbnVsbCxcclxuXHJcbiAgICBzaG93Q2hlc3NUb29sdGlwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRzZWxmLm9mZnNldCgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcCA9ICRzZWxmLmZpbmQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykuY2xvbmUoKTtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCArIDI4LFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyAxMCxcclxuICAgICAgICAgICAgfSkuYXBwZW5kVG8oJCgnYm9keScpKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoYXBwLiRjaGVzc1Rvb2x0aXBUaW1lb3V0KTtcclxuICAgICAgICBpZiAoYXBwLiRjaGVzc1Rvb2x0aXApIHtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0Q2hlc3NGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBjaGVzcyBsaW5rIGluIGZpbHRlciByZXN1bHRcclxuICAgICAgICBmdW5jdGlvbiBpbml0TGluaygpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAobVNlYXJjaDIpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtY2hlc3NfX2xpbmsnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJC5wYXJhbShtU2VhcmNoMi5nZXRGaWx0ZXJzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbiA9ICQodGhpcykuYXR0cignaHJlZicpICsgJz8nICsgcXVlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oJCh0aGlzKS5hdHRyKCdocmVmJykgKyAnPycgKyBxdWVyeSwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluaXRMaW5rKCk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXRMaW5rKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciAkZm9ybSA9ICQoJy5qcy1jaGVzcy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICRpdGVtcyA9ICQoJy5qcy1jaGVzcy1maWx0ZXJfX2l0ZW0nKSxcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4gPSBudWxsLCBhcmVhTWF4ID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHByaWNlTWluID0gbnVsbCwgcHJpY2VNYXggPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVyUHJpY2UgPSAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLnBhcmVudHMoJy5qcy1yYW5nZScpLmZpbmQoJy5qcy1yYW5nZV9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJBcmVhID0gJGZvcm0uZmluZCgnW25hbWU9XCJhcmVhX21pblwiXScpLnBhcmVudHMoJy5qcy1yYW5nZScpLmZpbmQoJy5qcy1yYW5nZV9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCcuX3NvbGQnKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCRmb3JtLmxlbmd0aCA9PT0gMCB8fCAkaXRlbXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItYXJlYV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZWEgPSBwYXJzZUZsb2F0KCQodGhpcykuZGF0YSgnZmlsdGVyLWFyZWEnKSk7XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1pbiB8fCBhcmVhIDwgYXJlYU1pbikge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IE1hdGguZmxvb3IoYXJlYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFhcmVhTWF4IHx8IGFyZWEgPiBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4ID0gTWF0aC5jZWlsKGFyZWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLXByaWNlXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcHJpY2UgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1wcmljZScpKTtcclxuICAgICAgICAgICAgaWYgKCFwcmljZU1pbiB8fCBwcmljZSA8IHByaWNlTWluKSB7XHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbiA9IHByaWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNYXggfHwgcHJpY2UgPiBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNYXggPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9taW5cIl0nKS5hdHRyKCd2YWx1ZScsIGFyZWFNaW4pLmF0dHIoJ21pbicsIGFyZWFNaW4pLmF0dHIoJ21heCcsIGFyZWFNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIGFyZWFNYXgpLmF0dHIoJ21pbicsIGFyZWFNaW4pLmF0dHIoJ21heCcsIGFyZWFNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicHJpY2VfbWluXCJdJykuYXR0cigndmFsdWUnLCBwcmljZU1pbikuYXR0cignbWluJywgcHJpY2VNaW4pLmF0dHIoJ21heCcsIHByaWNlTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21heFwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNYXgpLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLXJvb21zPVwiJyArICQodGhpcykudmFsKCkgKyAnXCJdJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2xpZGVyUHJpY2Uubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgIHByaWNlTWluLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VNYXhcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICdtaW4nOiBwcmljZU1pbixcclxuICAgICAgICAgICAgICAgICdtYXgnOiBwcmljZU1heFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSAvLyBCb29sZWFuICdmaXJlU2V0RXZlbnQnXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIHNsaWRlckFyZWEubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4sXHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAnbWluJzogYXJlYU1pbixcclxuICAgICAgICAgICAgICAgICdtYXgnOiBhcmVhTWF4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlIC8vIEJvb2xlYW4gJ2ZpcmVTZXRFdmVudCdcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICRmb3JtLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKCdfc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdmFyIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhOiBbYXJlYU1pbiwgYXJlYU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlOiBbcHJpY2VNaW4sIHByaWNlTWF4XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgICQuZWFjaChmb3JtRGF0YSwgZnVuY3Rpb24gKG4sIHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWluJyAmJiB2LnZhbHVlICE9IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWF4JyAmJiB2LnZhbHVlICE9IGFyZWFNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21pbicgJiYgdi52YWx1ZSAhPSBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21heCcgJiYgdi52YWx1ZSAhPSBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3Jvb21zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucm9vbXMucHVzaCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmFyZWFbMF0gPT0gYXJlYU1pbiAmJiBmaWx0ZXJzLmFyZWFbMV0gPT0gYXJlYU1heClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLmFyZWE7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnByaWNlWzBdID09IHByaWNlTWluICYmIGZpbHRlcnMucHJpY2VbMV0gPT0gcHJpY2VNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5wcmljZTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMucm9vbXMubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5yb29tcztcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhmaWx0ZXJzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5hZGRDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gdHJ1ZSwgJF9pdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goZmlsdGVycywgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhcmVhJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmVhIDwgdlswXSB8fCBhcmVhID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkgIT09ICd1bmRlZmluZWQnICYmICRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByaWNlID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJpY2UgPCB2WzBdIHx8IHByaWNlID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncm9vbXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcm9vbXMnKSkgPT09ICd1bmRlZmluZWQnIHx8IHYuaW5kZXhPZigkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykudG9TdHJpbmcoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q2hlc3NUb3RhbCgkaXRlbXMubGVuZ3RoIC0gJGl0ZW1zLmZpbHRlcignLl9maWx0ZXJlZCcpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwodG90YWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciAkbm90RmlsdGVyZWRJdGVtcyA9ICRpdGVtcy5maWx0ZXIoJy5fYWN0aXZlOm5vdCguX2ZpbHRlcmVkKScpO1xyXG4gICAgICAgICAgICBpZiAoJG5vdEZpbHRlcmVkSXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBhcHAuY2hlc3NTZWxlY3RGbGF0KCRub3RGaWx0ZXJlZEl0ZW1zLmZpcnN0KCksIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBoYW5kbGUgZ2V0IGZpbHRlcnNcclxuICAgICAgICB2YXIgZmlsdGVycyA9IHt9LCBoYXNoLCBoYXNoZXM7XHJcbiAgICAgICAgaGFzaGVzID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpKTtcclxuICAgICAgICBpZiAoaGFzaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBoYXNoZXMgPSBoYXNoZXMuc3BsaXQoJyYnKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBoYXNoZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNoZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYXNoWzFdICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChmaWx0ZXJzLmtvbW5hdG55ZSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vbXMgPSBmaWx0ZXJzWydrb21uYXRueWUnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChyb29tcywgZnVuY3Rpb24gKGksIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmZpbHRlcignW3ZhbHVlPVwiJyArIHYgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmZpbHRlcignW3ZhbHVlPVwiJyArIGZpbHRlcnMua29tbmF0bnllICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8YXJlYSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxhcmVhJ10uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJBcmVhLm5vVWlTbGlkZXIuc2V0KGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxwcmljZSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8cHJpY2UnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlclByaWNlLm5vVWlTbGlkZXIuc2V0KHByaWNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoZXNzVG90YWw6IGZ1bmN0aW9uICh0b3RhbCkge1xyXG4gICAgICAgIHZhciBlbmRpbmdzID0gWyfQutCy0LDRgNGC0LjRgNCwJywgJ9C60LLQsNGA0YLQuNGA0YsnLCAn0LrQstCw0YDRgtC40YAnXTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtZmlsdGVyX190b3RhbCcpLnRleHQodG90YWwgKyAnICcgKyBhcHAuZ2V0TnVtRW5kaW5nKHRvdGFsLCBlbmRpbmdzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZml4ZWQgcmlnaHQgcHJvbW9cclxuICAgICAqL1xyXG4gICAgaW5pdEZSUHJvbW86IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGNudCA9ICQoJy5qcy1mcicpO1xyXG4gICAgICAgIGlmICghJGNudC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtZnJfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRjbnQudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQpNGD0L3QutGG0LjRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvtC60L7QvdGH0LDQvdC40LUg0LTQu9GPINC80L3QvtC20LXRgdGC0LLQtdC90L3QvtCz0L4g0YfQuNGB0LvQsCDRgdC70L7QstCwINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGH0LjRgdC70LAg0Lgg0LzQsNGB0YHQuNCy0LAg0L7QutC+0L3Rh9Cw0L3QuNC5XHJcbiAgICAgKiBwYXJhbSAgaU51bWJlciBJbnRlZ2VyINCn0LjRgdC70L4g0L3QsCDQvtGB0L3QvtCy0LUg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INGB0YTQvtGA0LzQuNGA0L7QstCw0YLRjCDQvtC60L7QvdGH0LDQvdC40LVcclxuICAgICAqIHBhcmFtICBhRW5kaW5ncyBBcnJheSDQnNCw0YHRgdC40LIg0YHQu9C+0LIg0LjQu9C4INC+0LrQvtC90YfQsNC90LjQuSDQtNC70Y8g0YfQuNGB0LXQuyAoMSwgNCwgNSksXHJcbiAgICAgKiAgICAgICAgINC90LDQv9GA0LjQvNC10YAgWyfRj9Cx0LvQvtC60L4nLCAn0Y/QsdC70L7QutCwJywgJ9GP0LHQu9C+0LonXVxyXG4gICAgICogcmV0dXJuIFN0cmluZ1xyXG4gICAgICogXHJcbiAgICAgKiBodHRwczovL2hhYnJhaGFici5ydS9wb3N0LzEwNTQyOC9cclxuICAgICAqL1xyXG4gICAgZ2V0TnVtRW5kaW5nOiBmdW5jdGlvbiAoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH0sXHJcblxyXG59XHJcblxyXG5qUXVlcnkoZnVuY3Rpb24gKCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRNYWluU2xpZGVyKCk7XHJcbiAgICAgICAgaW5pdFNtYWxsU2xpZGVycygpO1xyXG4gICAgICAgIGluaXRSZXZpZXdzU2xpZGVyKCk7XHJcbiAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4vLyAgICAgICAgaW5pdFBhc3N3b3JkKCk7XHJcbiAgICAgICAgaW5pdEVhc3lQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5KCk7XHJcbiAgICAgICAgaW5pdEh5cG90aGVjKCk7XHJcbiAgICAgICAgaW5pdERhdGVwaWNrZXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsKCk7XHJcbiAgICAgICAgaW5pdEFib3V0KCk7XHJcbiAgICAgICAgaW5pdEZpbGVpbnB1dCgpO1xyXG4gICAgICAgIGluaXRBbHBoYWJldCgpO1xyXG4gICAgICAgIGluaXRBbnRpc3BhbSgpO1xyXG4gICAgICAgIGluaXRSZXZpZXdzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbi8vICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ3Bkb3BhZ2VfbG9hZCcsIGZ1bmN0aW9uIChlLCBjb25maWcsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgaW5pdFJldmlld3MoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYWluU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciB0aW1lID0gYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQgLyAxMDAwO1xyXG4gICAgICAgICQoJy5qcy1zbGlkZXItbWFpbicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGJhciA9ICQodGhpcykuZmluZCgnLmpzLXNsaWRlci1tYWluX19iYXInKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2xpY2sgPSAkKHRoaXMpLmZpbmQoJy5qcy1zbGlkZXItbWFpbl9fc2xpZGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudFRpbWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0b3RhbCA9ICRzbGljay5maW5kKCcuc2xpZGUnKS5sZW5ndGhcclxuXHJcbiAgICAgICAgICAgICRzbGljay5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0b3RhbCA+IDEsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNwZWVkOiBhcHBDb25maWcuc2xpZGVyRmFkZVNwZWVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRvdGFsID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAkYmFyLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlIDwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzbGljay5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5yZW1vdmVDbGFzcygnX2ZhZGUgX2xlZnQgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNsaWNrLm9uKHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc1BhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc3RhcnRQcm9ncmVzc2JhcigpIHtcclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmVzZXRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aWNrID0gc2V0SW50ZXJ2YWwoaW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNQYXVzZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50VGltZSArPSAxIC8gKHRpbWUgKyAwLjEpO1xyXG4gICAgICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUaW1lICsgXCIlXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzbGljay5zbGljaygnc2xpY2tOZXh0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAgKyAnJSdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNtYWxsU2xpZGVycygpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGw6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbC5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMjUlJyxcclxuLy8gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzgwcHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtYWdlbnRzLXNsaWRlcicpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgJGFnZW50ID0gJCgnLmpzLWFnZW50cy1zbGlkZXIgLl9hY3RpdmUgLmpzLWFnZW50cy1zbGlkZXJfX3Nob3J0Jyk7XHJcbiAgICAgICAgICAgIHZhciAkZnVsbCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19pbWcnKS5hdHRyKCdzcmMnLCAkYWdlbnQuZGF0YSgnYWdlbnQtaW1nJykpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbmFtZScpLnRleHQoJGFnZW50LmRhdGEoJ2FnZW50LW5hbWUnKSk7XHJcbiAgICAgICAgICAgIHZhciBwaG9uZSA9ICRhZ2VudC5kYXRhKCdhZ2VudC1waG9uZScpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fcGhvbmUgYScpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRleHQocGhvbmUucmVwbGFjZSgvXihcXCs3KShcXGR7M30pKFxcZHszfSkoXFxkezJ9KShcXGR7Mn0pLywgJyQxICgkMikgJDMtJDQtJDUnKSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignaHJlZicsICd0ZWw6JyArIHBob25lLnJlcGxhY2UoL1stXFxzKCldL2csICcnKSk7XHJcbiAgICAgICAgICAgIHZhciBtYWlsID0gJGFnZW50LmRhdGEoJ2FnZW50LW1haWwnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX21haWwgYScpLnRleHQobWFpbCkuYXR0cignaHJlZicsICdtYWlsdG86JyArIG1haWwpO1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gJGFnZW50LmRhdGEoJ2FnZW50LXVybCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fdXJsIGEnKS5hdHRyKCdocmVmJywgdXJsKTtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXJfX3VybCcpLmF0dHIoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWVudSgpIHtcclxuICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xyXG4gICAgICAgICAgICBpZiAoaHJlZikge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcltocmVmPVwiJyArIGhyZWYgKyAnXCJdJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhyZWYgPSAkKHRoaXMpLmRhdGEoJ2hyZWYnKTtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbZGF0YS1ocmVmPVwiJyArIGhyZWYgKyAnXCJdJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKGhyZWYpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICgkKCcuanMtbWVudS5fYWN0aXZlJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5Jykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdtZW51LW9wZW5lZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbWVudS1vcGVuZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyLCAuanMtbWVudScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGlkZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kLXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UG9wdXAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJhc2VDbGFzczogJ19wb3B1cCcsXHJcbiAgICAgICAgICAgIGF1dG9Gb2N1czogZmFsc2UsXHJcbiAgICAgICAgICAgIGJ0blRwbDoge1xyXG4gICAgICAgICAgICAgICAgc21hbGxCdG46ICc8c3BhbiBkYXRhLWZhbmN5Ym94LWNsb3NlIGNsYXNzPVwiZmFuY3lib3gtY2xvc2Utc21hbGxcIj48c3BhbiBjbGFzcz1cImxpbmtcIj7Ql9Cw0LrRgNGL0YLRjDwvc3Bhbj48L3NwYW4+JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG91Y2g6IGZhbHNlLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJykgfHwgJCh0aGlzKS5kYXRhKCdocmVmJyk7XHJcbiAgICAgICAgICAgIGlmIChocmVmKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoJyMnICsgaHJlZi5zdWJzdHIoMSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLmRhdGEoKTtcclxuICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCAmJiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkaW5wdXQgPSAkdGFyZ2V0LmZpbmQoJ1tuYW1lPVwiJyArIGsgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW5wdXQudmFsKGRhdGFba10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkdGFyZ2V0LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgJGNudCA9ICQod2luZG93LmxvY2F0aW9uLmhhc2gpO1xyXG4gICAgICAgICAgICBpZiAoJGNudC5sZW5ndGggJiYgJGNudC5oYXNDbGFzcygncG9wdXAtY250JykpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkY250LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2VsZWN0KCkge1xyXG4gICAgICAgIC8vIHNlbGVjdDJcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwidGhlbWVcIiwgXCJjdXN0b21cIik7XHJcbiAgICAgICAgJC5mbi5zZWxlY3QyLmRlZmF1bHRzLnNldChcIm1pbmltdW1SZXN1bHRzRm9yU2VhcmNoXCIsIEluZmluaXR5KTtcclxuICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCk7XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoJ29wZW4nKTtcclxuICAgICAgICAkKFwiLmpzLWFnZW50LXNlYXJjaFwiKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgdGhlbWU6ICdhZ2VudHMnLFxyXG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICBsYW5ndWFnZToge1xyXG4gICAgICAgICAgICAgICAgaW5wdXRUb29TaG9ydDogZnVuY3Rpb24gKGEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCLQn9C+0LbQsNC70YPQudGB0YLQsCwg0LLQstC10LTQuNGC0LUgXCIgKyAoYS5taW5pbXVtIC0gYS5pbnB1dC5sZW5ndGgpICsgXCIg0LjQu9C4INCx0L7Qu9GM0YjQtSDRgdC40LzQstC+0LvQvtCyXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFqYXg6IHtcclxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL2FwaS5teWpzb24uY29tL2JpbnMvb2t5dmlcIixcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgICAgICBkZWxheTogMjUwLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHE6IHBhcmFtcy50ZXJtLCAvLyBzZWFyY2ggdGVybVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdhZ2VudF9zZWFyY2gnXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24gKGRhdGEpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRzID0gJC5tYXAoZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiB2YWx1ZS5wYWdldGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ2VudDogdmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IHJlc3VsdHMsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVJlc3VsdDogZm9ybWF0UmVzdWx0LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVNlbGVjdGlvbjogZm9ybWF0U2VsZWN0aW9uLFxyXG4gICAgICAgICAgICBlc2NhcGVNYXJrdXA6IGZ1bmN0aW9uIChtYXJrdXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXJrdXA7XHJcbiAgICAgICAgICAgIH0sIC8vIGxldCBvdXIgY3VzdG9tIGZvcm1hdHRlciB3b3JrXHJcbiAgICAgICAgICAgIG1pbmltdW1JbnB1dExlbmd0aDogMyxcclxuICAgICAgICAgICAgbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRSZXN1bHQoaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ9C/0L7QuNGB0LrigKYnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInNlbGVjdDItcmVzdWx0LWFnZW50XCI+PHN0cm9uZz4nICtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmFnZW50LnBhZ2V0aXRsZSArICc8L3N0cm9uZz48YnI+JyArIGl0ZW0uYWdlbnQudmFsdWUgKyAnPC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0U2VsZWN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uYWdlbnQucGFnZXRpdGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtYWdlbnQtc2VhcmNoJykub24oJ3NlbGVjdDI6c2VsZWN0JywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBlLnBhcmFtcy5kYXRhO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBkYXRhLmFnZW50LnVyaVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VmFsaWRhdGUoKSB7XHJcbiAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKFwicGhvbmVcIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKGVsZW1lbnQpIHx8IC9eXFwrXFxkXFxzXFwoXFxkezN9XFwpXFxzXFxkezN9LVxcZHsyfS1cXGR7Mn0kLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICB9LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge30sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCJwaG9uZVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy12YWxpZGF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnZhbGlkYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHlGaWx0ZXJzKCkge1xyXG4gICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10eXBlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdGl0bGUnKS50ZXh0KCQodGhpcykuZGF0YSgnZmlsdGVycy10aXRsZScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgaWYgKCQoJy5qcy1wYXNzd29yZCcpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kcm9wYm94L3p4Y3ZiblxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogXCIuL2pzL2xpYnMvenhjdmJuLmpzXCIsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcInNjcmlwdFwiLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbiAoc2NyaXB0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uIChqcXhociwgc2V0dGluZ3MsIGV4Y2VwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBsb2FkaW5nIHp4Y3ZibicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHp4Y3ZibikgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSB6eGN2Ym4odmFsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY250ID0gJCh0aGlzKS5zaWJsaW5ncygnLmlucHV0LWhlbHAnKTtcclxuICAgICAgICAgICAgICAgIGNudC5yZW1vdmVDbGFzcygnXzAgXzEgXzIgXzMgXzQnKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY250LmFkZENsYXNzKCdfJyArIHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5rZXl1cCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0LvQvtGF0L7QuTogOCDQt9C90LDQutC+0LIsINC+0YHRgtCw0LvRjNC90YvRhSDQv9GA0L7QstC10YDQvtC6INC90LXRglxyXG4gICAgINCh0YDQtdC00L3QuNC5OiAxMCDQt9C90LDQutC+0LIsINC80LjQvSDQvtC00L3QsCDQsdGD0LrQstCwLCDQvNC40L0g0L7QtNC90LAg0L7QtNC90LAg0YbQuNGE0YDQsFxyXG4gICAgINCl0L7RgNC+0YjQuNC5OiAxMiDQt9C90LDQutC+0LIsINC/0LvRjtGBINC/0YDQvtCy0LXRgNC60LAg0L3QsCDRgdC/0LXRhtC30L3QsNC6INC4INC30LDQs9C70LDQstC90YPRjlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0RWFzeVBhc3N3b3JkKCkge1xyXG4gICAgICAgIHZhciBzcGVjaWFscyA9IC9bIUAjJCVeJn5dLztcclxuICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlID0gMDtcclxuICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMycpO1xyXG4gICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gYXBwQ29uZmlnLm1pblBhc3N3b3JkTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoID49IDEwICYmIHZhbC5zZWFyY2goL1xcZC8pICE9PSAtMSAmJiB2YWwuc2VhcmNoKC9cXEQvKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSAxMiAmJiB2YWwuc2VhcmNoKC9bQS1aXS8pICE9PSAtMSAmJiB2YWwuc2VhcmNoKHNwZWNpYWxzKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlID0gMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyBzY29yZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5rZXl1cCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZXZpZXdzU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciAkc2xpZGVyID0gJCgnLmpzLXNsaWRlci1yZXZpZXdzJyk7XHJcbiAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkb3RzQ2xhc3M6ICdzbGljay1kb3RzIF9iaWcnLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyICRiaWcgPSAkKCcucmV2aWV3c19fbGlzdC5fYmlnIC5yZXZpZXdzX19saXN0X19pdGVtJyk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAwO1xyXG4gICAgICAgIGlmICgkYmlnLmxlbmd0aCAmJiAkc2xpZGVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgJHNsaWRlclxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyQmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjbGVhckJpZygpIHtcclxuICAgICAgICAgICAgJGJpZy5mYWRlT3V0KCkuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmlnKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXJldmlld3MgLnNsaWNrLWN1cnJlbnQgLnJldmlld3NfX2xpc3RfX2l0ZW1fX2lubmVyJykuY2xvbmUoKS5hcHBlbmRUbygkYmlnKTtcclxuICAgICAgICAgICAgJGJpZy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgJGJpZy5wYXJlbnQoKS5jc3MoJ2hlaWdodCcsICRiaWcub3V0ZXJIZWlnaHQodHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5KCkge1xyXG4gICAgICAgIGluaXQoKTtcclxuICAgICAgICAkKGRvY3VtZW50KS5vbigncGRvcGFnZV9sb2FkJywgZnVuY3Rpb24gKGUsIGNvbmZpZywgcmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdtc2UyX2xvYWQnLCBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcltkYXRhLWluaXQ9XCJmYWxzZVwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICR0b2dnbGVycyA9ICQodGhpcykuZmluZCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcl9faW1nLXdyYXBwZXInKTtcclxuICAgICAgICAgICAgICAgIHZhciAkY291bnRlciA9ICQodGhpcykuZmluZCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcl9fY291bnRlcicpO1xyXG4gICAgICAgICAgICAgICAgJHRvZ2dsZXJzLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR0b2dnbGVycy5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb3VudGVyLnRleHQoaSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2luaXQnLCAndHJ1ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdhbGxlcnkoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnktbmF2Jykuc2xpY2soe1xyXG4gICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5X19zbGlkZXInLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5JykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgdmFyICRzbGlkZXIgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fc2xpZGVyJyk7XHJcbiAgICAgICAgICAgIHZhciAkY3VycmVudCA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDEwLFxyXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeS1uYXYnLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNsaWRlci5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICRjdXJyZW50LnRleHQoKytjdXJyZW50U2xpZGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyICRsaW5rcyA9ICRzbGlkZXIuZmluZCgnLnNsaWRlOm5vdCguc2xpY2stY2xvbmVkKScpO1xyXG4gICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fdG90YWwnKS50ZXh0KCRsaW5rcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAkbGlua3Mub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRsaW5rcywge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3A6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sICRsaW5rcy5pbmRleCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmV2aWV3cygpIHtcclxuICAgICAgICBmdW5jdGlvbiBjaGVja091dGVyKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmV2aWV3c19fb3V0ZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkaW5uZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZXZpZXdzX19pbm5lcicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRpbm5lci5vdXRlckhlaWdodCgpIDw9ICQodGhpcykub3V0ZXJIZWlnaHQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXJldmlld3MnKS5yZW1vdmVDbGFzcygnX2ZhZGUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcmV2aWV3cycpLmFkZENsYXNzKCdfZmFkZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gcm9sbCgkaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoISRpdGVtLmhhc0NsYXNzKCdfZmFkZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyICR0b2dnbGVyID0gJGl0ZW0uZmluZCgnLmpzLXJldmlld3NfX3RvZ2dsZXInKTtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcygnX29wZW5lZCcpKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAkaXRlbS5kYXRhKCdoZWlnaHQnKTtcclxuICAgICAgICAgICAgICAgICR0b2dnbGVyLnRleHQoJHRvZ2dsZXIuZGF0YSgncm9sbGRvd24nKSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbS5hbmltYXRlKHtoZWlnaHQ6IGhlaWdodH0sIDQwMCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW0uY3NzKCdoZWlnaHQnLCAnJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJGl0ZW0ucGFyZW50KCkuaGVpZ2h0KCRpdGVtLm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjbG9uZSA9ICRpdGVtLmNsb25lKCkuYWRkQ2xhc3MoJ19jbG9uZWQnKS53aWR0aCgkaXRlbS5vdXRlcldpZHRoKCkpLmFwcGVuZFRvKCRwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gJGNsb25lLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICAkY2xvbmUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbS5kYXRhKCdoZWlnaHQnLCAkaXRlbS5vdXRlckhlaWdodCgpKTtcclxuICAgICAgICAgICAgICAgICRpdGVtLmFkZENsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbS5hbmltYXRlKHtoZWlnaHQ6IGhlaWdodH0sIDQwMCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICR0b2dnbGVyLnRleHQoJHRvZ2dsZXIuZGF0YSgncm9sbHVwJykpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLXJldmlld3NfX3RvZ2dsZXIsIC5qcy1yZXZpZXdzX19vdXRlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcm9sbCgkKHRoaXMpLnBhcmVudHMoJy5qcy1yZXZpZXdzJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmV2aWV3cycpLnJlbW92ZUNsYXNzKCdfb3BlbmVkJykuY3NzKCdoZWlnaHQnLCAnJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZXZpZXdzX190b2dnbGVyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRleHQoJCh0aGlzKS5kYXRhKCdyb2xsZG93bicpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoZWNrT3V0ZXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjaGVja091dGVyKCk7XHJcbiAgICAgICAgJCgnLmpzLXJldmlld3MnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRsaW5rcyA9ICQodGhpcykuZmluZCgnLmpzLXJldmlld3NfX3NsaWRlJyk7XHJcbiAgICAgICAgICAgICRsaW5rcy5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJGxpbmtzLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSwgJGxpbmtzLmluZGV4KHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQpNGD0L3QutGG0LjRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvtC60L7QvdGH0LDQvdC40LUg0LTQu9GPINC80L3QvtC20LXRgdGC0LLQtdC90L3QvtCz0L4g0YfQuNGB0LvQsCDRgdC70L7QstCwINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGH0LjRgdC70LAg0Lgg0LzQsNGB0YHQuNCy0LAg0L7QutC+0L3Rh9Cw0L3QuNC5XHJcbiAgICAgKiBwYXJhbSAgaU51bWJlciBJbnRlZ2VyINCn0LjRgdC70L4g0L3QsCDQvtGB0L3QvtCy0LUg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INGB0YTQvtGA0LzQuNGA0L7QstCw0YLRjCDQvtC60L7QvdGH0LDQvdC40LVcclxuICAgICAqIHBhcmFtICBhRW5kaW5ncyBBcnJheSDQnNCw0YHRgdC40LIg0YHQu9C+0LIg0LjQu9C4INC+0LrQvtC90YfQsNC90LjQuSDQtNC70Y8g0YfQuNGB0LXQuyAoMSwgNCwgNSksXHJcbiAgICAgKiAgICAgICAgINC90LDQv9GA0LjQvNC10YAgWyfRj9Cx0LvQvtC60L4nLCAn0Y/QsdC70L7QutCwJywgJ9GP0LHQu9C+0LonXVxyXG4gICAgICogcmV0dXJuIFN0cmluZ1xyXG4gICAgICogXHJcbiAgICAgKiBodHRwczovL2hhYnJhaGFici5ydS9wb3N0LzEwNTQyOC9cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0TnVtRW5kaW5nKGlOdW1iZXIsIGFFbmRpbmdzKSB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEh5cG90aGVjKCkge1xyXG4gICAgICAgIHZhciBzdHlsZSA9IFtdO1xyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlYycpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGNvc3QgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY29zdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3QgPSAkY29zdC52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGF5bWVudC1wZXJjZW50JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW0gPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGF5bWVudC1zdW0nKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bVBpY2tlciA9ICQodGhpcykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJGFnZSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19hZ2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY3JlZGl0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2NyZWRpdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2xpZGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2l0ZW0nKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2Nyb2xsID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3Njcm9sbCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICR0b3RhbCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zaG93LXRhcmdldCcpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZSA9IFtdO1xyXG4gICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlLnB1c2gocGFyc2VGbG9hdCgkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcmF0ZScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlKTtcclxuICAgICAgICAgICAgdmFyIHJhdGVNRSA9IFtdO1xyXG4gICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlTUUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlTUUnKS50ZXh0KCkucmVwbGFjZShcIixcIiwgXCIuXCIpKSB8fCAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2cocmF0ZU1FKTtcclxuICAgICAgICAgICAgdmFyIGNyZWRpdCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBhZ2UgPSAkYWdlLnZhbCgpO1xyXG4gICAgICAgICAgICB2YXIgcGVyY2VudDtcclxuICAgICAgICAgICAgJGNvc3QuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICAgICAgb25jb21wbGV0ZTogcmVjYWxjUGF5bWVudHNcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRjb3N0Lm9uKFwiY2hhbmdlXCIsIHJlY2FsY1BheW1lbnRzKTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVjYWxjUGF5bWVudHMoKSB7XHJcbiAgICAgICAgICAgICAgICBjb3N0ID0gJCh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnByb3AoJ21heCcsIGNvc3QpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IGNvc3RcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyLm5vVWlTbGlkZXIuc2V0KGNvc3QgLyAyKTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAkKHRoaXMpLnZhbCgpICogMTAwIC8gY29zdDtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50ID4gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudCA9IDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbChjb3N0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyZWRpdCA9IGNhbGNDcmVkaXQoY29zdCwgcGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQudmFsKHBlcmNlbnQpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgJGNyZWRpdC52YWwoY3JlZGl0KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZmlyc3QnKS50ZXh0KGZvcm1hdFByaWNlKCRwYXltZW50U3VtLnZhbCgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aCcpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGhNRScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19lY29ub215JykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpICogMTIgKiBhZ2UgLSBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkgKiAxMiAqIGFnZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcGlja2VyJykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0ubm9VaVNsaWRlci5zZXQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjcm9sbC5maW5kKCcuaHlwb3RoZWMtbGlzdF9faXRlbScpLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLmh5cG90aGVjLWxpc3RfX2l0ZW1fX2lubmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaSlcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZmlsdGVycywg0LrQsNC20LTRi9C5INGB0LXQu9C10LrRgiDRhNC40LvRjNGC0YDRg9C10YIg0L7RgtC00LXQu9GM0L3QvlxyXG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fZmlsdGVyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZk5hbWUgPSAkKHRoaXMpLmRhdGEoJ2h5cG90aGVjLWZpbHRlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAnZmlsdGVyLScgKyBmTmFtZTtcclxuICAgICAgICAgICAgICAgIHN0eWxlLnB1c2goJy4nICsgY2xhc3NOYW1lICsgJ3tkaXNwbGF5Om5vbmUgIWltcG9ydGFudH0nKTtcclxuICAgICAgICAgICAgICAgIC8vINC/0YHQtdCy0LTQvtGB0LXQu9C10LrRgtGLXHJcbiAgICAgICAgICAgICAgICB2YXIgJGNoZWNrYm94ZXMgPSAkKHRoaXMpLmZpbmQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJyk7XHJcbiAgICAgICAgICAgICAgICAkY2hlY2tib3hlcy5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2hlY2tlZCA9ICRjaGVja2JveGVzLmZpbHRlcignOmNoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoZWNrZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hlY2tlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYucHVzaCgnOm5vdChbZGF0YS1maWx0ZXItJyArICQodGhpcykudmFsKCkgKyAnXSknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJy5qcy1oeXBvdGhlY19faXRlbScgKyBmLmpvaW4oJycpKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZXRUb3RhbCgkdG90YWwsICRpdGVtcyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vINC40L3Qv9GD0YLRi1xyXG4gICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKSwgY2xhc3NOYW1lID0gJ2ZpbHRlci1maXJzdCc7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItZmlyc3RdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KCQodGhpcykuZGF0YSgnZmlsdGVyLWZpcnN0JykpID4gdmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAkY3JlZGl0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSksIGNsYXNzTmFtZSA9ICdmaWx0ZXItbWluJztcclxuICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1taW5dJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KCQodGhpcykuZGF0YSgnZmlsdGVyLW1pbicpKSA+IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2V0VG90YWwoJHRvdGFsLCAkaXRlbXMpO1xyXG4gICAgICAgICAgICB9KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgc3R5bGUucHVzaCgnLmZpbHRlci1taW55ZWFye2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50fScpO1xyXG4gICAgICAgICAgICBzdHlsZS5wdXNoKCcuZmlsdGVyLW1heHllYXJ7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICRhZ2Uub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBwYXJzZUludCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1taW55ZWFyXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1taW55ZWFyJykpID4gdmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2ZpbHRlci1taW55ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZmlsdGVyLW1pbnllYXInKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1tYXh5ZWFyXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1tYXh5ZWFyJykpIDwgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2ZpbHRlci1tYXh5ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnZmlsdGVyLW1heHllYXInKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldFRvdGFsKCR0b3RhbCwgJGl0ZW1zKTtcclxuICAgICAgICAgICAgfSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHN0eWxlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgdW5pcXVlU3R5bGUgPSBbXTtcclxuICAgICAgICAgICAgJC5lYWNoKHN0eWxlLCBmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkLmluQXJyYXkoZWwsIHVuaXF1ZVN0eWxlKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVTdHlsZS5wdXNoKGVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJzxzdHlsZT4nICsgdW5pcXVlU3R5bGUuam9pbignJykgKyAnPC9zdHlsZT4nKS5hcHBlbmRUbygnaGVhZCcpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGF5bWVudChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgLSBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlLCBhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjcmVkaXQgKiAoKHJhdGUgLyAxMjAwLjApIC8gKDEuMCAtIE1hdGgucG93KDEuMCArIHJhdGUgLyAxMjAwLjAsIC0oYWdlICogMTIpKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UHJpY2UocHJpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByaWNlLnRvU3RyaW5nKCkucmVwbGFjZSgvLi9nLCBmdW5jdGlvbiAoYywgaSwgYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgJiYgYyAhPT0gXCIuXCIgJiYgISgoYS5sZW5ndGggLSBpKSAlIDMpID8gJyAnICsgYyA6IGM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRUb3RhbCgkdGFyZ2V0LCAkaXRlbXMpIHtcclxuICAgICAgICAgICAgdmFyIHRvdGFsID0gJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJ1tjbGFzcyo9XCJmaWx0ZXJcIl0nKS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBhID0gZ2V0TnVtRW5kaW5nKHRvdGFsLCBbJ9Cd0LDQudC00LXQvdCwJywgJ9Cd0LDQudC00LXQvdC+JywgJ9Cd0LDQudC00LXQvdC+J10pO1xyXG4gICAgICAgICAgICB2YXIgYiA9IGdldE51bUVuZGluZyh0b3RhbCwgWyfQuNC/0L7RgtC10YfQvdCw0Y8g0L/RgNC+0LPRgNCw0LzQvNCwJywgJ9C40L/QvtGC0LXRh9C90YvQtSDQv9GA0L7Qs9GA0LDQvNC80YsnLCAn0LjQv9C+0YLQtdGH0L3Ri9GFINC/0YDQvtCz0YDQsNC80LwnXSk7XHJcbiAgICAgICAgICAgICR0YXJnZXQudGV4dChbYSwgdG90YWwsIGJdLmpvaW4oJyAnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zaG93LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0ID0gJCh0aGlzKS5wYXJlbnRzKCcuanMtaHlwb3RoZWMnKS5maW5kKCcuanMtaHlwb3RoZWNfX3Nob3ctdGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgIGlmICgkdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RGF0ZXBpY2tlcigpIHtcclxuICAgICAgICB2YXIgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY29tbW9uT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICd0b3AgbGVmdCcsXHJcbiAgICAgICAgICAgIG9uU2hvdzogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25IaWRlOiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRlLCBkYXRlLCBpbnN0KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0LiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgdGltZXBpY2tlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0ZVRpbWVTZXBhcmF0b3I6ICcsICcsXHJcbiAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICQoJy5qcy1kYXRlcGlja2VyLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWluJykpIHx8IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gbmV3IERhdGUoJCh0aGlzKS5kYXRhKCdtYXgnKSkgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyKE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbWluLFxyXG4gICAgICAgICAgICAgICAgbWF4RGF0ZTogbWF4LFxyXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnIC0gJyxcclxuICAgICAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQodGhpcykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICBkYXRlcGlja2VyLnNlbGVjdERhdGUoW21pbiwgbWF4XSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyLCAuanMtZGF0ZXBpY2tlci1yYW5nZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXJWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5kYXRhKCdkYXRlcGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlcGlja2VyLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/RgNC+0LrRgNGD0YLQutCwINC/0L4g0YHRgdGL0LvQutC1INC00L4g0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGwnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCgkKHRoaXMpLmF0dHIoJ2hyZWYnKSk7XHJcbiAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogb2Zmc2V0fSwgMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5pdEFib3V0KCkge1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcclxuICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc3MHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9zaWJsaW5nJykucmVtb3ZlQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5uZXh0KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5wcmV2KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX2NvbnRlbnQtc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJyxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmlsZWlucHV0KCkge1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXRfX2NudCcpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2RlZmF1bHQnLCAkKHRoaXMpLnRleHQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWZpbGVpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVOYW1lID0gJCh0aGlzKS52YWwoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuanMtZmlsZWlucHV0X19jbnQnKS50ZXh0KGZpbGVOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbnRpc3BhbSgpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImVtYWlsM1wiXSxpbnB1dFtuYW1lPVwiaW5mb1wiXSxpbnB1dFtuYW1lPVwidGV4dFwiXScpLmF0dHIoJ3ZhbHVlJywgJycpLnZhbCgnJyk7XHJcbiAgICAgICAgfSwgNTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFscGhhYmV0KCkge1xyXG4gICAgICAgICQoJy5qcy1hbHBoYWJldCBpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCgnLmpzLWFscGhhYmV0IGxpJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbVNlYXJjaDIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBtU2VhcmNoMi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
