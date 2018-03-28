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
    }

    function initGallery() {
        $('.js-gallery-nav').slick({
            dots: false,
            arrows: true,
            infinite: false,
            slidesToShow: 6,
            slidesToScroll: 1,
            focusOnSelect: true,
            asNavFor: '.js-gallery',
            responsive: [
                {
                    breakpoint: appConfig.breakpoint.md,
                    settings: {
                        slidesToShow: 3
                    }
                }
            ],
        });
        $('.js-gallery').slick({
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
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRUYWJzKCk7XHJcbiAgICAgICAgaW5pdFJhbmdlKCk7XHJcbiAgICAgICAgaW5pdEdhbGxlcnkoKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuLy8gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFpblNsaWRlcigpIHtcclxuICAgICAgICB2YXIgdGltZSA9IGFwcENvbmZpZy5zbGlkZXJBdXRvcGxheVNwZWVkIC8gMTAwMDtcclxuICAgICAgICB2YXIgJGJhciA9ICQoJy5qcy1tYWluLXNsaWRlci1iYXInKSxcclxuICAgICAgICAgICAgICAgICRzbGljayA9ICQoJy5qcy1zbGlkZXItbWFpbicpLFxyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdGljayxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lO1xyXG5cclxuICAgICAgICBpZiAoJHNsaWNrLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAkc2xpY2suc2xpY2soe1xyXG4gICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZmFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc3BlZWQ6IGFwcENvbmZpZy5zbGlkZXJGYWRlU3BlZWRcclxuLy8gICAgICAgICAgICBhdXRvcGxheVNwZWVkOiBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCxcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2xpY2sub24oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGUgPCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX3JpZ2h0Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW25leHRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfbGVmdCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aWNrKTtcclxuICAgICAgICAgICAgJGJhci5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4gICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkucmVtb3ZlQ2xhc3MoJ19mYWRlIF9sZWZ0IF9yaWdodCcpO1xyXG4gICAgICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzbGljay5vbih7XHJcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb3VzZWxlYXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdGFydFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICByZXNldFByb2dyZXNzYmFyKCk7XHJcbiAgICAgICAgICAgIHBlcmNlbnRUaW1lID0gMDtcclxuLy8gICAgICAgICAgICBpc1BhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpY2sgPSBzZXRJbnRlcnZhbChpbnRlcnZhbCwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW50ZXJ2YWwoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdXNlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcGVyY2VudFRpbWUgKz0gMSAvICh0aW1lICsgMC4xKTtcclxuICAgICAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRpbWUgKyBcIiVcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFRpbWUgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNsaWNrLnNsaWNrKCdzbGlja05leHQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2V0UHJvZ3Jlc3NiYXIoKSB7XHJcbiAgICAgICAgICAgICRiYXIuY3NzKHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAwICsgJyUnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGFydFByb2dyZXNzYmFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTbWFsbFNsaWRlcnMoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGwuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzIC5hZ2VudHMtbGlzdF9faXRlbScpLm9mZignY2xpY2snKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHM6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcyNSUnLFxyXG4vLyAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnODBweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMnKS5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50cy5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA+PSBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50cyAuYWdlbnRzLWxpc3RfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKCcuanMtc2xpZGVyLWFnZW50cycpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB2YXIgJGFnZW50ID0gJCgnLmpzLXNsaWRlci1hZ2VudHMgLl9hY3RpdmUgLmpzLXNsaWRlci1hZ2VudHNfX3Nob3J0Jyk7XHJcbiAgICAgICAgICAgIHZhciAkZnVsbCA9ICQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsX19pbWcnKS5hdHRyKCdzcmMnLCAkYWdlbnQuZGF0YSgnYWdlbnQtaW1nJykpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9fbmFtZScpLnRleHQoJGFnZW50LmRhdGEoJ2FnZW50LW5hbWUnKSk7XHJcbiAgICAgICAgICAgIHZhciBwaG9uZSA9ICRhZ2VudC5kYXRhKCdhZ2VudC1waG9uZScpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9fcGhvbmUgYScpLnRleHQocGhvbmUpLmF0dHIoJ2hyZWYnLCAndGVsOicgKyBwaG9uZS5yZXBsYWNlKC9bLVxcc10vZywgJycpKTtcclxuICAgICAgICAgICAgdmFyIGxpbmsgPSAkYWdlbnQuZGF0YSgnYWdlbnQtbGluaycpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9fbGluayBhJykudGV4dChsaW5rKS5hdHRyKCdocmVmJywgJy8vOicgKyBsaW5rKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1lbnUoKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudSAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudSAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuanMtbWVudSAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCdkZXN0cm95Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51JykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLnRvZ2dsZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykuY2xpY2soKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJzppbnB1dCcpLmlucHV0bWFzaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkLmZhbmN5Ym94LmNsb3NlKCk7XHJcbiAgICAgICAgfSkuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgLy8gY3VzdG9tIHNlbGVjdFxyXG4gICAgICAgICQoJy5qcy1zZWxlY3Qtc2VhcmNoJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyICRpdGVtcyA9ICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2l0ZW0nKTtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3NlbGVjdC1zZWFyY2gnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID09PSAwID8gJCh0aGlzKS5zaG93KCkgOiAkKHRoaXMpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW1zLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdF9fdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQodGhpcykucGFyZW50cygnLmpzLXNlbGVjdCcpLmFkZENsYXNzKCdfYWN0aXZlJykudG9nZ2xlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLm5vdCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX29wZW5lZCBfYWN0aXZlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gc2VsZWN0MlxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QyKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICAgICAgdGhlbWU6ICdjdXN0b20nLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bVJlc3VsdHNGb3JTZWFyY2g6IEluZmluaXR5LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5pdFNlbGVjdDIoKTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaW5pdFNlbGVjdDIoKTtcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWYWxpZGF0ZSgpIHtcclxuICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoXCJwaG9uZVwiLCBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uYWwoZWxlbWVudCkgfHwgL15cXCtcXGRcXHNcXChcXGR7M31cXClcXHNcXGR7M30tXFxkezJ9LVxcZHsyfSQvLnRlc3QodmFsdWUpO1xyXG4gICAgICAgIH0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBtb2JpbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7fSxcclxuICAgICAgICAgICAgcnVsZXM6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcInBob25lXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXZhbGlkYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudmFsaWRhdGUob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eUZpbHRlcnMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXR5cGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10aXRsZScpLnRleHQoJCh0aGlzKS5kYXRhKCdmaWx0ZXJzLXRpdGxlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXNzd29yZCgpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXBhc3N3b3JkJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi4vanMvbGlicy96eGN2Ym4uanNcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChzY3JpcHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24gKGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgenhjdmJuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoenhjdmJuKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHp4Y3Zibih2YWwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpO1xyXG4gICAgICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMyBfNCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgcmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZXZpZXdzU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciAkc2xpZGVyID0gJCgnLmpzLXNsaWRlci1yZXZpZXdzJyk7XHJcbiAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkb3RzQ2xhc3M6ICdzbGljay1kb3RzIF9iaWcnLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyICRiaWcgPSAkKCcucmV2aWV3c19fbGlzdC5fYmlnIC5yZXZpZXdzX19saXN0X19pdGVtJyk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAwO1xyXG4gICAgICAgIGlmICgkYmlnLmxlbmd0aCAmJiAkc2xpZGVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgJHNsaWRlclxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyQmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjbGVhckJpZygpIHtcclxuICAgICAgICAgICAgJGJpZy5mYWRlT3V0KCkuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmlnKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXJldmlld3MgLnNsaWNrLWN1cnJlbnQgLnJldmlld3NfX2xpc3RfX2l0ZW1fX2lubmVyJykuY2xvbmUoKS5hcHBlbmRUbygkYmlnKTtcclxuICAgICAgICAgICAgJGJpZy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgJGJpZy5wYXJlbnQoKS5jc3MoJ2hlaWdodCcsICRiaWcub3V0ZXJIZWlnaHQodHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5KCkge1xyXG4gICAgICAgICQoJy5qcy1yZWFsdHktbGlzdC1zbGlkZXInKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0b2dnbGVycyA9ICQodGhpcykuZmluZCgnLmpzLXJlYWx0eS1saXN0LXNsaWRlcl9faW1nLXdyYXBwZXInKTtcclxuICAgICAgICAgICAgdmFyICRjb3VudGVyID0gJCh0aGlzKS5maW5kKCcuanMtcmVhbHR5LWxpc3Qtc2xpZGVyX19jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRjb3VudGVyLnRleHQoaSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUYWJzKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICB0YWJzOiAnLmpzLXRhYnNfX2xpc3QgPiBsaSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkLCAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKS52YWwoJGNsaWNrZWQuYXR0cignaHJlZicpKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3NldFBvc2l0aW9uJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicygnc2VsZWN0JywgJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSYW5nZSgpIHtcclxuICAgICAgICAkKCcuanMtcmFuZ2UnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVyID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX3RhcmdldCcpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAkKGVsZW0pLmZpbmQoJy5qcy1yYW5nZV9fZnJvbScpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvID0gJChlbGVtKS5maW5kKCcuanMtcmFuZ2VfX3RvJylbMF07XHJcbiAgICAgICAgICAgIGlmIChzbGlkZXIgJiYgZnJvbSAmJiB0bykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KGZyb20udmFsdWUpIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IHBhcnNlSW50KHRvLnZhbHVlKSB8fCAwO1xyXG4gICAgICAgICAgICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Q6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21pbic6IG1pbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ21heCc6IG1heFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNuYXBWYWx1ZXMgPSBbZnJvbSwgdG9dO1xyXG4gICAgICAgICAgICAgICAgc2xpZGVyLm5vVWlTbGlkZXIub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICh2YWx1ZXMsIGhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNuYXBWYWx1ZXNbaGFuZGxlXS52YWx1ZSA9IE1hdGgucm91bmQodmFsdWVzW2hhbmRsZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmcm9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXIubm9VaVNsaWRlci5zZXQoW3RoaXMudmFsdWUsIG51bGxdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdG8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlci5ub1VpU2xpZGVyLnNldChbbnVsbCwgdGhpcy52YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2FsbGVyeSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FsbGVyeS1uYXYnKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TaG93OiA2LFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeScsXHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50OiBhcHBDb25maWcuYnJlYWtwb2ludC5tZCxcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLWdhbGxlcnknKS5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnJvd3M6IHRydWUsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiBmYWxzZSxcclxuICAgICAgICAgICAgYXNOYXZGb3I6ICcuanMtZ2FsbGVyeS1uYXYnLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGY4O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lJaXdpYzI5MWNtTmxjeUk2V3lKamIyMXRiMjR1YW5NaVhTd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lhbEYxWlhKNUtHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJRndpZFhObElITjBjbWxqZEZ3aU8xeHlYRzVjY2x4dUlDQWdJQ1FvWkc5amRXMWxiblFwTG5KbFlXUjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVYSEpjYmlBZ0lDQjlLVHRjY2x4dUlDQWdJRnh5WEc1OUtUc2lYU3dpWm1sc1pTSTZJbU52YlcxdmJpNXFjeUo5Il0sImZpbGUiOiJjb21tb24uanMifQ==
