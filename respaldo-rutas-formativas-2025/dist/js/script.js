if ( typeof Vue !== "undefined" && $('#optative-subjects').length > 0 ) {
	const { createApp } = Vue;
	createApp({
		data() {
			return {
				optativos,
				carreras,
				optativosFiltered: optativos,
				formatoSelected: '',
				carreraSelected: ''
			}
		},
		computed: {
			formatos() {
				const formatos = this.optativos
					.map(optativo => optativo.formato)
					.sort((a, b) => a.localeCompare(b));
				return [...new Set(formatos)];
			}
		},
		methods: {
			setFormatoSelected(event) {
				this.formatoSelected = event.target.value;
				this.applyFilters();
			},
			setCarreraSelected(event) {
				this.carreraSelected = event.target.value;
				this.applyFilters();
			},
			coincidence(optativoItem, selected) {
				return optativoItem.optativo[key].toLowerCase().includes(selected.toLowerCase());
			},
			applyFilters() {
				this.optativosFiltered = this.optativos.filter(optativo => {
					return ( this.formatoSelected === '' || ( this.formatoSelected !== '' && optativo.formato.toLowerCase().includes( this.formatoSelected.toLowerCase() ) ) ) && 
						( this.carreraSelected === '' || ( this.carreraSelected !== '' && optativo.carreras.indexOf( this.carreraSelected ) !== -1 ) );
				});
				$('.subject').addClass('subject--fadeout');
				this.optativosFiltered.map(optativo => {
					$('#' + optativo.slug).removeClass('subject--fadeout');
				});
				
			}
		},
	}).mount('#optative-subjects');
}
// owlcarousel
jQuery(document).ready( function ($) {
    if ( $('.js-owl-carousel').length > 0 ) {
        $('.js-owl-carousel').on('initialized.owl.carousel changed.owl.carousel', function(e) {
            if (!e.namespace)  {
            return;
            }
            var carousel = e.relatedTarget;
            $('.slider-counter').text(carousel.relative(carousel.current()) + 1 + ' DE ' + carousel.items().length);
        }).owlCarousel({
            items: 1,
            nav: false,
            dots: false,
            autoHeight: true,
            navText: [
                '<svg class="svg-long-arrow-left-dims"><use xlink:href="#long-arrow-left"></use></svg>', 
                '<svg class="svg-long-arrow-right-dims"><use xlink:href="#long-arrow-right"></use></svg>'    
            ],
            responsive: {
                0 : {
                    items: 1,
                    nav: false
                },
                576 : {
                    items: 1,
                    nav: true
                },
                992 : {
                    items: 1,
                    nav: true
                }
            }
        });
    }
});
// programs-home.js
// Implementación en Vue de los programas de estudio de landing page principal

if ( typeof Vue !== "undefined" && $('#programs-home').length > 0) {
	const { createApp } = Vue;
	createApp({
		data() {
			return {
				carreras,
				menciones,
				diplomados,
				hasSelected: false
			}
		},
		mounted() {
			// Predeterminadamente se desactivan todos los programas al cargar
			this.addDefaultInactive();
		},
		methods: {
			addDefaultInactive: function() {
				[...this.carreras, ...this.menciones, ...this.diplomados].forEach((program, i) => {
					program.inactive = true;
				})
			},
			setActive: function (carrelaSlug) {
				hasSelected = true;
				this.carreras.forEach((carrera, i) => {
					carrera.active = carrera.inactive = false;
					if ( carrera.slug === carrelaSlug ) {
						carrera.active = true;
					} else {
						carrera.inactive = true;
					}
				});
				this.menciones.forEach((mencion, i) => {
					mencion.active = mencion.inactive = false;
					if ( mencion.carreras.indexOf(carrelaSlug) > -1 ) {
						mencion.active = true;
					} else {
						mencion.inactive = true;
					}
				});
				this.diplomados.forEach((diplomado, i) => {
					diplomado.active = diplomado.inactive = false;
					if ( diplomado.carreras.indexOf(carrelaSlug) > -1) {
						diplomado.active = true;
					} 
					// En caso que carrelaSlug termine en "full-online", se verifica si existe un diplomado con el mismo slug sin el sufijo "full-online"
					else if ( diplomado.carreras.indexOf( carrelaSlug.replace('-full-online', '') ) > -1 ) {
						diplomado.active = true;
					} 
					else {
						diplomado.inactive = true;
					}
				});
			},
		},
	}).mount('#programs-home');
}
//
// Gumshoe
// https://github.com/cferdinandi/gumshoe

