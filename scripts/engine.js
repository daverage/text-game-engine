/*

Adventure Engine v0.5
Andrzej marczewski 2013

[[link text="XYZ" goto="SCENE-ID" script="Optional" class="Optional"]]

[[setVar name="" value=""]]

[[displayVar varName]]

[[function javascript]]

[[redirect scene="" wait="(seconds)"]]

[[preload "scene2.htm","scene3.htm"]]

//use jquery load in a loop to load in the various scenes. Define them at the start of the page
*/
var variables=[];
var t='';
var content='';
var cleanContent='';
var boolContinue=true;
$fadeSpeed=400;
function gotoScene(scene){
	$('#loading').hide();
	parseScene(scene);	
	if(scene=='start' && $.cookie('lastPos')){
		$('body').append('<div id="dialog-confirm" title="Load saved game"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>You have saved progress, do you wish to continue where you left off?</p></div>');
		$( "#dialog-confirm" ).dialog({
			resizable: false,
			height:220,
			width:270,
			modal: true,
			closeOnEscape: false,
			buttons: {
					"Yes": function() {
				  $( this ).dialog( "close" );
					gotoScene($.cookie('lastPos'))
				},
					"No": function() {
					$.removeCookie('lastPos');
				  $( this ).dialog( "close" );
				}
			}
		});
		

	}else{
		location.hash = scene;
		history.pushState({}, "", this.href);
		setVar("lastPos",scene);
	}
}
function getVar(name){
	return ($.cookie(name)); 
}
function displayVar(name){
	content=content.replace('\[\[displayVar "'+name+'"\]\]',getVar(name));
}
function setVar(name,value){
	$.cookie(name,value,{expires: 365});
}
function resetTimer(){
	clearInterval(t);
	t='';
	$('#timer').css('width','0px');
}
function parseScene(scene){
	resetTimer();
	content = $('#' + scene).outerHTML();	
	getLinks();
		
	displayVars();
	cleanContent = contentCleaner(content);
	setVars();
	getRedirects();
	
	if(boolContinue){
		$('#player').hide().fadeIn($fadeSpeed).html(cleanContent);
	}
	runFunctions();

}

function contentCleaner(str){
	var myregexp=/\[\[displayVar([^\]\]]*)\]\]/g;
	str=str.replace(myregexp,'');
	var myregexp=/\[\[redirect([^\]\]]*)\]\]/g;
	str=str.replace(myregexp,'');
	var myregexp=/\[\[setVar([^\]\]]*)\]\]/g;
	str=str.replace(myregexp,'');
	var myregexp=/\[\[setVar([^\]\]]*)\]\]/g;
	str=str.replace(myregexp,'');
	var myregexp=/\[\[function([^\]\]]*)\]\]/g;
	str=str.replace(myregexp,'');
	return str;
}

