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
            if (om.objects.balloon.isOpen(objectId)) { om.objects.balloon.close(); return; }
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
            appResultMap.map.setBounds(appResultMap.map.geoObjects.getBounds());
            appResultMap.$cnt.addClass('_expanded');
            appResultMap.$cnt.removeClass('_loading');
            appResultMap.loaded = true;
            appResultMap.show();            
        });
    },

}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXN1bHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwUmVzdWx0TWFwQ29uZmlnID0gYXBwUmVzdWx0TWFwQ29uZmlnIHx8IHt9O1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgYXBwUmVzdWx0TWFwLmluaXRpYWxpemUoKTtcclxufSk7XHJcblxyXG52YXIgYXBwUmVzdWx0TWFwID0ge1xyXG4gICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxyXG4gICAgbG9hZGVkOiBmYWxzZSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICB1cmxQbGFjZXM6ICdodHRwczovL2FwaS5teWpzb24uY29tL2JpbnMveWdzbGknLFxyXG4gICAgICAgIHVybEl0ZW1zOiAnb25tYXAtbGlzdC5odG1sJyxcclxuICAgICAgICBwYXJhbXM6IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCB8fCAkKCcjcmVzdWx0X21hcCcpLmxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgKHltYXBzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgaW4gYXBwUmVzdWx0TWFwQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tpXSA9IGFwcFJlc3VsdE1hcENvbmZpZ1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy4kY250ID0gJCgnLnJlc3VsdC1tYXAnKTtcclxuICAgICAgICB5bWFwcy5yZWFkeSh0aGlzLmluaXRNYXApO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0TWFwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IG5ldyB5bWFwcy5NYXAoXCJyZXN1bHRfbWFwXCIsIHtcclxuICAgICAgICAgICAgY2VudGVyOiBbNTYuMjU0NzE0Njk4NzAwNzYsIDQzLjk0Nzk2NDQ1NDU4OTgxNV0sXHJcbiAgICAgICAgICAgIHpvb206IDEyLFxyXG4gICAgICAgICAgICBjb250cm9sczogW11cclxuICAgICAgICB9KTtcclxuICAgICAgICBtYXAuYmVoYXZpb3JzLmRpc2FibGUoJ3Njcm9sbFpvb20nKTtcclxuICAgICAgICAkKCcuanMtbWFwX196b29tJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgeiA9IG1hcC5nZXRab29tKCk7XHJcbiAgICAgICAgICAgICQodGhpcykuaGFzQ2xhc3MoJ19pbicpID8geisrIDogei0tO1xyXG4gICAgICAgICAgICBtYXAuc2V0Wm9vbSh6LCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja1pvb21SYW5nZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2xvc2VCdXR0b24gPSBuZXcgeW1hcHMuY29udHJvbC5CdXR0b24oe1xyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ9CX0LDQutGA0YvRgtGMINC60LDRgNGC0YMnLFxyXG4gICAgICAgICAgICAgICAgaW1hZ2U6ICdtYXAtY2xvc2Uuc3ZnJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhXaWR0aDogOTAsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RPbkNsaWNrOiBmYWxzZSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNsb3NlQnV0dG9uLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBhcHBSZXN1bHRNYXAuY2xvc2VCdXR0b24gPSBjbG9zZUJ1dHRvbjtcclxuXHJcbiAgICAgICAgdmFyIG9tID0gbmV3IHltYXBzLk9iamVjdE1hbmFnZXIoe1xyXG4gICAgICAgICAgICBjbHVzdGVyaXplOiB0cnVlLFxyXG4gICAgICAgICAgICBncmlkU2l6ZTogMzIsXHJcbiAgICAgICAgICAgIGdlb09iamVjdE9wZW5CYWxsb29uT25DbGljazogZmFsc2UsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIHRwbCA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGxhY2VtYXJrIF90b3RhbCBfcHJpbWFyeVwiPjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgOC4yMDIgMTEuMTEzXCIgY2xhc3M9XCJcIj48cGF0aCBkPVwiTTQuMTAxIDExLjExM2MyLjczNC0zLjEyIDQuMTAxLTUuNDQyIDQuMTAxLTYuOTY4QzguMjAyIDEuODU1IDYuMzY2IDAgNC4xMDEgMCAxLjgzNiAwIDAgMS44NTYgMCA0LjE0NWMwIDEuNTI2IDEuMzY3IDMuODQ5IDQuMTAxIDYuOTY4elwiIGZpbGw9XCIjZmZmXCI+PC9wYXRoPjwvc3ZnPjxzcGFuPnt7IHByb3BlcnRpZXMudG90YWwgfX08L3NwYW4+PC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgdHBsQmFsbG9vbiA9IHltYXBzLnRlbXBsYXRlTGF5b3V0RmFjdG9yeS5jcmVhdGVDbGFzcyhcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicmVzdWx0LW1hcF9fYmFsbG9vblwiPnt7IHByb3BlcnRpZXMuY29udGVudHxyYXcgfX08c3BhbiBjbGFzcz1cInNwYWNlclwiPjwvc3Bhbj48L2Rpdj4nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnVpbGQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHBsQmFsbG9vbi5zdXBlcmNsYXNzLmJ1aWxkLmNhbGwodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5vbm1hcF9fbGlzdCAuc2Nyb2xsYmFyLW91dGVyJykuc2Nyb2xsYmFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuXyRlbGVtZW50ID0gJCgnLnJlc3VsdC1tYXBfX2JhbGxvb24nLCB0aGlzLmdldFBhcmVudEVsZW1lbnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBnZXRTaGFwZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzRWxlbWVudCh0aGlzLl8kZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cGxCYWxsb29uLnN1cGVyY2xhc3MuZ2V0U2hhcGUuY2FsbCh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fJGVsZW1lbnQucG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgeW1hcHMuc2hhcGUuUmVjdGFuZ2xlKG5ldyB5bWFwcy5nZW9tZXRyeS5waXhlbC5SZWN0YW5nbGUoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW3Bvc2l0aW9uLmxlZnQsIHBvc2l0aW9uLnRvcF0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5sZWZ0ICsgdGhpcy5fJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24udG9wICsgdGhpcy5fJGVsZW1lbnRbMF0ub2Zmc2V0SGVpZ2h0ICsgdGhpcy5fJGVsZW1lbnQuZmluZCgnLnNwYWNlcicpWzBdLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBfaXNFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50WzBdICYmIGVsZW1lbnQuZmluZCgnLnNwYWNlcicpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIG9tLm9iamVjdHMub3B0aW9ucy5zZXQoe1xyXG4gICAgICAgICAgICBpY29uTGF5b3V0OiB0cGwsXHJcbiAgICAgICAgICAgIGljb25TaGFwZToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ1JlY3RhbmdsZScsXHJcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW1xyXG4gICAgICAgICAgICAgICAgICAgIFstMTUuNSwgLTQyXSwgWzE1LjUsIDBdXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhpZGVJY29uT25CYWxsb29uT3BlbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGJhbGxvb25MYXlvdXQ6IHRwbEJhbGxvb24sXHJcbiAgICAgICAgICAgIGJhbGxvb25DbG9zZUJ1dHRvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGJhbGxvb25QYW5lbE1heE1hcEFyZWE6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBvbS5jbHVzdGVycy5vcHRpb25zLnNldCgncHJlc2V0JywgJ2lzbGFuZHMjZGFya0JsdWVDaXJjbGVJY29uJyk7XHJcbiAgICAgICAgbWFwLmdlb09iamVjdHMuYWRkKG9tKTtcclxuICAgICAgICBcclxuICAgICAgICBvbS5vYmplY3RzLmV2ZW50cy5hZGQoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIG9iamVjdElkID0gZS5nZXQoJ29iamVjdElkJyksXHJcbiAgICAgICAgICAgICAgICBvYmogPSBvbS5vYmplY3RzLmdldEJ5SWQob2JqZWN0SWQpO1xyXG4gICAgICAgICAgICBpZiAob20ub2JqZWN0cy5iYWxsb29uLmlzT3BlbihvYmplY3RJZCkpIHsgb20ub2JqZWN0cy5iYWxsb29uLmNsb3NlKCk7IHJldHVybjsgfVxyXG4gICAgICAgICAgICBpZiAob2JqLnByb3BlcnRpZXMuY29udGVudCkge1xyXG4gICAgICAgICAgICAgICAgb20ub2JqZWN0cy5iYWxsb29uLm9wZW4ob2JqZWN0SWQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb2JqLnByb3BlcnRpZXMuY29udGVudCA9ICc8c3BhbiBjbGFzcz1cInJlc3VsdC1tYXBfX2JhbGxvb25fX2xvYWRpbmdcIj48aSBjbGFzcz1cImljb24tc3BpblwiPjwvaT48L3NwYW4+JztcclxuICAgICAgICAgICAgICAgIG9tLm9iamVjdHMuYmFsbG9vbi5vcGVuKG9iamVjdElkKTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmV4dGVuZCh7Y29vcmRpbmF0ZXM6IG9iai5nZW9tZXRyeS5jb29yZGluYXRlc30sIGFwcFJlc3VsdE1hcC5vcHRpb25zLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICAkLmdldChhcHBSZXN1bHRNYXAub3B0aW9ucy51cmxJdGVtcywgcGFyYW1zLCBmdW5jdGlvbiAocmVzcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9iai5wcm9wZXJ0aWVzLmNvbnRlbnQgPSByZXNwO1xyXG4gICAgICAgICAgICAgICAgICAgIG9tLm9iamVjdHMuYmFsbG9vbi5zZXREYXRhKG9iaik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGFwcFJlc3VsdE1hcC5tYXAgPSBtYXA7XHJcbiAgICAgICAgYXBwUmVzdWx0TWFwLm9tID0gb207XHJcblxyXG4gICAgICAgICQoJy5yZXN1bHQtbWFwX19ob3ZlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy4kY250LmFkZENsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgdGhpcy5tYXAuY29udHJvbHMuYWRkKHRoaXMuY2xvc2VCdXR0b24sIHtcclxuICAgICAgICAgICAgICAgIGZsb2F0OiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICBmbG9hdEluZGV4OiAxLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5tYXAuY29udHJvbHMuYWRkKCdmdWxsc2NyZWVuQ29udHJvbCcsIHtcclxuICAgICAgICAgICAgICAgIGZsb2F0SW5kZXg6IDBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGNudC5yZW1vdmVDbGFzcygnX2V4cGFuZGVkJyk7XHJcbiAgICAgICAgdGhpcy5tYXAuY29udHJvbHMucmVtb3ZlKCdmdWxsc2NyZWVuQ29udHJvbCcpO1xyXG4gICAgICAgIHRoaXMubWFwLmNvbnRyb2xzLnJlbW92ZSh0aGlzLmNsb3NlQnV0dG9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgbG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGFwcFJlc3VsdE1hcC4kY250LmFkZENsYXNzKCdfbG9hZGluZycpO1xyXG4gICAgICAgICQuZ2V0KHRoaXMub3B0aW9ucy51cmxQbGFjZXMsIHRoaXMub3B0aW9ucy5wYXJhbXMsIGZ1bmN0aW9uIChyZXNwKSB7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5vbS5hZGQocmVzcCk7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5tYXAuc2V0Qm91bmRzKGFwcFJlc3VsdE1hcC5tYXAuZ2VvT2JqZWN0cy5nZXRCb3VuZHMoKSk7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC4kY250LmFkZENsYXNzKCdfZXhwYW5kZWQnKTtcclxuICAgICAgICAgICAgYXBwUmVzdWx0TWFwLiRjbnQucmVtb3ZlQ2xhc3MoJ19sb2FkaW5nJyk7XHJcbiAgICAgICAgICAgIGFwcFJlc3VsdE1hcC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBhcHBSZXN1bHRNYXAuc2hvdygpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbn0iXSwiZmlsZSI6InJlc3VsdC5qcyJ9
