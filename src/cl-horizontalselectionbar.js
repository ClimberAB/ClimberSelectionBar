define([
  'jquery',
  'underscore',
  'qlik',
  'ng!$q',
  'ng!$http',
  './properties',
  './initialproperties',
  './lib/js/extensionUtils',
  'general.models/library/dimension',
  'text!./lib/css/style.css',
  'text!./lib/partials/template.html',
  './lib/js/clTouch',
],
function($, _, qlik, $q, $http, props, initProps, extensionUtils, dimension, cssContent, ngTemplate) {
  'use strict';

  extensionUtils.addStyleToHeader(cssContent);

  return {

    definition: props,
    initialProperties: initProps,
    snapshot: { canTakeSnapshot: false },
    export: false,
    exportData: false,


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
      this.$scope.sizeMode = ($(document).width() < this.$scope.resolutionBreakpoint) ? 'SMALL':'';

      this.$scope.setFields(layout.kfLists);
      this.$scope.props = layout.props;

      if (!this.$scope.initSelectionsApplied) {
        this.$scope.setInitSelections();
      }
    },

    template: ngTemplate,

    controller: ['$scope', '$element', function ($scope, $element) {
      var app = qlik.currApp();

      $scope.selections = {
        field: '',
        swipe_idx_min: -1,
        swipe_idx_max: -1,
        values_to_select: [],
        selectionMode: '',
      };

      $scope._inAnalysisState = true;
      $scope.resolutionBreakpoint = 1024;
      $scope.sizeMode = '';

      $scope.fields = [];
      $scope.variables = [];
      $scope.willApplyInitSelections = false;
      $scope.initSelectionsApplied = false;
      $scope.sessionStorageId = $scope.$parent.layout.qExtendsId ? $scope.$parent.layout.qExtendsId : $scope.$parent.layout.qInfo.qId;

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
                visible: item.listVisible,
                initSelection: item.initSelection,
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
              console.log('Variable: ', item);
              console.log('GetVariable: ', app);

              newFields.push({
                variable: item.variable,
                variableValue: item.variableValue,
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
                visible: item.listVisible,
                initSelection: item.initSelection,
                label: item.label,
                data: data,
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
        console.log('selectValue',$scope);
        if ($scope.$parent.object._inAnalysisState) {
          if (event.ctrlKey) {
            $scope.selectFieldValues(field, [$scope.getValue(item)], false);
          } else {
            $scope.selectFieldValues(field, [$scope.getValue(item)], bool);
          }
        }
      };

      $scope.selectFieldValues = function (field, items, bool) {
        var selectArray = [];
        _.each(items, function (item) {
          selectArray.push(JSON.parse(item));
        });

        app.field(field).selectValues(selectArray, bool);
      };

      //*******************************
      //      HELPER FUNCTIONS
      //*******************************
      $scope.setVariable = function (variable, value, altDim) {
        if (altDim) {
          $scope.prepareAlternativeDimension(altDim);
        }
        app.variable.setStringValue(variable, value).then(function () {
          //    $scope.variables[variable] = value;

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
            if (item.initSelection != '' && item.type != 'VARIABLE') {
              var selectMatchEnablers = ['=', '<', '>'];

              if (selectMatchEnablers.indexOf(item.initSelection.substring(0, 1)) > -1) {
                app.field(item.field).clear();
                app.field(item.field).selectMatch(item.initSelection);
              } else {
                var items = item.initSelection.split(',');
                var selectArray = [];
                _.each(items, function (stringItem) {
                  selectArray.push(isNaN(stringItem) ? "{\"qText\": \"" + stringItem + "\"}" : stringItem);
                });

                $scope.selectFieldValues(item.field, selectArray, false);
              }
            }
            if (item.type == 'VARIABLE') {
              if (item.initSelection != '') {
                $scope.setVariable(item.variable, item.initSelection);
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
        if ($scope.$parent.object._inAnalysisState) {
          var target = $($event.target);
          var idx = $($event.target).index();
          var field = target.attr('field');

          $scope.selections.swipe_idx_min = idx;
          $scope.selections.swipe_idx_max = idx;
          $scope.selections.field = field;

          var value = target.attr('datavalue');
          $scope.selections.selectionsMode = !target.hasClass('S');

          if (typeof value !== typeof undefined && value !== false) {
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
        }
      };

      $scope.onSwipeUpdate = function ($event) {
        if ($scope.$parent.object._inAnalysisState) {
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
                      if (typeof value !== typeof undefined && value !== false) {
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
                      if (typeof value !== typeof undefined && value !== false) {
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
        }
      };

      $scope.onSwipeCancel = function ($event) {
        console.log('swipecancel event called', $event);
        console.log('datavalue: ', $event.target.attributes.datavalue.value);
      };

      $scope.onSwipe = function ($event) {
        if ($scope.$parent.object._inAnalysisState) {
          $scope.selections.swipe_idx_min = -1;
          $scope.selections.swipe_idx_max = -1;

          if ($scope.selections.values_to_select !== []) {
            $scope.selectFieldValues($scope.selections.field, $scope.selections.values_to_select, true);
            $scope.selections.values_to_select = [];
          }
          $scope.selections.field = '';
        }
      };
    }],
  };
});
