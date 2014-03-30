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
 