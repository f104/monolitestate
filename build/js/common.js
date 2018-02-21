jQuery(function () {
    "use strict";

    $(document).ready(function () {
        initSmallSliders();
        initAgentsPresentation();
    });

    $(window).on('resize', function () {
        initSmallSliders();
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
                initAgentsPresentation();
            });
        } else {
            $('.js-slider-agents.slick-initialized').slick('unslick');
        }
    }

    function initAgentsPresentation() {
        var $agent = $('.js-slider-agents ._active .js-slider-agents__short');
        var $full = $('.js-slider-agents__full');
        $full.find('.js-slider-agents__full__name').text($agent.data('agent-name'));
        var phone = $agent.data('agent-phone');
        $full.find('.js-slider-agents__full__phone a').text(phone).attr('href', 'tel:' + phone.replace(/[-\s]/g, ''));
        var link = $agent.data('agent-link');
        $full.find('.js-slider-agents__full__link a').text(link).attr('href', '//:' + link);
    }

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9KTtcclxuICAgIFxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi5qcyJ9
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGZ1bmN0aW9uICgpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpbml0U21hbGxTbGlkZXJzKCk7XHJcbiAgICAgICAgaW5pdEFnZW50c1ByZXNlbnRhdGlvbigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaW5pdFNtYWxsU2xpZGVycygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNtYWxsU2xpZGVycygpIHtcclxuICAgICAgICBpZiAoJCh3aW5kb3cpLm91dGVyV2lkdGgoKSA8IGFwcENvbmZpZy5icmVha3BvaW50Lm1kKSB7XHJcbiAgICAgICAgICAgICQoJy5qcy1zbGlkZXItc21hbGw6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYXJyb3dzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDEsXHJcbiAgICAgICAgICAgICAgICBjZW50ZXJNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyUGFkZGluZzogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9jdXNPblNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1zbWFsbC5zbGljay1pbml0aWFsaXplZCcpLnNsaWNrKCd1bnNsaWNrJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKHdpbmRvdykub3V0ZXJXaWR0aCgpIDwgYXBwQ29uZmlnLmJyZWFrcG9pbnQubWQpIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHM6bm90KC5zbGljay1pbml0aWFsaXplZCknKS5zbGljayh7XHJcbiAgICAgICAgICAgICAgICBkb3RzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGFycm93czogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMSxcclxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyTW9kZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICcyNSUnLFxyXG4vLyAgICAgICAgICAgICAgICBjZW50ZXJQYWRkaW5nOiAnODBweCcsXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMnKS5vbignYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQsIHNsaWNrLCBjdXJyZW50U2xpZGUpIHtcclxuLy8gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpY2spO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuX2FjdGl2ZScpLnJlbW92ZUNsYXNzKCdfYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkKHNsaWNrLiRzbGlkZXNbY3VycmVudFNsaWRlXSkuYWRkQ2xhc3MoJ19hY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIGluaXRBZ2VudHNQcmVzZW50YXRpb24oKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLmpzLXNsaWRlci1hZ2VudHMuc2xpY2staW5pdGlhbGl6ZWQnKS5zbGljaygndW5zbGljaycpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0QWdlbnRzUHJlc2VudGF0aW9uKCkge1xyXG4gICAgICAgIHZhciAkYWdlbnQgPSAkKCcuanMtc2xpZGVyLWFnZW50cyAuX2FjdGl2ZSAuanMtc2xpZGVyLWFnZW50c19fc2hvcnQnKTtcclxuICAgICAgICB2YXIgJGZ1bGwgPSAkKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbCcpO1xyXG4gICAgICAgICRmdWxsLmZpbmQoJy5qcy1zbGlkZXItYWdlbnRzX19mdWxsX19uYW1lJykudGV4dCgkYWdlbnQuZGF0YSgnYWdlbnQtbmFtZScpKTtcclxuICAgICAgICB2YXIgcGhvbmUgPSAkYWdlbnQuZGF0YSgnYWdlbnQtcGhvbmUnKTtcclxuICAgICAgICAkZnVsbC5maW5kKCcuanMtc2xpZGVyLWFnZW50c19fZnVsbF9fcGhvbmUgYScpLnRleHQocGhvbmUpLmF0dHIoJ2hyZWYnLCAndGVsOicgKyBwaG9uZS5yZXBsYWNlKC9bLVxcc10vZywgJycpKTtcclxuICAgICAgICB2YXIgbGluayA9ICRhZ2VudC5kYXRhKCdhZ2VudC1saW5rJyk7XHJcbiAgICAgICAgJGZ1bGwuZmluZCgnLmpzLXNsaWRlci1hZ2VudHNfX2Z1bGxfX2xpbmsgYScpLnRleHQobGluaykuYXR0cignaHJlZicsICcvLzonICsgbGluayk7XHJcbiAgICB9XHJcblxyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pSWl3aWMyOTFjbU5sY3lJNld5SmpiMjF0YjI0dWFuTWlYU3dpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpYWxGMVpYSjVLR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUZ3aWRYTmxJSE4wY21samRGd2lPMXh5WEc1Y2NseHVJQ0FnSUNRb1pHOWpkVzFsYm5RcExuSmxZV1I1S0daMWJtTjBhVzl1SUNncElIdGNjbHh1WEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0FnSUZ4eVhHNTlLVHNpWFN3aVptbHNaU0k2SW1OdmJXMXZiaTVxY3lKOSJdLCJmaWxlIjoiY29tbW9uLmpzIn0=
