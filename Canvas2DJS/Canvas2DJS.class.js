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
	this.sprites = [];
	 
	this.target;
	this.canvas;
	this.width;
	this.height;
	this.scale = 1.0; 
	this.divPositionX = 0;
	this.divPositionY = 0;
	this.mousePosX, this.mousePosY, this.oldMousePosClickX, this.oldMousePosClickX;
	
	this.worldScale;
	this.world = undefined;
	this.worldGravity = $V2([0.0, 9.8]);
	this.Pstep = 0;
	this._BODYSeleccionado = undefined;
	this.mousePVec, this.isMouseDown = false, this.selectedBody, this.mouseJoint;
};
/**
* Set the canvas element
* @param	{Object} jsonIn
* 	@param {HTMLCanvasElement} jsonIn.target The canvas element
* 	@param {Float} [jsonIn.scale=1.0] Scale of target
* 	@param {Float} [jsonIn.pxByMeter=6.0] Scale of dynamic world
*/
Canvas2DJS.prototype.createScene = function(jsonIn) {
	this.target = jsonIn.target;
	this.canvas = this.target.getContext("2d");
	this.width = $('#'+this.target.id).width();
	this.height = $('#'+this.target.id).height();
	if(jsonIn.scale != undefined) this.scale = jsonIn.scale; 
	this.worldScale = (jsonIn.pxByMeter != undefined) ? (1.0/jsonIn.pxByMeter) : (1.0/6.0);	
	
	
	var str = 	'<table id="DIVID_SHApreloader" style="z-index:99;position:absolute;width:'+this.width+'px;height:'+this.height+'px;background-color:#FF0000">'+
					'<tr>'+
						'<td colspan="3" style="height:'+(this.height/2.9)+'px">'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td style="width:80px">'+
						'</td>'+
						'<td style="width:'+(this.width-160)+'px">'+
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
	$('#'+this.target.id).append(str);
	$('#'+this.target.id).css('overflow','hidden');
	 
							
	$(document).ready(c2d.updateDivPosition);
	window.addEventListener("resize", c2d.updateDivPosition, false);
	window.addEventListener("orientationchange", c2d.updateDivPosition, false); 

	window.addEventListener('touchStart', function(e) {
												_this.divPosition = _this.getElementPosition(_this.target);
												e.preventDefault();
												//var touch = e.touches[0];
												//alert(touch.pageX + " - " + touch.pageY);
											}, false);
	window.addEventListener('touchmove', function(e) {
												_this.divPosition = _this.getElementPosition(_this.target);
												e.preventDefault();
											}, false);
											
	document.body.addEventListener("mouseup", c2d.mouseup, false);
	document.body.addEventListener("touchend", c2d.mouseup, false);
	this.target.addEventListener("mousedown", c2d.mousedown, false);
	this.target.addEventListener("touchstart", c2d.mousedown, false);
	document.body.addEventListener("mousemove", c2d.mousemove, false); 
	document.body.addEventListener("touchmove", c2d.mousemove, false); 
};
/** @private */
Canvas2DJS.prototype.updateDivPosition = function() {
	c2d.divPositionX = c2d.getElementPosition(c2d.target).x;
	c2d.divPositionY = c2d.getElementPosition(c2d.target).y;
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
	c2d.mousePosX = undefined;
	c2d.mousePosY = undefined;
	c2d._BODYSeleccionado = undefined;
	c2d.isMouseDown = false;
};
/**  @private */
Canvas2DJS.prototype.mousedown = function(e) {
	//e.preventDefault(); // si se habilita no funciona sobre un iframe
	if(e.targetTouches != undefined) {
		e = e.targetTouches[0];
		e.button = 0;
	}
	c2d.oldMousePosClickX = c2d.mousePosX;
	c2d.oldMousePosClickY = c2d.mousePosY; 
	
	c2d.isMouseDown = true;
};
/**  @private */
Canvas2DJS.prototype.mousemove = function(e) {
	e.preventDefault();
	if(e.targetTouches != undefined) {
		e = e.targetTouches[0];
		e.button = 0;
	} 
	
	c2d.mousePosX = (e.clientX - c2d.divPositionX)*c2d.worldScale; 
	c2d.mousePosY = (e.clientY - c2d.divPositionY)*c2d.worldScale;
};
/** @private */
Canvas2DJS.prototype.getBodyCB = function(fixture) {
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
	   if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), c2d.mousePVec)) {
		  c2d.selectedBody = fixture.GetBody();
		  return false;
	   }
	}
	return true;
};

 /** @private */
