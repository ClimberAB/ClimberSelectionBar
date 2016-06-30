define(['qvangular'], function (qvangular) {
	'use strict';

	qvangular.directive("clActivate", ['$timeout', function($timeout) {
	    return {
	        link: function (scope, element, attrs) {
	        	element.bind("qv-activate", onActivate);
                function onActivate(event) {
                    var method = element.attr("cl-activate");
                    scope.$event = event;
                    scope.$apply(method);
	        	}
	    	}
	    }
	}]);

	qvangular.directive("clSwipestart", ['$timeout', function($timeout) {
	    return {
	        link: function (scope, element, attrs) {
	        	element.bind("qv-swipestart", onSwipeStart);
                function onSwipeStart(event) {
                    var method = element.attr("cl-swipestart");
                    scope.$event = event;
                    scope.$apply(method);
	        	}
	    	}
	    }
	}]);

	qvangular.directive("clSwipeupdate", function () {
	    return {
	        link: function (scope, element, attrs) {
	            element.bind("qv-swipeupdate", onSwipeUpdate);
	            function onSwipeUpdate(event) {
	                var method = element.attr("cl-swipeupdate");
	                scope.$event = event;
	                scope.$apply(method);
	            }

	        }
	    }
	});

	qvangular.directive("clSwipecancel", function () {
	    return {
	        link: function (scope, element, attrs) {
	            element.bind("qv-swipecancel", onSwipeCancel);
	            function onSwipeCancel(event) {
	                var method = element.attr("cl-swipecancel");
	                scope.$event = event;
	                scope.$apply(method);
	            }
	        }
	    }
	});
	
	qvangular.directive("clSwipe", function () {
	    return {
	        link: function (scope, element, attrs) {
	            element.bind("qv-swipe", onSwipe);
	            function onSwipe(event) {
	                var method = element.attr("cl-swipe");
	                scope.$event = event;
	                scope.$apply(method);
	            }
	        }
	    }
	});

});