/*global define*/
define( [
	'qvangular'
], function ( qvangular) {
	'use strict';

	/**
	 * Directive to show a temporary message.
	 *
	 * @prop {String] messageTitle The message title to display.
	 * @prop {String} message The message to display.
	 * @prop [
	 *
	 */
	
	qvangular.directive( "onLastRepeat", function () {
		return function(scope, element, attrs) {
            if (scope.$last) setTimeout(function(){
                scope.$emit('onRepeatLast', element, attrs);
            }, 1);
        };
	} );

} );