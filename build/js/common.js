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
        $('.js-select2').select2({
            theme: 'custom',
            minimumResultsForSearch: Infinity,
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
        $('.js-realty__list__item__img-wrapper').each(function () {
            var $togglers = $(this).find('.js-realty__list__item__img-inner');
            var $counter = $(this).find('.js-realty__list__item__img-counter');
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
            $(elem).bind('easytabs:after', function (event, $clicked) {
                $(elem).find('.js-tabs__select').val($clicked.attr('href')).change();
            });
            $(elem).find('.js-tabs__select').on('change', function () {
                $(elem).easytabs('select', $(this).val());
            });
        });
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0TWFpblNsaWRlcigpO1xyXG4gICAgICAgIGluaXRTbWFsbFNsaWRlcnMoKTtcclxuICAgICAgICBpbml0UmV2aWV3c1NsaWRlcigpO1xyXG4gICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgICAgIGluaXRNYXNrKCk7XHJcbiAgICAgICAgaW5pdFBvcHVwKCk7XHJcbiAgICAgICAgaW5pdFNlbGVjdCgpO1xyXG4gICAgICAgIGluaXRWYWxpZGF0ZSgpO1xyXG4gICAgICAgIGluaXRSZWFsdHlGaWx0ZXJzKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eSgpO1xyXG4gICAgICAgIGluaXRQYXNzd29yZCgpO1xyXG4gICAgICAgIGluaXRUYWJzKCk7XHJcblxyXG4gICAgICAgICQoJy5qcy1zY3JvbGxiYXInKS5zY3JvbGxiYXIoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbi8vICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1haW5TbGlkZXIoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBhcHBDb25maWcuc2xpZGVyQXV0b3BsYXlTcGVlZCAvIDEwMDA7XHJcbiAgICAgICAgdmFyICRiYXIgPSAkKCcuanMtbWFpbi1zbGlkZXItYmFyJyksXHJcbiAgICAgICAgICAgICAgICAkc2xpY2sgPSAkKCcuanMtc2xpZGVyLW1haW4nKSxcclxuICAgICAgICAgICAgICAgIGlzUGF1c2UgPSBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRpY2ssXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50VGltZTtcclxuXHJcbiAgICAgICAgaWYgKCRzbGljay5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgJHNsaWNrLnNsaWNrKHtcclxuICAgICAgICAgICAgZG90czogdHJ1ZSxcclxuICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgIGZhZGU6IHRydWUsXHJcbiAgICAgICAgICAgIHNwZWVkOiBhcHBDb25maWcuc2xpZGVyRmFkZVNwZWVkXHJcbi8vICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogYXBwQ29uZmlnLnNsaWRlckF1dG9wbGF5U3BlZWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNsaWNrLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUsIG5leHRTbGlkZSkge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlIDwgbmV4dFNsaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9sZWZ0Jyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbbmV4dFNsaWRlXSkuYWRkQ2xhc3MoJ19mYWRlIF9yaWdodCcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfZmFkZSBfcmlnaHQnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5hZGRDbGFzcygnX2ZhZGUgX2xlZnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGljayk7XHJcbiAgICAgICAgICAgICRiYXIuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzbGljay5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLnJlbW92ZUNsYXNzKCdfZmFkZSBfbGVmdCBfcmlnaHQnKTtcclxuICAgICAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkc2xpY2sub24oe1xyXG4gICAgICAgICAgICBtb3VzZWVudGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BhdXNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbW91c2VsZWF2ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc3RhcnRQcm9ncmVzc2JhcigpIHtcclxuICAgICAgICAgICAgcmVzZXRQcm9ncmVzc2JhcigpO1xyXG4gICAgICAgICAgICBwZXJjZW50VGltZSA9IDA7XHJcbi8vICAgICAgICAgICAgaXNQYXVzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aWNrID0gc2V0SW50ZXJ2YWwoaW50ZXJ2YWwsIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGludGVydmFsKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNQYXVzZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRUaW1lICs9IDEgLyAodGltZSArIDAuMSk7XHJcbiAgICAgICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUaW1lICsgXCIlXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRUaW1lID49IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzbGljay5zbGljaygnc2xpY2tOZXh0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXNldFByb2dyZXNzYmFyKCkge1xyXG4gICAgICAgICAgICAkYmFyLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogMCArICclJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhcnRQcm9ncmVzc2JhcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U21hbGxTbGlkZXJzKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbDpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMTVweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXNtYWxsLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50cyAuYWdlbnRzLWxpc3RfX2l0ZW0nKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzOm5vdCguc2xpY2staW5pdGlhbGl6ZWQpJykuc2xpY2soe1xyXG4gICAgICAgICAgICAgICAgZG90czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDEsXHJcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogMSxcclxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnMjUlJyxcclxuLy8gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzgwcHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzJykub24oJ2FmdGVyQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNsaWNrKTtcclxuICAgICAgICAgICAgICAgICQodGhpcykuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJChzbGljay4kc2xpZGVzW2N1cnJlbnRTbGlkZV0pLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgICAgICBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPj0gYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMgLmFnZW50cy1saXN0X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBzZXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEFnZW50c1ByZXNlbnRhdGlvbigpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXNsaWRlci1hZ2VudHMnKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyICRhZ2VudCA9ICQoJy5qcy1zbGlkZXItYWdlbnRzIC5fYWN0aXZlIC5qcy1zbGlkZXItYWdlbnRzX19zaG9ydCcpO1xyXG4gICAgICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbCcpO1xyXG4gICAgICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9faW1nJykuYXR0cignc3JjJywgJGFnZW50LmRhdGEoJ2FnZW50LWltZycpKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX25hbWUnKS50ZXh0KCRhZ2VudC5kYXRhKCdhZ2VudC1uYW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX3Bob25lIGEnKS50ZXh0KHBob25lKS5hdHRyKCdocmVmJywgJ3RlbDonICsgcGhvbmUucmVwbGFjZSgvWy1cXHNdL2csICcnKSk7XHJcbiAgICAgICAgICAgIHZhciBsaW5rID0gJGFnZW50LmRhdGEoJ2FnZW50LWxpbmsnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX2xpbmsgYScpLnRleHQobGluaykuYXR0cignaHJlZicsICcvLzonICsgbGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNZW51KCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCQod2luZG93KS5vdXRlcldpZHRoKCkgPCBhcHBDb25maWcuYnJlYWtwb2ludC5tZCkge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJCgnLmpzLW1lbnUgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcignZGVzdHJveScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudScpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS50b2dnbGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1vdmVybGF5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtdG9nZ2xlcicpLmNsaWNrKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kLXRvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtc2Vjb25kJykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWFzaygpIHtcclxuICAgICAgICAkKCc6aW5wdXQnKS5pbnB1dG1hc2soKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UG9wdXAoKSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJhc2VDbGFzczogJ19wb3B1cCcsXHJcbiAgICAgICAgICAgIGJ0blRwbDoge1xyXG4gICAgICAgICAgICAgICAgc21hbGxCdG46ICc8c3BhbiBkYXRhLWZhbmN5Ym94LWNsb3NlIGNsYXNzPVwiZmFuY3lib3gtY2xvc2Utc21hbGxcIj48c3BhbiBjbGFzcz1cImxpbmtcIj7Ql9Cw0LrRgNGL0YLRjDwvc3Bhbj48L3NwYW4+JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy1wb3B1cCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJC5mYW5jeWJveC5jbG9zZSgpO1xyXG4gICAgICAgIH0pLmZhbmN5Ym94KG9wdGlvbnMpO1xyXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICB2YXIgJGNudCA9ICQod2luZG93LmxvY2F0aW9uLmhhc2gpO1xyXG4gICAgICAgICAgICBpZiAoJGNudC5sZW5ndGggJiYgJGNudC5oYXNDbGFzcygncG9wdXAtY250JykpIHtcclxuICAgICAgICAgICAgICAgICQuZmFuY3lib3gub3BlbigkY250LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U2VsZWN0KCkge1xyXG4gICAgICAgIC8vIGN1c3RvbSBzZWxlY3RcclxuICAgICAgICAkKCcuanMtc2VsZWN0LXNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkaXRlbXMgPSAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pdGVtJyk7XHJcbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnLmpzLXNlbGVjdC1zZWFyY2hfX2lucHV0Jykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzZWxlY3Qtc2VhcmNoJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSA9PT0gMCA/ICQodGhpcykuc2hvdygpIDogJCh0aGlzKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtcy5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1zZWxlY3RfX3RvZ2dsZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5qcy1zZWxlY3QnKS5hZGRDbGFzcygnX2FjdGl2ZScpLnRvZ2dsZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1zZWxlY3QnKS5ub3QoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19vcGVuZWQgX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHNlbGVjdDJcclxuICAgICAgICAkKCcuanMtc2VsZWN0MicpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICB0aGVtZTogJ2N1c3RvbScsXHJcbiAgICAgICAgICAgIG1pbmltdW1SZXN1bHRzRm9yU2VhcmNoOiBJbmZpbml0eSxcclxuICAgICAgICB9KTtcclxuLy8gICAgICAgICQoJy5qcy1zZWxlY3QyJykuc2VsZWN0Mignb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWYWxpZGF0ZSgpIHtcclxuICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoXCJwaG9uZVwiLCBmdW5jdGlvbiAodmFsdWUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uYWwoZWxlbWVudCkgfHwgL15cXCtcXGRcXHNcXChcXGR7M31cXClcXHNcXGR7M30tXFxkezJ9LVxcZHsyfSQvLnRlc3QodmFsdWUpO1xyXG4gICAgICAgIH0sIFwiUGxlYXNlIHNwZWNpZnkgYSB2YWxpZCBtb2JpbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7fSxcclxuICAgICAgICAgICAgcnVsZXM6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcInBob25lXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXZhbGlkYXRlJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudmFsaWRhdGUob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJlYWx0eUZpbHRlcnMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWZpbHRlcnMtcmVhbHR5LXR5cGUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10aXRsZScpLnRleHQoJCh0aGlzKS5kYXRhKCdmaWx0ZXJzLXRpdGxlJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQYXNzd29yZCgpIHtcclxuICAgICAgICBpZiAoJCgnLmpzLXBhc3N3b3JkJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi4vanMvbGlicy96eGN2Ym4uanNcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uIChzY3JpcHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24gKGpxeGhyLCBzZXR0aW5ncywgZXhjZXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvYWRpbmcgenhjdmJuJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAoenhjdmJuKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gJCh0aGlzKS52YWwoKS50cmltKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHp4Y3Zibih2YWwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbnQgPSAkKHRoaXMpLnNpYmxpbmdzKCcuaW5wdXQtaGVscCcpO1xyXG4gICAgICAgICAgICAgICAgY250LnJlbW92ZUNsYXNzKCdfMCBfMSBfMiBfMyBfNCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbnQuYWRkQ2xhc3MoJ18nICsgcmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLnNjb3JlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoJy5qcy1wYXNzd29yZCcpLmtleXVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZXZpZXdzU2xpZGVyKCkge1xyXG4gICAgICAgIHZhciAkc2xpZGVyID0gJCgnLmpzLXNsaWRlci1yZXZpZXdzJyk7XHJcbiAgICAgICAgJHNsaWRlci5zbGljayh7XHJcbiAgICAgICAgICAgIGRvdHM6IHRydWUsXHJcbiAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXHJcbiAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICBkb3RzQ2xhc3M6ICdzbGljay1kb3RzIF9iaWcnLFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtwb2ludDogYXBwQ29uZmlnLmJyZWFrcG9pbnQubGcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyICRiaWcgPSAkKCcucmV2aWV3c19fbGlzdC5fYmlnIC5yZXZpZXdzX19saXN0X19pdGVtJyk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAwO1xyXG4gICAgICAgIGlmICgkYmlnLmxlbmd0aCAmJiAkc2xpZGVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgJHNsaWRlclxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50LCBzbGljaywgY3VycmVudFNsaWRlLCBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBuZXh0U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyQmlnKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnRTbGlkZTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZSAhPSBjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRCaWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBjbGVhckJpZygpIHtcclxuICAgICAgICAgICAgJGJpZy5mYWRlT3V0KCkuZW1wdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmlnKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLXJldmlld3MgLnNsaWNrLWN1cnJlbnQgLnJldmlld3NfX2xpc3RfX2l0ZW1fX2lubmVyJykuY2xvbmUoKS5hcHBlbmRUbygkYmlnKTtcclxuICAgICAgICAgICAgJGJpZy5mYWRlSW4oKTtcclxuICAgICAgICAgICAgJGJpZy5wYXJlbnQoKS5jc3MoJ2hlaWdodCcsICRiaWcub3V0ZXJIZWlnaHQodHJ1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UmVhbHR5KCkge1xyXG4gICAgICAgICQoJy5qcy1yZWFsdHlfX2xpc3RfX2l0ZW1fX2ltZy13cmFwcGVyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciAkdG9nZ2xlcnMgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHlfX2xpc3RfX2l0ZW1fX2ltZy1pbm5lcicpO1xyXG4gICAgICAgICAgICB2YXIgJGNvdW50ZXIgPSAkKHRoaXMpLmZpbmQoJy5qcy1yZWFsdHlfX2xpc3RfX2l0ZW1fX2ltZy1jb3VudGVyJyk7XHJcbiAgICAgICAgICAgICR0b2dnbGVycy5lYWNoKGZ1bmN0aW9uIChpKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHRvZ2dsZXJzLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICRjb3VudGVyLnRleHQoaSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUYWJzKCkge1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW0pIHtcclxuICAgICAgICAgICAgJChlbGVtKS5lYXN5dGFicyh7XHJcbiAgICAgICAgICAgICAgICB0YWJzOiAnLmpzLXRhYnNfX2xpc3QgPiBsaSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuYmluZCgnZWFzeXRhYnM6YWZ0ZXInLCBmdW5jdGlvbiAoZXZlbnQsICRjbGlja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLmZpbmQoJy5qcy10YWJzX19zZWxlY3QnKS52YWwoJGNsaWNrZWQuYXR0cignaHJlZicpKS5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICQoZWxlbSkuZmluZCgnLmpzLXRhYnNfX3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkKGVsZW0pLmVhc3l0YWJzKCdzZWxlY3QnLCAkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1WEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0FnSUZ4eVhHNTlLVHNpWFN3aVptbHNaU0k2SW1OdmJXMXZiaTVxY3lKOSJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