function displayVars(){
	var myregexp=/\[\[displayVar ([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(content);
	
	while(match = matches) {
		var varName=match[1].replace(/"/g,'');
		displayVar(varName);
		matches = myregexp.exec(content);
	}		
	return content;			
}


function getLinks(){
	var myregexp=/\[\[link([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(content);
	var linkTextExp = /text=\"([^\"]*)\"/;
	var linkGotoExp = /goto=\"([^\"]*)\"/;
	var linkImageExp = /image=\"([^\"]*)\"/;
	var linkScriptExp = /script=\"([^\"]*)\"/;
	var linkClassExp = /class=\"([^\"]*)\"/;	var linkURLExp = /url=\"([^\"]*)\"/;
	var newLink='';
	while(match = matches) {
		var linkText=(linkTextExp.exec(match) ? linkTextExp.exec(match)[1]:'');
		var linkGoto=(linkGotoExp.exec(match) ?  linkGotoExp.exec(match)[1]:'');
		var linkImage=(linkImageExp.exec(match) ?  linkImageExp.exec(match)[1]:'');
		var linkScript=(linkScriptExp.exec(match) ?  linkScriptExp.exec(match)[1]:'');
		var linkClass=(linkClassExp.exec(match) ?  linkClassExp.exec(match)[1]:'');		
		var link='';

		if(linkGoto){
			link='href="javascript:'+linkScript+';gotoScene(\''+linkGoto+'\');"';
		}
		if(linkClass){
			link+=' class="'+linkClass+'"';
		}
			
		if(linkImage){
			linkText='<img src="'+linkImage+'" alt="'+linkText+'" />'	
		}
		
		newLink='<a '+link+'>'+linkText+'</a>';
		matches = myregexp.exec(content);
		content=content.replace(match[0],newLink);
	}
	
	return content;
}

	
function getRedirects(){
	var myregexp=/\[\[redirect([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(content);
	var redirSceneregexp = /scene=\"([^\"]*)\"/;
	var waitregexp = /wait=\"([^\"]*)\"/;
	var wait=0;
	while(match = matches) {
		var redirScene=redirSceneregexp.exec(match)[1];
		wait=waitregexp.exec(match)[1];
		var newWidth = '100';
		var w = (newWidth/wait);
		resetTimer();
		$('#timer').show().css('width','100%')
		t = setInterval(function(){
				wait = wait-1;
				newWidth = (newWidth-w)
				$('#timer').css('width',newWidth+'%')
				if (wait <= 0){
					resetTimer();
					gotoScene(redirScene);
				}
			},1000);
		
		matches = myregexp.exec(content);
	}		
	return content;
}

function setVars(){
	var myregexp=/\[\[setVar([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(content);
	var nameregexp = /name=\"([^\"]*)\"/;
	var valueregexp = /value=\"([^\"]*)\"/;
	
	while(match = matches) {
		var name=nameregexp.exec(match)[1];
		var value=valueregexp.exec(match)[1];
		variables.push({name:name,value:value});
		setVar(name,value);
		matches = myregexp.exec(content);
	}		
	return content;
}

function preloadScenes(){
	jQuery.ajaxSetup({async:false});
	var preloadContent = $('#scenes').html();
	var myregexp=/\[\[preload([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(preloadContent);
	var nameregexp = /urls=\"([^\"]*)\"/;
	while(match = matches) {
		var urls = match[1].split(',');
		$(urls).each(function(){
			var url=this.replace(/"/g,'');
			$.get(url,function(data){
				$('#scenes').append(data);
			});
		});
		$('#scenes').html($('#scenes').html().replace(match[0],''));
		matches = myregexp.exec(preloadContent);
	}		
}

function runFunctions(){

	var myregexp=/\[\[function([^\]\]]*)\]\]/g;
	var matches = myregexp.exec(content);
	var nameregexp = /name=\"([^\"]*)\"/;
	var valueregexp = /value=\"([^\"]*)\"/;
	while(match = matches) {
	
		var fun = (match)[1].replace(/AND/g,'&&');
		fun = fun.replace(/OR/g,'||');
		var functionVariable = new Function(fun);
		functionVariable();
		//eval((match)[1]);
		matches = myregexp.exec(content);
	}		
	return content;
}

$(document).ready(function(){
	preloadScenes();
	$.preloadCssImages();
	gotoScene('start');
	createLightbox();
});



$(window).on('hashchange',function() {
    //var hash = location.hash.substring(1);
	//gotoScene(hash);
});

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

jQuery.preloadCssImages = function(){
    var allImgs = [];//new array for all the image urls 
    var k = 0; //iterator for adding images
    var sheets = document.styleSheets;//array of stylesheets

    for(var i = 0; i<sheets .length; i++){//loop through each stylesheet
            var cssPile = '';//create large string of all css rules in sheet
            var csshref = (sheets[i].href) ? sheets[i].href : 'window.location.href';
            var baseURLarr = csshref.split('/');//split href at / to make array
            baseURLarr.pop();//remove file path from baseURL array
            var baseURL = baseURLarr.join('/');//create base url for the images in this sheet (css file's dir)
            if(baseURL!="") baseURL+='/'; //tack on a / if needed
            if(document.styleSheets[i].cssRules){//w3
                    var thisSheetRules = document.styleSheets[i].cssRules; //w3
                    for(var j = 0; j<thisSheetRules.length; j++){
                            cssPile+= thisSheetRules[j].cssText;
                    }
            }
            else {
                    cssPile+= document.styleSheets[i].cssText;
            }

            //parse cssPile for image urls and load them into the DOM
            var imgUrls = cssPile.match(/[^\(]+\.(gif|jpg|jpeg|png)/g);//reg ex to get a string of between a "(" and a ".filename"
            if(imgUrls != null && imgUrls.length>0 && imgUrls != ''){//loop array
                    var arr = jQuery.makeArray(imgUrls);//create array from regex obj       
                    jQuery(arr).each(function(){
                            allImgs[k] = new Image(); //new img obj
                            allImgs[k].src = (this[0] == '/' || this.match('http://')) ? this : baseURL + this;     //set src either absolute or rel to css dir
                            k++;
                    });
            }
    }//loop
    return allImgs;
}

function submitForm(id){
	boolContinue=true;
	var form = $('#'+id);
	var msg='Sending Details to ';
	msg+=$(form).attr('action')+'\r';
	$(form).find('input').each(function(){
		msg+=$(this).attr('name')+'='+$(this).val()+'\r';
		//alert(msg)
		if($(this).attr('required') && $(this).val()==''){
			alert('Please fill in all required fields (*)');
			boolContinue=false;
			return;
		}
		setVar($(this).attr('name'),$(this).val());

	});
	
}

function createLightbox(){
	$('.slide').each(function(){
		var img = $(this).html();
		var url = $(this).find('img').attr('src');
		$(this).html('<a href="'+url+'" rel="" class="fancybox">'+img+'</a>');
	});
	$(".fancybox").fancybox();
}