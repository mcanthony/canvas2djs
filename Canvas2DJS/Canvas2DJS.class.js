/*
The MIT License (MIT)

Copyright (c) <2013> <Roberto Gonzalez. http://stormcolour.appspot.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
/**
* @class
* @constructor
*/
Canvas2DJS = function() {
	this.nodes = [];
	this.layers = [];
	this.layers[0] = [];
	this.sprites = [];
	 
	this.target;
	this.canvas;
	this.width;
	this.height;
	this.screenAdjust = false; 
	this.divPositionX = 0;
	this.divPositionY = 0;
	this.mousePosX, this.mousePosY, this.oldMousePosClickX, this.oldMousePosClickX;
	
	this.worldScale;
	this.world = undefined;
	this.worldGravity = new V2([0.0, 9.8]);
	this.Pstep = 0;
	this._BODYSeleccionado = undefined;
	this.mousePVec, this.isMouseDown = false, this.selectedBody, this.mouseJoint;
};
/**
* Set the canvas element
* @param	{Object} jsonIn
* 	@param {HTMLCanvasElement} jsonIn.target The canvas element
* 	@param {Float} [jsonIn.screenAdjust=false] Adjust the canvas to the screen maintaining the aspect ratio
* 	@param {Float} [jsonIn.pxByMeter=6.0] Scale of dynamic world
* 	@param {String} [jsonIn.preloaderBgColor="#FF0000"] Background color of the preloader screen
*/
Canvas2DJS.prototype.createScene = function(jsonIn) {
	this.target = jsonIn.target;
	this.canvas = this.target.getContext("2d");
	this.width = $('#'+this.target.id).width();
	this.height = $('#'+this.target.id).height();
	
	this.targetP = document.createElement('div');
	this.targetP.id = "C2D_"+this.target.id;
	this.target.parentNode.insertBefore(this.targetP,this.target);
	this.target.parentNode.removeChild(this.target);
	
	this.$ = $('#'+this.targetP.id);
	this.$.css('overflow','hidden');
	
			
	// SCREEN ADJUST
	this.styleWidthScale = 1.0;
	this.styleHeightScale = 1.0;
	this.screenAdjust = (jsonIn.screenAdjust != undefined && jsonIn.screenAdjust) ? this.makeScreenAdjust() : false;
	
	// BOX2DJS
	this.worldScale = (jsonIn.pxByMeter != undefined) ? (1.0/jsonIn.pxByMeter) : (1.0/6.0);	 
	this.camera = new Canvas2DNode();
	this.camera.show();
	
	// PRELOADER SCREEN
	this._preloaderBgColor = jsonIn.preloaderBgColor || "#FF0000";
	var str = 	'<table id="DIVID_SHApreloader" style="z-index:99;position:absolute;width:'+this.width+'px;height:'+this.height+'px;background-color:'+this._preloaderBgColor+'">'+
					'<tr>'+
						'<td colspan="3" style="height:'+(this.height/2.9)+'px">'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td style="width:80px">'+
						'</td>'+
						'<td style="width:'+(this.width-160)+'px">'+
							'<img src="'+c2djsDirectory+'/logo.png" />'+
							'<div style="height:10px;background:#CCC;border:1px solid #FFF;">'+
								'<div id="DIVID_SHApreloaderBar" style="height:10px;background:#FF6600;"></div>'+
							'<div>'+
						'</td>'+
						'<td>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td colspan="3" >'+
						'</td>'+
					'</tr>'+
				'</table>';
	this.$.append(str);
	this.targetP.appendChild(this.target);
	this.targetP.style.width = this.width+"px";
	this.targetP.style.height = this.height+"px";
	this.targetP.style.margin = "0px auto 0px auto";
	 
	
	$(document).ready(this.updateDivPosition.bind(this));
	window.addEventListener("resize", this.updateDivPosition.bind(this), false);
	window.addEventListener("orientationchange", this.updateDivPosition.bind(this), false); 
	window.addEventListener('touchStart', this.touchStart.bind(this), false);
	window.addEventListener('touchmove', this.touchmove.bind(this), false);
											
	document.body.addEventListener("mouseup", this.mouseup.bind(this), false);
	document.body.addEventListener("touchend", this.mouseup.bind(this), false);
	this.target.addEventListener("mousedown", this.mousedown.bind(this), false);
	this.target.addEventListener("touchstart", this.mousedown.bind(this), false);
	document.body.addEventListener("mousemove", this.mousemove.bind(this), false); 
	document.body.addEventListener("touchmove", this.mousemove.bind(this), false); 
	
	this.orientation = {alpha:0.0, beta:0.0, gamma:0.0};
	if(navigator.accelerometer) { // DEVICEORIENTATION FOR APACHE CORDOVA XYZ
		navigator.accelerometer.watchAcceleration(this.handleOrientationEvent.bind(this), console.log('NO ACCELEROMETER FOR CORDOVA'), {frequency: 3000});	
	}
	if(window.DeviceOrientationEvent) { // DEVICEORIENTATION FOR DOM gamma beta alpha
		window.addEventListener("MozOrientation", this.handleOrientationEvent.bind(this), true);
		window.addEventListener("deviceorientation", this.handleOrientationEvent.bind(this), true);
	} 	
	if(window.DeviceMotionEvent) { // DEVICEMOTION FOR DOM event.accelerationIncludingGravity.x event.accelerationIncludingGravity.y event.accelerationIncludingGravity.z
		window.addEventListener("devicemotion", this.handleOrientationEvent.bind(this), true);
	}
};
/** @private */
Canvas2DJS.prototype.touchStart = function(e) {
	this.divPosition = this.getElementPosition(this.target);
	e.preventDefault();
	//var touch = e.touches[0];
	//alert(touch.pageX + " - " + touch.pageY);
};
/** @private */
Canvas2DJS.prototype.touchmove = function(e) {
	this.divPosition = this.getElementPosition(this.target);
	e.preventDefault();
};
/** @private */
Canvas2DJS.prototype.makeScreenAdjust = function() {
	this.screenAdjust = true;
	
	function gcd (width, height) { // greatest common divisor (GCD) 
		return (height == 0) ? width : gcd(height, width%height);
	}
	
	var widthScreen = document.documentElement.clientWidth;
	var heightScreen = document.documentElement.clientHeight;
	
	var r = gcd(this.width, this.height);
	var aspectW = (this.width/r); // 800/r = 4
	var aspectH = (this.height/r); // 600/r = 3
	
	// rotate canvaselement if has a better fit to the screen
	/*if(aspectW > aspectH && widthScreen < heightScreen) {
		this.screen90rot = true;
		var cW = this.width;
		this.target.setAttribute('width', this.height);    
		this.target.setAttribute('height', cW);  
		this.width = this.target.getAttribute('width');
		this.height = this.target.getAttribute('height');
		
		r = gcd(this.width, this.height);
		aspectW = (this.width/r); // 800/r = 4
		aspectH = (this.height/r); // 600/r = 3 
	}*/
	
	// scale style
	var newCanvasWidth = ((heightScreen/aspectH)*aspectW);
	var newCanvasHeight = ((widthScreen/aspectW)*aspectH);
	if(newCanvasHeight <= heightScreen) {
		this.target.style.width = widthScreen+'px';
		this.target.style.height = newCanvasHeight+'px';
		this.width = widthScreen;
		this.height = newCanvasHeight;
	} else {
		this.target.style.width = newCanvasWidth+'px';
		this.target.style.height = heightScreen+'px';
		this.width = newCanvasWidth;
		this.height = heightScreen;
	}

	this.styleWidthScale = parseInt(this.target.style.width.replace(/px/gi, ''))/this.width;  
	this.styleHeightScale = parseInt(this.target.style.height.replace(/px/gi, ''))/this.height;
	this.updateDivPosition();
};
/** @private */
Canvas2DJS.prototype.handleOrientationEvent = function(event) {
	var gamma = event.x || event.gamma || event.accelerationIncludingGravity.x*-100.0;// gamma is the left-to-right tilt in degrees, where right is positive
	var beta = event.y || event.beta || event.accelerationIncludingGravity.y*100.0;// beta is the front-to-back tilt in degrees, where front is positive
	var alpha = event.z || event.alpha || event.accelerationIncludingGravity.z*100.0;// alpha is the compass direction the device is facing in degrees
	this.orientation.gamma = (gamma/100)*-1.0;
	this.orientation.beta = (beta/100)*-1.0;
	this.orientation.alpha = (alpha/100)*-1.0;
	
	/*console.log('tiltLR GAMMA X: '+this.orientation.gamma+'<br />'+
				'tiltFB BETA Y: '+this.orientation.beta+'<br />'+
				'dir ALPHA Z: '+this.orientation.alpha+'<br />');*/
};
/**
* Get the device orientation tiltLeftRight (GAMMA X)
* @returns {Float} Float tiltLR.
*/
Canvas2DJS.prototype.getDeviceGamma = function() {
	return this.orientation.gamma;
};
/**
* Get the device orientation tiltFrontBack (BETA Y)
* @returns {Float} Float tiltFB.
*/
Canvas2DJS.prototype.getDeviceBeta = function() {
	return this.orientation.beta;
};
/**
* Get the device orientation dir (ALPHA Z)
* @returns {Float} Float dir.
*/
Canvas2DJS.prototype.getDeviceAlpha = function() {
	return this.orientation.alpha;
};