(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory(root));
	} else if ( typeof exports === 'object' ) {
		module.exports = factory(root);
	} else {
		root.gumshoe = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var gumshoe = {}; // Object for public APIs
	var navs = []; // Array for nav elements
	var settings, eventTimeout, docHeight, header, headerHeight, currentNav, scrollEventDelay;

	// Default settings
	var defaults = {
		selector: '[data-gumshoe] a',
		selectorHeader: '[data-gumshoe-header]',
		container: root,
		offset: 0,
        activeClass: 'active',
        previousClass: 'previous',
		scrollDelay: false,
		callback: function () {}
	};


	//
	// Methods
	//

	var supports = function () {
		return ('querySelector' in document && 'addEventListener' in root && 'classList' in document.createElement('_'));
	};

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists.
	 * @private
	 * @author Todd Motto
	 * @link   https://github.com/toddmotto/foreach
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function}              callback   Callback function for each iteration
	 * @param {Array|Object|NodeList} scope      Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function ( collection, callback, scope ) {
		if ( Object.prototype.toString.call( collection ) === '[object Object]' ) {
			for ( var prop in collection ) {
				if ( Object.prototype.hasOwnProperty.call( collection, prop ) ) {
					callback.call( scope, collection[prop], prop, collection );
				}
			}
		} else {
			for ( var i = 0, len = collection.length; i < len; i++ ) {
				callback.call( scope, collection[i], i, collection );
			}
		}
	};

	/**
	 * Merge two or more objects. Returns a new object.
	 * @private
	 * @param {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
	 * @param {Object}   objects  The objects to merge together
	 * @returns {Object}          Merged values of defaults and options
	 */
	var extend = function () {

		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		var merge = function (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
			var obj = arguments[i];
			merge(obj);
		}

		return extended;

	};

	/**
	 * Get the height of an element.
	 * @private
	 * @param  {Node} elem The element to get the height of
	 * @return {Number}    The element's height in pixels
	 */
	var getHeight = function ( elem ) {
		return Math.max( elem.scrollHeight, elem.offsetHeight, elem.clientHeight );
	};

	/**
	 * Get the document element's height
	 * @private
	 * @returns {Number}
	 */
	var getDocumentHeight = function () {
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
	};

	/**
	 * Get an element's distance from the top of the Document.
	 * @private
	 * @param  {Node} elem The element
	 * @return {Number}    Distance from the top in pixels
	 */
	var getOffsetTop = function ( elem ) {
		var location = 0;
		if (elem.offsetParent) {
			do {
				location += elem.offsetTop;
				elem = elem.offsetParent;
			} while (elem);
		} else {
			location = elem.offsetTop;
		}
		location = location - headerHeight - settings.offset;
		return location >= 0 ? location : 0;
	};

	/**
	 * Determine if an element is in the viewport
	 * @param  {Node}    elem The element
	 * @return {Boolean}      Returns true if element is in the viewport
	 */
	var isInViewport = function ( elem ) {
		var distance = elem.getBoundingClientRect();
		return (
			distance.top >= 0 &&
			distance.left >= 0 &&
			distance.bottom <= (root.innerHeight || document.documentElement.clientHeight) &&
			distance.right <= (root.innerWidth || document.documentElement.clientWidth)
		);
	};

	/**
	 * Arrange nagivation elements from furthest from the top to closest
	 * @private
	 */
	var sortNavs = function () {
		navs.sort( function (a, b) {
			if (a.distance > b.distance) {
				return -1;
			}
			if (a.distance < b.distance) {
				return 1;
			}
			return 0;
		});
	};

	/**
	 * Calculate the distance of elements from the top of the document
	 * @public
	 */
	gumshoe.setDistances = function ( callback ) {
		// Calculate distances
		docHeight = getDocumentHeight(); // The document
		headerHeight = header ? ( getHeight(header) + getOffsetTop(header) ) : 0; // The fixed header
		forEach(navs, function (nav, index) {
            nav.distance = getOffsetTop(nav.target); // Each navigation target
            nav.maxDistance = nav.distance + getHeight(nav.target) - settings.offset;
        });

		// When done, organization navigation elements
		sortNavs();

		// Do callback
		callback();
	};

	/**
	 * Get all navigation elements and store them in an array
	 * @private
	 */
	var getNavs = function () {

		// Get all navigation links
		var navLinks = document.querySelectorAll( settings.selector );

		// For each link, create an object of attributes and push to an array
		forEach( navLinks, function (nav) {
			if ( !nav.hash ) return;
			var target = document.querySelector( nav.hash );
			if ( !target ) return;
			navs.push({
				nav: nav,
				target: target,
				parent: nav.parentNode.tagName.toLowerCase() === 'li' ? nav.parentNode : ( nav.parentNode.parentNode.tagName.toLowerCase() === 'li' ? nav.parentNode.parentNode : null ),
                distance: 0,
                maxDistance: 0
			});
		});

	};


	/**
	 * Remove the activation class from the currently active navigation element
	 * @private
	 */
	var deactivateCurrentNav = function () {
		if ( currentNav ) {
			currentNav.nav.classList.remove( settings.activeClass );
			if ( currentNav.parent ) {
				currentNav.parent.classList.remove( settings.activeClass );
			}
		}
	};

	/**
	 * Add the activation class to the currently active navigation element
	 * @private
	 * @param  {Node}   nav  The currently active nav
     * @param  {Number} index
	 */
	var activateNav = function ( nav, index ) {

		// If a current Nav is set, deactivate it
		deactivateCurrentNav();

		// Activate the current target's navigation element
		nav.nav.classList.add( settings.activeClass );
		if ( nav.parent ) {
			nav.parent.classList.add( settings.activeClass );
		}

		settings.callback( nav ); // Callback after methods are run

		// Set new currentNav
		currentNav = {
			nav: nav.nav,
			parent: nav.parent
        };

        // Set previous navs
        forEach(navs, function (nav, i) {
            // Remove declared previous
            nav.parent.classList.remove( settings.previousClass );

            if ( i > index ) {
                nav.parent.classList.add( settings.previousClass );
            }
        });

    };

    /**
     * Calc progress on active nav
     * @public
     * @param  {Node}   nav
     * @param  {Number} position
     * @return {Number} progress
     */
    var calcProgress = function (nav, position) {
        var progress = ( ( ( position - nav.distance ) * 100 ) / ( nav.maxDistance - nav.distance ) );
        if ( progress < 0 ) {
            progress = 0;
        }
        if ( progress > 100 ) {
            progress = 100;
        }
        nav.parent.style.setProperty('--progress', progress + '%');
    }

	/**
	 * Determine which navigation element is currently active and run activation method
	 * @public
	 * @returns {Object} The current nav data.
	 */
	gumshoe.getCurrentNav = function () {

		// Get current position from top of the document
		var position = root.pageYOffset;

		// If at the bottom of the page and last section is in the viewport, activate the last nav
		if ( (root.innerHeight + position + ( settings.offset * -1 ) ) >= docHeight && isInViewport( navs[0].target ) ) {

            activateNav( navs[0], 0 );
            // Calc progress on active nav
            calcProgress( navs[0], position );
			return navs[0];
		}

		// Otherwise, loop through each nav until you find the active one
		for (var i = 0, len = navs.length; i < len; i++) {
            var nav = navs[i];

			if ( nav.distance <= position ) {
                activateNav( nav, i );
                // Calc progress on active nav
                calcProgress( nav, position );
				return nav;
			}
		}

		// If no active nav is found, deactivate the current nav
		deactivateCurrentNav();
		settings.callback();

    };

	/**
	 * If nav element has active class on load, set it as currently active navigation
	 * @private
	 */
	var setInitCurrentNav = function () {
		forEach(navs, function (nav) {
			if ( nav.nav.classList.contains( settings.activeClass ) ) {
				currentNav = {
					nav: nav.nav,
					parent: nav.parent
				};
			}
		});
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	gumshoe.destroy = function () {

		// If plugin isn't already initialized, stop
		if ( !settings ) return;

		// Remove event listeners
		settings.container.removeEventListener('resize', eventThrottler, false);
		settings.container.removeEventListener('scroll', eventThrottler, false);

		// Reset variables
		navs = [];
		settings = null;
		eventTimeout = null;
		docHeight = null;
		header = null;
		headerHeight = null;
		currentNav = null;
		scrollEventDelay = null;

	};

	/**
	 * Run functions after scrolling stops
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	var scrollStop = function (event) {

		// Clear our timeout throughout the scroll
		window.clearTimeout( eventTimeout );

		// recalculate distances and then get currently active nav
		eventTimeout = setTimeout(function() {
			gumshoe.setDistances( function() {
				gumshoe.getCurrentNav();
			});
		}, 6);

	};

	/**
	 * On window scroll and resize, only run events at a rate of 15fps for better performance
	 * @private
	 * @param  {Function} eventTimeout Timeout function
	 * @param  {Object} settings
	 */
	var eventThrottler = function (event) {
		if ( !eventTimeout ) {
			eventTimeout = setTimeout(function() {

				eventTimeout = null; // Reset timeout

				// If scroll event, get currently active nav
				if ( event.type === 'scroll' ) {
					gumshoe.getCurrentNav();
				}

				// If resize event, recalculate distances and then get currently active nav
				if ( event.type === 'resize' ) {
					gumshoe.setDistances( function() {
						gumshoe.getCurrentNav();
					});
				}

			}, 6);
		}
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	gumshoe.init = function ( options ) {

		// feature test
		if ( !supports() ) return;

		// Destroy any existing initializations
		gumshoe.destroy();

		// Set variables
		settings = extend( defaults, options || {} ); // Merge user options with defaults
		header = document.querySelector( settings.selectorHeader ); // Get fixed header
		getNavs(); // Get navigation elements

		// If no navigation elements exist, stop running gumshoe
		if ( navs.length === 0 ) return;

		// Run init methods
		setInitCurrentNav();
		gumshoe.setDistances( function() {
			gumshoe.getCurrentNav();
		});

		// Listen for events
		settings.container.addEventListener('resize', eventThrottler, false);
		if ( settings.scrollDelay ) {
			settings.container.addEventListener('scroll', scrollStop, false);
		} else {
			settings.container.addEventListener('scroll', eventThrottler, false);
		}

	};


	//
	// Public APIs
	//

	return gumshoe;

});


