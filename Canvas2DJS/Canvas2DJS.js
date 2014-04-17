// includes
var c2djsDirectory = document.querySelector('script[src$="Canvas2DJS.js"]').getAttribute('src');
var page = c2djsDirectory.split('/').pop(); 
c2djsDirectory = c2djsDirectory.replace('/'+page,"");

// includes
if(window.jQuery == undefined) {
document.write('<link rel="stylesheet" type="text/css" href="'+c2djsDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.css" />');
	document.write('<script type="text/javascript" src="'+c2djsDirectory+'/JQuery/jquery-1.9.1.js"></script>');
	document.write('<script type="text/javascript" src="'+c2djsDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.js"></script>');
}
	
var includesF = ['/Box2dWeb-2.1.a.3.js',
				'/Canvas2DUtils.class.js',
				'/Canvas2DSprite.class.js',
				'/Canvas2DNode.class.js',
				'/Canvas2DJS.class.js'];
for(var n = 0, f = includesF.length; n < f; n++) document.write('<script type="text/javascript" src="'+c2djsDirectory+includesF[n]+'"></script>');
 