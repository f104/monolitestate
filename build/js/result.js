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