jQuery(document).ready( function($){
    gumshoe.init({
        selector: '[data-gumshoe] a',
        selectorHeader: '[data-gumshoe-header]',
        container: window,
        offset: -115,
        activeClass: 'progress-step--active',
        previousClass: 'progress-step--previous',
        scrollDelay: false,
        callback: function (nav) {
			if ( nav ) {
				$('.progress-indicator-wrapper').addClass('progress-indicator-wrapper--active');
			} else {
				$('.progress-indicator-wrapper').removeClass('progress-indicator-wrapper--active');
			}
		}
    });
});
jQuery(document).ready( function ($) {
    $('.js-return-link').on('click', function (event){
        if ( document.referrer !== '' ) {
            event.preventDefault();
            window.history.back();
        }
        // if ( document.referrer.includes('index.html') || document.referrer.includes('mencion') ) {
        // }
    });
});
(function(document, history, location) {
	var HISTORY_SUPPORT = !!(history && history.pushState);

    var toggleSubject = function ($subject) {
        $subject.toggleClass('subject--expanded');
        const expanded = $subject.hasClass('subject--expanded');
        $subject.find('.subject__chevron use').attr('xlink:href', expanded ? '#chevron-down' : '#chevron-right');
    }
	
	var anchorScrolls = {
		ANCHOR_REGEX: /^#asignatura-[^ ]+$/,
		OFFSET_HEIGHT_PX: window.outerWidth > 767 ? 160 : 70,
		
		/**
		* Establish events, and fix initial scroll position if a hash is provided.
		*/
		init: function() {
			this.scrollToCurrent();
			$(window).on('hashchange', $.proxy(this, 'scrollToCurrent'));
			$('body').on('click', 'a', $.proxy(this, 'delegateAnchors'));
		},
		
		/**
		* Return the offset amount to deduct from the normal scroll position.
		* Modify as appropriate to allow for dynamic calculations
		*/
		getFixedOffset: function() {
			return this.OFFSET_HEIGHT_PX;
		},
		
		/**
		* If the provided href is an anchor which resolves to an element on the
		* page, scroll to it.
		* @param  {String} href
		* @return {Boolean} - Was the href an anchor.
		*/
		scrollIfAnchor: function(href, pushToHistory) {
			var match, anchorOffset;
			
			if(!this.ANCHOR_REGEX.test(href)) {
				return false;
			}
			
			match = document.getElementById(href.slice(1));
			
			if(match) {
				anchorOffset = $(match).offset().top - this.getFixedOffset();
				$('html, body').animate({ scrollTop: anchorOffset});
				
				// Add the state to history as-per normal anchor links
				if(HISTORY_SUPPORT && pushToHistory) {
					history.pushState({}, document.title, location.pathname + href);
				}

				toggleSubject($(match));
			}
			
			return !!match;
		},
		
		/**
		* Attempt to scroll to the current location's hash.
		*/
		scrollToCurrent: function(e) { 
			if(this.scrollIfAnchor(window.location.hash) && e) {
				e.preventDefault();
			}
		},
		
		/**
		* If the click event's target was an anchor, fix the scroll position.
		*/
		delegateAnchors: function(e) {
			var elem = e.target;
			
			if(this.scrollIfAnchor(elem.getAttribute('href'), true)) {
				e.preventDefault();
			}
		}
	};
	
	$(document).ready($.proxy(anchorScrolls, 'init'));
    $('.js-subject-toggle').on('click', function (event){
        event.preventDefault();
        var $subject = $(this).parents('.subject');
        toggleSubject($subject);
    });
})(window.document, window.history, window.location);
//# sourceMappingURL=maps/script.js.map
