// includes
var c2djsDirectory = document.querySelector('script[src$="Canvas2DJS.js"]').getAttribute('src');
var page = c2djsDirectory.split('/').pop(); 
c2djsDirectory = c2djsDirectory.replace('/'+page,"");

// JS includes
if(window.jQuery == undefined)
	document.write('<script type="text/javascript" src="'+c2djsDirectory+'/jquery-1.9.1.js"></script>');
	
var includesF = ['/Box2dWeb-2.1.a.3.js',
				'/Canvas2DUtils.class.js',
				'/Canvas2DSprite.class.js',
				'/Canvas2DNode.class.js',
				'/Canvas2DJS.class.js'];
for(var n = 0, f = includesF.length; n < f; n++) document.write('<script type="text/javascript" src="'+c2djsDirectory+includesF[n]+'"></script>');
 