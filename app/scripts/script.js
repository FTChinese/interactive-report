'use strict'
$(function() {
var sharelink = Object.create(Share);
sharelink.init('.share-links');

/* variables*/
var $w = $(window);
var pageName = window.location.pathname;

var headerHeight = $('header.header').height();
var viewportHeight = $(window).height() - headerHeight;

var $tocNav = $('.toc-nav').eq(0);

var $scrollmation = $('.scrollmation');
var $textOverMedia = $('.text-over-media');
var $scrollBackground = $('.scrollmation-background');
var $scrollTwoColumn = $('.scrollmation-two-column');

//Get the image source of `.story-cover` and put it as the background of `.story-header` so that the picture could flow with resizing while `wechat` could capture this image as thumbnail.
$('.story-cover').css('background-image', function() {
	return 'url(' + $('.cover-image').attr('src') + ')';
});
/* Generate navigation. 
Pass in the list container.
Return an array container the link and the link's target.
*/

var navLinks = generateNav($tocNav);


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
	$(this).height(function() {
		if ($(this).hasClass('story-cover')) {
			return viewportHeight - parseInt($(this).css('paddingBottom'));
		} else {
			return viewportHeight;
		}
	});
});
console.log(viewportHeight);

/*==================*/
var source1 = Rx.Observable.fromEvent($w, 'load');
var subscription1 = source1.subscribe(
	function (e) {
	  	console.log($(e.currentTarget).height());
	  	setHeight($scrollBackground, $scrollTwoColumn);

	  	var sectionTop = sectionOffTop();
	  	navToSection(sectionTop);

		var previousActive = activePage(navLinks, sectionTop);
		logPages(pageName, previousActive);

	  	var watersheds = getHeight($scrollmation);
	  	scrollmation(watersheds);
	  	$w.on('scroll', function(e) {
	  		scrollmation(watersheds);
	  		
	  		var currentActive = activePage(navLinks, sectionTop);

			if (previousActive !== currentActive) {
				logPages(pageName, currentActive);
				previousActive = currentActive;
			}
	  	});
	}
);

var source2 = Rx.Observable.fromEvent($w, 'resize');
var subscription2 = source2.subscribe(
	function (e) {
	  	setHeight($scrollBackground, $scrollTwoColumn);

	  	var sectionTop = sectionOffTop();
	  	navToSection(sectionTop);

	  	var previousActive = activePage(navLinks, sectionTop);
		logPages(pageName, previousActive);

	  	var watersheds = getHeight($scrollmation);
	  	scrollmation(watersheds);
	  	$w.on('scroll', function() {
	  		scrollmation(watersheds);

	  		var currentActive = activePage(navLinks, sectionTop);

			if (previousActive !== currentActive) {
				logPages(pageName, currentActive);
				previousActive = currentActive;
			}

	  	});
	}
);

$('.to-top').on('click', function(e){
	e.preventDefault();
	$(window).scrollTo(0, 1000);
})


});

function logPages(pageName, pageNumber) {
	try {
	  ga('send', 'pageview', pageName + '?page=' + pageNumber);
	  fa('send', 'pageview', pageName + '?page=' + pageNumber);
	  ftcLog();
	} catch (ignore) {

	}	
}

function generateNav($tocNav) {
	var navLinks = Object.create(null);
	var $sections = $('.story').eq(0).find('section');

	$sections.each(function(i) {
		var sectionId = $(this).attr('id');
		var $link = $('<a/>', {
			'href': '#' + sectionId
		}).text(i+1);

		navLinks[sectionId] = $link;

		$tocNav.append($link);
	});
	return navLinks;	
}

function sectionOffTop() {
	var sectionTop = Object.create(null);
	var $sections = $('.story').eq(0).find('section');
	$sections.each(function() {
		var offsetTop = $(this).offset().top;
		var sectionId = $(this).attr('id');
		sectionTop[sectionId] = offsetTop;
	});
	return sectionTop;
}

/* Zip navLinks and sectionTop*/
function navToSection(sectionTop) {
	var headerHeight = $('header.header').height();
	var navLinks = $('.toc-nav');
	navLinks.on('click', function(e) {
		if (e.target.nodeName.toLowerCase() === 'a') {
			var targetSection = $(e.target).attr('href').split('#')[1];
			var scrollAmount = Math.ceil(parseFloat(sectionTop[targetSection])) - headerHeight;
			$(window).scrollTo(scrollAmount, 800);
		};
		e.preventDefault();
	});
}

