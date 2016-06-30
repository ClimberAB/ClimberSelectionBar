define( ["client.property-panel/components/components", "client.property-panel/component-utils", "translator", "text!./template.html", "require"], function (components, componentUtils, translator, ngTemplate,require) {
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
  return components.addComponent("pp-cl-horizontalselectionbar", component), component
});