/** @private */
Canvas2DJS.prototype.updateDivPosition = function() {
	this.divPositionX = this.getElementPosition(this.target).x;
	this.divPositionY = this.getElementPosition(this.target).y;
};
/** @private */
Canvas2DJS.prototype.getElementPosition = function(element) {
	var elem=element, tagname="", x=0, y=0;
   
	while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
	   y += elem.offsetTop;
	   x += elem.offsetLeft;
	   tagname = elem.tagName.toUpperCase();

	   if(tagname == "BODY")
		  elem=0;

	   if(typeof(elem) == "object") {
		  if(typeof(elem.offsetParent) == "object")
			 elem = elem.offsetParent;
	   }
	}

	return {x: x, y: y};
};
/**  @private */
Canvas2DJS.prototype.mouseup = function(e) {
	//e.preventDefault();
	if(this._BODYSeleccionado != undefined && this._BODYSeleccionado.canvas2DNode.mouseupFunction != undefined)
		this._BODYSeleccionado.canvas2DNode.mouseupFunction();
				
	this.mousePosX = undefined;
	this.mousePosY = undefined;
	this._BODYSeleccionado = undefined;
	this.picking = false;
	this.mousedownFunctionFired = false;
	this.isMouseDown = false;
};
/**  @private */
Canvas2DJS.prototype.mousedown = function(e) {
	e.preventDefault();
	if(e.targetTouches != undefined) {
		e = e.targetTouches[0];
		e.button = 0;
	}
	this.mousePosX = (e.clientX - this.divPositionX-(((this.width/2)-this.camera.M9[2]) *this.styleWidthScale)) *(this.worldScale);  
	this.mousePosY = (e.clientY - this.divPositionY-(((this.height/2)-this.camera.M9[5]) *this.styleHeightScale)) *(this.worldScale);
	
	this.isMouseDown = true;
};
/**  @private */
Canvas2DJS.prototype.mousemove = function(e) {
	e.preventDefault();
	if(e.targetTouches != undefined) {
		e = e.targetTouches[0];
		e.button = 0;
	} 
	
	this.mousePosX = (e.clientX - this.divPositionX-(((this.width/2)-this.camera.M9[2]) *this.styleWidthScale)) *(this.worldScale);  
	this.mousePosY = (e.clientY - this.divPositionY-(((this.height/2)-this.camera.M9[5]) *this.styleHeightScale)) *(this.worldScale);

	//console.log(this.mousePosX+'	'+this.mousePosY);
};
/** @private */
Canvas2DJS.prototype.getBodyCB = function(fixture) { 
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
	   if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.mousePVec)) {
		  this.selectedBody = fixture.GetBody();
		  return false;
	   }
	}
	return true;
};

 /** @private */
