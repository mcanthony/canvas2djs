/**
* @class
* @constructor
*/
Canvas2DNode = function(c2d) {
	this.id = undefined;
	this.c2d = c2d;
	this.childsNodes = [];
	this.M9 = 	[1.0, 0.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 0.0, 1.0];
	this.name = undefined;
	this.layer = 0;
	
	// STACK INSTRUCTIONS
	this.stack$ = [];
	this.values$ = [];
	
	// SPRITE FRAMES
	this.sprite = undefined;
	this.spriteOrigin = {x:0,y:0};
	this.intervalLocalAnim = false;
	this.frames_onendFunction = undefined;
	this.delay = 200;
	this.activeImages = [0];
	this.totalActiveImages = 1;
	this.currentImage = 0;
	
	// OPACITY
	this.intervalOpacity = false;
	this.opacityEndFunction = undefined;
	
	// ANIM
	this.stackPositions = [];
	this.playStackRunning = false;
	
	this.intervalPosition = false;
	this.currentPosition = $V2([0.0, 0.0]);
	this.setedPosition = $V2([0.0, 0.0]);
	
	this.intervalRotation = false;
	this.currentRotation = 0;
	this.setedRotation = 0;
	
	this.intervalScale = false;
	this.currentScale = $V2([1.0, 1.0]);
	this.setedScale = $V2([1.0, 1.0]);
	
	this.anim_onendFunction = undefined;
	
	// BOX2DJS NODE
	this.body = undefined; 
	this.fixDef = undefined;
	this.bodyDef = undefined;
	this.bodyOnCollisionFunction = undefined;
	this.bodyOnEndCollisionFunction = undefined;
	this.mousepicking = false;
	this.detector = false;
	this.distanceJoint = undefined;
	this.revoluteJoint = undefined;
	this.lockXaxis = false;
	this.lockYaxis = false;
};
/**
* Set this node on new layer. By default in layer 0
* @param {Int} id New id of layer
*/
Canvas2DNode.prototype.setLayer = function(id) { 
	for(var n = 0, fn = this.c2d.layers.length; n < fn; n++) {
		var tempArr = [];
		var findest = false;
		for(var nb = 0, fnb = this.c2d.layers[n].length; nb < fnb; nb++) {
			if(this.c2d.layers[n][nb] == this) {
				this.layer = id;
				if(this.c2d.layers[id] == undefined) this.c2d.layers[id] = [];
				this.c2d.layers[id].push(this.c2d.layers[n][nb]);
				findest = true;
			} else
				tempArr.push(this.c2d.layers[n][nb]);
		}
		this.c2d.layers[n] = tempArr;
		if(findest) break;
	}
};
/**
* Get the current layer of this node.
* @returns {Int} layer
*/
Canvas2DNode.prototype.getLayer = function() { 
	return this.layer;
};
/**
* Add child node
* @param {Object} jsonIn
* 	@param {Canvas2DNode} jsonIn.node The child node
* 	@param {V2} jsonIn.offset offset
*/
Canvas2DNode.prototype.addChildNode = function(jsonIn) { 
	this.childsNodes.push({node: jsonIn.node, offset: jsonIn.offset}); 
};
/**
* Add canvas instructions to the stack of fixed canvas instructions of this node.
* @param {Function} instructions Canvas instructions
* @param {Array} values Canvas context values
*/
Canvas2DNode.prototype.$ = function(instructions, values) { 
	this.stack$.push(instructions); 
	this.values$.push(values); 
};
/**
* Clear the fixed instructions stack
*/
Canvas2DNode.prototype.$clear = function() { 
	this.stack$ = []; 
	this.values$ = []; 
};
/**
* Hide the node
* @param {Int} [ms=0]
* @param {Function} onend
*/
Canvas2DNode.prototype.hide = function(ms, onend) {
	if(this.intervalOpacity == false) {
		window.cancelAnimationFrame(this.intervalOpacity);
		this.intervalOpacity = false;
	} 
	
	if(ms != undefined) {
		this.intervalOpacity = window.requestAnimFrame(this.hideAnimReq.bind(this, ms));
		
		if(onend != undefined) this.opacityEndFunction = onend;
	} else {
		this.opacity = 0.0;
	}
};
/** @private */
Canvas2DNode.prototype.hideAnimReq = function(ms) {
	var val = parseFloat(this.opacity)-( (((1000/ms)*1000)/60) /1000);
	this.opacity = val;
	if(val <= 0.0) {
		window.cancelAnimationFrame(this.intervalOpacity);
		this.intervalOpacity = false;
		
		this.opacity = 0.0;
		if(this.opacityEndFunction != undefined) this.opacityEndFunction();
		this.opacityEndFunction = undefined;
	} else {
		window.requestAnimFrame(this.hideAnimReq.bind(this, ms));
	}
};
/**
* Show the node
* @param {Int} [ms=0]
* @param {Function} onend
*/
Canvas2DNode.prototype.show = function(ms, onend) {
	if(this.intervalOpacity == false) {
		window.cancelAnimationFrame(this.intervalOpacity);
		this.intervalOpacity = false;
	} 
	
	if(ms != undefined) {
		this.intervalOpacity = window.requestAnimFrame(this.showAnimReq.bind(this, ms));
		
		if(onend != undefined) this.opacityEndFunction = onend;
	} else {
		this.opacity = 1.0;
	}
};
/** @private */
Canvas2DNode.prototype.showAnimReq = function(ms) {
	var val = parseFloat(this.opacity)+( (((1000/ms)*1000)/60) /1000);
	this.opacity = val;
	if(val >= 1.0) {
		window.cancelAnimationFrame(this.intervalOpacity);
		this.intervalOpacity = false;
		
		this.opacity = 1.0;
		if(this.opacityEndFunction != undefined) this.opacityEndFunction(); 
		this.opacityEndFunction = undefined;
	} else {
		window.requestAnimFrame(this.showAnimReq.bind(this, ms));
	}
};
// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
// TRANSFORMS
// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
/** @private */
Canvas2DNode.prototype.updateM9 = function() { 
	this.M9 = [	Math.cos(this.currentRotation)*this.currentScale.e[0],			Math.sin(this.currentRotation)*this.currentScale.e[0],	this.currentPosition.e[0],
				(Math.sin(this.currentRotation)*-1.0)*this.currentScale.e[1],	Math.cos(this.currentRotation)*this.currentScale.e[1],	this.currentPosition.e[1],
				this.M9[6],														this.M9[7],												this.M9[8]];
				
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++) {
		var x = this.getVectorX().x(this.childsNodes[n].offset.e[0]);
		var y = this.getVectorY().x(this.childsNodes[n].offset.e[1]);
		var vec = this.currentPosition.add(x).add(y);
		this.childsNodes[n].node.position(vec);
		this.childsNodes[n].node.rotation(-this.currentRotation); 
		this.childsNodes[n].node.scale($V2([this.currentScale.e[0], this.currentScale.e[1]]));
	}
};
/**
* Reset position matrix
*/
Canvas2DNode.prototype.resetPositionMatrix = function() {
	if(this.intervalPosition == false) {
		window.cancelAnimationFrame(this.intervalPosition);
		this.intervalPosition = false;
	}
	this.currentPosition = $V2([0.0, 0.0]);
	this.setedPosition = $V2([0.0, 0.0]);
	
	this.updateM9();
	
	if(this.body != undefined) this.body.SetPosition(new b2Vec2(0.0, 0.0));
};
/**
* Reset rotation matrix
*/
Canvas2DNode.prototype.resetRotationMatrix = function() { 
	if(this.intervalRotation == false) {
		window.cancelAnimationFrame(this.intervalRotation);
		this.intervalRotation = false;
	}
	this.currentRotation = 0.0;
	this.setedRotation = 0.0;
	
	this.updateM9();
	
	if(this.body != undefined) this.body.SetAngle(0.0);
};
/**
* Reset scale matrix
*/
Canvas2DNode.prototype.resetScaleMatrix = function() {
	if(this.intervalScale == false) {
		window.cancelAnimationFrame(this.intervalScale);
		this.intervalScale = false;
	}
	this.currentScale = $V2([1.0, 1.0]);
	this.setedScale = $V2([1.0, 1.0]);
	
	this.updateM9();
};
/**
* Add a animated position to the positions stack of this node
* @param {Object} jsonIn
* 	@param {V2} jsonIn.position Position point
* 	@param {Float} [jsonIn.velocity=0.1] Velocity
* 	@param {Function} jsonIn.onend Function to fire when animation finish
*/
Canvas2DNode.prototype.animPosition = function(jsonIn) {
	this.stackPositions.push([jsonIn, 'translation']);
	if(this.playStackRunning == false) this.playStack();
};
/**
* Add a animated rotation to the rotations stack of this node
* @param {Object} jsonIn
* 	@param {Float} jsonIn.rotation Rotation
* 	@param {Float} [jsonIn.velocity=0.1] Velocity
* 	@param {Function} jsonIn.onend Function to fire when animation finish
*/
Canvas2DNode.prototype.animRotation = function(jsonIn) {
	this.stackPositions.push([jsonIn, 'rotation']);
	if(this.playStackRunning == false) this.playStack();
};
/**
* Add a animated scale to the scales stack of this node
* @param {Object} jsonIn
* 	@param {V2} jsonIn.scale Scale dimensions
* 	@param {Float} [jsonIn.velocity=0.1] Velocity
* 	@param {Function} jsonIn.onend Function to fire when animation finish
*/
Canvas2DNode.prototype.animScale = function(jsonIn) {
	this.stackPositions.push([jsonIn, 'scale']);
	if(this.playStackRunning == false) this.playStack();
};
/**
* stop all anims of this node
*/
Canvas2DNode.prototype.animStop = function() {
	this.stackPositions = [];
	this.playStackRunning = false;
	if(this.intervalPosition == false) {
		window.cancelAnimationFrame(this.intervalPosition);
		this.intervalPosition = false;
	}
	if(this.intervalRotation == false) {
		window.cancelAnimationFrame(this.intervalRotation);
		this.intervalRotation = false;
	}
	if(this.intervalScale == false) {
		window.cancelAnimationFrame(this.intervalScale);
		this.intervalScale = false;
	}
	
	this.anim_onendFunction = undefined;
};
/** @private */
Canvas2DNode.prototype.playStack = function(loop) {	
	if(this.stackPositions.length > 0) {
		this.playStackRunning = true;
		var _velocity = this.stackPositions[0][0].velocity;
		this.anim_onendFunction = this.stackPositions[0][0].onend;
		
		if(this.stackPositions[0][1] == 'rotation') { // rotation
			if(this.intervalRotation == false) {
				window.cancelAnimationFrame(this.intervalRotation);
				this.intervalRotation = false;
			}
			this.setedRotation = this.stackPositions[0][0].rotation;
			this.intervalRotation = window.requestAnimFrame(this.rotationAnimReq.bind(this, _velocity, loop));
		} else if(this.stackPositions[0][1] == 'scale') { // scale
			if(this.intervalScale == false) {
				window.cancelAnimationFrame(this.intervalScale);
				this.intervalScale = false;
			}
			this.setedScale = this.stackPositions[0][0].scale;
			this.intervalScale = window.requestAnimFrame(this.scaleAnimReq.bind(this, _velocity, loop));
		} else { // position
			if(this.intervalPosition == false) {
				window.cancelAnimationFrame(this.intervalPosition);
				this.intervalPosition = false;
			}
			this.setedPosition = this.stackPositions[0][0].position;
			this.intervalPosition = window.requestAnimFrame(this.positionAnimReq.bind(this, _velocity, loop));
		}
		  
		if(loop != undefined && loop == true) this.stackPositions.push(this.stackPositions[0]);
		this.stackPositions.shift();
	} else {
		this.playStackRunning = false;
	}
};
/** @private */
Canvas2DNode.prototype.positionAnimReq = function(_velocity, loop) {
	var velocity = (_velocity != undefined) ? _velocity : 0.1;
	var vec = this.setedPosition.subtract(this.currentPosition);
	if(vec.modulus() < 0.1) {
		window.cancelAnimationFrame(this.intervalPosition);
		this.intervalPosition = false;
		
		if(this.anim_onendFunction != undefined) this.anim_onendFunction();
		this.playStack(loop);
	} else { 
		this.currentPosition = this.currentPosition.add(vec.x(velocity));
		
		this.updateM9();
		
		window.requestAnimFrame(this.positionAnimReq.bind(this, _velocity, loop));
	}
};
/** @private */
Canvas2DNode.prototype.rotationAnimReq = function(_velocity, loop) {
	var velocity = (_velocity != undefined) ? _velocity : 0.1;
	if(this.currentRotation < this.setedRotation+velocity && this.currentRotation > this.setedRotation-velocity) {
		window.cancelAnimationFrame(this.intervalRotation);
		this.intervalRotation = false;
		
		if(this.anim_onendFunction != undefined) this.anim_onendFunction();
		this.playStack(loop);
	} else { 
		var val = (this.setedRotation-this.currentRotation)*velocity; 
		this.currentRotation = this.currentRotation+val;
		
		this.updateM9();
		
		window.requestAnimFrame(this.rotationAnimReq.bind(this, _velocity, loop));
	}
};
/** @private */
Canvas2DNode.prototype.scaleAnimReq = function(_velocity, loop) {
	var velocity = (_velocity != undefined) ? _velocity : 0.1;
	var vec = this.setedScale.subtract(this.currentScale);
	if(vec.modulus() < 0.1) {
		window.cancelAnimationFrame(this.intervalScale);
		this.intervalScale = false;
		
		if(this.anim_onendFunction != undefined) this.anim_onendFunction();
		this.playStack(loop);
	} else {  
		this.currentScale = this.currentScale.add(vec.x(velocity));
		
		this.updateM9();
		
		window.requestAnimFrame(this.scaleAnimReq.bind(this, _velocity, loop));  
	}
};
/**
* Set the position. If not argument then returns the position.
* @param {V2} position
* @returns {V2} position
*/
Canvas2DNode.prototype.position = function(position) {
	if(position != undefined) {
		if(this.intervalPosition == false) {
			window.cancelAnimationFrame(this.intervalPosition);
			this.intervalPosition = false;
		}
		this.setedPosition = position;
		this.currentPosition = this.setedPosition;
		
		this.updateM9();
		
		if(this.body != undefined) {
			this.body.SetPosition(new b2Vec2(this.setedPosition.e[0]*(this.c2d.worldScale*this.c2d.styleWidthScale), this.setedPosition.e[1]*(this.c2d.worldScale*this.c2d.styleHeightScale)));
			this.makePos = true;
		}
	} else {
		return $V2([this.currentPosition.e[0], this.currentPosition.e[1]]);
	}
};
/**
* Set the rotation. If not argument then returns the position.
* @param {Float} rotation
* @returns {Float} rotation
*/
Canvas2DNode.prototype.rotation = function(rotation) {
	if(rotation != undefined) {
		if(this.intervalRotation == false) {
			window.cancelAnimationFrame(this.intervalRotation);
			this.intervalRotation = false;
		}
		this.setedRotation = rotation;
		this.currentRotation = this.setedRotation;
		
		this.updateM9();
		
		if(this.body != undefined) this.body.SetAngle(this.setedRotation);
	} else {
		return this.currentRotation;
	}
};
/**
* Set the scale. If not argument then returns the scale.
* @param {V2} scale
* @returns {V2} scale
*/
Canvas2DNode.prototype.scale = function(scale) {
	if(scale != undefined) {
		if(this.intervalScale == false) {
			window.cancelAnimationFrame(this.intervalScale);
			this.intervalScale = false;
		}
		this.setedScale = scale;
		this.currentScale = this.setedScale;
		
		this.updateM9();
	} else {
		return $V2([Math.abs(this.currentScale.e[0]), Math.abs(this.currentScale.e[1])]);
	}
};
/**
* Flip horizontal
*/
Canvas2DNode.prototype.flipH = function() {
	this.setedScale = $V2([this.currentScale.e[0]*-1.0, this.currentScale.e[1]]);
	this.currentScale = this.setedScale;
	
	this.updateM9();
};
/**
* Flip vertical
*/
Canvas2DNode.prototype.flipV = function() {
	this.setedScale = $V2([this.currentScale.e[0], this.currentScale.e[1]*-1.0]);
	this.currentScale = this.setedScale;
	
	this.updateM9();
};
/**
* Get vector x normalized
* @returns {V2} V2 object.
*/
Canvas2DNode.prototype.getVectorX = function() {
	return $V2([this.M9[0], this.M9[3]]).normalize();
};
/**
* Get vector y normalized
* @returns {V2} V2 object.
*/
Canvas2DNode.prototype.getVectorY = function() {
	return $V2([this.M9[1], this.M9[4]]).normalize();
};



// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
// BODYS
// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
/**
* Enable 2D physic for this node
* @param {Object} jsonIn
* 	@param {String} [jsonIn.shape_type='square'] 'square'|'circle'
* 	@param {Float} [jsonIn.width=25.0] Width if shape_type is 'square'
* 	@param {Float} [jsonIn.height=25.0] Height if shape_type is 'square'
* 	@param {Float} [jsonIn.radius=25.0] Radius  if shape_type is 'circle'
* 	@param {Float} [jsonIn.mass=1.0] ==0.0 static; >0.0 dynamic; 
* 	@param {Float} [jsonIn.density=1.0] Density
* 	@param {Float} [jsonIn.friction=0.5] Friction
* 	@param {Float} [jsonIn.restitution=0.2] Restitution
* 	@param {Bool} [jsonIn.mousepicking=false] Allow drag the node with the mouse
* 	@param {Bool} [jsonIn.detector=false] Set as only detector
*/
Canvas2DNode.prototype.bodyEnable = function(jsonIn) { 
	if(this.c2d.world == undefined) this.c2d.startPhysic();
	
	this.mousepicking = jsonIn.mousepicking || false;
	this.detector = jsonIn.detector || false;
	
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = (jsonIn != undefined && jsonIn.density != undefined) ? jsonIn.density*this.c2d.worldScale : 1.0;
	this.fixDef.friction = (jsonIn != undefined && jsonIn.friction != undefined) ? jsonIn.friction*this.c2d.worldScale : 0.5;
	this.fixDef.restitution = (jsonIn != undefined && jsonIn.restitution != undefined) ? jsonIn.restitution*this.c2d.worldScale : 0.2;
	
	var shapeType = (jsonIn != undefined && jsonIn.shape_type == 'circle') ? 'circle' : 'square';
	if(shapeType == 'circle') {
		var shapeRadius = (jsonIn != undefined && jsonIn.radius != undefined) ? jsonIn.radius*(this.c2d.worldScale*this.c2d.styleWidthScale) : 25.0*(this.c2d.worldScale*this.c2d.styleWidthScale);
		this.fixDef.shape = new b2CircleShape(shapeRadius);
	} else {
		var shapeWidth = (jsonIn != undefined && jsonIn.width != undefined) ? (jsonIn.width/2.0)*(this.c2d.worldScale*this.c2d.styleWidthScale) : (25.0/2.0)*(this.c2d.worldScale*this.c2d.styleWidthScale);
		var shapeHeight = (jsonIn != undefined && jsonIn.height != undefined) ? (jsonIn.height/2.0)*(this.c2d.worldScale*this.c2d.styleWidthScale) : (25.0/2.0)*(this.c2d.worldScale*this.c2d.styleWidthScale);
		this.fixDef.shape = new b2PolygonShape;
		this.fixDef.shape.SetAsBox(shapeWidth, shapeHeight);
	}
	
	this.bodyDef = new b2BodyDef;
	//this.bodyDef.type = b2Body.b2_staticBody;
	//this.bodyDef.type = b2Body.b2_kynematicBody;
	 
	if(this.detector)
		this.bodyDef.type = b2Body.b2_kynematicBody;
	else	
		this.bodyDef.type = (jsonIn.mass == 0) ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
	this.bodyDef.position.Set(this.currentPosition.e[0]*(this.c2d.worldScale*this.c2d.styleWidthScale), this.currentPosition.e[1]*(this.c2d.worldScale*this.c2d.styleHeightScale));
	
	this.body = this.c2d.world.CreateBody(this.bodyDef);
	this.body.canvas2DNode = this;
	//this.body.SetLinearDamping(10.0); 
	//this.body.SetLinearVelocity(new b2Vec2(1000,1000)); 
	var ff = this.body.CreateFixture(this.fixDef);  
	if(this.detector) 
		ff.SetSensor(true); 
	
	var massData = new b2MassData();
	this.body.GetMassData(massData);
	massData.mass = jsonIn.mass;
	this.body.SetMassData(massData);
	// TODO para integrar masa ver hilo http://community.stencyl.com/index.php?topic=8718.0
};
/**
* Lock or unlock body in X axis
* @param {Bool} lock
*/
Canvas2DNode.prototype.bodyLockX = function(lock) { 
	this.lockXaxis = lock; 
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++) 
		this.childsNodes[n].node.bodyLockX(lock);
};
/**
* Lock or unlock body in Y axis
* @param {Bool} lock
*/
Canvas2DNode.prototype.bodyLockY = function(lock) { 
	this.lockYaxis = lock;
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++)
		this.childsNodes[n].node.bodyLockY(lock);
};
/**
* Enable o disable the body of this node
* @param {Bool} active
*/
Canvas2DNode.prototype.bodyActive = function(active) { 
	if(active == false) {
		if(this.body != undefined) {			
			this.body.SetActive(false);
			this.body.SetAwake(false);
			this.tmpBody = this.body;
			this.body = undefined;
		}
	} else {
		if(this.tmpBody != undefined || this.body != undefined) {
			this.body = this.tmpBody || this.body;
			this.tmpBody = undefined; 
			this.body.SetPosition(new b2Vec2(this.setedPosition.e[0]*(this.c2d.worldScale*this.c2d.styleWidthScale), this.setedPosition.e[1]*(this.c2d.worldScale*this.c2d.styleHeightScale)));
			this.body.SetAngle(this.setedRotation);
			this.body.SetActive(true);
			this.body.SetAwake(true);
		}
	}
	
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++)
		this.childsNodes[n].node.bodyActive(active);
};
/**
* Remove completely the body of this node
*/
Canvas2DNode.prototype.bodyRemove = function() { 
	this.mousepicking = false; 
	
	this.c2d.world.DestroyBody(this.body);
	this.body = undefined;
	
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++)
		this.childsNodes[n].node.bodyRemove();
};
/**
* Apply body impulse
* @param	{Object} jsonIn
* 	@param {V2} jsonIn.dir Direction vector normalized
* 	@param {Float} jsonIn.km_h Function fired at every frame
*/
Canvas2DNode.prototype.bodySetImpulse = function(jsonIn) {
	var vecDir = $V2([jsonIn.dir.e[0], jsonIn.dir.e[1]]);
	
	var vec;
	if(jsonIn.km_h != undefined) {
		var newtons = 1*((jsonIn.km_h*1000)/(3600*2));  // kg*(m/(s*2)) 
		vecDir = vecDir.x(newtons*-1.0);
	}
	if(this.body != undefined) this.body.ApplyImpulse(new b2Vec2(vecDir.e[0], vecDir.e[1]), this.body.GetWorldCenter());  
};
/**
* Apply body torque
* @param {Float} deg
*/
Canvas2DNode.prototype.bodySetTorque = function(deg) { 
	if(this.body != undefined) this.body.SetAngularVelocity(deg);
};
/**
* ClearForces in the body
*/
Canvas2DNode.prototype.bodyClearForces = function() { 
	if(this.body != undefined) {
		this.body.SetLinearVelocity(new b2Vec2(0.0, 0.0));
		this.body.SetAngularVelocity(0);
	}
	
	for(var n = 0, fn = this.childsNodes.length; n < fn; n++)
		this.childsNodes[n].node.bodyClearForces();
};
/**
* Get the velocity vector of this node
* @returns {V2} linear velocity.
*/
Canvas2DNode.prototype.bodyGetLinearVelocity = function() { 
	if(this.body != undefined) {
		return $V2([this.body.GetLinearVelocity().x*-1.0, this.body.GetLinearVelocity().y*-1.0]);
	} else return $V2([0,0]);
};
/**
* Set body on collision function
* @param {Function} oncollision
* @example
* abejaA.name = 'abejaA';
* abejaB.bodyOnCollision(function(node) {
*                            if(node.name == 'abejaA') alert('collision with A');
*                        });
*/
Canvas2DNode.prototype.bodyOnCollision = function(funct) { 
	this.body.bodyOnCollisionFunction = funct;
};
/**
* Set body on end collision function
* @param	{Function} onendcollision
* @example
* abejaA.name = 'abejaA';
* abejaB.bodyOnEndCollision(function(node) {
*                            if(node.name == 'abejaA') alert('end collision with A');
*                        });
*/
Canvas2DNode.prototype.bodyOnEndCollision = function(funct) { 
	this.body.bodyOnEndCollisionFunction = funct;
};
/**
* set distance joint
* @param {Object} jsonIn
* 	@param {Canvas2DNode} jsonIn.node node
*/
Canvas2DNode.prototype.bodySetDistanceJoint = function(jsonIn) { 
	var dj = new b2DistanceJointDef();
	dj.Initialize(this.body, jsonIn.node.body, new b2Vec2(this.currentPosition.e[0]*(this.c2d.worldScale*this.c2d.styleWidthScale),this.currentPosition.e[1]*(this.c2d.worldScale*this.c2d.styleHeightScale)), new b2Vec2(jsonIn.node.currentPosition.e[0]*(this.c2d.worldScale*this.c2d.styleWidthScale),jsonIn.node.currentPosition.e[1]*(this.c2d.worldScale*this.c2d.styleHeightScale)));
	dj.collideConnected = true;
	this.distanceJoint = this.c2d.world.CreateJoint(dj);
};
/**
* Remove distance joint
*/
Canvas2DNode.prototype.bodyRemoveDistanceJoint = function() { 
	this.c2d.world.DestroyJoint(this.distanceJoint);
	this.distanceJoint = undefined;
};
/**
* set revolute joint
* @param {Object} jsonIn
* 	@param {Canvas2DNode} jsonIn.node node
* 	@param {Float} [jsonIn.referenceAngle=0.0] referenceAngle Reference angle in radians
* 	@param {Float} [jsonIn.lowerAngle=-0.5] lowerAngle Lower angle in radians
* 	@param {Float} [jsonIn.upperAngle=1.0] upperAngle Upper angle in radians
*/
Canvas2DNode.prototype.bodySetRevoluteJoint = function(jsonIn) { 
	this.rj = new  b2RevoluteJointDef();
	this.rj.Initialize(this.body, jsonIn.node.body, this.body.GetWorldCenter());
	 
	this.rj.maxMotorTorque = 1.0; 
	this.rj.motorSpeed = 0.0;
	this.rj.enableMotor = true;
	
	this.rj.referenceAngle = jsonIn.referenceAngle || 0.0;
	this.rj.lowerAngle = jsonIn.lowerAngle || -0.5;
	this.rj.upperAngle = jsonIn.upperAngle || 1.0;
	this.rj.enableLimit = true;

	//rj.localAnchorA.Set(1,1);
	//rj.localAnchorB.Set(0,0);
  
	this.revoluteJoint = this.c2d.world.CreateJoint(this.rj);
};
/**
* Remove revolute joint
*/
Canvas2DNode.prototype.bodyRemoveRevoluteJoint = function() { 
	this.c2d.world.DestroyJoint(this.revoluteJoint);
	this.revoluteJoint = undefined;
};

// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
// SPRITES
// ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
/**
* Set the sprite object
* @param {Canvas2DSprite} sprite Canvas2DSprite object
*/
Canvas2DNode.prototype.spriteSet = function(sprite) {
	this.sprite = sprite;
};
/**
* Set the active frames of the sprite
* @param {Object} jsonIn
* 	@param {Array<Int>} jsonIn.arrayFrames Set the active frames of the sprite
* 	@param {Int} jsonIn.delay Delay
* 	@param {Function} [jsonIn.onend] Onend frames event
*/
Canvas2DNode.prototype.spriteFrames = function(jsonIn) {
	this.delay = (jsonIn.delay != undefined) ? jsonIn.delay : this.delay;
	this.currentTime = 0;
	this.currentImage = 0;
	this.activeImages = jsonIn.arrayFrames;
	this.totalActiveImages = jsonIn.arrayFrames.length;
	
	if(this.intervalLocalAnim == false) {
		window.cancelAnimationFrame(this.intervalLocalAnim);
		this.intervalLocalAnim = false;
	}
	if(this.totalActiveImages > 1) {
		var _transition = jsonIn.transition;
		this.intervalLocalAnim = window.requestAnimFrame((function(){
			this.nextImage(_transition);
		}).bind(this));
										
		this.frames_onendFunction = jsonIn.onend;
	} else {
		this.enableImage(0);
	}
};
/** @private */
Canvas2DNode.prototype.enableImage = function(number, transition) {
	if(this.sprite.imagePositions[this.activeImages[number]] != undefined) {
		this.spriteOrigin = this.sprite.imagePositions[this.activeImages[number]].position;
	}
};
/** @private */
Canvas2DNode.prototype.nextImage = function(transition) {
	if(this.currentTime > this.delay) {
		this.currentTime = 0;
		if(this.currentImage >= (this.totalActiveImages-1)) {
			this.currentImage = 0;
			if(this.frames_onendFunction != undefined) this.frames_onendFunction();
		} else {
			this.currentImage = (this.currentImage+1);
		}
	} else {
		this.currentTime++;
	}
	this.enableImage(this.currentImage, transition);
	
	window.requestAnimFrame((function(){
		this.nextImage(transition);
	}).bind(this));
};
/**
* Stop the frame animation of the sprite
*/
Canvas2DNode.prototype.spriteFramesStop = function() {
	if(this.intervalOpacity == false) {
		window.cancelAnimationFrame(this.intervalOpacity);
		this.intervalOpacity = false;
	}
	
	if(this.intervalLocalAnim == false) {
		window.cancelAnimationFrame(this.intervalLocalAnim);
		this.intervalLocalAnim = false;
	} 
	
	this.frames_onendFunction = undefined;
};