define(["underscore",
	"./lib/js/components/pp-cl-about/pp-cl-about"
], function (_) {
  'use strict';

  //var app = qlik.currApp();

  // ****************************************************************************************
  // Dimensions & Measures
  // ****************************************************************************************
  var updateMinMaxDate = function (data) {
    if (data.listType === "DATERANGE") {
      var field = data.qListObjectDef.qDef.qFieldDefs[0].substring(0, 1) === "=" ? data.qListObjectDef.qDef.qFieldDefs[0].substring(1) : data.qListObjectDef.qDef.qFieldDefs[0];
      data.date.min.qValueExpression.qExpr = "=Min(" + field + ")";
      data.date.max.qValueExpression.qExpr = "=Max(" + field + ")";
    } else {
      data.date.min.qValueExpression.qExpr = "";
      data.date.max.qValueExpression.qExpr = "";
    }
  };

  var dateRangeOptions = [{
    value: "TODAY",
    label: "Today",
  }, {
    value: "YESTERDAY",
    label: "Yesterday",
  }, {
    value: "LAST07DAYS",
    label: "Last 7 days",
  }, {
    value: "LAST14DAYS",
    label: "Last 14 days",
  }, {
    value: "LAST28DAYS",
    label: "Last 28 days",
  }, {
    value: "LAST30DAYS",
    label: "Last 30 days",
  }, {
    value: "LAST60DAYS",
    label: "Last 60 days",
  }, {
    value: "LAST90DAYS",
    label: "Last 90 days",
  }, {
    value: "THISWEEK",
    label: "This week",
  }, {
    value: "LASTWEEK",
    label: "Last week",
  }, {
    value: "THISMONTH",
    label: "This month",
  }, {
    value: "LASTMONTH",
    label: "Last month",
  }, {
    value: "THISQUARTER",
    label: "This quarter",
  }, {
    value: "LASTQUARTER",
    label: "Last quarter",
  }, {
    value: "THISYEAR",
    label: "This year",
  }, {
    value: "LASTYEAR",
    label: "Last year",
  }, {
    value: "WTD",
    label: "Week to date",
  }, {
    value: "MTD",
    label: "Month to date",
  }, {
    value: "QTD",
    label: "Quarter to date",
  }, {
    value: "YTD",
    label: "Year to date",
  }, {
    value: "R12",
    label: "Rolling 12 months",
  }, {
    value: "R12FM",
    label: "Rolling 12 full months",
  }];

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
          updateMinMaxDate(data);
        },
      },
      field: {
        component: "expression",
        ref: "qListObjectDef.qDef.qFieldDefs.0",
        defaultValue: "",
        label: "Field",
        show: function (data) {
          return data.listType === "FIELD" || data.listType === "FLAG" || data.listType === "DATERANGE";
        },
        change: function (data) {
          if (data.label === '') {
            data.label = data.qListObjectDef.qDef.qFieldDefs[0];
          }
          if (data.listType === "DATERANGE") {
            updateMinMaxDate(data);
          }
        }
      },
      fieldWarning: {
        component: "text",
        translation: "Field is a calculated dimension, initial selections not supported",
        show: function (data) {
          return (data.listType === "FIELD" || data.listType === "FLAG" || data.listType === "DATERANGE") && data.qListObjectDef.qDef.qFieldDefs[0].substring(0, 1) === "=";
        }
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
      initSelection: {
        type: "string",
        ref: "initSelection",
        expression: "optional",
        label: "Initial selection",
        show: function (data) {
          return data.listType !== "DATERANGE";
        },
        readOnly: function (data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0, 1) === "=";
        }
      },
      initSelectionSeparatorComma: {
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
          return data.listType !== "DATERANGE";
        },
      },
      initSelectionSeparator: {
        type: "string",
        ref: "initSelectionSeparator",
        label: "Custom separator",
        show: function (data) {
          return data.listType !== "DATERANGE" && !data.initSelectionSeparatorComma;
        },
        readOnly: function (data) {
          return data.qListObjectDef.qDef.qFieldDefs[0].substring(0, 1) === "=";
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
      qSortByLoadOrder: {
        type: "numeric",
        component: "dropdown",
        label: "Sort by Load Order",
        ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
        options: [{
          value: 1,
          label: "Ascending"
        }, {
          value: 0,
          label: "No"
        }, {
          value: -1,
          label: "Descending"
        }],
        defaultValue: 0,
        show: function (data) {
          return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
        },
      },
      qSortByState: {
        type: "numeric",
        component: "dropdown",
        label: "Sort by State",
        ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
        options: [{
          value: 1,
          label: "Ascending"
        }, {
          value: 0,
          label: "No"
        }, {
          value: -1,
          label: "Descending"
        }],
        defaultValue: 0,
        show: function (data) {
          return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
        },
      },
      qSortByFrequency: {
        type: "numeric",
        component: "dropdown",
        label: "Sort by Frequence",
        ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
        options: [{
          value: -1,
          label: "Ascending"
        }, {
          value: 0,
          label: "No"
        }, {
          value: 1,
          label: "Descending"
        }],
        defaultValue: 0,
        show: function (data) {
          return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
        },
      },
      qSortByNumeric: {
        type: "numeric",
        component: "dropdown",
        label: "Sort by Numeric",
        ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
        options: [{
          value: 1,
          label: "Ascending"
        }, {
          value: 0,
          label: "No"
        }, {
          value: -1,
          label: "Descending"
        }],
        defaultValue: 0,
        show: function (data) {
          return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
        },
      },
      qSortByAscii: {
        type: "numeric",
        component: "dropdown",
        label: "Sort by Alphabetical",
        ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
        options: [{
          value: 1,
          label: "Ascending"
        }, {
          value: 0,
          label: "No"
        }, {
          value: -1,
          label: "Descending"
        }],
        defaultValue: 0,
        show: function (data) {
          return data.customSortOrder && (data.listType == "FIELD" || data.listType == "FLAG");
        },
      },
      
      dateDefaultText: {
        type: "string",
        ref: "date.defaultText",
        label: "No selection text",
        defaultValue: "Select a date range",
        show: function (data) {
          return data.listType == "DATERANGE";
        }
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
        }, {
          value: "YYYY-MM-DD",
          label: "1980-01-01",
        }, {
          value: "YYYYMMDD",
          label: "19800101",
        },],
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
      useDateRanges: {
        type: "boolean",
        ref: "date.useDateRanges",
        component: "switch",
        label: "Use date ranges",
        defaultValue: false,
        options: [{
          value: true,
          label: "Yes",
        }, {
          value: false,
          label: "No",
        }],
        show: function (data) {
          return data.listType == "DATERANGE";
        },
      },
      customRangeLabel: {
        type: "string",
        ref: "date.customRangeLabel",
        label: "Custom range label",
        defaultValue: "Custom Range",
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        }
      },
      alwaysShowCalenders: {
        type: "boolean",
        ref: "date.alwaysShowCalenders",
        component: "switch",
        label: "Always Show Calendars",
        defaultValue: false,
        options: [{
          value: true,
          label: "Show",
        }, {
          value: false,
          label: "Hide",
        }],
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateToday: {
        type: "string",
        ref: "date.today",
        expression: "optional",
        translation: "Today expression",
        defaultValue: "",
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange01: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.0.value",
        label: "Date range 01",
        defaultValue: dateRangeOptions[0].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[0].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[0].value;
          }).label;
        }
      },
      dateRange01Label: {
        type: "string",
        ref: "date.dateRanges.0.label",
        label: "Label date range 01",
        defaultValue: dateRangeOptions[0].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange2: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.1.value",
        label: "Date range 02",
        defaultValue: dateRangeOptions[2].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[1].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[1].value;
          }).label;
        }
      },
      dateRange02Label: {
        type: "string",
        ref: "date.dateRanges.1.label",
        label: "Label date range 02",
        defaultValue: dateRangeOptions[2].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange3: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.2.value",
        label: "Date range 03",
        defaultValue: dateRangeOptions[3].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[2].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[2].value;
          }).label;
        }
      },
      dateRange03Label: {
        type: "string",
        ref: "date.dateRanges.2.label",
        label: "Label date range 03",
        defaultValue: dateRangeOptions[3].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange4: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.3.value",
        label: "Date range 04",
        defaultValue: dateRangeOptions[4].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[3].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[3].value;
          }).label;
        }
      },
      dateRange04Label: {
        type: "string",
        ref: "date.dateRanges.3.label",
        label: "Label date range 04",
        defaultValue: dateRangeOptions[4].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange5: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.4.value",
        label: "Date range 05",
        defaultValue: dateRangeOptions[11].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[4].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[4].value;
          }).label;
        }
      },
      dateRange05Label: {
        type: "string",
        ref: "date.dateRanges.4.label",
        label: "Label date range 05",
        defaultValue: dateRangeOptions[11].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange6: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.5.value",
        label: "Date range 06",
        defaultValue: dateRangeOptions[17].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[5].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[5].value;
          }).label;
        }
      },
      dateRange06Label: {
        type: "string",
        ref: "date.dateRanges.5.label",
        label: "Label date range 06",
        defaultValue: dateRangeOptions[17].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange7: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.6.value",
        label: "Date range 07",
        defaultValue: dateRangeOptions[19].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRanges[6].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[6].value;
          }).label;
        }
      },
      dateRange07Label: {
        type: "string",
        ref: "date.dateRanges.6.label",
        label: "Label date range 07",
        defaultValue: dateRangeOptions[19].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
      },
      dateRange8: {
        type: "string",
        component: "dropdown",
        ref: "date.dateRanges.7.value",
        label: "Date range 08",
        defaultValue: dateRangeOptions[21].value,
        options: dateRangeOptions,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
        },
        change: function (data) {
          data.date.dateRangess[7].label = _.find(dateRangeOptions, function (option) {
            return option.value === data.date.dateRanges[7].value;
          }).label;
        }
      },
      dateRange08Label: {
        type: "string",
        ref: "date.dateRanges.7.label",
        label: "Label date range 08",
        defaultValue: dateRangeOptions[21].label,
        show: function (data) {
          return data.listType == "DATERANGE" && data.date.useDateRanges;
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
    },{
      value: "NONE",
      label: "None",
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
    component: "pp-@@extensionnamespace@@extensionnamesafe",
    translation: "Common.About",
    show: true,
  };

  var aboutPanel = {
		translation: "Common.About",
		type: "items",
		items: {
			about: about,
		}
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
      }
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
      about: aboutPanel,
    },
  };
});