function activePage(navLinks, sectionTop) {
	var headerHeight = $('header.header').height();
	var scrollAmount = $(window).scrollTop() + headerHeight;
	var current = 0;

	if (scrollAmount < sectionTop['section-2'] && scrollAmount >= sectionTop['section-1']) {		
		navLinks['section-1'].siblings().removeClass('active');
		navLinks['section-1'].addClass('active');
		current = 1;
	} else if (scrollAmount < sectionTop['section-3'] && scrollAmount >= sectionTop['section-2']) {		
		navLinks['section-2'].siblings().removeClass('active');
		navLinks['section-2'].addClass('active');
		current = 2;
	} else if (scrollAmount >= sectionTop['section-3']) {		
		navLinks['section-3'].siblings().removeClass('active');
		navLinks['section-3'].addClass('active');
		current = 3;
	}
	return current;
}

function halfPadding (elmA, elmB) {
	 return elmA.innerHeight() < elmB.innerHeight() ? elmB.innerHeight() / 2 : undefined;
}

function setHeight ($bkg, $two) {
	var headerHeight = $('header.header').height();
	var viewportWidth = $(window).width();	
	var viewportHeight = $(window).height() - headerHeight;

	$bkg.each(function() {
		var $stickyElm = $(this).find('.sticky-element');
		var $flowElm = $(this).find('.flow-element');
//set min-hegiht on scrollmation-background element.
		$(this).css('min-height', viewportHeight);

		if (viewportWidth > 768) {
//set sticky-element as high as the viewport.
			$stickyElm.height(viewportHeight);

			if ($stickyElm.length > 0 && $flowElm.length > 0 && $flowElm.innerHeight() < $stickyElm.innerHeight()) {
				$flowElm.css({
					'padding-top': function() {
						return halfPadding($flowElm, $stickyElm);
					},
					'padding-bottom': function() {
						return halfPadding($flowElm, $stickyElm);
					}
				});
			}					
		} else {
			$stickyElm.removeAttr('style');
		}
	});

/**/
	$two.each(function() {
		var $flowElm = $(this).find('.flow-element');
		var $stickyElm = $flowElm.find('.sticky-element');	
		var flowElmHeight = $flowElm.innerHeight();
		var stickyElmHeight = $stickyElm.height();
		if ($stickyElm.length > 0 && flowElmHeight < stickyElmHeight) {
			$flowElm.css('min-height', stickyElmHeight);
		}	
	});
}

function getHeight($scrollmation) {
	var watersheds = [];
	$scrollmation.each(function() {
		var $flowElm = $(this).find('.flow-element');
		var $stickyElm = $(this).find('.sticky-element');
		var flowElmHeight = $flowElm.innerHeight();
		var stickyElmHeight = $stickyElm.height();
		var topLine = $flowElm.offset().top;
		var crossLine = topLine + flowElmHeight - stickyElmHeight;
		watersheds.push({
			$stickyElm: $stickyElm,
			$flowElm: $flowElm,
			flowElmHeight: flowElmHeight,
			stickyElmHeight: stickyElmHeight,
			topLine: topLine,
			crossLine: crossLine
		});
	});
	return watersheds;
}

function scrollmation (scroll) {
	var headerHeight = $('header.header').height()
	var scrollTop = $(window).scrollTop() + headerHeight;
	var viewportWidth = $(window).width();

	$.each(scroll, function() {
		if (viewportWidth > 768) {
			if (scrollTop <= this.topLine) {
				this.$stickyElm
						.removeClass('sticky-centered sticky-bottom')
						.addClass('sticky-top');
			} else if (scrollTop > this.topLine && scrollTop < this.crossLine) {
				this.$stickyElm
					.removeClass('sticky-top sticky-bottom')
					.addClass('sticky-centered');
			} else if (scrollTop >= this.crossLine) {
				this.$stickyElm
					.removeClass('sticky-top sticky-centered')
					.addClass('sticky-bottom');
			}	
		} else {
			this.$stickyElm.removeClass('sticky-top sticky-centered sticky-bottom');
		}
	});
}