Canvas2DJS.prototype.getBodyAtMouse = function() {
	c2d.mousePVec = new b2Vec2(c2d.mousePosX, c2d.mousePosY);
	var aabb = new b2AABB();
	aabb.lowerBound.Set(c2d.mousePosX - 0.001, c2d.mousePosY - 0.001);
	aabb.upperBound.Set(c2d.mousePosX + 0.001, c2d.mousePosY + 0.001);
	 
	c2d.selectedBody = null;
	c2d.world.QueryAABB(c2d.getBodyCB, aabb); 
	return c2d.selectedBody;
};
 /** @private */
Canvas2DJS.prototype.next = function() {
	window.requestAnimFrame(c2d.next);   
	
	if(c2d.physicEnable == true) {
		c2d.Pstep++;
		
		if(c2d.isMouseDown && !c2d.mouseJoint) {
			if(c2d._BODYSeleccionado == undefined) {
				c2d._BODYSeleccionado = c2d.getBodyAtMouse();  
			} else if(c2d._BODYSeleccionado != undefined && c2d._BODYSeleccionado.canvas2DNode.mousepicking == true) {
				//c2d._BODYSeleccionado.SetPosition(new b2Vec2(c2d.mousePosX, c2d.mousePosY)); 
				
				var md = new b2MouseJointDef();
				md.bodyA = c2d.world.GetGroundBody();
				md.bodyB = c2d._BODYSeleccionado;
				md.target.Set(c2d.mousePosX, c2d.mousePosY);
				md.collideConnected = true;
				md.maxForce = 300.0 * c2d._BODYSeleccionado.GetMass();
				c2d.mouseJoint = c2d.world.CreateJoint(md);
				
				c2d._BODYSeleccionado.SetAwake(true);
			} else {
				c2d._BODYSeleccionado = undefined;
			}
		}
	
		if(c2d.mouseJoint) {
		   if(c2d._BODYSeleccionado == undefined) {
				c2d.world.DestroyJoint(c2d.mouseJoint);
				c2d.mouseJoint = null;
			} else { 
				c2d.mouseJoint.SetTarget(new b2Vec2(c2d.mousePosX, c2d.mousePosY));
			}
		}
	 
		c2d.world.Step(1 / 60, 10, 10); 
		//c2d.world.DrawDebugData(); 
		c2d.world.ClearForces();
		
		var obj = c2d.world.GetBodyList();
		
		for(var n = 0; n < c2d.nodes.length; n++) {
			if(c2d.nodes[n].body != undefined) {
				if(c2d.nodes[n].playStackRunning == false) {
					var pos = c2d.nodes[n].body.GetPosition();
					if(c2d.nodes[n].lockXaxis == false) {
						var x = pos.x/c2d.worldScale;
					} else {
						var x = c2d.nodes[n].currentPosition.e[0];
						c2d.nodes[n].body.SetPosition(new b2Vec2(c2d.nodes[n].currentPosition.e[0]*c2d.worldScale, pos.y));
					}
					if(c2d.nodes[n].lockYaxis == false) {
						var y = pos.y/c2d.worldScale;
					} else {
						var y = c2d.nodes[n].currentPosition.e[1];
						c2d.nodes[n].body.SetPosition(new b2Vec2(pos.x, c2d.nodes[n].currentPosition.e[1]*c2d.worldScale));
					}
					c2d.nodes[n].currentPosition = $V2([x, y]);
					
					
					var angle = c2d.nodes[n].body.GetAngle();
					c2d.nodes[n].currentRotation = angle*-1.0;
					
					c2d.nodes[n].updateM9();
				} else {
					c2d.nodes[n].body.SetPosition(new b2Vec2(c2d.nodes[n].currentPosition.e[0]*c2d.worldScale, c2d.nodes[n].currentPosition.e[1]*c2d.worldScale));
					c2d.nodes[n].bodyClearForces();
				}
				
			}
		}
	}
	
	// DRAW
	//m11 	m21 	dx
	//m12 	m22 	dy
	//0 	0 	1
	//c2d.canvas.setTransform(m11, m12, m21, m22, dx, dy);
	//c2d.canvas.transform(1, 0, 0, 1, 0, 0);
	c2d.canvas.clearRect(0, 0, c2d.width, c2d.height);
	for(var n = 0; n < c2d.nodes.length; n++) {
		c2d.canvas.save();
		c2d.canvas.globalAlpha = c2d.nodes[n].opacity;
		//c2d.canvas.translate(c2d.nodes[n].currentPosition.e[0], c2d.nodes[n].currentPosition.e[1]);
		//c2d.canvas.rotate(c2d.nodes[n].currentRotation);
		//c2d.canvas.scale(c2d.nodes[n].currentScale.e[0], c2d.nodes[n].currentScale.e[1]);
				  
		var m = c2d.nodes[n].M9;
		c2d.canvas.setTransform(m[0], m[3], m[1], m[4], m[2], m[5]);
		
		for(var s = 0; s < c2d.nodes[n].stack$.length; s++) {
			c2d.nodes[n].stack$[s](c2d.canvas);
		}
		
		if(c2d.nodes[n].sprite) {
			
			c2d.canvas.drawImage(	c2d.nodes[n].sprite.image,
									c2d.nodes[n].spriteOrigin.x-(c2d.nodes[n].sprite.cellWidth/2),
									c2d.nodes[n].spriteOrigin.y-(c2d.nodes[n].sprite.cellHeight/2),
									c2d.nodes[n].sprite.cellWidth,
									c2d.nodes[n].sprite.cellHeight);
			
		}
		c2d.canvas.globalAlpha = 1.0;
		c2d.canvas.restore();
	}
	
};
/**
* Start
* @param {Function} [onready] On ready event
*/
Canvas2DJS.prototype.start = function(onready) {
	var spritesloaded = 0;
	for(var n = 0, fn = this.sprites.length; n < fn; n++)
		if(this.sprites[n].loaded == true) spritesloaded++;
		//$('#DIVID_SHApreloaderBar').css({'width':50.0+'%'}); 

	$('#DIVID_SHApreloaderBar').css({'width':(spritesloaded/this.sprites.length)*100.0+'%'}); 
	$('#preloaderPercent').html(parseInt((spritesloaded/this.sprites.length)*100.0)+'%'); 
	if(spritesloaded == this.sprites.length) { 
		$('#DIVID_SHApreloader').css({'display':'none'});
		c2d.next();
		if(onready != undefined) onready(); 
	} else {
		this.allHide(); 
		$('#DIVID_SHApreloader').css({'display':'block'});
		
		setTimeout(function() {
						c2d.start(onready);
					}, 100);
	}
};
/**
* Create one node
* @returns {Canvas2DNode} Canvas2DNode object.
*/
Canvas2DJS.prototype.createNode = function() {
	var node = new Canvas2DNode();
	node.id = this.nodes.length;
	this.nodes.push(node);
	
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
    }
    listener.EndContact = function(contact) {
        var bodA = contact.GetFixtureA().GetBody();
		var bodB = contact.GetFixtureB().GetBody();
		if(bodA.bodyOnEndCollisionFunction != undefined) bodA.bodyOnEndCollisionFunction(bodB.canvas2DNode);
		if(bodB.bodyOnEndCollisionFunction != undefined) bodB.bodyOnEndCollisionFunction(bodA.canvas2DNode);
    }
    listener.PostSolve = function(contact, impulse) {
        
    }
    listener.PreSolve = function(contact, oldManifold) {

    }
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
var c2d = new Canvas2DJS();