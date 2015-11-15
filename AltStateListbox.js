define( ["jquery", "text!./style.css", "qlik"], function ( $, cssContent, qlik ) {
	'use strict';
	var savedQlik = qlik;
	$( "<style>" ).html( cssContent ).appendTo( "head" );
	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				qFrequencyMode: "V",
				qSortCriterias : {
					qSortByState : 0,
					qSortByLoadOrder: 1,
					qSortByFrequency: 0,
					qSortByNumeric: 0,
					qSortByAscii: 0
				},
				qInitialDataFetch: [{
					qWidth: 2,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					label: "Dimensions",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						label: {
							type: "string",
							ref: "qListObjectDef.qDef.qFieldLabels.0",
							label: "Label",
							show: true
						},
						libraryId: {
							type: "string",
							component: "library-item",
							libraryItemType: "dimension",
							ref: "qListObjectDef.qLibraryId",
							label: "Dimension",
							show: function ( data ) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field: {
							type: "string",
							expression: "always",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							label: "Field",
							show: function ( data ) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
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
							defaultValue : 1,
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
						}
					}
				},
				settings: {
					uses: "settings"
				},
				customProperties : {
						component: "expandable-items",
						label: "Custom Properties",
						type : "items",
						items : {
							state : {
								ref : "qListObjectDef.qStateName",
								label : "State",
								type : "string",
								component : "dropdown",
								defaultValue : "$",		
								options: function() {
								  return qlik.currApp(this).getAppLayout().then(function (layout){
									   console.log('app.layout',layout);
										return [{value : "$", label : "Default"}].concat(layout.qStateNames.map(function (state){
											  return {value : state, label : state}
										}));
									  });
								}
							},
							shape : {
								ref : "prop.shape",
								label : "Shape",
								type : "string",
								component : "dropdown",
								defaultValue : "100%",
								options : [{
									value : "100%",
									label : "1 Column"
								}, {
									value : "50%",
									label : "2 Columns"
								}, {
									value : "33.33%",
									label : "3 Columns"
								}, {
									value : "25%",
									label : "4 Columns"
								}, {
									value : "20%",
									label : "5 Columns"
								}, {
									value: "horizontal",
									label: "One row"
								}
								],
							},
							allowMultipleSelection : {
								ref : "prop.allowMultipleSelection",
								label : "Allow multiple selection",
								type : "boolean",
								defaultValue : false
							}

						}
					}
			  }
		},
		snapshot: {
			canTakeSnapshot: false
		},
		paint: function ( $element , layout ) {
			var self = this, html = "<ul>";
			var liWidth = layout.prop.shape;
			if (liWidth == 'horizontal') {
				var rowCount = this.backendApi.getRowCount();
				if (rowCount == 0) {
					liWidth = '100%';
				} else {
					liWidth = (100 / rowCount).toFixed(2) + '%';
				}
			}
			console.log('liWidth', liWidth);
			console.log('qlik', savedQlik);

			this.backendApi.eachDataRow( function ( rownum, row ) {
				html += '<li class="data state' + row[0].qState + '" data-value="' + row[0].qElemNumber + '"';
				html += ' style="width:'+liWidth+ ';">';
				var checkMark = '&nbsp';
				if(row[0].qState=='S'){
					checkMark = '✓';
				}
				html += '<span class="qv-object-AltStateListbox-item">' + row[0].qText + '</span>'
				html += '<span class="qv-object-AltStateListbox-checkMark">' + checkMark + '</span></li>';
			} );
			html += "</ul>";

			$element.html( html );
			if ( this.selectionsEnabled ) {
				$element.find( 'li' ).on( 'qv-activate', function () {
					if ( this.hasAttribute( "data-value" ) ) {
						var value = parseInt( this.getAttribute( "data-value" ), 10 ), dim = 0;
						self.backendApi.selectValues( dim, [value], layout.prop.allowMultipleSelection );
						$( this ).toggleClass( "selected" );
					}
				} );
			}
		}
	};
} );
