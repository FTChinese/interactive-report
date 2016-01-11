'use strict'
$(function() {

/* variables*/
var $w = $(window);
var pageName = window.location.pathname;
var headerHeight = $('.header').height();
var viewportHeight = $(window).height() - headerHeight;

var $textOverMedia = $('.text-over-media');


//Get the image source of `.story-cover` and put it as the background of `.story-header` so that the picture could flow with resizing while `wechat` could capture this image as thumbnail.
$('.story-cover').css('background-image', function() {
	return 'url(' + $('.cover-image').attr('src') + ')';
});
/* Generate navigation. 
Pass in the list container.
Return an array container the link and the link's target.
*/

var $tocNav = $('.toc-nav').eq(0);
var currentActive =' ';

$tocNav.find('a').each(function() {
	$(this).on('click', function(e) {
		e.preventDefault();
		var currentLink = $(e.target);
		var targetId = currentLink.attr('href');
		$(window).scrollTo($(targetId), 300);
		currentLink.siblings().removeClass('active');
		currentLink.addClass('active');
		currentActive = currentLink;
	});
});

/* Show/Hide Navigation */
var $smallMenu = $('.small-menu');
var $body = $('body');
$body.on('load click touch', function() {
	$tocNav.addClass('hide');
});

$smallMenu.on('click touch', function(e) {
	$tocNav.toggleClass('hide');
	e.stopPropagation();
});

$textOverMedia.each(function() {
	$(this).height(viewportHeight);
});

$('.to-top').on('click', function(e){
	e.preventDefault();
	$(window).scrollTo(0, 1000);
})

var navLinks = $tocNav.find('a');


});

function logPages(pageName, pageNumber) {
	try {
	  ga('send', 'pageview', pageName + '?page=' + pageNumber);
	  fa('send', 'pageview', pageName + '?page=' + pageNumber);
	  ftcLog();
	} catch (ignore) {

	}	
}


