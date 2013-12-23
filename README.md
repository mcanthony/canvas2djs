<h1>canvas2djs</h1>

<p>Basic scene graph for games and applications over the HTML canvas </p>

<h2>Canvas2DJS features:</h2>
<ul>
	<li>Basic Scene Graph.</li>
	<li>Basic sprite system if your node is of type image.</li>
	<li>If not is image then you can use the direct CanvasRenderingContext2D API for set fixed drawing for a single node.</li>
	<li>Basic animations for the nodes</li>
	<li><a href="http://box2d-js.sourceforge.net/">Box2DJS</a> integrated for easily apply physics on a node.</li>
</ul>

<h2><a href="http://stormcolour.appspot.com/CONTENT/Canvas2DJS-1.0-API-Doc/Canvas2DJS.html">API DOC</a></h2>

<h2>Quick Guide</h2>
<p>In the head tag:</p>
```
<script type="text/javascript" src="Canvas2DJS/jquery-1.9.1.js"></script>
<script type="text/javascript" src="Canvas2DJS/jquery-ui-1.10.2.custom.min.js"></script>
<script type="text/javascript" src="Canvas2DJS/Box2dWeb-2.1.a.3.js"></script>
<script type="text/javascript" src="Canvas2DJS/Canvas2DUtils.class.js"></script> 
<script type="text/javascript" src="Canvas2DJS/Canvas2DSprite.class.js"></script>
<script type="text/javascript" src="Canvas2DJS/Canvas2DNode.class.js"></script>
<script type="text/javascript" src="Canvas2DJS/Canvas2DJS.class.js"></script>
```
<p>In the body tag we create the scene with a single node with a sprite:</p>
```
<canvas id="animGround" width="800" height="600"></canvas>
<script>
	c2d.createScene({target: document.getElementById('animGround')});

	var box = c2d.createNode();
	var box_sprite1 = c2d.createSprite({url: 'box.png',
										cols: 1,
										rows: 1,
										onload: function(){
											box.spriteSet(box_sprite1);
										}});
	box.position($V2([100,100]));


	c2d.start(function(){
		c2d.allShow(500);
	});
</script>
```

<h2>Composing the node:</h2>
<p>Allow also direct access to Canvas API for the composing of a single node:</p>
```
var box = c2d.createNode();
box.$(function(ctx) {
			ctx.fillStyle = "rgba(255, 128, 255, 0.5)";
			ctx.fillRect(-50, -50, 100, 100);
		});
box.position($V2([100,100]));
```
<p>And if you want change the actual composing:</p>
```
box.$clear(); // 
box.$(function(ctx) { //  composition
	ctx.fillStyle = "rgba(0, 128, 255, 0.5)";
	ctx.fillRect(-50, -50, 100, 100);
});
```
		
<h2>Box2DJS physics</h2>
<p>Canvas2DJS integrates <a href="http://box2d-js.sourceforge.net/">Box2DJS</a> for easy activation of physical:</p>
```
c2d.createScene({target: document.getElementById('animGround')});
c2d.setGravity({x: 0.0, y: 98.0});

var box = c2d.createNode();
box.$(function(ctx) {
				ctx.fillStyle = "rgba(255, 128, 255, 0.5)";
				ctx.fillRect(-50, -50, 100, 100);
			});
box.bodyEnable({shape_type: 'square', // 'square'|'circle'
				friction:0.5,
				mass: 1,
				density: 1.0,
				width: 100,
				height:100, 
				mousepicking: true});  // for allow picking the node
box.bodyOnCollision(function(node) { 
			   box.hide(500);
		   });
```

<h2>Animations</h2>
<p>You can also animate objects using basic transformations:</p>
```
box.animPosition({	position: $V2([150,100]),
					velocity: 0.1,
					onend: function() {}	});
```




