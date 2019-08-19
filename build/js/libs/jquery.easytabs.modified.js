/*
 * Modified!
 * Add [data-href] as selector for links. This allowed the use of <span> instead of <a>
 * 
 * jQuery EasyTabs plugin 3.2.0
 *
 * Copyright (c) 2010-2011 Steve Schwartz (JangoSteve)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Thu May 09 17:30:00 2013 -0500
 * 
 */
( function($) {

  $.easytabs = function(container, options) {

        // Attach to plugin anything that should be available via
        // the $container.data('easytabs') object
    var plugin = this,
        $container = $(container),

        defaults = {
          animate: true,
          panelActiveClass: "active",
          tabActiveClass: "active",
          defaultTab: "li:first-child",
          animationSpeed: "normal",
          tabs: "> ul > li",
          updateHash: true,
          cycle: false,
          collapsible: false,
          collapsedClass: "collapsed",
          collapsedByDefault: true,
          uiTabs: false,
          transitionIn: 'fadeIn',
          transitionOut: 'fadeOut',
          transitionInEasing: 'swing',
          transitionOutEasing: 'swing',
          transitionCollapse: 'slideUp',
          transitionUncollapse: 'slideDown',
          transitionCollapseEasing: 'swing',
          transitionUncollapseEasing: 'swing',
          containerClass: "",
          tabsClass: "",
          tabClass: "",
          panelClass: "",
          cache: true,
          event: 'click',
          panelContext: $container
        },

        // Internal instance variables
        // (not available via easytabs object)
        $defaultTab,
        $defaultTabLink,
        transitions,
        lastHash,
        skipUpdateToHash,
        animationSpeeds = {
          fast: 200,
          normal: 400,
          slow: 600
        },

        // Shorthand variable so that we don't need to call
        // plugin.settings throughout the plugin code
        settings;

    // =============================================================
    // Functions available via easytabs object
    // =============================================================

    plugin.init = function() {

      plugin.settings = settings = $.extend({}, defaults, options);
      settings.bind_str = settings.event+".easytabs";

      // Add jQuery UI's crazy class names to markup,
      // so that markup will match theme CSS
      if ( settings.uiTabs ) {
        settings.tabActiveClass = 'ui-tabs-selected';
        settings.containerClass = 'ui-tabs ui-widget ui-widget-content ui-corner-all';
        settings.tabsClass = 'ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all';
        settings.tabClass = 'ui-state-default ui-corner-top';
        settings.panelClass = 'ui-tabs-panel ui-widget-content ui-corner-bottom';
      }

      // If collapsible is true and defaultTab specified, assume user wants defaultTab showing (not collapsed)
      if ( settings.collapsible && options.defaultTab !== undefined && options.collpasedByDefault === undefined ) {
        settings.collapsedByDefault = false;
      }

      // Convert 'normal', 'fast', and 'slow' animation speed settings to their respective speed in milliseconds
      if ( typeof(settings.animationSpeed) === 'string' ) {
        settings.animationSpeed = animationSpeeds[settings.animationSpeed];
      }

      $('a.anchor').remove().prependTo('body');

      // Store easytabs object on container so we can easily set
      // properties throughout
      $container.data('easytabs', {});

      plugin.setTransitions();

      plugin.getTabs();

      addClasses();

      setDefaultTab();

      bindToTabClicks();

      initHashChange();

      initCycle();

      // Append data-easytabs HTML attribute to make easy to query for
      // easytabs instances via CSS pseudo-selector
      $container.attr('data-easytabs', true);
    };

    // Set transitions for switching between tabs based on options.
    // Could be used to update transitions if settings are changes.
    plugin.setTransitions = function() {
      transitions = ( settings.animate ) ? {
          show: settings.transitionIn,
          hide: settings.transitionOut,
          speed: settings.animationSpeed,
          collapse: settings.transitionCollapse,
          uncollapse: settings.transitionUncollapse,
          halfSpeed: settings.animationSpeed / 2
        } :
        {
          show: "show",
          hide: "hide",
          speed: 0,
          collapse: "hide",
          uncollapse: "show",
          halfSpeed: 0
        };
    };

    // Find and instantiate tabs and panels.
    // Could be used to reset tab and panel collection if markup is
    // modified.
    plugin.getTabs = function() {
      var $matchingPanel;

      // Find the initial set of elements matching the setting.tabs
      // CSS selector within the container
      plugin.tabs = $container.find(settings.tabs),

      // Instantiate panels as empty jquery object
      plugin.panels = $(),

      plugin.tabs.each(function(){
        var $tab = $(this),
            $a = $tab.children('a, [data-href]'),

            // targetId is the ID of the panel, which is either the
            // `href` attribute for non-ajax tabs, or in the
            // `data-target` attribute for ajax tabs since the `href` is
            // the ajax URL
            targetId = $tab.children('a').data('target');

        $tab.data('easytabs', {});

        // If the tab has a `data-target` attribute, and is thus an ajax tab
        if ( targetId !== undefined && targetId !== null ) {
          $tab.data('easytabs').ajax = $a.attr('href');
        } else {
          targetId = $a.attr('href') || $a.data('href');
        }
        targetId = targetId.match(/#([^\?]+)/)[1];

        $matchingPanel = settings.panelContext.find("#" + targetId);

        // If tab has a matching panel, add it to panels
        if ( $matchingPanel.length ) {

          // Store panel height before hiding
          $matchingPanel.data('easytabs', {
            position: $matchingPanel.css('position'),
            visibility: $matchingPanel.css('visibility')
          });

          // Don't hide panel if it's active (allows `getTabs` to be called manually to re-instantiate tab collection)
          $matchingPanel.not(settings.panelActiveClass).hide();

          plugin.panels = plugin.panels.add($matchingPanel);

          $tab.data('easytabs').panel = $matchingPanel;

        // Otherwise, remove tab from tabs collection
        } else {
          plugin.tabs = plugin.tabs.not($tab);
          if ('console' in window) {
            console.warn('Warning: tab without matching panel for selector \'#' + targetId +'\' removed from set');
          }
        }
      });
    };

    // Select tab and fire callback
    plugin.selectTab = function($clicked, callback) {
      var url = window.location,
          hash = url.hash.match(/^[^\?]*/)[0],
          $targetPanel = $clicked.parent().data('easytabs').panel,
          ajaxUrl = $clicked.parent().data('easytabs').ajax;

      // Tab is collapsible and active => toggle collapsed state
      if( settings.collapsible && ! skipUpdateToHash && ($clicked.hasClass(settings.tabActiveClass) || $clicked.hasClass(settings.collapsedClass)) ) {
        plugin.toggleTabCollapse($clicked, $targetPanel, ajaxUrl, callback);

      // Tab is not active and panel is not active => select tab
      } else if( ! $clicked.hasClass(settings.tabActiveClass) || ! $targetPanel.hasClass(settings.panelActiveClass) ){
        activateTab($clicked, $targetPanel, ajaxUrl, callback);

      // Cache is disabled => reload (e.g reload an ajax tab).
      } else if ( ! settings.cache ){
        activateTab($clicked, $targetPanel, ajaxUrl, callback);
      }

    };

    // Toggle tab collapsed state and fire callback
    plugin.toggleTabCollapse = function($clicked, $targetPanel, ajaxUrl, callback) {
      plugin.panels.stop(true,true);

      if( fire($container,"easytabs:before", [$clicked, $targetPanel, settings]) ){
        plugin.tabs.filter("." + settings.tabActiveClass).removeClass(settings.tabActiveClass).children().removeClass(settings.tabActiveClass);

        // If panel is collapsed, uncollapse it
        if( $clicked.hasClass(settings.collapsedClass) ){

          // If ajax panel and not already cached
          if( ajaxUrl && (!settings.cache || !$clicked.parent().data('easytabs').cached) ) {
            $container.trigger('easytabs:ajax:beforeSend', [$clicked, $targetPanel]);

            $targetPanel.load(ajaxUrl, function(response, status, xhr){
              $clicked.parent().data('easytabs').cached = true;
              $container.trigger('easytabs:ajax:complete', [$clicked, $targetPanel, response, status, xhr]);
            });
          }

          // Update CSS classes of tab and panel
          $clicked.parent()
            .removeClass(settings.collapsedClass)
            .addClass(settings.tabActiveClass)
            .children()
              .removeClass(settings.collapsedClass)
              .addClass(settings.tabActiveClass);

          $targetPanel
            .addClass(settings.panelActiveClass)
            [transitions.uncollapse](transitions.speed, settings.transitionUncollapseEasing, function(){
              $container.trigger('easytabs:midTransition', [$clicked, $targetPanel, settings]);
              if(typeof callback == 'function') callback();
            });

        // Otherwise, collapse it
        } else {

          // Update CSS classes of tab and panel
          $clicked.addClass(settings.collapsedClass)
            .parent()
              .addClass(settings.collapsedClass);

          $targetPanel
            .removeClass(settings.panelActiveClass)
            [transitions.collapse](transitions.speed, settings.transitionCollapseEasing, function(){
              $container.trigger("easytabs:midTransition", [$clicked, $targetPanel, settings]);
              if(typeof callback == 'function') callback();
            });
        }
      }
    };


    // Find tab with target panel matching value
    plugin.matchTab = function(hash) {
      return plugin.tabs.find("[href='" + hash + "'],[data-target='" + hash + "'],[data-href='" + hash + "']").first();
    };

    // Find panel with `id` matching value
    plugin.matchInPanel = function(hash) {
      return ( hash && plugin.validId(hash) ? plugin.panels.filter(':has(' + hash + ')').first() : [] );
    };

    // Make sure hash is a valid id value (admittedly strict in that HTML5 allows almost anything without a space)
    // but jQuery has issues with such id values anyway, so we can afford to be strict here.
    plugin.validId = function(id) {
      return id.substr(1).match(/^[A-Za-z][A-Za-z0-9\-_:\.]*$/);
    };

    // Select matching tab when URL hash changes
    plugin.selectTabFromHashChange = function() {
      var hash = window.location.hash.match(/^[^\?]*/)[0],
          $tab = plugin.matchTab(hash),
          $panel;

      if ( settings.updateHash ) {

        // If hash directly matches tab
        if( $tab.length ){
          skipUpdateToHash = true;
          plugin.selectTab( $tab );

        } else {
          $panel = plugin.matchInPanel(hash);

          // If panel contains element matching hash
          if ( $panel.length ) {
            hash = '#' + $panel.attr('id');
            $tab = plugin.matchTab(hash);
            skipUpdateToHash = true;
            plugin.selectTab( $tab );

          // If default tab is not active...
          } else if ( ! $defaultTab.hasClass(settings.tabActiveClass) && ! settings.cycle ) {

            // ...and hash is blank or matches a parent of the tab container or
            // if the last tab (before the hash updated) was one of the other tabs in this container.
            if ( hash === '' || plugin.matchTab(lastHash).length || $container.closest(hash).length ) {
              skipUpdateToHash = true;
              plugin.selectTab( $defaultTabLink );
            }
          }
        }
      }
    };

    // Cycle through tabs
    plugin.cycleTabs = function(tabNumber){
      if(settings.cycle){
        tabNumber = tabNumber % plugin.tabs.length;
        $tab = $( plugin.tabs[tabNumber] ).children("a").first();
        skipUpdateToHash = true;
        plugin.selectTab( $tab, function() {
          setTimeout(function(){ plugin.cycleTabs(tabNumber + 1); }, settings.cycle);
        });
      }
    };

    // Convenient public methods
    plugin.publicMethods = {
      select: function(tabSelector){
        var $tab;

        // Find tab container that matches selector (like 'li#tab-one' which contains tab link)
        if ( ($tab = plugin.tabs.filter(tabSelector)).length === 0 ) {

          // Find direct tab link that matches href (like 'a[href="#panel-1"]')
          if ( ($tab = plugin.tabs.find("a[href='" + tabSelector + "'], [data-href='" + tabSelector + "']")).length === 0 ) {

            // Find direct tab link that matches selector (like 'a#tab-1')
            if ( ($tab = plugin.tabs.find("a" + tabSelector)).length === 0 ) {

              // Find direct tab link that matches data-target (lik 'a[data-target="#panel-1"]')
              if ( ($tab = plugin.tabs.find("[data-target='" + tabSelector + "']")).length === 0 ) {

                // Find direct tab link that ends in the matching href (like 'a[href$="#panel-1"]', which would also match http://example.com/currentpage/#panel-1)
                if ( ($tab = plugin.tabs.find("a[href$='" + tabSelector + "']")).length === 0 ) {

                  $.error('Tab \'' + tabSelector + '\' does not exist in tab set');
                }
              }
            }
          }
        } else {
          // Select the child tab link, since the first option finds the tab container (like <li>)
          $tab = $tab.children("a, [data-href]").first();
        }
        plugin.selectTab($tab);
      }
    };

    // =============================================================
    // Private functions
    // =============================================================

    // Triggers an event on an element and returns the event result
    var fire = function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    }

    // Add CSS classes to markup (if specified), called by init
    var addClasses = function() {
      $container.addClass(settings.containerClass);
      plugin.tabs.parent().addClass(settings.tabsClass);
      plugin.tabs.addClass(settings.tabClass);
      plugin.panels.addClass(settings.panelClass);
    };

    // Set the default tab, whether from hash (bookmarked) or option,
    // called by init
    var setDefaultTab = function(){
      var hash = window.location.hash.match(/^[^\?]*/)[0],
          $selectedTab = plugin.matchTab(hash).parent(),
          $panel;

      // If hash directly matches one of the tabs, active on page-load
      if( $selectedTab.length === 1 ){
        $defaultTab = $selectedTab;
        settings.cycle = false;

      } else {
        $panel = plugin.matchInPanel(hash);

        // If one of the panels contains the element matching the hash,
        // make it active on page-load
        if ( $panel.length ) {
          hash = '#' + $panel.attr('id');
          $defaultTab = plugin.matchTab(hash).parent();

        // Otherwise, make the default tab the one that's active on page-load
        } else {
          $defaultTab = plugin.tabs.parent().find(settings.defaultTab);
          if ( $defaultTab.length === 0 ) {
            $.error("The specified default tab ('" + settings.defaultTab + "') could not be found in the tab set ('" + settings.tabs + "') out of " + plugin.tabs.length + " tabs.");
          }
        }
      }

      $defaultTabLink = $defaultTab.children("a").first();

      activateDefaultTab($selectedTab);
    };

    // Activate defaultTab (or collapse by default), called by setDefaultTab
    var activateDefaultTab = function($selectedTab) {
      var defaultPanel,
          defaultAjaxUrl;

      if ( settings.collapsible && $selectedTab.length === 0 && settings.collapsedByDefault ) {
        $defaultTab
          .addClass(settings.collapsedClass)
          .children()
            .addClass(settings.collapsedClass);

      } else {

        defaultPanel = $( $defaultTab.data('easytabs').panel );
        defaultAjaxUrl = $defaultTab.data('easytabs').ajax;

        if ( defaultAjaxUrl && (!settings.cache || !$defaultTab.data('easytabs').cached) ) {
          $container.trigger('easytabs:ajax:beforeSend', [$defaultTabLink, defaultPanel]);
          defaultPanel.load(defaultAjaxUrl, function(response, status, xhr){
            $defaultTab.data('easytabs').cached = true;
            $container.trigger('easytabs:ajax:complete', [$defaultTabLink, defaultPanel, response, status, xhr]);
          });
        }

        $defaultTab.data('easytabs').panel
          .show()
          .addClass(settings.panelActiveClass);

        $defaultTab
          .addClass(settings.tabActiveClass)
          .children()
            .addClass(settings.tabActiveClass);
      }

      // Fire event when the plugin is initialised
      $container.trigger("easytabs:initialised", [$defaultTabLink, defaultPanel]);
    };

    // Bind tab-select funtionality to namespaced click event, called by
    // init
    var bindToTabClicks = function() {
      plugin.tabs.children("a, [data-href]").bind(settings.bind_str, function(e) {

        // Stop cycling when a tab is clicked
        settings.cycle = false;

        // Hash will be updated when tab is clicked,
        // don't cause tab to re-select when hash-change event is fired
        skipUpdateToHash = false;

        // Select the panel for the clicked tab
        plugin.selectTab( $(this) );

        // Don't follow the link to the anchor
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      });
    };

    // Activate a given tab/panel, called from plugin.selectTab:
    //
    //   * fire `easytabs:before` hook
    //   * get ajax if new tab is an uncached ajax tab
    //   * animate out previously-active panel
    //   * fire `easytabs:midTransition` hook
    //   * update URL hash
    //   * animate in newly-active panel
    //   * update CSS classes for inactive and active tabs/panels
    //
    // TODO: This could probably be broken out into many more modular
    // functions
    var activateTab = function($clicked, $targetPanel, ajaxUrl, callback) {
      plugin.panels.stop(true,true);

      if( fire($container,"easytabs:before", [$clicked, $targetPanel, settings]) ){
        var $visiblePanel = plugin.panels.filter(":visible"),
            $panelContainer = $targetPanel.parent(),
            targetHeight,
            visibleHeight,
            heightDifference,
            showPanel,
            hash = window.location.hash.match(/^[^\?]*/)[0];

        if (settings.animate) {
          targetHeight = getHeightForHidden($targetPanel);
          visibleHeight = $visiblePanel.length ? setAndReturnHeight($visiblePanel) : 0;
          heightDifference = targetHeight - visibleHeight;
        }

        // Set lastHash to help indicate if defaultTab should be
        // activated across multiple tab instances.
        lastHash = hash;

        // TODO: Move this function elsewhere
        showPanel = function() {
          // At this point, the previous panel is hidden, and the new one will be selected
          $container.trigger("easytabs:midTransition", [$clicked, $targetPanel, settings]);

          // Gracefully animate between panels of differing heights, start height change animation *after* panel change if panel needs to contract,
          // so that there is no chance of making the visible panel overflowing the height of the target panel
          if (settings.animate && settings.transitionIn == 'fadeIn') {
            if (heightDifference < 0)
              $panelContainer.animate({
                height: $panelContainer.height() + heightDifference
              }, transitions.halfSpeed ).css({ 'min-height': '' });
          }

          if ( settings.updateHash && ! skipUpdateToHash ) {
            //window.location = url.toString().replace((url.pathname + hash), (url.pathname + $clicked.attr("href")));
            // Not sure why this behaves so differently, but it's more straight forward and seems to have less side-effects
						if (window.history.pushState) {
							window.history.pushState(null, null, '#' + $targetPanel.attr('id'));
						}
						else {
							window.location.hash = '#' + $targetPanel.attr('id');
						}
          } else {
            skipUpdateToHash = false;
          }

          $targetPanel
            [transitions.show](transitions.speed, settings.transitionInEasing, function(){
              $panelContainer.css({height: '', 'min-height': ''}); // After the transition, unset the height
              $container.trigger("easytabs:after", [$clicked, $targetPanel, settings]);
              // callback only gets called if selectTab actually does something, since it's inside the if block
              if(typeof callback == 'function'){
                callback();
              }
          });
        };

        if ( ajaxUrl && (!settings.cache || !$clicked.parent().data('easytabs').cached) ) {
          $container.trigger('easytabs:ajax:beforeSend', [$clicked, $targetPanel]);
          $targetPanel.load(ajaxUrl, function(response, status, xhr){
            $clicked.parent().data('easytabs').cached = true;
            $container.trigger('easytabs:ajax:complete', [$clicked, $targetPanel, response, status, xhr]);
          });
        }

        // Gracefully animate between panels of differing heights, start height change animation *before* panel change if panel needs to expand,
        // so that there is no chance of making the target panel overflowing the height of the visible panel
        if( settings.animate && settings.transitionOut == 'fadeOut' ) {
          if( heightDifference > 0 ) {
            $panelContainer.animate({
              height: ( $panelContainer.height() + heightDifference )
            }, transitions.halfSpeed );
          } else {
            // Prevent height jumping before height transition is triggered at midTransition
            $panelContainer.css({ 'min-height': $panelContainer.height() });
          }
        }

        // Change the active tab *first* to provide immediate feedback when the user clicks
        plugin.tabs.filter("." + settings.tabActiveClass).removeClass(settings.tabActiveClass).children().removeClass(settings.tabActiveClass);
        plugin.tabs.filter("." + settings.collapsedClass).removeClass(settings.collapsedClass).children().removeClass(settings.collapsedClass);
        $clicked.parent().addClass(settings.tabActiveClass).children().addClass(settings.tabActiveClass);

        plugin.panels.filter("." + settings.panelActiveClass).removeClass(settings.panelActiveClass);
        $targetPanel.addClass(settings.panelActiveClass);

        if( $visiblePanel.length ) {
          $visiblePanel
            [transitions.hide](transitions.speed, settings.transitionOutEasing, showPanel);
        } else {
          $targetPanel
            [transitions.uncollapse](transitions.speed, settings.transitionUncollapseEasing, showPanel);
        }
      }
    };

    // Get heights of panels to enable animation between panels of
    // differing heights, called by activateTab
    var getHeightForHidden = function($targetPanel){

      if ( $targetPanel.data('easytabs') && $targetPanel.data('easytabs').lastHeight ) {
        return $targetPanel.data('easytabs').lastHeight;
      }

      // this is the only property easytabs changes, so we need to grab its value on each tab change
      var display = $targetPanel.css('display'),
          outerCloak,
          height;

      // Workaround with wrapping height, because firefox returns wrong
      // height if element itself has absolute positioning.
      // but try/catch block needed for IE7 and IE8 because they throw
      // an "Unspecified error" when trying to create an element
      // with the css position set.
      try {
        outerCloak = $('<div></div>', {'position': 'absolute', 'visibility': 'hidden', 'overflow': 'hidden'});
      } catch (e) {
        outerCloak = $('<div></div>', {'visibility': 'hidden', 'overflow': 'hidden'});
      }
      height = $targetPanel
        .wrap(outerCloak)
        .css({'position':'relative','visibility':'hidden','display':'block'})
        .outerHeight();

      $targetPanel.unwrap();

      // Return element to previous state
      $targetPanel.css({
        position: $targetPanel.data('easytabs').position,
        visibility: $targetPanel.data('easytabs').visibility,
        display: display
      });

      // Cache height
      $targetPanel.data('easytabs').lastHeight = height;

      return height;
    };

    // Since the height of the visible panel may have been manipulated due to interaction,
    // we want to re-cache the visible height on each tab change, called
    // by activateTab
    var setAndReturnHeight = function($visiblePanel) {
      var height = $visiblePanel.outerHeight();

      if( $visiblePanel.data('easytabs') ) {
        $visiblePanel.data('easytabs').lastHeight = height;
      } else {
        $visiblePanel.data('easytabs', {lastHeight: height});
      }
      return height;
    };

    // Setup hash-change callback for forward- and back-button
    // functionality, called by init
    var initHashChange = function(){

      // enabling back-button with jquery.hashchange plugin
      // http://benalman.com/projects/jquery-hashchange-plugin/
      if(typeof $(window).hashchange === 'function'){
        $(window).hashchange( function(){
          plugin.selectTabFromHashChange();
        });
      } else if ($.address && typeof $.address.change === 'function') { // back-button with jquery.address plugin http://www.asual.com/jquery/address/docs/
        $.address.change( function(){
          plugin.selectTabFromHashChange();
        });
      }
    };

    // Begin cycling if set in options, called by init
    var initCycle = function(){
      var tabNumber;
      if (settings.cycle) {
        tabNumber = plugin.tabs.index($defaultTab);
        setTimeout( function(){ plugin.cycleTabs(tabNumber + 1); }, settings.cycle);
      }
    };


    plugin.init();

  };

  $.fn.easytabs = function(options) {
    var args = arguments;

    return this.each(function() {
      var $this = $(this),
          plugin = $this.data('easytabs');

      // Initialization was called with $(el).easytabs( { options } );
      if (undefined === plugin) {
        plugin = new $.easytabs(this, options);
        $this.data('easytabs', plugin);
      }

      // User called public method
      if ( plugin.publicMethods[options] ){
        return plugin.publicMethods[options](Array.prototype.slice.call( args, 1 ));
      }
    });
  };

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsaWJzL2pxdWVyeS5lYXN5dGFicy5tb2RpZmllZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBNb2RpZmllZCFcclxuICogQWRkIFtkYXRhLWhyZWZdIGFzIHNlbGVjdG9yIGZvciBsaW5rcy4gVGhpcyBhbGxvd2VkIHRoZSB1c2Ugb2YgPHNwYW4+IGluc3RlYWQgb2YgPGE+XHJcbiAqIFxyXG4gKiBqUXVlcnkgRWFzeVRhYnMgcGx1Z2luIDMuMi4wXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDExIFN0ZXZlIFNjaHdhcnR6IChKYW5nb1N0ZXZlKVxyXG4gKlxyXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgYW5kIEdQTCBsaWNlbnNlczpcclxuICogICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxyXG4gKiAgIGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9ncGwuaHRtbFxyXG4gKlxyXG4gKiBEYXRlOiBUaHUgTWF5IDA5IDE3OjMwOjAwIDIwMTMgLTA1MDBcclxuICogXHJcbiAqL1xyXG4oIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgJC5lYXN5dGFicyA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICAvLyBBdHRhY2ggdG8gcGx1Z2luIGFueXRoaW5nIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSB2aWFcclxuICAgICAgICAvLyB0aGUgJGNvbnRhaW5lci5kYXRhKCdlYXN5dGFicycpIG9iamVjdFxyXG4gICAgdmFyIHBsdWdpbiA9IHRoaXMsXHJcbiAgICAgICAgJGNvbnRhaW5lciA9ICQoY29udGFpbmVyKSxcclxuXHJcbiAgICAgICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICBhbmltYXRlOiB0cnVlLFxyXG4gICAgICAgICAgcGFuZWxBY3RpdmVDbGFzczogXCJhY3RpdmVcIixcclxuICAgICAgICAgIHRhYkFjdGl2ZUNsYXNzOiBcImFjdGl2ZVwiLFxyXG4gICAgICAgICAgZGVmYXVsdFRhYjogXCJsaTpmaXJzdC1jaGlsZFwiLFxyXG4gICAgICAgICAgYW5pbWF0aW9uU3BlZWQ6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgICB0YWJzOiBcIj4gdWwgPiBsaVwiLFxyXG4gICAgICAgICAgdXBkYXRlSGFzaDogdHJ1ZSxcclxuICAgICAgICAgIGN5Y2xlOiBmYWxzZSxcclxuICAgICAgICAgIGNvbGxhcHNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgIGNvbGxhcHNlZENsYXNzOiBcImNvbGxhcHNlZFwiLFxyXG4gICAgICAgICAgY29sbGFwc2VkQnlEZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgICAgdWlUYWJzOiBmYWxzZSxcclxuICAgICAgICAgIHRyYW5zaXRpb25JbjogJ2ZhZGVJbicsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uT3V0OiAnZmFkZU91dCcsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uSW5FYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uT3V0RWFzaW5nOiAnc3dpbmcnLFxyXG4gICAgICAgICAgdHJhbnNpdGlvbkNvbGxhcHNlOiAnc2xpZGVVcCcsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uVW5jb2xsYXBzZTogJ3NsaWRlRG93bicsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uQ29sbGFwc2VFYXNpbmc6ICdzd2luZycsXHJcbiAgICAgICAgICB0cmFuc2l0aW9uVW5jb2xsYXBzZUVhc2luZzogJ3N3aW5nJyxcclxuICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiBcIlwiLFxyXG4gICAgICAgICAgdGFic0NsYXNzOiBcIlwiLFxyXG4gICAgICAgICAgdGFiQ2xhc3M6IFwiXCIsXHJcbiAgICAgICAgICBwYW5lbENsYXNzOiBcIlwiLFxyXG4gICAgICAgICAgY2FjaGU6IHRydWUsXHJcbiAgICAgICAgICBldmVudDogJ2NsaWNrJyxcclxuICAgICAgICAgIHBhbmVsQ29udGV4dDogJGNvbnRhaW5lclxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIEludGVybmFsIGluc3RhbmNlIHZhcmlhYmxlc1xyXG4gICAgICAgIC8vIChub3QgYXZhaWxhYmxlIHZpYSBlYXN5dGFicyBvYmplY3QpXHJcbiAgICAgICAgJGRlZmF1bHRUYWIsXHJcbiAgICAgICAgJGRlZmF1bHRUYWJMaW5rLFxyXG4gICAgICAgIHRyYW5zaXRpb25zLFxyXG4gICAgICAgIGxhc3RIYXNoLFxyXG4gICAgICAgIHNraXBVcGRhdGVUb0hhc2gsXHJcbiAgICAgICAgYW5pbWF0aW9uU3BlZWRzID0ge1xyXG4gICAgICAgICAgZmFzdDogMjAwLFxyXG4gICAgICAgICAgbm9ybWFsOiA0MDAsXHJcbiAgICAgICAgICBzbG93OiA2MDBcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBTaG9ydGhhbmQgdmFyaWFibGUgc28gdGhhdCB3ZSBkb24ndCBuZWVkIHRvIGNhbGxcclxuICAgICAgICAvLyBwbHVnaW4uc2V0dGluZ3MgdGhyb3VnaG91dCB0aGUgcGx1Z2luIGNvZGVcclxuICAgICAgICBzZXR0aW5ncztcclxuXHJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBGdW5jdGlvbnMgYXZhaWxhYmxlIHZpYSBlYXN5dGFicyBvYmplY3RcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBwbHVnaW4uaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcGx1Z2luLnNldHRpbmdzID0gc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG4gICAgICBzZXR0aW5ncy5iaW5kX3N0ciA9IHNldHRpbmdzLmV2ZW50K1wiLmVhc3l0YWJzXCI7XHJcblxyXG4gICAgICAvLyBBZGQgalF1ZXJ5IFVJJ3MgY3JhenkgY2xhc3MgbmFtZXMgdG8gbWFya3VwLFxyXG4gICAgICAvLyBzbyB0aGF0IG1hcmt1cCB3aWxsIG1hdGNoIHRoZW1lIENTU1xyXG4gICAgICBpZiAoIHNldHRpbmdzLnVpVGFicyApIHtcclxuICAgICAgICBzZXR0aW5ncy50YWJBY3RpdmVDbGFzcyA9ICd1aS10YWJzLXNlbGVjdGVkJztcclxuICAgICAgICBzZXR0aW5ncy5jb250YWluZXJDbGFzcyA9ICd1aS10YWJzIHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1jb3JuZXItYWxsJztcclxuICAgICAgICBzZXR0aW5ncy50YWJzQ2xhc3MgPSAndWktdGFicy1uYXYgdWktaGVscGVyLXJlc2V0IHVpLWhlbHBlci1jbGVhcmZpeCB1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci1hbGwnO1xyXG4gICAgICAgIHNldHRpbmdzLnRhYkNsYXNzID0gJ3VpLXN0YXRlLWRlZmF1bHQgdWktY29ybmVyLXRvcCc7XHJcbiAgICAgICAgc2V0dGluZ3MucGFuZWxDbGFzcyA9ICd1aS10YWJzLXBhbmVsIHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1ib3R0b20nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBjb2xsYXBzaWJsZSBpcyB0cnVlIGFuZCBkZWZhdWx0VGFiIHNwZWNpZmllZCwgYXNzdW1lIHVzZXIgd2FudHMgZGVmYXVsdFRhYiBzaG93aW5nIChub3QgY29sbGFwc2VkKVxyXG4gICAgICBpZiAoIHNldHRpbmdzLmNvbGxhcHNpYmxlICYmIG9wdGlvbnMuZGVmYXVsdFRhYiAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuY29sbHBhc2VkQnlEZWZhdWx0ID09PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgc2V0dGluZ3MuY29sbGFwc2VkQnlEZWZhdWx0ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbnZlcnQgJ25vcm1hbCcsICdmYXN0JywgYW5kICdzbG93JyBhbmltYXRpb24gc3BlZWQgc2V0dGluZ3MgdG8gdGhlaXIgcmVzcGVjdGl2ZSBzcGVlZCBpbiBtaWxsaXNlY29uZHNcclxuICAgICAgaWYgKCB0eXBlb2Yoc2V0dGluZ3MuYW5pbWF0aW9uU3BlZWQpID09PSAnc3RyaW5nJyApIHtcclxuICAgICAgICBzZXR0aW5ncy5hbmltYXRpb25TcGVlZCA9IGFuaW1hdGlvblNwZWVkc1tzZXR0aW5ncy5hbmltYXRpb25TcGVlZF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICQoJ2EuYW5jaG9yJykucmVtb3ZlKCkucHJlcGVuZFRvKCdib2R5Jyk7XHJcblxyXG4gICAgICAvLyBTdG9yZSBlYXN5dGFicyBvYmplY3Qgb24gY29udGFpbmVyIHNvIHdlIGNhbiBlYXNpbHkgc2V0XHJcbiAgICAgIC8vIHByb3BlcnRpZXMgdGhyb3VnaG91dFxyXG4gICAgICAkY29udGFpbmVyLmRhdGEoJ2Vhc3l0YWJzJywge30pO1xyXG5cclxuICAgICAgcGx1Z2luLnNldFRyYW5zaXRpb25zKCk7XHJcblxyXG4gICAgICBwbHVnaW4uZ2V0VGFicygpO1xyXG5cclxuICAgICAgYWRkQ2xhc3NlcygpO1xyXG5cclxuICAgICAgc2V0RGVmYXVsdFRhYigpO1xyXG5cclxuICAgICAgYmluZFRvVGFiQ2xpY2tzKCk7XHJcblxyXG4gICAgICBpbml0SGFzaENoYW5nZSgpO1xyXG5cclxuICAgICAgaW5pdEN5Y2xlKCk7XHJcblxyXG4gICAgICAvLyBBcHBlbmQgZGF0YS1lYXN5dGFicyBIVE1MIGF0dHJpYnV0ZSB0byBtYWtlIGVhc3kgdG8gcXVlcnkgZm9yXHJcbiAgICAgIC8vIGVhc3l0YWJzIGluc3RhbmNlcyB2aWEgQ1NTIHBzZXVkby1zZWxlY3RvclxyXG4gICAgICAkY29udGFpbmVyLmF0dHIoJ2RhdGEtZWFzeXRhYnMnLCB0cnVlKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gU2V0IHRyYW5zaXRpb25zIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiB0YWJzIGJhc2VkIG9uIG9wdGlvbnMuXHJcbiAgICAvLyBDb3VsZCBiZSB1c2VkIHRvIHVwZGF0ZSB0cmFuc2l0aW9ucyBpZiBzZXR0aW5ncyBhcmUgY2hhbmdlcy5cclxuICAgIHBsdWdpbi5zZXRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0cmFuc2l0aW9ucyA9ICggc2V0dGluZ3MuYW5pbWF0ZSApID8ge1xyXG4gICAgICAgICAgc2hvdzogc2V0dGluZ3MudHJhbnNpdGlvbkluLFxyXG4gICAgICAgICAgaGlkZTogc2V0dGluZ3MudHJhbnNpdGlvbk91dCxcclxuICAgICAgICAgIHNwZWVkOiBzZXR0aW5ncy5hbmltYXRpb25TcGVlZCxcclxuICAgICAgICAgIGNvbGxhcHNlOiBzZXR0aW5ncy50cmFuc2l0aW9uQ29sbGFwc2UsXHJcbiAgICAgICAgICB1bmNvbGxhcHNlOiBzZXR0aW5ncy50cmFuc2l0aW9uVW5jb2xsYXBzZSxcclxuICAgICAgICAgIGhhbGZTcGVlZDogc2V0dGluZ3MuYW5pbWF0aW9uU3BlZWQgLyAyXHJcbiAgICAgICAgfSA6XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc2hvdzogXCJzaG93XCIsXHJcbiAgICAgICAgICBoaWRlOiBcImhpZGVcIixcclxuICAgICAgICAgIHNwZWVkOiAwLFxyXG4gICAgICAgICAgY29sbGFwc2U6IFwiaGlkZVwiLFxyXG4gICAgICAgICAgdW5jb2xsYXBzZTogXCJzaG93XCIsXHJcbiAgICAgICAgICBoYWxmU3BlZWQ6IDBcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSB0YWJzIGFuZCBwYW5lbHMuXHJcbiAgICAvLyBDb3VsZCBiZSB1c2VkIHRvIHJlc2V0IHRhYiBhbmQgcGFuZWwgY29sbGVjdGlvbiBpZiBtYXJrdXAgaXNcclxuICAgIC8vIG1vZGlmaWVkLlxyXG4gICAgcGx1Z2luLmdldFRhYnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRtYXRjaGluZ1BhbmVsO1xyXG5cclxuICAgICAgLy8gRmluZCB0aGUgaW5pdGlhbCBzZXQgb2YgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIHNldHRpbmcudGFic1xyXG4gICAgICAvLyBDU1Mgc2VsZWN0b3Igd2l0aGluIHRoZSBjb250YWluZXJcclxuICAgICAgcGx1Z2luLnRhYnMgPSAkY29udGFpbmVyLmZpbmQoc2V0dGluZ3MudGFicyksXHJcblxyXG4gICAgICAvLyBJbnN0YW50aWF0ZSBwYW5lbHMgYXMgZW1wdHkganF1ZXJ5IG9iamVjdFxyXG4gICAgICBwbHVnaW4ucGFuZWxzID0gJCgpLFxyXG5cclxuICAgICAgcGx1Z2luLnRhYnMuZWFjaChmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciAkdGFiID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgJGEgPSAkdGFiLmNoaWxkcmVuKCdhLCBbZGF0YS1ocmVmXScpLFxyXG5cclxuICAgICAgICAgICAgLy8gdGFyZ2V0SWQgaXMgdGhlIElEIG9mIHRoZSBwYW5lbCwgd2hpY2ggaXMgZWl0aGVyIHRoZVxyXG4gICAgICAgICAgICAvLyBgaHJlZmAgYXR0cmlidXRlIGZvciBub24tYWpheCB0YWJzLCBvciBpbiB0aGVcclxuICAgICAgICAgICAgLy8gYGRhdGEtdGFyZ2V0YCBhdHRyaWJ1dGUgZm9yIGFqYXggdGFicyBzaW5jZSB0aGUgYGhyZWZgIGlzXHJcbiAgICAgICAgICAgIC8vIHRoZSBhamF4IFVSTFxyXG4gICAgICAgICAgICB0YXJnZXRJZCA9ICR0YWIuY2hpbGRyZW4oJ2EnKS5kYXRhKCd0YXJnZXQnKTtcclxuXHJcbiAgICAgICAgJHRhYi5kYXRhKCdlYXN5dGFicycsIHt9KTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHRhYiBoYXMgYSBgZGF0YS10YXJnZXRgIGF0dHJpYnV0ZSwgYW5kIGlzIHRodXMgYW4gYWpheCB0YWJcclxuICAgICAgICBpZiAoIHRhcmdldElkICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0SWQgIT09IG51bGwgKSB7XHJcbiAgICAgICAgICAkdGFiLmRhdGEoJ2Vhc3l0YWJzJykuYWpheCA9ICRhLmF0dHIoJ2hyZWYnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGFyZ2V0SWQgPSAkYS5hdHRyKCdocmVmJykgfHwgJGEuZGF0YSgnaHJlZicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0YXJnZXRJZCA9IHRhcmdldElkLm1hdGNoKC8jKFteXFw/XSspLylbMV07XHJcblxyXG4gICAgICAgICRtYXRjaGluZ1BhbmVsID0gc2V0dGluZ3MucGFuZWxDb250ZXh0LmZpbmQoXCIjXCIgKyB0YXJnZXRJZCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRhYiBoYXMgYSBtYXRjaGluZyBwYW5lbCwgYWRkIGl0IHRvIHBhbmVsc1xyXG4gICAgICAgIGlmICggJG1hdGNoaW5nUGFuZWwubGVuZ3RoICkge1xyXG5cclxuICAgICAgICAgIC8vIFN0b3JlIHBhbmVsIGhlaWdodCBiZWZvcmUgaGlkaW5nXHJcbiAgICAgICAgICAkbWF0Y2hpbmdQYW5lbC5kYXRhKCdlYXN5dGFicycsIHtcclxuICAgICAgICAgICAgcG9zaXRpb246ICRtYXRjaGluZ1BhbmVsLmNzcygncG9zaXRpb24nKSxcclxuICAgICAgICAgICAgdmlzaWJpbGl0eTogJG1hdGNoaW5nUGFuZWwuY3NzKCd2aXNpYmlsaXR5JylcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIC8vIERvbid0IGhpZGUgcGFuZWwgaWYgaXQncyBhY3RpdmUgKGFsbG93cyBgZ2V0VGFic2AgdG8gYmUgY2FsbGVkIG1hbnVhbGx5IHRvIHJlLWluc3RhbnRpYXRlIHRhYiBjb2xsZWN0aW9uKVxyXG4gICAgICAgICAgJG1hdGNoaW5nUGFuZWwubm90KHNldHRpbmdzLnBhbmVsQWN0aXZlQ2xhc3MpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICBwbHVnaW4ucGFuZWxzID0gcGx1Z2luLnBhbmVscy5hZGQoJG1hdGNoaW5nUGFuZWwpO1xyXG5cclxuICAgICAgICAgICR0YWIuZGF0YSgnZWFzeXRhYnMnKS5wYW5lbCA9ICRtYXRjaGluZ1BhbmVsO1xyXG5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIHJlbW92ZSB0YWIgZnJvbSB0YWJzIGNvbGxlY3Rpb25cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcGx1Z2luLnRhYnMgPSBwbHVnaW4udGFicy5ub3QoJHRhYik7XHJcbiAgICAgICAgICBpZiAoJ2NvbnNvbGUnIGluIHdpbmRvdykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IHRhYiB3aXRob3V0IG1hdGNoaW5nIHBhbmVsIGZvciBzZWxlY3RvciBcXCcjJyArIHRhcmdldElkICsnXFwnIHJlbW92ZWQgZnJvbSBzZXQnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZWxlY3QgdGFiIGFuZCBmaXJlIGNhbGxiYWNrXHJcbiAgICBwbHVnaW4uc2VsZWN0VGFiID0gZnVuY3Rpb24oJGNsaWNrZWQsIGNhbGxiYWNrKSB7XHJcbiAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24sXHJcbiAgICAgICAgICBoYXNoID0gdXJsLmhhc2gubWF0Y2goL15bXlxcP10qLylbMF0sXHJcbiAgICAgICAgICAkdGFyZ2V0UGFuZWwgPSAkY2xpY2tlZC5wYXJlbnQoKS5kYXRhKCdlYXN5dGFicycpLnBhbmVsLFxyXG4gICAgICAgICAgYWpheFVybCA9ICRjbGlja2VkLnBhcmVudCgpLmRhdGEoJ2Vhc3l0YWJzJykuYWpheDtcclxuXHJcbiAgICAgIC8vIFRhYiBpcyBjb2xsYXBzaWJsZSBhbmQgYWN0aXZlID0+IHRvZ2dsZSBjb2xsYXBzZWQgc3RhdGVcclxuICAgICAgaWYoIHNldHRpbmdzLmNvbGxhcHNpYmxlICYmICEgc2tpcFVwZGF0ZVRvSGFzaCAmJiAoJGNsaWNrZWQuaGFzQ2xhc3Moc2V0dGluZ3MudGFiQWN0aXZlQ2xhc3MpIHx8ICRjbGlja2VkLmhhc0NsYXNzKHNldHRpbmdzLmNvbGxhcHNlZENsYXNzKSkgKSB7XHJcbiAgICAgICAgcGx1Z2luLnRvZ2dsZVRhYkNvbGxhcHNlKCRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIGFqYXhVcmwsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgIC8vIFRhYiBpcyBub3QgYWN0aXZlIGFuZCBwYW5lbCBpcyBub3QgYWN0aXZlID0+IHNlbGVjdCB0YWJcclxuICAgICAgfSBlbHNlIGlmKCAhICRjbGlja2VkLmhhc0NsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKSB8fCAhICR0YXJnZXRQYW5lbC5oYXNDbGFzcyhzZXR0aW5ncy5wYW5lbEFjdGl2ZUNsYXNzKSApe1xyXG4gICAgICAgIGFjdGl2YXRlVGFiKCRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIGFqYXhVcmwsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgIC8vIENhY2hlIGlzIGRpc2FibGVkID0+IHJlbG9hZCAoZS5nIHJlbG9hZCBhbiBhamF4IHRhYikuXHJcbiAgICAgIH0gZWxzZSBpZiAoICEgc2V0dGluZ3MuY2FjaGUgKXtcclxuICAgICAgICBhY3RpdmF0ZVRhYigkY2xpY2tlZCwgJHRhcmdldFBhbmVsLCBhamF4VXJsLCBjYWxsYmFjayk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRvZ2dsZSB0YWIgY29sbGFwc2VkIHN0YXRlIGFuZCBmaXJlIGNhbGxiYWNrXHJcbiAgICBwbHVnaW4udG9nZ2xlVGFiQ29sbGFwc2UgPSBmdW5jdGlvbigkY2xpY2tlZCwgJHRhcmdldFBhbmVsLCBhamF4VXJsLCBjYWxsYmFjaykge1xyXG4gICAgICBwbHVnaW4ucGFuZWxzLnN0b3AodHJ1ZSx0cnVlKTtcclxuXHJcbiAgICAgIGlmKCBmaXJlKCRjb250YWluZXIsXCJlYXN5dGFiczpiZWZvcmVcIiwgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIHNldHRpbmdzXSkgKXtcclxuICAgICAgICBwbHVnaW4udGFicy5maWx0ZXIoXCIuXCIgKyBzZXR0aW5ncy50YWJBY3RpdmVDbGFzcykucmVtb3ZlQ2xhc3Moc2V0dGluZ3MudGFiQWN0aXZlQ2xhc3MpLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3Moc2V0dGluZ3MudGFiQWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBJZiBwYW5lbCBpcyBjb2xsYXBzZWQsIHVuY29sbGFwc2UgaXRcclxuICAgICAgICBpZiggJGNsaWNrZWQuaGFzQ2xhc3Moc2V0dGluZ3MuY29sbGFwc2VkQ2xhc3MpICl7XHJcblxyXG4gICAgICAgICAgLy8gSWYgYWpheCBwYW5lbCBhbmQgbm90IGFscmVhZHkgY2FjaGVkXHJcbiAgICAgICAgICBpZiggYWpheFVybCAmJiAoIXNldHRpbmdzLmNhY2hlIHx8ICEkY2xpY2tlZC5wYXJlbnQoKS5kYXRhKCdlYXN5dGFicycpLmNhY2hlZCkgKSB7XHJcbiAgICAgICAgICAgICRjb250YWluZXIudHJpZ2dlcignZWFzeXRhYnM6YWpheDpiZWZvcmVTZW5kJywgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWxdKTtcclxuXHJcbiAgICAgICAgICAgICR0YXJnZXRQYW5lbC5sb2FkKGFqYXhVcmwsIGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMsIHhocil7XHJcbiAgICAgICAgICAgICAgJGNsaWNrZWQucGFyZW50KCkuZGF0YSgnZWFzeXRhYnMnKS5jYWNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICRjb250YWluZXIudHJpZ2dlcignZWFzeXRhYnM6YWpheDpjb21wbGV0ZScsIFskY2xpY2tlZCwgJHRhcmdldFBhbmVsLCByZXNwb25zZSwgc3RhdHVzLCB4aHJdKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVXBkYXRlIENTUyBjbGFzc2VzIG9mIHRhYiBhbmQgcGFuZWxcclxuICAgICAgICAgICRjbGlja2VkLnBhcmVudCgpXHJcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcylcclxuICAgICAgICAgICAgLmFkZENsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKVxyXG4gICAgICAgICAgICAuY2hpbGRyZW4oKVxyXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcylcclxuICAgICAgICAgICAgICAuYWRkQ2xhc3Moc2V0dGluZ3MudGFiQWN0aXZlQ2xhc3MpO1xyXG5cclxuICAgICAgICAgICR0YXJnZXRQYW5lbFxyXG4gICAgICAgICAgICAuYWRkQ2xhc3Moc2V0dGluZ3MucGFuZWxBY3RpdmVDbGFzcylcclxuICAgICAgICAgICAgW3RyYW5zaXRpb25zLnVuY29sbGFwc2VdKHRyYW5zaXRpb25zLnNwZWVkLCBzZXR0aW5ncy50cmFuc2l0aW9uVW5jb2xsYXBzZUVhc2luZywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAkY29udGFpbmVyLnRyaWdnZXIoJ2Vhc3l0YWJzOm1pZFRyYW5zaXRpb24nLCBbJGNsaWNrZWQsICR0YXJnZXRQYW5lbCwgc2V0dGluZ3NdKTtcclxuICAgICAgICAgICAgICBpZih0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIE90aGVyd2lzZSwgY29sbGFwc2UgaXRcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSBDU1MgY2xhc3NlcyBvZiB0YWIgYW5kIHBhbmVsXHJcbiAgICAgICAgICAkY2xpY2tlZC5hZGRDbGFzcyhzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcylcclxuICAgICAgICAgICAgLnBhcmVudCgpXHJcbiAgICAgICAgICAgICAgLmFkZENsYXNzKHNldHRpbmdzLmNvbGxhcHNlZENsYXNzKTtcclxuXHJcbiAgICAgICAgICAkdGFyZ2V0UGFuZWxcclxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHNldHRpbmdzLnBhbmVsQWN0aXZlQ2xhc3MpXHJcbiAgICAgICAgICAgIFt0cmFuc2l0aW9ucy5jb2xsYXBzZV0odHJhbnNpdGlvbnMuc3BlZWQsIHNldHRpbmdzLnRyYW5zaXRpb25Db2xsYXBzZUVhc2luZywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAkY29udGFpbmVyLnRyaWdnZXIoXCJlYXN5dGFiczptaWRUcmFuc2l0aW9uXCIsIFskY2xpY2tlZCwgJHRhcmdldFBhbmVsLCBzZXR0aW5nc10pO1xyXG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEZpbmQgdGFiIHdpdGggdGFyZ2V0IHBhbmVsIG1hdGNoaW5nIHZhbHVlXHJcbiAgICBwbHVnaW4ubWF0Y2hUYWIgPSBmdW5jdGlvbihoYXNoKSB7XHJcbiAgICAgIHJldHVybiBwbHVnaW4udGFicy5maW5kKFwiW2hyZWY9J1wiICsgaGFzaCArIFwiJ10sW2RhdGEtdGFyZ2V0PSdcIiArIGhhc2ggKyBcIiddLFtkYXRhLWhyZWY9J1wiICsgaGFzaCArIFwiJ11cIikuZmlyc3QoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gRmluZCBwYW5lbCB3aXRoIGBpZGAgbWF0Y2hpbmcgdmFsdWVcclxuICAgIHBsdWdpbi5tYXRjaEluUGFuZWwgPSBmdW5jdGlvbihoYXNoKSB7XHJcbiAgICAgIHJldHVybiAoIGhhc2ggJiYgcGx1Z2luLnZhbGlkSWQoaGFzaCkgPyBwbHVnaW4ucGFuZWxzLmZpbHRlcignOmhhcygnICsgaGFzaCArICcpJykuZmlyc3QoKSA6IFtdICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBoYXNoIGlzIGEgdmFsaWQgaWQgdmFsdWUgKGFkbWl0dGVkbHkgc3RyaWN0IGluIHRoYXQgSFRNTDUgYWxsb3dzIGFsbW9zdCBhbnl0aGluZyB3aXRob3V0IGEgc3BhY2UpXHJcbiAgICAvLyBidXQgalF1ZXJ5IGhhcyBpc3N1ZXMgd2l0aCBzdWNoIGlkIHZhbHVlcyBhbnl3YXksIHNvIHdlIGNhbiBhZmZvcmQgdG8gYmUgc3RyaWN0IGhlcmUuXHJcbiAgICBwbHVnaW4udmFsaWRJZCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHJldHVybiBpZC5zdWJzdHIoMSkubWF0Y2goL15bQS1aYS16XVtBLVphLXowLTlcXC1fOlxcLl0qJC8pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZWxlY3QgbWF0Y2hpbmcgdGFiIHdoZW4gVVJMIGhhc2ggY2hhbmdlc1xyXG4gICAgcGx1Z2luLnNlbGVjdFRhYkZyb21IYXNoQ2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL15bXlxcP10qLylbMF0sXHJcbiAgICAgICAgICAkdGFiID0gcGx1Z2luLm1hdGNoVGFiKGhhc2gpLFxyXG4gICAgICAgICAgJHBhbmVsO1xyXG5cclxuICAgICAgaWYgKCBzZXR0aW5ncy51cGRhdGVIYXNoICkge1xyXG5cclxuICAgICAgICAvLyBJZiBoYXNoIGRpcmVjdGx5IG1hdGNoZXMgdGFiXHJcbiAgICAgICAgaWYoICR0YWIubGVuZ3RoICl7XHJcbiAgICAgICAgICBza2lwVXBkYXRlVG9IYXNoID0gdHJ1ZTtcclxuICAgICAgICAgIHBsdWdpbi5zZWxlY3RUYWIoICR0YWIgKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRwYW5lbCA9IHBsdWdpbi5tYXRjaEluUGFuZWwoaGFzaCk7XHJcblxyXG4gICAgICAgICAgLy8gSWYgcGFuZWwgY29udGFpbnMgZWxlbWVudCBtYXRjaGluZyBoYXNoXHJcbiAgICAgICAgICBpZiAoICRwYW5lbC5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgIGhhc2ggPSAnIycgKyAkcGFuZWwuYXR0cignaWQnKTtcclxuICAgICAgICAgICAgJHRhYiA9IHBsdWdpbi5tYXRjaFRhYihoYXNoKTtcclxuICAgICAgICAgICAgc2tpcFVwZGF0ZVRvSGFzaCA9IHRydWU7XHJcbiAgICAgICAgICAgIHBsdWdpbi5zZWxlY3RUYWIoICR0YWIgKTtcclxuXHJcbiAgICAgICAgICAvLyBJZiBkZWZhdWx0IHRhYiBpcyBub3QgYWN0aXZlLi4uXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCAhICRkZWZhdWx0VGFiLmhhc0NsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKSAmJiAhIHNldHRpbmdzLmN5Y2xlICkge1xyXG5cclxuICAgICAgICAgICAgLy8gLi4uYW5kIGhhc2ggaXMgYmxhbmsgb3IgbWF0Y2hlcyBhIHBhcmVudCBvZiB0aGUgdGFiIGNvbnRhaW5lciBvclxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgbGFzdCB0YWIgKGJlZm9yZSB0aGUgaGFzaCB1cGRhdGVkKSB3YXMgb25lIG9mIHRoZSBvdGhlciB0YWJzIGluIHRoaXMgY29udGFpbmVyLlxyXG4gICAgICAgICAgICBpZiAoIGhhc2ggPT09ICcnIHx8IHBsdWdpbi5tYXRjaFRhYihsYXN0SGFzaCkubGVuZ3RoIHx8ICRjb250YWluZXIuY2xvc2VzdChoYXNoKS5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgICAgc2tpcFVwZGF0ZVRvSGFzaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcGx1Z2luLnNlbGVjdFRhYiggJGRlZmF1bHRUYWJMaW5rICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3ljbGUgdGhyb3VnaCB0YWJzXHJcbiAgICBwbHVnaW4uY3ljbGVUYWJzID0gZnVuY3Rpb24odGFiTnVtYmVyKXtcclxuICAgICAgaWYoc2V0dGluZ3MuY3ljbGUpe1xyXG4gICAgICAgIHRhYk51bWJlciA9IHRhYk51bWJlciAlIHBsdWdpbi50YWJzLmxlbmd0aDtcclxuICAgICAgICAkdGFiID0gJCggcGx1Z2luLnRhYnNbdGFiTnVtYmVyXSApLmNoaWxkcmVuKFwiYVwiKS5maXJzdCgpO1xyXG4gICAgICAgIHNraXBVcGRhdGVUb0hhc2ggPSB0cnVlO1xyXG4gICAgICAgIHBsdWdpbi5zZWxlY3RUYWIoICR0YWIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBwbHVnaW4uY3ljbGVUYWJzKHRhYk51bWJlciArIDEpOyB9LCBzZXR0aW5ncy5jeWNsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQ29udmVuaWVudCBwdWJsaWMgbWV0aG9kc1xyXG4gICAgcGx1Z2luLnB1YmxpY01ldGhvZHMgPSB7XHJcbiAgICAgIHNlbGVjdDogZnVuY3Rpb24odGFiU2VsZWN0b3Ipe1xyXG4gICAgICAgIHZhciAkdGFiO1xyXG5cclxuICAgICAgICAvLyBGaW5kIHRhYiBjb250YWluZXIgdGhhdCBtYXRjaGVzIHNlbGVjdG9yIChsaWtlICdsaSN0YWItb25lJyB3aGljaCBjb250YWlucyB0YWIgbGluaylcclxuICAgICAgICBpZiAoICgkdGFiID0gcGx1Z2luLnRhYnMuZmlsdGVyKHRhYlNlbGVjdG9yKSkubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgIC8vIEZpbmQgZGlyZWN0IHRhYiBsaW5rIHRoYXQgbWF0Y2hlcyBocmVmIChsaWtlICdhW2hyZWY9XCIjcGFuZWwtMVwiXScpXHJcbiAgICAgICAgICBpZiAoICgkdGFiID0gcGx1Z2luLnRhYnMuZmluZChcImFbaHJlZj0nXCIgKyB0YWJTZWxlY3RvciArIFwiJ10sIFtkYXRhLWhyZWY9J1wiICsgdGFiU2VsZWN0b3IgKyBcIiddXCIpKS5sZW5ndGggPT09IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBGaW5kIGRpcmVjdCB0YWIgbGluayB0aGF0IG1hdGNoZXMgc2VsZWN0b3IgKGxpa2UgJ2EjdGFiLTEnKVxyXG4gICAgICAgICAgICBpZiAoICgkdGFiID0gcGx1Z2luLnRhYnMuZmluZChcImFcIiArIHRhYlNlbGVjdG9yKSkubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBGaW5kIGRpcmVjdCB0YWIgbGluayB0aGF0IG1hdGNoZXMgZGF0YS10YXJnZXQgKGxpayAnYVtkYXRhLXRhcmdldD1cIiNwYW5lbC0xXCJdJylcclxuICAgICAgICAgICAgICBpZiAoICgkdGFiID0gcGx1Z2luLnRhYnMuZmluZChcIltkYXRhLXRhcmdldD0nXCIgKyB0YWJTZWxlY3RvciArIFwiJ11cIikpLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGRpcmVjdCB0YWIgbGluayB0aGF0IGVuZHMgaW4gdGhlIG1hdGNoaW5nIGhyZWYgKGxpa2UgJ2FbaHJlZiQ9XCIjcGFuZWwtMVwiXScsIHdoaWNoIHdvdWxkIGFsc28gbWF0Y2ggaHR0cDovL2V4YW1wbGUuY29tL2N1cnJlbnRwYWdlLyNwYW5lbC0xKVxyXG4gICAgICAgICAgICAgICAgaWYgKCAoJHRhYiA9IHBsdWdpbi50YWJzLmZpbmQoXCJhW2hyZWYkPSdcIiArIHRhYlNlbGVjdG9yICsgXCInXVwiKSkubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgJC5lcnJvcignVGFiIFxcJycgKyB0YWJTZWxlY3RvciArICdcXCcgZG9lcyBub3QgZXhpc3QgaW4gdGFiIHNldCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBTZWxlY3QgdGhlIGNoaWxkIHRhYiBsaW5rLCBzaW5jZSB0aGUgZmlyc3Qgb3B0aW9uIGZpbmRzIHRoZSB0YWIgY29udGFpbmVyIChsaWtlIDxsaT4pXHJcbiAgICAgICAgICAkdGFiID0gJHRhYi5jaGlsZHJlbihcImEsIFtkYXRhLWhyZWZdXCIpLmZpcnN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBsdWdpbi5zZWxlY3RUYWIoJHRhYik7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICAvLyBUcmlnZ2VycyBhbiBldmVudCBvbiBhbiBlbGVtZW50IGFuZCByZXR1cm5zIHRoZSBldmVudCByZXN1bHRcclxuICAgIHZhciBmaXJlID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBkYXRhKSB7XHJcbiAgICAgIHZhciBldmVudCA9ICQuRXZlbnQobmFtZSk7XHJcbiAgICAgIG9iai50cmlnZ2VyKGV2ZW50LCBkYXRhKTtcclxuICAgICAgcmV0dXJuIGV2ZW50LnJlc3VsdCAhPT0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIENTUyBjbGFzc2VzIHRvIG1hcmt1cCAoaWYgc3BlY2lmaWVkKSwgY2FsbGVkIGJ5IGluaXRcclxuICAgIHZhciBhZGRDbGFzc2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRjb250YWluZXIuYWRkQ2xhc3Moc2V0dGluZ3MuY29udGFpbmVyQ2xhc3MpO1xyXG4gICAgICBwbHVnaW4udGFicy5wYXJlbnQoKS5hZGRDbGFzcyhzZXR0aW5ncy50YWJzQ2xhc3MpO1xyXG4gICAgICBwbHVnaW4udGFicy5hZGRDbGFzcyhzZXR0aW5ncy50YWJDbGFzcyk7XHJcbiAgICAgIHBsdWdpbi5wYW5lbHMuYWRkQ2xhc3Moc2V0dGluZ3MucGFuZWxDbGFzcyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldCB0aGUgZGVmYXVsdCB0YWIsIHdoZXRoZXIgZnJvbSBoYXNoIChib29rbWFya2VkKSBvciBvcHRpb24sXHJcbiAgICAvLyBjYWxsZWQgYnkgaW5pdFxyXG4gICAgdmFyIHNldERlZmF1bHRUYWIgPSBmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLm1hdGNoKC9eW15cXD9dKi8pWzBdLFxyXG4gICAgICAgICAgJHNlbGVjdGVkVGFiID0gcGx1Z2luLm1hdGNoVGFiKGhhc2gpLnBhcmVudCgpLFxyXG4gICAgICAgICAgJHBhbmVsO1xyXG5cclxuICAgICAgLy8gSWYgaGFzaCBkaXJlY3RseSBtYXRjaGVzIG9uZSBvZiB0aGUgdGFicywgYWN0aXZlIG9uIHBhZ2UtbG9hZFxyXG4gICAgICBpZiggJHNlbGVjdGVkVGFiLmxlbmd0aCA9PT0gMSApe1xyXG4gICAgICAgICRkZWZhdWx0VGFiID0gJHNlbGVjdGVkVGFiO1xyXG4gICAgICAgIHNldHRpbmdzLmN5Y2xlID0gZmFsc2U7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRwYW5lbCA9IHBsdWdpbi5tYXRjaEluUGFuZWwoaGFzaCk7XHJcblxyXG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgcGFuZWxzIGNvbnRhaW5zIHRoZSBlbGVtZW50IG1hdGNoaW5nIHRoZSBoYXNoLFxyXG4gICAgICAgIC8vIG1ha2UgaXQgYWN0aXZlIG9uIHBhZ2UtbG9hZFxyXG4gICAgICAgIGlmICggJHBhbmVsLmxlbmd0aCApIHtcclxuICAgICAgICAgIGhhc2ggPSAnIycgKyAkcGFuZWwuYXR0cignaWQnKTtcclxuICAgICAgICAgICRkZWZhdWx0VGFiID0gcGx1Z2luLm1hdGNoVGFiKGhhc2gpLnBhcmVudCgpO1xyXG5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIG1ha2UgdGhlIGRlZmF1bHQgdGFiIHRoZSBvbmUgdGhhdCdzIGFjdGl2ZSBvbiBwYWdlLWxvYWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGRlZmF1bHRUYWIgPSBwbHVnaW4udGFicy5wYXJlbnQoKS5maW5kKHNldHRpbmdzLmRlZmF1bHRUYWIpO1xyXG4gICAgICAgICAgaWYgKCAkZGVmYXVsdFRhYi5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAgICQuZXJyb3IoXCJUaGUgc3BlY2lmaWVkIGRlZmF1bHQgdGFiICgnXCIgKyBzZXR0aW5ncy5kZWZhdWx0VGFiICsgXCInKSBjb3VsZCBub3QgYmUgZm91bmQgaW4gdGhlIHRhYiBzZXQgKCdcIiArIHNldHRpbmdzLnRhYnMgKyBcIicpIG91dCBvZiBcIiArIHBsdWdpbi50YWJzLmxlbmd0aCArIFwiIHRhYnMuXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJGRlZmF1bHRUYWJMaW5rID0gJGRlZmF1bHRUYWIuY2hpbGRyZW4oXCJhXCIpLmZpcnN0KCk7XHJcblxyXG4gICAgICBhY3RpdmF0ZURlZmF1bHRUYWIoJHNlbGVjdGVkVGFiKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWN0aXZhdGUgZGVmYXVsdFRhYiAob3IgY29sbGFwc2UgYnkgZGVmYXVsdCksIGNhbGxlZCBieSBzZXREZWZhdWx0VGFiXHJcbiAgICB2YXIgYWN0aXZhdGVEZWZhdWx0VGFiID0gZnVuY3Rpb24oJHNlbGVjdGVkVGFiKSB7XHJcbiAgICAgIHZhciBkZWZhdWx0UGFuZWwsXHJcbiAgICAgICAgICBkZWZhdWx0QWpheFVybDtcclxuXHJcbiAgICAgIGlmICggc2V0dGluZ3MuY29sbGFwc2libGUgJiYgJHNlbGVjdGVkVGFiLmxlbmd0aCA9PT0gMCAmJiBzZXR0aW5ncy5jb2xsYXBzZWRCeURlZmF1bHQgKSB7XHJcbiAgICAgICAgJGRlZmF1bHRUYWJcclxuICAgICAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcylcclxuICAgICAgICAgIC5jaGlsZHJlbigpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcyk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBkZWZhdWx0UGFuZWwgPSAkKCAkZGVmYXVsdFRhYi5kYXRhKCdlYXN5dGFicycpLnBhbmVsICk7XHJcbiAgICAgICAgZGVmYXVsdEFqYXhVcmwgPSAkZGVmYXVsdFRhYi5kYXRhKCdlYXN5dGFicycpLmFqYXg7XHJcblxyXG4gICAgICAgIGlmICggZGVmYXVsdEFqYXhVcmwgJiYgKCFzZXR0aW5ncy5jYWNoZSB8fCAhJGRlZmF1bHRUYWIuZGF0YSgnZWFzeXRhYnMnKS5jYWNoZWQpICkge1xyXG4gICAgICAgICAgJGNvbnRhaW5lci50cmlnZ2VyKCdlYXN5dGFiczphamF4OmJlZm9yZVNlbmQnLCBbJGRlZmF1bHRUYWJMaW5rLCBkZWZhdWx0UGFuZWxdKTtcclxuICAgICAgICAgIGRlZmF1bHRQYW5lbC5sb2FkKGRlZmF1bHRBamF4VXJsLCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzLCB4aHIpe1xyXG4gICAgICAgICAgICAkZGVmYXVsdFRhYi5kYXRhKCdlYXN5dGFicycpLmNhY2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICRjb250YWluZXIudHJpZ2dlcignZWFzeXRhYnM6YWpheDpjb21wbGV0ZScsIFskZGVmYXVsdFRhYkxpbmssIGRlZmF1bHRQYW5lbCwgcmVzcG9uc2UsIHN0YXR1cywgeGhyXSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRkZWZhdWx0VGFiLmRhdGEoJ2Vhc3l0YWJzJykucGFuZWxcclxuICAgICAgICAgIC5zaG93KClcclxuICAgICAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy5wYW5lbEFjdGl2ZUNsYXNzKTtcclxuXHJcbiAgICAgICAgJGRlZmF1bHRUYWJcclxuICAgICAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy50YWJBY3RpdmVDbGFzcylcclxuICAgICAgICAgIC5jaGlsZHJlbigpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcyhzZXR0aW5ncy50YWJBY3RpdmVDbGFzcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZpcmUgZXZlbnQgd2hlbiB0aGUgcGx1Z2luIGlzIGluaXRpYWxpc2VkXHJcbiAgICAgICRjb250YWluZXIudHJpZ2dlcihcImVhc3l0YWJzOmluaXRpYWxpc2VkXCIsIFskZGVmYXVsdFRhYkxpbmssIGRlZmF1bHRQYW5lbF0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBCaW5kIHRhYi1zZWxlY3QgZnVudGlvbmFsaXR5IHRvIG5hbWVzcGFjZWQgY2xpY2sgZXZlbnQsIGNhbGxlZCBieVxyXG4gICAgLy8gaW5pdFxyXG4gICAgdmFyIGJpbmRUb1RhYkNsaWNrcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBwbHVnaW4udGFicy5jaGlsZHJlbihcImEsIFtkYXRhLWhyZWZdXCIpLmJpbmQoc2V0dGluZ3MuYmluZF9zdHIsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgLy8gU3RvcCBjeWNsaW5nIHdoZW4gYSB0YWIgaXMgY2xpY2tlZFxyXG4gICAgICAgIHNldHRpbmdzLmN5Y2xlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIEhhc2ggd2lsbCBiZSB1cGRhdGVkIHdoZW4gdGFiIGlzIGNsaWNrZWQsXHJcbiAgICAgICAgLy8gZG9uJ3QgY2F1c2UgdGFiIHRvIHJlLXNlbGVjdCB3aGVuIGhhc2gtY2hhbmdlIGV2ZW50IGlzIGZpcmVkXHJcbiAgICAgICAgc2tpcFVwZGF0ZVRvSGFzaCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBTZWxlY3QgdGhlIHBhbmVsIGZvciB0aGUgY2xpY2tlZCB0YWJcclxuICAgICAgICBwbHVnaW4uc2VsZWN0VGFiKCAkKHRoaXMpICk7XHJcblxyXG4gICAgICAgIC8vIERvbid0IGZvbGxvdyB0aGUgbGluayB0byB0aGUgYW5jaG9yXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA/IGUucHJldmVudERlZmF1bHQoKSA6IGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFjdGl2YXRlIGEgZ2l2ZW4gdGFiL3BhbmVsLCBjYWxsZWQgZnJvbSBwbHVnaW4uc2VsZWN0VGFiOlxyXG4gICAgLy9cclxuICAgIC8vICAgKiBmaXJlIGBlYXN5dGFiczpiZWZvcmVgIGhvb2tcclxuICAgIC8vICAgKiBnZXQgYWpheCBpZiBuZXcgdGFiIGlzIGFuIHVuY2FjaGVkIGFqYXggdGFiXHJcbiAgICAvLyAgICogYW5pbWF0ZSBvdXQgcHJldmlvdXNseS1hY3RpdmUgcGFuZWxcclxuICAgIC8vICAgKiBmaXJlIGBlYXN5dGFiczptaWRUcmFuc2l0aW9uYCBob29rXHJcbiAgICAvLyAgICogdXBkYXRlIFVSTCBoYXNoXHJcbiAgICAvLyAgICogYW5pbWF0ZSBpbiBuZXdseS1hY3RpdmUgcGFuZWxcclxuICAgIC8vICAgKiB1cGRhdGUgQ1NTIGNsYXNzZXMgZm9yIGluYWN0aXZlIGFuZCBhY3RpdmUgdGFicy9wYW5lbHNcclxuICAgIC8vXHJcbiAgICAvLyBUT0RPOiBUaGlzIGNvdWxkIHByb2JhYmx5IGJlIGJyb2tlbiBvdXQgaW50byBtYW55IG1vcmUgbW9kdWxhclxyXG4gICAgLy8gZnVuY3Rpb25zXHJcbiAgICB2YXIgYWN0aXZhdGVUYWIgPSBmdW5jdGlvbigkY2xpY2tlZCwgJHRhcmdldFBhbmVsLCBhamF4VXJsLCBjYWxsYmFjaykge1xyXG4gICAgICBwbHVnaW4ucGFuZWxzLnN0b3AodHJ1ZSx0cnVlKTtcclxuXHJcbiAgICAgIGlmKCBmaXJlKCRjb250YWluZXIsXCJlYXN5dGFiczpiZWZvcmVcIiwgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIHNldHRpbmdzXSkgKXtcclxuICAgICAgICB2YXIgJHZpc2libGVQYW5lbCA9IHBsdWdpbi5wYW5lbHMuZmlsdGVyKFwiOnZpc2libGVcIiksXHJcbiAgICAgICAgICAgICRwYW5lbENvbnRhaW5lciA9ICR0YXJnZXRQYW5lbC5wYXJlbnQoKSxcclxuICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0LFxyXG4gICAgICAgICAgICB2aXNpYmxlSGVpZ2h0LFxyXG4gICAgICAgICAgICBoZWlnaHREaWZmZXJlbmNlLFxyXG4gICAgICAgICAgICBzaG93UGFuZWwsXHJcbiAgICAgICAgICAgIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5tYXRjaCgvXlteXFw/XSovKVswXTtcclxuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLmFuaW1hdGUpIHtcclxuICAgICAgICAgIHRhcmdldEhlaWdodCA9IGdldEhlaWdodEZvckhpZGRlbigkdGFyZ2V0UGFuZWwpO1xyXG4gICAgICAgICAgdmlzaWJsZUhlaWdodCA9ICR2aXNpYmxlUGFuZWwubGVuZ3RoID8gc2V0QW5kUmV0dXJuSGVpZ2h0KCR2aXNpYmxlUGFuZWwpIDogMDtcclxuICAgICAgICAgIGhlaWdodERpZmZlcmVuY2UgPSB0YXJnZXRIZWlnaHQgLSB2aXNpYmxlSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IGxhc3RIYXNoIHRvIGhlbHAgaW5kaWNhdGUgaWYgZGVmYXVsdFRhYiBzaG91bGQgYmVcclxuICAgICAgICAvLyBhY3RpdmF0ZWQgYWNyb3NzIG11bHRpcGxlIHRhYiBpbnN0YW5jZXMuXHJcbiAgICAgICAgbGFzdEhhc2ggPSBoYXNoO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgZnVuY3Rpb24gZWxzZXdoZXJlXHJcbiAgICAgICAgc2hvd1BhbmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcHJldmlvdXMgcGFuZWwgaXMgaGlkZGVuLCBhbmQgdGhlIG5ldyBvbmUgd2lsbCBiZSBzZWxlY3RlZFxyXG4gICAgICAgICAgJGNvbnRhaW5lci50cmlnZ2VyKFwiZWFzeXRhYnM6bWlkVHJhbnNpdGlvblwiLCBbJGNsaWNrZWQsICR0YXJnZXRQYW5lbCwgc2V0dGluZ3NdKTtcclxuXHJcbiAgICAgICAgICAvLyBHcmFjZWZ1bGx5IGFuaW1hdGUgYmV0d2VlbiBwYW5lbHMgb2YgZGlmZmVyaW5nIGhlaWdodHMsIHN0YXJ0IGhlaWdodCBjaGFuZ2UgYW5pbWF0aW9uICphZnRlciogcGFuZWwgY2hhbmdlIGlmIHBhbmVsIG5lZWRzIHRvIGNvbnRyYWN0LFxyXG4gICAgICAgICAgLy8gc28gdGhhdCB0aGVyZSBpcyBubyBjaGFuY2Ugb2YgbWFraW5nIHRoZSB2aXNpYmxlIHBhbmVsIG92ZXJmbG93aW5nIHRoZSBoZWlnaHQgb2YgdGhlIHRhcmdldCBwYW5lbFxyXG4gICAgICAgICAgaWYgKHNldHRpbmdzLmFuaW1hdGUgJiYgc2V0dGluZ3MudHJhbnNpdGlvbkluID09ICdmYWRlSW4nKSB7XHJcbiAgICAgICAgICAgIGlmIChoZWlnaHREaWZmZXJlbmNlIDwgMClcclxuICAgICAgICAgICAgICAkcGFuZWxDb250YWluZXIuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICRwYW5lbENvbnRhaW5lci5oZWlnaHQoKSArIGhlaWdodERpZmZlcmVuY2VcclxuICAgICAgICAgICAgICB9LCB0cmFuc2l0aW9ucy5oYWxmU3BlZWQgKS5jc3MoeyAnbWluLWhlaWdodCc6ICcnIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggc2V0dGluZ3MudXBkYXRlSGFzaCAmJiAhIHNraXBVcGRhdGVUb0hhc2ggKSB7XHJcbiAgICAgICAgICAgIC8vd2luZG93LmxvY2F0aW9uID0gdXJsLnRvU3RyaW5nKCkucmVwbGFjZSgodXJsLnBhdGhuYW1lICsgaGFzaCksICh1cmwucGF0aG5hbWUgKyAkY2xpY2tlZC5hdHRyKFwiaHJlZlwiKSkpO1xyXG4gICAgICAgICAgICAvLyBOb3Qgc3VyZSB3aHkgdGhpcyBiZWhhdmVzIHNvIGRpZmZlcmVudGx5LCBidXQgaXQncyBtb3JlIHN0cmFpZ2h0IGZvcndhcmQgYW5kIHNlZW1zIHRvIGhhdmUgbGVzcyBzaWRlLWVmZmVjdHNcclxuXHRcdFx0XHRcdFx0aWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCAnIycgKyAkdGFyZ2V0UGFuZWwuYXR0cignaWQnKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIycgKyAkdGFyZ2V0UGFuZWwuYXR0cignaWQnKTtcclxuXHRcdFx0XHRcdFx0fVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2tpcFVwZGF0ZVRvSGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICR0YXJnZXRQYW5lbFxyXG4gICAgICAgICAgICBbdHJhbnNpdGlvbnMuc2hvd10odHJhbnNpdGlvbnMuc3BlZWQsIHNldHRpbmdzLnRyYW5zaXRpb25JbkVhc2luZywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAkcGFuZWxDb250YWluZXIuY3NzKHtoZWlnaHQ6ICcnLCAnbWluLWhlaWdodCc6ICcnfSk7IC8vIEFmdGVyIHRoZSB0cmFuc2l0aW9uLCB1bnNldCB0aGUgaGVpZ2h0XHJcbiAgICAgICAgICAgICAgJGNvbnRhaW5lci50cmlnZ2VyKFwiZWFzeXRhYnM6YWZ0ZXJcIiwgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIHNldHRpbmdzXSk7XHJcbiAgICAgICAgICAgICAgLy8gY2FsbGJhY2sgb25seSBnZXRzIGNhbGxlZCBpZiBzZWxlY3RUYWIgYWN0dWFsbHkgZG9lcyBzb21ldGhpbmcsIHNpbmNlIGl0J3MgaW5zaWRlIHRoZSBpZiBibG9ja1xyXG4gICAgICAgICAgICAgIGlmKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKXtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKCBhamF4VXJsICYmICghc2V0dGluZ3MuY2FjaGUgfHwgISRjbGlja2VkLnBhcmVudCgpLmRhdGEoJ2Vhc3l0YWJzJykuY2FjaGVkKSApIHtcclxuICAgICAgICAgICRjb250YWluZXIudHJpZ2dlcignZWFzeXRhYnM6YWpheDpiZWZvcmVTZW5kJywgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWxdKTtcclxuICAgICAgICAgICR0YXJnZXRQYW5lbC5sb2FkKGFqYXhVcmwsIGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMsIHhocil7XHJcbiAgICAgICAgICAgICRjbGlja2VkLnBhcmVudCgpLmRhdGEoJ2Vhc3l0YWJzJykuY2FjaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgJGNvbnRhaW5lci50cmlnZ2VyKCdlYXN5dGFiczphamF4OmNvbXBsZXRlJywgWyRjbGlja2VkLCAkdGFyZ2V0UGFuZWwsIHJlc3BvbnNlLCBzdGF0dXMsIHhocl0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBHcmFjZWZ1bGx5IGFuaW1hdGUgYmV0d2VlbiBwYW5lbHMgb2YgZGlmZmVyaW5nIGhlaWdodHMsIHN0YXJ0IGhlaWdodCBjaGFuZ2UgYW5pbWF0aW9uICpiZWZvcmUqIHBhbmVsIGNoYW5nZSBpZiBwYW5lbCBuZWVkcyB0byBleHBhbmQsXHJcbiAgICAgICAgLy8gc28gdGhhdCB0aGVyZSBpcyBubyBjaGFuY2Ugb2YgbWFraW5nIHRoZSB0YXJnZXQgcGFuZWwgb3ZlcmZsb3dpbmcgdGhlIGhlaWdodCBvZiB0aGUgdmlzaWJsZSBwYW5lbFxyXG4gICAgICAgIGlmKCBzZXR0aW5ncy5hbmltYXRlICYmIHNldHRpbmdzLnRyYW5zaXRpb25PdXQgPT0gJ2ZhZGVPdXQnICkge1xyXG4gICAgICAgICAgaWYoIGhlaWdodERpZmZlcmVuY2UgPiAwICkge1xyXG4gICAgICAgICAgICAkcGFuZWxDb250YWluZXIuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAoICRwYW5lbENvbnRhaW5lci5oZWlnaHQoKSArIGhlaWdodERpZmZlcmVuY2UgKVxyXG4gICAgICAgICAgICB9LCB0cmFuc2l0aW9ucy5oYWxmU3BlZWQgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgaGVpZ2h0IGp1bXBpbmcgYmVmb3JlIGhlaWdodCB0cmFuc2l0aW9uIGlzIHRyaWdnZXJlZCBhdCBtaWRUcmFuc2l0aW9uXHJcbiAgICAgICAgICAgICRwYW5lbENvbnRhaW5lci5jc3MoeyAnbWluLWhlaWdodCc6ICRwYW5lbENvbnRhaW5lci5oZWlnaHQoKSB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoYW5nZSB0aGUgYWN0aXZlIHRhYiAqZmlyc3QqIHRvIHByb3ZpZGUgaW1tZWRpYXRlIGZlZWRiYWNrIHdoZW4gdGhlIHVzZXIgY2xpY2tzXHJcbiAgICAgICAgcGx1Z2luLnRhYnMuZmlsdGVyKFwiLlwiICsgc2V0dGluZ3MudGFiQWN0aXZlQ2xhc3MpLnJlbW92ZUNsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKS5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKTtcclxuICAgICAgICBwbHVnaW4udGFicy5maWx0ZXIoXCIuXCIgKyBzZXR0aW5ncy5jb2xsYXBzZWRDbGFzcykucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuY29sbGFwc2VkQ2xhc3MpLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuY29sbGFwc2VkQ2xhc3MpO1xyXG4gICAgICAgICRjbGlja2VkLnBhcmVudCgpLmFkZENsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKS5jaGlsZHJlbigpLmFkZENsYXNzKHNldHRpbmdzLnRhYkFjdGl2ZUNsYXNzKTtcclxuXHJcbiAgICAgICAgcGx1Z2luLnBhbmVscy5maWx0ZXIoXCIuXCIgKyBzZXR0aW5ncy5wYW5lbEFjdGl2ZUNsYXNzKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5wYW5lbEFjdGl2ZUNsYXNzKTtcclxuICAgICAgICAkdGFyZ2V0UGFuZWwuYWRkQ2xhc3Moc2V0dGluZ3MucGFuZWxBY3RpdmVDbGFzcyk7XHJcblxyXG4gICAgICAgIGlmKCAkdmlzaWJsZVBhbmVsLmxlbmd0aCApIHtcclxuICAgICAgICAgICR2aXNpYmxlUGFuZWxcclxuICAgICAgICAgICAgW3RyYW5zaXRpb25zLmhpZGVdKHRyYW5zaXRpb25zLnNwZWVkLCBzZXR0aW5ncy50cmFuc2l0aW9uT3V0RWFzaW5nLCBzaG93UGFuZWwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkdGFyZ2V0UGFuZWxcclxuICAgICAgICAgICAgW3RyYW5zaXRpb25zLnVuY29sbGFwc2VdKHRyYW5zaXRpb25zLnNwZWVkLCBzZXR0aW5ncy50cmFuc2l0aW9uVW5jb2xsYXBzZUVhc2luZywgc2hvd1BhbmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gR2V0IGhlaWdodHMgb2YgcGFuZWxzIHRvIGVuYWJsZSBhbmltYXRpb24gYmV0d2VlbiBwYW5lbHMgb2ZcclxuICAgIC8vIGRpZmZlcmluZyBoZWlnaHRzLCBjYWxsZWQgYnkgYWN0aXZhdGVUYWJcclxuICAgIHZhciBnZXRIZWlnaHRGb3JIaWRkZW4gPSBmdW5jdGlvbigkdGFyZ2V0UGFuZWwpe1xyXG5cclxuICAgICAgaWYgKCAkdGFyZ2V0UGFuZWwuZGF0YSgnZWFzeXRhYnMnKSAmJiAkdGFyZ2V0UGFuZWwuZGF0YSgnZWFzeXRhYnMnKS5sYXN0SGVpZ2h0ICkge1xyXG4gICAgICAgIHJldHVybiAkdGFyZ2V0UGFuZWwuZGF0YSgnZWFzeXRhYnMnKS5sYXN0SGVpZ2h0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IHByb3BlcnR5IGVhc3l0YWJzIGNoYW5nZXMsIHNvIHdlIG5lZWQgdG8gZ3JhYiBpdHMgdmFsdWUgb24gZWFjaCB0YWIgY2hhbmdlXHJcbiAgICAgIHZhciBkaXNwbGF5ID0gJHRhcmdldFBhbmVsLmNzcygnZGlzcGxheScpLFxyXG4gICAgICAgICAgb3V0ZXJDbG9hayxcclxuICAgICAgICAgIGhlaWdodDtcclxuXHJcbiAgICAgIC8vIFdvcmthcm91bmQgd2l0aCB3cmFwcGluZyBoZWlnaHQsIGJlY2F1c2UgZmlyZWZveCByZXR1cm5zIHdyb25nXHJcbiAgICAgIC8vIGhlaWdodCBpZiBlbGVtZW50IGl0c2VsZiBoYXMgYWJzb2x1dGUgcG9zaXRpb25pbmcuXHJcbiAgICAgIC8vIGJ1dCB0cnkvY2F0Y2ggYmxvY2sgbmVlZGVkIGZvciBJRTcgYW5kIElFOCBiZWNhdXNlIHRoZXkgdGhyb3dcclxuICAgICAgLy8gYW4gXCJVbnNwZWNpZmllZCBlcnJvclwiIHdoZW4gdHJ5aW5nIHRvIGNyZWF0ZSBhbiBlbGVtZW50XHJcbiAgICAgIC8vIHdpdGggdGhlIGNzcyBwb3NpdGlvbiBzZXQuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgb3V0ZXJDbG9hayA9ICQoJzxkaXY+PC9kaXY+Jywgeydwb3NpdGlvbic6ICdhYnNvbHV0ZScsICd2aXNpYmlsaXR5JzogJ2hpZGRlbicsICdvdmVyZmxvdyc6ICdoaWRkZW4nfSk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBvdXRlckNsb2FrID0gJCgnPGRpdj48L2Rpdj4nLCB7J3Zpc2liaWxpdHknOiAnaGlkZGVuJywgJ292ZXJmbG93JzogJ2hpZGRlbid9KTtcclxuICAgICAgfVxyXG4gICAgICBoZWlnaHQgPSAkdGFyZ2V0UGFuZWxcclxuICAgICAgICAud3JhcChvdXRlckNsb2FrKVxyXG4gICAgICAgIC5jc3Moeydwb3NpdGlvbic6J3JlbGF0aXZlJywndmlzaWJpbGl0eSc6J2hpZGRlbicsJ2Rpc3BsYXknOidibG9jayd9KVxyXG4gICAgICAgIC5vdXRlckhlaWdodCgpO1xyXG5cclxuICAgICAgJHRhcmdldFBhbmVsLnVud3JhcCgpO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIGVsZW1lbnQgdG8gcHJldmlvdXMgc3RhdGVcclxuICAgICAgJHRhcmdldFBhbmVsLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246ICR0YXJnZXRQYW5lbC5kYXRhKCdlYXN5dGFicycpLnBvc2l0aW9uLFxyXG4gICAgICAgIHZpc2liaWxpdHk6ICR0YXJnZXRQYW5lbC5kYXRhKCdlYXN5dGFicycpLnZpc2liaWxpdHksXHJcbiAgICAgICAgZGlzcGxheTogZGlzcGxheVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENhY2hlIGhlaWdodFxyXG4gICAgICAkdGFyZ2V0UGFuZWwuZGF0YSgnZWFzeXRhYnMnKS5sYXN0SGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gU2luY2UgdGhlIGhlaWdodCBvZiB0aGUgdmlzaWJsZSBwYW5lbCBtYXkgaGF2ZSBiZWVuIG1hbmlwdWxhdGVkIGR1ZSB0byBpbnRlcmFjdGlvbixcclxuICAgIC8vIHdlIHdhbnQgdG8gcmUtY2FjaGUgdGhlIHZpc2libGUgaGVpZ2h0IG9uIGVhY2ggdGFiIGNoYW5nZSwgY2FsbGVkXHJcbiAgICAvLyBieSBhY3RpdmF0ZVRhYlxyXG4gICAgdmFyIHNldEFuZFJldHVybkhlaWdodCA9IGZ1bmN0aW9uKCR2aXNpYmxlUGFuZWwpIHtcclxuICAgICAgdmFyIGhlaWdodCA9ICR2aXNpYmxlUGFuZWwub3V0ZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgIGlmKCAkdmlzaWJsZVBhbmVsLmRhdGEoJ2Vhc3l0YWJzJykgKSB7XHJcbiAgICAgICAgJHZpc2libGVQYW5lbC5kYXRhKCdlYXN5dGFicycpLmxhc3RIZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHZpc2libGVQYW5lbC5kYXRhKCdlYXN5dGFicycsIHtsYXN0SGVpZ2h0OiBoZWlnaHR9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXR1cCBoYXNoLWNoYW5nZSBjYWxsYmFjayBmb3IgZm9yd2FyZC0gYW5kIGJhY2stYnV0dG9uXHJcbiAgICAvLyBmdW5jdGlvbmFsaXR5LCBjYWxsZWQgYnkgaW5pdFxyXG4gICAgdmFyIGluaXRIYXNoQ2hhbmdlID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgIC8vIGVuYWJsaW5nIGJhY2stYnV0dG9uIHdpdGgganF1ZXJ5Lmhhc2hjaGFuZ2UgcGx1Z2luXHJcbiAgICAgIC8vIGh0dHA6Ly9iZW5hbG1hbi5jb20vcHJvamVjdHMvanF1ZXJ5LWhhc2hjaGFuZ2UtcGx1Z2luL1xyXG4gICAgICBpZih0eXBlb2YgJCh3aW5kb3cpLmhhc2hjaGFuZ2UgPT09ICdmdW5jdGlvbicpe1xyXG4gICAgICAgICQod2luZG93KS5oYXNoY2hhbmdlKCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgcGx1Z2luLnNlbGVjdFRhYkZyb21IYXNoQ2hhbmdlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJC5hZGRyZXNzICYmIHR5cGVvZiAkLmFkZHJlc3MuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7IC8vIGJhY2stYnV0dG9uIHdpdGgganF1ZXJ5LmFkZHJlc3MgcGx1Z2luIGh0dHA6Ly93d3cuYXN1YWwuY29tL2pxdWVyeS9hZGRyZXNzL2RvY3MvXHJcbiAgICAgICAgJC5hZGRyZXNzLmNoYW5nZSggZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHBsdWdpbi5zZWxlY3RUYWJGcm9tSGFzaENoYW5nZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEJlZ2luIGN5Y2xpbmcgaWYgc2V0IGluIG9wdGlvbnMsIGNhbGxlZCBieSBpbml0XHJcbiAgICB2YXIgaW5pdEN5Y2xlID0gZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIHRhYk51bWJlcjtcclxuICAgICAgaWYgKHNldHRpbmdzLmN5Y2xlKSB7XHJcbiAgICAgICAgdGFiTnVtYmVyID0gcGx1Z2luLnRhYnMuaW5kZXgoJGRlZmF1bHRUYWIpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7IHBsdWdpbi5jeWNsZVRhYnModGFiTnVtYmVyICsgMSk7IH0sIHNldHRpbmdzLmN5Y2xlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgcGx1Z2luLmluaXQoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgJC5mbi5lYXN5dGFicyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICBwbHVnaW4gPSAkdGhpcy5kYXRhKCdlYXN5dGFicycpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGl6YXRpb24gd2FzIGNhbGxlZCB3aXRoICQoZWwpLmVhc3l0YWJzKCB7IG9wdGlvbnMgfSApO1xyXG4gICAgICBpZiAodW5kZWZpbmVkID09PSBwbHVnaW4pIHtcclxuICAgICAgICBwbHVnaW4gPSBuZXcgJC5lYXN5dGFicyh0aGlzLCBvcHRpb25zKTtcclxuICAgICAgICAkdGhpcy5kYXRhKCdlYXN5dGFicycsIHBsdWdpbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVzZXIgY2FsbGVkIHB1YmxpYyBtZXRob2RcclxuICAgICAgaWYgKCBwbHVnaW4ucHVibGljTWV0aG9kc1tvcHRpb25zXSApe1xyXG4gICAgICAgIHJldHVybiBwbHVnaW4ucHVibGljTWV0aG9kc1tvcHRpb25zXShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJncywgMSApKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJsaWJzL2pxdWVyeS5lYXN5dGFicy5tb2RpZmllZC5qcyJ9
