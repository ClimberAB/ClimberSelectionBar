define([
  'jquery',
  'underscore',
  'qlik',
  'ng!$q',
  'ng!$http',
  './properties',
  './initialproperties',
  'client.utils/state',
  'objects.backend-api/field-api',
  './lib/js/extensionUtils',
  './lib/js/moment',
  './lib/js/daterangepicker',
  'general.models/library/dimension',
  'text!./lib/css/style.css',
  'text!./lib/css/daterangepicker.css',
  'text!./lib/partials/template.html',
  './lib/js/clTouch',
  './lib/js/onLastRepeatDirective',
],
function($, _, qlik, $q, $http, props, initProps, stateUtil, fieldApi, extensionUtils, moment, daterangepicker, dimension, cssContent, cssDaterangepicker, ngTemplate) {
  'use strict';

  extensionUtils.addStyleToHeader(cssContent);
  extensionUtils.addStyleToHeader(cssDaterangepicker);  

  ////(end.toDate().getTime() /86400/1000) + 25567 + 1 + utcOffset * 60000 ;
                  
  function getQSDateNumFromMoment(momentDate) {
    var milli = momentDate.startOf('day').toDate().getTime();
    var offset = momentDate.utcOffset() * 60000;
      return ((milli + offset)/86400/1000) + 25567 + 1 ;
    };

  function getJsDateFromNumber(numDate) {
          // JavaScript dates can be constructed by passing milliseconds
          // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

          // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")             
          // 2. Convert to milliseconds.
        return new Date((numDate - (25567 + 1))*86400*1000);
    };
    function getMillisecondFromDateNumber(numDate) {
      var offset = moment().utcOffset();
    
       return ((numDate - (25567 + 1))*86400) - offset;
    };

    function getDateFromDateNumberWithFormat(numDate, dateFormat) {
      return moment(getMillisecondFromDateNumber(numDate), 'X').utc().format(dateFormat);
    };


  return {

    definition: props,
    initialProperties: initProps,
    snapshot: { canTakeSnapshot: true },
    support: {export: true,
            exportData: false,
    },


    getDropFieldOptions:function(a, b, c, d) {
      d();
    },

    getDropDimensionOptions:function(a, b, c, d) {
      d();
    },

    getDropMeasureOptions:function(a, b, c, d) {
      d();
    },

    resize : function ($element, layout) {
      this.$scope.sizeMode = ($(document).width() <= this.$scope.resolutionBreakpoint) ? 'SMALL':'';
    },

    paint: function ($element, layout) {
      console.log('paint', this);
      console.log('layout', layout);
      console.log('fieldApi',fieldApi);

      this.$scope.sizeMode = ($(document).width() < this.$scope.resolutionBreakpoint) ? 'SMALL':'';

      this.$scope.setFields(layout.kfLists);
      this.$scope.props = layout.props;

      if (!this.$scope.initSelectionsApplied) {
        this.$scope.setInitSelections();
      };


      this.$scope.qId = layout.qInfo.qId;
     
    },

    template: ngTemplate,

    controller: ['$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
      var app = qlik.currApp();

      $scope.selections = {
        field: '',
        swipe_idx_min: -1,
        swipe_idx_max: -1,
        values_to_select: [],
        selectionMode: '',
      };

      $scope.$on('onRepeatLast', function(scope, element, attrs){
          //moment.locale('en');
          
          //Remove all containers
          $("[id^=daterangepicker-container-" + $scope.qId + "]").remove();
          //Append containers to the body and setup the daterangepicker
          _.each($scope.fields, function(item) {
            
            if (item.type=="DATERANGE") {
              var daterangepickerContainerId = "daterangepicker-container-" + $scope.qId + '-' + item.id;
              var daterangepickerId = "daterange-" + $scope.qId + '-' + item.id;
              
              if($("#" + daterangepickerContainerId).length == 0) {
                $("body").append('<div id="' + daterangepickerContainerId + '" class="bootstrap" style="position: absolute"></div>');
              }

              var onApplyCallback = function(start, end) {
                  $scope.selectDateFromAndTo(item.field, start.format(item.dateFormat), end.format(item.dateFormat), true);
              };
              var vToday = item.dateToday;
              var vTodayIsEndOfMonth = moment(vToday).endOf('month').format(item.dateFormat) == moment(vToday).format(item.dateFormat)       
              var vR12 = vTodayIsEndOfMonth ? [moment(vToday).subtract(12, 'month').startOf('month'), moment(vToday).endOf('month')]
                                            : [moment(vToday).subtract(13, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')];

              var options = {
                  "showDropdowns": true,
                  "ranges": {
                         'Yesterday': [moment(vToday), moment(vToday)],
                         'Last 7 Days': [moment(vToday).subtract(6, 'days'), moment(vToday)],
                         'Last 14 Days': [moment(vToday).subtract(13, 'days'), moment(vToday)],
                         'Last 28 Days': [moment(vToday).subtract(37, 'days'), moment(vToday)],
                         'Month to Date': [moment(vToday).startOf('month'), moment(vToday)],
                         'Year to Date': [moment(vToday).startOf('month'), moment(vToday)],
                         'Rolling 12 months': vR12,
                         //'This Month': [moment(vToday).startOf('month'), moment(vToday).endOf('month')],
                         'Last Month': [moment(vToday).subtract(1, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')]        
                  },
                  "locale": {
                    "format": item.dateFormat,                    
                    },
                  "alwaysShowCalendars": true,
                  "parentEl": "#" + daterangepickerContainerId,                  
              };
              
              if (item.dateStart != null && item.dateEnd != null) {
                options.startDate = item.dateStart;
                options.endDate = item.dateEnd;
              }

              if (item.dateMin != null && item.dateMax != null) {
                options.minDate = item.dateMin;
                options.maxDate = item.dateMax;
              }

              $('#' + daterangepickerId).daterangepicker(options, onApplyCallback);
              
              $('#' + daterangepickerContainerId + ' div').first().css('display','inline-flex');

            }
          });
      });

      $scope.resolutionBreakpoint = 1024;
      $scope.sizeMode = '';

      $scope.fields = [];
      $scope.variables = [];
      $scope.willApplyInitSelections = false;
      $scope.initSelectionsApplied = false;
      $scope.sessionStorageId = $scope.$parent.layout.qExtendsId ? $scope.$parent.layout.qExtendsId : $scope.$parent.layout.qInfo.qId;

      $scope.getClass = function () {
        return stateUtil.isInAnalysisMode() ? "" : "no-interactions";
      };
      //*******************************
      //      TRANSFORM MODEL
      //*******************************
      $scope.setFields = function (kfLists) {
        var newFields = [];
        _.each(kfLists, function (item,idx) {
          var qMatrix = item.qListObject.qDataPages[0] ? item.qListObject.qDataPages[0].qMatrix : [];

          switch (item.listType) {
            case "FIELD":
              newFields.push({
                field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                type: item.listType,
                id: idx,
                visible: item.listVisible,
                initSelection: item.initSelection,
                initSelectionSeparator: item.initSelectionSeparatorComma ? ',': item.initSelectionSeparator,                
                label: item.label,
                data: qMatrix,
              });
              break;
            case "VARIABLE":
              var variableValues = item.variableValues ? item.variableValues.split(',') : [];
              var altDimensions = item.alternativeDimensions ? item.alternativeDimensions.split(',') : [];

              var data = [];

              for (var i = 0; i < variableValues.length; i++) {
                if (variableValues.length == altDimensions.length && item.alternativeDim) {
                  data.push({
                    value: variableValues[i],
                    altDim: altDimensions[i],
                  });
                } else {
                  data.push({
                    value: variableValues[i],
                  });
                }
              }
              
              newFields.push({
                variable: item.variable,
                variableValue: item.variableValue,
                id: idx,
                type: item.listType,
                visible: item.listVisible,
                initSelection: item.initSelection,
                label: item.label,
                data: data,
              });
              break;
            case "FLAG":
              var data = [];
              _.each(qMatrix, function (flag) {
                var iconFilename = flag[0].qText.replace(' ', '-');
                var newFlag = flag;
                newFlag.icon = '/Extensions/cl-HorizontalSelectionBar/lib/images/flags/' + iconFilename + '.png'
                data.push(newFlag);
              });
              newFields.push({
                field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                type: item.listType,
                id: idx,
                visible: item.listVisible,
                initSelection: item.initSelection,
                initSelectionSeparator: item.initSelectionSeparatorComma ? ',': item.initSelectionSeparator,                
                label: item.label,
                data: data,
              });
              break;
            case "DATERANGE":
              var displayText = "";
              var dateStart = null;
              var dateEnd = null;
              var dateMin = getDateFromDateNumberWithFormat(item.daterangeMinValue, item.dateFormat);
              var dateMax = getDateFromDateNumberWithFormat(item.daterangeMaxValue, item.dateFormat);
              var dateToday = getDateFromDateNumberWithFormat(item.dateTodayValue, item.dateFormat);
              //var dateToday = item.dateTodayValue != null ? moment(getMillisecondFromDateNumber(item.dateTodayValue), 'X').utc().format(item.dateFormat) : null;

              if (item.qListObject.qDimensionInfo.qStateCounts.qSelected > 0) {
               if (item.qListObject.qDimensionInfo.qStateCounts.qSelected < (item.dateMaxValue - item.dateMinValue + 1)) {
                  displayText = "Selection is not a range";
                } else {
                  dateStart = getDateFromDateNumberWithFormat(item.dateMinValue, item.dateFormat); 
                  dateEnd = getDateFromDateNumberWithFormat(item.dateMaxValue, item.dateFormat);                  
                  displayText = getDateFromDateNumberWithFormat(item.dateMinValue, item.displayDateFormat) + ' - ' + getDateFromDateNumberWithFormat(item.dateMaxValue, item.displayDateFormat);
                }
              }
              //start.format(item.displayDateFormat) + ' - ' + end.format(item.displayDateFormat)
              newFields.push({
                field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                type: item.listType,
                id: idx,
                visible: item.listVisible,
                dateFromInitSelection: item.dateFromInitSelection,
                dateToInitSelection: item.dateToInitSelection,
                dateFormat: item.dateFormat,
                displayDateFormat: item.displayDateFormat,
                displayText: displayText,
                dateStart: dateStart,
                dateEnd: dateEnd,
                dateToday: dateToday,
                dateMin: dateMin,
                dateMax: dateMax,                
                label: item.label,
                dateFromVariable: item.dateFromVariable,
                dateToVariable: item.dateToVariable,
                data: qMatrix,
              });
              break;
            default:
              this.$scope.fields[idx] = null;
          }
        });

        $scope.fields = newFields;
      };

   
      //*******************************
      //      HANDLE SELECTIONS
      //*******************************
      $scope.selectValue = function (event, field, item, bool) {
          if (event.ctrlKey) {
            $scope.selectFieldValues(field, [$scope.getValue(item)], false);
          } else {
            $scope.selectFieldValues(field, [$scope.getValue(item)], bool);
          }
      };

      $scope.selectDateFromAndTo = function (field, fromDate, toDate, bool) {
          field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
          app.field(field).selectMatch(">=" + fromDate + "<=" + toDate, bool).then(function(reply){
            });
      };

      $scope.selectFieldValues = function (field, items, bool) {
        field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
        console.log('field',field);
        var selectArray = [];
        _.each(items, function (item) {
          selectArray.push(JSON.parse(item));
        });
           app.field(field).selectValues(selectArray, bool).then(function(reply){
            }).catch(function(err){
                location.reload(true);       
            })
      };

      //*******************************
      //      HELPER FUNCTIONS
      //*******************************
      $scope.setVariable = function (variable, value) {
        app.variable.setStringValue(variable, value).then(function () {
        });
      };

      $scope.getValue = function (item) {
        return isNaN(item.qNum) ? JSON.stringify({ qText: item.qText }) : JSON.stringify(item.qNum);
      };

      $scope.showField = function (field) {
        return field.visible && !_.isEmpty(field.data);
      };

      $scope.changeAlternativeDimensions = function (oldDim, newDim, idx, chartId) {
        app.getObject(chartId).then(function (chart) {
          var patches = [{
            "qOp": "replace",
            "qPath": "qHyperCubeDef/qDimensions/0",
            "qValue": JSON.stringify(newDim),
          }, {
            "qOp": "replace",
            "qPath": "qHyperCubeDef/qLayoutExclude/qHyperCubeDef/qDimensions/" + idx,
            "qValue": JSON.stringify(oldDim),
          }];
          chart.clearSoftPatches();
          chart.applyPatches(patches, true);
        });
      };

      $scope.prepareAlternativeDimension = function (altDimension) {
        var sheetId = qlik.navigation.getCurrentSheetId();
        app.getObject(sheetId.sheetId).then(function (sheet) {
          var lineCharts = [];

          _.each(sheet.layout.cells, function (cell) {
            if (cell.type == 'linechart') {
              lineCharts.push(cell.name);
            }
          });

          _.each(lineCharts, function (linechartID) {
            app.getObjectProperties(linechartID).then(function (linechart) {
              app.getObject(linechartID).then(function (chart) {
                chart.clearSoftPatches();

                if (linechart.properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions) {
                  if (linechart.properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions.length > 0) {
                    var oldDim = linechart.properties.qHyperCubeDef.qDimensions[0];

                    _.each(linechart.properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions, function (altDim, idx) {
                      if (altDim.qLibraryId) {
                        dimension.getProperties(altDim.qLibraryId).then(function (libraryDim) {
                          if (altDimension == libraryDim.properties.qDim.title) {
                            $scope.changeAlternativeDimensions(oldDim, altDim, idx, linechartID);
                          }
                        });
                      } else {
                        if (altDim.qDef.qFieldLabels[0] == altDimension) {
                          $scope.changeAlternativeDimensions(oldDim, altDim, idx, linechartID);
                        }
                      }
                    });
                  }
                }
              });
            });
          });
        });
      };

      //*******************************
      //      INITIAL SELECTIONS
      //*******************************
      $scope.checkInitSelections = function () {
        var sessionStorageToken = JSON.parse(sessionStorage.getItem($scope.sessionStorageId));
        var selectionsApplied = sessionStorageToken ? sessionStorageToken.selectionApplied : false;

        if (!selectionsApplied || $scope.layout.props.initSelectionMode == 'ON_SHEET') {
          $scope.willApplyInitSelections = true;
        }
      };

      $scope.setInitSelections = function () {
        if ($scope.willApplyInitSelections) {
          _.each($scope.fields, function (item) {
            if (item.type != 'VARIABLE' && item.type != 'DATERANGE') {
              if (item.initSelection != '' ) {
                var selectMatchEnablers = ['=', '<', '>'];

                if (selectMatchEnablers.indexOf(item.initSelection.substring(0, 1)) > -1) {
                  app.field(item.field).clear();
                  app.field(item.field).selectMatch(item.initSelection);
                } else {
                  var items = item.initSelection.split(item.initSelectionSeparator);
                  var selectArray = [];
                  _.each(items, function (stringItem) {
                    selectArray.push(isNaN(stringItem) ? "{\"qText\": \"" + stringItem + "\"}" : stringItem);
                  });

                  $scope.selectFieldValues(item.field, selectArray, false);
                }
              }
            }
            if (item.type == 'VARIABLE') {
              if (item.initSelection != '') {
                $scope.setVariable(item.variable, item.initSelection);
              }
            }
            if (item.type == 'DATERANGE') {
              if (item.dateFromInitSelection != ''&& item.dateToInitSelection != '') {
                $scope.selectDateFromAndTo(item.field, item.dateFromInitSelection, item.dateToInitSelection, true);
              }
            }
          });
          var token = { selectionApplied: true };
          sessionStorage.setItem($scope.sessionStorageId, JSON.stringify(token));
        }
        $scope.initSelectionsApplied = true;
        $scope.willApplyInitSelections = false;
      };

      $scope.checkInitSelections();

      //*******************************
      //      HANDLE INPUT
      //*******************************
      $scope.onActivate = function ($event) {
      };

      $scope.onSwipeStart = function($event) {
        var target = $($event.target);
          var idx = $($event.target).index();
          var field = target.attr('field');

          $scope.selections.swipe_idx_min = idx;
          $scope.selections.swipe_idx_max = idx;
          $scope.selections.field = field;

          var value = target.attr('datavalue');
          $scope.selections.selectionsMode = !target.hasClass('S');

          if (typeof value != typeof undefined && value != false) {
            if ($scope.selections.selectionsMode) {
              $scope.selections.values_to_select.push(value);
              target.removeClass('A X O');
              target.addClass('S');
            } else {
              $scope.selections.values_to_select.push(value);
              target.removeClass('S');
              target.addClass('X');
            }
        }
      };

      $scope.onSwipeUpdate = function ($event) {
          var target = $($event.originalEvent.target);
          var field = target.attr('field');
          if (field == $scope.selections.field) {
            var idx = $($event.originalEvent.target).index();

            var updateSelection = $scope.selections.swipe_idx_min > idx || $scope.selections.swipe_idx_max < idx;

            if (updateSelection) {
              $scope.selections.swipe_idx_min = $scope.selections.swipe_idx_min > idx ? idx : $scope.selections.swipe_idx_min;
              $scope.selections.swipe_idx_max = $scope.selections.swipe_idx_max < idx ? idx : $scope.selections.swipe_idx_max;

              var list = $($event.originalEvent.target.parentElement.children);

              list.slice($scope.selections.swipe_idx_min, $scope.selections.swipe_idx_max + 1).each(function (item) {
                var elem = this;
                if ($scope.selections.selectionsMode) {
                  if (!$(elem).hasClass('S')) {
                    var value = $(elem).attr('datavalue');
                    if ($scope.selections.values_to_select.indexOf(value) == -1) {
                      if (typeof value != typeof undefined && value != false) {
                        $scope.selections.values_to_select.push(value);
                        $(elem).removeClass('A X O');
                        $(elem).addClass('S');
                      }
                    }
                  }
                } else {
                  if ($(elem).hasClass('S')) {
                    var value = $(elem).attr('datavalue');
                    if ($scope.selections.values_to_select.indexOf(value) == -1) {
                      if (typeof value != typeof undefined && value != false) {
                        $scope.selections.values_to_select.push(value);
                        $(elem).removeClass('S');
                        $(elem).addClass('X');
                      }
                    }
                  }
                }
              });
            }
        }
      };

      $scope.onSwipeCancel = function ($event) {
        console.log('swipecancel event called', $event);
        console.log('datavalue: ', $event.target.attributes.datavalue.value);
      };

      $scope.onSwipe = function ($event) {
        $scope.selections.swipe_idx_min = -1;
        $scope.selections.swipe_idx_max = -1;

        if ($scope.selections.values_to_select != []) {
          $scope.selectFieldValues($scope.selections.field, $scope.selections.values_to_select, true);
          $scope.selections.values_to_select = [];
        }
        $scope.selections.field = '';
      };
    }],
  };
});