Canvas2DJS.prototype.getBodyAtMouse = function() {
	this.mousePVec = new b2Vec2(this.mousePosX, this.mousePosY);
	var aabb = new b2AABB();
	aabb.lowerBound.Set(this.mousePosX - 0.001, this.mousePosY - 0.001);
	aabb.upperBound.Set(this.mousePosX + 0.001, this.mousePosY + 0.001);
	 
	this.selectedBody = null;
	this.world.QueryAABB(this.getBodyCB.bind(this), aabb); 
	return this.selectedBody;
};
var lastUpdate = Date.now();
 /** @private */
Canvas2DJS.prototype.next = function() {
	var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    
	window.requestAnimFrame(this.next.bind(this));   
	
	if(this.physicEnable == true) {
		this.Pstep++;
		
		if(this.isMouseDown && !this.mouseJoint) {
			if(this._BODYSeleccionado == undefined)
				this._BODYSeleccionado = this.getBodyAtMouse();  
			
			if(this._BODYSeleccionado != undefined) {
			
				if(this._BODYSeleccionado.canvas2DNode.mousedownFunction != undefined) {
					this.picking = true;
					if(this.mousedownFunctionFired == false) {
						this._BODYSeleccionado.canvas2DNode.mousedownFunction();
						this.mousedownFunctionFired = true;
					}
				}
				if(this._BODYSeleccionado.canvas2DNode.mousepicking == true) {
					this.picking = true;
					//this._BODYSeleccionado.SetPosition(new b2Vec2(this.mousePosX, this.mousePosY)); 
					
					var md = new b2MouseJointDef();
					md.bodyA = this.world.GetGroundBody();
					md.bodyB = this._BODYSeleccionado;
					md.target.Set(this.mousePosX, this.mousePosY);
					md.collideConnected = true;
					md.maxForce = 300.0 * this._BODYSeleccionado.GetMass();
					this.mouseJoint = this.world.CreateJoint(md);
					
					this._BODYSeleccionado.SetAwake(true);
				}
				
				if(this.picking == false) {  
					this._BODYSeleccionado = undefined;  
				}
			}
		}
	
		if(this.mouseJoint) {
		   if(this._BODYSeleccionado == undefined) {
				this.world.DestroyJoint(this.mouseJoint);
				this.mouseJoint = null;
			} else { 
				this.mouseJoint.SetTarget(new b2Vec2(this.mousePosX, this.mousePosY));
			}
		}
	 
		this.world.Step(dt/1000, 10, 10); 
		//this.world.DrawDebugData(); 
		this.world.ClearForces();
		
		//var obj = this.world.GetBodyList();
		
		for(var n = 0; n < this.nodes.length; n++) {
			if(this.nodes[n].body != undefined) {
				if(this.nodes[n].playStackRunning == false) {
					if(this.nodes[n].makePos != undefined && this.nodes[n].makePos) {
						this.nodes[n].body.SetPosition(new b2Vec2(this.nodes[n].currentPosition.e[0]*(this.worldScale*this.styleWidthScale),
																this.nodes[n].currentPosition.e[1]*(this.worldScale*this.styleHeightScale)	));
						this.nodes[n].makePos = false; 
					}
					var pos = this.nodes[n].body.GetPosition();
					var x, y;
					if(this.nodes[n].lockXaxis == false) {
						x = pos.x/(this.worldScale*this.styleWidthScale);
					} else {
						x = this.nodes[n].currentPosition.e[0];
						this.nodes[n].body.SetPosition(new b2Vec2(this.nodes[n].currentPosition.e[0]*(this.worldScale*this.styleWidthScale), pos.y));
					}
					if(this.nodes[n].lockYaxis == false) {
						y = pos.y/(this.worldScale*this.styleHeightScale);
					} else {
						y = this.nodes[n].currentPosition.e[1];
						this.nodes[n].body.SetPosition(new b2Vec2(pos.x, this.nodes[n].currentPosition.e[1]*(this.worldScale*this.styleHeightScale)));
					}
					this.nodes[n].currentPosition = $V2([x, y]);
					
					if(this.nodes[n].lockRotation == false) {
						var angle = this.nodes[n].body.GetAngle();
						this.nodes[n].currentRotation = angle*-1.0;
					} else {
						this.nodes[n].body.SetAngle(this.nodes[n].currentRotation*-1.0);
					}
					
					this.nodes[n].updateM9();
				} else {
					this.nodes[n].body.SetPosition(new b2Vec2(this.nodes[n].currentPosition.e[0]*(this.worldScale*this.styleWidthScale), this.nodes[n].currentPosition.e[1]*(this.worldScale*this.styleHeightScale)));
					this.nodes[n].body.SetAngle(this.nodes[n].currentRotation*-1.0);
					this.nodes[n].bodyClearForces();
				}
				
			}
		}
	}
	
	// DRAW
	//m11 	m21 	dx
	//m12 	m22 	dy
	//0 	0 	1
	//this.canvas.setTransform(m11, m12, m21, m22, dx, dy);
	//this.canvas.transform(1, 0, 0, 1, 0, 0);
	this.canvas.clearRect(0, 0, this.width, this.height);
	
	this.layers.forEach((function(value, key) {
		for(var nb = 0; nb < value.length; nb++) {
			var node = this.layers[key][nb];
			
			this.canvas.save();
			this.canvas.globalAlpha = node.opacity;
			
			var m = this.camera.M9;
			this.canvas.setTransform(m[0], m[3], m[1], m[4], (this.width/2)-m[2], (this.height/2)-m[5]);
			
			var m = node.M9;
			this.canvas.transform(m[0], m[3], m[1], m[4], m[2], m[5]); 
			
			//this.canvas.translate(this.camera.currentPosition.e[0], this.camera.currentPosition.e[1]);
			//this.canvas.rotate(this.camera.currentRotation);
			//this.canvas.scale(this.camera.currentScale.e[0], this.camera.currentScale.e[1]);
			
			for(var s = 0; s < node.stack$.length; s++) {
				node.stack$[s](this.canvas, node.values$[s]);
			}
			
			if(node.sprite) {
				
				this.canvas.drawImage(	node.sprite.image,
										node.spriteOrigin.x-(node.sprite.cellWidth/2),
										node.spriteOrigin.y-(node.sprite.cellHeight/2),
										node.sprite.cellWidth,
										node.sprite.cellHeight); 
				
			}
			
			this.canvas.globalAlpha = 1.0;
			
			this.canvas.restore();
			
		}
	}).bind(this));
};
/**
* Start
* @param {Function} [onready] On ready event
*/
Canvas2DJS.prototype.start = function(onready) {
	var spritesloaded = 0;
	for(var n = 0, fn = this.sprites.length; n < fn; n++)
		if(this.sprites[n].loaded == true) spritesloaded++;
		$('#DIVID_SHApreloaderBar').css({'width':50.0+'%'}); 

	$('#DIVID_SHApreloaderBar').css({'width':(spritesloaded/this.sprites.length)*100.0+'%'}); 
	//$('#preloaderPercent').html(parseInt((spritesloaded/this.sprites.length)*100.0)+'%'); 
	if(spritesloaded == this.sprites.length) { 
		$('#DIVID_SHApreloader').css({'display':'none'});
		this.next();
		if(onready != undefined) onready(); 
	} else {
		//this.allHide(); 
		$('#DIVID_SHApreloader').css({'display':'block'});
		
		setTimeout(this.start.bind(this, onready), 100);
	}
};

