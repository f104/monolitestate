appResultMapConfig = appResultMapConfig || {};

$(document).ready(function () {
    appResultMap.initialize();
});

var appResultMap = {
    initialized: false,
    loaded: false,
    options: {
        urlPlaces: 'https://api.myjson.com/bins/ygsli',
        urlItems: 'onmap-list.html',
        params: {}
    },

    initialize: function () {
        if (this.initialized || $('#result_map').length === 0 || typeof (ymaps) === 'undefined') {
            return;
        }
        for (i in appResultMapConfig) {
            this.options[i] = appResultMapConfig[i];
        }
        this.$cnt = $('.result-map');
        ymaps.ready(this.initMap);
        this.initialized = true;
    },

    initMap: function () {
        var map = new ymaps.Map("result_map", {
            center: [56.25471469870076, 43.947964454589815],
            zoom: 12,
            controls: []
        });
        map.behaviors.disable('scrollZoom');
        $('.js-map__zoom').on('click', function () {
            var z = map.getZoom();
            $(this).hasClass('_in') ? z++ : z--;
            map.setZoom(z, {
                checkZoomRange: true,
                duration: 200
            });
        });

        closeButton = new ymaps.control.Button({
            data: {
                title: 'Закрыть карту',
                image: 'map-close.svg'
            },
            options: {
                maxWidth: 90,
                selectOnClick: false,
            }
        });
        closeButton.events.add('click', function (e) {
            appResultMap.hide();
        });
        appResultMap.closeButton = closeButton;

        var om = new ymaps.ObjectManager({
            clusterize: true,
            gridSize: 32,
            geoObjectOpenBalloonOnClick: false,
        });
        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark _total _primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.total }}</span></div>'
                ),
                tplBalloon = ymaps.templateLayoutFactory.createClass(
                        '<div class="result-map__balloon">{{ properties.content|raw }}<span class="spacer"></span></div>', {
                            build: function () {
                                tplBalloon.superclass.build.call(this);
                                $('.onmap__list .scrollbar-outer').scrollbar();
                                this._$element = $('.result-map__balloon', this.getParentElement());
                            },
                            getShape: function () {
                                if (!this._isElement(this._$element)) {
                                    return tplBalloon.superclass.getShape.call(this);
                                }

                                var position = this._$element.position();

                                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                                    [position.left, position.top], [
                                        position.left + this._$element[0].offsetWidth,
                                        position.top + this._$element[0].offsetHeight + this._$element.find('.spacer')[0].offsetHeight
                                    ]
                                ]));
                            },
                            _isElement: function (element) {
                                return element && element[0] && element.find('.spacer')[0];
                            }
                        });
        om.objects.options.set({
            iconLayout: tpl,
            iconShape: {
                type: 'Rectangle',
                coordinates: [
                    [-15.5, -42], [15.5, 0]
                ]
            },
            hideIconOnBalloonOpen: false,
            balloonLayout: tplBalloon,
            balloonCloseButton: false,
            balloonPanelMaxMapArea: 0
        });
        om.clusters.options.set('preset', 'islands#darkBlueCircleIcon');
        map.geoObjects.add(om);

        om.objects.events.add('click', function (e) {
            var objectId = e.get('objectId'),
                    obj = om.objects.getById(objectId);
            if (om.objects.balloon.isOpen(objectId)) {
                om.objects.balloon.close();
                return;
            }
            if (obj.properties.content) {
                om.objects.balloon.open(objectId);
            } else {
                obj.properties.content = '<span class="result-map__balloon__loading"><i class="icon-spin"></i></span>';
                om.objects.balloon.open(objectId);
                var params = $.extend({coordinates: obj.geometry.coordinates}, appResultMap.options.params);
                $.get(appResultMap.options.urlItems, params, function (resp) {
                    obj.properties.content = resp;
                    om.objects.balloon.setData(obj);
                });
            }
        });

        appResultMap.map = map;
        appResultMap.om = om;

        $('.result-map__hover').on('click', function () {
            appResultMap.show();
        });
    },

    show: function () {
        if (!this.loaded) {
            this.load();
        } else {
            this.$cnt.addClass('_expanded');
            this.map.controls.add(this.closeButton, {
                float: "right",
                floatIndex: 1,
            });
            this.map.controls.add('fullscreenControl', {
                floatIndex: 0
            });
        }
    },

    hide: function () {
        this.$cnt.removeClass('_expanded');
        this.map.controls.remove('fullscreenControl');
        this.map.controls.remove(this.closeButton);
    },

    load: function () {
        appResultMap.$cnt.addClass('_loading');
        $.get(this.options.urlPlaces, this.options.params, function (resp) {
            appResultMap.om.add(resp);
            appResultMap.reset();
            appResultMap.$cnt.addClass('_expanded');
            appResultMap.$cnt.removeClass('_loading');
            appResultMap.loaded = true;
            appResultMap.show();
        });
    },

    reset: function () {
        this.map.balloon.close();
        this.map.setBounds(this.map.geoObjects.getBounds(), {checkZoomRange: true});
    },

}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXN1bHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwUmVzdWx0TWFwQ29uZmlnID0gYXBwUmVzdWx0TWFwQ29uZmlnIHx8IHt9O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwUmVzdWx0TWFwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwUmVzdWx0TWFwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgbG9hZGVkOiBmYWxzZSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICB1cmxQbGFjZXM6ICdodHRwczovL2FwaS5teWpzb24uY29tL2JpbnMveWdzbGknLFxyXG4gICAgICAgIHVybEl0ZW1zOiAnb25tYXAtbGlzdC5odG1sJyxcclxuICAgICAgICBwYXJhbXM6IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCB8fCAkKCcjcmVzdWx0X21hcCcpLmxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgKHltYXBzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgaW4gYXBwUmVzdWx0TWFwQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXSA9IGFwcFJlc3VsdE1hcENvbmZpZ1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy4kY250ID0gJCgnLnJlc3VsdC1tYXAnKTtcclxuICAgICAgICB5bWFwcy5yZWFkeSh0aGlzLmluaXRNYXApO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0TWFwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJyZXN1bHRfbWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMjU0NzE0Njk4NzAwNzYsIDQzLjk0Nzk2NDQ1NDU4OTgxNV0sXHJcbiAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgeiA9IG1hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICBtYXAuc2V0Wm9vbSh6LCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNsb3NlQnV0dG9uID0gbmV3IHltYXBzLmNvbnRyb2wuQnV0dG9uKHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICfQl9Cw0LrRgNGL0YLRjCDQutCw0YDRgtGDJyxcclxuICAgICAgICAgICAgICAgIGltYWdlOiAnbWFwLWNsb3NlLnN2ZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgbWF4V2lkdGg6IDkwLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0T25DbGljazogZmFsc2UsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjbG9zZUJ1dHRvbi5ldmVudHMuYWRkKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgYXBwUmVzdWx0TWFwLmNsb3NlQnV0dG9uID0gY2xvc2VCdXR0b247XHJcblxyXG4gICAgICAgIHZhciBvbSA9IG5ldyB5bWFwcy5PYmplY3RNYW5hZ2VyKHtcclxuICAgICAgICAgICAgY2x1c3Rlcml6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgZ3JpZFNpemU6IDMyLFxyXG4gICAgICAgICAgICBnZW9PYmplY3RPcGVuQmFsbG9vbk9uQ2xpY2s6IGZhbHNlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciB0cGwgPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBsYWNlbWFyayBfdG90YWwgX3ByaW1hcnlcIj48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDguMjAyIDExLjExM1wiIGNsYXNzPVwiXCI+PHBhdGggZD1cIk00LjEwMSAxMS4xMTNjMi43MzQtMy4xMiA0LjEwMS01LjQ0MiA0LjEwMS02Ljk2OEM4LjIwMiAxLjg1NSA2LjM2NiAwIDQuMTAxIDAgMS44MzYgMCAwIDEuODU2IDAgNC4xNDVjMCAxLjUyNiAxLjM2NyAzLjg0OSA0LjEwMSA2Ljk2OHpcIiBmaWxsPVwiI2ZmZlwiPjwvcGF0aD48L3N2Zz48c3Bhbj57eyBwcm9wZXJ0aWVzLnRvdGFsIH19PC9zcGFuPjwvZGl2PidcclxuICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICB0cGxCYWxsb29uID0geW1hcHMudGVtcGxhdGVMYXlvdXRGYWN0b3J5LmNyZWF0ZUNsYXNzKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJlc3VsdC1tYXBfX2JhbGxvb25cIj57eyBwcm9wZXJ0aWVzLmNvbnRlbnR8cmF3IH19PHNwYW4gY2xhc3M9XCJzcGFjZXJcIj48L3NwYW4+PC9kaXY+Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cGxCYWxsb29uLnN1cGVyY2xhc3MuYnVpbGQuY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcub25tYXBfX2xpc3QgLnNjcm9sbGJhci1vdXRlcicpLnNjcm9sbGJhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuXyRlbGVtZW50ID0gJCgnLnJlc3VsdC1tYXBfX2JhbGxvb24nLCB0aGlzLmdldFBhcmVudEVsZW1lbnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2hhcGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzRWxlbWVudCh0aGlzLl8kZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRwbEJhbGxvb24uc3VwZXJjbGFzcy5nZXRTaGFwZS5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fJGVsZW1lbnQucG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyB5bWFwcy5zaGFwZS5SZWN0YW5nbGUobmV3IHltYXBzLmdlb21ldHJ5LnBpeGVsLlJlY3RhbmdsZShbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtwb3NpdGlvbi5sZWZ0LCBwb3NpdGlvbi50b3BdLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ICsgdGhpcy5fJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi50b3AgKyB0aGlzLl8kZWxlbWVudFswXS5vZmZzZXRIZWlnaHQgKyB0aGlzLl8kZWxlbWVudC5maW5kKCcuc3BhY2VyJylbMF0ub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lzRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50WzBdICYmIGVsZW1lbnQuZmluZCgnLnNwYWNlcicpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICBvbS5vYmplY3RzLm9wdGlvbnMuc2V0KHtcclxuICAgICAgICAgICAgaWNvbkxheW91dDogdHBsLFxyXG4gICAgICAgICAgICBpY29uU2hhcGU6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdSZWN0YW5nbGUnLFxyXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICBbLTE1LjUsIC00Ml0sIFsxNS41LCAwXVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoaWRlSWNvbk9uQmFsbG9vbk9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgICBiYWxsb29uTGF5b3V0OiB0cGxCYWxsb29uLFxyXG4gICAgICAgICAgICBiYWxsb29uQ2xvc2VCdXR0b246IGZhbHNlLFxyXG4gICAgICAgICAgICBiYWxsb29uUGFuZWxNYXhNYXBBcmVhOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb20uY2x1c3RlcnMub3B0aW9ucy5zZXQoJ3ByZXNldCcsICdpc2xhbmRzI2RhcmtCbHVlQ2lyY2xlSWNvbicpO1xyXG4gICAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChvbSk7XHJcblxyXG4gICAgICAgIG9tLm9iamVjdHMuZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgb2JqZWN0SWQgPSBlLmdldCgnb2JqZWN0SWQnKSxcclxuICAgICAgICAgICAgICAgICAgICBvYmogPSBvbS5vYmplY3RzLmdldEJ5SWQob2JqZWN0SWQpO1xyXG4gICAgICAgICAgICBpZiAob20ub2JqZWN0cy5iYWxsb29uLmlzT3BlbihvYmplY3RJZCkpIHtcclxuICAgICAgICAgICAgICAgIG9tLm9iamVjdHMuYmFsbG9vbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvYmoucHJvcGVydGllcy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBvbS5vYmplY3RzLmJhbGxvb24ub3BlbihvYmplY3RJZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvYmoucHJvcGVydGllcy5jb250ZW50ID0gJzxzcGFuIGNsYXNzPVwicmVzdWx0LW1hcF9fYmFsbG9vbl9fbG9hZGluZ1wiPjxpIGNsYXNzPVwiaWNvbi1zcGluXCI+PC9pPjwvc3Bhbj4nO1xyXG4gICAgICAgICAgICAgICAgb20ub2JqZWN0cy5iYWxsb29uLm9wZW4ob2JqZWN0SWQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9ICQuZXh0ZW5kKHtjb29yZGluYXRlczogb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzfSwgYXBwUmVzdWx0TWFwLm9wdGlvbnMucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgICQuZ2V0KGFwcFJlc3VsdE1hcC5vcHRpb25zLnVybEl0ZW1zLCBwYXJhbXMsIGZ1bmN0aW9uIChyZXNwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnByb3BlcnRpZXMuY29udGVudCA9IHJlc3A7XHJcbiAgICAgICAgICAgICAgICAgICAgb20ub2JqZWN0cy5iYWxsb29uLnNldERhdGEob2JqKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFwcFJlc3VsdE1hcC5tYXAgPSBtYXA7XHJcbiAgICAgICAgYXBwUmVzdWx0TWFwLm9tID0gb207XHJcblxyXG4gICAgICAgICQoJy5yZXN1bHQtbWFwX19ob3ZlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy4kY250LmFkZENsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tYXAuY29udHJvbHMuYWRkKHRoaXMuY2xvc2VCdXR0b24sIHtcclxuICAgICAgICAgICAgICAgIGZsb2F0OiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICBmbG9hdEluZGV4OiAxLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5tYXAuY29udHJvbHMuYWRkKCdmdWxsc2NyZWVuQ29udHJvbCcsIHtcclxuICAgICAgICAgICAgICAgIGZsb2F0SW5kZXg6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy4kY250LnJlbW92ZUNsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICB0aGlzLm1hcC5jb250cm9scy5yZW1vdmUoJ2Z1bGxzY3JlZW5Db250cm9sJyk7XHJcbiAgICAgICAgdGhpcy5tYXAuY29udHJvbHMucmVtb3ZlKHRoaXMuY2xvc2VCdXR0b24pO1xyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgYXBwUmVzdWx0TWFwLiRjbnQuYWRkQ2xhc3MoJ19sb2FkaW5nJyk7XHJcbiAgICAgICAgJC5nZXQodGhpcy5vcHRpb25zLnVybFBsYWNlcywgdGhpcy5vcHRpb25zLnBhcmFtcywgZnVuY3Rpb24gKHJlc3ApIHtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLm9tLmFkZChyZXNwKTtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC4kY250LmFkZENsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLiRjbnQucmVtb3ZlQ2xhc3MoJ19sb2FkaW5nJyk7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhcHBSZXN1bHRNYXAuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubWFwLmJhbGxvb24uY2xvc2UoKTtcclxuICAgICAgICB0aGlzLm1hcC5zZXRCb3VuZHModGhpcy5tYXAuZ2VvT2JqZWN0cy5nZXRCb3VuZHMoKSk7XHJcbiAgICB9LFxyXG5cclxufSJdLCJmaWxlIjoicmVzdWx0LmpzIn0=
