define([
  "./lib/js/components/pp-climber/pp-climber",
], function() {
  'use strict';

  //var app = qlik.currApp();

  // ****************************************************************************************
  // Dimensions & Measures
  // ****************************************************************************************

  var lists = {

    type: "array",
    translation: "Lists",
    ref: "kfLists",
    allowAdd: true,
    allowRemove: true,
    allowMove: true,
    addTranslation: "Add List",
    grouped: true,
    itemTitleRef: "label",
    items: {
      listLabel: {
        type: "string",
        ref: "label",
        expression: "optional",
        label: "Label",
        show: true,
        defaultValue: "",
      },
      listType: {
        type: "string",
        component: "dropdown",
        label: "List type",
        ref: "listType",
        defaultValue: "FIELD",
        options: [{
          value: "FIELD",
          label: "Field",
        }, {
          value: "VARIABLE",
          label: "Variable",
        }, {
          value: "FLAG",
          label: "Flag",
        }, {
          value: "DATERANGE",
          label: "Date range picker",
        }],
        
        change: function (data) {
          if (data.listType == "DATERANGE") {
            data.dateMinValue.qValueExpression.qExpr = "=Min(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
            data.dateMaxValue.qValueExpression.qExpr = "=Max(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
          }
          //return void 0;
        }
      },
      dateRangeType: {
        type: "string",
        component: "radiobuttons",
        label: "Date range picker type",
        ref: "dateRangeType",
        options: [{
          value: "FIELD",
          label: "Field"
        }, {
          value: "VARIABLES",
          label: "Variables"
        }],
        defaultValue: "FIELD",
        show:false,
        /*
        show: function (data) {
          return data.listType == "DATERANGE";
        },
        */
      },
      /*
      showAlternatives: {
        type: "boolean",
        ref: "qListObjectDef.qShowAlternatives",
        show: false,
        defaultValue: true,
      },
      */
      field: {
        component: "expression",
        expression: "optional",
        expressionType: "dimension",
        ref: "qListObjectDef.qDef.qFieldDefs.0",
        defaultValue: "",
        label: "Field",
        show: function (data) {
          return data.listType == "FIELD" || data.listType == "FLAG" || (data.listType == "DATERANGE" && data.dateRangeType == "FIELD");
        },        
        change: function (data) {
          if (data.listType == "DATERANGE") {
            data.dateMinValue.qValueExpression.qExpr = "=Min(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
            data.dateMaxValue.qValueExpression.qExpr = "=Max(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
          }
          //return void 0;
        }
      },
      fieldWarning: {
        component: "text",
        translation: "Field is a calculated dimension, initial selections not supported",
        show: function (data) {
          return (data.listType == "FIELD" || data.listType == "FLAG" || (data.listType == "DATERANGE" && data.dateRangeType == "FIELD")) && data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "=";
        }
      },
    
      initSelection: {
        type: "string",
        ref: "initSelection",
        expression: "optional",
        label: "Initial selection",
        show: function (data) {
          return data.listType != "DATERANGE";
        },
        readOnly: function(data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "="
        }
      },
      initSelectionSeparatorComma : {
        type: "boolean",
        component: "switch",
        label: "Initial selection separator",
        ref: "initSelectionSeparatorComma",
        defaultValue: true,
        options: [{
          value: true,
          label: "Comma separator",
        }, {
          value: false,
          label: "Custom separator",
        }],
        show: function (data) {
          return data.listType != "DATERANGE";
        },
      },
      initSelectionSeparator: {
        type: "string",
        ref: "initSelectionSeparator",
        label: "Custom separator",
        show: function (data) {
          return data.listType != "DATERANGE" && !data.initSelectionSeparatorComma;
        },
        readOnly: function(data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "="
        }
      },
      customSortOrder: {
        type: "boolean",
        ref: "customSortOrder",
        component: "switch",
        label: "Sort order",
        defaultValue: false,
        options: [{
          value: true,
          label: "Show",
        }, {
          value: false,
          label: "Hide",
        }],
        show: function (data) {
          return data.listType == "FIELD" || data.listType == "FLAG";
        },
      },
      qSortByLoadOrder:{
              type: "numeric",
              component : "dropdown",
              label : "Sort by Load Order",
              ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
              options : [{
                value : 1,
                label : "Ascending"
              }, {
                value : 0,
                label : "No"
              }, {
                value : -1,
                label : "Descending"
              }],
              defaultValue : 0,
              show: function (data) {
                  return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
              },
            },
            qSortByState:{
              type: "numeric",
              component : "dropdown",
              label : "Sort by State",
              ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
              options : [{
                value : 1,
                label : "Ascending"
              }, {
                value : 0,
                label : "No"
              }, {
                value : -1,
                label : "Descending"
              }],
              defaultValue : 0,
              show: function (data) {
                  return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
              },
            },
            qSortByFrequency:{
              type: "numeric",
              component : "dropdown",
              label : "Sort by Frequence",
              ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
              options : [{
                value : -1,
                label : "Ascending"
              }, {
                value : 0,
                label : "No"
              }, {
                value : 1,
                label : "Descending"
              }],
              defaultValue : 0,
              show: function (data) {
                  return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
              },
            },
            qSortByNumeric:{
              type: "numeric",
              component : "dropdown",
              label : "Sort by Numeric",
              ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
              options : [{
                value : 1,
                label : "Ascending"
              }, {
                value : 0,
                label : "No"
              }, {
                value : -1,
                label : "Descending"
              }],
              defaultValue : 0,
              show: function (data) {
                  return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
              },
            },
            qSortByAscii:{
              type: "numeric",
              component : "dropdown",
              label : "Sort by Alphabetical",
              ref : "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
              options : [{
                value : 1,
                label : "Ascending"
              }, {
                value : 0,
                label : "No"
              }, {
                value : -1,
                label : "Descending"
              }],
              defaultValue : 0,
              show: function (data) {
                  return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
              },
            },
      variable: {
        type: "string",
        ref: "variable",
        label: "Variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "VARIABLE";
        },
        change: function (data) {
          data.variable != "" ? data.variableValue.qStringExpression.qExpr = "=" + data.variable : "";
        },
      },
      variableValue: {
        type: "string",
        expression: "always",
        expressionType: "dimension",
        ref: "variableValue.qStringExpression.qExpr",
        label: "Variable value",
        show: false,
      },
      dateFromVariable: {
        type: "string",
        ref: "dateFromVariable",
        label: "Date from variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE" && data.dateRangeType == "VARIABLES";
        },
        change: function (data) {
          data.dateFromVariable != "" ? data.dateFromValue.qStringExpression.qExpr = "=" + data.dateFromVariable : "";
        },
      },
      dateFromInitSelection: {
        type: "string",
        ref: "dateFromInitSelection",
        expression: "optional",
        label: "Date from initial selection",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE" && data.dateRangeType == "FIELD";
        },
        change: function (data) {
          data.dateFromInitSelectionValue = data.dateFromInitSelectionValue || {};
          data.dateFromInitSelectionValue.qStringExpression = '=' + data.dateFromInitSelection;
        },
        readOnly: function(data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "="
        }
      },
      dateToVariable: {
        type: "string",
        ref: "dateToVariable",
        label: "Date to variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE" && data.dateRangeType == "VARIABLES";
        },
        change: function (data) {
          data.dateToVariable != "" ? data.dateToVariable.qStringExpression.qExpr = "=" + data.dateToVariable : "";
        },
      },
      dateToInitSelection: {
        type: "string",
        ref: "dateToInitSelection",
        expression: "optional",
        label: "Date to initial selection",
        defaultValue: "",        
        show: function (data) {
          return data.listType == "DATERANGE" && data.dateRangeType == "FIELD";
        },
        change: function (data) {
          data.dateToInitSelectionValue = data.dateToInitSelectionValue || {};
          data.dateToInitSelectionValue.qStringExpression = '=' + data.dateToInitSelection;
        },
        readOnly: function(data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "="
        }
      },
      dateFormat: {
        type: "string",
        ref: "dateFormat",
        label: "Field date format",
        defaultValue: "YYYY-MM-DD",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      displayDateFormat: {
        type: "string",
        component: "dropdown",
        ref: "displayDateFormat",
        label: "Display date format",
        defaultValue: "YYYY-MM-DD",
        options: [{
          value: "YYYY-MM-DD",
          label: "1980-01-01",
        }, {
          value: "MMMM D, YYYY",
          label: "January 1, 1980",
        }, {
          value: "MM D, YYYY",
          label: "Jan 1, 1980",
        }],
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateTodayVariable: {
        type: "string",
        ref: "dateTodayVariable",
        label: "Today variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
        change: function (data) {
          data.dateTodayVariable != "" ? data.dateTodayValue.qValueExpression.qExpr = "=" + data.dateTodayVariable : data.dateTodayValue.qValueExpression.qExpr = "";
        },
      },
      dateTodayValue: {
        type: "string",
        expression: "always",
        ref: "dateTodayValue.qValueExpression.qExpr",
        label: "Date today value",
        show: false,
      },  
      daterangeMinVariable: {
        type: "string",
        ref: "daterangeMinVariable",
        label: "Daterange min variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
        change: function (data) {
          data.daterangeMinVariable != "" ? data.daterangeMinValue.qValueExpression.qExpr = "=" + data.daterangeMinVariable : data.daterangeMinValue.qValueExpression.qExpr = "";
        },
      },
      daterangeMinValue: {
        type: "string",
        expression: "always",
        ref: "daterangeMinValue.qValueExpression.qExpr",
        label: "Date min value",
        show: false,
      },  
      daterangeMaxVariable: {
        type: "string",
        ref: "daterangeMaxVariable",
        label: "Date max variable",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
        change: function (data) {
          data.daterangeMaxVariable != "" ? data.daterangeMaxValue.qValueExpression.qExpr = "=" + data.daterangeMaxVariable : data.daterangeMaxValue.qValueExpression.qExpr = "";
        },
      },          
      daterangeMaxValue: {
        type: "string",
        expression: "always",
        ref: "daterangeMaxValue.qValueExpression.qExpr",
        label: "Date max value",
        show: false,
      },   
      variableValues: {
        type: "string",
        ref: "variableValues",
        expression: "optional",
        label: "Variable values (comma separated)",
        defaultValue: "",
        show: function (data) {
          return data.listType == "VARIABLE";
        },
      },
      listVisable: {
        type: "boolean",
        ref: "listVisible",
        label: "Visible",
        show: function (data) {
          return data.listType != "DATERANGE";
        },
        defaultValue: true,
      },
      dateMinValue: {
        type: "string",
        expression: "always",
        //expressionType: "dimension",
        //ref: "dateMinValue.qValueExpression.qExpr",
        ref: "dateMinValue.qValueExpression.qExpr",
        label: "Date min value",
        show: false,
      },
      dateMaxValue: {
        type: "string",
        expression: "always",
        //expressionType: "dimension",
        //ref: "dateMaxValue.qValueExpression.qExpr",
        ref: "dateMaxValue.qValueExpression.qExpr",
        label: "Date max value",
        show: false,
      },
      dateFromValue: {
        type: "string",
        expression: "always",
        expressionType: "dimension",
        ref: "dateFromValue.qStringExpression.qExpr",
        label: "Date from value",
        show: false,
      },
      dateToValue: {
        type: "string",
        expression: "always",
        expressionType: "dimension",
        ref: "dateToValue.qStringExpression.qExpr",
        label: "Date to value",
        show: false,
      },
      InitialDataFetchWidth: {
        type: "number",
        ref: "qListObjectDef.qInitialDataFetch.0.qWidth",
        label: "qWidth",
        show: false,
        defaultValue: 10,
      },
      InitialDataFetchHeight: {
        type: "number",
        ref: "qListObjectDef.qInitialDataFetch.0.qHeight",
        label: "qHeight",
        show: false,
        defaultValue: 1000,
      },
    },
  };

  var sorting = {
    uses: "sorting",
  };

  // ****************************************************************************************
  // Other Settings
  // ****************************************************************************************

  var initSelectionSetting = {
    type: "string",
    component: "dropdown",
    label: "Initial selection mode",
    ref: "props.initSelectionMode",
    defaultValue: "ONCE",
    options: [{
      value: "ONCE",
      label: "Once per session",
    }, {
      value: "ON_SHEET",
      label: "On sheet",
    }],
  };

  var alignMode = {
    type: "string",
    component: "dropdown",
    label: "Align lists",
    ref: "props.floatMode",
    defaultValue: "LEFT",
    options: [{
      value: "LEFT",
      label: "Left",
    }, {
      value: "RIGHT",
      label: "Right",
    }, {
      value: "CENTER",
      label: "Center",
    }, {
      value: "CENTER-SPREAD",
      label: "Center Spread",
    }, {
      value: "STACK",
      label: "Stack",
    }],
  };

  var showLabels = {
    type: "boolean",
    component: "switch",
    label: "Show list label",
    ref: "props.showLabels",
    defaultValue: false,
    options: [{
      value: true,
      label: "Labels",
    }, {
      value: false,
      label: "Labels off",
    }],
  };

  // ****************************************************************************************
  // Property Panel Definition
  // ****************************************************************************************

  // Settings Panel
  var initSelectionPanel = {
    type: "items",
    translation: "Bookmarks.Selections",
    grouped: true,
    items: {
      settings: {
        type: "items",
        label: "Settings",
        translation: "Bookmarks.Selections",
        items: {
          initSelectionSetting: initSelectionSetting,
        },
      },
    },
  };

  var about = {
    //ref: "props.imgSrc",
    //type: "string",
    component: "pp-cl-horizontalselectionbar",
    translation: "Common.About",
    show: true,
    //defaultValue: "/extensions/cl-horizontalselectionbar/lib/js/components/pp-climber/climber-logo-small.png",
  };

  // Appearance Panel
  var appearancePanel = {
    uses: "settings",
    items: {
      appearance: {
        type: "items",
        translation: "Common.Appearance",
        grouped: true,
        items: {
          alignMode: alignMode,
          showLabels: showLabels,
        },
      },
      about: about,
    },
  };

  // Return values
  return {
    type: "items",
    component: "accordion",
    items: {
      lists: lists,
      initSelectionSettings: initSelectionPanel,
      appearance: appearancePanel,
    },
  };
});