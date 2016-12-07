define([
        'jquery',
        'underscore',
        'qlik',
        'ng!$q',
        'ng!$http',
        './properties',
        './initialproperties',
        'client.utils/state',
        './lib/js/extensionUtils',
        './lib/external/Sortable/Sortable',
        'css!./lib/css/style.css',
        //'text!./lib/partials/customreport.ng.html',
    ],
    function($, _, qlik, $q, $http, props, initProps, stateUtil, extensionUtils, sortable, cssContent) {
        'use strict';

        var ngTemplate = '<div qv-extension id="cl-customreport-container" style="height: 100%; position: relative; overflow: auto;" ng-class="getClass()"> <div ng-show="collapsed"><div class="containerlabel"><i style="padding-right: 10px; padding-left: 10px" class="icon-table"></i>{{data.displayText}}</div></div><div ng-hide="collapsed"> <div ng-show="fieldsAndSortbarVisible" class="container_left" ng-style="getContainerWidth(&apos;left&apos;)"> <div class="bootstrap" style="margin-right: 12px;""> <div class="form-group"> <div class="containerlabel" q-translation="library.Visualizations"></div><form name="myForm"> <lui-select name="mySelect" id="mySelect" ng-change="changeTable()" ng-options="option.qMeta.title for option in data.masterObjectList track by option.qInfo.qId" ng-model="data.activeTable"></lui-select> </form> </div><div class="containerlabel" q-translation="Common.Dimensions"></div><ul id="dimensionSortable" class="lui-list dimension-list" ng-style="getListMaxHeight(&apos;dimension&apos;)"> <li qv-swipe="swipe($event)" ng-class="dimension.handle" class="lui-list__item" ng-click="selectItem(dimension)" title="{{dimension.title +&apos;\n&apos; + dimension.description}}" ng-repeat="dimension in report.dimensions" data-id={{dimension.dataId}}> <div class="lui-list__text">{{dimension.title}}</div><div class="icon-tick lui-list-icon" ng-if="dimension.selected"></div></li></ul> <div class="containerlabel" q-translation="Common.Measures"></div><ul id="measureSortable" class="lui-list measure-list" ng-style="getListMaxHeight(&apos;measure&apos;)"> <li class="lui-list__item" ng-click="selectItem(measure)" title="{{measure.title +&apos;\n&apos; + measure.description}}" ng-repeat="measure in report.measures"> <div class="lui-list__text">{{measure.title}}</div><div class="lui-icon--tick lui-icon" ng-if="measure.selected"></div></li></ul> </div></div><div class="container_right" ng-style="getContainerWidth(&apos;right&apos;)"> <div ng-show="fieldsAndSortbarVisible" class="bootstrap"> <div class="containerlabel">{{data.displayText}}<i title="Clear All" class="icon-toolbar-clearselections" ng-click="clearAll()" ng-class="report.state.length==0 ? &apos;disabled&apos;: &apos;&apos;"></i><i title="Hide fields/sortbar" class="icon-maximize" ng-click="hideFieldAndSortbar()"></i><i title="Export" class="icon-toolbar-sharelist" ng-click="exportData(&apos;exportToExcel&apos;)"></i></div><ul id="reportSortable" ng-class="{plain:!data.tagColor}" class="sortablelist" > <li ng-class="item.type==&apos;dimension&apos; ? &apos;label-dimension&apos; : &apos;label-measure&apos;" title="{{item.title +&apos;\n&apos; + item.description}}" ng-repeat="item in report.state"> <div>{{item.title}}</div><span class="icon-vtabs-delete" ng-click="removeItem(item)"></span> </li></ul> </div > <div ng-style="getTableHeight()"> <div class="rain rain-loader qv-block-ui ng-scope" ng-style="getTableHeight()" style="top:inherit;" ng-class="{&apos;qv-fade-out&apos;: fadeOut, &apos;qv-transparent-background&apos;: transparentBackground}" tid="3e1f54"> <div class="qv-animate progress-loader qv-loader-container qv-loader-huge qv-fade-in" ng-class="ngClasses"> <div class="one"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205c-26.7,0-51.8-10.4-70.7-29.3C15.4,156.8,5,131.7,5,105s10.4-51.8,29.3-70.7C53.2,15.4,78.3,5,105,5 c55.1,0,100,44.9,100,100S160.1,205,105,205z M105,23.7c-44.8,0-81.3,36.5-81.3,81.3c0,44.8,36.5,81.3,81.3,81.3 c44.8,0,81.3-36.5,81.3-81.3C186.3,60.2,149.8,23.7,105,23.7z"></path> </g> </svg> </div><div class="two"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205C49.9,205,5,160.1,5,105C5,49.9,49.9,5,105,5c55.1,0,100,44.9,100,100C205,160.1,160.1,205,105,205z M105,19.4c-47.2,0-85.6,38.4-85.6,85.6c0,47.2,38.4,85.6,85.6,85.6c47.2,0,85.6-38.4,85.6-85.6C190.6,57.8,152.2,19.4,105,19.4z"></path> </g> </svg> </div><div class="three"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205c-26.7,0-51.8-10.4-70.7-29.3C15.4,156.8,5,131.7,5,105s10.4-51.8,29.3-70.7C53.2,15.4,78.3,5,105,5 c55.1,0,100,44.9,100,100S160.1,205,105,205z"></path> </g> </svg> </div><div class="four"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205C49.9,205,5,160.1,5,105C5,49.9,49.9,5,105,5c55.1,0,100,44.9,100,100C205,160.1,160.1,205,105,205z M105,19.4c-47.2,0-85.6,38.4-85.6,85.6c0,47.2,38.4,85.6,85.6,85.6c47.2,0,85.6-38.4,85.6-85.6C190.6,57.8,152.2,19.4,105,19.4z"></path> </g> </svg> </div><div class="five"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105 205C49.9 205 5 160.1 5 105C5 49.9 49.9 5 105 5c55.1 0 100 44.9 100 100C205 160.1 160.1 205 105 205z M105 10.5c-52.1 0-94.5 42.4-94.5 94.5c0 52.1 42.4 94.5 94.5 94.5c52.1 0 94.5-42.4 94.5-94.5C199.5 52.9 157.1 10.5 105 10.5z"></path> </g> </svg> </div><div class="six"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205c-26.7,0-51.8-10.4-70.7-29.3C15.4,156.8,5,131.7,5,105s10.4-51.8,29.3-70.7C53.2,15.4,78.3,5,105,5 c55.1,0,100,44.9,100,100S160.1,205,105,205z"></path> </g> </svg> </div><div class="seven"> <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 210 210" xml:space="preserve"> <g> <path class="path" d="M105,205C49.9,205,5,160.1,5,105C5,49.9,49.9,5,105,5c55.1,0,100,44.9,100,100C205,160.1,160.1,205,105,205z M105,19.4c-47.2,0-85.6,38.4-85.6,85.6c0,47.2,38.4,85.6,85.6,85.6c47.2,0,85.6-38.4,85.6-85.6C190.6,57.8,152.2,19.4,105,19.4z"></path> </g> </svg> </div></div><div class="qv-loader-text ng-scope qv-loader-huge qv-fade-in" ng-if="rainText" ng-class="ngClasses"> <div ng-show="rainText.text" q-translation="Export.Exporting" class="ng-hide"></div></div></div><div id="customreporttable" class="qvobject" ></div></div></div><div></div>';
        ngTemplate = ngTemplate.replace("&apos;","'");

        extensionUtils.addStyleToHeader(cssContent);

        return {

            definition: props,
            initialProperties: initProps,
            snapshot: {
                canTakeSnapshot: false
            },

            resize: function($element, layout) {

                this.$scope.size.clientHeight = $element.context.clientHeight;
                this.$scope.size.clientWidth = $element.context.clientWidth;
                
                this.$scope.handleResize($element,layout.props.allowCollapse);

            },

            paint: function($element, layout) {
                console.log('layout',layout);

                this.$scope.size.clientHeight = $element.context.clientHeight;
                this.$scope.size.clientWidth = $element.context.clientWidth;
                
                this.$scope.handleResize($element,layout.props.allowCollapse); 
                
               
            },

            getExportRawDataOptions: function(a, c, e) {
                c.getVisualization().then(function(visualization) {
                    if (!$('#cl-customreport-container').scope().collapsed) {
                        if ($('#cl-customreport-container').scope().fieldsAndSortbarVisible) {                            
                            a.addItem({
                                translation: "Hide fields/sortbar",
                                tid: "Expand",
                                icon: "icon-maximize",
                                select: function() {
                                    console.log($('#cl-customreport-container').scope());
                                    $('#cl-customreport-container').scope().hideFieldAndSortbar();
                                }
                            });

                        } else {
                            a.addItem({
                                translation: "Show fields/sortbar",
                                tid: "Collapse",
                                icon: "icon-minimize",
                                select: function() {
                                    console.log($('#cl-customreport-container').scope());
                                    $('#cl-customreport-container').scope().showFieldAndSortbar();
                                }
                            });
                        } 
                    }
                    var count = _.countBy($('#cl-customreport-container').scope().report.state, 'type');
                    
                    var unselectedDimensionCount = count.dimension ? $('#cl-customreport-container').scope().report.dimensions.length - count.dimension 
                                                                   : $('#cl-customreport-container').scope().report.dimensions.length;
                    var unselectedMeasuresCount = count.measure ? $('#cl-customreport-container').scope().report.measures.length - count.measure 
                                                                   : $('#cl-customreport-container').scope().report.measures.length;
                    //Add fields
                    if (unselectedDimensionCount || unselectedMeasuresCount) {

                        var submenuAdd = a.addItem({
                            translation: "Add fields",
                            tid: "add-submenu",
                            icon: "icon-add"
                        });
                        if (unselectedDimensionCount) {

                            var submenuAddDimension = submenuAdd.addItem({
                                translation: "Add dimension",
                                tid: "add-dimension-submenu",
                                icon: "icon-add"
                            });
                            
                             _.each($('#cl-customreport-container').scope().report.dimensions, function(item){
                                console.log(item);
                                if (!item.selected) {
                                    submenuAddDimension.addItem({
                                        translation: item.title,
                                        tid: "dimension",
                                        select: function() {
                                            $('#cl-customreport-container').scope().selectItem(item);
                                        }
                                    });
                                }
                             });
                         }

                         if (unselectedMeasuresCount) {

                            var submenuAddMeasure = submenuAdd.addItem({
                                translation: "Add measure",
                                tid: "add-measure-submenu",
                                icon: "icon-add"
                            });
                            
                             _.each($('#cl-customreport-container').scope().report.measures, function(item){
                                console.log(item);
                                if (!item.selected) {
                                    submenuAddMeasure.addItem({
                                        translation: item.title,
                                        tid: "switch",
                                        select: function() {
                                            $('#cl-customreport-container').scope().selectItem(item);
                                        }
                                    });
                                }
                             });
                         }

                     }
                    
                    //Remove fields
                    console.log('count',count);
                    if (count.dimension || count.measure) {

                        var submenuRemove = a.addItem({
                            translation: "Remove fields",
                            tid: "remove-submenu",
                            icon: "icon-remove"
                        });
                        if (count.dimension) {

                            var submenuRemoveDimension = submenuRemove.addItem({
                                translation: "Remove dimension",
                                tid: "remove-dimension-submenu",
                                icon: "icon-remove"
                            });
                            
                             _.each($('#cl-customreport-container').scope().report.dimensions, function(item){
                                console.log(item);
                                if (item.selected) {
                                    submenuRemoveDimension.addItem({
                                        translation: item.title,
                                        tid: "dimension",
                                        select: function() {
                                            $('#cl-customreport-container').scope().removeItem(item);
                                        }
                                    });
                                }
                             });
                         }

                         if (count.measure) {

                            var submenuRemoveMeasure = submenuRemove.addItem({
                                translation: "Remove measure",
                                tid: "remove-measure-submenu",
                                icon: "icon-remove"
                            });
                            
                             _.each($('#cl-customreport-container').scope().report.measures, function(item){
                                console.log(item);
                                if (item.selected) {
                                    submenuRemoveMeasure.addItem({
                                        translation: item.title,
                                        tid: "switch",
                                        select: function() {
                                            $('#cl-customreport-container').scope().removeItem(item);
                                        }
                                    });
                                }
                             });
                         }

                     }
                                                           
                     if ($('#cl-customreport-container').scope().data.masterObjectList.length > 1) {
                        var submenuSwitchTable = a.addItem({
                            translation: "Switch table",
                            tid: "switch-submenu",
                            icon: "icon-cogwheel"
                        });
                         _.each($('#cl-customreport-container').scope().data.masterObjectList, function(item){
                            console.log(item);
                            if (item.qInfo.qId !=  $('#cl-customreport-container').scope().data.activeTable.qInfo.qId) {
                                submenuSwitchTable.addItem({
                                    translation: item.qMeta.title,
                                    tid: "switch",
                                    icon: "icon-table",
                                    select: function() {
                                        $('#cl-customreport-container').scope().data.activeTable = item;
                                        $('#cl-customreport-container').scope().changeTable();
                                    }
                                });
                            }
                         });     
                     }
                    
                    return a.addItem({
                        translation: "contextMenu.export",
                        tid: "export",
                        icon: "icon-toolbar-sharelist",
                        select: function() {
                            console.log($('#cl-customreport-container').scope());
                            $('#cl-customreport-container').scope().exportData('exportToExcel');
                        }
                    }), void e.resolve();
                });
            },

              

            template: ngTemplate,
            
            controller: ['$scope', function($scope) {

                $scope.size = {
                    clientHeight: -1,
                    clientWidth: -1
                }

                $scope.fieldsAndSortbarVisible = true;
                $scope.collapsed = false;
                $scope.rainText = false;
                $scope.minWidthCollapsed = 200;
                $scope.minHeightCollapsed = 200;


                $scope.data = {
                    tag: null,
                    tagColor: true,
                    sortOrder: 'SortByA',
                    activeTable: null,
                    displayText: 'Custom Report',
                    masterObjectList: [],
                    masterDimensions: [],
                    masterMeasures: []
                };

                $scope.report = {
                    tableID: '',
                    title: null,
                    supressZero: false,
                    report: [],
                    dimensions: [],
                    measures: [],
                    interColumnSortOrder: [],
                };

                var dragoverHandler = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                };

                $scope.reportConfig = {
                    group: {
                        name: "report",
                        put: ['dim', 'measure']
                    },
                    animation: 150,
                    ghostClass: "ghost",
                    onStart: function( /** ngSortEvent */ evt) {
                        $('body').on('dragstart', '.qv-panel-wrap', dragoverHandler);
                        $('body').on('dragover', '.qv-panel-wrap', dragoverHandler);
                    },
                    onEnd: function( /** ngSortEvent */ evt) {
                        $('body').off('dragstart', '.qv-panel-wrap', dragoverHandler);
                        $('body').off('dragover', '.qv-panel-wrap', dragoverHandler);
                    },
                    onSort: function( /** ngSortEvent */ evt) {
                        $scope.report.state.splice(evt.newIndex, 0, $scope.report.state.splice(evt.oldIndex, 1)[0]);
                        $scope.updateTable();
                    },
                };

                var app = qlik.currApp();

                var localStorageId = $scope.$parent.layout.qExtendsId ? $scope.$parent.layout.qExtendsId : $scope.$parent.layout.qInfo.qId;

                $scope.handleResize = function($element, allowCollapse) {

                    if ($element.context.clientHeight < $scope.minHeightCollapsed || $element.context.clientWidth < $scope.minWidthCollapsed) {
                        if (!$scope.collapsed && allowCollapse) {
                            $scope.collapsed = true;
                            $scope.updateTable();
                        }                    
                    } else {
                         if ($scope.collapsed) {
                            $scope.collapsed = false;
                            $scope.updateTable();
                        } 
                    }                    
                }


                $scope.getClass = function() {
                    return stateUtil.isInAnalysisMode() ? "" : "no-interactions";
                };
                
                function initMasterItems() {
                    var deferred = $q.defer();

                    app.getAppObjectList('masterobject', function(reply) {
                        $scope.data.masterObjectList = _.reduce(reply.qAppObjectList.qItems, function(acc, obj) {
                            if (obj.qData.visualization == 'table') {
                                if ($scope.data.tag == 'All tables') {
                                    acc.push(obj);
                                } else {
                                    _.each(obj.qMeta.tags, function(tag) {
                                        if (tag == $scope.data.tag) {
                                            acc.push(obj);
                                        }
                                    });
                                }
                            }
                            return acc;
                        }, []);
                        deferred.resolve(true);
                    });
                    return deferred.promise;
                }

                function initLibraryItems() {
                    app.getList('MeasureList', function(reply) {
                        $scope.data.masterMeasures = reply.qMeasureList;
                    });
                    app.getList('DimensionList', function(reply) {
                        $scope.data.masterDimensions = reply.qDimensionList;
                    });
                }

                $scope.loadActiveTable = function() {

                    var deferred = $q.defer();

                    $scope.report.state = [];
                    $scope.updateTable();
                    if( $scope.data.activeTable !== null) {
                        setTimeout(function() {
                            app.getObjectProperties($scope.data.activeTable.qInfo.qId).then(function(model) {
                                $scope.report.title = model.properties.title;
                                $scope.report.supressZero = model.properties.qHyperCubeDef.qSuppressZero;
                                console.log('model',model);
                                //Dimensions
                                var dataId = -1;
                                var dimensions = _.map(model._properties.qHyperCubeDef.qDimensions, function(dimension) {

                                    dataId = dataId + 1;

                                    if (dimension.qLibraryId) {
                                        var libraryItem = _.find($scope.data.masterDimensions.qItems, function(item) {
                                            return item.qInfo.qId == dimension.qLibraryId;
                                        });
                                        var libraryDimension = dimension;
                                        libraryDimension.qType = 'dimension';
                                        return {
                                            title: libraryItem.qMeta.title,
                                            description: libraryItem.qMeta.description,
                                            columnOptions: libraryDimension,
                                            type: 'dimension',
                                            selected: false,
                                            dataId: dataId
                                        }
                                    } else {
                                        return {
                                            title: dimension.qDef.qFieldLabels[0] == '' ? dimension.qDef.qFieldDefs[0] : dimension.qDef.qFieldLabels[0],
                                            description: '',
                                            columnOptions: dimension,
                                            type: 'dimension',
                                            selected: false,
                                            dataId: dataId
                                        }
                                    }
                                });

                                $scope.report.dimensions = $scope.data.sortOrder == 'SortByA' ? _.sortBy(dimensions, function(item) {
                                    return item.title;
                                }) : dimensions;

                                //Measures
                                var measures = _.map(model._properties.qHyperCubeDef.qMeasures, function(measure) {
                                    dataId = dataId + 1;

                                    if (measure.qLibraryId) {
                                        var libraryItem = _.find($scope.data.masterMeasures.qItems, function(item) {
                                            return item.qInfo.qId == measure.qLibraryId;
                                        });

                                        var libraryMeasure = measure;
                                        libraryMeasure.qType = 'measure';

                                        return {
                                            title: libraryItem.qMeta.title,
                                            description: libraryItem.qMeta.description,
                                            columnOptions: libraryMeasure,
                                            type: 'measure',
                                            selected: false,
                                            dataId: dataId
                                        }
                                    } else {
                                        return {
                                            title: measure.qDef.qLabel ? measure.qDef.qLabel : measure.qDef.qDef,
                                            description: '',
                                            columnOptions: measure,
                                            type: 'measure',
                                            selected: false,
                                            dataId: dataId
                                        }
                                    }
                                });
                                $scope.report.measures = $scope.data.sortOrder == 'SortByA' ? _.sortBy(measures, function(item) {
                                    return item.title;
                                }) : measures;
                                deferred.resolve(true);
                            });
                        }, 500);
                    } else {
                        deferred.resolve(false);
                    }
                
                    return deferred.promise;
                }

                $scope.changeTable = function() {
                    var state = {};
                    var localStorageToken = JSON.parse(localStorage.getItem(localStorageId));
                    if (undefined != localStorageToken && undefined != localStorageToken.states) {
                        state = localStorageToken.states[$scope.data.activeTable.qInfo.qId];
                        if (state) {
                            $scope.report.interColumnSortOrder = state.qInterColumnSortOrder ? state.qInterColumnSortOrder : [];
                        }
                    }
                    $scope.setReportState(state);
                }
                $scope.createTable = function() {
                    var deferred = $q.defer();
                    $(".rain").show();
                    $scope.loadActiveTable().then(function() {
                        app.visualization.create('table', [], {
                            title: $scope.report.title == '' ? $scope.data.activeTable.qMeta.title : $scope.report.title
                        }).then(function(visual) {
                            $scope.report.tableID = visual.id;
                            $(".rain").hide();
                            visual.show('customreporttable');
                            deferred.resolve(true);
                        });
                    });
                    return deferred.promise;
                }

                $scope.getInterColumnSortOrder = function() {
                    var deferred = $q.defer();

                    if ($scope.report.interColumnSortOrder.length == 0) {
                        app.getObject($scope.report.tableID).then(function(model) {
                            model.getEffectiveProperties().then(function(reply) {
                                var dimCount = reply.qHyperCubeDef.qDimensions.length;
                                var interColSortOrder = [];
                                _.each(reply.qHyperCubeDef.qInterColumnSortOrder, function(item) {
                                    if (item >= dimCount) {
                                        var newItem = {
                                            dataId: reply.qHyperCubeDef.qMeasures[item - dimCount].dataId,
                                            type: "measure"
                                        }
                                        newItem.qSortBy = reply.qHyperCubeDef.qMeasures[item - dimCount].qSortBy;
                                        if (reply.qHyperCubeDef.qMeasures[item - dimCount].qDef.qReverseSort) {
                                            newItem.qReverseSort = true
                                        }
                                        interColSortOrder.push(newItem);
                                    } else {
                                        var newItem = {
                                            dataId: reply.qHyperCubeDef.qDimensions[item].dataId,
                                            type: "dimension"
                                        }
                                        if (reply.qHyperCubeDef.qDimensions[item].qDef.qReverseSort) {
                                            newItem.qReverseSort = true
                                        }
                                        interColSortOrder.push(newItem);
                                    }
                                });
                                $scope.report.interColumnSortOrder = interColSortOrder;
                                deferred.resolve(true);
                            })
                        });
                    } else {
                        deferred.resolve(true);
                    }
                    return deferred.promise;
                };

                $scope.setReportState = function(state) {
                    $scope.createTable().then(function() {
                            var newState = [];
                            if (state && state.itemIds) {
                                _.each(state.itemIds, function(itemId) {
                                    var idx = $scope.report.dimensions.map(function(x) {
                                        return x.dataId;
                                    }).indexOf(itemId);
                                    if (idx > -1) {
                                        $scope.report.dimensions[idx].selected = true;
                                        newState.push($scope.report.dimensions[idx]);
                                    } else {
                                        idx = $scope.report.measures.map(function(x) {
                                            return x.dataId;
                                        }).indexOf(itemId);
                                        if (idx > -1) {
                                            $scope.report.measures[idx].selected = true;
                                            newState.push($scope.report.measures[idx]);
                                        }
                                    }
                                });
                            }
                            $scope.report.state = newState;
                            $scope.updateTable();
                        });
                };

                $scope.updateTable = function() {
                    console.log('updateTable report',$scope.report);
                    if ($scope.report.tableID != '') {
                        if ($scope.report.state.length > 0) {
                            var supressZero = $scope.report.supressZero ? true : false;
                            var dimensions = _.reduce($scope.report.state, function(acc, obj) {
                                if (obj.type == 'dimension') {
                                    obj.columnOptions.dataId = obj.dataId
                                    acc.push(obj.columnOptions);
                                }
                                return acc;
                            }, []);

                            var measures = _.reduce($scope.report.state, function(acc, obj) {
                                if (obj.type == 'measure') {
                                    obj.columnOptions.dataId = obj.dataId
                                    acc.push(obj.columnOptions);
                                }
                                return acc;
                            }, []);

                            var columnOrder = [];
                            var measureCount = 0;
                            var dimensionCount = 0;

                            _.each($scope.report.state, function(obj) {
                                if (obj.type == 'measure') {
                                    columnOrder.push(dimensions.length + measureCount);
                                    measureCount = measureCount + 1;
                                } else {
                                    columnOrder.push(dimensionCount);
                                    dimensionCount = dimensionCount + 1;
                                }
                            });

                            var columnWidths = [];

                            for (var i = 0; i < $scope.report.state.length; i++) {
                                columnWidths.push(-1);
                            }

                            $scope.getInterColumnSortOrder().then(function() {
                                var qInterColumnSortOrder = [];

                                _.each($scope.report.interColumnSortOrder, function(item) {
                                    if (item.type == "measure") {
                                        var idx = measures.map(function(x) {
                                            return x.dataId;
                                        }).indexOf(item.dataId);
                                        if (idx > -1) {
                                            qInterColumnSortOrder.push(idx + dimensionCount);
                                            measures[idx].qSortBy = item.qSortBy;
                                            if (item.qReverseSort) {
                                                measures[idx].qDef.autoSort = false
                                                measures[idx].qDef.qReverseSort = item.qReverseSort
                                            }
                                        }
                                    } else {
                                        var idx = dimensions.map(function(x) {
                                            return x.dataId;
                                        }).indexOf(item.dataId);
                                        if (idx > -1) {
                                            qInterColumnSortOrder.push(idx);
                                            if (item.qReverseSort) {
                                                dimensions[idx].qDef.autoSort = false
                                                dimensions[idx].qDef.qReverseSort = item.qReverseSort
                                            }
                                        }

                                    }
                                });

                                //add newly added item to qInterColumnSortOrder 
                                if (qInterColumnSortOrder.length != columnOrder.length) {
                                    var missingValues = _.difference(columnOrder, qInterColumnSortOrder)
                                    _.each(missingValues, function(value) {
                                        qInterColumnSortOrder.push(value);
                                    })
                                }
                                app.getObject($scope.report.tableID).then(function(visual) {
                                    visual.getProperties().then(function(properties) {
                                        console.log('visual props',properties);
                                    
                                    });

                                    visual.clearSoftPatches();
                                    var patches = [{
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/qDimensions",
                                            "qValue": JSON.stringify(dimensions)
                                        }, {
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/qMeasures",
                                            "qValue": JSON.stringify(measures)
                                        },
                                        {
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/columnOrder",
                                            "qValue": JSON.stringify(columnOrder)
                                        }, 
                                        {
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/columnWidths",
                                            "qValue": JSON.stringify(columnWidths)
                                        },
                                        {
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/qSuppressZero",
                                            "qValue": JSON.stringify(supressZero)
                                        }, 
                                        {
                                            "qOp": "replace",
                                            "qPath": "qHyperCubeDef/qInterColumnSortOrder",
                                            "qValue": JSON.stringify(qInterColumnSortOrder)
                                        },
                                    ];
                                    visual.applyPatches(patches, true);
                                    $scope.serializeReport();

                                    //model.properties.qHyperCubeDef.qSuppressZero
                                });
                            })
                        } else {
                            app.getObject($scope.report.tableID).then(function(visual) {
                                visual.clearSoftPatches();
                                $scope.report.interColumnSortOrder = [];
                                $scope.serializeReport();
                            });
                        }
                        $(".rain").hide();
                    }
                }

                $scope.selectItem = function(item) {
                    var idx = $scope.report.state.map(function(x) {
                        return x.dataId;
                    }).indexOf(item.dataId);
                    if (idx > -1) {
                        item.selected = false;
                        $scope.report.state.splice(idx, 1);
                    } else {
                        item.selected = true;
                        $scope.report.state.push(item);
                    }
                    $scope.updateTable();
                }

                $scope.clearAll = function() {
                    _.each($scope.report.dimensions, function(dimension) {
                        dimension.selected = false;
                    })

                    _.each($scope.report.measures, function(measure) {
                        measure.selected = false;
                    })

                    $scope.report.state = [];
                    $scope.updateTable();

                }

                $scope.removeItem = function(item) {
                    $scope.report.state = _.without($scope.report.state, item);

                    if (item.type == 'measure') {
                        var idx = $scope.report.measures.map(function(x) {
                            return x.dataId;
                        }).indexOf(item.dataId);
                        $scope.report.measures[idx].selected = false;
                    } else {
                        var idx = $scope.report.dimensions.map(function(x) {
                            return x.dataId;
                        }).indexOf(item.dataId);
                        $scope.report.dimensions[idx].selected = false;
                    }
                    $scope.updateTable();
                }

                $scope.hideFieldAndSortbar = function() { 
                    $scope.fieldsAndSortbarVisible = false;
                    $scope.updateTable();
                }

                $scope.showFieldAndSortbar = function() { 
                    $scope.fieldsAndSortbarVisible = true;
                    $scope.updateTable();
                }
                $scope.exportData = function(string) {
                    if ($scope.report.state.length > 0) {
                        var options = {};
                        switch (string) {
                            //app level commands
                            case 'exportToExcel':
                                options = {
                                    download: true
                                };
                                break;
                            case 'exportAsCSV':
                                options = {
                                    format: 'CSV_C',
                                    download: true
                                };
                                break;
                            case 'exportAsCSVTab':
                                options = {
                                    format: 'CSV_T',
                                    download: true
                                };
                                break;
                            case 'exportToClipboard':
                                options = {
                                    download: true
                                };
                                break;
                        }
                        $(".rain").show();
                        $scope.rainText = {text: 'Exporting data'}
                        console.log('scope',$scope);
                        app.visualization.get($scope.report.tableID).then(function(visual) {
                            visual.table.exportData(options).then(function(reply){
                                $(".rain").hide();
                                $scope.rainText = false;
                            });
                        });
                    }
                }

                $scope.serializeReport = function() {
                    var localStorageToken = JSON.parse(localStorage.getItem(localStorageId));
                    if (null === localStorageToken || undefined === localStorageToken || undefined === localStorageToken.states) { 
                        localStorageToken = { activeTableId: "",
                                                states: {}
                                            };
                    } 
                    var itemIds = [];
                    _.each($scope.report.state, function(item) {
                        itemIds.push(item.dataId);
                    })

                    $scope.getInterColumnSortOrder().then(function() {
                        var state = {
                            qId: $scope.data.activeTable.qInfo.qId,
                            itemIds: itemIds,
                            qInterColumnSortOrder: $scope.report.interColumnSortOrder
                        }
                        localStorageToken.activeTableId = state.qId;
                        localStorageToken.fieldsAndSortbarVisible = $scope.fieldsAndSortbarVisible;
                        
                        localStorageToken.states[state.qId] = state
                        
                        $scope.report.interColumnSortOrder = [];
                        localStorage.setItem(localStorageId, JSON.stringify(localStorageToken));
                        console.log('serialized state:', localStorageToken);
                    }).catch(function(){
                        localStorage.setItem(localStorageId, JSON.stringify(localStorageToken));
                        console.log('serialized state:', localStorageToken);

                    });
                }

                $scope.deserializeReport = function() {
                    var state = {};
                    var localStorageToken = JSON.parse(localStorage.getItem(localStorageId));
                    if (undefined != localStorageToken && undefined != localStorageToken.states) {
                        console.log('deserialized state:', localStorageToken);
                        state = localStorageToken.states[localStorageToken.activeTableId] 
                        $scope.report.interColumnSortOrder = state.qInterColumnSortOrder ? state.qInterColumnSortOrder : [];
                        $scope.fieldsAndSortbarVisible = localStorageToken.fieldsAndSortbarVisible;
                        $scope.data.activeTable = _.find($scope.data.masterObjectList, function(item) {
                            return item.qInfo.qId == state.qId;
                        });
                        $scope.setReportState(state);                        
                    }
                }

                //$scope.$on('$destroy', function() {
                    //$scope.serializeReport();
                //});

                $scope.$watchCollection('layout.props.tagSetting', function(newTag) {
                    $scope.data.tag = newTag;
                    initMasterItems();
                });

                $scope.$watchCollection('layout.props.tagColor', function(newStyle) {
                    $scope.data.tagColor = newStyle;
                });

                $scope.$watchCollection('layout.props.collapseMinWidth', function(newWidth) {
                    $scope.minWidthCollapsed = newWidth;
                });

                 $scope.$watchCollection('layout.props.collapseMinHeight', function(newHeight) {
                    $scope.minHeightCollapsed = newHeight;
                });


                $scope.$watchCollection('layout.props.displayText', function(newText) {
                    $scope.data.displayText = newText;
                });

                $scope.$watchCollection('layout.props.dimensionSortOrder', function(newStyle) {
                    $scope.data.sortOrder = newStyle;
                    $scope.loadActiveTable();
                });

                $scope.getListMaxHeight = function(listType) {
                    var listHeight = 38;
                    var dimCount = $scope.report.dimensions.length
                    var measureCount = $scope.report.measures.length
                    var labelsAndButtons = 140;
                    var halfHeight = (($scope.size.clientHeight - labelsAndButtons) / 2)
                    var dimListUnusedSize = halfHeight < listHeight * dimCount ? 0 : halfHeight - listHeight * dimCount;
                    var measureListUnusedSize = halfHeight < listHeight * measureCount ? 0 : halfHeight - listHeight * measureCount;

                    if (dimCount > 0) {
                        if (listType == 'dimension') {
                            return {
                                "max-height": (halfHeight + measureListUnusedSize) + "px"
                            };
                        } else {
                            return {
                                "max-height": (halfHeight + dimListUnusedSize) + "px"
                            };
                        }
                    } else {
                        return {
                            "height": halfHeight + "px"
                        };
                    }
                }

                $scope.getTableHeight = function() {
                    var labelsAndButtons = 70;

                    $('#reportSortable').height();

                    var reportSortableHeight = $('#reportSortable').height();
                    if (!$scope.fieldsAndSortbarVisible) {
                        return { "height": $scope.size.clientHeight + "px" }
                    } else {
                        return { "height": ($scope.size.clientHeight - labelsAndButtons - reportSortableHeight) + "px", "padding-top":"18px" }
                    }
                }
                $scope.getContainerWidth = function(container) {
                    var containerLeftWidth = 220;
                    var containerWidth = {};
                    if (container == 'left') {
                       containerWidth = containerLeftWidth;
                    } else {
                        if (!$scope.fieldsAndSortbarVisible) {
                            containerWidth =  $scope.size.clientWidth;
                        } else {
                            containerWidth = $scope.size.clientWidth - containerLeftWidth - 20;
                        }
                    }
                    return { "width": containerWidth + "px" }
                }

                initLibraryItems();
                
                initMasterItems().then(function(reply) {
                    var el = document.getElementById('reportSortable');
                    sortable.create(el, $scope.reportConfig);

                    $scope.deserializeReport();

                    $(".rain").hide();
                });
            }]
        };
    });