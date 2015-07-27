$(document).ready(function() {
	if(window.location.pathname != $(".site-title").attr('href')) {
		$(".site-title").hover(inTitle, outTitle);
	}
	else {
		$(".title-underline").css("width", "100%");
	} 
});

var inTitle = function() {
	$('.title-underline').animate({
		width: "100%"
	}, 350);
}

var outTitle = function() {
	$('.title-underline').animate({
		width: "0%"
	}, 250);
}
