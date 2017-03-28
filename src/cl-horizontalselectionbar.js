define([
  'jquery',
  'underscore',
  'qlik',
  'translator',
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
  function ($, _, qlik, translator, $q, $http, props, initProps, stateUtil, fieldApi, extensionUtils, moment, daterangepicker, dimension, cssContent, cssDaterangepicker, ngTemplate) {
    'use strict';

    //Virtual proxy fix for font path
    var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/sense/app/"));
    //IE fix
    if (prefix) {
      if (prefix.substr(0, 1) !== '/') {
        prefix = '/' + prefix;
      }
    }
    cssContent = cssContent.replace(new RegExp('__VirtualProxyPrefix__', 'g'), prefix);

    extensionUtils.addStyleToHeader(cssContent);
    extensionUtils.addStyleToHeader(cssDaterangepicker);

    function getQSDateNumFromMoment(momentDate) {
      var milli = momentDate.startOf('day').toDate().getTime();
      var offset = momentDate.utcOffset() * 60000;
      return ((milli + offset) / 86400 / 1000) + 25567 + 1;
    }

    function getJsDateFromNumber(numDate) {
      // JavaScript dates can be constructed by passing milliseconds
      // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

      // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")             
      // 2. Convert to milliseconds.
      return new Date((numDate - (25567 + 1)) * 86400 * 1000);
    }

    function getMillisecondFromDateNumber(numDate) {
      var offset = moment().utcOffset();

      return ((numDate - (25567 + 1)) * 86400) - offset;
    }

    function getDateFromDateNumberWithFormat(numDate, dateFormat) {
      return moment(getMillisecondFromDateNumber(numDate), 'X').utc().format(dateFormat);
    }

    function parseDate(date, dateFormat) {
      var parsedDate;
      if (date) {
        if (_.isNumber(Number(date)) && Number(date) < 100000) {
          parsedDate = getDateFromDateNumberWithFormat(date, dateFormat);
        } else {
          parsedDate = moment(date, dateFormat, false).format(dateFormat);
        }
      }

      return parsedDate;

    }

    return {

      definition: props,
      initialProperties: initProps,
      snapshot: {
        canTakeSnapshot: false
      },
      support: {
        export: true,
        exportData: false
      },


      getDropFieldOptions: function (a, b, c, d) {
        d();
      },

      getDropDimensionOptions: function (a, b, c, d) {
        d();
      },

      getDropMeasureOptions: function (a, b, c, d) {
        d();
      },

      resize: function ($element, layout) {
        this.$scope.setSizeMode($element);
        //Remove header if new card theme.
        if ($(".qv-card" && !layout.showTitles)) {
          $(".qv-object-cl-horizontalselectionbar").find('header.thin').addClass('no-title');
        } else {
          $(".qv-object-cl-horizontalselectionbar").find('header.thin').removeClass('no-title');
        };
      },

      paint: function ($element, layout) {

        console.groupCollapsed('Basic Objects');
        console.info('$element:');
        console.log($element);
        console.info('layout:');
        console.log(layout);
        console.groupEnd();

        this.$scope.setSizeMode($element);

        var _this = this;

        //Remove header if new card theme.
        if ($(".qv-card" && !layout.showTitles)) {
          $(".qv-object-cl-horizontalselectionbar").find('header.thin').addClass('no-title');
        } else {
          $(".qv-object-cl-horizontalselectionbar").find('header.thin').removeClass('no-title');
        };

        this.$scope.props = layout.props;
        this.$scope.qId = layout.qInfo.qId;

        var format = {};

        var localeInfo = this.backendApi.localeInfo;

        format.CollationLocale = localeInfo.qCollation;
        format.DateFormat = localeInfo.qDateFmt;
        format.MonthNames = localeInfo.qCalendarStrings.qMonthNames;
        format.FirstWeekDay = localeInfo.qFirstWeekDay + 1 > 6 ? 0 : localeInfo.qFirstWeekDay + 1;
        format.DayNames = _.clone(localeInfo.qCalendarStrings.qDayNames);

        console.log('format before', format.DayNames);
        if (format.FirstWeekDay > 0) {
          for (var index = 0; index < format.FirstWeekDay; index++) {
            format.DayNames.unshift(format.DayNames.pop());
                  console.log('format inside loop', format.DayNames);
          }
        } 
        

        console.log('localeInfo ', localeInfo)
        console.log('format ', format)

        _this.$scope.format = format;
        _this.$scope.setFields(layout.kfLists);

        if (!_this.$scope.initSelectionsApplied) {
          _this.$scope.setInitSelections();
        }

        return qlik.Promise.resolve();
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


        $scope.$on('onRepeatLast', function (scope, element, attrs) {

          //Remove all containers
          $("[id^=daterangepicker-container-" + $scope.qId + "]").remove();
          //Append containers to the body and setup the daterangepicker
          _.each($scope.fields, function (item) {

            if (item.type === "DATERANGE") {
              var daterangepickerContainerId = "daterangepicker-container-" + $scope.qId + '-' + item.id;
              var daterangepickerId = "daterange-" + $scope.qId + '-' + item.id;

              if ($("#" + daterangepickerContainerId).length == 0) {
                $("body").append('<div id="' + daterangepickerContainerId + '" class="bootstrap-horizontalselectionbar" style="position: absolute"></div>');
              }
              var vToday = item.dateToday;

              var onApplyCallback = function (start, end) {
                $scope.selectDateFromAndTo(item.field, start.format($scope.format.DateFormat), end.format($scope.format.DateFormat), true);
              };

              var options = {
                "showDropdowns": true,
                "locale": {
                  "format": $scope.format.DateFormat,
                  "firstDay": $scope.format.FirstWeekDay,
                  "monthNames": $scope.format.MonthNames,
                  "daysOfWeek": $scope.format.DayNames,
                  "applyLabel": translator.get('Common.Apply'),
                  "cancelLabel": translator.get('Common.Cancel'),
                  "customRangeLabel": item.customRangeLabel,
                },
                "alwaysShowCalendars": item.alwaysShowCalendars,
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

              if (item.dateRanges) {
                options.ranges = {};
                _.each(item.dateRanges, function (dateRange) {

                  var vTodayIsEndOfMonth = moment(vToday).endOf('month').format($scope.format.DateFormat) == moment(vToday).format($scope.format.DateFormat);
                  switch (dateRange.value) {
                    case 'TODAY':
                      options.ranges[dateRange.label] = [moment(vToday), moment(vToday)];
                      break;
                    case 'YESTERDAY':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(1, 'days'), moment(vToday).subtract(1, 'days')];
                      break;
                    case 'LAST07DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(6, 'days'), moment(vToday)];
                      break;
                    case 'LAST14DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(13, 'days'), moment(vToday)];
                      break;
                    case 'LAST28DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(27, 'days'), moment(vToday)];
                      break;
                    case 'LAST30DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(29, 'days'), moment(vToday)];
                      break;
                    case 'LAST60DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(59, 'days'), moment(vToday)];
                      break;
                    case 'LAST90DAYS':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(89, 'days'), moment(vToday)];
                      break;
                    case 'THISWEEK':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('week'), moment(vToday).endOf('week')];
                      break;
                    case 'LASTWEEK':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(1, 'week').startOf('week'), moment(vToday).subtract(1, 'week').endOf('week')];
                      break;
                    case 'THISMONTH':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('month'), moment(vToday).endOf('month')];
                      break;
                    case 'LASTMONTH':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(1, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')];
                      break;
                    case 'THISQUARTER':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('quarter'), moment(vToday).endOf('quarter')];
                      break;
                    case 'LASTQUARTER':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(1, 'quarter').startOf('quarter'), moment(vToday).subtract(1, 'quarter').endOf('quarter')];
                      break;
                    case 'THISYEAR':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('year'), moment(vToday).endOf('year')];
                      break;
                    case 'LASTYEAR':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(1, 'year').startOf('year'), moment(vToday).subtract(1, 'year').endOf('year')];
                      break;
                    case 'WTD':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('week'), moment(vToday)];
                      break;
                    case 'MTD':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('month'), moment(vToday)];
                      break;
                    case 'QTD':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('quarter'), moment(vToday)];
                      break;
                    case 'YTD':
                      options.ranges[dateRange.label] = [moment(vToday).startOf('year'), moment(vToday)];
                      break;
                    case 'R12':
                      options.ranges[dateRange.label] = [moment(vToday).subtract(11, 'month'), moment(vToday)];
                      break;
                    case 'R12FM':
                      options.ranges[dateRange.label] = vTodayIsEndOfMonth ? [moment(vToday).subtract(11, 'month').startOf('month'), moment(vToday).endOf('month')] :
                        [moment(vToday).subtract(12, 'month').startOf('month'), moment(vToday).subtract(1, 'month').endOf('month')];
                      break;
                    default:
                      console.log('not a valid daterange');
                  }
                });
              }
              console.log('daterangepicker.options', options);

              $('#' + daterangepickerId).daterangepicker(options, onApplyCallback);

              $('#' + daterangepickerContainerId + ' div').first().css('display', 'inline-flex');

            }
          });
        });

        $scope.resolutionBreakpoint = {
          'width': 1024,
          'height': 35,
          'xsmallheight': 25
        };
        $scope.sizeMode = '';

        $scope.fields = [];
        $scope.variables = [];
        $scope.willApplyInitSelections = false;
        $scope.initSelectionsApplied = false;
        $scope.sessionStorageId = $scope.$parent.layout.qExtendsId ? $scope.$parent.layout.qExtendsId : $scope.$parent.layout.qInfo.qId;

        $scope.setSizeMode = function ($element) {
          $scope.sizeMode = ($(document).width() <= $scope.resolutionBreakpoint.width |
            $($element).height() <= $scope.resolutionBreakpoint.height) ?
            ($($element).height() <= $scope.resolutionBreakpoint.xsmallheight ? 'X-SMALL' : 'SMALL') : '';
        }

        $scope.getSizeMode = function () {
          return ($(document).width() <= $scope.resolutionBreakpoint.width |
            $($element).height() <= $scope.resolutionBreakpoint.height) ?
            ($($element).height() <= $scope.resolutionBreakpoint.xsmallheight ? 'X-SMALL' : 'SMALL') : '';
        }

        $scope.getClass = function () {
          return stateUtil.isInAnalysisMode() ? "" : "no-interactions";
        };
        //*******************************
        //      TRANSFORM MODEL
        //*******************************
        $scope.setFields = function (kfLists) {
          var newFields = [];
          _.each(kfLists, function (item, idx) {
            var qMatrix = item.qListObject.qDataPages[0] ? item.qListObject.qDataPages[0].qMatrix : [];

            switch (item.listType) {
              case "FIELD":
                newFields.push({
                  field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                  type: item.listType,
                  id: idx,
                  visible: item.listVisible,
                  initSelection: item.initSelection,
                  initSelectionSeparator: item.initSelectionSeparatorComma ? ',' : item.initSelectionSeparator,
                  label: item.label,
                  data: qMatrix,
                });
                break;
              case "VARIABLE":
                var variableValues = item.variableValues ? $.map(item.variableValues.split(','), $.trim) : [];

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
                  initSelectionSeparator: item.initSelectionSeparatorComma ? ',' : item.initSelectionSeparator,
                  label: item.label,
                  data: data,
                });
                break;
              case "DATERANGE":
                console.log('DateRange', item);
                var displayText = "";
                var dateStart = null;
                var dateEnd = null;
                var dateFormat = $scope.format.DateFormat;
                var displayFormat = item.date.displayFormat === 'DEFAULT' ? dateFormat : item.date.displayFormat;
                var dateMin = parseDate(item.date.rangeMin, dateFormat);
                var dateMax = parseDate(item.date.rangeMax, dateFormat);
                var dateInitSelectionFrom = parseDate(item.date.initSelectionFrom, dateFormat);
                var dateInitSelectionTo = parseDate(item.date.initSelectionTo, dateFormat);
                var dateToday = isNaN(item.date.dateFormat) ? moment() : parseDate(item.date.today, dateFormat);
                var dateRanges = item.date.useDateRanges ? item.date.dateRanges : null;
                var alwaysShowCalendars = !item.date.useDateRanges ? true : item.date.alwaysShowCalenders;
                var customRangeLabel = item.date.customRangeLabel;
                var isNotARange = false;
                parseDate(item.date.rangeMin, dateFormat);


                if (item.qListObject.qDimensionInfo.qStateCounts.qSelected > 0) {
                  if (item.qListObject.qDimensionInfo.qStateCounts.qSelected < (item.date.max - item.date.min + 1)) {
                    isNotARange = true;
                  }
                  console.log('displayText item',item);
                  dateStart = parseDate(item.date.min, dateFormat);
                  dateEnd = parseDate(item.date.max, dateFormat);
                  displayText = parseDate(item.date.min, displayFormat) + ' - ' + parseDate(item.date.max, displayFormat);
                } else {
                  displayText = item.date.defaultText;
                }


                //start.format(item.displayDateFormat) + ' - ' + end.format(item.displayDateFormat)
                newFields.push({
                  field: item.qListObject.qDimensionInfo.qGroupFieldDefs[0],
                  type: item.listType,
                  id: idx,
                  visible: item.listVisible,
                  dateFromInitSelection: dateInitSelectionFrom,
                  dateToInitSelection: dateInitSelectionTo,
                  dateFormat: dateFormat,
                  displayDateFormat: displayFormat,
                  displayText: displayText,
                  isNotARange: isNotARange,
                  dateStart: dateStart,
                  dateEnd: dateEnd,
                  dateToday: dateToday,
                  dateMin: dateMin,
                  dateMax: dateMax,
                  label: item.label,
                  dateRanges: dateRanges,
                  alwaysShowCalendars: alwaysShowCalendars,
                  customRangeLabel: customRangeLabel,
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

        $scope.selectElemNo = function (event, index, elemNo, bool) {


          if (event.ctrlKey) {
            $scope.selectElemNos(index, [elemNo], false, false);

          } else {
            $scope.selectElemNos(index, [elemNo], bool, false);
          }
        };

        $scope.selectElemNos = function (index, elemNos, bool) {
          var path = '/kfLists/' + index + '/qListObjectDef';
          $scope.ext.model.enigmaModel.selectListObjectValues(path, elemNos, bool, false);
        };


        $scope.selectDateFromAndTo = function (field, fromDate, toDate, bool) {
          field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
          app.field(field).selectMatch(">=" + fromDate + "<=" + toDate, bool).then(function (reply) { });
        };

        $scope.selectFieldValues = function (field, items, bool) {
          field = field.substring(0, 1) == "=" ? field.substring(1, field.length) : field;
          var selectArray = [];
          _.each(items, function (item) {
            selectArray.push(JSON.parse(item));
          });


          app.field(field).selectValues(selectArray, bool).catch(function (err) {
            console.error(err);
            //location.reload(true);
          })
        };

        //*******************************
        //      HELPER FUNCTIONS
        //*******************************
        $scope.setVariable = function (variable, value) {
          app.variable.setStringValue(variable, value).then(function () { });
        };

        $scope.getValue = function (item) {
          return isNaN(item.qNum) ? JSON.stringify({
            qText: item.qText
          }) : JSON.stringify(item.qNum);
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

            _.each($scope.fields, function (item, idx) {
              var path = '/kfLists/' + idx + '/qListObjectDef';
              if (item.type !== 'VARIABLE' && item.type !== 'DATERANGE') {
                if (item.initSelection !== '') {

                  var selectMatchEnablers = ['=', '<', '>'];

                  if (selectMatchEnablers.indexOf(item.initSelection.substring(0, 1)) > -1) {
                    app.field(item.field).clear();
                    app.field(item.field).selectMatch(item.initSelection);
                  } else {
                    var selectArray = [];
                    var items = item.initSelection.split(item.initSelectionSeparator ? item.initSelectionSeparator : ';');
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
              if (item.type === 'DATERANGE') {
                if (item.dateFromInitSelection !== '' && item.dateToInitSelection != '') {
                  $scope.selectDateFromAndTo(item.field, item.dateFromInitSelection, item.dateToInitSelection, false);
                }
              }
            });
            var token = {
              selectionApplied: true
            };
            sessionStorage.setItem($scope.sessionStorageId, JSON.stringify(token));
          }
          $scope.initSelectionsApplied = true;
          $scope.willApplyInitSelections = false;
        };

        $scope.checkInitSelections();

        //*******************************
        //      HANDLE INPUT
        //*******************************
        $scope.onActivate = function ($event) { };

        $scope.onSwipeStart = function ($event) {
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