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
function($, _, qlik, $q, $http, props, initProps, stateUtil, fieldApi, extensionUtils, moment,  daterangepicker, dimension, cssContent, cssDaterangepicker, ngTemplate) {
  'use strict';

  //Virtual proxy fix for font path
  var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/sense/app/" ) );
  console.log('window.location.pathname', window.location.pathname);
  console.log('prefix', prefix);
  //IE fix
  if (prefix) {
    if (prefix.substr(0,1) != '/') {
      prefix = '/' + prefix
    }
  }
  console.log('prefix after', prefix);

  cssContent = cssContent.replace(new RegExp('__VirtualProxyPrefix__' , 'g'), prefix );
  
  extensionUtils.addStyleToHeader(cssContent);
  extensionUtils.addStyleToHeader(cssDaterangepicker);  

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
      this.$scope.setSizeMode($element);
      //Remove header if new card theme.
      if($(".qv-card" && !layout.showTitles)){
        $(".qv-object-cl-horizontalselectionbar").find('header.thin').addClass('no-title')//.css({'height':'5px', 'padding-bottom':'2px'});
      } else {
           $(".qv-object-cl-horizontalselectionbar").find('header.thin').removeClass('no-title')//.css({'height':'', 'padding-bottom':''});
      };
    },

    paint: function ($element, layout) {

      this.$scope.setSizeMode($element);

      var app = qlik.currApp()
      console.log('paint', this);
      console.log('layout', layout);
      console.log('fieldApi',fieldApi);

      // app.visualization.create('listbox', null, {
      //     title: 'Month',
      //     qListObjectDef: {
      //       qDef: {
      //           qFieldDefs: ['Datum']
      //       }
      //     }
      // }).then(model => {
      //   model.show('my-listbox')
      // })

      app.getObjectProperties(layout.qInfo.qId).then(function(model){
          console.log('model',model);
      }); 

      //Remove header if new card theme.
      if($(".qv-card" && !layout.showTitles)){
        $(".qv-object-cl-horizontalselectionbar").find('header.thin').addClass('no-title')//.css({'height':'5px', 'padding-bottom':'2px'});
      } else {
           $(".qv-object-cl-horizontalselectionbar").find('header.thin').removeClass('no-title')//.css({'height':'', 'padding-bottom':''});
      };
      
      

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
                $("body").append('<div id="' + daterangepickerContainerId + '" class="bootstrap-horizontalselectionbar" style="position: absolute"></div>');
              }

              var onApplyCallback = function(start, end) {
                  $scope.selectDateFromAndTo(item.field, start.format(item.dateFormat), end.format(item.dateFormat), true);
              };
              var vToday = item.dateToday;
              var vTodayIsEndOfMonth = moment(vToday).endOf('month').format(item.dateFormat) == moment(vToday).format(item.dateFormat)       
              var vR12 = vTodayIsEndOfMonth ? [moment(vToday).subtract(11, 'month').startOf('month'), moment(vToday).endOf('month')]
                                            : [moment(vToday).subtract(12, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')];

              var options = {
                  "showDropdowns": true,
                  "ranges": {
                         'Yesterday': [moment(vToday), moment(vToday)],
                         'Last 7 Days': [moment(vToday).subtract(6, 'days'), moment(vToday)],
                         'Last 14 Days': [moment(vToday).subtract(13, 'days'), moment(vToday)],
                         'Last 28 Days': [moment(vToday).subtract(27, 'days'), moment(vToday)],
                         'Month to Date': [moment(vToday).startOf('month'), moment(vToday)],
                         'Last Month': [moment(vToday).subtract(1, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')],      
                         'Year to Date': [moment(vToday).startOf('year'), moment(vToday)],
                         'Rolling 12 months': vR12
                         //'This Month': [moment(vToday).startOf('month'), moment(vToday).endOf('month')],
                  },
                  "locale": {
                    "format": item.dateFormat,
                    "firstDay": 1,                    
                    },
                  "alwaysShowCalendars": false,
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

      $scope.resolutionBreakpoint = { 'width': 1024, 'height': 35, 'xsmallheight': 25};
      $scope.sizeMode = '';

      $scope.fields = [];
      $scope.variables = [];
      $scope.willApplyInitSelections = false;
      $scope.initSelectionsApplied = false;
      $scope.sessionStorageId = $scope.$parent.layout.qExtendsId ? $scope.$parent.layout.qExtendsId : $scope.$parent.layout.qInfo.qId;

      $scope.setSizeMode = function($element) {
        $scope.sizeMode = ($(document).width() <= $scope.resolutionBreakpoint.width | 
                            $($element).height() <= $scope.resolutionBreakpoint.height) ? 
                             ($($element).height() <= $scope.resolutionBreakpoint.xsmallheight ? 'X-SMALL' : 'SMALL' ) : '';
      }

      $scope.getSizeMode = function() {
        return ($(document).width() <= $scope.resolutionBreakpoint.width | 
                            $($element).height() <= $scope.resolutionBreakpoint.height) ? 
                             ($($element).height() <= $scope.resolutionBreakpoint.xsmallheight ? 'X-SMALL' : 'SMALL' ) : '';
      }

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
              var variableValues = item.variableValues ?  $.map(item.variableValues.split(','), $.trim)  : [];
              
              var data = [];

              for (var i = 0; i < variableValues.length; i++) {
                  data.push({
                    value: variableValues[i]
                  });                
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
                newFlag.icon = prefix + '/Extensions/cl-HorizontalSelectionBar/lib/images/flags/' + iconFilename + '.png'
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
            console.log('DateRange',item);
              var displayText = "";
              var dateStart = null;
              var dateEnd = null;
              var dateMin = getDateFromDateNumberWithFormat(item.daterangeMinValue, item.dateFormat);
              var dateMax = getDateFromDateNumberWithFormat(item.daterangeMaxValue, item.dateFormat);
              var dateFromInitSelection = getDateFromDateNumberWithFormat(item.dateFromInitSelectionValue, item.dateFormat);
              var dateToInitSelection = getDateFromDateNumberWithFormat(item.dateToInitSelectionValue, item.dateFormat);
              var dateToday = isNaN(item.dateTodayValue) ? moment() : getDateFromDateNumberWithFormat(item.dateTodayValue, item.dateFormat);

              var isNotARange = false;
              
              if (item.qListObject.qDimensionInfo.qStateCounts.qSelected > 0) {
               if (item.qListObject.qDimensionInfo.qStateCounts.qSelected < (item.dateMaxValue - item.dateMinValue + 1)) {
                  isNotARange = true;
                }
                dateStart = getDateFromDateNumberWithFormat(item.dateMinValue, item.dateFormat); 
                dateEnd = getDateFromDateNumberWithFormat(item.dateMaxValue, item.dateFormat);                  
                displayText = getDateFromDateNumberWithFormat(item.dateMinValue, item.displayDateFormat) + ' - ' + getDateFromDateNumberWithFormat(item.dateMaxValue, item.displayDateFormat);
              } else {
                displayText = 'Select a date range';
              }

                
              //start.format(item.displayDateFormat) + ' - ' + end.format(item.displayDateFormat)
              newFields.push({
                field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                type: item.listType,
                id: idx,
                visible: item.listVisible,
                dateFromInitSelection: dateFromInitSelection,
                dateToInitSelection: dateToInitSelection,
                dateFormat: item.dateFormat,
                displayDateFormat: item.displayDateFormat,
                displayText: displayText,
                isNotARange: isNotARange,
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

      $scope.selectElemNo = function (event,index, elemNo, bool) {
          
          
          if (event.ctrlKey) {
             $scope.selectElemNos(index, [elemNo],false, false); 

          } else {
              $scope.selectElemNos(index, [elemNo],bool, false); 
          }
      };

      $scope.selectElemNos = function (index, elemNos, bool) {
          console.log('elemNo index', index);
          console.log('elemNo', elemNos);

          var path = '/kfLists/' + index + '/qListObjectDef';
          console.log('path', path);          
          
          $scope.ext.model.enigmaModel.selectListObjectValues(path, elemNos,bool, false); 
          
      };


      $scope.selectDateFromAndTo = function (field, fromDate, toDate, bool) {
          field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
          app.field(field).selectMatch(">=" + fromDate + "<=" + toDate, bool).then(function(reply){
            });
      };

      $scope.selectFieldValues = function (field, items, bool) {
        console.log('items',items);
        field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
        console.log('field',field);
        var selectArray = [];
        _.each(items, function (item) {
          selectArray.push(JSON.parse(item));
        });

        console.log('selectArray',selectArray);
        
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
          console.log('Init select daterange');
              
          _.each($scope.fields, function (item,idx) {
            var path = '/kfLists/' + idx + '/qListObjectDef';
            if (item.type != 'VARIABLE' && item.type != 'DATERANGE') {
              if (item.initSelection != '' ) {
                
                var selectMatchEnablers = ['=', '<', '>'];

                if (selectMatchEnablers.indexOf(item.initSelection.substring(0, 1)) > -1) {
                  app.field(item.field).clear();
                  app.field(item.field).selectMatch(item.initSelection);
                } else {
                  console.log('item.initSelectionSeparator',item.initSelectionSeparator);
                  var items = item.initSelection.split(item.initSelectionSeparator);
                  var selectArray = [];
                  _.each(items, function (stringItem) {
                    selectArray.push(isNaN(stringItem) ? "{\"qText\": \"" + stringItem + "\"}" : stringItem);
                  });

                  $scope.selectFieldValues(item.field, selectArray, false);
                }
                
                
                /*
                $scope.ext.model.enigmaModel.searchListObjectFor(path,item.initSelection).then(function(reply){
                   console.log('enigmaModel Field',reply);
                   
                        $scope.ext.model.enigmaModel.getLayout().then(function(layout){
                           console.log('enigmaModel Field',layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts );
                     
                      if (layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelected == 0) {   
                       console.log('acceptListObjectSearch Field');
                         $scope.ext.model.enigmaModel.acceptListObjectSearch(path,false, false);
                      } else {
                         
                            console.log('abortListObjectSearch Field');               
                         $scope.ext.model.enigmaModel.abortListObjectSearch(path);
                      }
                    });
                });
                 */
              }
            }
            if (item.type == 'VARIABLE') {
              if (item.initSelection != '') {
                $scope.setVariable(item.variable, item.initSelection);
              }
            }
            if (item.type == 'DATERANGE') {
              console.log('Init select daterange', item);
              if (item.dateFromInitSelection != '' && item.dateToInitSelection != '') {
                /*
                var qMatch = '>=' + item.dateFromInitSelection + '<=' + item.dateToInitSelection;
                console.log('qMatch',qMatch);
                $scope.ext.model.enigmaModel.searchListObjectFor(path, qMatch).then(function(reply){
                    $scope.ext.model.enigmaModel.getLayout().then(function(layout){
                      console.log('enigmaModel',layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelected );
                      console.log('enigmaModel',layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelected == 0 &&
                          layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelectedExcluded == 0 );
                      console.log('enigmaModel',layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts );
                      
                      if ((layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelected == 0 &&           
                          layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qSelectedExcluded == 0) || layout.kfLists[idx].qListObject.qDimensionInfo.qStateCounts.qAlternative != 0) {
                         console.log('acceptListObjectSearch');
                         $scope.ext.model.enigmaModel.acceptListObjectSearch(path,false, false);
                      } else {
                        console.log('abortListObjectSearch');
                         $scope.ext.model.enigmaModel.abortListObjectSearch(path);
                      }
                    });
                });
                */
                $scope.selectDateFromAndTo(item.field, item.dateFromInitSelection, item.dateToInitSelection, false);
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

          var value = parseInt(target.attr('datavalue'));
          $scope.selections.selectionsMode = !target.hasClass('S');

          if (typeof value != typeof undefined) {
            if ($scope.selections.selectionsMode) {
              console.log('SwipeStart SelectionsMode', value);
              $scope.selections.values_to_select.push(value);
              target.removeClass('A X O');
              target.addClass('S');
            } else {
              console.log('SwipeStart !SelectionsMode', value);
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
                    var value = parseInt($(elem).attr('datavalue'));
                    if ($scope.selections.values_to_select.indexOf(value) == -1) {
                      if (typeof value != typeof undefined) {
                        $scope.selections.values_to_select.push(value);
                        $(elem).removeClass('A X O');
                        $(elem).addClass('S');
                      }
                    }
                  }
                } else {
                  if ($(elem).hasClass('S')) {
                    var value = parseInt($(elem).attr('datavalue'));
                    if ($scope.selections.values_to_select.indexOf(value) == -1) {
                      if (typeof value != typeof undefined) {
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
          $scope.selectElemNos($scope.selections.field, $scope.selections.values_to_select, true);
          $scope.selections.values_to_select = [];
        }
        $scope.selections.field = '';
      };
    }],
  };
});
