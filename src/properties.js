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
            data.date.min.qValueExpression.qExpr = "=Min(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
            data.date.max.qValueExpression.qExpr = "=Max(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
          } else {
            data.date.min.qValueExpression.qExpr = "";
            data.date.max.qValueExpression.qExpr = "";          
          }
        }
      },
      field: {
        component: "expression",
        expression: "optional",
        expressionType: "dimension",
        ref: "qListObjectDef.qDef.qFieldDefs.0",
        defaultValue: "",
        label: "Field",
        show: function (data) {
          return data.listType == "FIELD" || data.listType == "FLAG" || data.listType == "DATERANGE";
        },
        change: function (data) {
          if (data.label == '') {
            data.label = data.qListObjectDef.qDef.qFieldDefs[0];
          }
          if (data.listType == "DATERANGE") {
            data.date.min.qValueExpression.qExpr = "=Min(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
            data.date.max.qValueExpression.qExpr = "=Max(" + data.qListObjectDef.qDef.qFieldDefs[0] + ")";
          } 
        }
      },
      fieldWarning: {
        component: "text",
        translation: "Field is a calculated dimension, initial selections not supported",
        show: function (data) {
          return (data.listType == "FIELD" || data.listType == "FLAG" || data.listType == "DATERANGE" ) && data.qListObjectDef.qDef.qFieldDefs[0].substring(0,1) == "=";
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
      dateFromInitSelection: {
        type: "string",
        ref: "date.initSelectionFrom",
        expression: "optional",
        translation: "Date from initial selection",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateToInitSelection: {
        type: "string",
        ref: "date.initSelectionTo",
        expression: "optional",
        translation: "Date to initial selection",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateFormat: {
        type: "string",
        ref: "date.format.qStringExpression.qExpr",
        expression: "always",
        label: "Field date format",
        defaultValue: "=DateFormat",
        show: false,
        readOnly: true,
      },
      displayDateFormat: {
        type: "string",
        component: "dropdown",
        ref: "date.displayFormat",
        label: "Display date format",
        defaultValue: "DEFAULT",
        options: [{
          value: "DEFAULT",
          label: "Default format",
        }, {
          value: "MMMM D, YYYY",
          label: "January 1, 1980",
        }, {
          value: "MMM D, YYYY",
          label: "Jan 1, 1980",
        },{
          value: "YYYY-MM-DD",
          label: "1980-01-01",
        },{
          value: "YYYYMMDD",
          label: "19800101",
        },],
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateToday: {
        type: "string",
        ref: "date.today",
        expression: "optional",
        translation: "Today expression",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateRangeMin: {
        type: "string",
        ref: "date.rangeMin",
        expression: "optional",
        translation: "Daterange min expression",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateRangeMax: {
        type: "string",
        ref: "date.rangeMax",
        expression: "optional",
        translation: "Daterange max expression",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      dateMin: {
        type: "string",
        ref: "date.min.qValueExpression.qExpr",
        expression: "always",
        defaultValue: "",
        show: false,
      },
      dateMax: {
        type: "string",
        ref: "date.max.qValueExpression.qExpr",
        expression: "always",
        defaultValue: "",
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