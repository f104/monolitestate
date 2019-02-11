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
        this.initLogo();
        this.initPseudoSelect();
        this.initPseudoSelectSearch();
        this.initTabs();
        this.initRange();
        this.initChess();
        this.initChessFilter();
        this.initFRPromo();
        this.initialized = true;
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
        initMask();
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
        $('.js-slider-main').each(function(){
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
            touch: false,
        };
        $('.js-popup').on('click', function () {
            $.fancybox.close();
            if ($(this).attr('href')) {
                var $target = $('#' + $(this).attr('href').substr(1));
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
            $scroll.find('.hypothec__list__item').each(function (i) {
                $(this).find('.hypothec__list__item__inner').on('click', function (e) {
                    e.preventDefault();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRMb2dvKCk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5pbml0UHNldWRvU2VsZWN0U2VhcmNoKCk7XHJcbiAgICAgICAgdGhpcy5pbml0VGFicygpO1xyXG4gICAgICAgIHRoaXMuaW5pdFJhbmdlKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3MoKTtcclxuICAgICAgICB0aGlzLmluaXRDaGVzc0ZpbHRlcigpO1xyXG4gICAgICAgIHRoaXMuaW5pdEZSUHJvbW8oKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdExvZ286IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdGltZW91dCA9IGFwcENvbmZpZy5sb2dvVXBkYXRlVGltZW91dCB8fCAzMDAwLFxyXG4gICAgICAgICAgICAgICAgJGxvZ28gPSAkKCcuanMtbG9nbycpLCBuZXdTcmMgPSAkbG9nby5kYXRhKCduZXdzcmMnKSxcclxuICAgICAgICAgICAgICAgICRuZXdMb2dvID0gJCgnPGltZz4nKTtcclxuICAgICAgICAkbmV3TG9nby5hdHRyKCdzcmMnLCBuZXdTcmMpO1xyXG4gICAgICAgICRuZXdMb2dvLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRsb2dvLnBhcmVudCgpLmNzcygnd2lkdGgnLCAkbG9nby5vdXRlcldpZHRoKCkpO1xyXG4gICAgICAgICAgICAgICAgJGxvZ28uZmFkZU91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvZ28uYXR0cignc3JjJywgJG5ld0xvZ28uYXR0cignc3JjJykpO1xyXG4gICAgICAgICAgICAgICAgICAgICRsb2dvLmZhZGVJbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2dvLnBhcmVudCgpLmNzcygnd2lkdGgnLCAnYXV0bycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0U2VhcmNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdCBzZWFyY2hcclxuICAgICAgICAkKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0JylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpICE9IC0xID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgZm9yIG1GaWx0ZXIyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFRhYnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciB0YWJzU2VsZWN0b3IgPSB0eXBlb2YgJChlbGVtKS5kYXRhKCd0YWJzJykgPT09ICd1bmRlZmluZWQnID8gJy5qcy10YWJzX19saXN0ID4gbGknIDogJChlbGVtKS5kYXRhKCd0YWJzJyk7XHJcbiAgICAgICAgICAgIHZhciAkc2VsZWN0ID0gJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0JyksIHdpdGhTZWxlY3QgPSAkc2VsZWN0Lmxlbmd0aDtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICAvLyDQtNC70Y8g0LLQu9C+0LbQtdC90L3Ri9GFINGC0LDQsdC+0LIg0LjRgdC/0L7Qu9GM0LfRg9C10LwgZGF0YVxyXG4gICAgICAgICAgICAgICAgdGFiczogdGFic1NlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxDb250ZXh0OiAkKGVsZW0pLmhhc0NsYXNzKCdqcy10YWJzX2Rpc2Nvbm5lY3RlZCcpID8gJCgnLmpzLXRhYnNfX2NvbnRlbnQnKSA6ICQoZWxlbSksXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVIYXNoOiBmYWxzZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICh3aXRoU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQodGFic1NlbGVjdG9yKS5maW5kKCdhJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKS5hdHRyKCdocmVmJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdzZWxlY3QnKSB8fCAkKHRoaXMpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB2YWx1ZSArICdcIj4nICsgdGV4dCArICc8L29wdGlvbj4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHNlbGVjdC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZWFzeXRhYnMoJ3NlbGVjdCcsICQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChlbGVtKS5maW5kKHRhYnNTZWxlY3RvcikuZmluZCgnYTpub3QoLmRpc2FibGVkKScpLmZpcnN0KCkuY2xpY2soKTtcclxuICAgICAgICAgICAgJChlbGVtKS5iaW5kKCdlYXN5dGFiczphZnRlcicsIGZ1bmN0aW9uIChldmVudCwgJGNsaWNrZWQsICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh3aXRoU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNlbGVjdC52YWwoJGNsaWNrZWQuYXR0cignaHJlZicpKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3NldFBvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFJhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgkKGVsZW0pLmhhc0NsYXNzKCdqcy1jaGVzcy1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ2VuZCcsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbbmFtZT1cInByaWNlX21heFwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbi8vICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB0bzogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IGlucHV0LmlucHV0bWFzaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmJiBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLW1hc2tfX2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBhcHAuZ2V0TnVtRW5kaW5nKHBhcnNlSW50KHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKSwgWyfCoNCz0L7QtCcsICfCoNCz0L7QtNCwJywgJ8Kg0LvQtdGCJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXNrLm9wdGlvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0Q2hlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtY2hlc3MtdG9vbHRpcF9fY29udGVudCcpLnBhcmVudCgpLmhvdmVyKGFwcC5zaG93Q2hlc3NUb29sdGlwLCBhcHAuaGlkZUNoZXNzVG9vbHRpcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciAkdGFyZ2V0ID0ge1xyXG4gICAgICAgICAgICB0aXRsZTogJCgnLmpzLWNoZXNzLWluZm9fX3RpdGxlJyksXHJcbiAgICAgICAgICAgIGFyZWE6ICQoJy5qcy1jaGVzcy1pbmZvX19hcmVhJyksXHJcbiAgICAgICAgICAgIHByaWNlOiAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2UnKSxcclxuICAgICAgICAgICAgcHJpY2VQZXJTcXVhcmU6ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZVBlclNxdWFyZScpLFxyXG4gICAgICAgICAgICBmbG9vcjogJCgnLmpzLWNoZXNzLWluZm9fX2Zsb29yJyksXHJcbiAgICAgICAgICAgIGZsb29yc1RvdGFsOiAkKCcuanMtY2hlc3MtaW5mb19fZmxvb3JzVG90YWwnKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjID0gJCgnLmpzLWNoZXNzLWluZm9fX2h5cG90aGVjJyksXHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyID0gJCgnLmpzLWNoZXNzLWluZm9fX2h5cG90aGVjLXdyYXBwZXInKSxcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0ID0gJCgnLmpzLWNoZXNzLWluZm9fX2ltZ0ZsYXQnKSxcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbG9vcicpLFxyXG4gICAgICAgICAgICAgICAgJHRhYnMgPSAkKCcuanMtY2hlc3MtaW5mb19fdGFicycpLFxyXG4gICAgICAgICAgICAgICAgJHRhYkZsb29yID0gJCgnLmpzLWNoZXNzLWluZm9fX3RhYkZsb29yJyksXHJcbiAgICAgICAgICAgICAgICAkdGFiRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbGF0JyksXHJcbiAgICAgICAgICAgICAgICAkZm9ybSA9ICQoJy5qcy1jaGVzcy1pbmZvX19mb3JtJyksXHJcbiAgICAgICAgICAgICAgICBpbml0ID0gZmFsc2U7XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0uX2FjdGl2ZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdfc2VsZWN0ZWQnKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0nKS5yZW1vdmVDbGFzcygnX3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdfc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkdGhpcy5kYXRhKCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0W2tleV0udGV4dChkYXRhW2tleV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRmb3JtLnZhbChkYXRhLmZvcm0pO1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5oeXBvdGhlYykge1xyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjLnRleHQoZGF0YS5oeXBvdGhlYyk7XHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKCcuanMtaHlwb3RoZWNfX2Nvc3QnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtaHlwb3RoZWNfX2Nvc3QnKS52YWwoZGF0YS5maWx0ZXJQcmljZSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtc3VtJykudmFsKGRhdGEuZmlsdGVyUHJpY2UgLyAyKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5pbWdGbGF0KSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5hdHRyKCdocmVmJywgZGF0YS5pbWdGbGF0KTtcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0LmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxhdC5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuaW1nRmxvb3IpIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5hdHRyKCdocmVmJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuZmluZCgnaW1nJykuYXR0cignc3JjJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsb29yLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkdGFicy5maW5kKCdsaTp2aXNpYmxlJykubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgICR0YWJzLmZpbmQoJ2xpOnZpc2libGUnKS5maXJzdCgpLmZpbmQoJ2EnKS5jbGljaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6ICR0YXJnZXQudGl0bGUub2Zmc2V0KCkudG9wIC0gMTAwXHJcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0uX2FjdGl2ZScpLmZpcnN0KCkuY2xpY2soKTtcclxuICAgICAgICBpbml0ID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgJGNoZXNzVG9vbHRpcDogbnVsbCxcclxuICAgICRjaGVzc1Rvb2x0aXBUaW1lb3V0OiBudWxsLFxyXG5cclxuICAgIHNob3dDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgIGFwcC4kY2hlc3NUb29sdGlwVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHNlbGYub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGFwcC4kY2hlc3NUb29sdGlwID0gJHNlbGYuZmluZCgnLmpzLWNoZXNzLXRvb2x0aXBfX2NvbnRlbnQnKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wICsgMjgsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCArIDEwLFxyXG4gICAgICAgICAgICB9KS5hcHBlbmRUbygkKCdib2R5JykpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSwgMzAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGlkZUNoZXNzVG9vbHRpcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQpO1xyXG4gICAgICAgIGFwcC4kY2hlc3NUb29sdGlwLnJlbW92ZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0Q2hlc3NGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBjaGVzcyBsaW5rIGluIGZpbHRlciByZXN1bHRcclxuICAgICAgICBmdW5jdGlvbiBpbml0TGluaygpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAobVNlYXJjaDIpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtY2hlc3NfX2xpbmsnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJC5wYXJhbShtU2VhcmNoMi5nZXRGaWx0ZXJzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbiA9ICQodGhpcykuYXR0cignaHJlZicpICsgJz8nICsgcXVlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oJCh0aGlzKS5hdHRyKCdocmVmJykgKyAnPycgKyBxdWVyeSwgJ19ibGFuaycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluaXRMaW5rKCk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXRMaW5rKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciAkZm9ybSA9ICQoJy5qcy1jaGVzcy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICRpdGVtcyA9ICQoJy5qcy1jaGVzcy1maWx0ZXJfX2l0ZW0nKSxcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4gPSBudWxsLCBhcmVhTWF4ID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHByaWNlTWluID0gbnVsbCwgcHJpY2VNYXggPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVyUHJpY2UgPSAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLnBhcmVudHMoJy5qcy1yYW5nZScpLmZpbmQoJy5qcy1yYW5nZV9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICBzbGlkZXJBcmVhID0gJGZvcm0uZmluZCgnW25hbWU9XCJhcmVhX21pblwiXScpLnBhcmVudHMoJy5qcy1yYW5nZScpLmZpbmQoJy5qcy1yYW5nZV9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCcuX3NvbGQnKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCRmb3JtLmxlbmd0aCA9PT0gMCB8fCAkaXRlbXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItYXJlYV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZWEgPSBwYXJzZUZsb2F0KCQodGhpcykuZGF0YSgnZmlsdGVyLWFyZWEnKSk7XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1pbiB8fCBhcmVhIDwgYXJlYU1pbikge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IE1hdGguZmxvb3IoYXJlYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFhcmVhTWF4IHx8IGFyZWEgPiBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4ID0gTWF0aC5jZWlsKGFyZWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLXByaWNlXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcHJpY2UgPSBwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1wcmljZScpKTtcclxuICAgICAgICAgICAgaWYgKCFwcmljZU1pbiB8fCBwcmljZSA8IHByaWNlTWluKSB7XHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbiA9IHByaWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNYXggfHwgcHJpY2UgPiBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNYXggPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9taW5cIl0nKS5hdHRyKCd2YWx1ZScsIGFyZWFNaW4pLmF0dHIoJ21pbicsIGFyZWFNaW4pLmF0dHIoJ21heCcsIGFyZWFNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIGFyZWFNYXgpLmF0dHIoJ21pbicsIGFyZWFNaW4pLmF0dHIoJ21heCcsIGFyZWFNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicHJpY2VfbWluXCJdJykuYXR0cigndmFsdWUnLCBwcmljZU1pbikuYXR0cignbWluJywgcHJpY2VNaW4pLmF0dHIoJ21heCcsIHByaWNlTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21heFwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNYXgpLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLXJvb21zPVwiJyArICQodGhpcykudmFsKCkgKyAnXCJdJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2xpZGVyUHJpY2Uubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgIHByaWNlTWluLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VNYXhcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICdtaW4nOiBwcmljZU1pbixcclxuICAgICAgICAgICAgICAgICdtYXgnOiBwcmljZU1heFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSAvLyBCb29sZWFuICdmaXJlU2V0RXZlbnQnXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgIHNsaWRlckFyZWEubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4sXHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAnbWluJzogYXJlYU1pbixcclxuICAgICAgICAgICAgICAgICdtYXgnOiBhcmVhTWF4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlIC8vIEJvb2xlYW4gJ2ZpcmVTZXRFdmVudCdcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICRmb3JtLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhOiBbYXJlYU1pbiwgYXJlYU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlOiBbcHJpY2VNaW4sIHByaWNlTWF4XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgICQuZWFjaChmb3JtRGF0YSwgZnVuY3Rpb24gKG4sIHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWluJyAmJiB2LnZhbHVlICE9IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWF4JyAmJiB2LnZhbHVlICE9IGFyZWFNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21pbicgJiYgdi52YWx1ZSAhPSBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21heCcgJiYgdi52YWx1ZSAhPSBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3Jvb21zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucm9vbXMucHVzaCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmFyZWFbMF0gPT0gYXJlYU1pbiAmJiBmaWx0ZXJzLmFyZWFbMV0gPT0gYXJlYU1heClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLmFyZWE7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnByaWNlWzBdID09IHByaWNlTWluICYmIGZpbHRlcnMucHJpY2VbMV0gPT0gcHJpY2VNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5wcmljZTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMucm9vbXMubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5yb29tcztcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhmaWx0ZXJzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5hZGRDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gdHJ1ZSwgJF9pdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goZmlsdGVycywgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhcmVhJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmVhIDwgdlswXSB8fCBhcmVhID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkgIT09ICd1bmRlZmluZWQnICYmICRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByaWNlID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJpY2UgPCB2WzBdIHx8IHByaWNlID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncm9vbXMnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcm9vbXMnKSkgPT09ICd1bmRlZmluZWQnIHx8IHYuaW5kZXhPZigkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykudG9TdHJpbmcoKSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q2hlc3NUb3RhbCgkaXRlbXMubGVuZ3RoIC0gJGl0ZW1zLmZpbHRlcignLl9maWx0ZXJlZCcpLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwodG90YWwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBoYW5kbGUgZ2V0IGZpbHRlcnNcclxuICAgICAgICB2YXIgZmlsdGVycyA9IHt9LCBoYXNoLCBoYXNoZXM7XHJcbiAgICAgICAgaGFzaGVzID0gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpKTtcclxuICAgICAgICBpZiAoaGFzaGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBoYXNoZXMgPSBoYXNoZXMuc3BsaXQoJyYnKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBoYXNoZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChoYXNoZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYXNoWzFdICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNbaGFzaFswXV0gPSBoYXNoWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIChmaWx0ZXJzLmtvbW5hdG55ZSkgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vbXMgPSBmaWx0ZXJzWydrb21uYXRueWUnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQuZWFjaChyb29tcywgZnVuY3Rpb24gKGksIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmZpbHRlcignW3ZhbHVlPVwiJyArIHYgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmZpbHRlcignW3ZhbHVlPVwiJyArIGZpbHRlcnMua29tbmF0bnllICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8YXJlYSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxhcmVhJ10uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJBcmVhLm5vVWlTbGlkZXIuc2V0KGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxwcmljZSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8cHJpY2UnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlclByaWNlLm5vVWlTbGlkZXIuc2V0KHByaWNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoZXNzVG90YWw6IGZ1bmN0aW9uICh0b3RhbCkge1xyXG4gICAgICAgIHZhciBlbmRpbmdzID0gWyfQutCy0LDRgNGC0LjRgNCwJywgJ9C60LLQsNGA0YLQuNGA0YsnLCAn0LrQstCw0YDRgtC40YAnXTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtZmlsdGVyX190b3RhbCcpLnRleHQodG90YWwgKyAnICcgKyBhcHAuZ2V0TnVtRW5kaW5nKHRvdGFsLCBlbmRpbmdzKSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIGZpeGVkIHJpZ2h0IHByb21vXHJcbiAgICAgKi9cclxuICAgIGluaXRGUlByb21vOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRjbnQgPSAkKCcuanMtZnInKTtcclxuICAgICAgICBpZiAoISRjbnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWZyX190b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkY250LnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGdldE51bUVuZGluZzogZnVuY3Rpb24gKGlOdW1iZXIsIGFFbmRpbmdzKSB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4vLyAgICAgICAgaW5pdFBhc3N3b3JkKCk7XHJcbiAgICAgICAgaW5pdEVhc3lQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5KCk7XHJcbiAgICAgICAgaW5pdEh5cG90aGVjKCk7XHJcbiAgICAgICAgaW5pdERhdGVwaWNrZXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgaW5pdFNjcm9sbCgpO1xyXG4gICAgICAgIGluaXRBYm91dCgpO1xyXG4gICAgICAgIGluaXRGaWxlaW5wdXQoKTtcclxuICAgICAgICBpbml0QWxwaGFiZXQoKTtcclxuICAgICAgICBpbml0QW50aXNwYW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICAkKCcuanMtc2xpZGVyLW1haW4nKS5lYWNoKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciAkYmFyID0gJCh0aGlzKS5maW5kKCcuanMtc2xpZGVyLW1haW5fX2JhcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGljayA9ICQodGhpcykuZmluZCgnLmpzLXNsaWRlci1tYWluX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50VGltZTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkc2xpY2subGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHRvdGFsID0gJHNsaWNrLmZpbmQoJy5zbGlkZScpLmxlbmd0aFxyXG5cclxuICAgICAgICAgICAgJHNsaWNrLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IHRvdGFsID4gMSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuICAgIC8vICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRvdGFsID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAkYmFyLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlIDwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzbGljay5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5yZW1vdmVDbGFzcygnX2ZhZGUgX2xlZnQgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHNsaWNrLm9uKHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpc1BhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gc3RhcnRQcm9ncmVzc2JhcigpIHtcclxuLy8gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmVzZXRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgPSAwO1xyXG4gICAgLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aWNrID0gc2V0SW50ZXJ2YWwoaW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNQYXVzZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50VGltZSArPSAxIC8gKHRpbWUgKyAwLjEpO1xyXG4gICAgICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUaW1lICsgXCIlXCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzbGljay5zbGljaygnc2xpY2tOZXh0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDAgKyAnJSdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNtYWxsU2xpZGVycygpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGw6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbC5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMjUlJyxcclxuLy8gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzgwcHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWFnZW50cy1zbGlkZXIgLmFnZW50cy1zbGlkZXJfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtYWdlbnRzLXNsaWRlcicpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgJGFnZW50ID0gJCgnLmpzLWFnZW50cy1zbGlkZXIgLl9hY3RpdmUgLmpzLWFnZW50cy1zbGlkZXJfX3Nob3J0Jyk7XHJcbiAgICAgICAgICAgIHZhciAkZnVsbCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19pbWcnKS5hdHRyKCdzcmMnLCAkYWdlbnQuZGF0YSgnYWdlbnQtaW1nJykpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbmFtZScpLnRleHQoJGFnZW50LmRhdGEoJ2FnZW50LW5hbWUnKSk7XHJcbiAgICAgICAgICAgIHZhciBwaG9uZSA9ICRhZ2VudC5kYXRhKCdhZ2VudC1waG9uZScpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fcGhvbmUgYScpLnRleHQocGhvbmUpLmF0dHIoJ2hyZWYnLCAndGVsOicgKyBwaG9uZS5yZXBsYWNlKC9bLVxccygpXS9nLCAnJykpO1xyXG4gICAgICAgICAgICB2YXIgbWFpbCA9ICRhZ2VudC5kYXRhKCdhZ2VudC1tYWlsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX19tYWlsIGEnKS50ZXh0KG1haWwpLmF0dHIoJ2hyZWYnLCAnbWFpbHRvOicgKyBtYWlsKTtcclxuICAgICAgICAgICAgdmFyIHVybCA9ICRhZ2VudC5kYXRhKCdhZ2VudC11cmwnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3VybCBhJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyX191cmwnKS5hdHRyKCdocmVmJywgdXJsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1lbnUoKSB7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICAgICAgaWYgKGhyZWYpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBocmVmID0gJCh0aGlzKS5kYXRhKCdocmVmJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyW2RhdGEtaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJChocmVmKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLnNob3coKTtcclxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnbWVudS1vcGVuZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ21lbnUtb3BlbmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlciwgLmpzLW1lbnUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LXNlY29uZC10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXNlY29uZCcpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1hc2soKSB7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3RlbCcpLmlucHV0bWFzayh7XHJcbiAgICAgICAgICAgIG1hc2s6ICcrOSAoOTk5KSA5OTktOTktOTknXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgSW5wdXRtYXNrLmV4dGVuZEFsaWFzZXMoe1xyXG4gICAgICAgICAgICAnbnVtZXJpYyc6IHtcclxuICAgICAgICAgICAgICAgIGF1dG9Vbm1hc2s6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzaG93TWFza09uSG92ZXI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgcmFkaXhQb2ludDogXCIsXCIsXHJcbiAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvcjogXCIgXCIsXHJcbiAgICAgICAgICAgICAgICBkaWdpdHM6IDAsXHJcbiAgICAgICAgICAgICAgICBhbGxvd01pbnVzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGF1dG9Hcm91cDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0QWxpZ246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19udW1lcmljJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiKTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3knKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmUnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQvMKyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19zcXVhcmVfZmlsdGVyJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsicsXHJcbiAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeV9maWx0ZXInKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJyxcclxuICAgICAgICAgICAgdW5tYXNrQXNOdW1iZXI6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2FnZScpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC70LXRgidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fcGVyY2VudCcpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICclJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19jdXJyZW5jeSwgLmpzLW1hc2tfX3NxdWFyZSwgLmpzLW1hc2tfX3BlcmNlbnQnKS5vbignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gbmVlZCBmb3IgcmVtb3ZlIHN1ZmZpeFxyXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vUm9iaW5IZXJib3RzL0lucHV0bWFzay9pc3N1ZXMvMTU1MVxyXG4gICAgICAgICAgICB2YXIgdiA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgIGlmICh2ID09IDAgfHwgdiA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoJycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBvcHVwKCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBiYXNlQ2xhc3M6ICdfcG9wdXAnLFxyXG4gICAgICAgICAgICBhdXRvRm9jdXM6IGZhbHNlLFxyXG4gICAgICAgICAgICBidG5UcGw6IHtcclxuICAgICAgICAgICAgICAgIHNtYWxsQnRuOiAnPHNwYW4gZGF0YS1mYW5jeWJveC1jbG9zZSBjbGFzcz1cImZhbmN5Ym94LWNsb3NlLXNtYWxsXCI+PHNwYW4gY2xhc3M9XCJsaW5rXCI+0JfQsNC60YDRi9GC0Yw8L3NwYW4+PC9zcGFuPicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRvdWNoOiBmYWxzZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1wb3B1cCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJC5mYW5jeWJveC5jbG9zZSgpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKCdocmVmJykpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCgnIycgKyAkKHRoaXMpLmF0dHIoJ2hyZWYnKS5zdWJzdHIoMSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLmRhdGEoKTtcclxuICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCAmJiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkaW5wdXQgPSAkdGFyZ2V0LmZpbmQoJ1tuYW1lPVwiJyArIGsgKyAnXCJdJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkaW5wdXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW5wdXQudmFsKGRhdGFba10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgICAgICQoXCIuanMtYWdlbnQtc2VhcmNoXCIpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2FnZW50cycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIGxhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFRvb1Nob3J0OiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcItCf0L7QttCw0LvRg9C50YHRgtCwLCDQstCy0LXQtNC40YLQtSBcIiArIChhLm1pbmltdW0gLSBhLmlucHV0Lmxlbmd0aCkgKyBcIiDQuNC70Lgg0LHQvtC70YzRiNC1INGB0LjQvNCy0L7Qu9C+0LJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWpheDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLm15anNvbi5jb20vYmlucy9va3l2aVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTogcGFyYW1zLnRlcm0sIC8vIHNlYXJjaCB0ZXJtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FnZW50X3NlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAkLm1hcChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHZhbHVlLnBhZ2V0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50OiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRTZWxlY3Rpb24sXHJcbiAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24gKG1hcmt1cCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcclxuICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcclxuICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAzLFxyXG4gICAgICAgICAgICBtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAn0L/QvtC40YHQuuKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2VsZWN0Mi1yZXN1bHQtYWdlbnRcIj48c3Ryb25nPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWdlbnQucGFnZXRpdGxlICsgJzwvc3Ryb25nPjxicj4nICsgaXRlbS5hZ2VudC52YWx1ZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRTZWxlY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5hZ2VudC5wYWdldGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1hZ2VudC1zZWFyY2gnKS5vbignc2VsZWN0MjpzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUucGFyYW1zLmRhdGE7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRhdGEuYWdlbnQudXJpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWYWxpZGF0ZSgpIHtcclxuICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoXCJwaG9uZVwiLCBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uYWwoZWxlbWVudCkgfHwgL15cXCtcXGRcXHNcXChcXGR7M31cXClcXHNcXGR7M30tXFxkezJ9LVxcZHsyfSQvLnRlc3QodmFsdWUpO1xyXG4gICAgICAgIH0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBtb2JpbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7fSxcclxuICAgICAgICAgICAgcnVsZXM6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcInBob25lXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXZhbGlkYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudmFsaWRhdGUob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eUZpbHRlcnMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXR5cGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10aXRsZScpLnRleHQoJCh0aGlzKS5kYXRhKCdmaWx0ZXJzLXRpdGxlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXNzd29yZCgpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXBhc3N3b3JkJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi4vanMvbGlicy96eGN2Ym4uanNcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChzY3JpcHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24gKGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgenhjdmJuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoenhjdmJuKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHp4Y3Zibih2YWwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpO1xyXG4gICAgICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMyBfNCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgcmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/Qu9C+0YXQvtC5OiA4INC30L3QsNC60L7Qsiwg0L7RgdGC0LDQu9GM0L3Ri9GFINC/0YDQvtCy0LXRgNC+0Log0L3QtdGCXHJcbiAgICAg0KHRgNC10LTQvdC40Lk6IDEwINC30L3QsNC60L7Qsiwg0LzQuNC9INC+0LTQvdCwINCx0YPQutCy0LAsINC80LjQvSDQvtC00L3QsCDQvtC00L3QsCDRhtC40YTRgNCwXHJcbiAgICAg0KXQvtGA0L7RiNC40Lk6IDEyINC30L3QsNC60L7Qsiwg0L/Qu9GO0YEg0L/RgNC+0LLQtdGA0LrQsCDQvdCwINGB0L/QtdGG0LfQvdCw0Log0Lgg0LfQsNCz0LvQsNCy0L3Rg9GOXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRFYXN5UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgdmFyIHNwZWNpYWxzID0gL1shQCMkJV4mfl0vO1xyXG4gICAgICAgICQoJy5qcy1wYXNzd29yZCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyksXHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAwO1xyXG4gICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zJyk7XHJcbiAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCA+PSBhcHBDb25maWcubWluUGFzc3dvcmRMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGggPj0gMTAgJiYgdmFsLnNlYXJjaCgvXFxkLykgIT09IC0xICYmIHZhbC5zZWFyY2goL1xcRC8pICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29yZSA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoID49IDEyICYmIHZhbC5zZWFyY2goL1tBLVpdLykgIT09IC0xICYmIHZhbC5zZWFyY2goc3BlY2lhbHMpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSAzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY250LmFkZENsYXNzKCdfJyArIHNjb3JlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3NTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtc2xpZGVyLXJldmlld3MnKTtcclxuICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMgX2JpZycsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5sZyxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGJpZyA9ICQoJy5yZXZpZXdzX19saXN0Ll9iaWcgLnJldmlld3NfX2xpc3RfX2l0ZW0nKTtcclxuICAgICAgICB2YXIgY3VycmVudCA9IDA7XHJcbiAgICAgICAgaWYgKCRiaWcubGVuZ3RoICYmICRzbGlkZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAkc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyQmlnKCkge1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVPdXQoKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRCaWcoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItcmV2aWV3cyAuc2xpY2stY3VycmVudCAucmV2aWV3c19fbGlzdF9faXRlbV9faW5uZXInKS5jbG9uZSgpLmFwcGVuZFRvKCRiaWcpO1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAkYmlnLnBhcmVudCgpLmNzcygnaGVpZ2h0JywgJGJpZy5vdXRlckhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHkoKSB7XHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyW2RhdGEtaW5pdD1cImZhbHNlXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRvZ2dsZXJzID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19pbWctd3JhcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICAgICAkdG9nZ2xlcnMuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvdW50ZXIudGV4dChpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnaW5pdCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2FsbGVyeSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FsbGVyeS1uYXYnKS5zbGljayh7XHJcbiAgICAgICAgICAgIGxhenlMb2FkOiAnb25kZW1hbmQnLFxyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNixcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnlfX3NsaWRlcicsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnknKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19zbGlkZXInKTtcclxuICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX2N1cnJlbnQnKTtcclxuICAgICAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBsYXp5TG9hZDogJ29uZGVtYW5kJyxcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzd2lwZVRvU2xpZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5LW5hdicsXHJcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93czogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2xpZGVyLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgJGN1cnJlbnQudGV4dCgrK2N1cnJlbnRTbGlkZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YXIgJGxpbmtzID0gJHNsaWRlci5maW5kKCcuc2xpZGU6bm90KC5zbGljay1jbG9uZWQpJyk7XHJcbiAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X190b3RhbCcpLnRleHQoJGxpbmtzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICRsaW5rcy5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJGxpbmtzLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9vcDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSwgJGxpbmtzLmluZGV4KHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldE51bUVuZGluZyhpTnVtYmVyLCBhRW5kaW5ncykge1xyXG4gICAgICAgIHZhciBzRW5kaW5nLCBpO1xyXG4gICAgICAgIGlOdW1iZXIgPSBpTnVtYmVyICUgMTAwO1xyXG4gICAgICAgIGlmIChpTnVtYmVyID49IDExICYmIGlOdW1iZXIgPD0gMTkpIHtcclxuICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGkgPSBpTnVtYmVyICUgMTA7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMSk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAoMik6XHJcbiAgICAgICAgICAgICAgICBjYXNlICgzKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDQpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1sxXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzRW5kaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRIeXBvdGhlYygpIHtcclxuICAgICAgICB2YXIgc3R5bGUgPSBbXTtcclxuICAgICAgICAkKCcuanMtaHlwb3RoZWMnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICRjb3N0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2Nvc3QnKSxcclxuICAgICAgICAgICAgICAgICAgICBjb3N0ID0gJGNvc3QudmFsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtcGVyY2VudCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3BheW1lbnQtc3VtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICRhZ2UgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fYWdlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGNyZWRpdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jcmVkaXQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcyA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19pdGVtJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjcm9sbCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zY3JvbGwnKSxcclxuICAgICAgICAgICAgICAgICAgICAkdG90YWwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2hvdy10YXJnZXQnKTtcclxuICAgICAgICAgICAgdmFyIHJhdGUgPSBbXTtcclxuICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmF0ZS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGUnKS50ZXh0KCkucmVwbGFjZShcIixcIiwgXCIuXCIpKSB8fCAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2cocmF0ZSk7XHJcbiAgICAgICAgICAgIHZhciByYXRlTUUgPSBbXTtcclxuICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmF0ZU1FLnB1c2gocGFyc2VGbG9hdCgkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcmF0ZU1FJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGVNRSk7XHJcbiAgICAgICAgICAgIHZhciBjcmVkaXQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgdmFyIHBlcmNlbnQ7XHJcbiAgICAgICAgICAgICRjb3N0LmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICAgICAgc3VmZml4OiAnwqDRgNGD0LEuJyxcclxuICAgICAgICAgICAgICAgIG9uY29tcGxldGU6IHJlY2FsY1BheW1lbnRzXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkY29zdC5vbihcImNoYW5nZVwiLCByZWNhbGNQYXltZW50cyk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY2FsY1BheW1lbnRzKCkge1xyXG4gICAgICAgICAgICAgICAgY29zdCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS5wcm9wKCdtYXgnLCBjb3N0KTtcclxuICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBjb3N0XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bVBpY2tlci5ub1VpU2xpZGVyLnNldChjb3N0IC8gMik7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICRwYXltZW50U3VtLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gJCh0aGlzKS52YWwoKSAqIDEwMCAvIGNvc3Q7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoY29zdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcmVkaXQgPSBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50LnZhbChwZXJjZW50KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICRjcmVkaXQudmFsKGNyZWRpdCkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpcnN0JykudGV4dChmb3JtYXRQcmljZSgkcGF5bWVudFN1bS52YWwoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0uaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICAgICAgb25jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXBpY2tlcicpLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLm5vVWlTbGlkZXIuc2V0KCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0udHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICRhZ2Uub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY3JvbGwuZmluZCgnLmh5cG90aGVjX19saXN0X19pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW1fX2lubmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGZpbHRlcnMsINC60LDQttC00YvQuSDRgdC10LvQtdC60YIg0YTQuNC70YzRgtGA0YPQtdGCINC+0YLQtNC10LvRjNC90L5cclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpbHRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZOYW1lID0gJCh0aGlzKS5kYXRhKCdoeXBvdGhlYy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2ZpbHRlci0nICsgZk5hbWU7XHJcbiAgICAgICAgICAgICAgICBzdHlsZS5wdXNoKCcuJyArIGNsYXNzTmFtZSArICd7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICAgICAvLyDQv9GB0LXQstC00L7RgdC10LvQtdC60YLRi1xyXG4gICAgICAgICAgICAgICAgdmFyICRjaGVja2JveGVzID0gJCh0aGlzKS5maW5kKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG4gICAgICAgICAgICAgICAgJGNoZWNrYm94ZXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJGNoZWNrZWQgPSAkY2hlY2tib3hlcy5maWx0ZXIoJzpjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGVja2VkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGYgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNoZWNrZWQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLnB1c2goJzpub3QoW2RhdGEtZmlsdGVyLScgKyAkKHRoaXMpLnZhbCgpICsgJ10pJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCcuanMtaHlwb3RoZWNfX2l0ZW0nICsgZi5qb2luKCcnKSkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VG90YWwoJHRvdGFsLCAkaXRlbXMpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyDQuNC90L/Rg9GC0YtcclxuICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSksIGNsYXNzTmFtZSA9ICdmaWx0ZXItZmlyc3QnO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLWZpcnN0XScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1maXJzdCcpKSA+IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGNyZWRpdC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHBhcnNlSW50KCQodGhpcykudmFsKCkpLCBjbGFzc05hbWUgPSAnZmlsdGVyLW1pbic7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWluXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1taW4nKSkgPiB2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNldFRvdGFsKCR0b3RhbCwgJGl0ZW1zKTtcclxuICAgICAgICAgICAgfSkudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLnB1c2goJy5maWx0ZXItbWlueWVhcntkaXNwbGF5Om5vbmUgIWltcG9ydGFudH0nKTtcclxuICAgICAgICAgICAgc3R5bGUucHVzaCgnLmZpbHRlci1tYXh5ZWFye2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50fScpO1xyXG4gICAgICAgICAgICAkYWdlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gcGFyc2VJbnQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWlueWVhcl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItbWlueWVhcicpKSA+IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdmaWx0ZXItbWlueWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZpbHRlci1taW55ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItbWF4eWVhcl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItbWF4eWVhcicpKSA8IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdmaWx0ZXItbWF4eWVhcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2ZpbHRlci1tYXh5ZWFyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZXRUb3RhbCgkdG90YWwsICRpdGVtcyk7XHJcbiAgICAgICAgICAgIH0pLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChzdHlsZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHVuaXF1ZVN0eWxlID0gW107XHJcbiAgICAgICAgICAgICQuZWFjaChzdHlsZSwgZnVuY3Rpb24gKGksIGVsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KGVsLCB1bmlxdWVTdHlsZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlU3R5bGUucHVzaChlbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCc8c3R5bGU+JyArIHVuaXF1ZVN0eWxlLmpvaW4oJycpICsgJzwvc3R5bGU+JykuYXBwZW5kVG8oJ2hlYWQnKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1BheW1lbnQoY29zdCwgcGVyY2VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY0NyZWRpdChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0IC0gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZSwgYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY3JlZGl0ICogKChyYXRlIC8gMTIwMC4wKSAvICgxLjAgLSBNYXRoLnBvdygxLjAgKyByYXRlIC8gMTIwMC4wLCAtKGFnZSAqIDEyKSkpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFByaWNlKHByaWNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmljZS50b1N0cmluZygpLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24gKGMsIGksIGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpICYmIGMgIT09IFwiLlwiICYmICEoKGEubGVuZ3RoIC0gaSkgJSAzKSA/ICcgJyArIGMgOiBjO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VG90YWwoJHRhcmdldCwgJGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCdbY2xhc3MqPVwiZmlsdGVyXCJdJykubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgYSA9IGdldE51bUVuZGluZyh0b3RhbCwgWyfQndCw0LnQtNC10L3QsCcsICfQndCw0LnQtNC10L3QvicsICfQndCw0LnQtNC10L3QviddKTtcclxuICAgICAgICAgICAgdmFyIGIgPSBnZXROdW1FbmRpbmcodG90YWwsIFsn0LjQv9C+0YLQtdGH0L3QsNGPINC/0YDQvtCz0YDQsNC80LzQsCcsICfQuNC/0L7RgtC10YfQvdGL0LUg0L/RgNC+0LPRgNCw0LzQvNGLJywgJ9C40L/QvtGC0LXRh9C90YvRhSDQv9GA0L7Qs9GA0LDQvNC8J10pO1xyXG4gICAgICAgICAgICAkdGFyZ2V0LnRleHQoW2EsIHRvdGFsLCBiXS5qb2luKCcgJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlY19fc2hvdy1idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcykucGFyZW50cygnLmpzLWh5cG90aGVjJykuZmluZCgnLmpzLWh5cG90aGVjX19zaG93LXRhcmdldCcpO1xyXG4gICAgICAgICAgICBpZiAoJHQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBvZmZzZXR9LCAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERhdGVwaWNrZXIoKSB7XHJcbiAgICAgICAgdmFyIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNvbW1vbk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAndG9wIGxlZnQnLFxyXG4gICAgICAgICAgICBvblNob3c6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uSGlkZTogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoZm9ybWF0dGVkRGF0ZSwgZGF0ZSwgaW5zdCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdC4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlcicpLmRhdGVwaWNrZXIoT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIHRpbWVwaWNrZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGVUaW1lU2VwYXJhdG9yOiAnLCAnLFxyXG4gICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAkKCcuanMtZGF0ZXBpY2tlci1yYW5nZScpLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBtaW4gPSBuZXcgRGF0ZSgkKHRoaXMpLmRhdGEoJ21pbicpKSB8fCBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWF4JykpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG1pbixcclxuICAgICAgICAgICAgICAgIG1heERhdGU6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJyAtICcsXHJcbiAgICAgICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKHRoaXMpLmRhdGEoJ2RhdGVwaWNrZXInKTtcclxuICAgICAgICAgICAgZGF0ZXBpY2tlci5zZWxlY3REYXRlKFttaW4sIG1heF0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlcGlja2VyVmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKCcuanMtZGF0ZXRpbWVwaWNrZXIsIC5qcy1kYXRlcGlja2VyLXJhbmdlJykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZXBpY2tlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsYmFyKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGxiYXInKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB2YXIgdyA9ICQod2luZG93KS5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kICYmIHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4vLyAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1ob3QnKS5zY3JvbGxiYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtC60YDRg9GC0LrQsCDQv9C+INGB0YHRi9C70LrQtSDQtNC+INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdFNjcm9sbCgpIHtcclxuICAgICAgICAkKCcuanMtc2Nyb2xsJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoJCh0aGlzKS5hdHRyKCdocmVmJykpO1xyXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIDQwO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXJfX21haW4nKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcl9fbWFpbicpLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcicpLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluaXRBYm91dCgpIHtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA1LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgdmVydGljYWw6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtYWJvdXQtaHlzdG9yeV9fY29udGVudC1zbGlkZXInLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBtb2JpbGVGaXJzdDogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kIC0gMSxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNzBweCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fc2libGluZycpLnJlbW92ZUNsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkubmV4dCgpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkucHJldigpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZpbGVpbnB1dCgpIHtcclxuICAgICAgICAkKCcuanMtZmlsZWlucHV0X19jbnQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdkZWZhdWx0JywgJCh0aGlzKS50ZXh0KCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9ICQodGhpcykudmFsKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLmpzLWZpbGVpbnB1dF9fY250JykudGV4dChmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QW50aXNwYW0oKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJlbWFpbDNcIl0saW5wdXRbbmFtZT1cImluZm9cIl0saW5wdXRbbmFtZT1cInRleHRcIl0nKS5hdHRyKCd2YWx1ZScsICcnKS52YWwoJycpO1xyXG4gICAgICAgIH0sIDUwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbHBoYWJldCgpIHtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtYWxwaGFiZXQgbGknKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFscGhhYmV0IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1TZWFyY2gyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgbVNlYXJjaDIucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbn0pOyJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
