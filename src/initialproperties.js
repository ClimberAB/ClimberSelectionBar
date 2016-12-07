/*global define*/
define( [], function () {
    'use strict';
    return {
        props: {
            allowCollapse : true,
            collapseMinWidth: 200,
            collapseMinHeight: 200,
            displayText: "Custom Report",
            tagColor: true,
            sortOrder: "SortByA",
        }
        /*
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [
                {
                    qWidth: 2,
                    qHeight: 50
                }
            ]
        }*/
    };
} );
