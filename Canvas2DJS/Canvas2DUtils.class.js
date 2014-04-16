window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();
window.cancelAnimationFrame = function(){
	return 	window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			window.msCancelAnimationFrame     || 
			function(callback){
				clearTimeout(callback);
			};
}();

// http://box2d-js.sourceforge.net/
var b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2AABB = Box2D.Collision.b2AABB,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2World = Box2D.Dynamics.b2World,
	b2ContactListener = Box2D.Dynamics.b2ContactListener,
	//b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
	b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
	b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
	
/**
* @class
* @constructor

* @property {Float32Array} e Array with 2 values
*/
V2 = function(elements) {
	this.e = elements;
};
/**
* Perform a + b and get the vector
* @returns {V2}
* @param {V2} vector Vector b
*/
V2.prototype.add = function(v2) {
    return $V2([ this.e[0] + v2.e[0], this.e[1] + v2.e[1]]); 
};
/**
* Perform a - b and get the vector
* @returns {V2}
* @param {V2} vector Vector b
*/
V2.prototype.subtract = function(v2) {
	return $V2([this.e[0] - v2.e[0], this.e[1] - v2.e[1]]);
};
/**
* Get the length of the vector
* @returns {Float}
*/
V2.prototype.modulus = function() {
	return Math.sqrt(this.sumComponentSqrs());
};
/** @private */
V2.prototype.sumComponentSqrs = function() {
	var V2 = this.sqrComponents();
	
	return V2[0] + V2[1];
};
/** @private */
V2.prototype.sqrComponents = function(){
	var V2 = [ this.e[0] * this.e[0], this.e[1] * this.e[1]];
	
	return V2;
};
/**
* Perform a * b and get the vector
* @returns {V2}
* @param {V2|Float} value Value b (Vector|Float)
*/
V2.prototype.x = function(value) {
	var typeVector = value instanceof V2;
	if(typeVector) return $V2([this.e[0] * value.e[0], this.e[1] * value.e[1]]);
	else return $V2([this.e[0] * value, this.e[1] * value]);
};
/**
* Get the vector normalized
* @returns {V2}
*/
V2.prototype.normalize = function() {
	var inverse = 1.0 / this.modulus();
	
	return $V2([this.e[0] * inverse, this.e[1] * inverse]);
};
/**
* Get the dot product between a and b
* @returns {Float}
* @param {V2} vector Vector b
*/
V2.prototype.dot = function(v2) {
	return this.e[0]*v2.e[0] + this.e[1]*v2.e[1];
};
/**
* @returns {V2}
* @param {Array<Float>} e Array with 2 values
*/
$V2 = function(elements) {
	return new V2(elements);
};
 

/**
* @class
* @constructor

* @property {Float32Array} e Array with 2 values
*/
Canvas2DUtils = function() {
};
/**
* Degrees to radians. Full circle = 360 degrees.
* @returns {Float}
* @param {Float} degrees
*/
Canvas2DUtils.prototype.degToRad = function(deg) {
	return (deg*3.14159)/180;
};

/**
* Radians to degrees
* @returns {Float}
* @param {Float} radians
*/
Canvas2DUtils.prototype.radToDeg = function(rad) {
	return rad*(180/3.14159);
};