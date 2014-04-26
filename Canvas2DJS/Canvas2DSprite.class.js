/**
* @class
* @constructor
*/
Canvas2DSprite = function() {
	this.id;
	this.image = undefined;
	this.spriteCols = undefined;
	this.spriteRows = undefined;
	this.cellWidth = undefined;
	this.cellHeight = undefined;
	this.imagePositions = [];
	this.loaded = false;
};
/** @private */
Canvas2DSprite.prototype.create = function(jsonIn) {
	this.spriteCols = (jsonIn.cols != undefined) ? jsonIn.cols : 1;
	this.spriteRows = (jsonIn.rows != undefined) ? jsonIn.rows : 1;
	this.imagePositions = [];
	
	this.image = new Image();
	this.image.onload = (function() {
		this.loaded = true;
		this.cellWidth = this.image.width/this.spriteCols;
		this.cellHeight = this.image.height/this.spriteRows;
		var currentCol = 0;
		var currentRow = 0;
		for(var n = 0, f = this.spriteCols*this.spriteRows; n < f; n++) { 
			this.imagePositions[n] = {};
			this.imagePositions[n].position = {x:(this.cellWidth*currentCol), y:(this.cellHeight*currentRow)};
			
			if(currentCol == (this.spriteCols)) {
				currentCol = 1;
				currentRow++;
			} else currentCol++;
		}
	
		if(jsonIn.onload != undefined) jsonIn.onload();
	}).bind(this);
	this.image.src = jsonIn.url;
};