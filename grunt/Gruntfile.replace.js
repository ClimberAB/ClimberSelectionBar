/*global module*/
module.exports = function ( grunt ) {
	'use strict';

	grunt.loadNpmTasks( 'grunt-replace' );

	/**
	 * Replace variables like the Urls for the help, the version, etc.
	 */
	return {

		general_dev: {
			options: {
				patterns: [
					{
						json: grunt.file.readYAML( 'gruntReplacements.yml' )
					},
					{
						match: "version",
						replacement: "<%= projectconfig.general.Version %>"
					},
					{
						match: "extensionnamesafe",
						replacement: "<%= projectconfig.general.ExtensionNameSafe %>"
					},
					{
						match: "extensionnamespace",
						replacement: "<%= projectconfig.general.ExtensionNamespace %>"
					},
					{
						match: "extensionname",
						replacement: "<%= projectconfig.general.ExtensionName %>"
					},
					{
						match: "abouturl",
						replacement: "<%= projectconfig.general.AboutUrl %>"
					},
					{
						match: "aboutextensionname",
						replacement: "<%= projectconfig.general.AboutExtensionName %>"
					},
					{
						match: "abouttitlefontsize",
						replacement: "<%= projectconfig.general.AboutTitleFontSize %>"
					}

				]
			},
			files: [
				{
					expand: true,
					flatten: false,
					src: ['./dist_dev/**/*.*', '!./dist_dev/**/*.{min.js,png,gif,jpg,ico,psd,eot,svg,ttf,woff}'],
					dest: '.'
				}
			]
		},
		general_release: {
			options: {
				patterns: [
					{
						json: grunt.file.readYAML( 'gruntReplacements.yml' )
					},
					{
						match: "version",
						replacement: "<%= projectconfig.general.Version %>"
					},
					{
						match: "extensionnamesafe",
						replacement: "<%= projectconfig.general.ExtensionNameSafe %>"
					},
					{
						match: "extensionnamespace",
						replacement: "<%= projectconfig.general.ExtensionNamespace %>"
					},
					{
						match: "extensionname",
						replacement: "<%= projectconfig.general.ExtensionName %>"
					},
					{
						match: "abouturl",
						replacement: "<%= projectconfig.general.AboutUrl %>"
					},
					{
						match: "aboutextensionname",
						replacement: "<%= projectconfig.general.AboutExtensionName %>"
					},
					{
						match: "abouttitlefontsize",
						replacement: "<%= projectconfig.general.AboutTitleFontSize %>"
					}

				]
			},
			files: [
				{
					expand: true,
					flatten: false,
					src: ['./dist/**/*.*', '!./dist/**/*.{min.js,png,gif,jpg,ico,psd,eot,svg,ttf,woff}'],
					dest: '.'
				}
			]
		},
		dev: {
			options: {
				patterns: [
					{
						json: grunt.file.readYAML( 'gruntReplacements_dev.yml' )
					}
				]
			},
			files: [
				{
					expand: true,
					flatten: false,
					src: ['./dist_dev/*.*', '!./dist_dev/**/*.{min.js,png,gif,jpg,ico,psd,eot,svg,ttf,woff}'],
					dest: '.'
				}
			]
		}
		,
		release: {
			options: {
				patterns: [
					{
						json: grunt.file.readYAML( 'gruntReplacements_release.yml' )
					}
				]
			}
			,
			files: [
				{
					expand: true,
					flatten: false,
					src: ['./dist/**/*.*', '!./dist/**/*.{min.js,png,gif,jpg,ico,psd,eot,svg,ttf,woff}'],
					dest: '.'
				}
			]
		}
	}
		;
}
;
