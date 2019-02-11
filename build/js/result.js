appResultMapConfig = appResultMapConfig || {};

$(document).ready(function () {
    appResultMap.initialize();
});

var appResultMap = {
    initialized: false,
    loaded: false,
    firstTime: true, // отслеживает первоначальную загрузку карты, нужно для фильтрации
    options: {
        urlPlaces: 'https://api.myjson.com/bins/nawq6',
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
            controls: [],
            margin: 30
        }, {
            suppressMapOpenBlock: true,
        });
        map.behaviors.disable('scrollZoom');
//        console.log(map.margin.getMargin());
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
            gridSize: 128,
            geoObjectOpenBalloonOnClick: false,
        });
        var tpl = ymaps.templateLayoutFactory.createClass(
                '<div class="placemark _total _primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.202 11.113" class=""><path d="M4.101 11.113c2.734-3.12 4.101-5.442 4.101-6.968C8.202 1.855 6.366 0 4.101 0 1.836 0 0 1.856 0 4.145c0 1.526 1.367 3.849 4.101 6.968z" fill="#fff"></path></svg><span>{{ properties.total }}</span>{% if properties.hint %}<div class="placemark__hint">{{ properties.hint }}</div>{% endif %}</div>'
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
        $(document).on('mse2_load', function (e, data) {
            appResultMap.update();
        });
        map.events.add('boundschange', function (e) {
            $(document).trigger('app_map_changed', {
                firstTime: appResultMap.firstTime,
                bounds: e.get('newBounds')
            });
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
        var _this = this;
        setTimeout(function () {
            _this.$cnt.removeClass('_expanded');
            var fullscreenControl = _this.map.controls.get('fullscreenControl');
            if (fullscreenControl !== null) {
                fullscreenControl.exitFullscreen();
            }
            _this.map.controls.remove('fullscreenControl');
            _this.map.controls.remove(this.closeButton);
        }, 500);
    },

    load: function () {
        appResultMap.$cnt.addClass('_loading');
        $.get(this.options.urlPlaces, this.options.params, function (resp) {
            if (resp) {
//                console.log(resp);
                appResultMap.om.add(resp);
                appResultMap.$cnt.addClass('_expanded');
                appResultMap.$cnt.removeClass('_loading');
                appResultMap.loaded = true;
                appResultMap.show();
                appResultMap.reset();
            } else {
                appResultMap.$cnt.removeClass('_loading');
                miniShop2.Message.info('Нет данных для отображения на карте');
            }
        });
    },

    update: function () {
        if (this.loaded) {
            this.om.removeAll();
            $.get(this.options.urlPlaces, this.options.params, function (resp) {
                if (resp) {
                    appResultMap.om.add(resp);
                    appResultMap.firstTime = true;
                    appResultMap.reset();
                }
            });
        }
    },

    reset: function () {
        if (this.loaded) {
            this.map.balloon.close();
            this.map.setBounds(this.om.getBounds(), {
                checkZoomRange: true,
                zoomMargin: 30,
                useMapMargin: true
            }).then(function () {
                appResultMap.firstTime = false;
            });
        }
    },

}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXN1bHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwUmVzdWx0TWFwQ29uZmlnID0gYXBwUmVzdWx0TWFwQ29uZmlnIHx8IHt9O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwUmVzdWx0TWFwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwUmVzdWx0TWFwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgbG9hZGVkOiBmYWxzZSxcclxuICAgIGZpcnN0VGltZTogdHJ1ZSwgLy8g0L7RgtGB0LvQtdC20LjQstCw0LXRgiDQv9C10YDQstC+0L3QsNGH0LDQu9GM0L3Rg9GOINC30LDQs9GA0YPQt9C60YMg0LrQsNGA0YLRiywg0L3Rg9C20L3QviDQtNC70Y8g0YTQuNC70YzRgtGA0LDRhtC40LhcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICB1cmxQbGFjZXM6ICdodHRwczovL2FwaS5teWpzb24uY29tL2JpbnMvbmF3cTYnLFxyXG4gICAgICAgIHVybEl0ZW1zOiAnb25tYXAtbGlzdC5odG1sJyxcclxuICAgICAgICBwYXJhbXM6IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCB8fCAkKCcjcmVzdWx0X21hcCcpLmxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgKHltYXBzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgaW4gYXBwUmVzdWx0TWFwQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXSA9IGFwcFJlc3VsdE1hcENvbmZpZ1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy4kY250ID0gJCgnLnJlc3VsdC1tYXAnKTtcclxuICAgICAgICB5bWFwcy5yZWFkeSh0aGlzLmluaXRNYXApO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0TWFwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJyZXN1bHRfbWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMjU0NzE0Njk4NzAwNzYsIDQzLjk0Nzk2NDQ1NDU4OTgxNV0sXHJcbiAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICBjb250cm9sczogW10sXHJcbiAgICAgICAgICAgIG1hcmdpbjogMzBcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHN1cHByZXNzTWFwT3BlbkJsb2NrOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1hcC5iZWhhdmlvcnMuZGlzYWJsZSgnc2Nyb2xsWm9vbScpO1xyXG4vLyAgICAgICAgY29uc29sZS5sb2cobWFwLm1hcmdpbi5nZXRNYXJnaW4oKSk7XHJcbiAgICAgICAgJCgnLmpzLW1hcF9fem9vbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHogPSBtYXAuZ2V0Wm9vbSgpO1xyXG4gICAgICAgICAgICAkKHRoaXMpLmhhc0NsYXNzKCdfaW4nKSA/IHorKyA6IHotLTtcclxuICAgICAgICAgICAgbWFwLnNldFpvb20oeiwge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tab29tUmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMjAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjbG9zZUJ1dHRvbiA9IG5ldyB5bWFwcy5jb250cm9sLkJ1dHRvbih7XHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn0JfQsNC60YDRi9GC0Ywg0LrQsNGA0YLRgycsXHJcbiAgICAgICAgICAgICAgICBpbWFnZTogJ21hcC1jbG9zZS5zdmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIG1heFdpZHRoOiA5MCxcclxuICAgICAgICAgICAgICAgIHNlbGVjdE9uQ2xpY2s6IGZhbHNlLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY2xvc2VCdXR0b24uZXZlbnRzLmFkZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBhcHBSZXN1bHRNYXAuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFwcFJlc3VsdE1hcC5jbG9zZUJ1dHRvbiA9IGNsb3NlQnV0dG9uO1xyXG5cclxuICAgICAgICB2YXIgb20gPSBuZXcgeW1hcHMuT2JqZWN0TWFuYWdlcih7XHJcbiAgICAgICAgICAgIGNsdXN0ZXJpemU6IHRydWUsXHJcbiAgICAgICAgICAgIGdyaWRTaXplOiAxMjgsXHJcbiAgICAgICAgICAgIGdlb09iamVjdE9wZW5CYWxsb29uT25DbGljazogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIF90b3RhbCBfcHJpbWFyeVwiPjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPjxzcGFuPnt7IHByb3BlcnRpZXMudG90YWwgfX08L3NwYW4+eyUgaWYgcHJvcGVydGllcy5oaW50ICV9PGRpdiBjbGFzcz1cInBsYWNlbWFya19faGludFwiPnt7IHByb3BlcnRpZXMuaGludCB9fTwvZGl2PnslIGVuZGlmICV9PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIHRwbEJhbGxvb24gPSB5bWFwcy50ZW1wbGF0ZUxheW91dEZhY3RvcnkuY3JlYXRlQ2xhc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVzdWx0LW1hcF9fYmFsbG9vblwiPnt7IHByb3BlcnRpZXMuY29udGVudHxyYXcgfX08c3BhbiBjbGFzcz1cInNwYWNlclwiPjwvc3Bhbj48L2Rpdj4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRwbEJhbGxvb24uc3VwZXJjbGFzcy5idWlsZC5jYWxsKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5vbm1hcF9fbGlzdCAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fJGVsZW1lbnQgPSAkKCcucmVzdWx0LW1hcF9fYmFsbG9vbicsIHRoaXMuZ2V0UGFyZW50RWxlbWVudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTaGFwZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNFbGVtZW50KHRoaXMuXyRlbGVtZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHBsQmFsbG9vbi5zdXBlcmNsYXNzLmdldFNoYXBlLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl8kZWxlbWVudC5wb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHltYXBzLnNoYXBlLlJlY3RhbmdsZShuZXcgeW1hcHMuZ2VvbWV0cnkucGl4ZWwuUmVjdGFuZ2xlKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3Bvc2l0aW9uLmxlZnQsIHBvc2l0aW9uLnRvcF0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLmxlZnQgKyB0aGlzLl8kZWxlbWVudFswXS5vZmZzZXRXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnRvcCArIHRoaXMuXyRlbGVtZW50WzBdLm9mZnNldEhlaWdodCArIHRoaXMuXyRlbGVtZW50LmZpbmQoJy5zcGFjZXInKVswXS5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaXNFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50ICYmIGVsZW1lbnRbMF0gJiYgZWxlbWVudC5maW5kKCcuc3BhY2VyJylbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIG9tLm9iamVjdHMub3B0aW9ucy5zZXQoe1xyXG4gICAgICAgICAgICBpY29uTGF5b3V0OiB0cGwsXHJcbiAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1JlY3RhbmdsZScsXHJcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGJhbGxvb25MYXlvdXQ6IHRwbEJhbGxvb24sXHJcbiAgICAgICAgICAgIGJhbGxvb25DbG9zZUJ1dHRvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGJhbGxvb25QYW5lbE1heE1hcEFyZWE6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBvbS5jbHVzdGVycy5vcHRpb25zLnNldCgncHJlc2V0JywgJ2lzbGFuZHMjZGFya0JsdWVDaXJjbGVJY29uJyk7XHJcbiAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKG9tKTtcclxuXHJcbiAgICAgICAgb20ub2JqZWN0cy5ldmVudHMuYWRkKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBvYmplY3RJZCA9IGUuZ2V0KCdvYmplY3RJZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9tLm9iamVjdHMuZ2V0QnlJZChvYmplY3RJZCk7XHJcbiAgICAgICAgICAgIGlmIChvbS5vYmplY3RzLmJhbGxvb24uaXNPcGVuKG9iamVjdElkKSkge1xyXG4gICAgICAgICAgICAgICAgb20ub2JqZWN0cy5iYWxsb29uLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9iai5wcm9wZXJ0aWVzLmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIG9tLm9iamVjdHMuYmFsbG9vbi5vcGVuKG9iamVjdElkKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG9iai5wcm9wZXJ0aWVzLmNvbnRlbnQgPSAnPHNwYW4gY2xhc3M9XCJyZXN1bHQtbWFwX19iYWxsb29uX19sb2FkaW5nXCI+PGkgY2xhc3M9XCJpY29uLXNwaW5cIj48L2k+PC9zcGFuPic7XHJcbiAgICAgICAgICAgICAgICBvbS5vYmplY3RzLmJhbGxvb24ub3BlbihvYmplY3RJZCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gJC5leHRlbmQoe2Nvb3JkaW5hdGVzOiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXN9LCBhcHBSZXN1bHRNYXAub3B0aW9ucy5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgJC5nZXQoYXBwUmVzdWx0TWFwLm9wdGlvbnMudXJsSXRlbXMsIHBhcmFtcywgZnVuY3Rpb24gKHJlc3ApIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmoucHJvcGVydGllcy5jb250ZW50ID0gcmVzcDtcclxuICAgICAgICAgICAgICAgICAgICBvbS5vYmplY3RzLmJhbGxvb24uc2V0RGF0YShvYmopO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXBwUmVzdWx0TWFwLm1hcCA9IG1hcDtcclxuICAgICAgICBhcHBSZXN1bHRNYXAub20gPSBvbTtcclxuXHJcbiAgICAgICAgJCgnLnJlc3VsdC1tYXBfX2hvdmVyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhcHBSZXN1bHRNYXAuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdtc2UyX2xvYWQnLCBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBhcHBSZXN1bHRNYXAudXBkYXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWFwLmV2ZW50cy5hZGQoJ2JvdW5kc2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ2FwcF9tYXBfY2hhbmdlZCcsIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0VGltZTogYXBwUmVzdWx0TWFwLmZpcnN0VGltZSxcclxuICAgICAgICAgICAgICAgIGJvdW5kczogZS5nZXQoJ25ld0JvdW5kcycpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmxvYWRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLiRjbnQuYWRkQ2xhc3MoJ19leHBhbmRlZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5jb250cm9scy5hZGQodGhpcy5jbG9zZUJ1dHRvbiwge1xyXG4gICAgICAgICAgICAgICAgZmxvYXQ6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgICAgIGZsb2F0SW5kZXg6IDEsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5jb250cm9scy5hZGQoJ2Z1bGxzY3JlZW5Db250cm9sJywge1xyXG4gICAgICAgICAgICAgICAgZmxvYXRJbmRleDogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfdGhpcy4kY250LnJlbW92ZUNsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgdmFyIGZ1bGxzY3JlZW5Db250cm9sID0gX3RoaXMubWFwLmNvbnRyb2xzLmdldCgnZnVsbHNjcmVlbkNvbnRyb2wnKTtcclxuICAgICAgICAgICAgaWYgKGZ1bGxzY3JlZW5Db250cm9sICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBmdWxsc2NyZWVuQ29udHJvbC5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLm1hcC5jb250cm9scy5yZW1vdmUoJ2Z1bGxzY3JlZW5Db250cm9sJyk7XHJcbiAgICAgICAgICAgIF90aGlzLm1hcC5jb250cm9scy5yZW1vdmUodGhpcy5jbG9zZUJ1dHRvbik7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFwcFJlc3VsdE1hcC4kY250LmFkZENsYXNzKCdfbG9hZGluZycpO1xyXG4gICAgICAgICQuZ2V0KHRoaXMub3B0aW9ucy51cmxQbGFjZXMsIHRoaXMub3B0aW9ucy5wYXJhbXMsIGZ1bmN0aW9uIChyZXNwKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwKSB7XHJcbi8vICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xyXG4gICAgICAgICAgICAgICAgYXBwUmVzdWx0TWFwLm9tLmFkZChyZXNwKTtcclxuICAgICAgICAgICAgICAgIGFwcFJlc3VsdE1hcC4kY250LmFkZENsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgICAgIGFwcFJlc3VsdE1hcC4kY250LnJlbW92ZUNsYXNzKCdfbG9hZGluZycpO1xyXG4gICAgICAgICAgICAgICAgYXBwUmVzdWx0TWFwLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhcHBSZXN1bHRNYXAuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYXBwUmVzdWx0TWFwLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhcHBSZXN1bHRNYXAuJGNudC5yZW1vdmVDbGFzcygnX2xvYWRpbmcnKTtcclxuICAgICAgICAgICAgICAgIG1pbmlTaG9wMi5NZXNzYWdlLmluZm8oJ9Cd0LXRgiDQtNCw0L3QvdGL0YUg0LTQu9GPINC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0L3QsCDQutCw0YDRgtC1Jyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubG9hZGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub20ucmVtb3ZlQWxsKCk7XHJcbiAgICAgICAgICAgICQuZ2V0KHRoaXMub3B0aW9ucy51cmxQbGFjZXMsIHRoaXMub3B0aW9ucy5wYXJhbXMsIGZ1bmN0aW9uIChyZXNwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5vbS5hZGQocmVzcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwUmVzdWx0TWFwLmZpcnN0VGltZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwUmVzdWx0TWFwLnJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5sb2FkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXAuYmFsbG9vbi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRCb3VuZHModGhpcy5vbS5nZXRCb3VuZHMoKSwge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tab29tUmFuZ2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB6b29tTWFyZ2luOiAzMCxcclxuICAgICAgICAgICAgICAgIHVzZU1hcE1hcmdpbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5maXJzdFRpbWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbn0iXSwiZmlsZSI6InJlc3VsdC5qcyJ9
