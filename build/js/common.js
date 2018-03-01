jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSmallSliders();
        initAgentsPresentation();
        setAgentsPresentation();
        initMenu();
        initMask();
        initPopup();
        initSelect();
        initValidate();
        initRealtyFilters();
        initPassword();

        $('.js-scrollbar').scrollbar();
        $('.js-tabs').easytabs();

    });

    $(window).on('resize', function () {
        initSmallSliders();
//        initMenu();
    });

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
        $('.js-popup').fancybox(options);
        if (window.location.hash) {
            var $cnt = $(window.location.hash);
            if ($cnt.length && $cnt.hasClass('popup-cnt')) {
                $.fancybox.open($cnt, options);
            }
        }
    }

    function initSelect() {
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
        // https://github.com/dropbox/zxcvbn
        $.getScript("js/libs/zxcvbn.js")
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

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbiAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIHNldEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIGluaXRNZW51KCk7XHJcbiAgICAgICAgaW5pdE1hc2soKTtcclxuICAgICAgICBpbml0UG9wdXAoKTtcclxuICAgICAgICBpbml0U2VsZWN0KCk7XHJcbiAgICAgICAgaW5pdFZhbGlkYXRlKCk7XHJcbiAgICAgICAgaW5pdFJlYWx0eUZpbHRlcnMoKTtcclxuICAgICAgICBpbml0UGFzc3dvcmQoKTtcclxuXHJcbiAgICAgICAgJCgnLmpzLXNjcm9sbGJhcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICQoJy5qcy10YWJzJykuZWFzeXRhYnMoKTtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbi8vICAgICAgICBpbml0TWVudSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNtYWxsU2xpZGVycygpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGw6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbC5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMgLmFnZW50cy1saXN0X19pdGVtJykub2ZmKCdjbGljaycpO1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50czpub3QoLnNsaWNrLWluaXRpYWxpemVkKScpLnNsaWNrKHtcclxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzI1JScsXHJcbi8vICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc4MHB4JyxcclxuICAgICAgICAgICAgICAgIGZvY3VzT25TZWxlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkKCcuanMtc2xpZGVyLWFnZW50cycpLm9uKCdhZnRlckNoYW5nZScsIGZ1bmN0aW9uIChldmVudCwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzbGljayk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5fYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzLnNsaWNrLWluaXRpYWxpemVkJykuc2xpY2soJ3Vuc2xpY2snKTtcclxuICAgICAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpID49IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItYWdlbnRzIC5hZ2VudHMtbGlzdF9faXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICQodGhpcykucGFyZW50KCkuZmluZCgnLl9hY3RpdmUnKS5yZW1vdmVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgc2V0QWdlbnRzUHJlc2VudGF0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRBZ2VudHNQcmVzZW50YXRpb24oKSB7XHJcbiAgICAgICAgaWYgKCQoJy5qcy1zbGlkZXItYWdlbnRzJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciAkYWdlbnQgPSAkKCcuanMtc2xpZGVyLWFnZW50cyAuX2FjdGl2ZSAuanMtc2xpZGVyLWFnZW50c19fc2hvcnQnKTtcclxuICAgICAgICAgICAgdmFyICRmdWxsID0gJCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGwnKTtcclxuICAgICAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX2ltZycpLmF0dHIoJ3NyYycsICRhZ2VudC5kYXRhKCdhZ2VudC1pbWcnKSk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsX19uYW1lJykudGV4dCgkYWdlbnQuZGF0YSgnYWdlbnQtbmFtZScpKTtcclxuICAgICAgICAgICAgdmFyIHBob25lID0gJGFnZW50LmRhdGEoJ2FnZW50LXBob25lJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsX19waG9uZSBhJykudGV4dChwaG9uZSkuYXR0cignaHJlZicsICd0ZWw6JyArIHBob25lLnJlcGxhY2UoL1stXFxzXS9nLCAnJykpO1xyXG4gICAgICAgICAgICB2YXIgbGluayA9ICRhZ2VudC5kYXRhKCdhZ2VudC1saW5rJyk7XHJcbiAgICAgICAgICAgICRmdWxsLmZpbmQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsX19saW5rIGEnKS50ZXh0KGxpbmspLmF0dHIoJ2hyZWYnLCAnLy86JyArIGxpbmspO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TWVudSgpIHtcclxuICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICQoJy5qcy1tZW51JykudG9nZ2xlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCgnLmpzLW1lbnUtb3ZlcmxheScpLnRvZ2dsZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJy5qcy1tZW51LW92ZXJsYXknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS10b2dnbGVyJykuY2xpY2soKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQtdG9nZ2xlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAkKCcuanMtbWVudS1zZWNvbmQnKS50b2dnbGVDbGFzcygnX2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNYXNrKCkge1xyXG4gICAgICAgICQoJzppbnB1dCcpLmlucHV0bWFzaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3B1cCgpIHtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYmFzZUNsYXNzOiAnX3BvcHVwJyxcclxuICAgICAgICAgICAgYnRuVHBsOiB7XHJcbiAgICAgICAgICAgICAgICBzbWFsbEJ0bjogJzxzcGFuIGRhdGEtZmFuY3lib3gtY2xvc2UgY2xhc3M9XCJmYW5jeWJveC1jbG9zZS1zbWFsbFwiPjxzcGFuIGNsYXNzPVwibGlua1wiPtCX0LDQutGA0YvRgtGMPC9zcGFuPjwvc3Bhbj4nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnLmpzLXBvcHVwJykuZmFuY3lib3gob3B0aW9ucyk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XHJcbiAgICAgICAgICAgIHZhciAkY250ID0gJCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XHJcbiAgICAgICAgICAgIGlmICgkY250Lmxlbmd0aCAmJiAkY250Lmhhc0NsYXNzKCdwb3B1cC1jbnQnKSkge1xyXG4gICAgICAgICAgICAgICAgJC5mYW5jeWJveC5vcGVuKCRjbnQsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWxlY3QoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNlbGVjdC1zZWFyY2gnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgJGl0ZW1zID0gJChlbGVtZW50KS5maW5kKCcuanMtc2VsZWN0LXNlYXJjaF9faXRlbScpO1xyXG4gICAgICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJy5qcy1zZWxlY3Qtc2VhcmNoX19pbnB1dCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9ICQodGhpcykudmFsKCkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHF1ZXJ5KTtcclxuICAgICAgICAgICAgICAgIGlmIChxdWVyeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnc2VsZWN0LXNlYXJjaCcpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeSkgPT09IDAgPyAkKHRoaXMpLnNob3coKSA6ICQodGhpcykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkaXRlbXMuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtc2VsZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKCcuanMtc2VsZWN0X190b2dnbGVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0JykucmVtb3ZlQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuanMtc2VsZWN0JykuYWRkQ2xhc3MoJ19hY3RpdmUnKS50b2dnbGVDbGFzcygnX29wZW5lZCcpO1xyXG4gICAgICAgICAgICAkKCcuanMtc2VsZWN0Jykubm90KCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfb3BlbmVkJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNlbGVjdCcpLnJlbW92ZUNsYXNzKCdfb3BlbmVkIF9hY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VmFsaWRhdGUoKSB7XHJcbiAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKFwicGhvbmVcIiwgZnVuY3Rpb24gKHZhbHVlLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKGVsZW1lbnQpIHx8IC9eXFwrXFxkXFxzXFwoXFxkezN9XFwpXFxzXFxkezN9LVxcZHsyfS1cXGR7Mn0kLy50ZXN0KHZhbHVlKTtcclxuICAgICAgICB9LCBcIlBsZWFzZSBzcGVjaWZ5IGEgdmFsaWQgbW9iaWxlIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge30sXHJcbiAgICAgICAgICAgIHJ1bGVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCJwaG9uZVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJy5qcy12YWxpZGF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnZhbGlkYXRlKG9wdGlvbnMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRSZWFsdHlGaWx0ZXJzKCkge1xyXG4gICAgICAgICQoJy5qcy1maWx0ZXJzLXJlYWx0eS10eXBlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKCcuanMtZmlsdGVycy1yZWFsdHktdGl0bGUnKS50ZXh0KCQodGhpcykuZGF0YSgnZmlsdGVycy10aXRsZScpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFzc3dvcmQoKSB7XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2Ryb3Bib3gvenhjdmJuXHJcbiAgICAgICAgJC5nZXRTY3JpcHQoXCJqcy9saWJzL3p4Y3Zibi5qc1wiKVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24gKHNjcmlwdCwgdGV4dFN0YXR1cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZmFpbChmdW5jdGlvbiAoanF4aHIsIHNldHRpbmdzLCBleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgbG9hZGluZyB6eGN2Ym4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgICAgICAgICAkKCcuanMtcGFzc3dvcmQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mICh6eGN2Ym4pID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAkKHRoaXMpLnZhbCgpLnRyaW0oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0genhjdmJuKHZhbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNudCA9ICQodGhpcykuc2libGluZ3MoJy5pbnB1dC1oZWxwJyk7XHJcbiAgICAgICAgICAgICAgICBjbnQucmVtb3ZlQ2xhc3MoJ18wIF8xIF8yIF8zIF80Jyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNudC5hZGRDbGFzcygnXycgKyByZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4vLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuc2NvcmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXBhc3N3b3JkJykua2V5dXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1WEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0FnSUZ4eVhHNTlLVHNpWFN3aVptbHNaU0k2SW1OdmJXMXZiaTVxY3lKOSJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
