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
´
c2d.createScene({	target: document.getElementById('animGround'),
					pxByMeter: 25});
c2d.setGravity({x: 0.0, y: 98.0});


						
var box = c2d.createNode();
var box_sprite1 = c2d.createSprite({url: 'box.png',
									cols: 1,
									rows: 1,
									onload: function(){
										box.spriteSet(box_sprite1);
									}});
box.position($V2([100,100]));
´






