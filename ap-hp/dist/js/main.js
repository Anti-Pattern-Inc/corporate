/*! project-name v0.0.1 | (c) 2021 YOUR NAME | MIT License | http://link-to-your-git-repo.com */
/**
 * Element.matches() polyfill (simple version)
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
 */
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
$('.menu').on('click',function(){
	$('.menu__line').toggleClass('active');
	$('.gnav').fadeToggle();
});


// $(document).ready(function() {
//   var pagetop = $('.pagetop');
//     $(window).scroll(function () {
//        if ($(this).scrollTop() > 100) {
//             pagetop.fadeIn();
//        } else {
//             pagetop.fadeOut();
//             }
//        });
//        pagetop.click(function () {
//            $('body, html').animate({ scrollTop: 0 }, 500);
//               return false;
//    });
// });

$('a[href^="#"]').click(function(){
     var speed = 500;//スクロールスピード
     var href= $(this).attr("href");
     var target = $(href == "#" || href == "" ? 'html' : href);
     var position = target.offset().top;
     $("html, body").animate({scrollTop:position}, speed, "swing");
     return false;
});