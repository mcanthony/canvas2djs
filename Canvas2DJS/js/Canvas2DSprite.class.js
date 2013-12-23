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
	var _image = this.image;
	var _this = this;
	this.image.onload = function() {
		_this.loaded = true;
		_this.cellWidth = _image.width/_this.spriteCols;
		_this.cellHeight = _image.height/_this.spriteRows;
		var currentCol = 1;
		var currentRow = 1;
		for(var n = 0, f = _this.spriteCols*_this.spriteRows; n < f; n++) { 
			_this.imagePositions[n] = {};
			_this.imagePositions[n].position = {x:(_this.cellWidth*currentCol), y:(_this.cellHeight*currentRow)};
			
			if(currentCol == (_this.spriteCols)) {
				currentCol = 1;
				currentRow++;
			} else currentCol++;
		}
	
		if(jsonIn.onload != undefined) jsonIn.onload();
	} 
	this.image.src = jsonIn.url;
};