/**
* Get the camera node
* @returns {Canvas2DNode} Canvas2DNode object.
*/
Canvas2DJS.prototype.getCamera = function() {
	return this.camera;
};
/**
* Create one node
* @returns {Canvas2DNode} Canvas2DNode object.
*/
Canvas2DJS.prototype.createNode = function() {
	var node = new Canvas2DNode(this);
	node.id = this.nodes.length;
	this.nodes.push(node);
	this.layers[0].push(node); // by default in layer 0
	
	return node;
};
/**
* Create one sprite
* @param	{Object} jsonIn
* 	@param {String} jsonIn.url url of the sprite
* 	@param {Int} [jsonIn.cols=1] cols of the sprite
* 	@param {Int} [jsonIn.rows=1] rows of the sprite
* 	@param {Function} [jsonIn.onload] On load event
* @returns {Canvas2DSprite} Canvas2DSprite object.
*/
Canvas2DJS.prototype.createSprite = function(jsonIn) {
	var sprite = new Canvas2DSprite();
	sprite.id = this.sprites.length;
	this.sprites.push(sprite);
	sprite.create(jsonIn);
	return sprite;
};
/**
* Create one helper box info
* @param	{Object} jsonIn
* 	@param {Array<Int>} [jsonIn.rgb=[255,255,0]] Values rgb
* @returns {Canvas2DNode} Canvas2DNode object.
*/
Canvas2DJS.prototype.createHelperBoxInfo = function(jsonIn) {
	var str = 	'<div id="DIVID_C2DEditNode">'+
					'WIDTH<div id="DIVID_C2DEditNode_sliderWidth"></div>'+
					'HEIGHT<div id="DIVID_C2DEditNode_sliderHeight"></div>'+
					'X<div id="DIVID_C2DEditNode_sliderX"></div>'+
					'Y<div id="DIVID_C2DEditNode_sliderY"></div>'+
					'ROT<div id="DIVID_C2DEditNode_sliderRot"></div>'+
					'<input type="checkbox" id="DIVID_C2DEditNode_visible" checked="true"/>'+
					'<input type="text" id="DIVID_C2DEditNode_sliderLog" style="width:90%" />'+
				'</div>';
	this.$.append(str);
	
	
	this.nodeBoxInfo = this.createNode();
	this.nodeBoxInfo.setLayer(100);
	this.nodeBoxInfo.show();
	this.boxInfo = {width: 100,
					height: 5,
					x: 0,
					y: 0,
					rot: 0.0,
					rgb: (jsonIn!=undefined && jsonIn.rgb!=undefined) ? jsonIn.rgb : [255,255,0]};
	this.drawBoxInfo();
	
	document.getElementById('DIVID_C2DEditNode_visible').addEventListener("click", (function(e) {
												if(this.opacity == 0.0) this.show();
												else this.hide();
											}).bind(this.nodeBoxInfo));
	
	$("#DIVID_C2DEditNode_sliderWidth").slider({max:150.0,
											min:1,
											value:this.boxInfo.width,
											step:1,
											slide:(function(event,ui){
													 this.boxInfo.width = ui.value;
													 this.drawBoxInfo();
												}).bind(this)});
	$("#DIVID_C2DEditNode_sliderHeight").slider({max:150.0,
											min:1,
											value:this.boxInfo.height,
											step:1,
											slide:(function(event,ui){
													 this.boxInfo.height = ui.value;
													 this.drawBoxInfo();
												}).bind(this)});
	$("#DIVID_C2DEditNode_sliderX").slider({max:this.width,
											min:-this.width,
											value:this.boxInfo.x,
											step:1,
											slide:(function(event,ui){
													 this.boxInfo.x = ui.value;
													 this.drawBoxInfo();
												}).bind(this)});
	$("#DIVID_C2DEditNode_sliderY").slider({max:this.height,
											min:-this.height,
											value:this.boxInfo.y,
											step:1,
											slide:(function(event,ui){
													 this.boxInfo.y = ui.value;
													 this.drawBoxInfo();
												}).bind(this)});
	$("#DIVID_C2DEditNode_sliderRot").slider({max:3.14*2,
											min:0.0,
											value:this.boxInfo.rot,
											step:0.01,
											slide:(function(event,ui){
													 this.boxInfo.rot = ui.value;   
													 this.drawBoxInfo();
												}).bind(this)});

	return this.nodeBoxInfo;
};
/** @private */
Canvas2DJS.prototype.drawBoxInfo = function() {
	this.nodeBoxInfo.$clear();
	this.nodeBoxInfo.$(function(ctx, values) {
		ctx.fillStyle = "rgba("+values[0].rgb[0]+", "+values[0].rgb[1]+", "+values[0].rgb[2]+", 1.0)";
		ctx.fillRect(-(values[0].width/2), -(values[0].height/2), values[0].width, values[0].height);
	}, [this.boxInfo]);
	this.nodeBoxInfo.position($V2([this.boxInfo.x, this.boxInfo.y]));
	this.nodeBoxInfo.rotation(this.boxInfo.rot);
	$('#DIVID_C2DEditNode_sliderLog').val('{width:'+this.boxInfo.width+',height:'+this.boxInfo.height+',x:'+this.boxInfo.x+',y:'+this.boxInfo.y+',rot:'+((3.1416)-this.boxInfo.rot)+'}');
};
/**
* Stop all anims of the scene
*/
Canvas2DJS.prototype.allAnimStop = function() {
	for(var n = 0; n < this.nodes.length; n++) {
		this.nodes[n].animStop();
	}
};
/**
* Stop all frame animations of the sprites of the scene
*/
Canvas2DJS.prototype.allSpriteFramesStop = function() {
	for(var n = 0; n < this.nodes.length; n++) {
		this.nodes[n].spriteFramesStop();
	}
};
/**
* Hide all nodes of the scene
* @param {Int} [ms=0]
*/
Canvas2DJS.prototype.allHide = function(ms) {
	for(var n = 0; n < this.nodes.length; n++) {
		this.nodes[n].hide(ms);
	}
};
/**
* Show all nodes of the scene
* @param {Int} [ms=0]
*/
Canvas2DJS.prototype.allShow = function(ms) {
	for(var n = 0; n < this.nodes.length; n++) {
		this.nodes[n].show(ms);
	}
};


