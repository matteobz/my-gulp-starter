/**
 * @requires jquery.min.js
 * @requires fastclick.js
 */

(function(window, document, $, undefined) {
    'use strict';

    $(document).on('ready', function() {

			// FastClick on Body
			window.addEventListener('load', function() {
				new FastClick(document.body);
			}, false);

			console.log('ready');

         //
         // HIDE / SHOW PASSWORD
         //
         if ($('body').is('.name-class')) {
            (function () {



            }).call(this);
         }

    });

})(window, document, jQuery);
