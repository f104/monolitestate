/*
 * jQuery Form Styler v2.0.0
 * https://github.com/Dimox/jQueryFormStyler
 *
 * Copyright 2012-2017 Dimox (http://dimox.name/)
 * Released under the MIT license.
 *
 * Date: 2017.05.08
 *
 */

;(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = factory($ || require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {

	'use strict';

	var pluginName = 'styler',
			defaults = {
				idSuffix: '-styler',
				filePlaceholder: 'Файл не выбран',
				fileBrowse: 'Обзор...',
				fileNumber: 'Выбрано файлов: %s',
				selectPlaceholder: 'Выберите...',
				selectSearch: false,
				selectSearchLimit: 10,
				selectSearchNotFound: 'Совпадений не найдено',
				selectSearchPlaceholder: 'Поиск...',
				selectVisibleOptions: 0,
				selectSmartPositioning: true,
				locale: 'ru',
				locales: {
					'en': {
						filePlaceholder: 'No file selected',
						fileBrowse: 'Browse...',
						fileNumber: 'Selected files: %s',
						selectPlaceholder: 'Select...',
						selectSearchNotFound: 'No matches found',
						selectSearchPlaceholder: 'Search...'
					}
				},
				onSelectOpened: function() {},
				onSelectClosed: function() {},
				onFormStyled: function() {}
			};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		var locale = this.options.locale;
		if (this.options.locales[locale] !== undefined) {
			$.extend(this.options, this.options.locales[locale]);
		}
		this.init();
	}

	Plugin.prototype = {

		// инициализация
		init: function() {

			var el = $(this.element);
			var opt = this.options;

			var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;
			var Android = (navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;

			function Attributes() {
				if (el.attr('id') !== undefined && el.attr('id') !== '') {
					this.id = el.attr('id') + opt.idSuffix;
				}
				this.title = el.attr('title');
				this.classes = el.attr('class');
				this.data = el.data();
			}

			// checkbox
			if (el.is(':checkbox')) {

				var checkboxOutput = function() {

					var att = new Attributes();
					var checkbox = $('<div class="jq-checkbox"><div class="jq-checkbox__div"></div></div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(checkbox).prependTo(checkbox);
					if (el.is(':checked')) checkbox.addClass('checked');
					if (el.is(':disabled')) checkbox.addClass('disabled');

					// клик на псевдочекбокс
					checkbox.click(function(e) {
						e.preventDefault();
						el.triggerHandler('click');
						if (!checkbox.is('.disabled')) {
							if (el.is(':checked')) {
								el.prop('checked', false);
								checkbox.removeClass('checked');
							} else {
								el.prop('checked', true);
								checkbox.addClass('checked');
							}
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(checkbox).length) {
							checkbox.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение по Space или Enter
					el.on('change.styler', function() {
						if (el.is(':checked')) checkbox.addClass('checked');
						else checkbox.removeClass('checked');
					})
					// чтобы переключался чекбокс, который находится в теге label
					.on('keydown.styler', function(e) {
						if (e.which == 32) checkbox.click();
					})
					.on('focus.styler', function() {
						if (!checkbox.is('.disabled')) checkbox.addClass('focused');
					})
					.on('blur.styler', function() {
						checkbox.removeClass('focused');
					});

				}; // end checkboxOutput()

				checkboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					checkboxOutput();
				});

			// end checkbox

			// radio
			} else if (el.is(':radio')) {

				var radioOutput = function() {

					var att = new Attributes();
					var radio = $('<div class="jq-radio"><div class="jq-radio__div"></div></div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(radio).prependTo(radio);
					if (el.is(':checked')) radio.addClass('checked');
					if (el.is(':disabled')) radio.addClass('disabled');

					// определяем общего родителя у радиокнопок с одинаковым name
					// http://stackoverflow.com/a/27733847
					$.fn.commonParents = function() {
						var cachedThis = this;
						return cachedThis.first().parents().filter(function() {
							return $(this).find(cachedThis).length === cachedThis.length;
						});
					};
					$.fn.commonParent = function() {
						return $(this).commonParents().first();
					};

					// клик на псевдорадиокнопке
					radio.click(function(e) {
						e.preventDefault();
						el.triggerHandler('click');
						if (!radio.is('.disabled')) {
							var inputName = $('input[name="' + el.attr('name') + '"]');
							inputName.commonParent().find(inputName).prop('checked', false).parent().removeClass('checked');
							el.prop('checked', true).parent().addClass('checked');
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(radio).length) {
							radio.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение стрелками
					el.on('change.styler', function() {
						el.parent().addClass('checked');
					})
					.on('focus.styler', function() {
						if (!radio.is('.disabled')) radio.addClass('focused');
					})
					.on('blur.styler', function() {
						radio.removeClass('focused');
					});

				}; // end radioOutput()

				radioOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					radioOutput();
				});

			// end radio

			// file
			} else if (el.is(':file')) {

				var fileOutput = function() {

					var att = new Attributes();
					var placeholder = el.data('placeholder');
					if (placeholder === undefined) placeholder = opt.filePlaceholder;
					var browse = el.data('browse');
					if (browse === undefined || browse === '') browse = opt.fileBrowse;

					var file =
						$('<div class="jq-file">' +
								'<div class="jq-file__name">' + placeholder + '</div>' +
								'<div class="jq-file__browse">' + browse + '</div>' +
							'</div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(file).appendTo(file);
					if (el.is(':disabled')) file.addClass('disabled');

					var value = el.val();
					var name = $('div.jq-file__name', file);

					// чтобы при динамическом изменении имя файла не сбрасывалось
					if (value) name.text(value.replace(/.+[\\\/]/, ''));

					el.on('change.styler', function() {
						var value = el.val();
						if (el.is('[multiple]')) {
							value = '';
							var files = el[0].files.length;
							if (files > 0) {
								var number = el.data('number');
								if (number === undefined) number = opt.fileNumber;
								number = number.replace('%s', files);
								value = number;
							}
						}
						name.text(value.replace(/.+[\\\/]/, ''));
						if (value === '') {
							name.text(placeholder);
							file.removeClass('changed');
						} else {
							file.addClass('changed');
						}
					})
					.on('focus.styler', function() {
						file.addClass('focused');
					})
					.on('blur.styler', function() {
						file.removeClass('focused');
					})
					.on('click.styler', function() {
						file.removeClass('focused');
					});

				}; // end fileOutput()

				fileOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					fileOutput();
				});

			// end file

			} else if (el.is('input[type="number"]')) {

				var numberOutput = function() {

					var att = new Attributes();
					var number =
						$('<div class="jq-number">' +
								'<div class="jq-number__spin minus"></div>' +
								'<div class="jq-number__spin plus"></div>' +
							'</div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(number).prependTo(number).wrap('<div class="jq-number__field"></div>');
					if (el.is(':disabled')) number.addClass('disabled');

					var min,
							max,
							step,
							timeout = null,
							interval = null;
					if (el.attr('min') !== undefined) min = el.attr('min');
					if (el.attr('max') !== undefined) max = el.attr('max');
					if (el.attr('step') !== undefined && $.isNumeric(el.attr('step')))
						step = Number(el.attr('step'));
					else
						step = Number(1);

					var changeValue = function(spin) {
						var value = el.val(),
								newValue;

						if (!$.isNumeric(value)) {
							value = 0;
							el.val('0');
						}

						if (spin.is('.minus')) {
							newValue = Number(value) - step;
						} else if (spin.is('.plus')) {
							newValue = Number(value) + step;
						}

						// определяем количество десятичных знаков после запятой в step
						var decimals = (step.toString().split('.')[1] || []).length;
						if (decimals > 0) {
							var multiplier = '1';
							while (multiplier.length <= decimals) multiplier = multiplier + '0';
							// избегаем появления лишних знаков после запятой
							newValue = Math.round(newValue * multiplier) / multiplier;
						}

						if ($.isNumeric(min) && $.isNumeric(max)) {
							if (newValue >= min && newValue <= max) el.val(newValue);
						} else if ($.isNumeric(min) && !$.isNumeric(max)) {
							if (newValue >= min) el.val(newValue);
						} else if (!$.isNumeric(min) && $.isNumeric(max)) {
							if (newValue <= max) el.val(newValue);
						} else {
							el.val(newValue);
						}
					};

					if (!number.is('.disabled')) {
						number.on('mousedown', 'div.jq-number__spin', function() {
							var spin = $(this);
							changeValue(spin);
							timeout = setTimeout(function(){
								interval = setInterval(function(){ changeValue(spin); }, 40);
							}, 350);
						}).on('mouseup mouseout', 'div.jq-number__spin', function() {
							clearTimeout(timeout);
							clearInterval(interval);
						}).on('mouseup', 'div.jq-number__spin', function() {
							el.change();
						});
						el.on('focus.styler', function() {
							number.addClass('focused');
						})
						.on('blur.styler', function() {
							number.removeClass('focused');
						});
					}

				}; // end numberOutput()

				numberOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').closest('.jq-number').before(el).remove();
					numberOutput();
				});

			// end number

			// select
			} else if (el.is('select')) {

				var selectboxOutput = function() {

					// запрещаем прокрутку страницы при прокрутке селекта
					function preventScrolling(selector) {

						var scrollDiff = selector.prop('scrollHeight') - selector.outerHeight(),
								wheelDelta = null,
								scrollTop = null;

						selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {

							/**
							 * нормализация направления прокрутки
							 * (firefox < 0 || chrome etc... > 0)
							 * (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0)
							 */
							wheelDelta = (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0) ? 1 : -1; // направление прокрутки (-1 вниз, 1 вверх)
							scrollTop = selector.scrollTop(); // позиция скролла

							if ((scrollTop >= scrollDiff && wheelDelta < 0) || (scrollTop <= 0 && wheelDelta > 0)) {
								e.stopPropagation();
								e.preventDefault();
							}

						});
					}

					var option = $('option', el);
					var list = '';
					// формируем список селекта
					function makeList() {
						for (var i = 0; i < option.length; i++) {
							var op = option.eq(i);
							var li = '',
									liClass = '',
									liClasses = '',
									id = '',
									title = '',
									dataList = '',
									optionClass = '',
									optgroupClass = '',
									dataJqfsClass = '';
							var disabled = 'disabled';
							var selDis = 'selected sel disabled';
							if (op.prop('selected')) liClass = 'selected sel';
							if (op.is(':disabled')) liClass = disabled;
							if (op.is(':selected:disabled')) liClass = selDis;
							if (op.attr('id') !== undefined && op.attr('id') !== '') id = ' id="' + op.attr('id') + opt.idSuffix + '"';
							if (op.attr('title') !== undefined && option.attr('title') !== '') title = ' title="' + op.attr('title') + '"';
							if (op.attr('class') !== undefined) {
								optionClass = ' ' + op.attr('class');
								dataJqfsClass = ' data-jqfs-class="' + op.attr('class') + '"';
							}

							var data = op.data();
							for (var k in data) {
								if (data[k] !== '') dataList += ' data-' + k + '="' + data[k] + '"';
							}

							if ( (liClass + optionClass) !== '' )   liClasses = ' class="' + liClass + optionClass + '"';
							li = '<li' + dataJqfsClass + dataList + liClasses + title + id + '>'+ op.html() +'</li>';

							// если есть optgroup
							if (op.parent().is('optgroup')) {
								if (op.parent().attr('class') !== undefined) optgroupClass = ' ' + op.parent().attr('class');
								li = '<li' + dataJqfsClass + dataList + ' class="' + liClass + optionClass + ' option' + optgroupClass + '"' + title + id + '>'+ op.html() +'</li>';
								if (op.is(':first-child')) {
									li = '<li class="optgroup' + optgroupClass + '">' + op.parent().attr('label') + '</li>' + li;
								}
							}

							list += li;
						}
					} // end makeList()

					// одиночный селект
					function doSelect() {

						var att = new Attributes();
						var searchHTML = '';
						var selectPlaceholder = el.data('placeholder');
						var selectSearch = el.data('search');
						var selectSearchLimit = el.data('search-limit');
						var selectSearchNotFound = el.data('search-not-found');
						var selectSearchPlaceholder = el.data('search-placeholder');
						var selectSmartPositioning = el.data('smart-positioning');

						if (selectPlaceholder === undefined) selectPlaceholder = opt.selectPlaceholder;
						if (selectSearch === undefined || selectSearch === '') selectSearch = opt.selectSearch;
						if (selectSearchLimit === undefined || selectSearchLimit === '') selectSearchLimit = opt.selectSearchLimit;
						if (selectSearchNotFound === undefined || selectSearchNotFound === '') selectSearchNotFound = opt.selectSearchNotFound;
						if (selectSearchPlaceholder === undefined) selectSearchPlaceholder = opt.selectSearchPlaceholder;
						if (selectSmartPositioning === undefined || selectSmartPositioning === '') selectSmartPositioning = opt.selectSmartPositioning;

						var selectbox =
							$('<div class="jq-selectbox jqselect">' +
									'<div class="jq-selectbox__select">' +
										'<div class="jq-selectbox__select-text"></div>' +
										'<div class="jq-selectbox__trigger">' +
											'<div class="jq-selectbox__trigger-arrow"></div></div>' +
									'</div>' +
								'</div>')
							.attr({
								id: att.id,
								title: att.title
							})
							.addClass(att.classes)
							.data(att.data)
						;

						el.after(selectbox).prependTo(selectbox);

						var selectzIndex = selectbox.css('z-index');
						selectzIndex = (selectzIndex > 0 ) ? selectzIndex : 1;
						var divSelect = $('div.jq-selectbox__select', selectbox);
						var divText = $('div.jq-selectbox__select-text', selectbox);
						var optionSelected = option.filter(':selected');

						makeList();

						if (selectSearch) searchHTML =
							'<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + selectSearchPlaceholder + '"></div>' +
							'<div class="jq-selectbox__not-found">' + selectSearchNotFound + '</div>';
						var dropdown =
							$('<div class="jq-selectbox__dropdown">' +
									searchHTML + '<ul>' + list + '</ul>' +
								'</div>');
						selectbox.append(dropdown);
						var ul = $('ul', dropdown);
						var li = $('li', dropdown);
						var search = $('input', dropdown);
						var notFound = $('div.jq-selectbox__not-found', dropdown).hide();
						if (li.length < selectSearchLimit) search.parent().hide();

						// показываем опцию по умолчанию
						// если у 1-й опции нет текста, она выбрана по умолчанию и параметр selectPlaceholder не false, то показываем плейсхолдер
						if (option.first().text() === '' && option.first().is(':selected') && selectPlaceholder !== false) {
							divText.text(selectPlaceholder).addClass('placeholder');
						} else {
							divText.text(optionSelected.text());
						}

						// определяем самый широкий пункт селекта
						var liWidthInner = 0,
								liWidth = 0;
						li.css({'display': 'inline-block'});
						li.each(function() {
							var l = $(this);
							if (l.innerWidth() > liWidthInner) {
								liWidthInner = l.innerWidth();
								liWidth = l.width();
							}
						});
						li.css({'display': ''});

						// подстраиваем ширину свернутого селекта в зависимости
						// от ширины плейсхолдера или самого широкого пункта
						if (divText.is('.placeholder') && (divText.width() > liWidthInner)) {
							divText.width(divText.width());
						} else {
							var selClone = selectbox.clone().appendTo('body').width('auto');
							var selCloneWidth = selClone.outerWidth();
							selClone.remove();
							if (selCloneWidth == selectbox.outerWidth()) {
								divText.width(liWidth);
							}
						}

						// подстраиваем ширину выпадающего списка в зависимости от самого широкого пункта
						if (liWidthInner > selectbox.width()) dropdown.width(liWidthInner);

						// прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
						// если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
						if (option.first().text() === '' && el.data('placeholder') !== '') {
							li.first().hide();
						}

						var selectHeight = selectbox.outerHeight(true);
						var searchHeight = search.parent().outerHeight(true) || 0;
						var isMaxHeight = ul.css('max-height');
						var liSelected = li.filter('.selected');
						if (liSelected.length < 1) li.first().addClass('selected sel');
						if (li.data('li-height') === undefined) {
							var liOuterHeight = li.outerHeight();
							if (selectPlaceholder !== false) liOuterHeight = li.eq(1).outerHeight();
							li.data('li-height', liOuterHeight);
						}
						var position = dropdown.css('top');
						if (dropdown.css('left') == 'auto') dropdown.css({left: 0});
						if (dropdown.css('top') == 'auto') {
							dropdown.css({top: selectHeight});
							position = selectHeight;
						}
						dropdown.hide();

						// если выбран не дефолтный пункт
						if (liSelected.length) {
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != optionSelected.text()) {
								selectbox.addClass('changed');
							}
							// передаем селекту класс выбранного пункта
							selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
							selectbox.addClass(liSelected.data('jqfs-class'));
						}

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							return false;
						}

						// при клике на псевдоселекте
						divSelect.click(function() {

							// колбек при закрытии селекта
							if ($('div.jq-selectbox').filter('.opened').length) {
								opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
							}

							el.focus();

							// если iOS, то не показываем выпадающий список,
							// т.к. отображается нативный и неизвестно, как его спрятать
							if (iOS) return;

							// умное позиционирование
							var win = $(window);
							var liHeight = li.data('li-height');
							var topOffset = selectbox.offset().top;
							var bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop());
							var visible = el.data('visible-options');
							if (visible === undefined || visible === '') visible = opt.selectVisibleOptions;
							var minHeight = liHeight * 5;
							var newHeight = liHeight * visible;
							if (visible > 0 && visible < 6) minHeight = newHeight;
							if (visible === 0) newHeight = 'auto';

							var dropDown = function() {
								dropdown.height('auto').css({bottom: 'auto', top: position});
								var maxHeightBottom = function() {
									ul.css('max-height', Math.floor((bottomOffset - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightBottom();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if (bottomOffset < (dropdown.outerHeight() + 20)) {
									maxHeightBottom();
								}
							};

							var dropUp = function() {
								dropdown.height('auto').css({top: 'auto', bottom: position});
								var maxHeightTop = function() {
									ul.css('max-height', Math.floor((topOffset - win.scrollTop() - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightTop();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if ((topOffset - win.scrollTop() - 20) < (dropdown.outerHeight() + 20)) {
									maxHeightTop();
								}
							};

							if (selectSmartPositioning === true || selectSmartPositioning === 1) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								// раскрытие вверх
								} else {
									dropUp();
									selectbox.removeClass('dropdown').addClass('dropup');
								}
							} else if (selectSmartPositioning === false || selectSmartPositioning === 0) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								}
							} else {
								// если умное позиционирование отключено
								dropdown.height('auto').css({bottom: 'auto', top: position});
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
							}

							// если выпадающий список выходит за правый край окна браузера,
							// то меняем позиционирование с левого на правое
							if (selectbox.offset().left + dropdown.outerWidth() > win.width()) {
								dropdown.css({left: 'auto', right: 0});
							}
							// конец умного позиционирования

							$('div.jqselect').css({zIndex: (selectzIndex - 1)}).removeClass('opened');
							selectbox.css({zIndex: selectzIndex});
							if (dropdown.is(':hidden')) {
								$('div.jq-selectbox__dropdown:visible').hide();
								dropdown.show();
								selectbox.addClass('opened focused');
								// колбек при открытии селекта
								opt.onSelectOpened.call(selectbox);
							} else {
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								if ($('div.jq-selectbox').filter('.opened').length) {
									opt.onSelectClosed.call(selectbox);
								}
							}

							// поисковое поле
							if (search.length) {
								search.val('').keyup();
								notFound.hide();
								search.keyup(function() {
									var query = $(this).val();
									li.each(function() {
										if (!$(this).html().match(new RegExp('.*?' + query + '.*?', 'i'))) {
											$(this).hide();
										} else {
											$(this).show();
										}
									});
									// прячем 1-ю пустую опцию
									if (option.first().text() === '' && el.data('placeholder') !== '') {
										li.first().hide();
									}
									if (li.filter(':visible').length < 1) {
										notFound.show();
									} else {
										notFound.hide();
									}
								});
							}

							// прокручиваем до выбранного пункта при открытии списка
							if (li.filter('.selected').length) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									// если нечетное количество видимых пунктов,
									// то высоту пункта делим пополам для последующего расчета
									if ( (ul.innerHeight() / liHeight) % 2 !== 0 ) liHeight = liHeight / 2;
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() / 2 + liHeight);
								}
							}

							preventScrolling(ul);

						}); // end divSelect.click()

						// при наведении курсора на пункт списка
						li.hover(function() {
							$(this).siblings().removeClass('selected');
						});
						var selectedText = li.filter('.selected').text();

						// при клике на пункт списка
						li.filter(':not(.disabled):not(.optgroup)').click(function() {
							el.focus();
							var t = $(this);
							var liText = t.text();
							if (!t.is('.selected')) {
								var index = t.index();
								index -= t.prevAll('.optgroup').length;
								t.addClass('selected sel').siblings().removeClass('selected sel');
								option.prop('selected', false).eq(index).prop('selected', true);
								selectedText = liText;
								divText.text(liText);

								// передаем селекту класс выбранного пункта
								if (selectbox.data('jqfs-class')) selectbox.removeClass(selectbox.data('jqfs-class'));
								selectbox.data('jqfs-class', t.data('jqfs-class'));
								selectbox.addClass(t.data('jqfs-class'));

								el.change();
							}
							dropdown.hide();
							selectbox.removeClass('opened dropup dropdown');
							// колбек при закрытии селекта
							opt.onSelectClosed.call(selectbox);

						});
						dropdown.mouseout(function() {
							$('li.sel', dropdown).addClass('selected');
						});

						// изменение селекта
						el.on('change.styler', function() {
							divText.text(option.filter(':selected').text()).removeClass('placeholder');
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != li.filter('.selected').text()) {
								selectbox.addClass('changed');
							} else {
								selectbox.removeClass('changed');
							}
						})
						.on('focus.styler', function() {
							selectbox.addClass('focused');
							$('div.jqselect').not('.focused').removeClass('opened dropup dropdown').find('div.jq-selectbox__dropdown').hide();
						})
						.on('blur.styler', function() {
							selectbox.removeClass('focused');
						})
						// изменение селекта с клавиатуры
						.on('keydown.styler keyup.styler', function(e) {
							var liHeight = li.data('li-height');
							if (el.val() === '') {
								divText.text(selectPlaceholder).addClass('placeholder');
							} else {
								divText.text(option.filter(':selected').text());
							}
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// вверх, влево, Page Up, Home
							if (e.which == 38 || e.which == 37 || e.which == 33 || e.which == 36) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
								}
							}
							// вниз, вправо, Page Down, End
							if (e.which == 40 || e.which == 39 || e.which == 34 || e.which == 35) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() + liHeight);
							}
							// закрываем выпадающий список при нажатии Enter
							if (e.which == 13) {
								e.preventDefault();
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								opt.onSelectClosed.call(selectbox);
							}
						}).on('keydown.styler', function(e) {
							// открываем выпадающий список при нажатии Space
							if (e.which == 32) {
								e.preventDefault();
								divSelect.click();
							}
						});

						// прячем выпадающий список при клике за пределами селекта
						if (!onDocumentClick.registered) {
							$(document).on('click', onDocumentClick);
							onDocumentClick.registered = true;
						}

					} // end doSelect()

					// мультиселект
					function doMultipleSelect() {

						var att = new Attributes();
						var selectbox =
							$('<div class="jq-select-multiple jqselect"></div>')
							.attr({
								id: att.id,
								title: att.title
							})
							.addClass(att.classes)
							.data(att.data)
						;

						el.after(selectbox);

						makeList();
						selectbox.append('<ul>' + list + '</ul>');
						var ul = $('ul', selectbox);
						var li = $('li', selectbox);
						var size = el.attr('size');
						var ulHeight = ul.outerHeight();
						var liHeight = li.outerHeight();
						if (size !== undefined && size > 0) {
							ul.css({'height': liHeight * size});
						} else {
							ul.css({'height': liHeight * 4});
						}
						if (ulHeight > selectbox.height()) {
							ul.css('overflowY', 'scroll');
							preventScrolling(ul);
							// прокручиваем до выбранного пункта
							if (li.filter('.selected').length) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
							}
						}

						// прячем оригинальный селект
						el.prependTo(selectbox);

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							option.each(function() {
								if ($(this).is(':selected')) li.eq($(this).index()).addClass('selected');
							});

						// если селект активный
						} else {

							// при клике на пункт списка
							li.filter(':not(.disabled):not(.optgroup)').click(function(e) {
								el.focus();
								var clkd = $(this);
								if(!e.ctrlKey && !e.metaKey) clkd.addClass('selected');
								if(!e.shiftKey) clkd.addClass('first');
								if(!e.ctrlKey && !e.metaKey && !e.shiftKey) clkd.siblings().removeClass('selected first');

								// выделение пунктов при зажатом Ctrl
								if(e.ctrlKey || e.metaKey) {
									if (clkd.is('.selected')) clkd.removeClass('selected first');
										else clkd.addClass('selected first');
									clkd.siblings().removeClass('first');
								}

								// выделение пунктов при зажатом Shift
								if(e.shiftKey) {
									var prev = false,
											next = false;
									clkd.siblings().removeClass('selected').siblings('.first').addClass('selected');
									clkd.prevAll().each(function() {
										if ($(this).is('.first')) prev = true;
									});
									clkd.nextAll().each(function() {
										if ($(this).is('.first')) next = true;
									});
									if (prev) {
										clkd.prevAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (next) {
										clkd.nextAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (li.filter('.selected').length == 1) clkd.addClass('first');
								}

								// отмечаем выбранные мышью
								option.prop('selected', false);
								li.filter('.selected').each(function() {
									var t = $(this);
									var index = t.index();
									if (t.is('.option')) index -= t.prevAll('.optgroup').length;
									option.eq(index).prop('selected', true);
								});
								el.change();

							});

							// отмечаем выбранные с клавиатуры
							option.each(function(i) {
								$(this).data('optionIndex', i);
							});
							el.on('change.styler', function() {
								li.removeClass('selected');
								var arrIndexes = [];
								option.filter(':selected').each(function() {
									arrIndexes.push($(this).data('optionIndex'));
								});
								li.not('.optgroup').filter(function(i) {
									return $.inArray(i, arrIndexes) > -1;
								}).addClass('selected');
							})
							.on('focus.styler', function() {
								selectbox.addClass('focused');
							})
							.on('blur.styler', function() {
								selectbox.removeClass('focused');
							});

							// прокручиваем с клавиатуры
							if (ulHeight > selectbox.height()) {
								el.on('keydown.styler', function(e) {
									// вверх, влево, PageUp
									if (e.which == 38 || e.which == 37 || e.which == 33) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - liHeight);
									}
									// вниз, вправо, PageDown
									if (e.which == 40 || e.which == 39 || e.which == 34) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected:last').position().top - ul.innerHeight() + liHeight * 2);
									}
								});
							}

						}
					} // end doMultipleSelect()

					if (el.is('[multiple]')) {

						// если Android или iOS, то мультиселект не стилизуем
						// причина для Android - в стилизованном селекте нет возможности выбрать несколько пунктов
						// причина для iOS - в стилизованном селекте неправильно отображаются выбранные пункты
						if (Android || iOS) return;

						doMultipleSelect();
					} else {
						doSelect();
					}

				}; // end selectboxOutput()

				selectboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					selectboxOutput();
				});

			// end select

			// reset
			} else if (el.is(':reset')) {
				el.on('click', function() {
					setTimeout(function() {
						el.closest('form').find('input, select').trigger('refresh');
					}, 1);
				});
			} // end reset

		}, // init: function()

		// деструктор
		destroy: function() {

			var el = $(this.element);

			if (el.is(':checkbox') || el.is(':radio')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
				el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
			} else if (el.is('input[type="number"]')) {
				el.removeData('_' + pluginName).off('.styler refresh').closest('.jq-number').before(el).remove();
			} else if (el.is(':file') || el.is('select')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
			}

		} // destroy: function()

	}; // Plugin.prototype

	$.fn[pluginName] = function(options) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			this.each(function() {
				if (!$.data(this, '_' + pluginName)) {
					$.data(this, '_' + pluginName, new Plugin(this, options));
				}
			})
			// колбек после выполнения плагина
			.promise()
			.done(function() {
				var opt = $(this[0]).data('_' + pluginName);
				if (opt) opt.options.onFormStyled.call();
			});
			return this;
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			var returns;
			this.each(function() {
				var instance = $.data(this, '_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
			});
			return returns !== undefined ? returns : this;
		}
	};

	// прячем выпадающий список при клике за пределами селекта
	function onDocumentClick(e) {
		// e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
		// (при изменении селекта с клавиатуры срабатывает событие onclick)
		if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName != 'OPTION') {
			if ($('div.jq-selectbox.opened').length) {
				var selectbox = $('div.jq-selectbox.opened'),
						search = $('div.jq-selectbox__search input', selectbox),
						dropdown = $('div.jq-selectbox__dropdown', selectbox),
						opt = selectbox.find('select').data('_' + pluginName).options;

				// колбек при закрытии селекта
				opt.onSelectClosed.call(selectbox);

				if (search.length) search.val('').keyup();
				dropdown.hide().find('li.sel').addClass('selected');
				selectbox.removeClass('focused opened dropup dropdown');
			}
		}
	}
	onDocumentClick.registered = false;

}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsaWJzL2pxdWVyeS5mb3Jtc3R5bGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIGpRdWVyeSBGb3JtIFN0eWxlciB2Mi4wLjBcclxuICogaHR0cHM6Ly9naXRodWIuY29tL0RpbW94L2pRdWVyeUZvcm1TdHlsZXJcclxuICpcclxuICogQ29weXJpZ2h0IDIwMTItMjAxNyBEaW1veCAoaHR0cDovL2RpbW94Lm5hbWUvKVxyXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiAqXHJcbiAqIERhdGU6IDIwMTcuMDUuMDhcclxuICpcclxuICovXHJcblxyXG47KGZ1bmN0aW9uKGZhY3RvcnkpIHtcclxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHQvLyBBTURcclxuXHRcdGRlZmluZShbJ2pxdWVyeSddLCBmYWN0b3J5KTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cdFx0Ly8gQ29tbW9uSlNcclxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgkIHx8IHJlcXVpcmUoJ2pxdWVyeScpKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZmFjdG9yeShqUXVlcnkpO1xyXG5cdH1cclxufShmdW5jdGlvbigkKSB7XHJcblxyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0dmFyIHBsdWdpbk5hbWUgPSAnc3R5bGVyJyxcclxuXHRcdFx0ZGVmYXVsdHMgPSB7XHJcblx0XHRcdFx0aWRTdWZmaXg6ICctc3R5bGVyJyxcclxuXHRcdFx0XHRmaWxlUGxhY2Vob2xkZXI6ICfQpNCw0LnQuyDQvdC1INCy0YvQsdGA0LDQvScsXHJcblx0XHRcdFx0ZmlsZUJyb3dzZTogJ9Ce0LHQt9C+0YAuLi4nLFxyXG5cdFx0XHRcdGZpbGVOdW1iZXI6ICfQktGL0LHRgNCw0L3QviDRhNCw0LnQu9C+0LI6ICVzJyxcclxuXHRcdFx0XHRzZWxlY3RQbGFjZWhvbGRlcjogJ9CS0YvQsdC10YDQuNGC0LUuLi4nLFxyXG5cdFx0XHRcdHNlbGVjdFNlYXJjaDogZmFsc2UsXHJcblx0XHRcdFx0c2VsZWN0U2VhcmNoTGltaXQ6IDEwLFxyXG5cdFx0XHRcdHNlbGVjdFNlYXJjaE5vdEZvdW5kOiAn0KHQvtCy0L/QsNC00LXQvdC40Lkg0L3QtSDQvdCw0LnQtNC10L3QvicsXHJcblx0XHRcdFx0c2VsZWN0U2VhcmNoUGxhY2Vob2xkZXI6ICfQn9C+0LjRgdC6Li4uJyxcclxuXHRcdFx0XHRzZWxlY3RWaXNpYmxlT3B0aW9uczogMCxcclxuXHRcdFx0XHRzZWxlY3RTbWFydFBvc2l0aW9uaW5nOiB0cnVlLFxyXG5cdFx0XHRcdGxvY2FsZTogJ3J1JyxcclxuXHRcdFx0XHRsb2NhbGVzOiB7XHJcblx0XHRcdFx0XHQnZW4nOiB7XHJcblx0XHRcdFx0XHRcdGZpbGVQbGFjZWhvbGRlcjogJ05vIGZpbGUgc2VsZWN0ZWQnLFxyXG5cdFx0XHRcdFx0XHRmaWxlQnJvd3NlOiAnQnJvd3NlLi4uJyxcclxuXHRcdFx0XHRcdFx0ZmlsZU51bWJlcjogJ1NlbGVjdGVkIGZpbGVzOiAlcycsXHJcblx0XHRcdFx0XHRcdHNlbGVjdFBsYWNlaG9sZGVyOiAnU2VsZWN0Li4uJyxcclxuXHRcdFx0XHRcdFx0c2VsZWN0U2VhcmNoTm90Rm91bmQ6ICdObyBtYXRjaGVzIGZvdW5kJyxcclxuXHRcdFx0XHRcdFx0c2VsZWN0U2VhcmNoUGxhY2Vob2xkZXI6ICdTZWFyY2guLi4nXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRvblNlbGVjdE9wZW5lZDogZnVuY3Rpb24oKSB7fSxcclxuXHRcdFx0XHRvblNlbGVjdENsb3NlZDogZnVuY3Rpb24oKSB7fSxcclxuXHRcdFx0XHRvbkZvcm1TdHlsZWQ6IGZ1bmN0aW9uKCkge31cclxuXHRcdFx0fTtcclxuXHJcblx0ZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHR0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cdFx0dmFyIGxvY2FsZSA9IHRoaXMub3B0aW9ucy5sb2NhbGU7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmxvY2FsZXNbbG9jYWxlXSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdCQuZXh0ZW5kKHRoaXMub3B0aW9ucywgdGhpcy5vcHRpb25zLmxvY2FsZXNbbG9jYWxlXSk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmluaXQoKTtcclxuXHR9XHJcblxyXG5cdFBsdWdpbi5wcm90b3R5cGUgPSB7XHJcblxyXG5cdFx0Ly8g0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y9cclxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0dmFyIGVsID0gJCh0aGlzLmVsZW1lbnQpO1xyXG5cdFx0XHR2YXIgb3B0ID0gdGhpcy5vcHRpb25zO1xyXG5cclxuXHRcdFx0dmFyIGlPUyA9IChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBhZHxpUGhvbmV8aVBvZCkvaSkgJiYgIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goLyhXaW5kb3dzXFxzUGhvbmUpL2kpKSA/IHRydWUgOiBmYWxzZTtcclxuXHRcdFx0dmFyIEFuZHJvaWQgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKSAmJiAhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvKFdpbmRvd3NcXHNQaG9uZSkvaSkpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gQXR0cmlidXRlcygpIHtcclxuXHRcdFx0XHRpZiAoZWwuYXR0cignaWQnKSAhPT0gdW5kZWZpbmVkICYmIGVsLmF0dHIoJ2lkJykgIT09ICcnKSB7XHJcblx0XHRcdFx0XHR0aGlzLmlkID0gZWwuYXR0cignaWQnKSArIG9wdC5pZFN1ZmZpeDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy50aXRsZSA9IGVsLmF0dHIoJ3RpdGxlJyk7XHJcblx0XHRcdFx0dGhpcy5jbGFzc2VzID0gZWwuYXR0cignY2xhc3MnKTtcclxuXHRcdFx0XHR0aGlzLmRhdGEgPSBlbC5kYXRhKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNoZWNrYm94XHJcblx0XHRcdGlmIChlbC5pcygnOmNoZWNrYm94JykpIHtcclxuXHJcblx0XHRcdFx0dmFyIGNoZWNrYm94T3V0cHV0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHR2YXIgY2hlY2tib3ggPSAkKCc8ZGl2IGNsYXNzPVwianEtY2hlY2tib3hcIj48ZGl2IGNsYXNzPVwianEtY2hlY2tib3hfX2RpdlwiPjwvZGl2PjwvZGl2PicpXHJcblx0XHRcdFx0XHRcdC5hdHRyKHtcclxuXHRcdFx0XHRcdFx0XHRpZDogYXR0LmlkLFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBhdHQudGl0bGVcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKGF0dC5jbGFzc2VzKVxyXG5cdFx0XHRcdFx0XHQuZGF0YShhdHQuZGF0YSlcclxuXHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRlbC5hZnRlcihjaGVja2JveCkucHJlcGVuZFRvKGNoZWNrYm94KTtcclxuXHRcdFx0XHRcdGlmIChlbC5pcygnOmNoZWNrZWQnKSkgY2hlY2tib3guYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdGlmIChlbC5pcygnOmRpc2FibGVkJykpIGNoZWNrYm94LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0XHRcdC8vINC60LvQuNC6INC90LAg0L/RgdC10LLQtNC+0YfQtdC60LHQvtC60YFcclxuXHRcdFx0XHRcdGNoZWNrYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRlbC50cmlnZ2VySGFuZGxlcignY2xpY2snKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFjaGVja2JveC5pcygnLmRpc2FibGVkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZWwuaXMoJzpjaGVja2VkJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGVsLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGVja2JveC5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRlbC5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRjaGVja2JveC5hZGRDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbC5mb2N1cygpLmNoYW5nZSgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdC8vINC60LvQuNC6INC90LAgbGFiZWxcclxuXHRcdFx0XHRcdGVsLmNsb3Nlc3QoJ2xhYmVsJykuYWRkKCdsYWJlbFtmb3I9XCInICsgZWwuYXR0cignaWQnKSArICdcIl0nKS5vbignY2xpY2suc3R5bGVyJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoISQoZS50YXJnZXQpLmlzKCdhJykgJiYgISQoZS50YXJnZXQpLmNsb3Nlc3QoY2hlY2tib3gpLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGNoZWNrYm94LnRyaWdnZXJIYW5kbGVyKCdjbGljaycpO1xyXG5cdFx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHQvLyDQv9C10YDQtdC60LvRjtGH0LXQvdC40LUg0L/QviBTcGFjZSDQuNC70LggRW50ZXJcclxuXHRcdFx0XHRcdGVsLm9uKCdjaGFuZ2Uuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGlmIChlbC5pcygnOmNoZWNrZWQnKSkgY2hlY2tib3guYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBjaGVja2JveC5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC8vINGH0YLQvtCx0Ysg0L/QtdGA0LXQutC70Y7Rh9Cw0LvRgdGPINGH0LXQutCx0L7QutGBLCDQutC+0YLQvtGA0YvQuSDQvdCw0YXQvtC00LjRgtGB0Y8g0LIg0YLQtdCz0LUgbGFiZWxcclxuXHRcdFx0XHRcdC5vbigna2V5ZG93bi5zdHlsZXInLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDMyKSBjaGVja2JveC5jbGljaygpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdGlmICghY2hlY2tib3guaXMoJy5kaXNhYmxlZCcpKSBjaGVja2JveC5hZGRDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0Y2hlY2tib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHR9OyAvLyBlbmQgY2hlY2tib3hPdXRwdXQoKVxyXG5cclxuXHRcdFx0XHRjaGVja2JveE91dHB1dCgpO1xyXG5cclxuXHRcdFx0XHQvLyDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9GA0Lgg0LTQuNC90LDQvNC40YfQtdGB0LrQvtC8INC40LfQvNC10L3QtdC90LjQuFxyXG5cdFx0XHRcdGVsLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRlbC5jbG9zZXN0KCdsYWJlbCcpLmFkZCgnbGFiZWxbZm9yPVwiJyArIGVsLmF0dHIoJ2lkJykgKyAnXCJdJykub2ZmKCcuc3R5bGVyJyk7XHJcblx0XHRcdFx0XHRlbC5vZmYoJy5zdHlsZXInKS5wYXJlbnQoKS5iZWZvcmUoZWwpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0Y2hlY2tib3hPdXRwdXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIGVuZCBjaGVja2JveFxyXG5cclxuXHRcdFx0Ly8gcmFkaW9cclxuXHRcdFx0fSBlbHNlIGlmIChlbC5pcygnOnJhZGlvJykpIHtcclxuXHJcblx0XHRcdFx0dmFyIHJhZGlvT3V0cHV0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHR2YXIgcmFkaW8gPSAkKCc8ZGl2IGNsYXNzPVwianEtcmFkaW9cIj48ZGl2IGNsYXNzPVwianEtcmFkaW9fX2RpdlwiPjwvZGl2PjwvZGl2PicpXHJcblx0XHRcdFx0XHRcdC5hdHRyKHtcclxuXHRcdFx0XHRcdFx0XHRpZDogYXR0LmlkLFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBhdHQudGl0bGVcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKGF0dC5jbGFzc2VzKVxyXG5cdFx0XHRcdFx0XHQuZGF0YShhdHQuZGF0YSlcclxuXHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRlbC5hZnRlcihyYWRpbykucHJlcGVuZFRvKHJhZGlvKTtcclxuXHRcdFx0XHRcdGlmIChlbC5pcygnOmNoZWNrZWQnKSkgcmFkaW8uYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdGlmIChlbC5pcygnOmRpc2FibGVkJykpIHJhZGlvLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0XHRcdC8vINC+0L/RgNC10LTQtdC70Y/QtdC8INC+0LHRidC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGDINGA0LDQtNC40L7QutC90L7Qv9C+0Log0YEg0L7QtNC40L3QsNC60L7QstGL0LwgbmFtZVxyXG5cdFx0XHRcdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjc3MzM4NDdcclxuXHRcdFx0XHRcdCQuZm4uY29tbW9uUGFyZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgY2FjaGVkVGhpcyA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdHJldHVybiBjYWNoZWRUaGlzLmZpcnN0KCkucGFyZW50cygpLmZpbHRlcihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gJCh0aGlzKS5maW5kKGNhY2hlZFRoaXMpLmxlbmd0aCA9PT0gY2FjaGVkVGhpcy5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdCQuZm4uY29tbW9uUGFyZW50ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiAkKHRoaXMpLmNvbW1vblBhcmVudHMoKS5maXJzdCgpO1xyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0XHQvLyDQutC70LjQuiDQvdCwINC/0YHQtdCy0LTQvtGA0LDQtNC40L7QutC90L7Qv9C60LVcclxuXHRcdFx0XHRcdHJhZGlvLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRlbC50cmlnZ2VySGFuZGxlcignY2xpY2snKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFyYWRpby5pcygnLmRpc2FibGVkJykpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgaW5wdXROYW1lID0gJCgnaW5wdXRbbmFtZT1cIicgKyBlbC5hdHRyKCduYW1lJykgKyAnXCJdJyk7XHJcblx0XHRcdFx0XHRcdFx0aW5wdXROYW1lLmNvbW1vblBhcmVudCgpLmZpbmQoaW5wdXROYW1lKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0ZWwucHJvcCgnY2hlY2tlZCcsIHRydWUpLnBhcmVudCgpLmFkZENsYXNzKCdjaGVja2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0ZWwuZm9jdXMoKS5jaGFuZ2UoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHQvLyDQutC70LjQuiDQvdCwIGxhYmVsXHJcblx0XHRcdFx0XHRlbC5jbG9zZXN0KCdsYWJlbCcpLmFkZCgnbGFiZWxbZm9yPVwiJyArIGVsLmF0dHIoJ2lkJykgKyAnXCJdJykub24oJ2NsaWNrLnN0eWxlcicsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCEkKGUudGFyZ2V0KS5pcygnYScpICYmICEkKGUudGFyZ2V0KS5jbG9zZXN0KHJhZGlvKS5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRyYWRpby50cmlnZ2VySGFuZGxlcignY2xpY2snKTtcclxuXHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0Ly8g0L/QtdGA0LXQutC70Y7Rh9C10L3QuNC1INGB0YLRgNC10LvQutCw0LzQuFxyXG5cdFx0XHRcdFx0ZWwub24oJ2NoYW5nZS5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0ZWwucGFyZW50KCkuYWRkQ2xhc3MoJ2NoZWNrZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2ZvY3VzLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXJhZGlvLmlzKCcuZGlzYWJsZWQnKSkgcmFkaW8uYWRkQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2JsdXIuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJhZGlvLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0fTsgLy8gZW5kIHJhZGlvT3V0cHV0KClcclxuXHJcblx0XHRcdFx0cmFkaW9PdXRwdXQoKTtcclxuXHJcblx0XHRcdFx0Ly8g0L7QsdC90L7QstC70LXQvdC40LUg0L/RgNC4INC00LjQvdCw0LzQuNGH0LXRgdC60L7QvCDQuNC30LzQtdC90LXQvdC40LhcclxuXHRcdFx0XHRlbC5vbigncmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0ZWwuY2xvc2VzdCgnbGFiZWwnKS5hZGQoJ2xhYmVsW2Zvcj1cIicgKyBlbC5hdHRyKCdpZCcpICsgJ1wiXScpLm9mZignLnN0eWxlcicpO1xyXG5cdFx0XHRcdFx0ZWwub2ZmKCcuc3R5bGVyJykucGFyZW50KCkuYmVmb3JlKGVsKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdHJhZGlvT3V0cHV0KCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHQvLyBlbmQgcmFkaW9cclxuXHJcblx0XHRcdC8vIGZpbGVcclxuXHRcdFx0fSBlbHNlIGlmIChlbC5pcygnOmZpbGUnKSkge1xyXG5cclxuXHRcdFx0XHR2YXIgZmlsZU91dHB1dCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0XHRcdHZhciBhdHQgPSBuZXcgQXR0cmlidXRlcygpO1xyXG5cdFx0XHRcdFx0dmFyIHBsYWNlaG9sZGVyID0gZWwuZGF0YSgncGxhY2Vob2xkZXInKTtcclxuXHRcdFx0XHRcdGlmIChwbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBwbGFjZWhvbGRlciA9IG9wdC5maWxlUGxhY2Vob2xkZXI7XHJcblx0XHRcdFx0XHR2YXIgYnJvd3NlID0gZWwuZGF0YSgnYnJvd3NlJyk7XHJcblx0XHRcdFx0XHRpZiAoYnJvd3NlID09PSB1bmRlZmluZWQgfHwgYnJvd3NlID09PSAnJykgYnJvd3NlID0gb3B0LmZpbGVCcm93c2U7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGZpbGUgPVxyXG5cdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianEtZmlsZVwiPicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1maWxlX19uYW1lXCI+JyArIHBsYWNlaG9sZGVyICsgJzwvZGl2PicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1maWxlX19icm93c2VcIj4nICsgYnJvd3NlICsgJzwvZGl2PicgK1xyXG5cdFx0XHRcdFx0XHRcdCc8L2Rpdj4nKVxyXG5cdFx0XHRcdFx0XHQuYXR0cih7XHJcblx0XHRcdFx0XHRcdFx0aWQ6IGF0dC5pZCxcclxuXHRcdFx0XHRcdFx0XHR0aXRsZTogYXR0LnRpdGxlXHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5hZGRDbGFzcyhhdHQuY2xhc3NlcylcclxuXHRcdFx0XHRcdFx0LmRhdGEoYXR0LmRhdGEpXHJcblx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0ZWwuYWZ0ZXIoZmlsZSkuYXBwZW5kVG8oZmlsZSk7XHJcblx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSBmaWxlLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0XHRcdHZhciB2YWx1ZSA9IGVsLnZhbCgpO1xyXG5cdFx0XHRcdFx0dmFyIG5hbWUgPSAkKCdkaXYuanEtZmlsZV9fbmFtZScsIGZpbGUpO1xyXG5cclxuXHRcdFx0XHRcdC8vINGH0YLQvtCx0Ysg0L/RgNC4INC00LjQvdCw0LzQuNGH0LXRgdC60L7QvCDQuNC30LzQtdC90LXQvdC40Lgg0LjQvNGPINGE0LDQudC70LAg0L3QtSDRgdCx0YDQsNGB0YvQstCw0LvQvtGB0YxcclxuXHRcdFx0XHRcdGlmICh2YWx1ZSkgbmFtZS50ZXh0KHZhbHVlLnJlcGxhY2UoLy4rW1xcXFxcXC9dLywgJycpKTtcclxuXHJcblx0XHRcdFx0XHRlbC5vbignY2hhbmdlLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHR2YXIgdmFsdWUgPSBlbC52YWwoKTtcclxuXHRcdFx0XHRcdFx0aWYgKGVsLmlzKCdbbXVsdGlwbGVdJykpIHtcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBmaWxlcyA9IGVsWzBdLmZpbGVzLmxlbmd0aDtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZmlsZXMgPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgbnVtYmVyID0gZWwuZGF0YSgnbnVtYmVyJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAobnVtYmVyID09PSB1bmRlZmluZWQpIG51bWJlciA9IG9wdC5maWxlTnVtYmVyO1xyXG5cdFx0XHRcdFx0XHRcdFx0bnVtYmVyID0gbnVtYmVyLnJlcGxhY2UoJyVzJywgZmlsZXMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSBudW1iZXI7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdG5hbWUudGV4dCh2YWx1ZS5yZXBsYWNlKC8uK1tcXFxcXFwvXS8sICcnKSk7XHJcblx0XHRcdFx0XHRcdGlmICh2YWx1ZSA9PT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRuYW1lLnRleHQocGxhY2Vob2xkZXIpO1xyXG5cdFx0XHRcdFx0XHRcdGZpbGUucmVtb3ZlQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRmaWxlLmFkZENsYXNzKCdjaGFuZ2VkJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQub24oJ2ZvY3VzLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRmaWxlLmFkZENsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0Lm9uKCdibHVyLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRmaWxlLnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0Lm9uKCdjbGljay5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0ZmlsZS5yZW1vdmVDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdH07IC8vIGVuZCBmaWxlT3V0cHV0KClcclxuXHJcblx0XHRcdFx0ZmlsZU91dHB1dCgpO1xyXG5cclxuXHRcdFx0XHQvLyDQvtCx0L3QvtCy0LvQtdC90LjQtSDQv9GA0Lgg0LTQuNC90LDQvNC40YfQtdGB0LrQvtC8INC40LfQvNC10L3QtdC90LjQuFxyXG5cdFx0XHRcdGVsLm9uKCdyZWZyZXNoJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRlbC5vZmYoJy5zdHlsZXInKS5wYXJlbnQoKS5iZWZvcmUoZWwpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0ZmlsZU91dHB1dCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gZW5kIGZpbGVcclxuXHJcblx0XHRcdH0gZWxzZSBpZiAoZWwuaXMoJ2lucHV0W3R5cGU9XCJudW1iZXJcIl0nKSkge1xyXG5cclxuXHRcdFx0XHR2YXIgbnVtYmVyT3V0cHV0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHR2YXIgbnVtYmVyID1cclxuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpxLW51bWJlclwiPicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1udW1iZXJfX3NwaW4gbWludXNcIj48L2Rpdj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianEtbnVtYmVyX19zcGluIHBsdXNcIj48L2Rpdj4nICtcclxuXHRcdFx0XHRcdFx0XHQnPC9kaXY+JylcclxuXHRcdFx0XHRcdFx0LmF0dHIoe1xyXG5cdFx0XHRcdFx0XHRcdGlkOiBhdHQuaWQsXHJcblx0XHRcdFx0XHRcdFx0dGl0bGU6IGF0dC50aXRsZVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQuYWRkQ2xhc3MoYXR0LmNsYXNzZXMpXHJcblx0XHRcdFx0XHRcdC5kYXRhKGF0dC5kYXRhKVxyXG5cdFx0XHRcdFx0O1xyXG5cclxuXHRcdFx0XHRcdGVsLmFmdGVyKG51bWJlcikucHJlcGVuZFRvKG51bWJlcikud3JhcCgnPGRpdiBjbGFzcz1cImpxLW51bWJlcl9fZmllbGRcIj48L2Rpdj4nKTtcclxuXHRcdFx0XHRcdGlmIChlbC5pcygnOmRpc2FibGVkJykpIG51bWJlci5hZGRDbGFzcygnZGlzYWJsZWQnKTtcclxuXHJcblx0XHRcdFx0XHR2YXIgbWluLFxyXG5cdFx0XHRcdFx0XHRcdG1heCxcclxuXHRcdFx0XHRcdFx0XHRzdGVwLFxyXG5cdFx0XHRcdFx0XHRcdHRpbWVvdXQgPSBudWxsLFxyXG5cdFx0XHRcdFx0XHRcdGludGVydmFsID0gbnVsbDtcclxuXHRcdFx0XHRcdGlmIChlbC5hdHRyKCdtaW4nKSAhPT0gdW5kZWZpbmVkKSBtaW4gPSBlbC5hdHRyKCdtaW4nKTtcclxuXHRcdFx0XHRcdGlmIChlbC5hdHRyKCdtYXgnKSAhPT0gdW5kZWZpbmVkKSBtYXggPSBlbC5hdHRyKCdtYXgnKTtcclxuXHRcdFx0XHRcdGlmIChlbC5hdHRyKCdzdGVwJykgIT09IHVuZGVmaW5lZCAmJiAkLmlzTnVtZXJpYyhlbC5hdHRyKCdzdGVwJykpKVxyXG5cdFx0XHRcdFx0XHRzdGVwID0gTnVtYmVyKGVsLmF0dHIoJ3N0ZXAnKSk7XHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdHN0ZXAgPSBOdW1iZXIoMSk7XHJcblxyXG5cdFx0XHRcdFx0dmFyIGNoYW5nZVZhbHVlID0gZnVuY3Rpb24oc3Bpbikge1xyXG5cdFx0XHRcdFx0XHR2YXIgdmFsdWUgPSBlbC52YWwoKSxcclxuXHRcdFx0XHRcdFx0XHRcdG5ld1ZhbHVlO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCEkLmlzTnVtZXJpYyh2YWx1ZSkpIHtcclxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IDA7XHJcblx0XHRcdFx0XHRcdFx0ZWwudmFsKCcwJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChzcGluLmlzKCcubWludXMnKSkge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1ZhbHVlID0gTnVtYmVyKHZhbHVlKSAtIHN0ZXA7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoc3Bpbi5pcygnLnBsdXMnKSkge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1ZhbHVlID0gTnVtYmVyKHZhbHVlKSArIHN0ZXA7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vINC+0L/RgNC10LTQtdC70Y/QtdC8INC60L7Qu9C40YfQtdGB0YLQstC+INC00LXRgdGP0YLQuNGH0L3Ri9GFINC30L3QsNC60L7QsiDQv9C+0YHQu9C1INC30LDQv9GP0YLQvtC5INCyIHN0ZXBcclxuXHRcdFx0XHRcdFx0dmFyIGRlY2ltYWxzID0gKHN0ZXAudG9TdHJpbmcoKS5zcGxpdCgnLicpWzFdIHx8IFtdKS5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdGlmIChkZWNpbWFscyA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbXVsdGlwbGllciA9ICcxJztcclxuXHRcdFx0XHRcdFx0XHR3aGlsZSAobXVsdGlwbGllci5sZW5ndGggPD0gZGVjaW1hbHMpIG11bHRpcGxpZXIgPSBtdWx0aXBsaWVyICsgJzAnO1xyXG5cdFx0XHRcdFx0XHRcdC8vINC40LfQsdC10LPQsNC10Lwg0L/QvtGP0LLQu9C10L3QuNGPINC70LjRiNC90LjRhSDQt9C90LDQutC+0LIg0L/QvtGB0LvQtSDQt9Cw0L/Rj9GC0L7QuVxyXG5cdFx0XHRcdFx0XHRcdG5ld1ZhbHVlID0gTWF0aC5yb3VuZChuZXdWYWx1ZSAqIG11bHRpcGxpZXIpIC8gbXVsdGlwbGllcjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCQuaXNOdW1lcmljKG1pbikgJiYgJC5pc051bWVyaWMobWF4KSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChuZXdWYWx1ZSA+PSBtaW4gJiYgbmV3VmFsdWUgPD0gbWF4KSBlbC52YWwobmV3VmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCQuaXNOdW1lcmljKG1pbikgJiYgISQuaXNOdW1lcmljKG1heCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPj0gbWluKSBlbC52YWwobmV3VmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCEkLmlzTnVtZXJpYyhtaW4pICYmICQuaXNOdW1lcmljKG1heCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAobmV3VmFsdWUgPD0gbWF4KSBlbC52YWwobmV3VmFsdWUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGVsLnZhbChuZXdWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0aWYgKCFudW1iZXIuaXMoJy5kaXNhYmxlZCcpKSB7XHJcblx0XHRcdFx0XHRcdG51bWJlci5vbignbW91c2Vkb3duJywgJ2Rpdi5qcS1udW1iZXJfX3NwaW4nLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc3BpbiA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHRcdFx0Y2hhbmdlVmFsdWUoc3Bpbik7XHJcblx0XHRcdFx0XHRcdFx0dGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdFx0XHRcdGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXsgY2hhbmdlVmFsdWUoc3Bpbik7IH0sIDQwKTtcclxuXHRcdFx0XHRcdFx0XHR9LCAzNTApO1xyXG5cdFx0XHRcdFx0XHR9KS5vbignbW91c2V1cCBtb3VzZW91dCcsICdkaXYuanEtbnVtYmVyX19zcGluJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG5cdFx0XHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG5cdFx0XHRcdFx0XHR9KS5vbignbW91c2V1cCcsICdkaXYuanEtbnVtYmVyX19zcGluJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0ZWwuY2hhbmdlKCk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRlbC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0bnVtYmVyLmFkZENsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRudW1iZXIucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdH07IC8vIGVuZCBudW1iZXJPdXRwdXQoKVxyXG5cclxuXHRcdFx0XHRudW1iZXJPdXRwdXQoKTtcclxuXHJcblx0XHRcdFx0Ly8g0L7QsdC90L7QstC70LXQvdC40LUg0L/RgNC4INC00LjQvdCw0LzQuNGH0LXRgdC60L7QvCDQuNC30LzQtdC90LXQvdC40LhcclxuXHRcdFx0XHRlbC5vbigncmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0ZWwub2ZmKCcuc3R5bGVyJykuY2xvc2VzdCgnLmpxLW51bWJlcicpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRudW1iZXJPdXRwdXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIGVuZCBudW1iZXJcclxuXHJcblx0XHRcdC8vIHNlbGVjdFxyXG5cdFx0XHR9IGVsc2UgaWYgKGVsLmlzKCdzZWxlY3QnKSkge1xyXG5cclxuXHRcdFx0XHR2YXIgc2VsZWN0Ym94T3V0cHV0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0Ly8g0LfQsNC/0YDQtdGJ0LDQtdC8INC/0YDQvtC60YDRg9GC0LrRgyDRgdGC0YDQsNC90LjRhtGLINC/0YDQuCDQv9GA0L7QutGA0YPRgtC60LUg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdGZ1bmN0aW9uIHByZXZlbnRTY3JvbGxpbmcoc2VsZWN0b3IpIHtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBzY3JvbGxEaWZmID0gc2VsZWN0b3IucHJvcCgnc2Nyb2xsSGVpZ2h0JykgLSBzZWxlY3Rvci5vdXRlckhlaWdodCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0d2hlZWxEZWx0YSA9IG51bGwsXHJcblx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUb3AgPSBudWxsO1xyXG5cclxuXHRcdFx0XHRcdFx0c2VsZWN0b3Iub2ZmKCdtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsJykub24oJ21vdXNld2hlZWwgRE9NTW91c2VTY3JvbGwnLCBmdW5jdGlvbihlKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8qKlxyXG5cdFx0XHRcdFx0XHRcdCAqINC90L7RgNC80LDQu9C40LfQsNGG0LjRjyDQvdCw0L/RgNCw0LLQu9C10L3QuNGPINC/0YDQvtC60YDRg9GC0LrQuFxyXG5cdFx0XHRcdFx0XHRcdCAqIChmaXJlZm94IDwgMCB8fCBjaHJvbWUgZXRjLi4uID4gMClcclxuXHRcdFx0XHRcdFx0XHQgKiAoZS5vcmlnaW5hbEV2ZW50LmRldGFpbCA8IDAgfHwgZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPiAwKVxyXG5cdFx0XHRcdFx0XHRcdCAqL1xyXG5cdFx0XHRcdFx0XHRcdHdoZWVsRGVsdGEgPSAoZS5vcmlnaW5hbEV2ZW50LmRldGFpbCA8IDAgfHwgZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgPiAwKSA/IDEgOiAtMTsgLy8g0L3QsNC/0YDQsNCy0LvQtdC90LjQtSDQv9GA0L7QutGA0YPRgtC60LggKC0xINCy0L3QuNC3LCAxINCy0LLQtdGA0YUpXHJcblx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9wID0gc2VsZWN0b3Iuc2Nyb2xsVG9wKCk7IC8vINC/0L7Qt9C40YbQuNGPINGB0LrRgNC+0LvQu9CwXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICgoc2Nyb2xsVG9wID49IHNjcm9sbERpZmYgJiYgd2hlZWxEZWx0YSA8IDApIHx8IChzY3JvbGxUb3AgPD0gMCAmJiB3aGVlbERlbHRhID4gMCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmFyIG9wdGlvbiA9ICQoJ29wdGlvbicsIGVsKTtcclxuXHRcdFx0XHRcdHZhciBsaXN0ID0gJyc7XHJcblx0XHRcdFx0XHQvLyDRhNC+0YDQvNC40YDRg9C10Lwg0YHQv9C40YHQvtC6INGB0LXQu9C10LrRgtCwXHJcblx0XHRcdFx0XHRmdW5jdGlvbiBtYWtlTGlzdCgpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb24ubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgb3AgPSBvcHRpb24uZXEoaSk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGxpID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGxpQ2xhc3MgPSAnJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGlDbGFzc2VzID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlkID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGFMaXN0ID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdGlvbkNsYXNzID0gJycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdGdyb3VwQ2xhc3MgPSAnJyxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUpxZnNDbGFzcyA9ICcnO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBkaXNhYmxlZCA9ICdkaXNhYmxlZCc7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHNlbERpcyA9ICdzZWxlY3RlZCBzZWwgZGlzYWJsZWQnO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5wcm9wKCdzZWxlY3RlZCcpKSBsaUNsYXNzID0gJ3NlbGVjdGVkIHNlbCc7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmlzKCc6ZGlzYWJsZWQnKSkgbGlDbGFzcyA9IGRpc2FibGVkO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5pcygnOnNlbGVjdGVkOmRpc2FibGVkJykpIGxpQ2xhc3MgPSBzZWxEaXM7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmF0dHIoJ2lkJykgIT09IHVuZGVmaW5lZCAmJiBvcC5hdHRyKCdpZCcpICE9PSAnJykgaWQgPSAnIGlkPVwiJyArIG9wLmF0dHIoJ2lkJykgKyBvcHQuaWRTdWZmaXggKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvcC5hdHRyKCd0aXRsZScpICE9PSB1bmRlZmluZWQgJiYgb3B0aW9uLmF0dHIoJ3RpdGxlJykgIT09ICcnKSB0aXRsZSA9ICcgdGl0bGU9XCInICsgb3AuYXR0cigndGl0bGUnKSArICdcIic7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLmF0dHIoJ2NsYXNzJykgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uQ2xhc3MgPSAnICcgKyBvcC5hdHRyKCdjbGFzcycpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUpxZnNDbGFzcyA9ICcgZGF0YS1qcWZzLWNsYXNzPVwiJyArIG9wLmF0dHIoJ2NsYXNzJykgKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0dmFyIGRhdGEgPSBvcC5kYXRhKCk7XHJcblx0XHRcdFx0XHRcdFx0Zm9yICh2YXIgayBpbiBkYXRhKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZGF0YVtrXSAhPT0gJycpIGRhdGFMaXN0ICs9ICcgZGF0YS0nICsgayArICc9XCInICsgZGF0YVtrXSArICdcIic7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIChsaUNsYXNzICsgb3B0aW9uQ2xhc3MpICE9PSAnJyApICAgbGlDbGFzc2VzID0gJyBjbGFzcz1cIicgKyBsaUNsYXNzICsgb3B0aW9uQ2xhc3MgKyAnXCInO1xyXG5cdFx0XHRcdFx0XHRcdGxpID0gJzxsaScgKyBkYXRhSnFmc0NsYXNzICsgZGF0YUxpc3QgKyBsaUNsYXNzZXMgKyB0aXRsZSArIGlkICsgJz4nKyBvcC5odG1sKCkgKyc8L2xpPic7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC10YHQu9C4INC10YHRgtGMIG9wdGdyb3VwXHJcblx0XHRcdFx0XHRcdFx0aWYgKG9wLnBhcmVudCgpLmlzKCdvcHRncm91cCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAob3AucGFyZW50KCkuYXR0cignY2xhc3MnKSAhPT0gdW5kZWZpbmVkKSBvcHRncm91cENsYXNzID0gJyAnICsgb3AucGFyZW50KCkuYXR0cignY2xhc3MnKTtcclxuXHRcdFx0XHRcdFx0XHRcdGxpID0gJzxsaScgKyBkYXRhSnFmc0NsYXNzICsgZGF0YUxpc3QgKyAnIGNsYXNzPVwiJyArIGxpQ2xhc3MgKyBvcHRpb25DbGFzcyArICcgb3B0aW9uJyArIG9wdGdyb3VwQ2xhc3MgKyAnXCInICsgdGl0bGUgKyBpZCArICc+Jysgb3AuaHRtbCgpICsnPC9saT4nO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9wLmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRsaSA9ICc8bGkgY2xhc3M9XCJvcHRncm91cCcgKyBvcHRncm91cENsYXNzICsgJ1wiPicgKyBvcC5wYXJlbnQoKS5hdHRyKCdsYWJlbCcpICsgJzwvbGk+JyArIGxpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGlzdCArPSBsaTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSAvLyBlbmQgbWFrZUxpc3QoKVxyXG5cclxuXHRcdFx0XHRcdC8vINC+0LTQuNC90L7Rh9C90YvQuSDRgdC10LvQtdC60YJcclxuXHRcdFx0XHRcdGZ1bmN0aW9uIGRvU2VsZWN0KCkge1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIGF0dCA9IG5ldyBBdHRyaWJ1dGVzKCk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWFyY2hIVE1MID0gJyc7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RQbGFjZWhvbGRlciA9IGVsLmRhdGEoJ3BsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTZWFyY2ggPSBlbC5kYXRhKCdzZWFyY2gnKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdFNlYXJjaExpbWl0ID0gZWwuZGF0YSgnc2VhcmNoLWxpbWl0Jyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTZWFyY2hOb3RGb3VuZCA9IGVsLmRhdGEoJ3NlYXJjaC1ub3QtZm91bmQnKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdFNlYXJjaFBsYWNlaG9sZGVyID0gZWwuZGF0YSgnc2VhcmNoLXBsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdHZhciBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID0gZWwuZGF0YSgnc21hcnQtcG9zaXRpb25pbmcnKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RQbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBzZWxlY3RQbGFjZWhvbGRlciA9IG9wdC5zZWxlY3RQbGFjZWhvbGRlcjtcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdFNlYXJjaCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaCA9PT0gJycpIHNlbGVjdFNlYXJjaCA9IG9wdC5zZWxlY3RTZWFyY2g7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hMaW1pdCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaExpbWl0ID09PSAnJykgc2VsZWN0U2VhcmNoTGltaXQgPSBvcHQuc2VsZWN0U2VhcmNoTGltaXQ7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hOb3RGb3VuZCA9PT0gdW5kZWZpbmVkIHx8IHNlbGVjdFNlYXJjaE5vdEZvdW5kID09PSAnJykgc2VsZWN0U2VhcmNoTm90Rm91bmQgPSBvcHQuc2VsZWN0U2VhcmNoTm90Rm91bmQ7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxlY3RTZWFyY2hQbGFjZWhvbGRlciA9PT0gdW5kZWZpbmVkKSBzZWxlY3RTZWFyY2hQbGFjZWhvbGRlciA9IG9wdC5zZWxlY3RTZWFyY2hQbGFjZWhvbGRlcjtcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGVjdFNtYXJ0UG9zaXRpb25pbmcgPT09IHVuZGVmaW5lZCB8fCBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSAnJykgc2VsZWN0U21hcnRQb3NpdGlvbmluZyA9IG9wdC5zZWxlY3RTbWFydFBvc2l0aW9uaW5nO1xyXG5cclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGJveCA9XHJcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveCBqcXNlbGVjdFwiPicgK1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveF9fc2VsZWN0XCI+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3NlbGVjdC10ZXh0XCI+PC9kaXY+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJqcS1zZWxlY3Rib3hfX3RyaWdnZXJcIj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwianEtc2VsZWN0Ym94X190cmlnZ2VyLWFycm93XCI+PC9kaXY+PC9kaXY+JyArXHJcblx0XHRcdFx0XHRcdFx0XHRcdCc8L2Rpdj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdCc8L2Rpdj4nKVxyXG5cdFx0XHRcdFx0XHRcdC5hdHRyKHtcclxuXHRcdFx0XHRcdFx0XHRcdGlkOiBhdHQuaWQsXHJcblx0XHRcdFx0XHRcdFx0XHR0aXRsZTogYXR0LnRpdGxlXHJcblx0XHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0XHQuYWRkQ2xhc3MoYXR0LmNsYXNzZXMpXHJcblx0XHRcdFx0XHRcdFx0LmRhdGEoYXR0LmRhdGEpXHJcblx0XHRcdFx0XHRcdDtcclxuXHJcblx0XHRcdFx0XHRcdGVsLmFmdGVyKHNlbGVjdGJveCkucHJlcGVuZFRvKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdFx0XHR2YXIgc2VsZWN0ekluZGV4ID0gc2VsZWN0Ym94LmNzcygnei1pbmRleCcpO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3R6SW5kZXggPSAoc2VsZWN0ekluZGV4ID4gMCApID8gc2VsZWN0ekluZGV4IDogMTtcclxuXHRcdFx0XHRcdFx0dmFyIGRpdlNlbGVjdCA9ICQoJ2Rpdi5qcS1zZWxlY3Rib3hfX3NlbGVjdCcsIHNlbGVjdGJveCk7XHJcblx0XHRcdFx0XHRcdHZhciBkaXZUZXh0ID0gJCgnZGl2LmpxLXNlbGVjdGJveF9fc2VsZWN0LXRleHQnLCBzZWxlY3Rib3gpO1xyXG5cdFx0XHRcdFx0XHR2YXIgb3B0aW9uU2VsZWN0ZWQgPSBvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKTtcclxuXHJcblx0XHRcdFx0XHRcdG1ha2VMaXN0KCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoc2VsZWN0U2VhcmNoKSBzZWFyY2hIVE1MID1cclxuXHRcdFx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveF9fc2VhcmNoXCI+PGlucHV0IHR5cGU9XCJzZWFyY2hcIiBhdXRvY29tcGxldGU9XCJvZmZcIiBwbGFjZWhvbGRlcj1cIicgKyBzZWxlY3RTZWFyY2hQbGFjZWhvbGRlciArICdcIj48L2Rpdj4nICtcclxuXHRcdFx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveF9fbm90LWZvdW5kXCI+JyArIHNlbGVjdFNlYXJjaE5vdEZvdW5kICsgJzwvZGl2Pic7XHJcblx0XHRcdFx0XHRcdHZhciBkcm9wZG93biA9XHJcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpxLXNlbGVjdGJveF9fZHJvcGRvd25cIj4nICtcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2VhcmNoSFRNTCArICc8dWw+JyArIGxpc3QgKyAnPC91bD4nICtcclxuXHRcdFx0XHRcdFx0XHRcdCc8L2Rpdj4nKTtcclxuXHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFwcGVuZChkcm9wZG93bik7XHJcblx0XHRcdFx0XHRcdHZhciB1bCA9ICQoJ3VsJywgZHJvcGRvd24pO1xyXG5cdFx0XHRcdFx0XHR2YXIgbGkgPSAkKCdsaScsIGRyb3Bkb3duKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlYXJjaCA9ICQoJ2lucHV0JywgZHJvcGRvd24pO1xyXG5cdFx0XHRcdFx0XHR2YXIgbm90Rm91bmQgPSAkKCdkaXYuanEtc2VsZWN0Ym94X19ub3QtZm91bmQnLCBkcm9wZG93bikuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGkubGVuZ3RoIDwgc2VsZWN0U2VhcmNoTGltaXQpIHNlYXJjaC5wYXJlbnQoKS5oaWRlKCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9C+0LrQsNC30YvQstCw0LXQvCDQvtC/0YbQuNGOINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGDIDEt0Lkg0L7Qv9GG0LjQuCDQvdC10YIg0YLQtdC60YHRgtCwLCDQvtC90LAg0LLRi9Cx0YDQsNC90LAg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0Lgg0L/QsNGA0LDQvNC10YLRgCBzZWxlY3RQbGFjZWhvbGRlciDQvdC1IGZhbHNlLCDRgtC+INC/0L7QutCw0LfRi9Cy0LDQtdC8INC/0LvQtdC50YHRhdC+0LvQtNC10YBcclxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbi5maXJzdCgpLnRleHQoKSA9PT0gJycgJiYgb3B0aW9uLmZpcnN0KCkuaXMoJzpzZWxlY3RlZCcpICYmIHNlbGVjdFBsYWNlaG9sZGVyICE9PSBmYWxzZSkge1xyXG5cdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChzZWxlY3RQbGFjZWhvbGRlcikuYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0ZGl2VGV4dC50ZXh0KG9wdGlvblNlbGVjdGVkLnRleHQoKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vINC+0L/RgNC10LTQtdC70Y/QtdC8INGB0LDQvNGL0Lkg0YjQuNGA0L7QutC40Lkg0L/Rg9C90LrRgiDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHR2YXIgbGlXaWR0aElubmVyID0gMCxcclxuXHRcdFx0XHRcdFx0XHRcdGxpV2lkdGggPSAwO1xyXG5cdFx0XHRcdFx0XHRsaS5jc3MoeydkaXNwbGF5JzogJ2lubGluZS1ibG9jayd9KTtcclxuXHRcdFx0XHRcdFx0bGkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbCA9ICQodGhpcyk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGwuaW5uZXJXaWR0aCgpID4gbGlXaWR0aElubmVyKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsaVdpZHRoSW5uZXIgPSBsLmlubmVyV2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGxpV2lkdGggPSBsLndpZHRoKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0bGkuY3NzKHsnZGlzcGxheSc6ICcnfSk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9C+0LTRgdGC0YDQsNC40LLQsNC10Lwg0YjQuNGA0LjQvdGDINGB0LLQtdGA0L3Rg9GC0L7Qs9C+INGB0LXQu9C10LrRgtCwINCyINC30LDQstC40YHQuNC80L7RgdGC0LhcclxuXHRcdFx0XHRcdFx0Ly8g0L7RgiDRiNC40YDQuNC90Ysg0L/Qu9C10LnRgdGF0L7Qu9C00LXRgNCwINC40LvQuCDRgdCw0LzQvtCz0L4g0YjQuNGA0L7QutC+0LPQviDQv9GD0L3QutGC0LBcclxuXHRcdFx0XHRcdFx0aWYgKGRpdlRleHQuaXMoJy5wbGFjZWhvbGRlcicpICYmIChkaXZUZXh0LndpZHRoKCkgPiBsaVdpZHRoSW5uZXIpKSB7XHJcblx0XHRcdFx0XHRcdFx0ZGl2VGV4dC53aWR0aChkaXZUZXh0LndpZHRoKCkpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBzZWxDbG9uZSA9IHNlbGVjdGJveC5jbG9uZSgpLmFwcGVuZFRvKCdib2R5Jykud2lkdGgoJ2F1dG8nKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc2VsQ2xvbmVXaWR0aCA9IHNlbENsb25lLm91dGVyV2lkdGgoKTtcclxuXHRcdFx0XHRcdFx0XHRzZWxDbG9uZS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsQ2xvbmVXaWR0aCA9PSBzZWxlY3Rib3gub3V0ZXJXaWR0aCgpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRkaXZUZXh0LndpZHRoKGxpV2lkdGgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/QvtC00YHRgtGA0LDQuNCy0LDQtdC8INGI0LjRgNC40L3RgyDQstGL0L/QsNC00LDRjtGJ0LXQs9C+INGB0L/QuNGB0LrQsCDQsiDQt9Cw0LLQuNGB0LjQvNC+0YHRgtC4INC+0YIg0YHQsNC80L7Qs9C+INGI0LjRgNC+0LrQvtCz0L4g0L/Rg9C90LrRgtCwXHJcblx0XHRcdFx0XHRcdGlmIChsaVdpZHRoSW5uZXIgPiBzZWxlY3Rib3gud2lkdGgoKSkgZHJvcGRvd24ud2lkdGgobGlXaWR0aElubmVyKTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCAxLdGOINC/0YPRgdGC0YPRjiDQvtC/0YbQuNGOLCDQtdGB0LvQuCDQvtC90LAg0LXRgdGC0Ywg0Lgg0LXRgdC70Lgg0LDRgtGA0LjQsdGD0YIgZGF0YS1wbGFjZWhvbGRlciDQvdC1INC/0YPRgdGC0L7QuVxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGB0LUg0LbQtSDQvdGD0LbQvdC+LCDRh9GC0L7QsdGLINC/0LXRgNCy0LDRjyDQv9GD0YHRgtCw0Y8g0L7Qv9GG0LjRjyDQvtGC0L7QsdGA0LDQttCw0LvQsNGB0YwsINGC0L4g0YPQutCw0LfRi9Cy0LDQtdC8INGDINGB0LXQu9C10LrRgtCwOiBkYXRhLXBsYWNlaG9sZGVyPVwiXCJcclxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbi5maXJzdCgpLnRleHQoKSA9PT0gJycgJiYgZWwuZGF0YSgncGxhY2Vob2xkZXInKSAhPT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRsaS5maXJzdCgpLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdEhlaWdodCA9IHNlbGVjdGJveC5vdXRlckhlaWdodCh0cnVlKTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlYXJjaEhlaWdodCA9IHNlYXJjaC5wYXJlbnQoKS5vdXRlckhlaWdodCh0cnVlKSB8fCAwO1xyXG5cdFx0XHRcdFx0XHR2YXIgaXNNYXhIZWlnaHQgPSB1bC5jc3MoJ21heC1oZWlnaHQnKTtcclxuXHRcdFx0XHRcdFx0dmFyIGxpU2VsZWN0ZWQgPSBsaS5maWx0ZXIoJy5zZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGlTZWxlY3RlZC5sZW5ndGggPCAxKSBsaS5maXJzdCgpLmFkZENsYXNzKCdzZWxlY3RlZCBzZWwnKTtcclxuXHRcdFx0XHRcdFx0aWYgKGxpLmRhdGEoJ2xpLWhlaWdodCcpID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbGlPdXRlckhlaWdodCA9IGxpLm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdFBsYWNlaG9sZGVyICE9PSBmYWxzZSkgbGlPdXRlckhlaWdodCA9IGxpLmVxKDEpLm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdFx0bGkuZGF0YSgnbGktaGVpZ2h0JywgbGlPdXRlckhlaWdodCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gZHJvcGRvd24uY3NzKCd0b3AnKTtcclxuXHRcdFx0XHRcdFx0aWYgKGRyb3Bkb3duLmNzcygnbGVmdCcpID09ICdhdXRvJykgZHJvcGRvd24uY3NzKHtsZWZ0OiAwfSk7XHJcblx0XHRcdFx0XHRcdGlmIChkcm9wZG93bi5jc3MoJ3RvcCcpID09ICdhdXRvJykge1xyXG5cdFx0XHRcdFx0XHRcdGRyb3Bkb3duLmNzcyh7dG9wOiBzZWxlY3RIZWlnaHR9KTtcclxuXHRcdFx0XHRcdFx0XHRwb3NpdGlvbiA9IHNlbGVjdEhlaWdodDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRkcm9wZG93bi5oaWRlKCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGL0LHRgNCw0L0g0L3QtSDQtNC10YTQvtC70YLQvdGL0Lkg0L/Rg9C90LrRglxyXG5cdFx0XHRcdFx0XHRpZiAobGlTZWxlY3RlZC5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHQvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSwg0L/QvtC60LDQt9GL0LLQsNGO0YnQuNC5INC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgIT0gb3B0aW9uU2VsZWN0ZWQudGV4dCgpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rib3guYWRkQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQtNCw0LXQvCDRgdC10LvQtdC60YLRgyDQutC70LDRgdGBINCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0YPQvdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJywgbGlTZWxlY3RlZC5kYXRhKCdqcWZzLWNsYXNzJykpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcyhsaVNlbGVjdGVkLmRhdGEoJ2pxZnMtY2xhc3MnKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGB0LXQu9C10LrRgiDQvdC10LDQutGC0LjQstC90YvQuVxyXG5cdFx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC4INC60LvQuNC60LUg0L3QsCDQv9GB0LXQstC00L7RgdC10LvQtdC60YLQtVxyXG5cdFx0XHRcdFx0XHRkaXZTZWxlY3QuY2xpY2soZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmICgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRvcHQub25TZWxlY3RDbG9zZWQuY2FsbCgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0ZWwuZm9jdXMoKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8g0LXRgdC70LggaU9TLCDRgtC+INC90LUg0L/QvtC60LDQt9GL0LLQsNC10Lwg0LLRi9C/0LDQtNCw0Y7RidC40Lkg0YHQv9C40YHQvtC6LFxyXG5cdFx0XHRcdFx0XHRcdC8vINGCLtC6LiDQvtGC0L7QsdGA0LDQttCw0LXRgtGB0Y8g0L3QsNGC0LjQstC90YvQuSDQuCDQvdC10LjQt9Cy0LXRgdGC0L3Qviwg0LrQsNC6INC10LPQviDRgdC/0YDRj9GC0LDRgtGMXHJcblx0XHRcdFx0XHRcdFx0aWYgKGlPUykgcmV0dXJuO1xyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDRg9C80L3QvtC1INC/0L7Qt9C40YbQuNC+0L3QuNGA0L7QstCw0L3QuNC1XHJcblx0XHRcdFx0XHRcdFx0dmFyIHdpbiA9ICQod2luZG93KTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbGlIZWlnaHQgPSBsaS5kYXRhKCdsaS1oZWlnaHQnKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgdG9wT2Zmc2V0ID0gc2VsZWN0Ym94Lm9mZnNldCgpLnRvcDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgYm90dG9tT2Zmc2V0ID0gd2luLmhlaWdodCgpIC0gc2VsZWN0SGVpZ2h0IC0gKHRvcE9mZnNldCAtIHdpbi5zY3JvbGxUb3AoKSk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHZpc2libGUgPSBlbC5kYXRhKCd2aXNpYmxlLW9wdGlvbnMnKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA9PT0gdW5kZWZpbmVkIHx8IHZpc2libGUgPT09ICcnKSB2aXNpYmxlID0gb3B0LnNlbGVjdFZpc2libGVPcHRpb25zO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBtaW5IZWlnaHQgPSBsaUhlaWdodCAqIDU7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG5ld0hlaWdodCA9IGxpSGVpZ2h0ICogdmlzaWJsZTtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA+IDAgJiYgdmlzaWJsZSA8IDYpIG1pbkhlaWdodCA9IG5ld0hlaWdodDtcclxuXHRcdFx0XHRcdFx0XHRpZiAodmlzaWJsZSA9PT0gMCkgbmV3SGVpZ2h0ID0gJ2F1dG8nO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgZHJvcERvd24gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLmhlaWdodCgnYXV0bycpLmNzcyh7Ym90dG9tOiAnYXV0bycsIHRvcDogcG9zaXRpb259KTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXhIZWlnaHRCb3R0b20gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgTWF0aC5mbG9vcigoYm90dG9tT2Zmc2V0IC0gMjAgLSBzZWFyY2hIZWlnaHQpIC8gbGlIZWlnaHQpICogbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodEJvdHRvbSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgbmV3SGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChpc01heEhlaWdodCAhPSAnbm9uZScpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgaXNNYXhIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGJvdHRvbU9mZnNldCA8IChkcm9wZG93bi5vdXRlckhlaWdodCgpICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodEJvdHRvbSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdFx0XHRcdHZhciBkcm9wVXAgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLmhlaWdodCgnYXV0bycpLmNzcyh7dG9wOiAnYXV0bycsIGJvdHRvbTogcG9zaXRpb259KTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtYXhIZWlnaHRUb3AgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgTWF0aC5mbG9vcigodG9wT2Zmc2V0IC0gd2luLnNjcm9sbFRvcCgpIC0gMjAgLSBzZWFyY2hIZWlnaHQpIC8gbGlIZWlnaHQpICogbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodFRvcCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgbmV3SGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChpc01heEhlaWdodCAhPSAnbm9uZScpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuY3NzKCdtYXgtaGVpZ2h0JywgaXNNYXhIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCh0b3BPZmZzZXQgLSB3aW4uc2Nyb2xsVG9wKCkgLSAyMCkgPCAoZHJvcGRvd24ub3V0ZXJIZWlnaHQoKSArIDIwKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXhIZWlnaHRUb3AoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0U21hcnRQb3NpdGlvbmluZyA9PT0gdHJ1ZSB8fCBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQvdC40LdcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChib3R0b21PZmZzZXQgPiAobWluSGVpZ2h0ICsgc2VhcmNoSGVpZ2h0ICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGRyb3BEb3duKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcHVwJykuYWRkQ2xhc3MoJ2Ryb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQstC10YDRhVxyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZHJvcFVwKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcGRvd24nKS5hZGRDbGFzcygnZHJvcHVwJyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSBmYWxzZSB8fCBzZWxlY3RTbWFydFBvc2l0aW9uaW5nID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDRgNCw0YHQutGA0YvRgtC40LUg0LLQvdC40LdcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChib3R0b21PZmZzZXQgPiAobWluSGVpZ2h0ICsgc2VhcmNoSGVpZ2h0ICsgMjApKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGRyb3BEb3duKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnZHJvcHVwJykuYWRkQ2xhc3MoJ2Ryb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGD0LzQvdC+0LUg0L/QvtC30LjRhtC40L7QvdC40YDQvtCy0LDQvdC40LUg0L7RgtC60LvRjtGH0LXQvdC+XHJcblx0XHRcdFx0XHRcdFx0XHRkcm9wZG93bi5oZWlnaHQoJ2F1dG8nKS5jc3Moe2JvdHRvbTogJ2F1dG8nLCB0b3A6IHBvc2l0aW9ufSk7XHJcblx0XHRcdFx0XHRcdFx0XHR1bC5jc3MoJ21heC1oZWlnaHQnLCBuZXdIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGlzTWF4SGVpZ2h0ICE9ICdub25lJykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR1bC5jc3MoJ21heC1oZWlnaHQnLCBpc01heEhlaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQtdGB0LvQuCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0LLRi9GF0L7QtNC40YIg0LfQsCDQv9GA0LDQstGL0Lkg0LrRgNCw0Lkg0L7QutC90LAg0LHRgNCw0YPQt9C10YDQsCxcclxuXHRcdFx0XHRcdFx0XHQvLyDRgtC+INC80LXQvdGP0LXQvCDQv9C+0LfQuNGG0LjQvtC90LjRgNC+0LLQsNC90LjQtSDRgSDQu9C10LLQvtCz0L4g0L3QsCDQv9GA0LDQstC+0LVcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0Ym94Lm9mZnNldCgpLmxlZnQgKyBkcm9wZG93bi5vdXRlcldpZHRoKCkgPiB3aW4ud2lkdGgoKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uY3NzKHtsZWZ0OiAnYXV0bycsIHJpZ2h0OiAwfSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7QvdC10YYg0YPQvNC90L7Qs9C+INC/0L7Qt9C40YbQuNC+0L3QuNGA0L7QstCw0L3QuNGPXHJcblxyXG5cdFx0XHRcdFx0XHRcdCQoJ2Rpdi5qcXNlbGVjdCcpLmNzcyh7ekluZGV4OiAoc2VsZWN0ekluZGV4IC0gMSl9KS5yZW1vdmVDbGFzcygnb3BlbmVkJyk7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmNzcyh7ekluZGV4OiBzZWxlY3R6SW5kZXh9KTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZHJvcGRvd24uaXMoJzpoaWRkZW4nKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd246dmlzaWJsZScpLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duLnNob3coKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnb3BlbmVkIGZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdFx0b3B0Lm9uU2VsZWN0T3BlbmVkLmNhbGwoc2VsZWN0Ym94KTtcclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQutC+0LvQsdC10Log0L/RgNC4INC30LDQutGA0YvRgtC40Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdGlmICgkKCdkaXYuanEtc2VsZWN0Ym94JykuZmlsdGVyKCcub3BlbmVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQv9C+0LjRgdC60L7QstC+0LUg0L/QvtC70LVcclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VhcmNoLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VhcmNoLnZhbCgnJykua2V5dXAoKTtcclxuXHRcdFx0XHRcdFx0XHRcdG5vdEZvdW5kLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlYXJjaC5rZXl1cChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIHF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bGkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoISQodGhpcykuaHRtbCgpLm1hdGNoKG5ldyBSZWdFeHAoJy4qPycgKyBxdWVyeSArICcuKj8nLCAnaScpKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCQodGhpcykuc2hvdygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCAxLdGOINC/0YPRgdGC0YPRjiDQvtC/0YbQuNGOXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgPT09ICcnICYmIGVsLmRhdGEoJ3BsYWNlaG9sZGVyJykgIT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGkuZmlyc3QoKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGxpLmZpbHRlcignOnZpc2libGUnKS5sZW5ndGggPCAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bm90Rm91bmQuc2hvdygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5vdEZvdW5kLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyDQv9GA0L7QutGA0YPRh9C40LLQsNC10Lwg0LTQviDQstGL0LHRgNCw0L3QvdC+0LPQviDQv9GD0L3QutGC0LAg0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YHQv9C40YHQutCwXHJcblx0XHRcdFx0XHRcdFx0aWYgKGxpLmZpbHRlcignLnNlbGVjdGVkJykubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZWwudmFsKCkgPT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCgwKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINC10YHQu9C4INC90LXRh9C10YLQvdC+0LUg0LrQvtC70LjRh9C10YHRgtCy0L4g0LLQuNC00LjQvNGL0YUg0L/Rg9C90LrRgtC+0LIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vINGC0L4g0LLRi9GB0L7RgtGDINC/0YPQvdC60YLQsCDQtNC10LvQuNC8INC/0L7Qv9C+0LvQsNC8INC00LvRjyDQv9C+0YHQu9C10LTRg9GO0YnQtdCz0L4g0YDQsNGB0YfQtdGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCAodWwuaW5uZXJIZWlnaHQoKSAvIGxpSGVpZ2h0KSAlIDIgIT09IDAgKSBsaUhlaWdodCA9IGxpSGVpZ2h0IC8gMjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dWwuc2Nyb2xsVG9wKHVsLnNjcm9sbFRvcCgpICsgbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5wb3NpdGlvbigpLnRvcCAtIHVsLmlubmVySGVpZ2h0KCkgLyAyICsgbGlIZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0cHJldmVudFNjcm9sbGluZyh1bCk7XHJcblxyXG5cdFx0XHRcdFx0XHR9KTsgLy8gZW5kIGRpdlNlbGVjdC5jbGljaygpXHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9GA0Lgg0L3QsNCy0LXQtNC10L3QuNC4INC60YPRgNGB0L7RgNCwINC90LAg0L/Rg9C90LrRgiDRgdC/0LjRgdC60LBcclxuXHRcdFx0XHRcdFx0bGkuaG92ZXIoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0JCh0aGlzKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGVkVGV4dCA9IGxpLmZpbHRlcignLnNlbGVjdGVkJykudGV4dCgpO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC4INC60LvQuNC60LUg0L3QsCDQv9GD0L3QutGCINGB0L/QuNGB0LrQsFxyXG5cdFx0XHRcdFx0XHRsaS5maWx0ZXIoJzpub3QoLmRpc2FibGVkKTpub3QoLm9wdGdyb3VwKScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGVsLmZvY3VzKCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBsaVRleHQgPSB0LnRleHQoKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIXQuaXMoJy5zZWxlY3RlZCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgaW5kZXggPSB0LmluZGV4KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRpbmRleCAtPSB0LnByZXZBbGwoJy5vcHRncm91cCcpLmxlbmd0aDtcclxuXHRcdFx0XHRcdFx0XHRcdHQuYWRkQ2xhc3MoJ3NlbGVjdGVkIHNlbCcpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkIHNlbCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uLnByb3AoJ3NlbGVjdGVkJywgZmFsc2UpLmVxKGluZGV4KS5wcm9wKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRUZXh0ID0gbGlUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGl2VGV4dC50ZXh0KGxpVGV4dCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly8g0L/QtdGA0LXQtNCw0LXQvCDRgdC10LvQtdC60YLRgyDQutC70LDRgdGBINCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0YPQvdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJykpIHNlbGVjdGJveC5yZW1vdmVDbGFzcyhzZWxlY3Rib3guZGF0YSgnanFmcy1jbGFzcycpKTtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5kYXRhKCdqcWZzLWNsYXNzJywgdC5kYXRhKCdqcWZzLWNsYXNzJykpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKHQuZGF0YSgnanFmcy1jbGFzcycpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRlbC5jaGFuZ2UoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5yZW1vdmVDbGFzcygnb3BlbmVkIGRyb3B1cCBkcm9wZG93bicpO1xyXG5cdFx0XHRcdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0ZHJvcGRvd24ubW91c2VvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0JCgnbGkuc2VsJywgZHJvcGRvd24pLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRlbC5vbignY2hhbmdlLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKS50ZXh0KCkpLnJlbW92ZUNsYXNzKCdwbGFjZWhvbGRlcicpO1xyXG5cdFx0XHRcdFx0XHRcdGxpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCBzZWwnKS5ub3QoJy5vcHRncm91cCcpLmVxKGVsWzBdLnNlbGVjdGVkSW5kZXgpLmFkZENsYXNzKCdzZWxlY3RlZCBzZWwnKTtcclxuXHRcdFx0XHRcdFx0XHQvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSwg0L/QvtC60LDQt9GL0LLQsNGO0YnQuNC5INC40LfQvNC10L3QtdC90LjQtSDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmIChvcHRpb24uZmlyc3QoKS50ZXh0KCkgIT0gbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS50ZXh0KCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnY2hhbmdlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2NoYW5nZWQnKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5vbignZm9jdXMuc3R5bGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0JCgnZGl2Lmpxc2VsZWN0Jykubm90KCcuZm9jdXNlZCcpLnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJykuZmluZCgnZGl2LmpxLXNlbGVjdGJveF9fZHJvcGRvd24nKS5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5vbignYmx1ci5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQnKTtcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0Ly8g0LjQt9C80LXQvdC10L3QuNC1INGB0LXQu9C10LrRgtCwINGBINC60LvQsNCy0LjQsNGC0YPRgNGLXHJcblx0XHRcdFx0XHRcdC5vbigna2V5ZG93bi5zdHlsZXIga2V5dXAuc3R5bGVyJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBsaUhlaWdodCA9IGxpLmRhdGEoJ2xpLWhlaWdodCcpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlbC52YWwoKSA9PT0gJycpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChzZWxlY3RQbGFjZWhvbGRlcikuYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJyk7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGRpdlRleHQudGV4dChvcHRpb24uZmlsdGVyKCc6c2VsZWN0ZWQnKS50ZXh0KCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRsaS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQgc2VsJykubm90KCcub3B0Z3JvdXAnKS5lcShlbFswXS5zZWxlY3RlZEluZGV4KS5hZGRDbGFzcygnc2VsZWN0ZWQgc2VsJyk7XHJcblx0XHRcdFx0XHRcdFx0Ly8g0LLQstC10YDRhSwg0LLQu9C10LLQviwgUGFnZSBVcCwgSG9tZVxyXG5cdFx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDM4IHx8IGUud2hpY2ggPT0gMzcgfHwgZS53aGljaCA9PSAzMyB8fCBlLndoaWNoID09IDM2KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZWwudmFsKCkgPT09ICcnKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCgwKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHVsLnNjcm9sbFRvcCh1bC5zY3JvbGxUb3AoKSArIGxpLmZpbHRlcignLnNlbGVjdGVkJykucG9zaXRpb24oKS50b3ApO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQvLyDQstC90LjQtywg0LLQv9GA0LDQstC+LCBQYWdlIERvd24sIEVuZFxyXG5cdFx0XHRcdFx0XHRcdGlmIChlLndoaWNoID09IDQwIHx8IGUud2hpY2ggPT0gMzkgfHwgZS53aGljaCA9PSAzNCB8fCBlLndoaWNoID09IDM1KSB7XHJcblx0XHRcdFx0XHRcdFx0XHR1bC5zY3JvbGxUb3AodWwuc2Nyb2xsVG9wKCkgKyBsaS5maWx0ZXIoJy5zZWxlY3RlZCcpLnBvc2l0aW9uKCkudG9wIC0gdWwuaW5uZXJIZWlnaHQoKSArIGxpSGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly8g0LfQsNC60YDRi9Cy0LDQtdC8INCy0YvQv9Cw0LTQsNGO0YnQuNC5INGB0L/QuNGB0L7QuiDQv9GA0Lgg0L3QsNC20LDRgtC40LggRW50ZXJcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS53aGljaCA9PSAxMykge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd24uaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LnJlbW92ZUNsYXNzKCdvcGVuZWQgZHJvcHVwIGRyb3Bkb3duJyk7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQutC+0LvQsdC10Log0L/RgNC4INC30LDQutGA0YvRgtC40Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KS5vbigna2V5ZG93bi5zdHlsZXInLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8g0L7RgtC60YDRi9Cy0LDQtdC8INCy0YvQv9Cw0LTQsNGO0YnQuNC5INGB0L/QuNGB0L7QuiDQv9GA0Lgg0L3QsNC20LDRgtC40LggU3BhY2VcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS53aGljaCA9PSAzMikge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGl2U2VsZWN0LmNsaWNrKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC/0YDRj9GH0LXQvCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0L/RgNC4INC60LvQuNC60LUg0LfQsCDQv9GA0LXQtNC10LvQsNC80Lgg0YHQtdC70LXQutGC0LBcclxuXHRcdFx0XHRcdFx0aWYgKCFvbkRvY3VtZW50Q2xpY2sucmVnaXN0ZXJlZCkge1xyXG5cdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsIG9uRG9jdW1lbnRDbGljayk7XHJcblx0XHRcdFx0XHRcdFx0b25Eb2N1bWVudENsaWNrLnJlZ2lzdGVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fSAvLyBlbmQgZG9TZWxlY3QoKVxyXG5cclxuXHRcdFx0XHRcdC8vINC80YPQu9GM0YLQuNGB0LXQu9C10LrRglxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24gZG9NdWx0aXBsZVNlbGVjdCgpIHtcclxuXHJcblx0XHRcdFx0XHRcdHZhciBhdHQgPSBuZXcgQXR0cmlidXRlcygpO1xyXG5cdFx0XHRcdFx0XHR2YXIgc2VsZWN0Ym94ID1cclxuXHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianEtc2VsZWN0LW11bHRpcGxlIGpxc2VsZWN0XCI+PC9kaXY+JylcclxuXHRcdFx0XHRcdFx0XHQuYXR0cih7XHJcblx0XHRcdFx0XHRcdFx0XHRpZDogYXR0LmlkLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IGF0dC50aXRsZVxyXG5cdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0LmFkZENsYXNzKGF0dC5jbGFzc2VzKVxyXG5cdFx0XHRcdFx0XHRcdC5kYXRhKGF0dC5kYXRhKVxyXG5cdFx0XHRcdFx0XHQ7XHJcblxyXG5cdFx0XHRcdFx0XHRlbC5hZnRlcihzZWxlY3Rib3gpO1xyXG5cclxuXHRcdFx0XHRcdFx0bWFrZUxpc3QoKTtcclxuXHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFwcGVuZCgnPHVsPicgKyBsaXN0ICsgJzwvdWw+Jyk7XHJcblx0XHRcdFx0XHRcdHZhciB1bCA9ICQoJ3VsJywgc2VsZWN0Ym94KTtcclxuXHRcdFx0XHRcdFx0dmFyIGxpID0gJCgnbGknLCBzZWxlY3Rib3gpO1xyXG5cdFx0XHRcdFx0XHR2YXIgc2l6ZSA9IGVsLmF0dHIoJ3NpemUnKTtcclxuXHRcdFx0XHRcdFx0dmFyIHVsSGVpZ2h0ID0gdWwub3V0ZXJIZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0dmFyIGxpSGVpZ2h0ID0gbGkub3V0ZXJIZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0aWYgKHNpemUgIT09IHVuZGVmaW5lZCAmJiBzaXplID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHVsLmNzcyh7J2hlaWdodCc6IGxpSGVpZ2h0ICogc2l6ZX0pO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHVsLmNzcyh7J2hlaWdodCc6IGxpSGVpZ2h0ICogNH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmICh1bEhlaWdodCA+IHNlbGVjdGJveC5oZWlnaHQoKSkge1xyXG5cdFx0XHRcdFx0XHRcdHVsLmNzcygnb3ZlcmZsb3dZJywgJ3Njcm9sbCcpO1xyXG5cdFx0XHRcdFx0XHRcdHByZXZlbnRTY3JvbGxpbmcodWwpO1xyXG5cdFx0XHRcdFx0XHRcdC8vINC/0YDQvtC60YDRg9GH0LjQstCw0LXQvCDQtNC+INCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0YPQvdC60YLQsFxyXG5cdFx0XHRcdFx0XHRcdGlmIChsaS5maWx0ZXIoJy5zZWxlY3RlZCcpLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dWwuc2Nyb2xsVG9wKHVsLnNjcm9sbFRvcCgpICsgbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5wb3NpdGlvbigpLnRvcCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHQvLyDQv9GA0Y/Rh9C10Lwg0L7RgNC40LPQuNC90LDQu9GM0L3Ri9C5INGB0LXQu9C10LrRglxyXG5cdFx0XHRcdFx0XHRlbC5wcmVwZW5kVG8oc2VsZWN0Ym94KTtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4INGB0LXQu9C10LrRgiDQvdC10LDQutGC0LjQstC90YvQuVxyXG5cdFx0XHRcdFx0XHRpZiAoZWwuaXMoJzpkaXNhYmxlZCcpKSB7XHJcblx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdG9wdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCQodGhpcykuaXMoJzpzZWxlY3RlZCcpKSBsaS5lcSgkKHRoaXMpLmluZGV4KCkpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8g0LXRgdC70Lgg0YHQtdC70LXQutGCINCw0LrRgtC40LLQvdGL0LlcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8g0L/RgNC4INC60LvQuNC60LUg0L3QsCDQv9GD0L3QutGCINGB0L/QuNGB0LrQsFxyXG5cdFx0XHRcdFx0XHRcdGxpLmZpbHRlcignOm5vdCguZGlzYWJsZWQpOm5vdCgub3B0Z3JvdXApJykuY2xpY2soZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWwuZm9jdXMoKTtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBjbGtkID0gJCh0aGlzKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKCFlLmN0cmxLZXkgJiYgIWUubWV0YUtleSkgY2xrZC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmKCFlLnNoaWZ0S2V5KSBjbGtkLmFkZENsYXNzKCdmaXJzdCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYoIWUuY3RybEtleSAmJiAhZS5tZXRhS2V5ICYmICFlLnNoaWZ0S2V5KSBjbGtkLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkIGZpcnN0Jyk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Ly8g0LLRi9C00LXQu9C10L3QuNC1INC/0YPQvdC60YLQvtCyINC/0YDQuCDQt9Cw0LbQsNGC0L7QvCBDdHJsXHJcblx0XHRcdFx0XHRcdFx0XHRpZihlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChjbGtkLmlzKCcuc2VsZWN0ZWQnKSkgY2xrZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQgZmlyc3QnKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlIGNsa2QuYWRkQ2xhc3MoJ3NlbGVjdGVkIGZpcnN0Jyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNsa2Quc2libGluZ3MoKS5yZW1vdmVDbGFzcygnZmlyc3QnKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQvLyDQstGL0LTQtdC70LXQvdC40LUg0L/Rg9C90LrRgtC+0LIg0L/RgNC4INC30LDQttCw0YLQvtC8IFNoaWZ0XHJcblx0XHRcdFx0XHRcdFx0XHRpZihlLnNoaWZ0S2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBwcmV2ID0gZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNsa2Quc2libGluZ3MoKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKS5zaWJsaW5ncygnLmZpcnN0JykuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNsa2QucHJldkFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQodGhpcykuaXMoJy5maXJzdCcpKSBwcmV2ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNsa2QubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCQodGhpcykuaXMoJy5maXJzdCcpKSBuZXh0ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwcmV2KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xrZC5wcmV2QWxsKCkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKHRoaXMpLmlzKCcuc2VsZWN0ZWQnKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlICQodGhpcykubm90KCcuZGlzYWJsZWQsIC5vcHRncm91cCcpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChuZXh0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xrZC5uZXh0QWxsKCkuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgkKHRoaXMpLmlzKCcuc2VsZWN0ZWQnKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbHNlICQodGhpcykubm90KCcuZGlzYWJsZWQsIC5vcHRncm91cCcpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChsaS5maWx0ZXIoJy5zZWxlY3RlZCcpLmxlbmd0aCA9PSAxKSBjbGtkLmFkZENsYXNzKCdmaXJzdCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdC8vINC+0YLQvNC10YfQsNC10Lwg0LLRi9Cx0YDQsNC90L3Ri9C1INC80YvRiNGM0Y5cclxuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbi5wcm9wKCdzZWxlY3RlZCcsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGxpLmZpbHRlcignLnNlbGVjdGVkJykuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIHQgPSAkKHRoaXMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgaW5kZXggPSB0LmluZGV4KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0LmlzKCcub3B0aW9uJykpIGluZGV4IC09IHQucHJldkFsbCgnLm9wdGdyb3VwJykubGVuZ3RoO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRvcHRpb24uZXEoaW5kZXgpLnByb3AoJ3NlbGVjdGVkJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHRcdGVsLmNoYW5nZSgpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8g0L7RgtC80LXRh9Cw0LXQvCDQstGL0LHRgNCw0L3QvdGL0LUg0YEg0LrQu9Cw0LLQuNCw0YLRg9GA0YtcclxuXHRcdFx0XHRcdFx0XHRvcHRpb24uZWFjaChmdW5jdGlvbihpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQkKHRoaXMpLmRhdGEoJ29wdGlvbkluZGV4JywgaSk7XHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0ZWwub24oJ2NoYW5nZS5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGxpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGFyckluZGV4ZXMgPSBbXTtcclxuXHRcdFx0XHRcdFx0XHRcdG9wdGlvbi5maWx0ZXIoJzpzZWxlY3RlZCcpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFyckluZGV4ZXMucHVzaCgkKHRoaXMpLmRhdGEoJ29wdGlvbkluZGV4JykpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0XHRsaS5ub3QoJy5vcHRncm91cCcpLmZpbHRlcihmdW5jdGlvbihpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAkLmluQXJyYXkoaSwgYXJySW5kZXhlcykgPiAtMTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0Lm9uKCdmb2N1cy5zdHlsZXInLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGJveC5hZGRDbGFzcygnZm9jdXNlZCcpO1xyXG5cdFx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdFx0Lm9uKCdibHVyLnN0eWxlcicsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Ym94LnJlbW92ZUNsYXNzKCdmb2N1c2VkJyk7XHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vINC/0YDQvtC60YDRg9GH0LjQstCw0LXQvCDRgSDQutC70LDQstC40LDRgtGD0YDRi1xyXG5cdFx0XHRcdFx0XHRcdGlmICh1bEhlaWdodCA+IHNlbGVjdGJveC5oZWlnaHQoKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWwub24oJ2tleWRvd24uc3R5bGVyJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyDQstCy0LXRgNGFLCDQstC70LXQstC+LCBQYWdlVXBcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGUud2hpY2ggPT0gMzggfHwgZS53aGljaCA9PSAzNyB8fCBlLndoaWNoID09IDMzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dWwuc2Nyb2xsVG9wKHVsLnNjcm9sbFRvcCgpICsgbGkuZmlsdGVyKCcuc2VsZWN0ZWQnKS5wb3NpdGlvbigpLnRvcCAtIGxpSGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyDQstC90LjQtywg0LLQv9GA0LDQstC+LCBQYWdlRG93blxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZS53aGljaCA9PSA0MCB8fCBlLndoaWNoID09IDM5IHx8IGUud2hpY2ggPT0gMzQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR1bC5zY3JvbGxUb3AodWwuc2Nyb2xsVG9wKCkgKyBsaS5maWx0ZXIoJy5zZWxlY3RlZDpsYXN0JykucG9zaXRpb24oKS50b3AgLSB1bC5pbm5lckhlaWdodCgpICsgbGlIZWlnaHQgKiAyKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSAvLyBlbmQgZG9NdWx0aXBsZVNlbGVjdCgpXHJcblxyXG5cdFx0XHRcdFx0aWYgKGVsLmlzKCdbbXVsdGlwbGVdJykpIHtcclxuXHJcblx0XHRcdFx0XHRcdC8vINC10YHQu9C4IEFuZHJvaWQg0LjQu9C4IGlPUywg0YLQviDQvNGD0LvRjNGC0LjRgdC10LvQtdC60YIg0L3QtSDRgdGC0LjQu9C40LfRg9C10LxcclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC40YfQuNC90LAg0LTQu9GPIEFuZHJvaWQgLSDQsiDRgdGC0LjQu9C40LfQvtCy0LDQvdC90L7QvCDRgdC10LvQtdC60YLQtSDQvdC10YIg0LLQvtC30LzQvtC20L3QvtGB0YLQuCDQstGL0LHRgNCw0YLRjCDQvdC10YHQutC+0LvRjNC60L4g0L/Rg9C90LrRgtC+0LJcclxuXHRcdFx0XHRcdFx0Ly8g0L/RgNC40YfQuNC90LAg0LTQu9GPIGlPUyAtINCyINGB0YLQuNC70LjQt9C+0LLQsNC90L3QvtC8INGB0LXQu9C10LrRgtC1INC90LXQv9GA0LDQstC40LvRjNC90L4g0L7RgtC+0LHRgNCw0LbQsNGO0YLRgdGPINCy0YvQsdGA0LDQvdC90YvQtSDQv9GD0L3QutGC0YtcclxuXHRcdFx0XHRcdFx0aWYgKEFuZHJvaWQgfHwgaU9TKSByZXR1cm47XHJcblxyXG5cdFx0XHRcdFx0XHRkb011bHRpcGxlU2VsZWN0KCk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRkb1NlbGVjdCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9OyAvLyBlbmQgc2VsZWN0Ym94T3V0cHV0KClcclxuXHJcblx0XHRcdFx0c2VsZWN0Ym94T3V0cHV0KCk7XHJcblxyXG5cdFx0XHRcdC8vINC+0LHQvdC+0LLQu9C10L3QuNC1INC/0YDQuCDQtNC40L3QsNC80LjRh9C10YHQutC+0Lwg0LjQt9C80LXQvdC10L3QuNC4XHJcblx0XHRcdFx0ZWwub24oJ3JlZnJlc2gnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGVsLm9mZignLnN0eWxlcicpLnBhcmVudCgpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRzZWxlY3Rib3hPdXRwdXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdC8vIGVuZCBzZWxlY3RcclxuXHJcblx0XHRcdC8vIHJlc2V0XHJcblx0XHRcdH0gZWxzZSBpZiAoZWwuaXMoJzpyZXNldCcpKSB7XHJcblx0XHRcdFx0ZWwub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRlbC5jbG9zZXN0KCdmb3JtJykuZmluZCgnaW5wdXQsIHNlbGVjdCcpLnRyaWdnZXIoJ3JlZnJlc2gnKTtcclxuXHRcdFx0XHRcdH0sIDEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IC8vIGVuZCByZXNldFxyXG5cclxuXHRcdH0sIC8vIGluaXQ6IGZ1bmN0aW9uKClcclxuXHJcblx0XHQvLyDQtNC10YHRgtGA0YPQutGC0L7RgFxyXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgZWwgPSAkKHRoaXMuZWxlbWVudCk7XHJcblxyXG5cdFx0XHRpZiAoZWwuaXMoJzpjaGVja2JveCcpIHx8IGVsLmlzKCc6cmFkaW8nKSkge1xyXG5cdFx0XHRcdGVsLnJlbW92ZURhdGEoJ18nICsgcGx1Z2luTmFtZSkub2ZmKCcuc3R5bGVyIHJlZnJlc2gnKS5yZW1vdmVBdHRyKCdzdHlsZScpLnBhcmVudCgpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdFx0ZWwuY2xvc2VzdCgnbGFiZWwnKS5hZGQoJ2xhYmVsW2Zvcj1cIicgKyBlbC5hdHRyKCdpZCcpICsgJ1wiXScpLm9mZignLnN0eWxlcicpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGVsLmlzKCdpbnB1dFt0eXBlPVwibnVtYmVyXCJdJykpIHtcclxuXHRcdFx0XHRlbC5yZW1vdmVEYXRhKCdfJyArIHBsdWdpbk5hbWUpLm9mZignLnN0eWxlciByZWZyZXNoJykuY2xvc2VzdCgnLmpxLW51bWJlcicpLmJlZm9yZShlbCkucmVtb3ZlKCk7XHJcblx0XHRcdH0gZWxzZSBpZiAoZWwuaXMoJzpmaWxlJykgfHwgZWwuaXMoJ3NlbGVjdCcpKSB7XHJcblx0XHRcdFx0ZWwucmVtb3ZlRGF0YSgnXycgKyBwbHVnaW5OYW1lKS5vZmYoJy5zdHlsZXIgcmVmcmVzaCcpLnJlbW92ZUF0dHIoJ3N0eWxlJykucGFyZW50KCkuYmVmb3JlKGVsKS5yZW1vdmUoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gLy8gZGVzdHJveTogZnVuY3Rpb24oKVxyXG5cclxuXHR9OyAvLyBQbHVnaW4ucHJvdG90eXBlXHJcblxyXG5cdCQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuXHRcdGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoISQuZGF0YSh0aGlzLCAnXycgKyBwbHVnaW5OYW1lKSkge1xyXG5cdFx0XHRcdFx0JC5kYXRhKHRoaXMsICdfJyArIHBsdWdpbk5hbWUsIG5ldyBQbHVnaW4odGhpcywgb3B0aW9ucykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0Ly8g0LrQvtC70LHQtdC6INC/0L7RgdC70LUg0LLRi9C/0L7Qu9C90LXQvdC40Y8g0L/Qu9Cw0LPQuNC90LBcclxuXHRcdFx0LnByb21pc2UoKVxyXG5cdFx0XHQuZG9uZShmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgb3B0ID0gJCh0aGlzWzBdKS5kYXRhKCdfJyArIHBsdWdpbk5hbWUpO1xyXG5cdFx0XHRcdGlmIChvcHQpIG9wdC5vcHRpb25zLm9uRm9ybVN0eWxlZC5jYWxsKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnICYmIG9wdGlvbnNbMF0gIT09ICdfJyAmJiBvcHRpb25zICE9PSAnaW5pdCcpIHtcclxuXHRcdFx0dmFyIHJldHVybnM7XHJcblx0XHRcdHRoaXMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgJ18nICsgcGx1Z2luTmFtZSk7XHJcblx0XHRcdFx0aWYgKGluc3RhbmNlIGluc3RhbmNlb2YgUGx1Z2luICYmIHR5cGVvZiBpbnN0YW5jZVtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdFx0cmV0dXJucyA9IGluc3RhbmNlW29wdGlvbnNdLmFwcGx5KGluc3RhbmNlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCAxKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHJldHVybnMgIT09IHVuZGVmaW5lZCA/IHJldHVybnMgOiB0aGlzO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vINC/0YDRj9GH0LXQvCDQstGL0L/QsNC00LDRjtGJ0LjQuSDRgdC/0LjRgdC+0Log0L/RgNC4INC60LvQuNC60LUg0LfQsCDQv9GA0LXQtNC10LvQsNC80Lgg0YHQtdC70LXQutGC0LBcclxuXHRmdW5jdGlvbiBvbkRvY3VtZW50Q2xpY2soZSkge1xyXG5cdFx0Ly8gZS50YXJnZXQubm9kZU5hbWUgIT0gJ09QVElPTicgLSDQtNC+0LHQsNCy0LvQtdC90L4g0LTQu9GPINC+0LHRhdC+0LTQsCDQsdCw0LPQsCDQsiBPcGVyYSDQvdCwINC00LLQuNC20LrQtSBQcmVzdG9cclxuXHRcdC8vICjQv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC4INGB0LXQu9C10LrRgtCwINGBINC60LvQsNCy0LjQsNGC0YPRgNGLINGB0YDQsNCx0LDRgtGL0LLQsNC10YIg0YHQvtCx0YvRgtC40LUgb25jbGljaylcclxuXHRcdGlmICghJChlLnRhcmdldCkucGFyZW50cygpLmhhc0NsYXNzKCdqcS1zZWxlY3Rib3gnKSAmJiBlLnRhcmdldC5ub2RlTmFtZSAhPSAnT1BUSU9OJykge1xyXG5cdFx0XHRpZiAoJCgnZGl2LmpxLXNlbGVjdGJveC5vcGVuZWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0XHR2YXIgc2VsZWN0Ym94ID0gJCgnZGl2LmpxLXNlbGVjdGJveC5vcGVuZWQnKSxcclxuXHRcdFx0XHRcdFx0c2VhcmNoID0gJCgnZGl2LmpxLXNlbGVjdGJveF9fc2VhcmNoIGlucHV0Jywgc2VsZWN0Ym94KSxcclxuXHRcdFx0XHRcdFx0ZHJvcGRvd24gPSAkKCdkaXYuanEtc2VsZWN0Ym94X19kcm9wZG93bicsIHNlbGVjdGJveCksXHJcblx0XHRcdFx0XHRcdG9wdCA9IHNlbGVjdGJveC5maW5kKCdzZWxlY3QnKS5kYXRhKCdfJyArIHBsdWdpbk5hbWUpLm9wdGlvbnM7XHJcblxyXG5cdFx0XHRcdC8vINC60L7Qu9Cx0LXQuiDQv9GA0Lgg0LfQsNC60YDRi9GC0LjQuCDRgdC10LvQtdC60YLQsFxyXG5cdFx0XHRcdG9wdC5vblNlbGVjdENsb3NlZC5jYWxsKHNlbGVjdGJveCk7XHJcblxyXG5cdFx0XHRcdGlmIChzZWFyY2gubGVuZ3RoKSBzZWFyY2gudmFsKCcnKS5rZXl1cCgpO1xyXG5cdFx0XHRcdGRyb3Bkb3duLmhpZGUoKS5maW5kKCdsaS5zZWwnKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcclxuXHRcdFx0XHRzZWxlY3Rib3gucmVtb3ZlQ2xhc3MoJ2ZvY3VzZWQgb3BlbmVkIGRyb3B1cCBkcm9wZG93bicpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdG9uRG9jdW1lbnRDbGljay5yZWdpc3RlcmVkID0gZmFsc2U7XHJcblxyXG59KSk7Il0sImZpbGUiOiJsaWJzL2pxdWVyeS5mb3Jtc3R5bGVyLmpzIn0=