/** @private */
Canvas2DJS.prototype.startPhysic = function() { 
	this.world = new b2World(new b2Vec2(this.worldGravity.e[0], this.worldGravity.e[1]), true);//gravity //allow sleep
	this.updateDivPosition();
	this.Pstep = 0;
	
	
	var listener = new b2ContactListener();
    listener.BeginContact = function(contact) {
		var bodA = contact.GetFixtureA().GetBody();
		var bodB = contact.GetFixtureB().GetBody();
		if(bodA.bodyOnCollisionFunction != undefined) bodA.bodyOnCollisionFunction(bodB.canvas2DNode);
		if(bodB.bodyOnCollisionFunction != undefined) bodB.bodyOnCollisionFunction(bodA.canvas2DNode);
    };
    listener.EndContact = function(contact) {
        var bodA = contact.GetFixtureA().GetBody();
		var bodB = contact.GetFixtureB().GetBody();
		if(bodA.bodyOnEndCollisionFunction != undefined) bodA.bodyOnEndCollisionFunction(bodB.canvas2DNode);
		if(bodB.bodyOnEndCollisionFunction != undefined) bodB.bodyOnEndCollisionFunction(bodA.canvas2DNode);
    };
    listener.PostSolve = function(contact, impulse) {
        
    };
    listener.PreSolve = function(contact, oldManifold) {

    };
    this.world.SetContactListener(listener);
	
	this.physicEnable = true;
};
/**
* Set the gravity for the physic. By default 9.8.
* @param {Object} jsonIn
* 	@param {Float} jsonIn.x url of the sprite
* 	@param {Float} jsonIn.y url of the sprite
*/
Canvas2DJS.prototype.setGravity = function(jsonIn) {
	var x = (jsonIn != undefined && jsonIn.x != undefined) ? jsonIn.x : 0.0;
	var y = (jsonIn != undefined && jsonIn.y != undefined) ? jsonIn.y : 9.8;
	this.worldGravity = $V2([x, y]);
	
	if(this.world != undefined) this.world.SetGravity(new b2Vec2(this.worldGravity.e[0], this.worldGravity.e[1]));
};
/**
* Pause the physic simulation
*/
Canvas2DJS.prototype.pausePhysics = function() {
	this.physicEnable = false;
};
/**
* Resume the physic simulation
*/
Canvas2DJS.prototype.resumePhysics = function() {
	if(this.world == undefined) {
		this.startPhysic();
	} else {
		this.physicEnable = true;
	}
}; 
/**
* Obtain the current simulation step
* @returns {Int} step
*/
Canvas2DJS.prototype.getPhysicsSteps = function() {
	return this.Pstep;
}; 
/**
* Set the simulation steps to 0
*/
Canvas2DJS.prototype.resetPhysicsSteps = function() {
	this.Pstep = 0;
}; 
