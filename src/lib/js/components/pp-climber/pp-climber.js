define( ["client.property-panel/components/components", "client.property-panel/component-utils", "translator", "require"], function (components, componentUtils, translator, require) {
	
	var ngTemplate = '<div><a href="http://goo.gl/0TzmFM" target="_blank" title="climber.eu" style="height:0px;"><img style="max-width:250px" qva-prevent-drag ng-if="label" title="climber.eu" alt="climber.eu" ng-src="/extensions/cl-customreport/lib/js/components/pp-climber/pp-climber-customreport.png" style="padding:0px;"/></a></div>';

	var component = {
		template: ngTemplate,
		controller: ["$scope", function ($scope) {			
			var data = function() {
				return $scope.data
			};

			componentUtils.defineLabel($scope, $scope.definition, data, $scope.args.handler); 
			componentUtils.defineVisible($scope, $scope.args.handler); 
			componentUtils.defineReadOnly($scope, $scope.args.handler); 
			componentUtils.defineChange($scope, $scope.args.handler); 
			componentUtils.defineValue($scope, $scope.definition, data);
			
			$scope.getDescription = function(value) {
				return value === 'About'
			};			
		}],
	};
  return components.addComponent("pp-cl-customreport", component), component
});
