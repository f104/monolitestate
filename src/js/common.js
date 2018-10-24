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

            if ($slick.length === 0)
                return;

            $slick.slick({
                dots: true,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                adaptiveHeight: true,
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
                return false;
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
            touch: false,
        };
        $('.js-popup').on('click', function () {
            $.fancybox.close();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3QoKTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3RTZWFyY2goKTtcclxuICAgICAgICB0aGlzLmluaXRUYWJzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0Q2hlc3MoKTtcclxuICAgICAgICB0aGlzLmluaXRDaGVzc0ZpbHRlcigpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UHNldWRvU2VsZWN0U2VhcmNoOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdCBzZWFyY2hcclxuICAgICAgICAkKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0JylcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID09PSAwID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgZm9yIG1GaWx0ZXIyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFRhYnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtdGFicycpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciB0YWJzU2VsZWN0b3IgPSB0eXBlb2YgJChlbGVtKS5kYXRhKCd0YWJzJykgPT09ICd1bmRlZmluZWQnID8gJy5qcy10YWJzX19saXN0ID4gbGknIDogJChlbGVtKS5kYXRhKCd0YWJzJyk7XHJcbiAgICAgICAgICAgIHZhciAkc2VsZWN0ID0gJChlbGVtKS5maW5kKCcuanMtdGFic19fc2VsZWN0JyksIHdpdGhTZWxlY3QgPSAkc2VsZWN0Lmxlbmd0aDtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICAvLyDQtNC70Y8g0LLQu9C+0LbQtdC90L3Ri9GFINGC0LDQsdC+0LIg0LjRgdC/0L7Qu9GM0LfRg9C10LwgZGF0YVxyXG4gICAgICAgICAgICAgICAgdGFiczogdGFic1NlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgcGFuZWxDb250ZXh0OiAkKGVsZW0pLmhhc0NsYXNzKCdqcy10YWJzX2Rpc2Nvbm5lY3RlZCcpID8gJCgnLmpzLXRhYnNfX2NvbnRlbnQnKSA6ICQoZWxlbSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICh3aXRoU2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAkKHRhYnNTZWxlY3RvcikuZmluZCgnYScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9ICQodGhpcykuYXR0cignaHJlZicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJCh0aGlzKS5kYXRhKCdzZWxlY3QnKSB8fCAkKHRoaXMpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicrdmFsdWUrJ1wiPicrdGV4dCsnPC9vcHRpb24+Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICRzZWxlY3Qub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKCdzZWxlY3QnLCAkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2l0aFNlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3QudmFsKCRjbGlja2VkLmF0dHIoJ2hyZWYnKSkuY2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCdzZXRQb3NpdGlvbicpO1xyXG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRDaGVzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykucGFyZW50KCkuaG92ZXIoYXBwLnNob3dDaGVzc1Rvb2x0aXAsIGFwcC5oaWRlQ2hlc3NUb29sdGlwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSB7XHJcbiAgICAgICAgICAgIHRpdGxlOiAkKCcuanMtY2hlc3MtaW5mb19fdGl0bGUnKSxcclxuICAgICAgICAgICAgYXJlYTogJCgnLmpzLWNoZXNzLWluZm9fX2FyZWEnKSxcclxuICAgICAgICAgICAgcHJpY2U6ICQoJy5qcy1jaGVzcy1pbmZvX19wcmljZScpLFxyXG4gICAgICAgICAgICBwcmljZVBlclNxdWFyZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlUGVyU3F1YXJlJyksXHJcbiAgICAgICAgICAgIGZsb29yOiAkKCcuanMtY2hlc3MtaW5mb19fZmxvb3InKSxcclxuICAgICAgICAgICAgZmxvb3JzVG90YWw6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcnNUb3RhbCcpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWMgPSAkKCcuanMtY2hlc3MtaW5mb19faHlwb3RoZWMnKSxcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIgPSAkKCcuanMtY2hlc3MtaW5mb19faHlwb3RoZWMtd3JhcHBlcicpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQgPSAkKCcuanMtY2hlc3MtaW5mb19faW1nRmxhdCcpLFxyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yID0gJCgnLmpzLWNoZXNzLWluZm9fX2ltZ0Zsb29yJyksXHJcbiAgICAgICAgICAgICAgICAkdGFicyA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJzJyksXHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3IgPSAkKCcuanMtY2hlc3MtaW5mb19fdGFiRmxvb3InKSxcclxuICAgICAgICAgICAgICAgICR0YWJGbGF0ID0gJCgnLmpzLWNoZXNzLWluZm9fX3RhYkZsYXQnKSxcclxuICAgICAgICAgICAgICAgICRmb3JtID0gJCgnLmpzLWNoZXNzLWluZm9fX2Zvcm0nKSxcclxuICAgICAgICAgICAgICAgIGluaXQgPSBmYWxzZTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbS5fYWN0aXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoJ19zZWxlY3RlZCcpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAkKCcuanMtY2hlc3MtaW5mb19faXRlbScpLnJlbW92ZUNsYXNzKCdfc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgJHRoaXMuYWRkQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluICR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICR0YXJnZXRba2V5XS50ZXh0KGRhdGFba2V5XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJGZvcm0udmFsKGRhdGEuZm9ybSk7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmh5cG90aGVjKSB7XHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWMudGV4dChkYXRhLmh5cG90aGVjKTtcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlY1dyYXBwZXIuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuaW1nRmxhdCkge1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuYXR0cignaHJlZicsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5maW5kKCdpbWcnKS5hdHRyKCdzcmMnLCBkYXRhLmltZ0ZsYXQpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsYXQuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGltZ0ZsYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsYXQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmltZ0Zsb29yKSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuYXR0cignaHJlZicsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxvb3IpO1xyXG4gICAgICAgICAgICAgICAgJGltZ0Zsb29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgICR0YWJGbG9vci5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsb29yLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJHRhYnMuZmluZCgnbGk6dmlzaWJsZScpLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAkdGFicy5maW5kKCdsaTp2aXNpYmxlJykuZmlyc3QoKS5maW5kKCdhJykuY2xpY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgJChcImh0bWwsIGJvZHlcIikuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAkdGFyZ2V0LnRpdGxlLm9mZnNldCgpLnRvcCAtIDEwMFxyXG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtLl9hY3RpdmUnKS5maXJzdCgpLmNsaWNrKCk7XHJcbiAgICAgICAgaW5pdCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgICRjaGVzc1Rvb2x0aXA6IG51bGwsXHJcbiAgICAkY2hlc3NUb29sdGlwVGltZW91dDogbnVsbCxcclxuXHJcbiAgICBzaG93Q2hlc3NUb29sdGlwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRzZWxmLm9mZnNldCgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcCA9ICRzZWxmLmZpbmQoJy5qcy1jaGVzcy10b29sdGlwX19jb250ZW50JykuY2xvbmUoKTtcclxuICAgICAgICAgICAgYXBwLiRjaGVzc1Rvb2x0aXAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCArIDI4LFxyXG4gICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyAxMCxcclxuICAgICAgICAgICAgfSkuYXBwZW5kVG8oJCgnYm9keScpKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGVDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoYXBwLiRjaGVzc1Rvb2x0aXBUaW1lb3V0KTtcclxuICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcC5yZW1vdmUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdENoZXNzRmlsdGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRmb3JtID0gJCgnLmpzLWNoZXNzLWZpbHRlcicpLFxyXG4gICAgICAgICAgICAgICAgJGl0ZW1zID0gJCgnLmpzLWNoZXNzLWZpbHRlcl9faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IG51bGwsIGFyZWFNYXggPSBudWxsLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBudWxsLCBwcmljZU1heCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0b3RhbCA9ICRpdGVtcy5sZW5ndGggLSAkaXRlbXMuZmlsdGVyKCcuX3NvbGQnKS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCRmb3JtLmxlbmd0aCA9PT0gMCB8fCAkaXRlbXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAkaXRlbXMuZmlsdGVyKCdbZGF0YS1maWx0ZXItYXJlYV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGFyZWEgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1pbiB8fCBhcmVhIDwgYXJlYU1pbikge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1pbiA9IGFyZWE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFhcmVhTWF4IHx8IGFyZWEgPiBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhTWF4ID0gYXJlYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1wcmljZV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHByaWNlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItcHJpY2UnKSk7XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNaW4gfHwgcHJpY2UgPCBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXByaWNlTWF4IHx8IHByaWNlID4gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4ID0gcHJpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWluXCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWluKS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWF4XCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWF4KS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNaW4pLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIHByaWNlTWF4KS5hdHRyKCdtaW4nLCBwcmljZU1pbikuYXR0cignbWF4JywgcHJpY2VNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1yb29tcz1cIicgKyAkKHRoaXMpLnZhbCgpICsgJ1wiXScpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRmb3JtLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGZvcm1EYXRhID0gJGZvcm0uc2VyaWFsaXplQXJyYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhOiBbYXJlYU1pbiwgYXJlYU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaWNlOiBbcHJpY2VNaW4sIHByaWNlTWF4XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbXM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgICQuZWFjaChmb3JtRGF0YSwgZnVuY3Rpb24gKG4sIHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWluJyAmJiB2LnZhbHVlICE9IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ2FyZWFfbWF4JyAmJiB2LnZhbHVlICE9IGFyZWFNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLmFyZWFbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21pbicgJiYgdi52YWx1ZSAhPSBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMF0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3ByaWNlX21heCcgJiYgdi52YWx1ZSAhPSBwcmljZU1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucHJpY2VbMV0gPSBwYXJzZUludCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2Lm5hbWUgPT0gJ3Jvb21zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnMucm9vbXMucHVzaCh2LnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmFyZWFbMF0gPT0gYXJlYU1pbiAmJiBmaWx0ZXJzLmFyZWFbMV0gPT0gYXJlYU1heClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJzLmFyZWE7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnByaWNlWzBdID09IHByaWNlTWluICYmIGZpbHRlcnMucHJpY2VbMV0gPT0gcHJpY2VNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5wcmljZTtcclxuICAgICAgICAgICAgaWYgKGZpbHRlcnMucm9vbXMubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5yb29tcztcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWx0ZXJzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhmaWx0ZXJzKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5hZGRDbGFzcygnX2ZpbHRlcmVkJyk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gdHJ1ZSwgJF9pdGVtID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAkLmVhY2goZmlsdGVycywgZnVuY3Rpb24gKGssIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdhcmVhJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KCRfaXRlbS5kYXRhKCdmaWx0ZXItYXJlYScpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmVhIDwgdlswXSB8fCBhcmVhID4gdlsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJpY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKCRfaXRlbS5kYXRhKCdmaWx0ZXItcHJpY2UnKSkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaWNlIDwgdlswXSB8fCBwcmljZSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Jvb21zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykpID09PSAndW5kZWZpbmVkJyB8fCB2LmluZGV4T2YoJF9pdGVtLmRhdGEoJ2ZpbHRlci1yb29tcycpLnRvU3RyaW5nKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwoJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJy5fZmlsdGVyZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q2hlc3NUb3RhbDogZnVuY3Rpb24gKHRvdGFsKSB7XHJcbiAgICAgICAgdmFyIGVuZGluZ3MgPSBbJ9C60LLQsNGA0YLQuNGA0LAnLCAn0LrQstCw0YDRgtC40YDRiycsICfQutCy0LDRgNGC0LjRgCddO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1maWx0ZXJfX3RvdGFsJykudGV4dCh0b3RhbCArICcgJyArIGFwcC5nZXROdW1FbmRpbmcodG90YWwsIGVuZGluZ3MpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQpNGD0L3QutGG0LjRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvtC60L7QvdGH0LDQvdC40LUg0LTQu9GPINC80L3QvtC20LXRgdGC0LLQtdC90L3QvtCz0L4g0YfQuNGB0LvQsCDRgdC70L7QstCwINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGH0LjRgdC70LAg0Lgg0LzQsNGB0YHQuNCy0LAg0L7QutC+0L3Rh9Cw0L3QuNC5XHJcbiAgICAgKiBwYXJhbSAgaU51bWJlciBJbnRlZ2VyINCn0LjRgdC70L4g0L3QsCDQvtGB0L3QvtCy0LUg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INGB0YTQvtGA0LzQuNGA0L7QstCw0YLRjCDQvtC60L7QvdGH0LDQvdC40LVcclxuICAgICAqIHBhcmFtICBhRW5kaW5ncyBBcnJheSDQnNCw0YHRgdC40LIg0YHQu9C+0LIg0LjQu9C4INC+0LrQvtC90YfQsNC90LjQuSDQtNC70Y8g0YfQuNGB0LXQuyAoMSwgNCwgNSksXHJcbiAgICAgKiAgICAgICAgINC90LDQv9GA0LjQvNC10YAgWyfRj9Cx0LvQvtC60L4nLCAn0Y/QsdC70L7QutCwJywgJ9GP0LHQu9C+0LonXVxyXG4gICAgICogcmV0dXJuIFN0cmluZ1xyXG4gICAgICogXHJcbiAgICAgKiBodHRwczovL2hhYnJhaGFici5ydS9wb3N0LzEwNTQyOC9cclxuICAgICAqL1xyXG4gICAgZ2V0TnVtRW5kaW5nOiBmdW5jdGlvbiAoaU51bWJlciwgYUVuZGluZ3MpXHJcbiAgICB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRSYW5nZSgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5KCk7XHJcbiAgICAgICAgaW5pdEh5cG90aGVjKCk7XHJcbiAgICAgICAgaW5pdERhdGVwaWNrZXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgaW5pdFNjcm9sbCgpO1xyXG4gICAgICAgIGluaXRBYm91dCgpO1xyXG4gICAgICAgIGluaXRGaWxlaW5wdXQoKTtcclxuICAgICAgICBpbml0QWxwaGFiZXQoKTtcclxuICAgICAgICBpbml0QW50aXNwYW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICB2YXIgJGJhciA9ICQoJy5qcy1tYWluLXNsaWRlci1iYXInKSxcclxuICAgICAgICAgICAgICAgICRzbGljayA9ICQoJy5qcy1zbGlkZXItbWFpbicpLFxyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcjpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcicpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLWFnZW50cy1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5fYWN0aXZlIC5qcy1hZ2VudHMtc2xpZGVyX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHMoKV0vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIG1haWwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbWFpbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbWFpbCBhJykudGV4dChtYWlsKS5hdHRyKCdocmVmJywgJ21haWx0bzonICsgbWFpbCk7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtdXJsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX191cmwgYScpLmF0dHIoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcl9fdXJsJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoaHJlZikudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCA9PSAwID8gJCgnLmpzLW1lbnUtb3ZlcmxheScpLmhpZGUoKSA6ICQoJy5qcy1tZW51LW92ZXJsYXknKS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXIsIC5qcy1tZW51JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJy5qcy1tYXNrX190ZWwnKS5pbnB1dG1hc2soe1xyXG4gICAgICAgICAgICBtYXNrOiAnKzkgKDk5OSkgOTk5LTk5LTk5J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIElucHV0bWFzay5leHRlbmRBbGlhc2VzKHtcclxuICAgICAgICAgICAgJ251bWVyaWMnOiB7XHJcbiAgICAgICAgICAgICAgICBhdXRvVW5tYXNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2hvd01hc2tPbkhvdmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJhZGl4UG9pbnQ6IFwiLFwiLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTZXBhcmF0b3I6IFwiIFwiLFxyXG4gICAgICAgICAgICAgICAgZGlnaXRzOiAwLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dNaW51czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhdXRvR3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByaWdodEFsaWduOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fbnVtZXJpYycpLmlucHV0bWFzayhcIm51bWVyaWNcIik7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlX2ZpbHRlcicpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC8wrInLFxyXG4gICAgICAgICAgICB1bm1hc2tBc051bWJlcjogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3lfZmlsdGVyJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19hZ2UnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQu9C10YInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3BlcmNlbnQnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3ksIC5qcy1tYXNrX19zcXVhcmUsIC5qcy1tYXNrX19wZXJjZW50Jykub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgZm9yIHJlbW92ZSBzdWZmaXhcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9JbnB1dG1hc2svaXNzdWVzLzE1NTFcclxuICAgICAgICAgICAgdmFyIHYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodiA9PSAwIHx8IHYgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudmFsKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJ0aGVtZVwiLCBcImN1c3RvbVwiKTtcclxuICAgICAgICAkLmZuLnNlbGVjdDIuZGVmYXVsdHMuc2V0KFwibWluaW11bVJlc3VsdHNGb3JTZWFyY2hcIiwgSW5maW5pdHkpO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgICAgICQoXCIuanMtYWdlbnQtc2VhcmNoXCIpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2FnZW50cycsXHJcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgIGxhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dFRvb1Nob3J0OiBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcItCf0L7QttCw0LvRg9C50YHRgtCwLCDQstCy0LXQtNC40YLQtSBcIiArIChhLm1pbmltdW0gLSBhLmlucHV0Lmxlbmd0aCkgKyBcIiDQuNC70Lgg0LHQvtC70YzRiNC1INGB0LjQvNCy0L7Qu9C+0LJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWpheDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLm15anNvbi5jb20vYmlucy9va3l2aVwiLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTogcGFyYW1zLnRlcm0sIC8vIHNlYXJjaCB0ZXJtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2FnZW50X3NlYXJjaCdcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSAkLm1hcChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHZhbHVlLnBhZ2V0aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFnZW50OiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXN1bHQsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRTZWxlY3Rpb24sXHJcbiAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24gKG1hcmt1cCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcclxuICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcclxuICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAzLFxyXG4gICAgICAgICAgICBtYXhpbXVtU2VsZWN0aW9uTGVuZ3RoOiAxLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdChpdGVtKSB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLmxvYWRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAn0L/QvtC40YHQuuKApic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic2VsZWN0Mi1yZXN1bHQtYWdlbnRcIj48c3Ryb25nPicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uYWdlbnQucGFnZXRpdGxlICsgJzwvc3Ryb25nPjxicj4nICsgaXRlbS5hZ2VudC52YWx1ZSArICc8L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmb3JtYXRTZWxlY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5hZ2VudC5wYWdldGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5qcy1hZ2VudC1zZWFyY2gnKS5vbignc2VsZWN0MjpzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGUucGFyYW1zLmRhdGE7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGRhdGEuYWdlbnQudXJpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFZhbGlkYXRlKCkge1xyXG4gICAgICAgICQudmFsaWRhdG9yLmFkZE1ldGhvZChcInBob25lXCIsIGZ1bmN0aW9uICh2YWx1ZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbChlbGVtZW50KSB8fCAvXlxcK1xcZFxcc1xcKFxcZHszfVxcKVxcc1xcZHszfS1cXGR7Mn0tXFxkezJ9JC8udGVzdCh2YWx1ZSk7XHJcbiAgICAgICAgfSwgXCJQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIG1vYmlsZSBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoZXJyb3IsIGVsZW1lbnQpIHt9LFxyXG4gICAgICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwicGhvbmVcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtdmFsaWRhdGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS52YWxpZGF0ZShvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5RmlsdGVycygpIHtcclxuICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdHlwZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXRpdGxlJykudGV4dCgkKHRoaXMpLmRhdGEoJ2ZpbHRlcnMtdGl0bGUnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFBhc3N3b3JkKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtcGFzc3dvcmQnKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZHJvcGJveC96eGN2Ym5cclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmw6IFwiLi9qcy9saWJzL3p4Y3Zibi5qc1wiLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcclxuICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24gKHNjcmlwdCwgdGV4dFN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyB6eGN2Ym4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh6eGN2Ym4pID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0genhjdmJuKHZhbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyk7XHJcbiAgICAgICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zIF80Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyByZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJldmlld3NTbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyICRzbGlkZXIgPSAkKCcuanMtc2xpZGVyLXJldmlld3MnKTtcclxuICAgICAgICAkc2xpZGVyLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMgX2JpZycsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5sZyxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGJpZyA9ICQoJy5yZXZpZXdzX19saXN0Ll9iaWcgLnJldmlld3NfX2xpc3RfX2l0ZW0nKTtcclxuICAgICAgICB2YXIgY3VycmVudCA9IDA7XHJcbiAgICAgICAgaWYgKCRiaWcubGVuZ3RoICYmICRzbGlkZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAkc2xpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudFNsaWRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlICE9IGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyQmlnKCkge1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVPdXQoKS5lbXB0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBzZXRCaWcoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItcmV2aWV3cyAuc2xpY2stY3VycmVudCAucmV2aWV3c19fbGlzdF9faXRlbV9faW5uZXInKS5jbG9uZSgpLmFwcGVuZFRvKCRiaWcpO1xyXG4gICAgICAgICAgICAkYmlnLmZhZGVJbigpO1xyXG4gICAgICAgICAgICAkYmlnLnBhcmVudCgpLmNzcygnaGVpZ2h0JywgJGJpZy5vdXRlckhlaWdodCh0cnVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHkoKSB7XHJcbiAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdwZG9wYWdlX2xvYWQnLCBmdW5jdGlvbiAoZSwgY29uZmlnLCByZXNwb25zZSkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ21zZTJfbG9hZCcsIGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyW2RhdGEtaW5pdD1cImZhbHNlXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRvZ2dsZXJzID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19pbWctd3JhcHBlcicpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICAgICAkdG9nZ2xlcnMuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvdW50ZXIudGV4dChpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnaW5pdCcsICd0cnVlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgICAgICAgJCgnLmpzLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlciA9ICQoZWxlbSkuZmluZCgnLmpzLXJhbmdlX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkaW5wdXRzID0gJChlbGVtKS5maW5kKCdpbnB1dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkaW5wdXRzLmZpcnN0KClbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG8gPSAkaW5wdXRzLmxhc3QoKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBmcm9tICYmIHRvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoZnJvbS52YWx1ZSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQodG8udmFsdWUpIHx8IDA7XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc25hcFZhbHVlcyA9IFtmcm9tLCB0b107XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc25hcFZhbHVlc1toYW5kbGVdLnZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZXNbaGFuZGxlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbdGhpcy52YWx1ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0by5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFtudWxsLCB0aGlzLnZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICgkKGVsZW0pLmhhc0NsYXNzKCdqcy1jaGVzcy1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ2VuZCcsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdbbmFtZT1cInByaWNlX21heFwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1waWNrZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9ICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKVswXTtcclxuICAgICAgICAgICAgaWYgKHNsaWRlciAmJiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWluJykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KGlucHV0LmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCBtaW47XHJcbiAgICAgICAgICAgICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdmFsLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IFt0cnVlLCBmYWxzZV0sXHJcbi8vICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB0bzogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXBpY2tlcl9faW5wdXQnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IGlucHV0LmlucHV0bWFzaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmJiBpbnB1dC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLW1hc2tfX2FnZScpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWZmaXggPSBnZXROdW1FbmRpbmcocGFyc2VJbnQoc2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkpLCBbJ8Kg0LPQvtC0JywgJ8Kg0LPQvtC00LAnLCAnwqDQu9C10YInXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc2sub3B0aW9uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdhbGxlcnkoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnktbmF2Jykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiB0cnVlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogNixcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnlfX3NsaWRlcicsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnknKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19zbGlkZXInKTtcclxuICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX2N1cnJlbnQnKTtcclxuICAgICAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeS1uYXYnLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNsaWRlci5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICRjdXJyZW50LnRleHQoKytjdXJyZW50U2xpZGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyICRsaW5rcyA9ICRzbGlkZXIuZmluZCgnLnNsaWRlOm5vdCguc2xpY2stY2xvbmVkKScpO1xyXG4gICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fdG90YWwnKS50ZXh0KCRsaW5rcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAkbGlua3Mub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oICRsaW5rcywge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvb3A6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sICRsaW5rcy5pbmRleCggdGhpcyApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCk0YPQvdC60YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LrQvtC90YfQsNC90LjQtSDQtNC70Y8g0LzQvdC+0LbQtdGB0YLQstC10L3QvdC+0LPQviDRh9C40YHQu9CwINGB0LvQvtCy0LAg0L3QsCDQvtGB0L3QvtCy0LDQvdC40Lgg0YfQuNGB0LvQsCDQuCDQvNCw0YHRgdC40LLQsCDQvtC60L7QvdGH0LDQvdC40LlcclxuICAgICAqIHBhcmFtICBpTnVtYmVyIEludGVnZXIg0KfQuNGB0LvQviDQvdCwINC+0YHQvdC+0LLQtSDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHRhNC+0YDQvNC40YDQvtCy0LDRgtGMINC+0LrQvtC90YfQsNC90LjQtVxyXG4gICAgICogcGFyYW0gIGFFbmRpbmdzIEFycmF5INCc0LDRgdGB0LjQsiDRgdC70L7QsiDQuNC70Lgg0L7QutC+0L3Rh9Cw0L3QuNC5INC00LvRjyDRh9C40YHQtdC7ICgxLCA0LCA1KSxcclxuICAgICAqICAgICAgICAg0L3QsNC/0YDQuNC80LXRgCBbJ9GP0LHQu9C+0LrQvicsICfRj9Cx0LvQvtC60LAnLCAn0Y/QsdC70L7QuiddXHJcbiAgICAgKiByZXR1cm4gU3RyaW5nXHJcbiAgICAgKiBcclxuICAgICAqIGh0dHBzOi8vaGFicmFoYWJyLnJ1L3Bvc3QvMTA1NDI4L1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXROdW1FbmRpbmcoaU51bWJlciwgYUVuZGluZ3MpIHtcclxuICAgICAgICB2YXIgc0VuZGluZywgaTtcclxuICAgICAgICBpTnVtYmVyID0gaU51bWJlciAlIDEwMDtcclxuICAgICAgICBpZiAoaU51bWJlciA+PSAxMSAmJiBpTnVtYmVyIDw9IDE5KSB7XHJcbiAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gaU51bWJlciAlIDEwO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgKDEpOlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgKDIpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoMyk6XHJcbiAgICAgICAgICAgICAgICBjYXNlICg0KTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHNFbmRpbmcgPSBhRW5kaW5nc1syXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc0VuZGluZztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0SHlwb3RoZWMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY29zdCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19jb3N0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICRjb3N0LnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50UGVyY2VudCA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXBlcmNlbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19wYXltZW50LXN1bScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyID0gJCh0aGlzKS5maW5kKCcuanMtcGlja2VyX190YXJnZXQnKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAkYWdlID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2FnZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRjcmVkaXQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY3JlZGl0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlciA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19zbGlkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19faXRlbScpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzY3JvbGwgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2Nyb2xsJyk7XHJcbiAgICAgICAgICAgIHZhciByYXRlID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlJykudGV4dCgpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgfHwgMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKHJhdGUpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZU1FID0gW107XHJcbiAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJhdGVNRS5wdXNoKHBhcnNlRmxvYXQoJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3JhdGVNRScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlTUUpO1xyXG4gICAgICAgICAgICB2YXIgY3JlZGl0ID0gMDtcclxuICAgICAgICAgICAgdmFyIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgIHZhciBwZXJjZW50O1xyXG4gICAgICAgICAgICAkY29zdC5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29zdCA9ICQodGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW0ucHJvcCgnbWF4JywgY29zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW1QaWNrZXIubm9VaVNsaWRlci51cGRhdGVPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IGNvc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0ub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAkKHRoaXMpLnZhbCgpICogMTAwIC8gY29zdDtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50ID4gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudCA9IDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnZhbChjb3N0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyZWRpdCA9IGNhbGNDcmVkaXQoY29zdCwgcGVyY2VudCk7XHJcbiAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQudmFsKHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJGNyZWRpdC52YWwoY3JlZGl0KTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZmlyc3QnKS50ZXh0KGZvcm1hdFByaWNlKCRwYXltZW50U3VtLnZhbCgpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aCcpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGhNRScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19lY29ub215JykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpICogMTIgKiBhZ2UgLSBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkgKiAxMiAqIGFnZSkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgICAgICBvbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtcGlja2VyJykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0ubm9VaVNsaWRlci5zZXQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgJGFnZS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgYWdlID0gJGFnZS52YWwoKTtcclxuICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjcm9sbC5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2xpZGVyLnNsaWNrKCdzbGlja0dvVG8nLCBpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gZmlsdGVycywg0LrQsNC20LTRi9C5INGB0LXQu9C10LrRgiDRhNC40LvRjNGC0YDRg9C10YIg0L7RgtC00LXQu9GM0L3QvlxyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBbXTtcclxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpbHRlcicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZOYW1lID0gJCh0aGlzKS5kYXRhKCdoeXBvdGhlYy1maWx0ZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ2ZpbHRlci0nICsgZk5hbWU7XHJcbiAgICAgICAgICAgICAgICBzdHlsZS5wdXNoKCcuJyArIGNsYXNzTmFtZSArICd7ZGlzcGxheTpub25lICFpbXBvcnRhbnR9Jyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNoZWNrYm94ZXMgPSAkKHRoaXMpLmZpbmQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJyk7XHJcbiAgICAgICAgICAgICAgICAkY2hlY2tib3hlcy5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkY2hlY2tlZCA9ICRjaGVja2JveGVzLmZpbHRlcignOmNoZWNrZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJGNoZWNrZWQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY2hlY2tlZC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYucHVzaCgnOm5vdChbZGF0YS1maWx0ZXItJyArICQodGhpcykudmFsKCkgKyAnXSknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5maWx0ZXIoJy5qcy1oeXBvdGhlY19faXRlbScgKyBmLmpvaW4oJycpKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtcy5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnPHN0eWxlPicgKyBzdHlsZS5qb2luKCcnKSArICc8L3N0eWxlPicpLmFwcGVuZFRvKCdoZWFkJylcclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGF5bWVudChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgLSBNYXRoLmNlaWwoY29zdCAqIHBlcmNlbnQgLyAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlLCBhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChjcmVkaXQgKiAoKHJhdGUgLyAxMjAwLjApIC8gKDEuMCAtIE1hdGgucG93KDEuMCArIHJhdGUgLyAxMjAwLjAsIC0oYWdlICogMTIpKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UHJpY2UocHJpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByaWNlLnRvU3RyaW5nKCkucmVwbGFjZSgvLi9nLCBmdW5jdGlvbiAoYywgaSwgYSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgJiYgYyAhPT0gXCIuXCIgJiYgISgoYS5sZW5ndGggLSBpKSAlIDMpID8gJyAnICsgYyA6IGM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcuanMtaHlwb3RoZWNfX3NsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCAtIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zaG93LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0ID0gJCh0aGlzKS5wYXJlbnRzKCcuanMtaHlwb3RoZWMnKS5maW5kKCcuanMtaHlwb3RoZWNfX3Nob3ctdGFyZ2V0Jyk7XHJcbiAgICAgICAgICAgIGlmICgkdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdC5vZmZzZXQoKS50b3AgLSA0MDtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcuaGVhZGVyX19tYWluJykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09ICQoJy5oZWFkZXJfX21haW4nKS5vdXRlckhlaWdodCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RGF0ZXBpY2tlcigpIHtcclxuICAgICAgICB2YXIgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY29tbW9uT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICd0b3AgbGVmdCcsXHJcbiAgICAgICAgICAgIG9uU2hvdzogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25IaWRlOiBmdW5jdGlvbiAoaW5zdCwgYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXBpY2tlclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChmb3JtYXR0ZWREYXRlLCBkYXRlLCBpbnN0KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0LiRlbC50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyJykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgbWluRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgdGltZXBpY2tlcjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0ZVRpbWVTZXBhcmF0b3I6ICcsICcsXHJcbiAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICQoJy5qcy1kYXRlcGlja2VyLXJhbmdlJykuZWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWluJykpIHx8IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gbmV3IERhdGUoJCh0aGlzKS5kYXRhKCdtYXgnKSkgfHwgbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyKE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgICAgICAgICAgbWluRGF0ZTogbWluLFxyXG4gICAgICAgICAgICAgICAgbWF4RGF0ZTogbWF4LFxyXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdWx0aXBsZURhdGVzU2VwYXJhdG9yOiAnIC0gJyxcclxuICAgICAgICAgICAgfSwgY29tbW9uT3B0aW9ucykpO1xyXG4gICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQodGhpcykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICBkYXRlcGlja2VyLnNlbGVjdERhdGUoW21pbiwgbWF4XSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWRhdGV0aW1lcGlja2VyLCAuanMtZGF0ZXBpY2tlci1yYW5nZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGVwaWNrZXJWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZXBpY2tlciA9ICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5kYXRhKCdkYXRlcGlja2VyJyk7XHJcbiAgICAgICAgICAgICAgICBkYXRlcGlja2VyLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTY3JvbGxiYXIoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIHZhciB3ID0gJCh3aW5kb3cpLm91dGVyV2lkdGgoKTtcclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20nKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgJiYgdyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1tZC1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodyA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWRcclxuICAgICAgICAgICAgICAgICAgICAmJiAkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodyA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbi8vICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLWhvdCcpLnNjcm9sbGJhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J/RgNC+0LrRgNGD0YLQutCwINC/0L4g0YHRgdGL0LvQutC1INC00L4g0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGwnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCgkKHRoaXMpLmF0dHIoJ2hyZWYnKSk7XHJcbiAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogb2Zmc2V0fSwgMzAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5pdEFib3V0KCkge1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcclxuICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzUwcHgnLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc3MHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9zaWJsaW5nJykucmVtb3ZlQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5uZXh0KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5wcmV2KCkuYWRkQ2xhc3MoJ19zaWJsaW5nJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFib3V0LWh5c3RvcnlfX2NvbnRlbnQtc2xpZGVyJykuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWFib3V0LWh5c3RvcnlfX3llYXItc2xpZGVyJyxcclxuICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmlsZWlucHV0KCkge1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXRfX2NudCcpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ2RlZmF1bHQnLCAkKHRoaXMpLnRleHQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWZpbGVpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVOYW1lID0gJCh0aGlzKS52YWwoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuanMtZmlsZWlucHV0X19jbnQnKS50ZXh0KGZpbGVOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbnRpc3BhbSgpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1cImVtYWlsM1wiXSxpbnB1dFtuYW1lPVwiaW5mb1wiXSxpbnB1dFtuYW1lPVwidGV4dFwiXScpLmF0dHIoJ3ZhbHVlJywgJycpLnZhbCgnJyk7XHJcbiAgICAgICAgfSwgNTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFscGhhYmV0KCkge1xyXG4gICAgICAgICQoJy5qcy1hbHBoYWJldCBpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnByb3AoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCgnLmpzLWFscGhhYmV0IGxpJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCdsaScpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbVNlYXJjaDIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBtU2VhcmNoMi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1WEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0FnSUZ4eVhHNTlLVHNpWFN3aVptbHNaU0k2SW1OdmJXMXZiaTVxY3lKOSJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtaGlkZS1lbXB0eScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoISQodGhpcykuZmluZCgnLmpzLWhpZGUtZW1wdHlfX2NudCA+IConKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3QoKTtcclxuICAgICAgICB0aGlzLmluaXRQc2V1ZG9TZWxlY3RTZWFyY2goKTtcclxuICAgICAgICB0aGlzLmluaXRUYWJzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0UmFuZ2UoKTtcclxuICAgICAgICB0aGlzLmluaXRDaGVzcygpO1xyXG4gICAgICAgIHRoaXMuaW5pdENoZXNzRmlsdGVyKCk7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRQc2V1ZG9TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBjdXN0b20gc2VsZWN0XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdF9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXNlbGVjdCcpLmFkZENsYXNzKCdfYWN0aXZlJykudG9nZ2xlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm5vdCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX29wZW5lZCBfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRQc2V1ZG9TZWxlY3RTZWFyY2g6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBjdXN0b20gc2VsZWN0IHNlYXJjaFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3Qtc2VhcmNoJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9ICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2l0ZW0nKTtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faW5wdXQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9ICQodGhpcykudmFsKCkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHF1ZXJ5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnc2VsZWN0LXNlYXJjaCcpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeSkgPT09IDAgPyAkKHRoaXMpLnNob3coKSA6ICQodGhpcykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCBmb3IgbUZpbHRlcjJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0VGFiczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRhYnNTZWxlY3RvciA9IHR5cGVvZiAkKGVsZW0pLmRhdGEoJ3RhYnMnKSA9PT0gJ3VuZGVmaW5lZCcgPyAnLmpzLXRhYnNfX2xpc3QgPiBsaScgOiAkKGVsZW0pLmRhdGEoJ3RhYnMnKTtcclxuICAgICAgICAgICAgdmFyICRzZWxlY3QgPSAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKSwgd2l0aFNlbGVjdCA9ICRzZWxlY3QubGVuZ3RoO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKHtcclxuICAgICAgICAgICAgICAgIC8vINC00LvRjyDQstC70L7QttC10L3QvdGL0YUg0YLQsNCx0L7QsiDQuNGB0L/QvtC70YzQt9GD0LXQvCBkYXRhXHJcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzU2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICBwYW5lbENvbnRleHQ6ICQoZWxlbSkuaGFzQ2xhc3MoJ2pzLXRhYnNfZGlzY29ubmVjdGVkJykgPyAkKCcuanMtdGFic19fY29udGVudCcpIDogJChlbGVtKSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUhhc2g6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHdpdGhTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICQoZWxlbSkuZmluZCh0YWJzU2VsZWN0b3IpLmZpbmQoJ2EnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSAkKHRoaXMpLmRhdGEoJ3NlbGVjdCcpIHx8ICQodGhpcykudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzZWxlY3QuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIHZhbHVlICsgJ1wiPicgKyB0ZXh0ICsgJzwvb3B0aW9uPicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkc2VsZWN0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicygnc2VsZWN0JywgJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkKGVsZW0pLmZpbmQodGFic1NlbGVjdG9yKS5maW5kKCdhOm5vdCguZGlzYWJsZWQpJykuZmlyc3QoKS5jbGljaygpO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmJpbmQoJ2Vhc3l0YWJzOmFmdGVyJywgZnVuY3Rpb24gKGV2ZW50LCAkY2xpY2tlZCwgJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpdGhTZWxlY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2VsZWN0LnZhbCgkY2xpY2tlZC5hdHRyKCdocmVmJykpLmNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHRhcmdldC5maW5kKCcuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygnc2V0UG9zaXRpb24nKTtcclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UmFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKCcuanMtcmFuZ2UnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICRpbnB1dHMgPSAkKGVsZW0pLmZpbmQoJ2lucHV0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9ICRpbnB1dHMuZmlyc3QoKVswXSxcclxuICAgICAgICAgICAgICAgICAgICB0byA9ICRpbnB1dHMubGFzdCgpWzBdO1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVyICYmIGZyb20gJiYgdG8pIHtcclxuICAgICAgICAgICAgICAgIHZhciBtaW4gPSBwYXJzZUludChmcm9tLnZhbHVlKSB8fCAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXggPSBwYXJzZUludCh0by52YWx1ZSkgfHwgMDtcclxuICAgICAgICAgICAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHZhciBzbmFwVmFsdWVzID0gW2Zyb20sIHRvXTtcclxuICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAodmFsdWVzLCBoYW5kbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbmFwVmFsdWVzW2hhbmRsZV0udmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlc1toYW5kbGVdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZnJvbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KFt0aGlzLnZhbHVlLCBudWxsXSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRvLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQoW251bGwsIHRoaXMudmFsdWVdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoZWxlbSkuaGFzQ2xhc3MoJ2pzLWNoZXNzLXJhbmdlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbignZW5kJywgZnVuY3Rpb24gKHZhbHVlcywgaGFuZGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJ1tuYW1lPVwicHJpY2VfbWF4XCJdJykudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnLmpzLXBpY2tlcicpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSAkKGVsZW0pLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gJChlbGVtKS5maW5kKCcuanMtcGlja2VyX19pbnB1dCcpWzBdO1xyXG4gICAgICAgICAgICBpZiAoc2xpZGVyICYmIGlucHV0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWluID0gcGFyc2VJbnQoaW5wdXQuZ2V0QXR0cmlidXRlKCdtaW4nKSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gcGFyc2VJbnQoaW5wdXQuZ2V0QXR0cmlidXRlKCdtYXgnKSkgfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IG1pbjtcclxuICAgICAgICAgICAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB2YWwsXHJcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdDogW3RydWUsIGZhbHNlXSxcclxuLy8gICAgICAgICAgICAgICAgICAgIGZvcm1hdDoge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKTtcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWF4JzogbWF4XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gc2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbGVtKS5maW5kKCcuanMtcGlja2VyX19pbnB1dCcpLnRyaWdnZXIoJ2NoYW5nZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXNrID0gaW5wdXQuaW5wdXRtYXNrO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrICYmIGlucHV0LmNsYXNzTGlzdC5jb250YWlucygnanMtbWFza19fYWdlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN1ZmZpeCA9IGdldE51bUVuZGluZyhwYXJzZUludChzbGlkZXIubm9VaVNsaWRlci5nZXQoKSksIFsnwqDQs9C+0LQnLCAnwqDQs9C+0LTQsCcsICfCoNC70LXRgiddKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzay5vcHRpb24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIuc2V0KHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdENoZXNzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWNoZXNzLXRvb2x0aXBfX2NvbnRlbnQnKS5wYXJlbnQoKS5ob3ZlcihhcHAuc2hvd0NoZXNzVG9vbHRpcCwgYXBwLmhpZGVDaGVzc1Rvb2x0aXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgJHRhcmdldCA9IHtcclxuICAgICAgICAgICAgdGl0bGU6ICQoJy5qcy1jaGVzcy1pbmZvX190aXRsZScpLFxyXG4gICAgICAgICAgICBhcmVhOiAkKCcuanMtY2hlc3MtaW5mb19fYXJlYScpLFxyXG4gICAgICAgICAgICBwcmljZTogJCgnLmpzLWNoZXNzLWluZm9fX3ByaWNlJyksXHJcbiAgICAgICAgICAgIHByaWNlUGVyU3F1YXJlOiAkKCcuanMtY2hlc3MtaW5mb19fcHJpY2VQZXJTcXVhcmUnKSxcclxuICAgICAgICAgICAgZmxvb3I6ICQoJy5qcy1jaGVzcy1pbmZvX19mbG9vcicpLFxyXG4gICAgICAgICAgICBmbG9vcnNUb3RhbDogJCgnLmpzLWNoZXNzLWluZm9fX2Zsb29yc1RvdGFsJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlYyA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYycpLFxyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlciA9ICQoJy5qcy1jaGVzcy1pbmZvX19oeXBvdGhlYy13cmFwcGVyJyksXHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdCA9ICQoJy5qcy1jaGVzcy1pbmZvX19pbWdGbGF0JyksXHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IgPSAkKCcuanMtY2hlc3MtaW5mb19faW1nRmxvb3InKSxcclxuICAgICAgICAgICAgICAgICR0YWJzID0gJCgnLmpzLWNoZXNzLWluZm9fX3RhYnMnKSxcclxuICAgICAgICAgICAgICAgICR0YWJGbG9vciA9ICQoJy5qcy1jaGVzcy1pbmZvX190YWJGbG9vcicpLFxyXG4gICAgICAgICAgICAgICAgJHRhYkZsYXQgPSAkKCcuanMtY2hlc3MtaW5mb19fdGFiRmxhdCcpLFxyXG4gICAgICAgICAgICAgICAgJGZvcm0gPSAkKCcuanMtY2hlc3MtaW5mb19fZm9ybScpLFxyXG4gICAgICAgICAgICAgICAgaW5pdCA9IGZhbHNlO1xyXG4gICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtLl9hY3RpdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnX3NlbGVjdGVkJykpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICQoJy5qcy1jaGVzcy1pbmZvX19pdGVtJykucmVtb3ZlQ2xhc3MoJ19zZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAkdGhpcy5hZGRDbGFzcygnX3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgJHRhcmdldFtrZXldLnRleHQoZGF0YVtrZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkZm9ybS52YWwoZGF0YS5mb3JtKTtcclxuICAgICAgICAgICAgaWYgKGRhdGEuaHlwb3RoZWMpIHtcclxuICAgICAgICAgICAgICAgICRoeXBvdGhlYy50ZXh0KGRhdGEuaHlwb3RoZWMpO1xyXG4gICAgICAgICAgICAgICAgJGh5cG90aGVjV3JhcHBlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaHlwb3RoZWNXcmFwcGVyLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS5pbWdGbGF0KSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5hdHRyKCdocmVmJywgZGF0YS5pbWdGbGF0KTtcclxuICAgICAgICAgICAgICAgICRpbWdGbGF0LmZpbmQoJ2ltZycpLmF0dHIoJ3NyYycsIGRhdGEuaW1nRmxhdCk7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxhdC5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxhdC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEuaW1nRmxvb3IpIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5hdHRyKCdocmVmJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3IuZmluZCgnaW1nJykuYXR0cignc3JjJywgZGF0YS5pbWdGbG9vcik7XHJcbiAgICAgICAgICAgICAgICAkaW1nRmxvb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJHRhYkZsb29yLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRpbWdGbG9vci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAkdGFiRmxvb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkdGFicy5maW5kKCdsaTp2aXNpYmxlJykubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgICR0YWJzLmZpbmQoJ2xpOnZpc2libGUnKS5maXJzdCgpLmZpbmQoJ2EnKS5jbGljaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAkKFwiaHRtbCwgYm9keVwiKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6ICR0YXJnZXQudGl0bGUub2Zmc2V0KCkudG9wIC0gMTAwXHJcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWNoZXNzLWluZm9fX2l0ZW0uX2FjdGl2ZScpLmZpcnN0KCkuY2xpY2soKTtcclxuICAgICAgICBpbml0ID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgJGNoZXNzVG9vbHRpcDogbnVsbCxcclxuICAgICRjaGVzc1Rvb2x0aXBUaW1lb3V0OiBudWxsLFxyXG5cclxuICAgIHNob3dDaGVzc1Rvb2x0aXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgIGFwcC4kY2hlc3NUb29sdGlwVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHNlbGYub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGFwcC4kY2hlc3NUb29sdGlwID0gJHNlbGYuZmluZCgnLmpzLWNoZXNzLXRvb2x0aXBfX2NvbnRlbnQnKS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBhcHAuJGNoZXNzVG9vbHRpcC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wICsgMjgsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCArIDEwLFxyXG4gICAgICAgICAgICB9KS5hcHBlbmRUbygkKCdib2R5JykpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgfSwgMzAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGlkZUNoZXNzVG9vbHRpcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dChhcHAuJGNoZXNzVG9vbHRpcFRpbWVvdXQpO1xyXG4gICAgICAgIGFwcC4kY2hlc3NUb29sdGlwLnJlbW92ZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0Q2hlc3NGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBjaGVzcyBsaW5rIGluIGZpbHRlciByZXN1bHRcclxuICAgICAgICBpZiAodHlwZW9mIChtU2VhcmNoMikgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLWNoZXNzX19saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJC5wYXJhbShtU2VhcmNoMi5nZXRGaWx0ZXJzKCkpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJCh0aGlzKS5hdHRyKCdocmVmJykgKyAnPycgKyBxdWVyeTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgJGZvcm0gPSAkKCcuanMtY2hlc3MtZmlsdGVyJyksXHJcbiAgICAgICAgICAgICAgICAkaXRlbXMgPSAkKCcuanMtY2hlc3MtZmlsdGVyX19pdGVtJyksXHJcbiAgICAgICAgICAgICAgICBhcmVhTWluID0gbnVsbCwgYXJlYU1heCA9IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbiA9IG51bGwsIHByaWNlTWF4ID0gbnVsbCxcclxuICAgICAgICAgICAgICAgIHNsaWRlclByaWNlID0gJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9taW5cIl0nKS5wYXJlbnRzKCcuanMtcmFuZ2UnKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVyQXJlYSA9ICRmb3JtLmZpbmQoJ1tuYW1lPVwiYXJlYV9taW5cIl0nKS5wYXJlbnRzKCcuanMtcmFuZ2UnKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgdG90YWwgPSAkaXRlbXMubGVuZ3RoIC0gJGl0ZW1zLmZpbHRlcignLl9zb2xkJykubGVuZ3RoO1xyXG4gICAgICAgIGlmICgkZm9ybS5sZW5ndGggPT09IDAgfHwgJGl0ZW1zLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc2V0Q2hlc3NUb3RhbCh0b3RhbCk7XHJcbiAgICAgICAgJGl0ZW1zLmZpbHRlcignW2RhdGEtZmlsdGVyLWFyZWFdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmVhID0gcGFyc2VGbG9hdCgkKHRoaXMpLmRhdGEoJ2ZpbHRlci1hcmVhJykpO1xyXG4gICAgICAgICAgICBpZiAoIWFyZWFNaW4gfHwgYXJlYSA8IGFyZWFNaW4pIHtcclxuICAgICAgICAgICAgICAgIGFyZWFNaW4gPSBNYXRoLmZsb29yKGFyZWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghYXJlYU1heCB8fCBhcmVhID4gYXJlYU1heCkge1xyXG4gICAgICAgICAgICAgICAgYXJlYU1heCA9IE1hdGguY2VpbChhcmVhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1wcmljZV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHByaWNlID0gcGFyc2VJbnQoJCh0aGlzKS5kYXRhKCdmaWx0ZXItcHJpY2UnKSk7XHJcbiAgICAgICAgICAgIGlmICghcHJpY2VNaW4gfHwgcHJpY2UgPCBwcmljZU1pbikge1xyXG4gICAgICAgICAgICAgICAgcHJpY2VNaW4gPSBwcmljZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXByaWNlTWF4IHx8IHByaWNlID4gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4ID0gcHJpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWluXCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWluKS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cImFyZWFfbWF4XCJdJykuYXR0cigndmFsdWUnLCBhcmVhTWF4KS5hdHRyKCdtaW4nLCBhcmVhTWluKS5hdHRyKCdtYXgnLCBhcmVhTWF4KTtcclxuICAgICAgICAkZm9ybS5maW5kKCdbbmFtZT1cInByaWNlX21pblwiXScpLmF0dHIoJ3ZhbHVlJywgcHJpY2VNaW4pLmF0dHIoJ21pbicsIHByaWNlTWluKS5hdHRyKCdtYXgnLCBwcmljZU1heCk7XHJcbiAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJwcmljZV9tYXhcIl0nKS5hdHRyKCd2YWx1ZScsIHByaWNlTWF4KS5hdHRyKCdtaW4nLCBwcmljZU1pbikuYXR0cignbWF4JywgcHJpY2VNYXgpO1xyXG4gICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCRpdGVtcy5maWx0ZXIoJ1tkYXRhLWZpbHRlci1yb29tcz1cIicgKyAkKHRoaXMpLnZhbCgpICsgJ1wiXScpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNsaWRlclByaWNlLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICBwcmljZU1pbixcclxuICAgICAgICAgICAgICAgIHByaWNlTWF4XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAnbWluJzogcHJpY2VNaW4sXHJcbiAgICAgICAgICAgICAgICAnbWF4JzogcHJpY2VNYXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHRydWUgLy8gQm9vbGVhbiAnZmlyZVNldEV2ZW50J1xyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICBzbGlkZXJBcmVhLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgIHN0YXJ0OiBbXHJcbiAgICAgICAgICAgICAgICBhcmVhTWluLFxyXG4gICAgICAgICAgICAgICAgYXJlYU1heFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgJ21pbic6IGFyZWFNaW4sXHJcbiAgICAgICAgICAgICAgICAnbWF4JzogYXJlYU1heFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdHJ1ZSAvLyBCb29sZWFuICdmaXJlU2V0RXZlbnQnXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAkZm9ybS5maW5kKCdpbnB1dCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBmb3JtRGF0YSA9ICRmb3JtLnNlcmlhbGl6ZUFycmF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYTogW2FyZWFNaW4sIGFyZWFNYXhdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogW3ByaWNlTWluLCBwcmljZU1heF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZm9ybURhdGEpO1xyXG4gICAgICAgICAgICAkLmVhY2goZm9ybURhdGEsIGZ1bmN0aW9uIChuLCB2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdhcmVhX21pbicgJiYgdi52YWx1ZSAhPSBhcmVhTWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5hcmVhWzBdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdhcmVhX21heCcgJiYgdi52YWx1ZSAhPSBhcmVhTWF4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycy5hcmVhWzFdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdwcmljZV9taW4nICYmIHYudmFsdWUgIT0gcHJpY2VNaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnByaWNlWzBdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdwcmljZV9tYXgnICYmIHYudmFsdWUgIT0gcHJpY2VNYXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnByaWNlWzFdID0gcGFyc2VJbnQodi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodi5uYW1lID09ICdyb29tcycpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzLnJvb21zLnB1c2godi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5hcmVhWzBdID09IGFyZWFNaW4gJiYgZmlsdGVycy5hcmVhWzFdID09IGFyZWFNYXgpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZmlsdGVycy5hcmVhO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVycy5wcmljZVswXSA9PSBwcmljZU1pbiAmJiBmaWx0ZXJzLnByaWNlWzFdID09IHByaWNlTWF4KVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGZpbHRlcnMucHJpY2U7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLnJvb21zLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGZpbHRlcnMucm9vbXM7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2coZmlsdGVycyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoZmlsdGVycykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuYWRkQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IHRydWUsICRfaXRlbSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGZpbHRlcnMsIGZ1bmN0aW9uIChrLCB2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYXJlYSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoJF9pdGVtLmRhdGEoJ2ZpbHRlci1hcmVhJykpICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJlYSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLWFyZWEnKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJlYSA8IHZbMF0gfHwgYXJlYSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3ByaWNlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpICE9PSAndW5kZWZpbmVkJyAmJiAkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IE1hdGgucm91bmQocGFyc2VGbG9hdCgkX2l0ZW0uZGF0YSgnZmlsdGVyLXByaWNlJykpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaWNlIDwgdlswXSB8fCBwcmljZSA+IHZbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Jvb21zJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mICgkX2l0ZW0uZGF0YSgnZmlsdGVyLXJvb21zJykpID09PSAndW5kZWZpbmVkJyB8fCB2LmluZGV4T2YoJF9pdGVtLmRhdGEoJ2ZpbHRlci1yb29tcycpLnRvU3RyaW5nKCkpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ19maWx0ZXJlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldENoZXNzVG90YWwoJGl0ZW1zLmxlbmd0aCAtICRpdGVtcy5maWx0ZXIoJy5fZmlsdGVyZWQnKS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGl0ZW1zLnJlbW92ZUNsYXNzKCdfZmlsdGVyZWQnKTtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDaGVzc1RvdGFsKHRvdGFsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gaGFuZGxlIGdldCBmaWx0ZXJzXHJcbiAgICAgICAgdmFyIGZpbHRlcnMgPSB7fSwgaGFzaCwgaGFzaGVzO1xyXG4gICAgICAgIGhhc2hlcyA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKSk7XHJcbiAgICAgICAgaWYgKGhhc2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaGFzaGVzID0gaGFzaGVzLnNwbGl0KCcmJyk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gaGFzaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzaGVzLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFzaFsxXSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzW2hhc2hbMF1dID0gaGFzaFsxXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZmlsdGVycyk7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXJzLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVycy5rb21uYXRueWUpICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGZvcm0uZmluZCgnW25hbWU9XCJyb29tc1wiXScpLmZpbHRlcignW3ZhbHVlPVwiJyArIGZpbHRlcnMua29tbmF0bnllICsgJ1wiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8YXJlYSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmVhID0gZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxhcmVhJ10uc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXJBcmVhLm5vVWlTbGlkZXIuc2V0KGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoZmlsdGVyc1snYXBwY2hlc3NyZXNpZGVudGlhbHxwcmljZSddKSAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmljZSA9IGZpbHRlcnNbJ2FwcGNoZXNzcmVzaWRlbnRpYWx8cHJpY2UnXS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlclByaWNlLm5vVWlTbGlkZXIuc2V0KHByaWNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoJ1tuYW1lPVwicm9vbXNcIl0nKS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENoZXNzVG90YWw6IGZ1bmN0aW9uICh0b3RhbCkge1xyXG4gICAgICAgIHZhciBlbmRpbmdzID0gWyfQutCy0LDRgNGC0LjRgNCwJywgJ9C60LLQsNGA0YLQuNGA0YsnLCAn0LrQstCw0YDRgtC40YAnXTtcclxuICAgICAgICAkKCcuanMtY2hlc3MtZmlsdGVyX190b3RhbCcpLnRleHQodG90YWwgKyAnICcgKyBhcHAuZ2V0TnVtRW5kaW5nKHRvdGFsLCBlbmRpbmdzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0KTRg9C90LrRhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QutC+0L3Rh9Cw0L3QuNC1INC00LvRjyDQvNC90L7QttC10YHRgtCy0LXQvdC90L7Qs9C+INGH0LjRgdC70LAg0YHQu9C+0LLQsCDQvdCwINC+0YHQvdC+0LLQsNC90LjQuCDRh9C40YHQu9CwINC4INC80LDRgdGB0LjQstCwINC+0LrQvtC90YfQsNC90LjQuVxyXG4gICAgICogcGFyYW0gIGlOdW1iZXIgSW50ZWdlciDQp9C40YHQu9C+INC90LAg0L7RgdC90L7QstC1INC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDRgdGE0L7RgNC80LjRgNC+0LLQsNGC0Ywg0L7QutC+0L3Rh9Cw0L3QuNC1XHJcbiAgICAgKiBwYXJhbSAgYUVuZGluZ3MgQXJyYXkg0JzQsNGB0YHQuNCyINGB0LvQvtCyINC40LvQuCDQvtC60L7QvdGH0LDQvdC40Lkg0LTQu9GPINGH0LjRgdC10LsgKDEsIDQsIDUpLFxyXG4gICAgICogICAgICAgICDQvdCw0L/RgNC40LzQtdGAIFsn0Y/QsdC70L7QutC+JywgJ9GP0LHQu9C+0LrQsCcsICfRj9Cx0LvQvtC6J11cclxuICAgICAqIHJldHVybiBTdHJpbmdcclxuICAgICAqIFxyXG4gICAgICogaHR0cHM6Ly9oYWJyYWhhYnIucnUvcG9zdC8xMDU0MjgvXHJcbiAgICAgKi9cclxuICAgIGdldE51bUVuZGluZzogZnVuY3Rpb24gKGlOdW1iZXIsIGFFbmRpbmdzKSB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxualF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRHYWxsZXJ5KCk7XHJcbiAgICAgICAgaW5pdEh5cG90aGVjKCk7XHJcbiAgICAgICAgaW5pdERhdGVwaWNrZXIoKTtcclxuICAgICAgICBpbml0U2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgaW5pdFNjcm9sbCgpO1xyXG4gICAgICAgIGluaXRBYm91dCgpO1xyXG4gICAgICAgIGluaXRGaWxlaW5wdXQoKTtcclxuICAgICAgICBpbml0QWxwaGFiZXQoKTtcclxuICAgICAgICBpbml0QW50aXNwYW0oKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICB2YXIgJGJhciA9ICQoJy5qcy1tYWluLXNsaWRlci1iYXInKSxcclxuICAgICAgICAgICAgICAgICRzbGljayA9ICQoJy5qcy1zbGlkZXItbWFpbicpLFxyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcjpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcicpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5hZ2VudHMtc2xpZGVyX19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLWFnZW50cy1zbGlkZXInKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1hZ2VudHMtc2xpZGVyIC5fYWN0aXZlIC5qcy1hZ2VudHMtc2xpZGVyX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLWFnZW50cy1zbGlkZXJfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHMoKV0vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIG1haWwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbWFpbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtYWdlbnRzLXNsaWRlcl9fZnVsbF9fbWFpbCBhJykudGV4dChtYWlsKS5hdHRyKCdocmVmJywgJ21haWx0bzonICsgbWFpbCk7XHJcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYWdlbnQuZGF0YSgnYWdlbnQtdXJsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1hZ2VudHMtc2xpZGVyX19mdWxsX191cmwgYScpLmF0dHIoJ2hyZWYnLCB1cmwpO1xyXG4gICAgICAgICAgICAkKCcuanMtYWdlbnRzLXNsaWRlcl9fdXJsJykuYXR0cignaHJlZicsIHVybCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXJbaHJlZj1cIicgKyBocmVmICsgJ1wiXScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoaHJlZikudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUuX2FjdGl2ZScpLmxlbmd0aCA9PSAwID8gJCgnLmpzLW1lbnUtb3ZlcmxheScpLmhpZGUoKSA6ICQoJy5qcy1tZW51LW92ZXJsYXknKS5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LXRvZ2dsZXIsIC5qcy1tZW51JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJy5qcy1tYXNrX190ZWwnKS5pbnB1dG1hc2soe1xyXG4gICAgICAgICAgICBtYXNrOiAnKzkgKDk5OSkgOTk5LTk5LTk5J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIElucHV0bWFzay5leHRlbmRBbGlhc2VzKHtcclxuICAgICAgICAgICAgJ251bWVyaWMnOiB7XHJcbiAgICAgICAgICAgICAgICBhdXRvVW5tYXNrOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2hvd01hc2tPbkhvdmVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJhZGl4UG9pbnQ6IFwiLFwiLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTZXBhcmF0b3I6IFwiIFwiLFxyXG4gICAgICAgICAgICAgICAgZGlnaXRzOiAwLFxyXG4gICAgICAgICAgICAgICAgYWxsb3dNaW51czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhdXRvR3JvdXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByaWdodEFsaWduOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fbnVtZXJpYycpLmlucHV0bWFzayhcIm51bWVyaWNcIik7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX2N1cnJlbmN5JykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0LzCsidcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fc3F1YXJlX2ZpbHRlcicpLmlucHV0bWFzayhcIm51bWVyaWNcIiwge1xyXG4gICAgICAgICAgICBzdWZmaXg6ICfCoNC8wrInLFxyXG4gICAgICAgICAgICB1bm1hc2tBc051bWJlcjogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3lfZmlsdGVyJykuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgIHN1ZmZpeDogJ8Kg0YDRg9CxLicsXHJcbiAgICAgICAgICAgIHVubWFza0FzTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tYXNrX19hZ2UnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnwqDQu9C10YInXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1hc2tfX3BlcmNlbnQnKS5pbnB1dG1hc2soXCJudW1lcmljXCIsIHtcclxuICAgICAgICAgICAgc3VmZml4OiAnJSdcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWFza19fY3VycmVuY3ksIC5qcy1tYXNrX19zcXVhcmUsIC5qcy1tYXNrX19wZXJjZW50Jykub24oJ2JsdXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIG5lZWQgZm9yIHJlbW92ZSBzdWZmaXhcclxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL1JvYmluSGVyYm90cy9JbnB1dG1hc2svaXNzdWVzLzE1NTFcclxuICAgICAgICAgICAgdmFyIHYgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICBpZiAodiA9PSAwIHx8IHYgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykudmFsKCcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYXV0b0ZvY3VzOiBmYWxzZSxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0b3VjaDogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcuanMtcG9wdXAnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQuZmFuY3lib3guY2xvc2UoKTtcclxuICAgICAgICB9KS5mYW5jeWJveChvcHRpb25zKTtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcclxuICAgICAgICAgICAgdmFyICRjbnQgPSAkKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcclxuICAgICAgICAgICAgaWYgKCRjbnQubGVuZ3RoICYmICRjbnQuaGFzQ2xhc3MoJ3BvcHVwLWNudCcpKSB7XHJcbiAgICAgICAgICAgICAgICAkLmZhbmN5Ym94Lm9wZW4oJGNudCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNlbGVjdCgpIHtcclxuICAgICAgICAvLyBzZWxlY3QyXHJcbiAgICAgICAgJC5mbi5zZWxlY3QyLmRlZmF1bHRzLnNldChcInRoZW1lXCIsIFwiY3VzdG9tXCIpO1xyXG4gICAgICAgICQuZm4uc2VsZWN0Mi5kZWZhdWx0cy5zZXQoXCJtaW5pbXVtUmVzdWx0c0ZvclNlYXJjaFwiLCBJbmZpbml0eSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0MigpO1xyXG4gICAgICAgIH0pO1xyXG4vLyAgICAgICAgJCgnLmpzLXNlbGVjdDInKS5zZWxlY3QyKCdvcGVuJyk7XHJcbiAgICAgICAgJChcIi5qcy1hZ2VudC1zZWFyY2hcIikuc2VsZWN0Mih7XHJcbiAgICAgICAgICAgIHRoZW1lOiAnYWdlbnRzJyxcclxuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgbGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIGlucHV0VG9vU2hvcnQ6IGZ1bmN0aW9uIChhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwi0J/QvtC20LDQu9GD0LnRgdGC0LAsINCy0LLQtdC00LjRgtC1IFwiICsgKGEubWluaW11bSAtIGEuaW5wdXQubGVuZ3RoKSArIFwiINC40LvQuCDQsdC+0LvRjNGI0LUg0YHQuNC80LLQvtC70L7QslwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhamF4OiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkubXlqc29uLmNvbS9iaW5zL29reXZpXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgZGVsYXk6IDI1MCxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxOiBwYXJhbXMudGVybSwgLy8gc2VhcmNoIHRlcm1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnYWdlbnRfc2VhcmNoJ1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbi8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0cyA9ICQubWFwKGRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDoga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdmFsdWUucGFnZXRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbnQ6IHZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiByZXN1bHRzLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVSZXN1bHQ6IGZvcm1hdFJlc3VsdCxcclxuICAgICAgICAgICAgdGVtcGxhdGVTZWxlY3Rpb246IGZvcm1hdFNlbGVjdGlvbixcclxuICAgICAgICAgICAgZXNjYXBlTWFya3VwOiBmdW5jdGlvbiAobWFya3VwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya3VwO1xyXG4gICAgICAgICAgICB9LCAvLyBsZXQgb3VyIGN1c3RvbSBmb3JtYXR0ZXIgd29ya1xyXG4gICAgICAgICAgICBtaW5pbXVtSW5wdXRMZW5ndGg6IDMsXHJcbiAgICAgICAgICAgIG1heGltdW1TZWxlY3Rpb25MZW5ndGg6IDEsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0UmVzdWx0KGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ubG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICfQv9C+0LjRgdC64oCmJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzZWxlY3QyLXJlc3VsdC1hZ2VudFwiPjxzdHJvbmc+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5hZ2VudC5wYWdldGl0bGUgKyAnPC9zdHJvbmc+PGJyPicgKyBpdGVtLmFnZW50LnZhbHVlICsgJzwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFNlbGVjdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmFnZW50LnBhZ2V0aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWFnZW50LXNlYXJjaCcpLm9uKCdzZWxlY3QyOnNlbGVjdCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5wYXJhbXMuZGF0YTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZGF0YS5hZ2VudC51cmlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VmFsaWRhdGUoKSB7XHJcbiAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKFwicGhvbmVcIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKGVsZW1lbnQpIHx8IC9eXFwrXFxkXFxzXFwoXFxkezN9XFwpXFxzXFxkezN9LVxcZHsyfS1cXGR7Mn0kLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICB9LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge30sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCJwaG9uZVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy12YWxpZGF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnZhbGlkYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHlGaWx0ZXJzKCkge1xyXG4gICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10eXBlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdGl0bGUnKS50ZXh0KCQodGhpcykuZGF0YSgnZmlsdGVycy10aXRsZScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgaWYgKCQoJy5qcy1wYXNzd29yZCcpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kcm9wYm94L3p4Y3ZiblxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogXCIuL2pzL2xpYnMvenhjdmJuLmpzXCIsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcInNjcmlwdFwiLFxyXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZShmdW5jdGlvbiAoc2NyaXB0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uIChqcXhociwgc2V0dGluZ3MsIGV4Y2VwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBsb2FkaW5nIHp4Y3ZibicpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHp4Y3ZibikgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCkudHJpbSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSB6eGN2Ym4odmFsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY250ID0gJCh0aGlzKS5zaWJsaW5ncygnLmlucHV0LWhlbHAnKTtcclxuICAgICAgICAgICAgICAgIGNudC5yZW1vdmVDbGFzcygnXzAgXzEgXzIgXzMgXzQnKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY250LmFkZENsYXNzKCdfJyArIHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5zY29yZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5rZXl1cCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmV2aWV3c1NsaWRlcigpIHtcclxuICAgICAgICB2YXIgJHNsaWRlciA9ICQoJy5qcy1zbGlkZXItcmV2aWV3cycpO1xyXG4gICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcclxuICAgICAgICAgICAgZG90c0NsYXNzOiAnc2xpY2stZG90cyBfYmlnJyxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50LmxnLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciAkYmlnID0gJCgnLnJldmlld3NfX2xpc3QuX2JpZyAucmV2aWV3c19fbGlzdF9faXRlbScpO1xyXG4gICAgICAgIHZhciBjdXJyZW50ID0gMDtcclxuICAgICAgICBpZiAoJGJpZy5sZW5ndGggJiYgJHNsaWRlci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICRzbGlkZXJcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckJpZygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50U2xpZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgIT0gY3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJCaWcoKSB7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZU91dCgpLmVtcHR5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJpZygpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1yZXZpZXdzIC5zbGljay1jdXJyZW50IC5yZXZpZXdzX19saXN0X19pdGVtX19pbm5lcicpLmNsb25lKCkuYXBwZW5kVG8oJGJpZyk7XHJcbiAgICAgICAgICAgICRiaWcuZmFkZUluKCk7XHJcbiAgICAgICAgICAgICRiaWcucGFyZW50KCkuY3NzKCdoZWlnaHQnLCAkYmlnLm91dGVySGVpZ2h0KHRydWUpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eSgpIHtcclxuICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3Bkb3BhZ2VfbG9hZCcsIGZ1bmN0aW9uIChlLCBjb25maWcsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKGRvY3VtZW50KS5vbignbXNlMl9sb2FkJywgZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgaW5pdCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJbZGF0YS1pbml0PVwiZmFsc2VcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdG9nZ2xlcnMgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2ltZy13cmFwcGVyJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGNvdW50ZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXJfX2NvdW50ZXInKTtcclxuICAgICAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdG9nZ2xlcnMucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkY291bnRlci50ZXh0KGkgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdpbml0JywgJ3RydWUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHYWxsZXJ5KCkge1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5LW5hdicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogdHJ1ZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDYsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1nYWxsZXJ5X19zbGlkZXInLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1nYWxsZXJ5JykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgdmFyICRzbGlkZXIgPSAkKGVsKS5maW5kKCcuanMtZ2FsbGVyeV9fc2xpZGVyJyk7XHJcbiAgICAgICAgICAgIHZhciAkY3VycmVudCA9ICQoZWwpLmZpbmQoJy5qcy1nYWxsZXJ5X19jdXJyZW50Jyk7XHJcbiAgICAgICAgICAgICRzbGlkZXIuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN3aXBlVG9TbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFzTmF2Rm9yOiAnLmpzLWdhbGxlcnktbmF2JyxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzbGlkZXIub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkY3VycmVudC50ZXh0KCsrY3VycmVudFNsaWRlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciAkbGlua3MgPSAkc2xpZGVyLmZpbmQoJy5zbGlkZTpub3QoLnNsaWNrLWNsb25lZCknKTtcclxuICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWdhbGxlcnlfX3RvdGFsJykudGV4dCgkbGlua3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgJGxpbmtzLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkbGlua3MsIHtcclxuICAgICAgICAgICAgICAgICAgICBsb29wOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LCAkbGlua3MuaW5kZXgodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQpNGD0L3QutGG0LjRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvtC60L7QvdGH0LDQvdC40LUg0LTQu9GPINC80L3QvtC20LXRgdGC0LLQtdC90L3QvtCz0L4g0YfQuNGB0LvQsCDRgdC70L7QstCwINC90LAg0L7RgdC90L7QstCw0L3QuNC4INGH0LjRgdC70LAg0Lgg0LzQsNGB0YHQuNCy0LAg0L7QutC+0L3Rh9Cw0L3QuNC5XHJcbiAgICAgKiBwYXJhbSAgaU51bWJlciBJbnRlZ2VyINCn0LjRgdC70L4g0L3QsCDQvtGB0L3QvtCy0LUg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INGB0YTQvtGA0LzQuNGA0L7QstCw0YLRjCDQvtC60L7QvdGH0LDQvdC40LVcclxuICAgICAqIHBhcmFtICBhRW5kaW5ncyBBcnJheSDQnNCw0YHRgdC40LIg0YHQu9C+0LIg0LjQu9C4INC+0LrQvtC90YfQsNC90LjQuSDQtNC70Y8g0YfQuNGB0LXQuyAoMSwgNCwgNSksXHJcbiAgICAgKiAgICAgICAgINC90LDQv9GA0LjQvNC10YAgWyfRj9Cx0LvQvtC60L4nLCAn0Y/QsdC70L7QutCwJywgJ9GP0LHQu9C+0LonXVxyXG4gICAgICogcmV0dXJuIFN0cmluZ1xyXG4gICAgICogXHJcbiAgICAgKiBodHRwczovL2hhYnJhaGFici5ydS9wb3N0LzEwNTQyOC9cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0TnVtRW5kaW5nKGlOdW1iZXIsIGFFbmRpbmdzKSB7XHJcbiAgICAgICAgdmFyIHNFbmRpbmcsIGk7XHJcbiAgICAgICAgaU51bWJlciA9IGlOdW1iZXIgJSAxMDA7XHJcbiAgICAgICAgaWYgKGlOdW1iZXIgPj0gMTEgJiYgaU51bWJlciA8PSAxOSkge1xyXG4gICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSA9IGlOdW1iZXIgJSAxMDtcclxuICAgICAgICAgICAgc3dpdGNoIChpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgxKTpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICgyKTpcclxuICAgICAgICAgICAgICAgIGNhc2UgKDMpOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAoNCk6XHJcbiAgICAgICAgICAgICAgICAgICAgc0VuZGluZyA9IGFFbmRpbmdzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBzRW5kaW5nID0gYUVuZGluZ3NbMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNFbmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEh5cG90aGVjKCkge1xyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlYycpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJGNvc3QgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fY29zdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvc3QgPSAkY29zdC52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFBlcmNlbnQgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGF5bWVudC1wZXJjZW50JyksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBheW1lbnRTdW0gPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGF5bWVudC1zdW0nKSxcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bVBpY2tlciA9ICQodGhpcykuZmluZCgnLmpzLXBpY2tlcl9fdGFyZ2V0JylbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJGFnZSA9ICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19hZ2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAkY3JlZGl0ID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2NyZWRpdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICRzbGlkZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fc2xpZGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX2l0ZW0nKSxcclxuICAgICAgICAgICAgICAgICAgICAkc2Nyb2xsID0gJCh0aGlzKS5maW5kKCcuanMtaHlwb3RoZWNfX3Njcm9sbCcpO1xyXG4gICAgICAgICAgICB2YXIgcmF0ZSA9IFtdO1xyXG4gICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlLnB1c2gocGFyc2VGbG9hdCgkKHRoaXMpLmZpbmQoJy5qcy1oeXBvdGhlY19fcmF0ZScpLnRleHQoKS5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIHx8IDApO1xyXG4gICAgICAgICAgICB9KTtcclxuLy8gICAgICAgICAgICBjb25zb2xlLmxvZyhyYXRlKTtcclxuICAgICAgICAgICAgdmFyIHJhdGVNRSA9IFtdO1xyXG4gICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByYXRlTUUucHVzaChwYXJzZUZsb2F0KCQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19yYXRlTUUnKS50ZXh0KCkucmVwbGFjZShcIixcIiwgXCIuXCIpKSB8fCAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbi8vICAgICAgICAgICAgY29uc29sZS5sb2cocmF0ZU1FKTtcclxuICAgICAgICAgICAgdmFyIGNyZWRpdCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBhZ2UgPSAkYWdlLnZhbCgpO1xyXG4gICAgICAgICAgICB2YXIgcGVyY2VudDtcclxuICAgICAgICAgICAgJGNvc3QuaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICAgICAgb25jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvc3QgPSAkKHRoaXMpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtLnByb3AoJ21heCcsIGNvc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwYXltZW50U3VtUGlja2VyLm5vVWlTbGlkZXIudXBkYXRlT3B0aW9ucyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWluJzogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXgnOiBjb3N0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAkcGF5bWVudFN1bS50cmlnZ2VyKCdjaGFuZ2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRwYXltZW50U3VtLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJjZW50ID0gJCh0aGlzKS52YWwoKSAqIDEwMCAvIGNvc3Q7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudCA+IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnQgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS52YWwoY29zdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcmVkaXQgPSBjYWxjQ3JlZGl0KGNvc3QsIHBlcmNlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHBheW1lbnRQZXJjZW50LnZhbChwZXJjZW50KTtcclxuICAgICAgICAgICAgICAgICRjcmVkaXQudmFsKGNyZWRpdCk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2ZpcnN0JykudGV4dChmb3JtYXRQcmljZSgkcGF5bWVudFN1bS52YWwoKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fcGVybW9udGgnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoTUUnKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWwpLmZpbmQoJy5qcy1oeXBvdGhlY19fZWNvbm9teScpLnRleHQoZm9ybWF0UHJpY2UoY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZVtpXSwgYWdlKSAqIDEyICogYWdlIC0gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZU1FW2ldLCBhZ2UpICogMTIgKiBhZ2UpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0uaW5wdXRtYXNrKFwibnVtZXJpY1wiLCB7XHJcbiAgICAgICAgICAgICAgICBzdWZmaXg6ICfCoNGA0YPQsS4nLFxyXG4gICAgICAgICAgICAgICAgb25jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXBpY2tlcicpLmZpbmQoJy5qcy1waWNrZXJfX3RhcmdldCcpWzBdLm5vVWlTbGlkZXIuc2V0KCQodGhpcykudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHBheW1lbnRTdW0udHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgICRhZ2Uub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFnZSA9ICRhZ2UudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX3Blcm1vbnRoJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlW2ldLCBhZ2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJChlbCkuZmluZCgnLmpzLWh5cG90aGVjX19wZXJtb250aE1FJykudGV4dChmb3JtYXRQcmljZShjYWxjUGVyTW9udGgoY3JlZGl0LCByYXRlTUVbaV0sIGFnZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAkKGVsKS5maW5kKCcuanMtaHlwb3RoZWNfX2Vjb25vbXknKS50ZXh0KGZvcm1hdFByaWNlKGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVbaV0sIGFnZSkgKiAxMiAqIGFnZSAtIGNhbGNQZXJNb250aChjcmVkaXQsIHJhdGVNRVtpXSwgYWdlKSAqIDEyICogYWdlKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY3JvbGwuZmluZCgnLmh5cG90aGVjX19saXN0X19pdGVtJykuZWFjaChmdW5jdGlvbiAoaSkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuaHlwb3RoZWNfX2xpc3RfX2l0ZW1fX2lubmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWRlci5zbGljaygnc2xpY2tHb1RvJywgaSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGZpbHRlcnMsINC60LDQttC00YvQuSDRgdC10LvQtdC60YIg0YTQuNC70YzRgtGA0YPQtdGCINC+0YLQtNC10LvRjNC90L5cclxuICAgICAgICAgICAgdmFyIHN0eWxlID0gW107XHJcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLmpzLWh5cG90aGVjX19maWx0ZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmTmFtZSA9ICQodGhpcykuZGF0YSgnaHlwb3RoZWMtZmlsdGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9ICdmaWx0ZXItJyArIGZOYW1lO1xyXG4gICAgICAgICAgICAgICAgc3R5bGUucHVzaCgnLicgKyBjbGFzc05hbWUgKyAne2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50fScpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRjaGVja2JveGVzID0gJCh0aGlzKS5maW5kKCdpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xyXG4gICAgICAgICAgICAgICAgJGNoZWNrYm94ZXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJGNoZWNrZWQgPSAkY2hlY2tib3hlcy5maWx0ZXIoJzpjaGVja2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRjaGVja2VkLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGYgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGNoZWNrZWQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLnB1c2goJzpub3QoW2RhdGEtZmlsdGVyLScgKyAkKHRoaXMpLnZhbCgpICsgJ10pJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZmlsdGVyKCcuanMtaHlwb3RoZWNfX2l0ZW0nICsgZi5qb2luKCcnKSkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkaXRlbXMucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJzxzdHlsZT4nICsgc3R5bGUuam9pbignJykgKyAnPC9zdHlsZT4nKS5hcHBlbmRUbygnaGVhZCcpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1BheW1lbnQoY29zdCwgcGVyY2VudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY0NyZWRpdChjb3N0LCBwZXJjZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0IC0gTWF0aC5jZWlsKGNvc3QgKiBwZXJjZW50IC8gMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY1Blck1vbnRoKGNyZWRpdCwgcmF0ZSwgYWdlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwoY3JlZGl0ICogKChyYXRlIC8gMTIwMC4wKSAvICgxLjAgLSBNYXRoLnBvdygxLjAgKyByYXRlIC8gMTIwMC4wLCAtKGFnZSAqIDEyKSkpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcm1hdFByaWNlKHByaWNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmljZS50b1N0cmluZygpLnJlcGxhY2UoLy4vZywgZnVuY3Rpb24gKGMsIGksIGEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpICYmIGMgIT09IFwiLlwiICYmICEoKGEubGVuZ3RoIC0gaSkgJSAzKSA/ICcgJyArIGMgOiBjO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJCgnLmpzLWh5cG90aGVjX19zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIG1vYmlsZUZpcnN0OiB0cnVlLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQgLSAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1oeXBvdGhlY19fc2hvdy1idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcykucGFyZW50cygnLmpzLWh5cG90aGVjJykuZmluZCgnLmpzLWh5cG90aGVjX19zaG93LXRhcmdldCcpO1xyXG4gICAgICAgICAgICBpZiAoJHQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHQub2Zmc2V0KCkudG9wIC0gNDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnLmhlYWRlcl9fbWFpbicpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSAkKCcuaGVhZGVyX19tYWluJykub3V0ZXJIZWlnaHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBvZmZzZXR9LCAzMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERhdGVwaWNrZXIoKSB7XHJcbiAgICAgICAgdmFyIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGNvbW1vbk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAndG9wIGxlZnQnLFxyXG4gICAgICAgICAgICBvblNob3c6IGZ1bmN0aW9uIChpbnN0LCBhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25Db21wbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlcGlja2VyVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uSGlkZTogZnVuY3Rpb24gKGluc3QsIGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkNvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVwaWNrZXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoZm9ybWF0dGVkRGF0ZSwgZGF0ZSwgaW5zdCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdC4kZWwudHJpZ2dlcignY2hhbmdlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlcicpLmRhdGVwaWNrZXIoT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIHRpbWVwaWNrZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGVUaW1lU2VwYXJhdG9yOiAnLCAnLFxyXG4gICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAkKCcuanMtZGF0ZXBpY2tlci1yYW5nZScpLmVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgICAgIHZhciBtaW4gPSBuZXcgRGF0ZSgkKHRoaXMpLmRhdGEoJ21pbicpKSB8fCBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IG5ldyBEYXRlKCQodGhpcykuZGF0YSgnbWF4JykpIHx8IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcihPYmplY3QuYXNzaWduKHtcclxuICAgICAgICAgICAgICAgIG1pbkRhdGU6IG1pbixcclxuICAgICAgICAgICAgICAgIG1heERhdGU6IG1heCxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbXVsdGlwbGVEYXRlc1NlcGFyYXRvcjogJyAtICcsXHJcbiAgICAgICAgICAgIH0sIGNvbW1vbk9wdGlvbnMpKTtcclxuICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKHRoaXMpLmRhdGEoJ2RhdGVwaWNrZXInKTtcclxuICAgICAgICAgICAgZGF0ZXBpY2tlci5zZWxlY3REYXRlKFttaW4sIG1heF0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1kYXRldGltZXBpY2tlciwgLmpzLWRhdGVwaWNrZXItcmFuZ2UnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlcGlja2VyVmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGVwaWNrZXIgPSAkKCcuanMtZGF0ZXRpbWVwaWNrZXIsIC5qcy1kYXRlcGlja2VyLXJhbmdlJykuZGF0YSgnZGF0ZXBpY2tlcicpO1xyXG4gICAgICAgICAgICAgICAgZGF0ZXBpY2tlci5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2Nyb2xsYmFyKCkge1xyXG4gICAgICAgICQoJy5qcy1zY3JvbGxiYXInKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB2YXIgdyA9ICQod2luZG93KS5vdXRlcldpZHRoKCk7XHJcbiAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItc20tbWQnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLXNtLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kICYmIHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh3ID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbWQtbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHcgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1sZycpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbScpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50LmxnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHcgPCBhcHBDb25maWcuYnJlYWtwb2ludC5sZykge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1zbS1tZCcpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nyb2xsYmFyLW1kLWxnJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICQoJy5qcy1zY3JvbGxiYXItbGcnKS5zY3JvbGxiYXIoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4vLyAgICAgICAgJCgnLmpzLXNjcm9sbGJhci1ob3QnKS5zY3JvbGxiYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtC60YDRg9GC0LrQsCDQv9C+INGB0YHRi9C70LrQtSDQtNC+INGN0LvQtdC80LXQvdGC0LBcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdFNjcm9sbCgpIHtcclxuICAgICAgICAkKCcuanMtc2Nyb2xsJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoJCh0aGlzKS5hdHRyKCdocmVmJykpO1xyXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIDQwO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXJfX21haW4nKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcl9fbWFpbicpLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCQoJy5oZWFkZXInKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gJCgnLmhlYWRlcicpLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtzY3JvbGxUb3A6IG9mZnNldH0sIDMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluaXRBYm91dCgpIHtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA1LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgdmVydGljYWw6IHRydWUsXHJcbiAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtYWJvdXQtaHlzdG9yeV9fY29udGVudC1zbGlkZXInLFxyXG4gICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBtb2JpbGVGaXJzdDogdHJ1ZSxcclxuICAgICAgICAgICAgcmVzcG9uc2l2ZTogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IGFwcENvbmZpZy5icmVha3BvaW50Lm1kIC0gMSxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnNzBweCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtYWJvdXQtaHlzdG9yeV9feWVhci1zbGlkZXInKS5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fc2libGluZycpLnJlbW92ZUNsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkubmV4dCgpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkucHJldigpLmFkZENsYXNzKCdfc2libGluZycpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1hYm91dC1oeXN0b3J5X19jb250ZW50LXNsaWRlcicpLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICBmYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBhc05hdkZvcjogJy5qcy1hYm91dC1oeXN0b3J5X195ZWFyLXNsaWRlcicsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZpbGVpbnB1dCgpIHtcclxuICAgICAgICAkKCcuanMtZmlsZWlucHV0X19jbnQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdkZWZhdWx0JywgJCh0aGlzKS50ZXh0KCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1maWxlaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaWxlTmFtZSA9ICQodGhpcykudmFsKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLmpzLWZpbGVpbnB1dF9fY250JykudGV4dChmaWxlTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QW50aXNwYW0oKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9XCJlbWFpbDNcIl0saW5wdXRbbmFtZT1cImluZm9cIl0saW5wdXRbbmFtZT1cInRleHRcIl0nKS5hdHRyKCd2YWx1ZScsICcnKS52YWwoJycpO1xyXG4gICAgICAgIH0sIDUwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBbHBoYWJldCgpIHtcclxuICAgICAgICAkKCcuanMtYWxwaGFiZXQgaW5wdXQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtYWxwaGFiZXQgbGknKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5wcm9wKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWFscGhhYmV0IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQoJy5qcy1hbHBoYWJldCBsaScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnbGknKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1TZWFyY2gyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgbVNlYXJjaDIucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zjg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaUlpd2ljMjkxY21ObGN5STZXeUpqYjIxdGIyNHVhbk1pWFN3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWFsRjFaWEo1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lGd2lkWE5sSUhOMGNtbGpkRndpTzF4eVhHNWNjbHh1SUNBZ0lDUW9aRzlqZFcxbGJuUXBMbkpsWVdSNUtHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dVhISmNiaUFnSUNCOUtUdGNjbHh1SUNBZ0lGeHlYRzU5S1RzaVhTd2labWxzWlNJNkltTnZiVzF2Ymk1cWN5SjlcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpSkNoa2IyTjFiV1Z1ZENrdWNtVmhaSGtvWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ1lYQndMbWx1YVhScFlXeHBlbVVvS1R0Y2NseHVmU2s3WEhKY2JseHlYRzUyWVhJZ1lYQndJRDBnZTF4eVhHNGdJQ0FnYVc1cGRHbGhiR2w2WldRNklHWmhiSE5sTEZ4eVhHNWNjbHh1SUNBZ0lHbHVhWFJwWVd4cGVtVTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWtLQ2N1YW5NdGFHbGtaUzFsYlhCMGVTY3BMbVZoWTJnb1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVNRb2RHaHBjeWt1Wm1sdVpDZ25MbXB6TFdocFpHVXRaVzF3ZEhsZlgyTnVkQ0ErSUNvbktTNXNaVzVuZEdncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1FvZEdocGN5a3VjbVZ0YjNabEtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TG1sdWFYUlFjMlYxWkc5VFpXeGxZM1FvS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TG1sdWFYUlFjMlYxWkc5VFpXeGxZM1JUWldGeVkyZ29LVHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbWx1YVhSVVlXSnpLQ2s3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVwYm1sMFEyaGxjM01vS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TG1sdWFYUkRhR1Z6YzBacGJIUmxjaWdwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11YVc1cGRHbGhiR2w2WldRZ1BTQjBjblZsTzF4eVhHNGdJQ0FnZlN4Y2NseHVYSEpjYmlBZ0lDQnBibWwwVUhObGRXUnZVMlZzWldOME9pQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0x5OGdZM1Z6ZEc5dElITmxiR1ZqZEZ4eVhHNGdJQ0FnSUNBZ0lDUW9KeTVxY3kxelpXeGxZM1FuS1M1dmJpZ25ZMnhwWTJzbkxDQm1kVzVqZEdsdmJpQW9aU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JsTG5OMGIzQlFjbTl3WVdkaGRHbHZiaWdwTzF4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTF6Wld4bFkzUmZYM1J2WjJkc1pYSW5LUzV2YmlnblkyeHBZMnNuTENCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelpXeGxZM1FuS1M1eVpXMXZkbVZEYkdGemN5Z25YMkZqZEdsMlpTY3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWtLSFJvYVhNcExuQmhjbVZ1ZEhNb0p5NXFjeTF6Wld4bFkzUW5LUzVoWkdSRGJHRnpjeWduWDJGamRHbDJaU2NwTG5SdloyZHNaVU5zWVhOektDZGZiM0JsYm1Wa0p5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelpXeGxZM1FuS1M1dWIzUW9KeTVmWVdOMGFYWmxKeWt1Y21WdGIzWmxRMnhoYzNNb0oxOXZjR1Z1WldRbktUdGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWtLSGRwYm1SdmR5a3ViMjRvSjJOc2FXTnJKeXdnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0tDY3Vhbk10YzJWc1pXTjBKeWt1Y21WdGIzWmxRMnhoYzNNb0oxOXZjR1Z1WldRZ1gyRmpkR2wyWlNjcE8xeHlYRzRnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnZlN4Y2NseHVYSEpjYmlBZ0lDQnBibWwwVUhObGRXUnZVMlZzWldOMFUyVmhjbU5vT2lCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1kzVnpkRzl0SUhObGJHVmpkQ0J6WldGeVkyaGNjbHh1SUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMlZzWldOMExYTmxZWEpqYUNjcExtVmhZMmdvWm5WdVkzUnBiMjRnS0dsdVpHVjRMQ0JsYkdWdFpXNTBLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lBa2FYUmxiWE1nUFNBa0tHVnNaVzFsYm5RcExtWnBibVFvSnk1cWN5MXpaV3hsWTNRdGMyVmhjbU5vWDE5cGRHVnRKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ1FvWld4bGJXVnVkQ2t1Wm1sdVpDZ25MbXB6TFhObGJHVmpkQzF6WldGeVkyaGZYMmx1Y0hWMEp5bGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdWIyNG9KMnRsZVhWd0p5d2dablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdjWFZsY25rZ1BTQWtLSFJvYVhNcExuWmhiQ2dwTG5SeWFXMG9LUzUwYjB4dmQyVnlRMkZ6WlNncE8xeHlYRzR2THlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloeGRXVnllU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHhkV1Z5ZVM1c1pXNW5kR2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1JwZEdWdGN5NWxZV05vS0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLSFJvYVhNcExtUmhkR0VvSjNObGJHVmpkQzF6WldGeVkyZ25LUzUwYjB4dmQyVnlRMkZ6WlNncExtbHVaR1Y0VDJZb2NYVmxjbmtwSUQwOVBTQXdJRDhnSkNoMGFHbHpLUzV6YUc5M0tDa2dPaUFrS0hSb2FYTXBMbWhwWkdVb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkdsMFpXMXpMbk5vYjNjb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xtOXVLQ2RqYUdGdVoyVW5MQ0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJRzVsWldRZ1ptOXlJRzFHYVd4MFpYSXlYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJSDBzWEhKY2JseHlYRzRnSUNBZ2FXNXBkRlJoWW5NNklHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBa0tDY3Vhbk10ZEdGaWN5Y3BMbVZoWTJnb1puVnVZM1JwYjI0Z0tHbHVaR1Y0TENCbGJHVnRLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCMFlXSnpVMlZzWldOMGIzSWdQU0IwZVhCbGIyWWdKQ2hsYkdWdEtTNWtZWFJoS0NkMFlXSnpKeWtnUFQwOUlDZDFibVJsWm1sdVpXUW5JRDhnSnk1cWN5MTBZV0p6WDE5c2FYTjBJRDRnYkdrbklEb2dKQ2hsYkdWdEtTNWtZWFJoS0NkMFlXSnpKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lBa2MyVnNaV04wSUQwZ0pDaGxiR1Z0S1M1bWFXNWtLQ2N1YW5NdGRHRmljMTlmYzJWc1pXTjBKeWtzSUhkcGRHaFRaV3hsWTNRZ1BTQWtjMlZzWldOMExteGxibWQwYUR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNobGJHVnRLUzVsWVhONWRHRmljeWg3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdkx5RFF0TkM3MFk4ZzBMTFF1OUMrMExiUXRkQzkwTDNSaTlHRklOR0MwTERRc2RDKzBMSWcwTGpSZ2RDLzBMN1F1OUdNMExmUmc5QzEwTHdnWkdGMFlWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR0ZpY3pvZ2RHRmljMU5sYkdWamRHOXlMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dGdVpXeERiMjUwWlhoME9pQWtLR1ZzWlcwcExtaGhjME5zWVhOektDZHFjeTEwWVdKelgyUnBjMk52Ym01bFkzUmxaQ2NwSUQ4Z0pDZ25MbXB6TFhSaFluTmZYMk52Ym5SbGJuUW5LU0E2SUNRb1pXeGxiU2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoM2FYUm9VMlZzWldOMEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0hSaFluTlRaV3hsWTNSdmNpa3VabWx1WkNnbllTY3BMbVZoWTJnb1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUIyWVd4MVpTQTlJQ1FvZEdocGN5a3VZWFIwY2lnbmFISmxaaWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFpYaDBJRDBnSkNoMGFHbHpLUzVrWVhSaEtDZHpaV3hsWTNRbktTQjhmQ0FrS0hSb2FYTXBMblJsZUhRb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2MyVnNaV04wTG1Gd2NHVnVaQ2duUEc5d2RHbHZiaUIyWVd4MVpUMWNJaWNyZG1Gc2RXVXJKMXdpUGljcmRHVjRkQ3NuUEM5dmNIUnBiMjQrSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNSelpXeGxZM1F1YjI0b0oyTm9ZVzVuWlNjc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLR1ZzWlcwcExtVmhjM2wwWVdKektDZHpaV3hsWTNRbkxDQWtLSFJvYVhNcExuWmhiQ2dwS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9aV3hsYlNrdVltbHVaQ2duWldGemVYUmhZbk02WVdaMFpYSW5MQ0JtZFc1amRHbHZiaUFvWlhabGJuUXNJQ1JqYkdsamEyVmtMQ0FrZEdGeVoyVjBLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kMmwwYUZObGJHVmpkQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1J6Wld4bFkzUXVkbUZzS0NSamJHbGphMlZrTG1GMGRISW9KMmh5WldZbktTa3VZMmhoYm1kbEtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2RHRnlaMlYwTG1acGJtUW9KeTV6YkdsamF5MXBibWwwYVdGc2FYcGxaQ2NwTG5Oc2FXTnJLQ2R6WlhSUWIzTnBkR2x2YmljcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKSFJoY21kbGRDNW1hVzVrS0NjdWFuTXRjMlZzWldOME1pY3BMbk5sYkdWamRESW9LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQjlMRnh5WEc1Y2NseHVJQ0FnSUdsdWFYUkRhR1Z6Y3pvZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUdsbUlDZ2tLSGRwYm1SdmR5a3ViM1YwWlhKWGFXUjBhQ2dwSUQ0OUlHRndjRU52Ym1acFp5NWljbVZoYTNCdmFXNTBMbXhuS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNRb0p5NXFjeTFqYUdWemN5MTBiMjlzZEdsd1gxOWpiMjUwWlc1MEp5a3VjR0Z5Wlc1MEtDa3VhRzkyWlhJb1lYQndMbk5vYjNkRGFHVnpjMVJ2YjJ4MGFYQXNJR0Z3Y0M1b2FXUmxRMmhsYzNOVWIyOXNkR2x3S1R0Y2NseHVJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlDUjBZWEpuWlhRZ1BTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIUnBkR3hsT2lBa0tDY3Vhbk10WTJobGMzTXRhVzVtYjE5ZmRHbDBiR1VuS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWVhKbFlUb2dKQ2duTG1wekxXTm9aWE56TFdsdVptOWZYMkZ5WldFbktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NISnBZMlU2SUNRb0p5NXFjeTFqYUdWemN5MXBibVp2WDE5d2NtbGpaU2NwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J3Y21salpWQmxjbE54ZFdGeVpUb2dKQ2duTG1wekxXTm9aWE56TFdsdVptOWZYM0J5YVdObFVHVnlVM0YxWVhKbEp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnNiMjl5T2lBa0tDY3Vhbk10WTJobGMzTXRhVzVtYjE5ZlpteHZiM0luS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWm14dmIzSnpWRzkwWVd3NklDUW9KeTVxY3kxamFHVnpjeTFwYm1adlgxOW1iRzl2Y25OVWIzUmhiQ2NwTEZ4eVhHNGdJQ0FnSUNBZ0lIMHNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrYUhsd2IzUm9aV01nUFNBa0tDY3Vhbk10WTJobGMzTXRhVzVtYjE5ZmFIbHdiM1JvWldNbktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1JvZVhCdmRHaGxZMWR5WVhCd1pYSWdQU0FrS0NjdWFuTXRZMmhsYzNNdGFXNW1iMTlmYUhsd2IzUm9aV010ZDNKaGNIQmxjaWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pHbHRaMFpzWVhRZ1BTQWtLQ2N1YW5NdFkyaGxjM010YVc1bWIxOWZhVzFuUm14aGRDY3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkdsdFowWnNiMjl5SUQwZ0pDZ25MbXB6TFdOb1pYTnpMV2x1Wm05ZlgybHRaMFpzYjI5eUp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrZEdGaWN5QTlJQ1FvSnk1cWN5MWphR1Z6Y3kxcGJtWnZYMTkwWVdKekp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrZEdGaVJteHZiM0lnUFNBa0tDY3Vhbk10WTJobGMzTXRhVzVtYjE5ZmRHRmlSbXh2YjNJbktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1IwWVdKR2JHRjBJRDBnSkNnbkxtcHpMV05vWlhOekxXbHVabTlmWDNSaFlrWnNZWFFuS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUm1iM0p0SUQwZ0pDZ25MbXB6TFdOb1pYTnpMV2x1Wm05ZlgyWnZjbTBuS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbHVhWFFnUFNCbVlXeHpaVHRjY2x4dUlDQWdJQ0FnSUNBa0tDY3Vhbk10WTJobGMzTXRhVzVtYjE5ZmFYUmxiUzVmWVdOMGFYWmxKeWt1YjI0b0oyTnNhV05ySnl3Z1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnSkhSb2FYTWdQU0FrS0hSb2FYTXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSkhSb2FYTXVhR0Z6UTJ4aGMzTW9KMTl6Wld4bFkzUmxaQ2NwS1Z4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRZMmhsYzNNdGFXNW1iMTlmYVhSbGJTY3BMbkpsYlc5MlpVTnNZWE56S0NkZmMyVnNaV04wWldRbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pIUm9hWE11WVdSa1EyeGhjM01vSjE5elpXeGxZM1JsWkNjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdaR0YwWVNBOUlDUjBhR2x6TG1SaGRHRW9LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdabTl5SUNoMllYSWdhMlY1SUdsdUlDUjBZWEpuWlhRcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1IwWVhKblpYUmJhMlY1WFM1MFpYaDBLR1JoZEdGYmEyVjVYU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKR1p2Y20wdWRtRnNLR1JoZEdFdVptOXliU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoa1lYUmhMbWg1Y0c5MGFHVmpLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2FIbHdiM1JvWldNdWRHVjRkQ2hrWVhSaExtaDVjRzkwYUdWaktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1JvZVhCdmRHaGxZMWR5WVhCd1pYSXVjMmh2ZHlncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pHaDVjRzkwYUdWalYzSmhjSEJsY2k1b2FXUmxLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dSaGRHRXVhVzFuUm14aGRDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkdsdFowWnNZWFF1WVhSMGNpZ25hSEpsWmljc0lHUmhkR0V1YVcxblJteGhkQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2FXMW5SbXhoZEM1bWFXNWtLQ2RwYldjbktTNWhkSFJ5S0NkemNtTW5MQ0JrWVhSaExtbHRaMFpzWVhRcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKR2x0WjBac1lYUXVjMmh2ZHlncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKSFJoWWtac1lYUXVjMmh2ZHlncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pHbHRaMFpzWVhRdWFHbGtaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pIUmhZa1pzWVhRdWFHbGtaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoa1lYUmhMbWx0WjBac2IyOXlLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2FXMW5SbXh2YjNJdVlYUjBjaWduYUhKbFppY3NJR1JoZEdFdWFXMW5SbXh2YjNJcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKR2x0WjBac2IyOXlMbVpwYm1Rb0oybHRaeWNwTG1GMGRISW9KM055WXljc0lHUmhkR0V1YVcxblJteHZiM0lwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pHbHRaMFpzYjI5eUxuTm9iM2NvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUjBZV0pHYkc5dmNpNXphRzkzS0NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2FXMW5SbXh2YjNJdWFHbGtaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pIUmhZa1pzYjI5eUxtaHBaR1VvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0pIUmhZbk11Wm1sdVpDZ25iR2s2ZG1semFXSnNaU2NwTG14bGJtZDBhQ0E5UFNBeEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrZEdGaWN5NW1hVzVrS0Nkc2FUcDJhWE5wWW14bEp5a3VabWx5YzNRb0tTNW1hVzVrS0NkaEp5a3VZMnhwWTJzb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hVzVwZENrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKQ2hjSW1oMGJXd3NJR0p2WkhsY0lpa3VZVzVwYldGMFpTaDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MyTnliMnhzVkc5d09pQWtkR0Z5WjJWMExuUnBkR3hsTG05bVpuTmxkQ2dwTG5SdmNDQXRJREV3TUZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTd2dOVEF3S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTFqYUdWemN5MXBibVp2WDE5cGRHVnRMbDloWTNScGRtVW5LUzVtYVhKemRDZ3BMbU5zYVdOcktDazdYSEpjYmlBZ0lDQWdJQ0FnYVc1cGRDQTlJSFJ5ZFdVN1hISmNiaUFnSUNCOUxGeHlYRzVjY2x4dUlDQWdJQ1JqYUdWemMxUnZiMngwYVhBNklHNTFiR3dzWEhKY2JpQWdJQ0FrWTJobGMzTlViMjlzZEdsd1ZHbHRaVzkxZERvZ2JuVnNiQ3hjY2x4dVhISmNiaUFnSUNCemFHOTNRMmhsYzNOVWIyOXNkR2x3T2lCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlDUnpaV3htSUQwZ0pDaDBhR2x6S1R0Y2NseHVJQ0FnSUNBZ0lDQmhjSEF1SkdOb1pYTnpWRzl2YkhScGNGUnBiV1Z2ZFhRZ1BTQnpaWFJVYVcxbGIzVjBLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHOW1abk5sZENBOUlDUnpaV3htTG05bVpuTmxkQ2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JoY0hBdUpHTm9aWE56Vkc5dmJIUnBjQ0E5SUNSelpXeG1MbVpwYm1Rb0p5NXFjeTFqYUdWemN5MTBiMjlzZEdsd1gxOWpiMjUwWlc1MEp5a3VZMnh2Ym1Vb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1lYQndMaVJqYUdWemMxUnZiMngwYVhBdVkzTnpLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSdmNEb2diMlptYzJWMExuUnZjQ0FySURJNExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiR1ZtZERvZ2IyWm1jMlYwTG14bFpuUWdLeUF4TUN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrdVlYQndaVzVrVkc4b0pDZ25ZbTlrZVNjcEtTNWhaR1JEYkdGemN5Z25YMkZqZEdsMlpTY3BPMXh5WEc0Z0lDQWdJQ0FnSUgwc0lETXdNQ2s3WEhKY2JpQWdJQ0I5TEZ4eVhHNWNjbHh1SUNBZ0lHaHBaR1ZEYUdWemMxUnZiMngwYVhBNklHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNCamJHVmhjbFJwYldWdmRYUW9ZWEJ3TGlSamFHVnpjMVJ2YjJ4MGFYQlVhVzFsYjNWMEtUdGNjbHh1SUNBZ0lDQWdJQ0JoY0hBdUpHTm9aWE56Vkc5dmJIUnBjQzV5WlcxdmRtVW9LVHRjY2x4dUlDQWdJSDBzWEhKY2JseHlYRzRnSUNBZ2FXNXBkRU5vWlhOelJtbHNkR1Z5T2lCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlDUm1iM0p0SUQwZ0pDZ25MbXB6TFdOb1pYTnpMV1pwYkhSbGNpY3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkdsMFpXMXpJRDBnSkNnbkxtcHpMV05vWlhOekxXWnBiSFJsY2w5ZmFYUmxiU2NwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYSmxZVTFwYmlBOUlHNTFiR3dzSUdGeVpXRk5ZWGdnUFNCdWRXeHNMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0hKcFkyVk5hVzRnUFNCdWRXeHNMQ0J3Y21salpVMWhlQ0E5SUc1MWJHd3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYjNSaGJDQTlJQ1JwZEdWdGN5NXNaVzVuZEdnZ0xTQWthWFJsYlhNdVptbHNkR1Z5S0NjdVgzTnZiR1FuS1M1c1pXNW5kR2c3WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLQ1JtYjNKdExteGxibWQwYUNBOVBUMGdNQ0I4ZkNBa2FYUmxiWE11YkdWdVozUm9JRDA5UFNBd0tWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTQ3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTV6WlhSRGFHVnpjMVJ2ZEdGc0tIUnZkR0ZzS1R0Y2NseHVJQ0FnSUNBZ0lDQWthWFJsYlhNdVptbHNkR1Z5S0NkYlpHRjBZUzFtYVd4MFpYSXRZWEpsWVYwbktTNWxZV05vS0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0Z5WldFZ1BTQk5ZWFJvTG5KdmRXNWtLSEJoY25ObFJteHZZWFFvSkNoMGFHbHpLUzVrWVhSaEtDZG1hV3gwWlhJdFlYSmxZU2NwS1NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hZWEpsWVUxcGJpQjhmQ0JoY21WaElEd2dZWEpsWVUxcGJpa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbFlVMXBiaUE5SUdGeVpXRTdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLQ0ZoY21WaFRXRjRJSHg4SUdGeVpXRWdQaUJoY21WaFRXRjRLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGNtVmhUV0Y0SUQwZ1lYSmxZVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ1JwZEdWdGN5NW1hV3gwWlhJb0oxdGtZWFJoTFdacGJIUmxjaTF3Y21salpWMG5LUzVsWVdOb0tHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhCeWFXTmxJRDBnY0dGeWMyVkpiblFvSkNoMGFHbHpLUzVrWVhSaEtDZG1hV3gwWlhJdGNISnBZMlVuS1NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hjSEpwWTJWTmFXNGdmSHdnY0hKcFkyVWdQQ0J3Y21salpVMXBiaWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NISnBZMlZOYVc0Z1BTQndjbWxqWlR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0lYQnlhV05sVFdGNElIeDhJSEJ5YVdObElENGdjSEpwWTJWTllYZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCeWFXTmxUV0Y0SUQwZ2NISnBZMlU3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FrWm05eWJTNW1hVzVrS0NkYmJtRnRaVDFjSW1GeVpXRmZiV2x1WENKZEp5a3VZWFIwY2lnbmRtRnNkV1VuTENCaGNtVmhUV2x1S1M1aGRIUnlLQ2R0YVc0bkxDQmhjbVZoVFdsdUtTNWhkSFJ5S0NkdFlYZ25MQ0JoY21WaFRXRjRLVHRjY2x4dUlDQWdJQ0FnSUNBa1ptOXliUzVtYVc1a0tDZGJibUZ0WlQxY0ltRnlaV0ZmYldGNFhDSmRKeWt1WVhSMGNpZ25kbUZzZFdVbkxDQmhjbVZoVFdGNEtTNWhkSFJ5S0NkdGFXNG5MQ0JoY21WaFRXbHVLUzVoZEhSeUtDZHRZWGduTENCaGNtVmhUV0Y0S1R0Y2NseHVJQ0FnSUNBZ0lDQWtabTl5YlM1bWFXNWtLQ2RiYm1GdFpUMWNJbkJ5YVdObFgyMXBibHdpWFNjcExtRjBkSElvSjNaaGJIVmxKeXdnY0hKcFkyVk5hVzRwTG1GMGRISW9KMjFwYmljc0lIQnlhV05sVFdsdUtTNWhkSFJ5S0NkdFlYZ25MQ0J3Y21salpVMWhlQ2s3WEhKY2JpQWdJQ0FnSUNBZ0pHWnZjbTB1Wm1sdVpDZ25XMjVoYldVOVhDSndjbWxqWlY5dFlYaGNJbDBuS1M1aGRIUnlLQ2QyWVd4MVpTY3NJSEJ5YVdObFRXRjRLUzVoZEhSeUtDZHRhVzRuTENCd2NtbGpaVTFwYmlrdVlYUjBjaWduYldGNEp5d2djSEpwWTJWTllYZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNSbWIzSnRMbVpwYm1Rb0oxdHVZVzFsUFZ3aWNtOXZiWE5jSWwwbktTNWxZV05vS0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLQ1JwZEdWdGN5NW1hV3gwWlhJb0oxdGtZWFJoTFdacGJIUmxjaTF5YjI5dGN6MWNJaWNnS3lBa0tIUm9hWE1wTG5aaGJDZ3BJQ3NnSjF3aVhTY3BMbXhsYm1kMGFDQTlQU0F3S1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLSFJvYVhNcExuQmhjbVZ1ZENncExuSmxiVzkyWlNncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JseHlYRzRnSUNBZ0lDQWdJQ1JtYjNKdExtWnBibVFvSjJsdWNIVjBKeWt1YjI0b0oyTm9ZVzVuWlNjc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdadmNtMUVZWFJoSUQwZ0pHWnZjbTB1YzJWeWFXRnNhWHBsUVhKeVlYa29LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1hV3gwWlhKeklEMGdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoY21WaE9pQmJZWEpsWVUxcGJpd2dZWEpsWVUxaGVGMHNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEJ5YVdObE9pQmJjSEpwWTJWTmFXNHNJSEJ5YVdObFRXRjRYU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY205dmJYTTZJRnRkWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjY2x4dUx5OGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnlobWIzSnRSR0YwWVNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNRdVpXRmphQ2htYjNKdFJHRjBZU3dnWm5WdVkzUnBiMjRnS0c0c0lIWXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaDJMbTVoYldVZ1BUMGdKMkZ5WldGZmJXbHVKeUFtSmlCMkxuWmhiSFZsSUNFOUlHRnlaV0ZOYVc0cElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWFXeDBaWEp6TG1GeVpXRmJNRjBnUFNCd1lYSnpaVWx1ZENoMkxuWmhiSFZsS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoMkxtNWhiV1VnUFQwZ0oyRnlaV0ZmYldGNEp5QW1KaUIyTG5aaGJIVmxJQ0U5SUdGeVpXRk5ZWGdwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JtYVd4MFpYSnpMbUZ5WldGYk1WMGdQU0J3WVhKelpVbHVkQ2gyTG5aaGJIVmxLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gyTG01aGJXVWdQVDBnSjNCeWFXTmxYMjFwYmljZ0ppWWdkaTUyWVd4MVpTQWhQU0J3Y21salpVMXBiaWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1pwYkhSbGNuTXVjSEpwWTJWYk1GMGdQU0J3WVhKelpVbHVkQ2gyTG5aaGJIVmxLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gyTG01aGJXVWdQVDBnSjNCeWFXTmxYMjFoZUNjZ0ppWWdkaTUyWVd4MVpTQWhQU0J3Y21salpVMWhlQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1pwYkhSbGNuTXVjSEpwWTJWYk1WMGdQU0J3WVhKelpVbHVkQ2gyTG5aaGJIVmxLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gyTG01aGJXVWdQVDBnSjNKdmIyMXpKeWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1pwYkhSbGNuTXVjbTl2YlhNdWNIVnphQ2gyTG5aaGJIVmxLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaG1hV3gwWlhKekxtRnlaV0ZiTUYwZ1BUMGdZWEpsWVUxcGJpQW1KaUJtYVd4MFpYSnpMbUZ5WldGYk1WMGdQVDBnWVhKbFlVMWhlQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSbGJHVjBaU0JtYVd4MFpYSnpMbUZ5WldFN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaG1hV3gwWlhKekxuQnlhV05sV3pCZElEMDlJSEJ5YVdObFRXbHVJQ1ltSUdacGJIUmxjbk11Y0hKcFkyVmJNVjBnUFQwZ2NISnBZMlZOWVhncFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtaV3hsZEdVZ1ptbHNkR1Z5Y3k1d2NtbGpaVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dacGJIUmxjbk11Y205dmJYTXViR1Z1WjNSb0lEMDlJREFwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1pXeGxkR1VnWm1sc2RHVnljeTV5YjI5dGN6dGNjbHh1THk4Z0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWhtYVd4MFpYSnpLVHRjY2x4dVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaFBZbXBsWTNRdWEyVjVjeWhtYVd4MFpYSnpLUzVzWlc1bmRHZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNScGRHVnRjeTVoWkdSRGJHRnpjeWduWDJacGJIUmxjbVZrSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWthWFJsYlhNdVpXRmphQ2htZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHWnBiSFJsY21Wa0lEMGdkSEoxWlN3Z0pGOXBkR1Z0SUQwZ0pDaDBhR2x6S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrTG1WaFkyZ29abWxzZEdWeWN5d2dablZ1WTNScGIyNGdLR3NzSUhZcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjM2RwZEdOb0lDaHJLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZWE5sSUNkaGNtVmhKenBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUNna1gybDBaVzB1WkdGMFlTZ25abWxzZEdWeUxXRnlaV0VuS1NrZ0lUMDlJQ2QxYm1SbFptbHVaV1FuS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaGNtVmhJRDBnVFdGMGFDNXliM1Z1WkNod1lYSnpaVVpzYjJGMEtDUmZhWFJsYlM1a1lYUmhLQ2RtYVd4MFpYSXRZWEpsWVNjcEtTazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGhjbVZoSUR3Z2Rsc3dYU0I4ZkNCaGNtVmhJRDRnZGxzeFhTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabWxzZEdWeVpXUWdQU0JtWVd4elpUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnBiSFJsY21Wa0lEMGdabUZzYzJVN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZ6WlNBbmNISnBZMlVuT2x4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaDBlWEJsYjJZZ0tDUmZhWFJsYlM1a1lYUmhLQ2RtYVd4MFpYSXRjSEpwWTJVbktTa2dJVDA5SUNkMWJtUmxabWx1WldRbktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQndjbWxqWlNBOUlFMWhkR2d1Y205MWJtUW9jR0Z5YzJWR2JHOWhkQ2drWDJsMFpXMHVaR0YwWVNnblptbHNkR1Z5TFhCeWFXTmxKeWtwS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hCeWFXTmxJRHdnZGxzd1hTQjhmQ0J3Y21salpTQStJSFpiTVYwcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnBiSFJsY21Wa0lEMGdabUZzYzJVN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWFXeDBaWEpsWkNBOUlHWmhiSE5sTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhjMlVnSjNKdmIyMXpKenBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUNna1gybDBaVzB1WkdGMFlTZ25abWxzZEdWeUxYSnZiMjF6SnlrcElEMDlQU0FuZFc1a1pXWnBibVZrSnlCOGZDQjJMbWx1WkdWNFQyWW9KRjlwZEdWdExtUmhkR0VvSjJacGJIUmxjaTF5YjI5dGN5Y3BMblJ2VTNSeWFXNW5LQ2twSUQwOVBTQXRNU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1hV3gwWlhKbFpDQTlJR1poYkhObE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHWnBiSFJsY21Wa0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1FvZEdocGN5a3VjbVZ0YjNabFEyeGhjM01vSjE5bWFXeDBaWEpsWkNjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhCd0xuTmxkRU5vWlhOelZHOTBZV3dvSkdsMFpXMXpMbXhsYm1kMGFDQXRJQ1JwZEdWdGN5NW1hV3gwWlhJb0p5NWZabWxzZEdWeVpXUW5LUzVzWlc1bmRHZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKR2wwWlcxekxuSmxiVzkyWlVOc1lYTnpLQ2RmWm1sc2RHVnlaV1FuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRndjQzV6WlhSRGFHVnpjMVJ2ZEdGc0tIUnZkR0ZzS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUgwc1hISmNibHh5WEc0Z0lDQWdjMlYwUTJobGMzTlViM1JoYkRvZ1puVnVZM1JwYjI0Z0tIUnZkR0ZzS1NCN1hISmNiaUFnSUNBZ0lDQWdkbUZ5SUdWdVpHbHVaM01nUFNCYko5QzYwTExRc05HQTBZTFF1TkdBMExBbkxDQW4wTHJRc3RDdzBZRFJndEM0MFlEUml5Y3NJQ2ZRdXRDeTBMRFJnTkdDMExqUmdDZGRPMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTFqYUdWemN5MW1hV3gwWlhKZlgzUnZkR0ZzSnlrdWRHVjRkQ2gwYjNSaGJDQXJJQ2NnSnlBcklHRndjQzVuWlhST2RXMUZibVJwYm1jb2RHOTBZV3dzSUdWdVpHbHVaM01wS1R0Y2NseHVJQ0FnSUgwc1hISmNibHh5WEc0Z0lDQWdMeW9xWEhKY2JpQWdJQ0FnS2lEUXBOR0QwTDNRdXRHRzBMalJqeURRc3RDKzBMZlFzdEdBMExEUmlkQ3cwTFhSZ2lEUXZ0QzYwTDdRdmRHSDBMRFF2ZEM0MExVZzBMVFF1OUdQSU5DODBMM1F2dEMyMExYUmdkR0MwTExRdGRDOTBMM1F2dEN6MEw0ZzBZZlF1TkdCMEx2UXNDRFJnZEM3MEw3UXN0Q3dJTkM5MExBZzBMN1JnZEM5MEw3UXN0Q3cwTDNRdU5DNElOR0gwTGpSZ2RDNzBMQWcwTGdnMEx6UXNOR0IwWUhRdU5DeTBMQWcwTDdRdXRDKzBMM1JoOUN3MEwzUXVOQzVYSEpjYmlBZ0lDQWdLaUJ3WVhKaGJTQWdhVTUxYldKbGNpQkpiblJsWjJWeUlOQ24wTGpSZ2RDNzBMNGcwTDNRc0NEUXZ0R0IwTDNRdnRDeTBMVWcwTHJRdnRHQzBMN1JnTkMrMExQUXZpRFF2ZEdEMExiUXZkQytJTkdCMFlUUXZ0R0EwTHpRdU5HQTBMN1FzdEN3MFlMUmpDRFF2dEM2MEw3UXZkR0gwTERRdmRDNDBMVmNjbHh1SUNBZ0lDQXFJSEJoY21GdElDQmhSVzVrYVc1bmN5QkJjbkpoZVNEUW5OQ3cwWUhSZ2RDNDBMSWcwWUhRdTlDKzBMSWcwTGpRdTlDNElOQyswTHJRdnRDOTBZZlFzTkM5MExqUXVTRFF0TkM3MFk4ZzBZZlF1TkdCMExYUXV5QW9NU3dnTkN3Z05Ta3NYSEpjYmlBZ0lDQWdLaUFnSUNBZ0lDQWdJTkM5MExEUXY5R0EwTGpRdk5DMTBZQWdXeWZSajlDeDBMdlF2dEM2MEw0bkxDQW4wWS9Rc2RDNzBMN1F1dEN3Snl3Z0o5R1AwTEhRdTlDKzBMb25YVnh5WEc0Z0lDQWdJQ29nY21WMGRYSnVJRk4wY21sdVoxeHlYRzRnSUNBZ0lDb2dYSEpjYmlBZ0lDQWdLaUJvZEhSd2N6b3ZMMmhoWW5KaGFHRmljaTV5ZFM5d2IzTjBMekV3TlRReU9DOWNjbHh1SUNBZ0lDQXFMMXh5WEc0Z0lDQWdaMlYwVG5WdFJXNWthVzVuT2lCbWRXNWpkR2x2YmlBb2FVNTFiV0psY2l3Z1lVVnVaR2x1WjNNcFhISmNiaUFnSUNCN1hISmNiaUFnSUNBZ0lDQWdkbUZ5SUhORmJtUnBibWNzSUdrN1hISmNiaUFnSUNBZ0lDQWdhVTUxYldKbGNpQTlJR2xPZFcxaVpYSWdKU0F4TURBN1hISmNiaUFnSUNBZ0lDQWdhV1lnS0dsT2RXMWlaWElnUGowZ01URWdKaVlnYVU1MWJXSmxjaUE4UFNBeE9Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnpSVzVrYVc1bklEMGdZVVZ1WkdsdVozTmJNbDA3WEhKY2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVNBOUlHbE9kVzFpWlhJZ0pTQXhNRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjM2RwZEdOb0lDaHBLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVhObElDZ3hLVHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpSVzVrYVc1bklEMGdZVVZ1WkdsdVozTmJNRjA3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZbkpsWVdzN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZWE5sSUNneUtUcGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYzJVZ0tETXBPbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGelpTQW9OQ2s2WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMFZ1WkdsdVp5QTlJR0ZGYm1ScGJtZHpXekZkTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0p5WldGck8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR1ZtWVhWc2REcGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCelJXNWthVzVuSUQwZ1lVVnVaR2x1WjNOYk1sMDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhORmJtUnBibWM3WEhKY2JpQWdJQ0I5TEZ4eVhHNWNjbHh1ZlZ4eVhHNWNjbHh1YWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0JwYm1sMFRXRnBibE5zYVdSbGNpZ3BPMXh5WEc0Z0lDQWdJQ0FnSUdsdWFYUlRiV0ZzYkZOc2FXUmxjbk1vS1R0Y2NseHVJQ0FnSUNBZ0lDQnBibWwwVW1WMmFXVjNjMU5zYVdSbGNpZ3BPMXh5WEc0Z0lDQWdJQ0FnSUdsdWFYUkJaMlZ1ZEhOUWNtVnpaVzUwWVhScGIyNG9LVHRjY2x4dUlDQWdJQ0FnSUNCelpYUkJaMlZ1ZEhOUWNtVnpaVzUwWVhScGIyNG9LVHRjY2x4dUlDQWdJQ0FnSUNCcGJtbDBUV1Z1ZFNncE8xeHlYRzRnSUNBZ0lDQWdJR2x1YVhSTllYTnJLQ2s3WEhKY2JpQWdJQ0FnSUNBZ2FXNXBkRkJ2Y0hWd0tDazdYSEpjYmlBZ0lDQWdJQ0FnYVc1cGRGTmxiR1ZqZENncE8xeHlYRzRnSUNBZ0lDQWdJR2x1YVhSV1lXeHBaR0YwWlNncE8xeHlYRzRnSUNBZ0lDQWdJR2x1YVhSU1pXRnNkSGxHYVd4MFpYSnpLQ2s3WEhKY2JpQWdJQ0FnSUNBZ2FXNXBkRkpsWVd4MGVTZ3BPMXh5WEc0Z0lDQWdJQ0FnSUdsdWFYUlFZWE56ZDI5eVpDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUdsdWFYUlNZVzVuWlNncE8xeHlYRzRnSUNBZ0lDQWdJR2x1YVhSSFlXeHNaWEo1S0NrN1hISmNiaUFnSUNBZ0lDQWdhVzVwZEVoNWNHOTBhR1ZqS0NrN1hISmNiaUFnSUNBZ0lDQWdhVzVwZEVSaGRHVndhV05yWlhJb0tUdGNjbHh1SUNBZ0lDQWdJQ0JwYm1sMFUyTnliMnhzWW1GeUtDazdYSEpjYmlBZ0lDQWdJQ0FnYVc1cGRGTmpjbTlzYkNncE8xeHlYRzRnSUNBZ0lDQWdJR2x1YVhSQlltOTFkQ2dwTzF4eVhHNGdJQ0FnSUNBZ0lHbHVhWFJHYVd4bGFXNXdkWFFvS1R0Y2NseHVJQ0FnSUNBZ0lDQnBibWwwUVd4d2FHRmlaWFFvS1R0Y2NseHVJQ0FnSUNBZ0lDQnBibWwwUVc1MGFYTndZVzBvS1R0Y2NseHVJQ0FnSUgwcE8xeHlYRzVjY2x4dUlDQWdJQ1FvZDJsdVpHOTNLUzV2YmlnbmNtVnphWHBsSnl3Z1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUdsdWFYUlRiV0ZzYkZOc2FXUmxjbk1vS1R0Y2NseHVMeThnSUNBZ0lDQWdJR2x1YVhSTlpXNTFLQ2s3WEhKY2JpQWdJQ0I5S1R0Y2NseHVYSEpjYmlBZ0lDQm1kVzVqZEdsdmJpQnBibWwwVFdGcGJsTnNhV1JsY2lncElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2RHbHRaU0E5SUdGd2NFTnZibVpwWnk1emJHbGtaWEpCZFhSdmNHeGhlVk53WldWa0lDOGdNVEF3TUR0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnSkdKaGNpQTlJQ1FvSnk1cWN5MXRZV2x1TFhOc2FXUmxjaTFpWVhJbktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1J6YkdsamF5QTlJQ1FvSnk1cWN5MXpiR2xrWlhJdGJXRnBiaWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYTlFZWFZ6WlNBOUlHWmhiSE5sTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHbGpheXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtTmxiblJVYVcxbE8xeHlYRzVjY2x4dUlDQWdJQ0FnSUNCcFppQW9KSE5zYVdOckxteGxibWQwYUNBOVBUMGdNQ2xjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHlYRzVjY2x4dUlDQWdJQ0FnSUNBa2MyeHBZMnN1YzJ4cFkyc29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtiM1J6T2lCMGNuVmxMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjbkp2ZDNNNklHWmhiSE5sTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwYm1acGJtbDBaVG9nZEhKMVpTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2MyeHBaR1Z6Vkc5VGFHOTNPaUF4TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J6Ykdsa1pYTlViMU5qY205c2JEb2dNU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdabUZrWlRvZ2RISjFaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjM0JsWldRNklHRndjRU52Ym1acFp5NXpiR2xrWlhKR1lXUmxVM0JsWldSY2NseHVMeThnSUNBZ0lDQWdJQ0FnSUNCaGRYUnZjR3hoZVZOd1pXVmtPaUJoY0hCRGIyNW1hV2N1YzJ4cFpHVnlRWFYwYjNCc1lYbFRjR1ZsWkN4Y2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBa2MyeHBZMnN1YjI0b0oySmxabTl5WlVOb1lXNW5aU2NzSUdaMWJtTjBhVzl1SUNobGRtVnVkQ3dnYzJ4cFkyc3NJR04xY25KbGJuUlRiR2xrWlN3Z2JtVjRkRk5zYVdSbEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hqZFhKeVpXNTBVMnhwWkdVZ1BDQnVaWGgwVTJ4cFpHVXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb2MyeHBZMnN1SkhOc2FXUmxjMXRqZFhKeVpXNTBVMnhwWkdWZEtTNWhaR1JEYkdGemN5Z25YMlpoWkdVZ1gyeGxablFuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9jMnhwWTJzdUpITnNhV1JsYzF0dVpYaDBVMnhwWkdWZEtTNWhaR1JEYkdGemN5Z25YMlpoWkdVZ1gzSnBaMmgwSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa0tITnNhV05yTGlSemJHbGtaWE5iWTNWeWNtVnVkRk5zYVdSbFhTa3VZV1JrUTJ4aGMzTW9KMTltWVdSbElGOXlhV2RvZENjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKQ2h6YkdsamF5NGtjMnhwWkdWelcyNWxlSFJUYkdsa1pWMHBMbUZrWkVOc1lYTnpLQ2RmWm1Ga1pTQmZiR1ZtZENjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUdOc1pXRnlWR2x0Wlc5MWRDaDBhV05yS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdKaGNpNWhibWx0WVhSbEtIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGRwWkhSb09pQXdJQ3NnSnlVblhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwc0lERXdNQ2s3WEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJQ0FnSkhOc2FXTnJMbTl1S0NkaFpuUmxja05vWVc1blpTY3NJR1oxYm1OMGFXOXVJQ2hsZG1WdWRDd2djMnhwWTJzc0lHTjFjbkpsYm5SVGJHbGtaU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0hOc2FXTnJMaVJ6Ykdsa1pYTmJZM1Z5Y21WdWRGTnNhV1JsWFNrdWNtVnRiM1psUTJ4aGMzTW9KMTltWVdSbElGOXNaV1owSUY5eWFXZG9kQ2NwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J6ZEdGeWRGQnliMmR5WlhOelltRnlLQ2s3WEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmx4eVhHNGdJQ0FnSUNBZ0lDUnpiR2xqYXk1dmJpaDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHMXZkWE5sWlc1MFpYSTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbHpVR0YxYzJVZ1BTQjBjblZsTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J0YjNWelpXeGxZWFpsT2lCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwYzFCaGRYTmxJRDBnWm1Gc2MyVTdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5S1Z4eVhHNWNjbHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJ6ZEdGeWRGQnliMmR5WlhOelltRnlLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhObGRGQnliMmR5WlhOelltRnlLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSEJsY21ObGJuUlVhVzFsSUQwZ01EdGNjbHh1THk4Z0lDQWdJQ0FnSUNBZ0lDQnBjMUJoZFhObElEMGdabUZzYzJVN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhScFkyc2dQU0J6WlhSSmJuUmxjblpoYkNocGJuUmxjblpoYkN3Z01UQXBPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnYVc1MFpYSjJZV3dvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHBjMUJoZFhObElEMDlQU0JtWVd4elpTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dWeVkyVnVkRlJwYldVZ0t6MGdNU0F2SUNoMGFXMWxJQ3NnTUM0eEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1JpWVhJdVkzTnpLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhV1IwYURvZ2NHVnlZMlZ1ZEZScGJXVWdLeUJjSWlWY0lseHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jR1Z5WTJWdWRGUnBiV1VnUGowZ01UQXdLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKSE5zYVdOckxuTnNhV05yS0NkemJHbGphMDVsZUhRbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVYSEpjYmx4eVhHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlISmxjMlYwVUhKdlozSmxjM05pWVhJb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUmlZWEl1WTNOektIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGRwWkhSb09pQXdJQ3NnSnlVblhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCamJHVmhjbFJwYldWdmRYUW9kR2xqYXlrN1hISmNiaUFnSUNBZ0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUNBZ0lDQnpkR0Z5ZEZCeWIyZHlaWE56WW1GeUtDazdYSEpjYmx4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lHWjFibU4wYVc5dUlHbHVhWFJUYldGc2JGTnNhV1JsY25Nb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tDUW9kMmx1Wkc5M0tTNXZkWFJsY2xkcFpIUm9LQ2tnUENCaGNIQkRiMjVtYVdjdVluSmxZV3R3YjJsdWRDNXRaQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMnhwWkdWeUxYTnRZV3hzT201dmRDZ3VjMnhwWTJzdGFXNXBkR2xoYkdsNlpXUXBKeWt1YzJ4cFkyc29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkc5MGN6b2dkSEoxWlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnljbTkzY3pvZ1ptRnNjMlVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGJtWnBibWwwWlRvZ2RISjFaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOc2FXUmxjMVJ2VTJodmR6b2dNU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOc2FXUmxjMVJ2VTJOeWIyeHNPaUF4TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyVnVkR1Z5VFc5a1pUb2dkSEoxWlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmxiblJsY2xCaFpHUnBibWM2SUNjeE5YQjRKeXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadlkzVnpUMjVUWld4bFkzUTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxemJHbGtaWEl0YzIxaGJHd3VjMnhwWTJzdGFXNXBkR2xoYkdsNlpXUW5LUzV6YkdsamF5Z25kVzV6YkdsamF5Y3BPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQnBaaUFvSkNoM2FXNWtiM2NwTG05MWRHVnlWMmxrZEdnb0tTQThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG0xa0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxaFoyVnVkSE10YzJ4cFpHVnlJQzVoWjJWdWRITXRjMnhwWkdWeVgxOXBkR1Z0SnlrdWIyWm1LQ2RqYkdsamF5Y3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWtLQ2N1YW5NdFlXZGxiblJ6TFhOc2FXUmxjanB1YjNRb0xuTnNhV05yTFdsdWFYUnBZV3hwZW1Wa0tTY3BMbk5zYVdOcktIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1J2ZEhNNklHWmhiSE5sTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYSnliM2R6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsdVptbHVhWFJsT2lCMGNuVmxMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJ4cFpHVnpWRzlUYUc5M09pQXhMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJ4cFpHVnpWRzlUWTNKdmJHdzZJREVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCalpXNTBaWEpOYjJSbE9pQjBjblZsTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyVnVkR1Z5VUdGa1pHbHVaem9nSnpJMUpTY3NYSEpjYmk4dklDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdObGJuUmxjbEJoWkdScGJtYzZJQ2M0TUhCNEp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p2WTNWelQyNVRaV3hsWTNRNklIUnlkV1VzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRZV2RsYm5SekxYTnNhV1JsY2ljcExtOXVLQ2RoWm5SbGNrTm9ZVzVuWlNjc0lHWjFibU4wYVc5dUlDaGxkbVZ1ZEN3Z2MyeHBZMnNzSUdOMWNuSmxiblJUYkdsa1pTa2dlMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aHpiR2xqYXlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLSFJvYVhNcExtWnBibVFvSnk1ZllXTjBhWFpsSnlrdWNtVnRiM1psUTJ4aGMzTW9KMTloWTNScGRtVW5LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb2MyeHBZMnN1SkhOc2FXUmxjMXRqZFhKeVpXNTBVMnhwWkdWZEtTNWhaR1JEYkdGemN5Z25YMkZqZEdsMlpTY3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJWMFFXZGxiblJ6VUhKbGMyVnVkR0YwYVc5dUtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ1FvSnk1cWN5MWhaMlZ1ZEhNdGMyeHBaR1Z5TG5Oc2FXTnJMV2x1YVhScFlXeHBlbVZrSnlrdWMyeHBZMnNvSjNWdWMyeHBZMnNuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVc1cGRFRm5aVzUwYzFCeVpYTmxiblJoZEdsdmJpZ3BPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQm1kVzVqZEdsdmJpQnBibWwwUVdkbGJuUnpVSEpsYzJWdWRHRjBhVzl1S0NrZ2UxeHlYRzRnSUNBZ0lDQWdJR2xtSUNna0tIZHBibVJ2ZHlrdWIzVjBaWEpYYVdSMGFDZ3BJRDQ5SUdGd2NFTnZibVpwWnk1aWNtVmhhM0J2YVc1MExtMWtLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ1FvSnk1cWN5MWhaMlZ1ZEhNdGMyeHBaR1Z5SUM1aFoyVnVkSE10YzJ4cFpHVnlYMTlwZEdWdEp5a3ViMjRvSjJOc2FXTnJKeXdnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKQ2gwYUdsektTNXdZWEpsYm5Rb0tTNW1hVzVrS0NjdVgyRmpkR2wyWlNjcExuSmxiVzkyWlVOc1lYTnpLQ2RmWVdOMGFYWmxKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa0tIUm9hWE1wTG1Ga1pFTnNZWE56S0NkZllXTjBhWFpsSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpaWFJCWjJWdWRITlFjbVZ6Wlc1MFlYUnBiMjRvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUdaMWJtTjBhVzl1SUhObGRFRm5aVzUwYzFCeVpYTmxiblJoZEdsdmJpZ3BJSHRjY2x4dUlDQWdJQ0FnSUNCcFppQW9KQ2duTG1wekxXRm5aVzUwY3kxemJHbGtaWEluS1M1c1pXNW5kR2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlDUmhaMlZ1ZENBOUlDUW9KeTVxY3kxaFoyVnVkSE10YzJ4cFpHVnlJQzVmWVdOMGFYWmxJQzVxY3kxaFoyVnVkSE10YzJ4cFpHVnlYMTl6YUc5eWRDY3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnSkdaMWJHd2dQU0FrS0NjdWFuTXRZV2RsYm5SekxYTnNhV1JsY2w5ZlpuVnNiQ2NwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrWm5Wc2JDNW1hVzVrS0NjdWFuTXRZV2RsYm5SekxYTnNhV1JsY2w5ZlpuVnNiRjlmYVcxbkp5a3VZWFIwY2lnbmMzSmpKeXdnSkdGblpXNTBMbVJoZEdFb0oyRm5aVzUwTFdsdFp5Y3BLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKR1oxYkd3dVptbHVaQ2duTG1wekxXRm5aVzUwY3kxemJHbGtaWEpmWDJaMWJHeGZYMjVoYldVbktTNTBaWGgwS0NSaFoyVnVkQzVrWVhSaEtDZGhaMlZ1ZEMxdVlXMWxKeWtwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NHaHZibVVnUFNBa1lXZGxiblF1WkdGMFlTZ25ZV2RsYm5RdGNHaHZibVVuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdaMWJHd3VabWx1WkNnbkxtcHpMV0ZuWlc1MGN5MXpiR2xrWlhKZlgyWjFiR3hmWDNCb2IyNWxJR0VuS1M1MFpYaDBLSEJvYjI1bEtTNWhkSFJ5S0Nkb2NtVm1KeXdnSjNSbGJEb25JQ3NnY0dodmJtVXVjbVZ3YkdGalpTZ3ZXeTFjWEhNb0tWMHZaeXdnSnljcEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJRzFoYVd3Z1BTQWtZV2RsYm5RdVpHRjBZU2duWVdkbGJuUXRiV0ZwYkNjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa1puVnNiQzVtYVc1a0tDY3Vhbk10WVdkbGJuUnpMWE5zYVdSbGNsOWZablZzYkY5ZmJXRnBiQ0JoSnlrdWRHVjRkQ2h0WVdsc0tTNWhkSFJ5S0Nkb2NtVm1KeXdnSjIxaGFXeDBiem9uSUNzZ2JXRnBiQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCMWNtd2dQU0FrWVdkbGJuUXVaR0YwWVNnbllXZGxiblF0ZFhKc0p5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUm1kV3hzTG1acGJtUW9KeTVxY3kxaFoyVnVkSE10YzJ4cFpHVnlYMTltZFd4c1gxOTFjbXdnWVNjcExtRjBkSElvSjJoeVpXWW5MQ0IxY213cE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0tDY3Vhbk10WVdkbGJuUnpMWE5zYVdSbGNsOWZkWEpzSnlrdVlYUjBjaWduYUhKbFppY3NJSFZ5YkNrN1hISmNiaUFnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUdaMWJtTjBhVzl1SUdsdWFYUk5aVzUxS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ1FvSnk1cWN5MXRaVzUxTFhSdloyZHNaWEluS1M1dmJpZ25ZMnhwWTJzbkxDQm1kVzVqZEdsdmJpQW9aU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JsTG5CeVpYWmxiblJFWldaaGRXeDBLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCb2NtVm1JRDBnSkNoMGFHbHpLUzVoZEhSeUtDZG9jbVZtSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNRb0p5NXFjeTF0Wlc1MUxYUnZaMmRzWlhKYmFISmxaajFjSWljZ0t5Qm9jbVZtSUNzZ0oxd2lYU2NwTG5SdloyZHNaVU5zWVhOektDZGZZV04wYVhabEp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9hSEpsWmlrdWRHOW5aMnhsUTJ4aGMzTW9KMTloWTNScGRtVW5LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKQ2duTG1wekxXMWxiblV1WDJGamRHbDJaU2NwTG14bGJtZDBhQ0E5UFNBd0lEOGdKQ2duTG1wekxXMWxiblV0YjNabGNteGhlU2NwTG1ocFpHVW9LU0E2SUNRb0p5NXFjeTF0Wlc1MUxXOTJaWEpzWVhrbktTNXphRzkzS0NrN1hISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFcxbGJuVXRiM1psY214aGVTY3BMbTl1S0NkamJHbGpheWNzSUdaMWJtTjBhVzl1SUNobEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxdFpXNTFMWFJ2WjJkc1pYSXNJQzVxY3kxdFpXNTFKeWt1Y21WdGIzWmxRMnhoYzNNb0oxOWhZM1JwZG1VbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pDaDBhR2x6S1M1b2FXUmxLQ2xjY2x4dUlDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FrS0NjdWFuTXRiV1Z1ZFMxelpXTnZibVF0ZEc5bloyeGxjaWNwTG05dUtDZGpiR2xqYXljc0lHWjFibU4wYVc5dUlDaGxLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1V1Y0hKbGRtVnVkRVJsWm1GMWJIUW9LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKQ2gwYUdsektTNTBiMmRuYkdWRGJHRnpjeWduWDJGamRHbDJaU2NwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRiV1Z1ZFMxelpXTnZibVFuS1M1MGIyZG5iR1ZEYkdGemN5Z25YMkZqZEdsMlpTY3BPMXh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ2ZWeHlYRzVjY2x4dUlDQWdJR1oxYm1OMGFXOXVJR2x1YVhSTllYTnJLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDUW9KeTVxY3kxdFlYTnJYMTkwWld3bktTNXBibkIxZEcxaGMyc29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRZWE5yT2lBbkt6a2dLRGs1T1NrZ09UazVMVGs1TFRrNUoxeHlYRzRnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lFbHVjSFYwYldGemF5NWxlSFJsYm1SQmJHbGhjMlZ6S0h0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSjI1MWJXVnlhV01uT2lCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhkWFJ2Vlc1dFlYTnJPaUIwY25WbExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMmh2ZDAxaGMydFBia2h2ZG1WeU9pQm1ZV3h6WlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmhaR2w0VUc5cGJuUTZJRndpTEZ3aUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaM0p2ZFhCVFpYQmhjbUYwYjNJNklGd2lJRndpTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHbG5hWFJ6T2lBd0xGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZV3hzYjNkTmFXNTFjem9nWm1Gc2MyVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoZFhSdlIzSnZkWEE2SUhSeWRXVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5YVdkb2RFRnNhV2R1T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhWdWJXRnphMEZ6VG5WdFltVnlPaUIwY25WbFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBa0tDY3Vhbk10YldGemExOWZiblZ0WlhKcFl5Y3BMbWx1Y0hWMGJXRnpheWhjSW01MWJXVnlhV05jSWlrN1hISmNiaUFnSUNBZ0lDQWdKQ2duTG1wekxXMWhjMnRmWDJOMWNuSmxibU41SnlrdWFXNXdkWFJ0WVhOcktGd2liblZ0WlhKcFkxd2lMQ0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSE4xWm1acGVEb2dKOEtnMFlEUmc5Q3hMaWRjY2x4dUlDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FrS0NjdWFuTXRiV0Z6YTE5ZmMzRjFZWEpsSnlrdWFXNXdkWFJ0WVhOcktGd2liblZ0WlhKcFkxd2lMQ0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSE4xWm1acGVEb2dKOEtnMEx6Q3NpZGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWtLQ2N1YW5NdGJXRnphMTlmYzNGMVlYSmxYMlpwYkhSbGNpY3BMbWx1Y0hWMGJXRnpheWhjSW01MWJXVnlhV05jSWl3Z2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCemRXWm1hWGc2SUNmQ29OQzh3ckluTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IxYm0xaGMydEJjMDUxYldKbGNqb2dabUZzYzJWY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBa0tDY3Vhbk10YldGemExOWZZM1Z5Y21WdVkzbGZabWxzZEdWeUp5a3VhVzV3ZFhSdFlYTnJLRndpYm5WdFpYSnBZMXdpTENCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhOMVptWnBlRG9nSjhLZzBZRFJnOUN4TGljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhWdWJXRnphMEZ6VG5WdFltVnlPaUJtWVd4elpWeHlYRzRnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDUW9KeTVxY3kxdFlYTnJYMTloWjJVbktTNXBibkIxZEcxaGMyc29YQ0p1ZFcxbGNtbGpYQ0lzSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYzNWbVptbDRPaUFud3FEUXU5QzEwWUluWEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJQ0FnSkNnbkxtcHpMVzFoYzJ0ZlgzQmxjbU5sYm5RbktTNXBibkIxZEcxaGMyc29YQ0p1ZFcxbGNtbGpYQ0lzSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYzNWbVptbDRPaUFuSlNkY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBa0tDY3Vhbk10YldGemExOWZZM1Z5Y21WdVkza3NJQzVxY3kxdFlYTnJYMTl6Y1hWaGNtVXNJQzVxY3kxdFlYTnJYMTl3WlhKalpXNTBKeWt1YjI0b0oySnNkWEluTENCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRzVsWldRZ1ptOXlJSEpsYlc5MlpTQnpkV1ptYVhoY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2FIUjBjSE02THk5bmFYUm9kV0l1WTI5dEwxSnZZbWx1U0dWeVltOTBjeTlKYm5CMWRHMWhjMnN2YVhOemRXVnpMekUxTlRGY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlIWWdQU0FrS0hSb2FYTXBMblpoYkNncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kaUE5UFNBd0lIeDhJSFlnUFQwZ0p5Y3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb2RHaHBjeWt1ZG1Gc0tDY25LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ2ZWeHlYRzVjY2x4dUlDQWdJR1oxYm1OMGFXOXVJR2x1YVhSUWIzQjFjQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnYjNCMGFXOXVjeUE5SUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWW1GelpVTnNZWE56T2lBblgzQnZjSFZ3Snl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWVhWMGIwWnZZM1Z6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZblJ1VkhCc09pQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J6YldGc2JFSjBiam9nSnp4emNHRnVJR1JoZEdFdFptRnVZM2xpYjNndFkyeHZjMlVnWTJ4aGMzTTlYQ0ptWVc1amVXSnZlQzFqYkc5elpTMXpiV0ZzYkZ3aVBqeHpjR0Z1SUdOc1lYTnpQVndpYkdsdWExd2lQdENYMExEUXV0R0EwWXZSZ3RHTVBDOXpjR0Z1UGp3dmMzQmhiajRuTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4eVhHNGdJQ0FnSUNBZ0lIMDdYSEpjYmlBZ0lDQWdJQ0FnSkNnbkxtcHpMWEJ2Y0hWd0p5a3ViMjRvSjJOc2FXTnJKeXdnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0xtWmhibU41WW05NExtTnNiM05sS0NrN1hISmNiaUFnSUNBZ0lDQWdmU2t1Wm1GdVkzbGliM2dvYjNCMGFXOXVjeWs3WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLSGRwYm1SdmR5NXNiMk5oZEdsdmJpNW9ZWE5vS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQWtZMjUwSUQwZ0pDaDNhVzVrYjNjdWJHOWpZWFJwYjI0dWFHRnphQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNna1kyNTBMbXhsYm1kMGFDQW1KaUFrWTI1MExtaGhjME5zWVhOektDZHdiM0IxY0MxamJuUW5LU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pDNW1ZVzVqZVdKdmVDNXZjR1Z1S0NSamJuUXNJRzl3ZEdsdmJuTXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lHWjFibU4wYVc5dUlHbHVhWFJUWld4bFkzUW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0x5OGdjMlZzWldOME1seHlYRzRnSUNBZ0lDQWdJQ1F1Wm00dWMyVnNaV04wTWk1a1pXWmhkV3gwY3k1elpYUW9YQ0owYUdWdFpWd2lMQ0JjSW1OMWMzUnZiVndpS1R0Y2NseHVJQ0FnSUNBZ0lDQWtMbVp1TG5ObGJHVmpkREl1WkdWbVlYVnNkSE11YzJWMEtGd2liV2x1YVcxMWJWSmxjM1ZzZEhOR2IzSlRaV0Z5WTJoY0lpd2dTVzVtYVc1cGRIa3BPMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTF6Wld4bFkzUXlKeWt1YzJWc1pXTjBNaWdwTzF4eVhHNGdJQ0FnSUNBZ0lDUW9kMmx1Wkc5M0tTNXZiaWduY21WemFYcGxKeXdnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0tDY3Vhbk10YzJWc1pXTjBNaWNwTG5ObGJHVmpkRElvS1R0Y2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUx5OGdJQ0FnSUNBZ0lDUW9KeTVxY3kxelpXeGxZM1F5SnlrdWMyVnNaV04wTWlnbmIzQmxiaWNwTzF4eVhHNGdJQ0FnSUNBZ0lDUW9YQ0l1YW5NdFlXZGxiblF0YzJWaGNtTm9YQ0lwTG5ObGJHVmpkRElvZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdWdFpUb2dKMkZuWlc1MGN5Y3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIZHBaSFJvT2lBbk1UQXdKU2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR3hoYm1kMVlXZGxPaUI3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGJuQjFkRlJ2YjFOb2IzSjBPaUJtZFc1amRHbHZiaUFvWVNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJjSXRDZjBMN1F0dEN3MEx2Umc5QzUwWUhSZ3RDd0xDRFFzdEN5MExYUXROQzQwWUxRdFNCY0lpQXJJQ2hoTG0xcGJtbHRkVzBnTFNCaExtbHVjSFYwTG14bGJtZDBhQ2tnS3lCY0lpRFF1TkM3MExnZzBMSFF2dEM3MFl6UmlOQzFJTkdCMExqUXZOQ3kwTDdRdTlDKzBMSmNJbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWVdwaGVEb2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZFhKc09pQmNJbWgwZEhCek9pOHZZWEJwTG0xNWFuTnZiaTVqYjIwdlltbHVjeTl2YTNsMmFWd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlWUjVjR1U2SUNkcWMyOXVKeXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSbGJHRjVPaUF5TlRBc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCbWRXNWpkR2x2YmlBb2NHRnlZVzF6S1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1RvZ2NHRnlZVzF6TG5SbGNtMHNJQzh2SUhObFlYSmphQ0IwWlhKdFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRmpkR2x2YmpvZ0oyRm5aVzUwWDNObFlYSmphQ2RjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIQnliMk5sYzNOU1pYTjFiSFJ6T2lCbWRXNWpkR2x2YmlBb1pHRjBZU2tnZTF4eVhHNHZMeUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1pHRjBZU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhKbGMzVnNkSE1nUFNBa0xtMWhjQ2hrWVhSaExDQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHdGxlU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1E2SUd0bGVTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSbGVIUTZJSFpoYkhWbExuQmhaMlYwYVhSc1pTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGblpXNTBPaUIyWVd4MVpWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvY21WemRXeDBjeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ6ZFd4MGN6b2djbVZ6ZFd4MGN5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOU8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaFkyaGxPaUIwY25WbFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSbGJYQnNZWFJsVW1WemRXeDBPaUJtYjNKdFlYUlNaWE4xYkhRc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSbGJYQnNZWFJsVTJWc1pXTjBhVzl1T2lCbWIzSnRZWFJUWld4bFkzUnBiMjRzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1Z6WTJGd1pVMWhjbXQxY0RvZ1puVnVZM1JwYjI0Z0tHMWhjbXQxY0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHMWhjbXQxY0R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z0x5OGdiR1YwSUc5MWNpQmpkWE4wYjIwZ1ptOXliV0YwZEdWeUlIZHZjbXRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdiV2x1YVcxMWJVbHVjSFYwVEdWdVozUm9PaUF6TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J0WVhocGJYVnRVMlZzWldOMGFXOXVUR1Z1WjNSb09pQXhMRnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR1p2Y20xaGRGSmxjM1ZzZENocGRHVnRLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNocGRHVnRMbXh2WVdScGJtY3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUFuMEwvUXZ0QzQwWUhRdXVLQXBpYzdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUNjOFpHbDJJR05zWVhOelBWd2ljMlZzWldOME1pMXlaWE4xYkhRdFlXZGxiblJjSWo0OGMzUnliMjVuUGljZ0sxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsMFpXMHVZV2RsYm5RdWNHRm5aWFJwZEd4bElDc2dKend2YzNSeWIyNW5QanhpY2o0bklDc2dhWFJsYlM1aFoyVnVkQzUyWVd4MVpTQXJJQ2M4TDJScGRqNG5PMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQm1iM0p0WVhSVFpXeGxZM1JwYjI0b2FYUmxiU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhWFJsYlM1aFoyVnVkQzV3WVdkbGRHbDBiR1U3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ1FvSnk1cWN5MWhaMlZ1ZEMxelpXRnlZMmduS1M1dmJpZ25jMlZzWldOME1qcHpaV3hsWTNRbkxDQm1kVzVqZEdsdmJpQW9aU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHRjBZU0E5SUdVdWNHRnlZVzF6TG1SaGRHRTdYSEpjYmk4dklDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWkdGMFlTazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIZHBibVJ2ZHk1c2IyTmhkR2x2YmlBOUlHUmhkR0V1WVdkbGJuUXVkWEpwWEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnWm5WdVkzUnBiMjRnYVc1cGRGWmhiR2xrWVhSbEtDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNRdWRtRnNhV1JoZEc5eUxtRmtaRTFsZEdodlpDaGNJbkJvYjI1bFhDSXNJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2daV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTV2Y0hScGIyNWhiQ2hsYkdWdFpXNTBLU0I4ZkNBdlhseGNLMXhjWkZ4Y2MxeGNLRnhjWkhzemZWeGNLVnhjYzF4Y1pIc3pmUzFjWEdSN01uMHRYRnhrZXpKOUpDOHVkR1Z6ZENoMllXeDFaU2s3WEhKY2JpQWdJQ0FnSUNBZ2ZTd2dYQ0pRYkdWaGMyVWdjM0JsWTJsbWVTQmhJSFpoYkdsa0lHMXZZbWxzWlNCdWRXMWlaWEpjSWlrN1hISmNiaUFnSUNBZ0lDQWdkbUZ5SUc5d2RHbHZibk1nUFNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdWeWNtOXlVR3hoWTJWdFpXNTBPaUJtZFc1amRHbHZiaUFvWlhKeWIzSXNJR1ZzWlcxbGJuUXBJSHQ5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5ZFd4bGN6b2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dodmJtVTZJRndpY0dodmJtVmNJbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlR0Y2NseHVJQ0FnSUNBZ0lDQWtLQ2N1YW5NdGRtRnNhV1JoZEdVbktTNWxZV05vS0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pDaDBhR2x6S1M1MllXeHBaR0YwWlNodmNIUnBiMjV6S1R0Y2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNCbWRXNWpkR2x2YmlCcGJtbDBVbVZoYkhSNVJtbHNkR1Z5Y3lncElIdGNjbHh1SUNBZ0lDQWdJQ0FrS0NjdWFuTXRabWxzZEdWeWN5MXlaV0ZzZEhrdGRIbHdaU2NwTG05dUtDZGpiR2xqYXljc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKQ2duTG1wekxXWnBiSFJsY25NdGNtVmhiSFI1TFhScGRHeGxKeWt1ZEdWNGRDZ2tLSFJvYVhNcExtUmhkR0VvSjJacGJIUmxjbk10ZEdsMGJHVW5LU2s3WEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnWm5WdVkzUnBiMjRnYVc1cGRGQmhjM04zYjNKa0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUdsbUlDZ2tLQ2N1YW5NdGNHRnpjM2R2Y21RbktTNXNaVzVuZEdnZ1BUMDlJREFwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQXZMeUJvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2WkhKdmNHSnZlQzk2ZUdOMlltNWNjbHh1SUNBZ0lDQWdJQ0FrTG1GcVlYZ29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjFjbXc2SUZ3aUxpOXFjeTlzYVdKekwzcDRZM1ppYmk1cWMxd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtZWFJoVkhsd1pUb2dYQ0p6WTNKcGNIUmNJaXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZqYUdVNklIUnlkV1ZjY2x4dUlDQWdJQ0FnSUNCOUtWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMbVJ2Ym1Vb1puVnVZM1JwYjI0Z0tITmpjbWx3ZEN3Z2RHVjRkRk4wWVhSMWN5a2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbHVhWFFvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F1Wm1GcGJDaG1kVzVqZEdsdmJpQW9hbkY0YUhJc0lITmxkSFJwYm1kekxDQmxlR05sY0hScGIyNHBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWduUlhKeWIzSWdiRzloWkdsdVp5QjZlR04yWW00bktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNWNjbHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJwYm1sMEtDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWtLQ2N1YW5NdGNHRnpjM2R2Y21RbktTNXZiaWduYTJWNWRYQW5MQ0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JQ2g2ZUdOMlltNHBJRDA5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5Ymp0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCMllXd2dQU0FrS0hSb2FYTXBMblpoYkNncExuUnlhVzBvS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpJRDBnZW5oamRtSnVLSFpoYkNrc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnVkQ0E5SUNRb2RHaHBjeWt1YzJsaWJHbHVaM01vSnk1cGJuQjFkQzFvWld4d0p5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYm5RdWNtVnRiM1psUTJ4aGMzTW9KMTh3SUY4eElGOHlJRjh6SUY4MEp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2RtRnNMbXhsYm1kMGFDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnVkQzVoWkdSRGJHRnpjeWduWHljZ0t5QnlaWE11YzJOdmNtVXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNHZMeUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExteHZaeWh5WlhNdWMyTnZjbVVwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNnbkxtcHpMWEJoYzNOM2IzSmtKeWt1YTJWNWRYQW9LVHRjY2x4dUlDQWdJQ0FnSUNCOVhISmNiaUFnSUNCOVhISmNibHh5WEc0Z0lDQWdablZ1WTNScGIyNGdhVzVwZEZKbGRtbGxkM05UYkdsa1pYSW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJQ1J6Ykdsa1pYSWdQU0FrS0NjdWFuTXRjMnhwWkdWeUxYSmxkbWxsZDNNbktUdGNjbHh1SUNBZ0lDQWdJQ0FrYzJ4cFpHVnlMbk5zYVdOcktIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1pHOTBjem9nZEhKMVpTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1lYSnliM2R6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhVzVtYVc1cGRHVTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhOc2FXUmxjMVJ2VTJodmR6b2dNeXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdabTlqZFhOUGJsTmxiR1ZqZERvZ2RISjFaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZV1JoY0hScGRtVklaV2xuYUhRNklIUnlkV1VzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1J2ZEhORGJHRnpjem9nSjNOc2FXTnJMV1J2ZEhNZ1gySnBaeWNzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSEpsYzNCdmJuTnBkbVU2SUZ0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhM0J2YVc1ME9pQmhjSEJEYjI1bWFXY3VZbkpsWVd0d2IybHVkQzVzWnl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J6WlhSMGFXNW5jem9nZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCemJHbGtaWE5VYjFOb2IzYzZJREZjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRjFjY2x4dUlDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ0pHSnBaeUE5SUNRb0p5NXlaWFpwWlhkelgxOXNhWE4wTGw5aWFXY2dMbkpsZG1sbGQzTmZYMnhwYzNSZlgybDBaVzBuS1R0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnWTNWeWNtVnVkQ0E5SURBN1hISmNiaUFnSUNBZ0lDQWdhV1lnS0NSaWFXY3ViR1Z1WjNSb0lDWW1JQ1J6Ykdsa1pYSXViR1Z1WjNSb0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lITmxkRUpwWnlncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa2MyeHBaR1Z5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMbTl1S0NkaVpXWnZjbVZEYUdGdVoyVW5MQ0JtZFc1amRHbHZiaUFvWlhabGJuUXNJSE5zYVdOckxDQmpkWEp5Wlc1MFUyeHBaR1VzSUc1bGVIUlRiR2xrWlNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTNWeWNtVnVkRk5zYVdSbElDRTlJRzVsZUhSVGJHbGtaU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMnhsWVhKQ2FXY29LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamRYSnlaVzUwSUQwZ1kzVnljbVZ1ZEZOc2FXUmxPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xtOXVLQ2RoWm5SbGNrTm9ZVzVuWlNjc0lHWjFibU4wYVc5dUlDaGxkbVZ1ZEN3Z2MyeHBZMnNzSUdOMWNuSmxiblJUYkdsa1pTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kzVnljbVZ1ZEZOc2FXUmxJQ0U5SUdOMWNuSmxiblFwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sZEVKcFp5Z3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR05zWldGeVFtbG5LQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrWW1sbkxtWmhaR1ZQZFhRb0tTNWxiWEIwZVNncE8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCelpYUkNhV2NvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNRb0p5NXFjeTF6Ykdsa1pYSXRjbVYyYVdWM2N5QXVjMnhwWTJzdFkzVnljbVZ1ZENBdWNtVjJhV1YzYzE5ZmJHbHpkRjlmYVhSbGJWOWZhVzV1WlhJbktTNWpiRzl1WlNncExtRndjR1Z1WkZSdktDUmlhV2NwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrWW1sbkxtWmhaR1ZKYmlncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa1ltbG5MbkJoY21WdWRDZ3BMbU56Y3lnbmFHVnBaMmgwSnl3Z0pHSnBaeTV2ZFhSbGNraGxhV2RvZENoMGNuVmxLU2s3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZWeHlYRzVjY2x4dUlDQWdJR1oxYm1OMGFXOXVJR2x1YVhSU1pXRnNkSGtvS1NCN1hISmNiaUFnSUNBZ0lDQWdhVzVwZENncE8xeHlYRzRnSUNBZ0lDQWdJQ1FvWkc5amRXMWxiblFwTG05dUtDZHdaRzl3WVdkbFgyeHZZV1FuTENCbWRXNWpkR2x2YmlBb1pTd2dZMjl1Wm1sbkxDQnlaWE53YjI1elpTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBibWwwS0NrN1hISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0pDaGtiMk4xYldWdWRDa3ViMjRvSjIxelpUSmZiRzloWkNjc0lHWjFibU4wYVc5dUlDaGxMQ0JrWVhSaEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbHVhWFFvS1R0Y2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCcGJtbDBLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRjbVZoYkhSNUxXeHBjM1F0YzJ4cFpHVnlXMlJoZEdFdGFXNXBkRDFjSW1aaGJITmxYQ0pkSnlrdVpXRmphQ2htZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnSkhSdloyZHNaWEp6SUQwZ0pDaDBhR2x6S1M1bWFXNWtLQ2N1YW5NdGNtVmhiSFI1TFd4cGMzUXRjMnhwWkdWeVgxOXBiV2N0ZDNKaGNIQmxjaWNwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJQ1JqYjNWdWRHVnlJRDBnSkNoMGFHbHpLUzVtYVc1a0tDY3Vhbk10Y21WaGJIUjVMV3hwYzNRdGMyeHBaR1Z5WDE5amIzVnVkR1Z5SnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtkRzluWjJ4bGNuTXVaV0ZqYUNobWRXNWpkR2x2YmlBb2FTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9kR2hwY3lrdWIyNG9KMjF2ZFhObGIzWmxjaWNzSUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKSFJ2WjJkc1pYSnpMbkpsYlc5MlpVTnNZWE56S0NkZllXTjBhWFpsSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9kR2hwY3lrdVlXUmtRMnhoYzNNb0oxOWhZM1JwZG1VbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKR052ZFc1MFpYSXVkR1Y0ZENocElDc2dNU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1FvZEdocGN5a3VaR0YwWVNnbmFXNXBkQ2NzSUNkMGNuVmxKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0JtZFc1amRHbHZiaUJwYm1sMFVtRnVaMlVvS1NCN1hISmNiaUFnSUNBZ0lDQWdKQ2duTG1wekxYSmhibWRsSnlrdVpXRmphQ2htZFc1amRHbHZiaUFvYVc1a1pYZ3NJR1ZzWlcwcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSE5zYVdSbGNpQTlJQ1FvWld4bGJTa3VabWx1WkNnbkxtcHpMWEpoYm1kbFgxOTBZWEpuWlhRbktWc3dYU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWthVzV3ZFhSeklEMGdKQ2hsYkdWdEtTNW1hVzVrS0NkcGJuQjFkQ2NwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p5YjIwZ1BTQWthVzV3ZFhSekxtWnBjbk4wS0NsYk1GMHNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHOGdQU0FrYVc1d2RYUnpMbXhoYzNRb0tWc3dYVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hOc2FXUmxjaUFtSmlCbWNtOXRJQ1ltSUhSdktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JXbHVJRDBnY0dGeWMyVkpiblFvWm5KdmJTNTJZV3gxWlNrZ2ZId2dNQ3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYldGNElEMGdjR0Z5YzJWSmJuUW9kRzh1ZG1Gc2RXVXBJSHg4SURBN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnViMVZwVTJ4cFpHVnlMbU55WldGMFpTaHpiR2xrWlhJc0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCemRHRnlkRG9nVzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdGFXNHNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzFoZUZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRjBzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMjl1Ym1WamREb2dkSEoxWlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WVc1blpUb2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FuYldsdUp6b2diV2x1TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBbmJXRjRKem9nYldGNFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MyNWhjRlpoYkhWbGN5QTlJRnRtY205dExDQjBiMTA3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCemJHbGtaWEl1Ym05VmFWTnNhV1JsY2k1dmJpZ25kWEJrWVhSbEp5d2dablZ1WTNScGIyNGdLSFpoYkhWbGN5d2dhR0Z1Wkd4bEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MyNWhjRlpoYkhWbGMxdG9ZVzVrYkdWZExuWmhiSFZsSUQwZ1RXRjBhQzV5YjNWdVpDaDJZV3gxWlhOYmFHRnVaR3hsWFNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdaeWIyMHVZV1JrUlhabGJuUk1hWE4wWlc1bGNpZ25ZMmhoYm1kbEp5d2dablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5zYVdSbGNpNXViMVZwVTJ4cFpHVnlMbk5sZENoYmRHaHBjeTUyWVd4MVpTd2diblZzYkYwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGJ5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZGphR0Z1WjJVbkxDQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMnhwWkdWeUxtNXZWV2xUYkdsa1pYSXVjMlYwS0Z0dWRXeHNMQ0IwYUdsekxuWmhiSFZsWFNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2tLR1ZzWlcwcExtaGhjME5zWVhOektDZHFjeTFqYUdWemN5MXlZVzVuWlNjcEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MyeHBaR1Z5TG01dlZXbFRiR2xrWlhJdWIyNG9KMlZ1WkNjc0lHWjFibU4wYVc5dUlDaDJZV3gxWlhNc0lHaGhibVJzWlNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLQ2RiYm1GdFpUMWNJbkJ5YVdObFgyMWhlRndpWFNjcExuUnlhV2RuWlhJb0oyTm9ZVzVuWlNjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTF3YVdOclpYSW5LUzVsWVdOb0tHWjFibU4wYVc5dUlDaHBibVJsZUN3Z1pXeGxiU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MyeHBaR1Z5SUQwZ0pDaGxiR1Z0S1M1bWFXNWtLQ2N1YW5NdGNHbGphMlZ5WDE5MFlYSm5aWFFuS1Zzd1hTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGJuQjFkQ0E5SUNRb1pXeGxiU2t1Wm1sdVpDZ25MbXB6TFhCcFkydGxjbDlmYVc1d2RYUW5LVnN3WFR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tITnNhV1JsY2lBbUppQnBibkIxZENrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUcxcGJpQTlJSEJoY25ObFNXNTBLR2x1Y0hWMExtZGxkRUYwZEhKcFluVjBaU2duYldsdUp5a3BJSHg4SURBc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMWhlQ0E5SUhCaGNuTmxTVzUwS0dsdWNIVjBMbWRsZEVGMGRISnBZblYwWlNnbmJXRjRKeWtwSUh4OElEQXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoYkNBOUlIQmhjbk5sU1c1MEtHbHVjSFYwTG5aaGJIVmxLU0I4ZkNCdGFXNDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J1YjFWcFUyeHBaR1Z5TG1OeVpXRjBaU2h6Ykdsa1pYSXNJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpkR0Z5ZERvZ2RtRnNMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnZibTVsWTNRNklGdDBjblZsTENCbVlXeHpaVjBzWEhKY2JpOHZJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JtYjNKdFlYUTZJSHRjY2x4dUx5OGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGJ6b2dablZ1WTNScGIyNGdLSFpoYkhWbEtTQjdYSEpjYmk4dklDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCd1lYSnpaVWx1ZENoMllXeDFaU2s3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNjbHh1THk4Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JtY205dE9pQm1kVzVqZEdsdmJpQW9kbUZzZFdVcElIdGNjbHh1THk4Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhaaGJIVmxPMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVMeThnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21GdVoyVTZJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSjIxcGJpYzZJRzFwYml4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0oyMWhlQ2M2SUcxaGVGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJ4cFpHVnlMbTV2VldsVGJHbGtaWEl1YjI0b0ozVndaR0YwWlNjc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBibkIxZEM1MllXeDFaU0E5SUhOc2FXUmxjaTV1YjFWcFUyeHBaR1Z5TG1kbGRDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9aV3hsYlNrdVptbHVaQ2duTG1wekxYQnBZMnRsY2w5ZmFXNXdkWFFuS1M1MGNtbG5aMlZ5S0NkamFHRnVaMlVuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JXRnpheUE5SUdsdWNIVjBMbWx1Y0hWMGJXRnphenRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYldGemF5QW1KaUJwYm5CMWRDNWpiR0Z6YzB4cGMzUXVZMjl1ZEdGcGJuTW9KMnB6TFcxaGMydGZYMkZuWlNjcEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCemRXWm1hWGdnUFNCblpYUk9kVzFGYm1ScGJtY29jR0Z5YzJWSmJuUW9jMnhwWkdWeUxtNXZWV2xUYkdsa1pYSXVaMlYwS0NrcExDQmJKOEtnMExQUXZ0QzBKeXdnSjhLZzBMUFF2dEMwMExBbkxDQW53cURRdTlDMTBZSW5YU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcxaGMyc3ViM0IwYVc5dUtIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOMVptWnBlRG9nYzNWbVptbDRYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhVzV3ZFhRdVlXUmtSWFpsYm5STWFYTjBaVzVsY2lnblkyaGhibWRsSnl3Z1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITnNhV1JsY2k1dWIxVnBVMnhwWkdWeUxuTmxkQ2gwYUdsekxuWmhiSFZsS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNCOVhISmNibHh5WEc0Z0lDQWdablZ1WTNScGIyNGdhVzVwZEVkaGJHeGxjbmtvS1NCN1hISmNiaUFnSUNBZ0lDQWdKQ2duTG1wekxXZGhiR3hsY25rdGJtRjJKeWt1YzJ4cFkyc29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtiM1J6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZWEp5YjNkek9pQjBjblZsTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwYm1acGJtbDBaVG9nWm1Gc2MyVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lITnNhV1JsYzFSdlUyaHZkem9nTml4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYzJ4cFpHVnpWRzlUWTNKdmJHdzZJREVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1p2WTNWelQyNVRaV3hsWTNRNklIUnlkV1VzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR0Z6VG1GMlJtOXlPaUFuTG1wekxXZGhiR3hsY25sZlgzTnNhV1JsY2ljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGMzQnZibk5wZG1VNklGdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmljbVZoYTNCdmFXNTBPaUJoY0hCRGIyNW1hV2N1WW5KbFlXdHdiMmx1ZEM1dFpDeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCelpYUjBhVzVuY3pvZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpiR2xrWlhOVWIxTm9iM2M2SUROY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUYwc1hISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFdkaGJHeGxjbmtuS1M1bFlXTm9LR1oxYm1OMGFXOXVJQ2hwTENCbGJDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnSkhOc2FXUmxjaUE5SUNRb1pXd3BMbVpwYm1Rb0p5NXFjeTFuWVd4c1pYSjVYMTl6Ykdsa1pYSW5LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUNSamRYSnlaVzUwSUQwZ0pDaGxiQ2t1Wm1sdVpDZ25MbXB6TFdkaGJHeGxjbmxmWDJOMWNuSmxiblFuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkhOc2FXUmxjaTV6YkdsamF5aDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrYjNSek9pQm1ZV3h6WlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnljbTkzY3pvZ2RISjFaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsdVptbHVhWFJsT2lCMGNuVmxMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzNkcGNHVlViMU5zYVdSbE9pQjBjblZsTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYTk9ZWFpHYjNJNklDY3Vhbk10WjJGc2JHVnllUzF1WVhZbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ6Y0c5dWMybDJaVG9nVzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWW5KbFlXdHdiMmx1ZERvZ1lYQndRMjl1Wm1sbkxtSnlaV0ZyY0c5cGJuUXViV1FzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGRIUnBibWR6T2lCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoY25KdmQzTTZJR1poYkhObFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmRMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKSE5zYVdSbGNpNXZiaWduWVdaMFpYSkRhR0Z1WjJVbkxDQm1kVzVqZEdsdmJpQW9aWFpsYm5Rc0lITnNhV05yTENCamRYSnlaVzUwVTJ4cFpHVXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNSamRYSnlaVzUwTG5SbGVIUW9LeXRqZFhKeVpXNTBVMnhwWkdVcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJQ1JzYVc1cmN5QTlJQ1J6Ykdsa1pYSXVabWx1WkNnbkxuTnNhV1JsT201dmRDZ3VjMnhwWTJzdFkyeHZibVZrS1NjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0tHVnNLUzVtYVc1a0tDY3Vhbk10WjJGc2JHVnllVjlmZEc5MFlXd25LUzUwWlhoMEtDUnNhVzVyY3k1c1pXNW5kR2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrYkdsdWEzTXViMjRvSjJOc2FXTnJKeXdnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtMbVpoYm1ONVltOTRMbTl3Wlc0b0lDUnNhVzVyY3l3Z2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUd4dmIzQTZJSFJ5ZFdWY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHNJQ1JzYVc1cmN5NXBibVJsZUNnZ2RHaHBjeUFwSUNrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1poYkhObE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZLaXBjY2x4dUlDQWdJQ0FxSU5DazBZUFF2ZEM2MFliUXVOR1BJTkN5MEw3UXQ5Q3kwWURRc05HSjBMRFF0ZEdDSU5DKzBMclF2dEM5MFlmUXNOQzkwTGpRdFNEUXROQzcwWThnMEx6UXZkQyswTGJRdGRHQjBZTFFzdEMxMEwzUXZkQyswTFBRdmlEUmg5QzQwWUhRdTlDd0lOR0IwTHZRdnRDeTBMQWcwTDNRc0NEUXZ0R0IwTDNRdnRDeTBMRFF2ZEM0MExnZzBZZlF1TkdCMEx2UXNDRFF1Q0RRdk5DdzBZSFJnZEM0MExMUXNDRFF2dEM2MEw3UXZkR0gwTERRdmRDNDBMbGNjbHh1SUNBZ0lDQXFJSEJoY21GdElDQnBUblZ0WW1WeUlFbHVkR1ZuWlhJZzBLZlF1TkdCMEx2UXZpRFF2ZEN3SU5DKzBZSFF2ZEMrMExMUXRTRFF1dEMrMFlMUXZ0R0EwTDdRczlDK0lOQzkwWVBRdHRDOTBMNGcwWUhSaE5DKzBZRFF2TkM0MFlEUXZ0Q3kwTERSZ3RHTUlOQyswTHJRdnRDOTBZZlFzTkM5MExqUXRWeHlYRzRnSUNBZ0lDb2djR0Z5WVcwZ0lHRkZibVJwYm1keklFRnljbUY1SU5DYzBMRFJnZEdCMExqUXNpRFJnZEM3MEw3UXNpRFF1TkM3MExnZzBMN1F1dEMrMEwzUmg5Q3cwTDNRdU5DNUlOQzAwTHZSanlEUmg5QzQwWUhRdGRDN0lDZ3hMQ0EwTENBMUtTeGNjbHh1SUNBZ0lDQXFJQ0FnSUNBZ0lDQWcwTDNRc05DLzBZRFF1TkM4MExYUmdDQmJKOUdQMExIUXU5QyswTHJRdmljc0lDZlJqOUN4MEx2UXZ0QzYwTEFuTENBbjBZL1FzZEM3MEw3UXVpZGRYSEpjYmlBZ0lDQWdLaUJ5WlhSMWNtNGdVM1J5YVc1blhISmNiaUFnSUNBZ0tpQmNjbHh1SUNBZ0lDQXFJR2gwZEhCek9pOHZhR0ZpY21Gb1lXSnlMbkoxTDNCdmMzUXZNVEExTkRJNEwxeHlYRzRnSUNBZ0lDb3ZYSEpjYmlBZ0lDQm1kVzVqZEdsdmJpQm5aWFJPZFcxRmJtUnBibWNvYVU1MWJXSmxjaXdnWVVWdVpHbHVaM01wSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnYzBWdVpHbHVaeXdnYVR0Y2NseHVJQ0FnSUNBZ0lDQnBUblZ0WW1WeUlEMGdhVTUxYldKbGNpQWxJREV3TUR0Y2NseHVJQ0FnSUNBZ0lDQnBaaUFvYVU1MWJXSmxjaUErUFNBeE1TQW1KaUJwVG5WdFltVnlJRHc5SURFNUtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lITkZibVJwYm1jZ1BTQmhSVzVrYVc1bmMxc3lYVHRjY2x4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwSUQwZ2FVNTFiV0psY2lBbElERXdPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnpkMmwwWTJnZ0tHa3BYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYzJVZ0tERXBPbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITkZibVJwYm1jZ1BTQmhSVzVrYVc1bmMxc3dYVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhjMlVnS0RJcE9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZ6WlNBb015azZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVhObElDZzBLVHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpSVzVrYVc1bklEMGdZVVZ1WkdsdVozTmJNVjA3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZbkpsWVdzN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtaV1poZFd4ME9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhORmJtUnBibWNnUFNCaFJXNWthVzVuYzFzeVhUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnYzBWdVpHbHVaenRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNCbWRXNWpkR2x2YmlCcGJtbDBTSGx3YjNSb1pXTW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFdoNWNHOTBhR1ZqSnlrdVpXRmphQ2htZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQWtZMjl6ZENBOUlDUW9kR2hwY3lrdVptbHVaQ2duTG1wekxXaDVjRzkwYUdWalgxOWpiM04wSnlrc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTI5emRDQTlJQ1JqYjNOMExuWmhiQ2dwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1J3WVhsdFpXNTBVR1Z5WTJWdWRDQTlJQ1FvZEdocGN5a3VabWx1WkNnbkxtcHpMV2g1Y0c5MGFHVmpYMTl3WVhsdFpXNTBMWEJsY21ObGJuUW5LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtjR0Y1YldWdWRGTjFiU0E5SUNRb2RHaHBjeWt1Wm1sdVpDZ25MbXB6TFdoNWNHOTBhR1ZqWDE5d1lYbHRaVzUwTFhOMWJTY3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUndZWGx0Wlc1MFUzVnRVR2xqYTJWeUlEMGdKQ2gwYUdsektTNW1hVzVrS0NjdWFuTXRjR2xqYTJWeVgxOTBZWEpuWlhRbktWc3dYU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtZV2RsSUQwZ0pDaDBhR2x6S1M1bWFXNWtLQ2N1YW5NdGFIbHdiM1JvWldOZlgyRm5aU2NwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1JqY21Wa2FYUWdQU0FrS0hSb2FYTXBMbVpwYm1Rb0p5NXFjeTFvZVhCdmRHaGxZMTlmWTNKbFpHbDBKeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKSE5zYVdSbGNpQTlJQ1FvZEdocGN5a3VabWx1WkNnbkxtcHpMV2g1Y0c5MGFHVmpYMTl6Ykdsa1pYSW5LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWthWFJsYlhNZ1BTQWtLSFJvYVhNcExtWnBibVFvSnk1cWN5MW9lWEJ2ZEdobFkxOWZhWFJsYlNjcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNSelkzSnZiR3dnUFNBa0tIUm9hWE1wTG1acGJtUW9KeTVxY3kxb2VYQnZkR2hsWTE5ZmMyTnliMnhzSnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnlZWFJsSUQwZ1cxMDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUnBkR1Z0Y3k1bFlXTm9LR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmhkR1V1Y0hWemFDaHdZWEp6WlVac2IyRjBLQ1FvZEdocGN5a3VabWx1WkNnbkxtcHpMV2g1Y0c5MGFHVmpYMTl5WVhSbEp5a3VkR1Y0ZENncExuSmxjR3hoWTJVb1hDSXNYQ0lzSUZ3aUxsd2lLU2tnZkh3Z01DazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXViRzluS0hKaGRHVXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnY21GMFpVMUZJRDBnVzEwN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNScGRHVnRjeTVsWVdOb0tHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKaGRHVk5SUzV3ZFhOb0tIQmhjbk5sUm14dllYUW9KQ2gwYUdsektTNW1hVzVrS0NjdWFuTXRhSGx3YjNSb1pXTmZYM0poZEdWTlJTY3BMblJsZUhRb0tTNXlaWEJzWVdObEtGd2lMRndpTENCY0lpNWNJaWtwSUh4OElEQXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUx5OGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloeVlYUmxUVVVwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1kzSmxaR2wwSUQwZ01EdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0ZuWlNBOUlDUmhaMlV1ZG1Gc0tDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ3WlhKalpXNTBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWtZMjl6ZEM1cGJuQjFkRzFoYzJzb1hDSnVkVzFsY21salhDSXNJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOMVptWnBlRG9nSjhLZzBZRFJnOUN4TGljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZibU52YlhCc1pYUmxPaUJtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTI5emRDQTlJQ1FvZEdocGN5a3VkbUZzS0NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkhCaGVXMWxiblJUZFcwdWNISnZjQ2duYldGNEp5d2dZMjl6ZENrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkhCaGVXMWxiblJUZFcxUWFXTnJaWEl1Ym05VmFWTnNhV1JsY2k1MWNHUmhkR1ZQY0hScGIyNXpLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21GdVoyVTZJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDZHRhVzRuT2lBd0xGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSjIxaGVDYzZJR052YzNSY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNSd1lYbHRaVzUwVTNWdExuUnlhV2RuWlhJb0oyTm9ZVzVuWlNjcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKSEJoZVcxbGJuUlRkVzB1YjI0b0oyTm9ZVzVuWlNjc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtTmxiblFnUFNBa0tIUm9hWE1wTG5aaGJDZ3BJQ29nTVRBd0lDOGdZMjl6ZER0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h3WlhKalpXNTBJRDRnTVRBd0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NHVnlZMlZ1ZENBOUlERXdNRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLSFJvYVhNcExuWmhiQ2hqYjNOMEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOeVpXUnBkQ0E5SUdOaGJHTkRjbVZrYVhRb1kyOXpkQ3dnY0dWeVkyVnVkQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2NHRjViV1Z1ZEZCbGNtTmxiblF1ZG1Gc0tIQmxjbU5sYm5RcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKR055WldScGRDNTJZV3dvWTNKbFpHbDBLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNScGRHVnRjeTVsWVdOb0tHWjFibU4wYVc5dUlDaHBMQ0JsYkNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb1pXd3BMbVpwYm1Rb0p5NXFjeTFvZVhCdmRHaGxZMTlmWm1seWMzUW5LUzUwWlhoMEtHWnZjbTFoZEZCeWFXTmxLQ1J3WVhsdFpXNTBVM1Z0TG5aaGJDZ3BLU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKQ2hsYkNrdVptbHVaQ2duTG1wekxXaDVjRzkwYUdWalgxOXdaWEp0YjI1MGFDY3BMblJsZUhRb1ptOXliV0YwVUhKcFkyVW9ZMkZzWTFCbGNrMXZiblJvS0dOeVpXUnBkQ3dnY21GMFpWdHBYU3dnWVdkbEtTa3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9aV3dwTG1acGJtUW9KeTVxY3kxb2VYQnZkR2hsWTE5ZmNHVnliVzl1ZEdoTlJTY3BMblJsZUhRb1ptOXliV0YwVUhKcFkyVW9ZMkZzWTFCbGNrMXZiblJvS0dOeVpXUnBkQ3dnY21GMFpVMUZXMmxkTENCaFoyVXBLU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdKQ2hsYkNrdVptbHVaQ2duTG1wekxXaDVjRzkwYUdWalgxOWxZMjl1YjIxNUp5a3VkR1Y0ZENobWIzSnRZWFJRY21salpTaGpZV3hqVUdWeVRXOXVkR2dvWTNKbFpHbDBMQ0J5WVhSbFcybGRMQ0JoWjJVcElDb2dNVElnS2lCaFoyVWdMU0JqWVd4alVHVnlUVzl1ZEdnb1kzSmxaR2wwTENCeVlYUmxUVVZiYVYwc0lHRm5aU2tnS2lBeE1pQXFJR0ZuWlNrcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrY0dGNWJXVnVkRk4xYlM1cGJuQjFkRzFoYzJzb1hDSnVkVzFsY21salhDSXNJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOMVptWnBlRG9nSjhLZzBZRFJnOUN4TGljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZibU52YlhCc1pYUmxPaUJtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkNoMGFHbHpLUzV3WVhKbGJuUnpLQ2N1YW5NdGNHbGphMlZ5SnlrdVptbHVaQ2duTG1wekxYQnBZMnRsY2w5ZmRHRnlaMlYwSnlsYk1GMHVibTlWYVZOc2FXUmxjaTV6WlhRb0pDaDBhR2x6S1M1MllXd29LU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa2NHRjViV1Z1ZEZOMWJTNTBjbWxuWjJWeUtDZGphR0Z1WjJVbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pHRm5aUzV2YmlnblkyaGhibWRsSnl3Z1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVdkbElEMGdKR0ZuWlM1MllXd29LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNScGRHVnRjeTVsWVdOb0tHWjFibU4wYVc5dUlDaHBMQ0JsYkNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb1pXd3BMbVpwYm1Rb0p5NXFjeTFvZVhCdmRHaGxZMTlmY0dWeWJXOXVkR2duS1M1MFpYaDBLR1p2Y20xaGRGQnlhV05sS0dOaGJHTlFaWEpOYjI1MGFDaGpjbVZrYVhRc0lISmhkR1ZiYVYwc0lHRm5aU2twS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0dWc0tTNW1hVzVrS0NjdWFuTXRhSGx3YjNSb1pXTmZYM0JsY20xdmJuUm9UVVVuS1M1MFpYaDBLR1p2Y20xaGRGQnlhV05sS0dOaGJHTlFaWEpOYjI1MGFDaGpjbVZrYVhRc0lISmhkR1ZOUlZ0cFhTd2dZV2RsS1NrcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb1pXd3BMbVpwYm1Rb0p5NXFjeTFvZVhCdmRHaGxZMTlmWldOdmJtOXRlU2NwTG5SbGVIUW9abTl5YldGMFVISnBZMlVvWTJGc1kxQmxjazF2Ym5Sb0tHTnlaV1JwZEN3Z2NtRjBaVnRwWFN3Z1lXZGxLU0FxSURFeUlDb2dZV2RsSUMwZ1kyRnNZMUJsY2sxdmJuUm9LR055WldScGRDd2djbUYwWlUxRlcybGRMQ0JoWjJVcElDb2dNVElnS2lCaFoyVXBLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pITmpjbTlzYkM1bWFXNWtLQ2N1YUhsd2IzUm9aV05mWDJ4cGMzUmZYMmwwWlcwbktTNWxZV05vS0daMWJtTjBhVzl1SUNocEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0hSb2FYTXBMbVpwYm1Rb0oyRW5LUzV2YmlnblkyeHBZMnNuTENCbWRXNWpkR2x2YmlBb1pTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVXVjSEpsZG1WdWRFUmxabUYxYkhRb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa2MyeHBaR1Z5TG5Oc2FXTnJLQ2R6YkdsamEwZHZWRzhuTENCcEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1ptbHNkR1Z5Y3l3ZzBMclFzTkMyMExUUmk5QzVJTkdCMExYUXU5QzEwTHJSZ2lEUmhOQzQwTHZSak5HQzBZRFJnOUMxMFlJZzBMN1JndEMwMExYUXU5R00wTDNRdmx4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MzUjViR1VnUFNCYlhUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pDaDBhR2x6S1M1bWFXNWtLQ2N1YW5NdGFIbHdiM1JvWldOZlgyWnBiSFJsY2ljcExtVmhZMmdvWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdaT1lXMWxJRDBnSkNoMGFHbHpLUzVrWVhSaEtDZG9lWEJ2ZEdobFl5MW1hV3gwWlhJbktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMnhoYzNOT1lXMWxJRDBnSjJacGJIUmxjaTBuSUNzZ1prNWhiV1U3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCemRIbHNaUzV3ZFhOb0tDY3VKeUFySUdOc1lYTnpUbUZ0WlNBcklDZDdaR2x6Y0d4aGVUcHViMjVsSUNGcGJYQnZjblJoYm5SOUp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ0pHTm9aV05yWW05NFpYTWdQU0FrS0hSb2FYTXBMbVpwYm1Rb0oybHVjSFYwVzNSNWNHVTlZMmhsWTJ0aWIzaGRKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa1kyaGxZMnRpYjNobGN5NXZiaWduWTJoaGJtZGxKeXdnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQWtZMmhsWTJ0bFpDQTlJQ1JqYUdWamEySnZlR1Z6TG1acGJIUmxjaWduT21Ob1pXTnJaV1FuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0pHTm9aV05yWldRdWJHVnVaM1JvS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUnBkR1Z0Y3k1eVpXMXZkbVZEYkdGemN5aGpiR0Z6YzA1aGJXVXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1ppQTlJRnRkTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBa1kyaGxZMnRsWkM1bFlXTm9LR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1l1Y0hWemFDZ25PbTV2ZENoYlpHRjBZUzFtYVd4MFpYSXRKeUFySUNRb2RHaHBjeWt1ZG1Gc0tDa2dLeUFuWFNrbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNScGRHVnRjeTVtYVd4MFpYSW9KeTVxY3kxb2VYQnZkR2hsWTE5ZmFYUmxiU2NnS3lCbUxtcHZhVzRvSnljcEtTNWhaR1JEYkdGemN5aGpiR0Z6YzA1aGJXVXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUnBkR1Z0Y3k1eVpXMXZkbVZEYkdGemN5aGpiR0Z6YzA1aGJXVXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNnblBITjBlV3hsUGljZ0t5QnpkSGxzWlM1cWIybHVLQ2NuS1NBcklDYzhMM04wZVd4bFBpY3BMbUZ3Y0dWdVpGUnZLQ2RvWldGa0p5bGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmpZV3hqVUdGNWJXVnVkQ2hqYjNOMExDQndaWEpqWlc1MEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCTllYUm9MbU5sYVd3b1kyOXpkQ0FxSUhCbGNtTmxiblFnTHlBeE1EQXBPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmpZV3hqUTNKbFpHbDBLR052YzNRc0lIQmxjbU5sYm5RcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOdmMzUWdMU0JOWVhSb0xtTmxhV3dvWTI5emRDQXFJSEJsY21ObGJuUWdMeUF4TURBcE8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCallXeGpVR1Z5VFc5dWRHZ29ZM0psWkdsMExDQnlZWFJsTENCaFoyVXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlFMWhkR2d1WTJWcGJDaGpjbVZrYVhRZ0tpQW9LSEpoZEdVZ0x5QXhNakF3TGpBcElDOGdLREV1TUNBdElFMWhkR2d1Y0c5M0tERXVNQ0FySUhKaGRHVWdMeUF4TWpBd0xqQXNJQzBvWVdkbElDb2dNVElwS1NrcEtUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1ptOXliV0YwVUhKcFkyVW9jSEpwWTJVcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhCeWFXTmxMblJ2VTNSeWFXNW5LQ2t1Y21Wd2JHRmpaU2d2TGk5bkxDQm1kVzVqZEdsdmJpQW9ZeXdnYVN3Z1lTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR2tnSmlZZ1l5QWhQVDBnWENJdVhDSWdKaVlnSVNnb1lTNXNaVzVuZEdnZ0xTQnBLU0FsSURNcElEOGdKeUFuSUNzZ1l5QTZJR003WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FrS0NjdWFuTXRhSGx3YjNSb1pXTmZYM05zYVdSbGNpY3BMbk5zYVdOcktIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1pHOTBjem9nZEhKMVpTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1lYSnliM2R6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhVzVtYVc1cGRHVTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhOc2FXUmxjMVJ2VTJodmR6b2dNU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjMnhwWkdWelZHOVRZM0p2Ykd3NklERXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmxiblJsY2sxdlpHVTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdObGJuUmxjbEJoWkdScGJtYzZJQ2N4TlhCNEp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1ptOWpkWE5QYmxObGJHVmpkRG9nZEhKMVpTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2JXOWlhV3hsUm1seWMzUTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGMzQnZibk5wZG1VNklGdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmljbVZoYTNCdmFXNTBPaUJoY0hCRGIyNW1hV2N1WW5KbFlXdHdiMmx1ZEM1dFpDQXRJREVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMlYwZEdsdVozTTZJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkc5MGN6b2dabUZzYzJVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWmhaR1U2SUhSeWRXVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1J5WVdkbllXSnNaVG9nWm1Gc2MyVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05sYm5SbGNsQmhaR1JwYm1jNklDY3djSGduWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JkWEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJQ0FnSkNnbkxtcHpMV2g1Y0c5MGFHVmpYMTl6YUc5M0xXSjBiaWNwTG05dUtDZGpiR2xqYXljc0lHWjFibU4wYVc5dUlDaGxLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1V1Y0hKbGRtVnVkRVJsWm1GMWJIUW9LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUNSMElEMGdKQ2gwYUdsektTNXdZWEpsYm5SektDY3Vhbk10YUhsd2IzUm9aV01uS1M1bWFXNWtLQ2N1YW5NdGFIbHdiM1JvWldOZlgzTm9iM2N0ZEdGeVoyVjBKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNna2RDNXNaVzVuZEdncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCdlptWnpaWFFnUFNBa2RDNXZabVp6WlhRb0tTNTBiM0FnTFNBME1EdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNna0tDY3VhR1ZoWkdWeVgxOXRZV2x1SnlrdVkzTnpLQ2R3YjNOcGRHbHZiaWNwSUQwOVBTQW5abWw0WldRbktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2IyWm1jMlYwSUMwOUlDUW9KeTVvWldGa1pYSmZYMjFoYVc0bktTNXZkWFJsY2tobGFXZG9kQ2gwY25WbEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb0oyaDBiV3dzSUdKdlpIa25LUzVoYm1sdFlYUmxLSHR6WTNKdmJHeFViM0E2SUc5bVpuTmxkSDBzSURNd01DazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQm1kVzVqZEdsdmJpQnBibWwwUkdGMFpYQnBZMnRsY2lncElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ1pHRjBaWEJwWTJ0bGNsWnBjMmxpYkdVZ1BTQm1ZV3h6WlR0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnWTI5dGJXOXVUM0IwYVc5dWN5QTlJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjRzl6YVhScGIyNDZJQ2QwYjNBZ2JHVm1kQ2NzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzl1VTJodmR6b2dablZ1WTNScGIyNGdLR2x1YzNRc0lHRnVhVzFoZEdsdmJrTnZiWEJzWlhSbFpDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnVhVzFoZEdsdmJrTnZiWEJzWlhSbFpDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUmhkR1Z3YVdOclpYSldhWE5wWW14bElEMGdkSEoxWlR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2IyNUlhV1JsT2lCbWRXNWpkR2x2YmlBb2FXNXpkQ3dnWVc1cGJXRjBhVzl1UTI5dGNHeGxkR1ZrS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWVc1cGJXRjBhVzl1UTI5dGNHeGxkR1ZrS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFpYQnBZMnRsY2xacGMybGliR1VnUFNCbVlXeHpaVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYjI1VFpXeGxZM1E2SUdaMWJtTjBhVzl1SUNobWIzSnRZWFIwWldSRVlYUmxMQ0JrWVhSbExDQnBibk4wS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBibk4wTGlSbGJDNTBjbWxuWjJWeUtDZGphR0Z1WjJVbktUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJSDA3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFdSaGRHVjBhVzFsY0dsamEyVnlKeWt1WkdGMFpYQnBZMnRsY2loUFltcGxZM1F1WVhOemFXZHVLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdiV2x1UkdGMFpUb2dibVYzSUVSaGRHVW9LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkR2x0WlhCcFkydGxjam9nZEhKMVpTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1pHRjBaVlJwYldWVFpYQmhjbUYwYjNJNklDY3NJQ2NzWEhKY2JpQWdJQ0FnSUNBZ2ZTd2dZMjl0Ylc5dVQzQjBhVzl1Y3lrcE8xeHlYRzRnSUNBZ0lDQWdJQ1FvSnk1cWN5MWtZWFJsY0dsamEyVnlMWEpoYm1kbEp5a3VaV0ZqYUNobWRXNWpkR2x2YmlBb1pXd3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUcxcGJpQTlJRzVsZHlCRVlYUmxLQ1FvZEdocGN5a3VaR0YwWVNnbmJXbHVKeWtwSUh4OElHNTFiR3dzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiV0Y0SUQwZ2JtVjNJRVJoZEdVb0pDaDBhR2x6S1M1a1lYUmhLQ2R0WVhnbktTa2dmSHdnYm1WM0lFUmhkR1VvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNoMGFHbHpLUzVrWVhSbGNHbGphMlZ5S0U5aWFtVmpkQzVoYzNOcFoyNG9lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYldsdVJHRjBaVG9nYldsdUxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiV0Y0UkdGMFpUb2diV0Y0TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtRnVaMlU2SUhSeWRXVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0ZFd4MGFYQnNaVVJoZEdWelUyVndZWEpoZEc5eU9pQW5JQzBnSnl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z1kyOXRiVzl1VDNCMGFXOXVjeWtwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHRjBaWEJwWTJ0bGNpQTlJQ1FvZEdocGN5a3VaR0YwWVNnblpHRjBaWEJwWTJ0bGNpY3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtZWFJsY0dsamEyVnlMbk5sYkdWamRFUmhkR1VvVzIxcGJpd2diV0Y0WFNrN1hISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFdSaGRHVjBhVzFsY0dsamEyVnlMQ0F1YW5NdFpHRjBaWEJwWTJ0bGNpMXlZVzVuWlNjcExtOXVLQ2RqYkdsamF5Y3NJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUmhkR1Z3YVdOclpYSldhWE5wWW14bEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHRjBaWEJwWTJ0bGNpQTlJQ1FvSnk1cWN5MWtZWFJsZEdsdFpYQnBZMnRsY2l3Z0xtcHpMV1JoZEdWd2FXTnJaWEl0Y21GdVoyVW5LUzVrWVhSaEtDZGtZWFJsY0dsamEyVnlKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmxjR2xqYTJWeUxtaHBaR1VvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUdaMWJtTjBhVzl1SUdsdWFYUlRZM0p2Ykd4aVlYSW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFhOamNtOXNiR0poY2ljcExuTmpjbTlzYkdKaGNpZ3BPMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQjNJRDBnSkNoM2FXNWtiM2NwTG05MWRHVnlWMmxrZEdnb0tUdGNjbHh1SUNBZ0lDQWdJQ0JwWmlBb2R5QThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG0xa0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelkzSnZiR3hpWVhJdGMyMG5LUzV6WTNKdmJHeGlZWElvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNnbkxtcHpMWE5qY205c2JHSmhjaTF6YlMxdFpDY3BMbk5qY205c2JHSmhjaWdwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0JwWmlBb2R5QThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG14bktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelkzSnZiR3hpWVhJdGMyMHRiV1FuS1M1elkzSnZiR3hpWVhJb0tUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ2FXWWdLSGNnUGowZ1lYQndRMjl1Wm1sbkxtSnlaV0ZyY0c5cGJuUXViV1FnSmlZZ2R5QThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG14bktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelkzSnZiR3hpWVhJdGJXUW5LUzV6WTNKdmJHeGlZWElvS1R0Y2NseHVJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tIY2dQajBnWVhCd1EyOXVabWxuTG1KeVpXRnJjRzlwYm5RdWJXUXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKQ2duTG1wekxYTmpjbTlzYkdKaGNpMXRaQzFzWnljcExuTmpjbTlzYkdKaGNpZ3BPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQnBaaUFvZHlBK1BTQmhjSEJEYjI1bWFXY3VZbkpsWVd0d2IybHVkQzVzWnlrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBa0tDY3Vhbk10YzJOeWIyeHNZbUZ5TFd4bkp5a3VjMk55YjJ4c1ltRnlLQ2s3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJQ1FvZDJsdVpHOTNLUzV2YmlnbmNtVnphWHBsSnl3Z1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSkNoM2FXNWtiM2NwTG05MWRHVnlWMmxrZEdnb0tTQThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG0xa0tTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMk55YjJ4c1ltRnlMWE50SnlrdWMyTnliMnhzWW1GeUtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWtLQ2N1YW5NdGMyTnliMnhzWW1GeUxYTnRKeWt1YzJOeWIyeHNZbUZ5S0Nka1pYTjBjbTk1SnlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDUW9kMmx1Wkc5M0tTNXZkWFJsY2xkcFpIUm9LQ2tnUGowZ1lYQndRMjl1Wm1sbkxtSnlaV0ZyY0c5cGJuUXViV1JjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQW1KaUFrS0hkcGJtUnZkeWt1YjNWMFpYSlhhV1IwYUNncElEd2dZWEJ3UTI5dVptbG5MbUp5WldGcmNHOXBiblF1YkdjcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ1FvSnk1cWN5MXpZM0p2Ykd4aVlYSXRiV1FuS1M1elkzSnZiR3hpWVhJb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9KeTVxY3kxelkzSnZiR3hpWVhJdGJXUW5LUzV6WTNKdmJHeGlZWElvSjJSbGMzUnliM2tuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2R5QThJR0Z3Y0VOdmJtWnBaeTVpY21WaGEzQnZhVzUwTG14bktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMk55YjJ4c1ltRnlMWE50TFcxa0p5a3VjMk55YjJ4c1ltRnlLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMk55YjJ4c1ltRnlMWE50TFcxa0p5a3VjMk55YjJ4c1ltRnlLQ2RrWlhOMGNtOTVKeWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0NRb2QybHVaRzkzS1M1dmRYUmxjbGRwWkhSb0tDa2dQajBnWVhCd1EyOXVabWxuTG1KeVpXRnJjRzlwYm5RdWJXUXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb0p5NXFjeTF6WTNKdmJHeGlZWEl0YldRdGJHY25LUzV6WTNKdmJHeGlZWElvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNRb0p5NXFjeTF6WTNKdmJHeGlZWEl0YldRdGJHY25LUzV6WTNKdmJHeGlZWElvSjJSbGMzUnliM2tuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0pDaDNhVzVrYjNjcExtOTFkR1Z5VjJsa2RHZ29LU0ErUFNCaGNIQkRiMjVtYVdjdVluSmxZV3R3YjJsdWRDNXNaeWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pDZ25MbXB6TFhOamNtOXNiR0poY2kxc1p5Y3BMbk5qY205c2JHSmhjaWdwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkNnbkxtcHpMWE5qY205c2JHSmhjaTFzWnljcExuTmpjbTlzYkdKaGNpZ25aR1Z6ZEhKdmVTY3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaTh2SUNBZ0lDQWdJQ0FrS0NjdWFuTXRjMk55YjJ4c1ltRnlMV2h2ZENjcExuTmpjbTlzYkdKaGNpZ3BPMXh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUM4cUtseHlYRzRnSUNBZ0lDb2cwSi9SZ05DKzBMclJnTkdEMFlMUXV0Q3dJTkMvMEw0ZzBZSFJnZEdMMEx2UXV0QzFJTkMwMEw0ZzBZM1F1OUMxMEx6UXRkQzkwWUxRc0Z4eVhHNGdJQ0FnSUNvdlhISmNiaUFnSUNCbWRXNWpkR2x2YmlCcGJtbDBVMk55YjJ4c0tDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTF6WTNKdmJHd25LUzV2YmlnblkyeHBZMnNuTENCbWRXNWpkR2x2YmlBb1pTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmxMbkJ5WlhabGJuUkVaV1poZFd4MEtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUFrZEdGeVoyVjBJRDBnSkNna0tIUm9hWE1wTG1GMGRISW9KMmh5WldZbktTazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2drZEdGeVoyVjBMbXhsYm1kMGFDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHOW1abk5sZENBOUlDUjBZWEpuWlhRdWIyWm1jMlYwS0NrdWRHOXdJQzBnTkRBN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSkNnbkxtaGxZV1JsY2w5ZmJXRnBiaWNwTG1OemN5Z25jRzl6YVhScGIyNG5LU0E5UFQwZ0oyWnBlR1ZrSnlrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUc5bVpuTmxkQ0F0UFNBa0tDY3VhR1ZoWkdWeVgxOXRZV2x1SnlrdWIzVjBaWEpJWldsbmFIUW9kSEoxWlNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0pDZ25MbWhsWVdSbGNpY3BMbU56Y3lnbmNHOXphWFJwYjI0bktTQTlQVDBnSjJacGVHVmtKeWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzltWm5ObGRDQXRQU0FrS0NjdWFHVmhaR1Z5SnlrdWIzVjBaWEpJWldsbmFIUW9LVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDUW9KMmgwYld3c1ltOWtlU2NwTG1GdWFXMWhkR1VvZTNOamNtOXNiRlJ2Y0RvZ2IyWm1jMlYwZlN3Z016QXdLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ1puVnVZM1JwYjI0Z2FXNXBkRUZpYjNWMEtDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTFoWW05MWRDMW9lWE4wYjNKNVgxOTVaV0Z5TFhOc2FXUmxjaWNwTG5Oc2FXTnJLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdaRzkwY3pvZ1ptRnNjMlVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR0Z5Y205M2N6b2dabUZzYzJVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsdVptbHVhWFJsT2lCMGNuVmxMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnpiR2xrWlhOVWIxTm9iM2M2SURVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhOc2FXUmxjMVJ2VTJOeWIyeHNPaUF4TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JqWlc1MFpYSk5iMlJsT2lCMGNuVmxMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJaWEowYVdOaGJEb2dkSEoxWlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWTJWdWRHVnlVR0ZrWkdsdVp6b2dKelV3Y0hnbkxGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCaGMwNWhka1p2Y2pvZ0p5NXFjeTFoWW05MWRDMW9lWE4wYjNKNVgxOWpiMjUwWlc1MExYTnNhV1JsY2ljc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdadlkzVnpUMjVUWld4bFkzUTZJSFJ5ZFdVc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUcxdlltbHNaVVpwY25OME9pQjBjblZsTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOd2IyNXphWFpsT2lCYlhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3R3YjJsdWREb2dZWEJ3UTI5dVptbG5MbUp5WldGcmNHOXBiblF1YldRZ0xTQXhMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITmxkSFJwYm1kek9pQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05sYm5SbGNsQmhaR1JwYm1jNklDYzNNSEI0SjF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWFZ4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUNRb0p5NXFjeTFoWW05MWRDMW9lWE4wYjNKNVgxOTVaV0Z5TFhOc2FXUmxjaWNwTG05dUtDZGlaV1p2Y21WRGFHRnVaMlVuTENCbWRXNWpkR2x2YmlBb1pYWmxiblFzSUhOc2FXTnJMQ0JqZFhKeVpXNTBVMnhwWkdVc0lHNWxlSFJUYkdsa1pTa2dlMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aHpiR2xqYXlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNRb2RHaHBjeWt1Wm1sdVpDZ25MbDl6YVdKc2FXNW5KeWt1Y21WdGIzWmxRMnhoYzNNb0oxOXphV0pzYVc1bkp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9jMnhwWTJzdUpITnNhV1JsYzF0dVpYaDBVMnhwWkdWZEtTNXVaWGgwS0NrdVlXUmtRMnhoYzNNb0oxOXphV0pzYVc1bkp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDUW9jMnhwWTJzdUpITnNhV1JsYzF0dVpYaDBVMnhwWkdWZEtTNXdjbVYyS0NrdVlXUmtRMnhoYzNNb0oxOXphV0pzYVc1bkp5azdYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdKQ2duTG1wekxXRmliM1YwTFdoNWMzUnZjbmxmWDJOdmJuUmxiblF0YzJ4cFpHVnlKeWt1YzJ4cFkyc29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmtiM1J6T2lCbVlXeHpaU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZWEp5YjNkek9pQm1ZV3h6WlN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYVc1bWFXNXBkR1U2SUhSeWRXVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lITnNhV1JsYzFSdlUyaHZkem9nTVN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYzJ4cFpHVnpWRzlUWTNKdmJHdzZJREVzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR1poWkdVNklIUnlkV1VzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR0Z6VG1GMlJtOXlPaUFuTG1wekxXRmliM1YwTFdoNWMzUnZjbmxmWDNsbFlYSXRjMnhwWkdWeUp5eGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1lXUmhjSFJwZG1WSVpXbG5hSFE2SUhSeWRXVXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHUnlZV2RuWVdKc1pUb2dabUZzYzJWY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNCbWRXNWpkR2x2YmlCcGJtbDBSbWxzWldsdWNIVjBLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDUW9KeTVxY3kxbWFXeGxhVzV3ZFhSZlgyTnVkQ2NwTG1WaFkyZ29ablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrS0hSb2FYTXBMbVJoZEdFb0oyUmxabUYxYkhRbkxDQWtLSFJvYVhNcExuUmxlSFFvS1NrN1hISmNiaUFnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0pDZ25MbXB6TFdacGJHVnBibkIxZENjcExtOXVLQ2RqYUdGdVoyVW5MQ0JtZFc1amRHbHZiaUFvWlNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kR2hwY3k1bWFXeGxjeWtnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR1pwYkdWT1lXMWxJRDBnSkNoMGFHbHpLUzUyWVd3b0tTNXpjR3hwZENnblhGeGNYQ2NwTG5CdmNDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkNoMGFHbHpLUzV3WVhKbGJuUW9LUzVtYVc1a0tDY3Vhbk10Wm1sc1pXbHVjSFYwWDE5amJuUW5LUzUwWlhoMEtHWnBiR1ZPWVcxbEtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lHWjFibU4wYVc5dUlHbHVhWFJCYm5ScGMzQmhiU2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQnpaWFJVYVcxbGIzVjBLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNnbmFXNXdkWFJiYm1GdFpUMWNJbVZ0WVdsc00xd2lYU3hwYm5CMWRGdHVZVzFsUFZ3aWFXNW1iMXdpWFN4cGJuQjFkRnR1WVcxbFBWd2lkR1Y0ZEZ3aVhTY3BMbUYwZEhJb0ozWmhiSFZsSnl3Z0p5Y3BMblpoYkNnbkp5azdYSEpjYmlBZ0lDQWdJQ0FnZlN3Z05UQXdNQ2s3WEhKY2JpQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ1puVnVZM1JwYjI0Z2FXNXBkRUZzY0doaFltVjBLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDUW9KeTVxY3kxaGJIQm9ZV0psZENCcGJuQjFkQ2NwTG05dUtDZGphR0Z1WjJVbkxDQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ1FvSnk1cWN5MWhiSEJvWVdKbGRDQnNhU2NwTG5KbGJXOTJaVU5zWVhOektDZGZZV04wYVhabEp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2drS0hSb2FYTXBMbkJ5YjNBb0oyTm9aV05yWldRbktTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSkNoMGFHbHpLUzV3WVhKbGJuUnpLQ2RzYVNjcExtRmtaRU5zWVhOektDZGZZV04wYVhabEp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQWtLQ2N1YW5NdFlXeHdhR0ZpWlhRZ1lTY3BMbTl1S0NkamJHbGpheWNzSUdaMWJtTjBhVzl1SUNobEtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHVXVjSEpsZG1WdWRFUmxabUYxYkhRb0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pDZ25MbXB6TFdGc2NHaGhZbVYwSUd4cEp5a3VjbVZ0YjNabFEyeGhjM01vSjE5aFkzUnBkbVVuS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkNoMGFHbHpLUzV3WVhKbGJuUnpLQ2RzYVNjcExtRmtaRU5zWVhOektDZGZZV04wYVhabEp5azdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdiVk5sWVhKamFESWdJVDA5SUNkMWJtUmxabWx1WldRbktTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J0VTJWaGNtTm9NaTV5WlhObGRDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNCOVhISmNibHh5WEc1OUtUdGNjbHh1THk4aklITnZkWEpqWlUxaGNIQnBibWRWVWt3OVpHRjBZVHBoY0hCc2FXTmhkR2x2Ymk5cWMyOXVPMk5vWVhKelpYUTlkWFJtT0R0aVlYTmxOalFzWlhsS01scFlTbnBoVnpsMVNXcHZla3hEU25WWlZ6RnNZM2xKTmxjeE1ITkpiVEZvWTBoQ2NHSnRaSHBKYW05cFNXbDNhV015T1RGamJVNXNZM2xKTmxkNVNtcGlNakYwWWpJMGRXRnVUV2xZVTNkcFl6STVNV050VG14ak1FNTJZbTVTYkdKdVVXbFBiSE5wWVd4R01WcFlTalZMUjFveFltMU9NR0ZYT1hWSlEyZHdTVWgwWTJOc2VIVkpRMEZuU1VaM2FXUllUbXhKU0U0d1kyMXNhbVJHZDJsUE1YaDVXRWMxWTJOc2VIVkpRMEZuU1VOUmIxcEhPV3BrVnpGc1ltNVJjRXh1U214WlYxSTFTMGRhTVdKdFRqQmhWemwxU1VObmNFbElkR05qYkhoMVdFaEtZMkpwUVdkSlEwSTVTMVIwWTJOc2VIVkpRMEZuU1VaNGVWaEhOVGxMVkhOcFdGTjNhVnB0YkhOYVUwazJTVzFPZG1KWE1YWmlhVFZ4WTNsS09TSmRMQ0ptYVd4bElqb2lZMjl0Ylc5dUxtcHpJbjA9Il0sImZpbGUiOiJjb21tb24uanMifQ==
