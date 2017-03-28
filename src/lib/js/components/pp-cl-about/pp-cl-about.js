define(["client.property-panel/components/components",
	"client.property-panel/component-utils",
	"translator",
	"require"
], function (components, componentUtils) {

    var gradientUrl = window.location.href + "#gradient-cl-about";

	gradientUrl = gradientUrl.replace('state/analysis','state/edit');
	
	var climberSVG ='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 250 125"> <defs> <style>.cl-about-background{fill: url('+gradientUrl+');}.cl-about-title{font-size: @@abouttitlefontsizepx; fill: #fff; font-family: FranklinGothic-Book, Franklin Gothic Book; text-transform: uppercase;}.cl-about-version{font-size: 13px; text-transform: none;}.cls-4{letter-spacing: -0.04em;}.cls-5{letter-spacing: 0.01em;}.cls-6{letter-spacing: -0.01em;}.cls-7{letter-spacing: -0.04em;}.cls-8{font-size: 24px;}.cl-about-climberlogo{fill: #a7a6a6;}.cl-about-footerline{fill: #77216f;}</style> <linearGradient id="gradient-cl-about" x1="31.25" y1="156.25" x2="218.75" y2="-31.25" gradientUnits="userSpaceOnUse"> <stop offset="0" stop-color="#2a3235"/> <stop offset="1" stop-color="#373f42"/> </linearGradient> </defs> <title>@@extensionname</title> <polygon class="cl-about-background" points="250 125 0 125 0 0 56.89 0 250 0 250 125"/> <text class="cl-about-title" transform="translate(17.17 43.34)">@@aboutextensionname <tspan x="3.25" y="20" class="cl-about-version"> Version @@version </tspan> </text><g transform="translate(-90 -40) scale(1.4)"> <path class="cl-about-climberlogo" d="M178.78,109.53V109c1.76,0,2.11-.45,2.11-3.13V104.5c0-2.67-.35-3.1-2.11-3.1v-.56l4-.67v5.67c0,2.67.32,3.13,2.11,3.13v.56Z"/> <path class="cl-about-climberlogo" d="M196.19,105.84c0,2.83.19,3.13,1.68,3.13v.56h-5.24V109c1.47,0,1.68-.29,1.68-3.13v-1.55c0-1.74-.53-2.86-1.93-2.86a3,3,0,0,0-2.75,2.67v1.74c0,2.78.19,3.13,1.66,3.13v.56h-5.67V109c1.76,0,2.11-.45,2.11-3.13V104.5c0-2.67-.35-3.1-2.11-3.1v-.56l3.56-.67a10.82,10.82,0,0,1,.45,1.93,4.61,4.61,0,0,1,3.48-1.93,2.64,2.64,0,0,1,2.83,2,5.08,5.08,0,0,1,3.74-2c2.38,0,3.08,1.71,3.08,4v1.68c0,2.67.35,3.13,2.11,3.13v.56h-5.67V109c1.47,0,1.66-.29,1.66-3.13v-1.55c0-1.74-.51-2.86-1.9-2.86-.91,0-2.78,1-2.78,2.67Z"/> <path class="cl-about-climberlogo" d="M233.93,103.08a1,1,0,0,1-.94-1,.8.8,0,0,0-.86-.88c-.61,0-2.06,1-2.06,3.13v1.47c0,2.67.32,3.13,2.11,3.13v.56h-6.12V109c1.77,0,2.11-.45,2.11-3.13V104.5c0-2.67-.35-3.1-2.11-3.1v-.56l3.56-.67a10.79,10.79,0,0,1,.45,1.93,3.48,3.48,0,0,1,2.81-1.93,1.89,1.89,0,0,1,2.11,1.66C235,102.41,234.76,103.08,233.93,103.08Z"/> <circle class="cl-about-climberlogo" cx="181.59" cy="97.7" r="1.15"/> <path class="cl-about-climberlogo" d="M175.8,95v10.85c0,2.67.35,3.13,2.11,3.13v.56h-6.12V109c1.79,0,2.11-.45,2.11-3.13l0-10.81a8.79,8.79,0,0,0-.27-2.62,4,4,0,0,0-2.34-2.69,2.22,2.22,0,0,0-2.15.17c-.71.54-.37,1.75-.93,2.17a1.11,1.11,0,0,1-1.45.06c-.65-.46-.33-1.37-.3-1.5a3.6,3.6,0,0,1,2.9-1.88,5.84,5.84,0,0,1,6,3.36A8.13,8.13,0,0,1,175.8,95Z"/> <path class="cl-about-climberlogo" d="M171.58,107.47a.31.31,0,0,0-.32,0h0a4.31,4.31,0,0,1-2.9,1.14c-2.19-.07-3.16-1.52-3.09-3.66.08-2.46,1.26-4.24,2.68-4.19.48,0,1,.3.92,1.18a1.07,1.07,0,0,0,1,1.1,1.13,1.13,0,0,0,1.24-1.11c0-1-.9-2-3.14-2a5,5,0,0,0-4.87,5,4.44,4.44,0,0,0,4.55,4.83,5.57,5.57,0,0,0,4.07-1.63h0l0-.08A.39.39,0,0,0,171.58,107.47Z"/> <path class="cl-about-climberlogo" d="M208.74,94.21a5.06,5.06,0,0,1,6.26.92c.76.87.51,1.81-.2,2.1a1.07,1.07,0,0,1-1.41-.45c-.25-.35-.07-.49-.3-1.39-.12-.5-.71-1.36-2.43-1-3.14.72-3,4.92-3,4.92v2.41a4.11,4.11,0,0,1,3.26-1.58,4.92,4.92,0,0,1,0,9.81,4.16,4.16,0,0,1-3.42-1.79L205.75,110V99.45A6,6,0,0,1,208.74,94.21Zm-1.09,12.58a3,3,0,0,0,2.7,2.14c2.09,0,3-1.71,3-3.85s-1-3.82-3-3.82a3,3,0,0,0-2.7,2.11Z"/> <path class="cl-about-climberlogo" d="M225.57,108.21a.38.38,0,0,0,.07-.21.39.39,0,0,0-.39-.39l-.12,0-.19.14a5,5,0,0,1-2.76,1.08c-2.78,0-3.82-2-3.5-4.47h6.47c.62-2.3-1.28-4.23-3.64-4.23a5,5,0,0,0-4.95,4.89,4.8,4.8,0,0,0,4.95,4.92,6,6,0,0,0,4-1.69Zm-4.19-7c1.76,0,2.19,1.31,1.9,2.17h-4.41A2.7,2.7,0,0,1,221.38,101.24Z"/></g> <rect class="cl-about-footerline" y="120" width="250" height="5"/></svg>';
    
    var ngTemplate = '<div><a href="@@abouturl" target="_blank" title="climber.eu" style="height:0px;">'+climberSVG+'</a></div><div style="text-align:right; padding-right:5px;"></div>';

    
	var component = {
		template: ngTemplate,
		controller: ["$scope", function ($scope) {
			var data = function () {
				return $scope.data
			};

			componentUtils.defineLabel($scope, $scope.definition, data, $scope.args.handler);
			componentUtils.defineVisible($scope, $scope.args.handler);
			componentUtils.defineReadOnly($scope, $scope.args.handler);
			componentUtils.defineChange($scope, $scope.args.handler);
			componentUtils.defineValue($scope, $scope.definition, data);

			$scope.getDescription = function (value) {
				return value === 'About';
			};
		}],
	};
	return components.addComponent("pp-@@extensionnamespace@@extensionnamesafe", component), component;
});
