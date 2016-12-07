define([
        'jquery',
        'underscore',
        'qlik',
        './properties',
        './initialproperties',
        './lib/js/extensionUtils',
        './lib/js/perfect-scrollbar.min',
        './lib/js/perfect-scrollbar.jquery.min',
        'text!./lib/css/perfect-scrollbar.min.css',
        'text!./lib/css/style.css'
],
function ($, _, qlik, props, initProps, extensionUtils, ps, psJqeuery, PScss, cssContent) {
    'use strict';

    var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/sense/app/" ) );
    extensionUtils.addStyleToHeader(cssContent);
    extensionUtils.addStyleToHeader(PScss);

    console.log('Initializing - remove me', prefix);

    return {

        definition: props,

        initialProperties: initProps,

        snapshot: { canTakeSnapshot: true },
        support: { export: true, exportData: true },
        

        resize : function( /*$element, layout*/ ) {
            //do nothing
        },

		//clearSelectedValues : function($element) {
		//
		//},


        // Angular Support (uncomment to use)
        //template: '',

        // Angular Controller
        //controller: ['$scope', function ($scope) {
		//
        //}],


        paint : function($element, layout) {
            
            //var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/sense/app/" ) + 1 );
            console.groupCollapsed('Basic Objects');
            console.info('$element:');
            console.log($element);
            console.info('layout:');
            console.log(layout);
            console.info('prefix:');
            console.log(prefix);
            console.groupEnd();
            

            
            var html = "", self = this, lastrow = 0, morebutton = false, measurelbl = "",dimcount = this.backendApi.getDimensionInfos().length;

            var compactClass = ($element.context.clientWidth < 350) ? ' compactLayout':'';

            measurelbl = this.backendApi.getMeasureInfos()[0].qFallbackTitle;
            html += "<div class='cl-cardsview" + compactClass +"'><div class='cardslist-wrapper'><ol class='cardslist' style='list-style: none;'>";
            //render data
            this.backendApi.eachDataRow(function(rownum, row) {
                lastrow = rownum;
                
                var title = (dimcount > 2 ? row[2].qText : "");
                var cover = row[1].qText.substr(0,1) == "/" ?  prefix + row[1].qText : row[1].qText;
                var secAttribute = (dimcount > 3 ? row[3].qText : "");
                html += "<li class='listitem'>";
                html += "<div class='card-wrapper selectable'  title='" + row[0].qText + "' data-value='" + row[0].qElemNumber + "' data-dimension='0'>"

                html += "<div class='rank-img-wrapper'>"
                html += "<div class='img-wrapper'><div class='cover' style='background: url(" + cover + ") no-repeat center center; background-size: contain;'></div></div></div>"
                html += "<div class='attr-value-wrapper'><div class='attr-wrapper'><div class='title'>" + (rownum + 1) + ". " + title + "</div>"
                html += "<div class='secondaryAttribute'>" + secAttribute + "</div></div>"
                html += "<div class='value-wrapper'><div class='mainValue'>" + row[dimcount].qText + "</div>"
                html += "<div class='mainValueTitle'>" + measurelbl + "</div>"
                html += "</div></div></div></li>";              
            });

            //add 'more...' button
            if(this.backendApi.getRowCount() > lastrow + 1) {
                html += "<li class='listitem'><button id='more' class='qui-outlinebutton' style='margin-top: 10px;'>More...</button></li>";
                morebutton = true;
            }

            html += "</ol></div>";

            html += "</div>";
            $element.html(html);

            $element.find('.cl-cardsview').perfectScrollbar();
            
            if(this.selectionsEnabled) {
                if(morebutton) {
                    var requestPage = [{
                        qTop : lastrow + 1,
                        qLeft : 0,
                        qWidth : 10, //should be # of columns
                        qHeight : Math.min(50, this.backendApi.getRowCount() - lastrow)
                    }];
                    $element.find("#more").on("qv-activate", function() {
                        self.backendApi.getData(requestPage).then(function(dataPages) {
                            self.paint($element);
                        });
                    });
                }
                $element.find('.selectable').on('qv-activate', function() {
                    console.log('qv-activate');
                    if(this.hasAttribute("data-value")) {
                        var value = parseInt(this.getAttribute("data-value"), 10), dim = parseInt(this.getAttribute("data-dimension"), 10);
                        self.selectValues(dim, [value], true);
                        $element.find("[data-dimension='"+ dim +"'][data-value='"+ value+"']").toggleClass("selected");
                    }
                });
                $element.find('.selectable').on("qv-swipestart", function(event) {
                    
                    var target = $(event.originalEvent.target);
                    var idx = $(event.originalEvent.target.parentElement).index()
                    
                    layout.swipe_row_min = idx;
                    layout.swipe_row_max = idx;
                    
                    var value = parseInt(target.attr('data-value'), 10);
                    
                    if (typeof value !== typeof undefined && value !== false && !isNaN(value) && !target.hasClass("selected")) {
                        layout.values_to_select.push(value);
                        $element.find("[data-dimension='0'][data-value='"+ value+"']").toggleClass("selected");
                    }
                });
                
                $element.find('.selectable').on("qv-swipeupdate", function(event) {

                    if ($(event.originalEvent.target.parentElement).hasClass("listitem")) {
                    
                        var target = $(event.originalEvent.target);
                        var list = $(event.originalEvent.target.parentElement.parentElement.childNodes);
                        var idx = $(event.originalEvent.target.parentElement).index()
                        var updateSelection = layout.swipe_row_min > idx || layout.swipe_row_max < idx  ? true : false;

                       if (updateSelection) {

                            layout.swipe_row_min = layout.swipe_row_min > idx ? idx : layout.swipe_row_min;
                            layout.swipe_row_max = layout.swipe_row_max < idx ? idx : layout.swipe_row_max;

                            list.slice(layout.swipe_row_min, layout.swipe_row_max + 1).each(function(){
                                console.log($(this).find('.card-wrapper'));
                                console.log(!$(this).find('.card-wrapper').hasClass("selected"))

                                if (!$(this).find('.card-wrapper').hasClass("selected")) {
                                    var value = parseInt($(this).find('.card-wrapper').attr('data-value'), 10);
                                    if (typeof value !== typeof undefined && value !== false && !isNaN(value) ) {
                                        layout.values_to_select.push(value);
                                        $element.find("[data-dimension='0'][data-value='"+ value+"']").toggleClass("selected");
                                    }
                                }
                            });
                        }
                    }
                });
                
                $element.find('.selectable').on("qv-swipe", function(event) {
                    
                    layout.swipe_row_min = -1;
                    layout.swipe_row_max = -1;
                    if (layout.values_to_select !== []) {
                        self.selectValues(0, layout.values_to_select, false);
                        layout.values_to_select = [];
                    }
                });

                return qlik.Promise.resolve();


            }
        }
    };

});
