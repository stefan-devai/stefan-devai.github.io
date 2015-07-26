$(document).ready(function() {
	$(".wrapper").css("display", "none");
	$(".wrapper").fadeIn(300);

	if(window.location.pathname != $(".site-title").attr('href')) {
		$(".site-title").hover(inTitle, outTitle);
	}
	else {
		$(".title-underline").css("width", "100%");
	}

	$(".fade-out").click(function(e){
        redirect = $(this).attr('href');
        e.preventDefault();
        $(".wrapper").fadeOut(50, function(){
            document.location.href = redirect;
        });
        
    });   
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
