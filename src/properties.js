define([
  'jquery',
  'qlik',
  'ng!$q',
  'ng!$http',
  "./lib/js/components/pp-climber/pp-climber",
], function($, qlik, $q, $http) {
  'use strict';

  var app = qlik.currApp();

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
        }],
      },
      showAlternatives: {
        type: "boolean",
        ref: "qListObjectDef.qShowAlternatives",
        show: false,
        defaultValue: true,
      },
      field: {
        type: "string",
        expression: "always",
        expressionType: "dimension",
        ref: "qListObjectDef.qDef.qFieldDefs.0",
        label: "Field",
        show: function (data) {
          return data.listType != "VARIABLE";
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
        change: function (a, b, c, e) {
          a.variable != "" ? a.variableValue.qStringExpression.qExpr = "=" + a.variable : "";
        },
      },
      listLabel: {
        type: "string",
        ref: "label",
        expression: "optional",
        label: "Label",
        show: true,
        defaultValue: "",
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
      alternativeDim: {
        type: "boolean",
        ref: "alternativeDim",
        component: "switch",
        label: "Switch alternative dimensions",
        defaultValue: false,
        options: [{
          value: true,
          label: "Switch",
        }, {
          value: false,
          label: "Off",
        }],
        show: function (data) {
          return data.listType == "VARIABLE";
        },
      },
      alternativeDimensions: {
        type: "string",
        ref: "alternativeDimensions",
        label: "Alternative dimensions (comma separated)",
        defaultValue: "",
        show: function (data) {
          return data.alternativeDim && data.listType == "VARIABLE";
        },
      },
      initSelection: {
        type: "string",
        ref: "initSelection",
        expression: "optional",
        label: "Initial selection",
        show: true,
      },
      listVisable: {
        type: "boolean",
        ref: "listVisible",
        label: "Visible",
        show: true,
        defaultValue: true,
      },
      variableValue: {
        type: "string",
        expression: "always",
        expressionType: "dimension",
        ref: "variableValue.qStringExpression.qExpr",
        label: "Variable value",
        show: false,
      },
      InitialDataFetchWidth: {
        type: "number",
        ref: "qListObjectDef.qInitialDataFetch.0.qWidth",
        label: "qWidth",
        show: false,
        defaultValue: 2,
      },
      InitialDataFetchHeight: {
        type: "number",
        ref: "qListObjectDef.qInitialDataFetch.0.qHeight",
        label: "qHeight",
        show: false,
        defaultValue: 20,
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
    defaultValue: true,
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
