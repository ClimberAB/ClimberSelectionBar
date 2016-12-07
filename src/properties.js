define([
    'jquery',
    'qlik',
    //In 3.1 Qlik changed the prop resolver from generel.utils to client.utils
    //"general.utils/property-resolver",
    //"client.utils/property-resolver",
    'ng!$q',
    'ng!$http',
    './lib/js/components/pp-climber/pp-climber'

], function($, qlik, /*propertyResolver,*/ $q, $http) {
    'use strict';

    var app = qlik.currApp();


    // ****************************************************************************************
    // Other Settings
    // ****************************************************************************************
    /*
    var tagSetting = {
    	ref: "props.tagSetting",
    	label: "Tag",
    	type: "string",
    	show: true
    };

    */

    //Create a function that returns a list of unique tags applied to master objects
    var getTagList = function() {
        var defer = $q.defer();

        app.getAppObjectList('masterobject', function(data) {
            var tags = [];
            var uniqTags = [];
            var exportTags = [];

            _.each(data.qAppObjectList.qItems, function(item) {
                if (item.qData.visualization == 'table') {
                    _.each(item.qMeta.tags, function(tag) {
                        tags.push(tag);
                    });
                }
            });
            uniqTags = _.uniq(tags);

            exportTags.push({
                value: 'All tables',
                label: 'All tables'
            });

            _.each(uniqTags, function(tag) {
                exportTags.push({
                    value: tag,
                    label: tag
                });
            });

            return defer.resolve(exportTags);
        });

        return defer.promise;
    };


    // create tag list
    var tagList = {
        type: "string",
        component: "dropdown",
        label: "Select tag",
        ref: "props.tagSetting",
        defaultValue: 'All tables',
        options: function() {
            return getTagList().then(function(items) {
                return items;
            });
        }
    };

    var tagColor = {
        type: "boolean",
        component: "switch",
        label: "Tag color",
        ref: "props.tagColor",
        options: [{
            value: true,
            label: "Colors"
        }, {
            value: false,
            label: "No colors"
        }],
        defaultValue: true
    }

    var sortOrder = {

        type: "string",
        component: "dropdown",
        label: "Dimensions and measures sort order",
        ref: "props.dimensionSortOrder",
        defaultValue: "SortByA",
        options: [{
            value: "SortByA",
            label: "Sort alphabetical"
        }, {
            value: "SortByTableOrder",
            label: "Sort by table order"
        }]

    }


    var allowCollapse = {
        type: "boolean",
        component: "switch",
        label: "Allow collapse",
        ref: "props.allowCollapse",
        options: [{
            value: true,
            label: "Yes"
        }, {
            value: false,
            label: "No"
        }],
        defaultValue: true
    }



    var collapseMinWidth = {
        type: "number",
        label: "Trigger collapse min width",
        ref: "props.collapseMinWidth",
        defaultValue: 200,
        show: function(data) {
            return data.props.allowCollapse;
        }
    };

    var collapseMinHeight = {
        type: "number",
        label: "Trigger collapse min height",
        ref: "props.collapseMinHeight",
        defaultValue: 200,
        show: function(data) {
            return data.props.allowCollapse;
        }
    }

    var displayText = {

        type: "string",
        label: "Display text",
        ref: "props.displayText",
        defaultValue: "Custom Report"

    }

    // ****************************************************************************************
    // Property Panel Definition
    // ****************************************************************************************
    var about = {
        component: "pp-cl-customreport",
        translation: "Common.About",
        show: true,
    };

    // Appearance Panel
    var appearancePanel = {
        uses: "settings",
        items: {
            settings: {
                type: "items",
                label: "Settings",
                items: {
                    //tagSetting: tagSetting,
                    tagColor: tagColor,
                    sortOrder: sortOrder,
                    allowCollapse: allowCollapse,
                    collapseMinWidth: collapseMinWidth,
                    collapseMinHeight: collapseMinHeight,
                    displayText: displayText
                }
            },
            about: about,
        }
    };



    // Tag Panel
    var tagPanel = {
        type: "items",
        label: "Setup",
        items: {
            tagPanel: {
                type: "items",
                label: "Tag",
                items: {
                    tagList: tagList
                }
            }
        }
    };

    /*
    var dataHandling = {
        type: "items",
        translation: "properties.dataHandling",
        grouped: !0,
        items: {
            
            suppressZero: {
            	ref: "qHyperCubeDef.qSuppressZero",
            	defaultValue: !1,
            	translation: "properties.hyperCube.showZero",
            	type: "boolean",
            	inverted: !0
            },
            calcCond: {
                type: "items",
                items: {
                    expr: {
                        ref: "qHyperCubeDef.qCalcCond",
                        type: "string",
                        component: "expression",
                        expressionType: "ValueExpr",
                        translation: "properties.hyperCube.calcCond"
                    },
                    customErrorMessage: {
                        ref: "qHyperCubeDef.customErrorMessage.calcCond",
                        component: "textarea",
                        defaultValue: "",
                        type: "string",
                        placeholderTranslation: "Object.ErrorMessage.CalculationCondition",
                        translation: "properties.hyperCube.calcCondMessage",
                        show: function(options) {
                            var calcCond = propertyResolver.getValue(options, "qHyperCubeDef.qCalcCond");
                            return calcCond.qv && "" !== calcCond.qv
                        }
                    }
                }
            }
        }
    }
    */

    var addons = {
        type: "items",
        component: "expandable-items",
        translation: "properties.addons",
        items: {
            dataHandling: { 
            	uses: "dataHandling",
            	items: {
            		suppressZero: { show:false }
            	}
        	}
        }
    }

    // Return values
    return {
        type: "items",
        component: "accordion",
        items: {
            tag: tagPanel,
            //dimensions: dimensions,
            //measures: measures,
            //sorting: sorting,
            addons: addons,
            appearance: appearancePanel

        }
    };

});