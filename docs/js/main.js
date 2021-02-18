/**
 * Element.matches() polyfill (simple version)
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
 */
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
$(function() {
  $( '#js-gnav-link' ).on( 'click', function() {
    console.log('humbarger click')
    $( this ).toggleClass( '-active' )
    $( '#js-gnav' ).fadeToggle()
  })
  
  var mediaQuery = matchMedia('(max-width: 950px)')
  mqHandle(mediaQuery)
  mediaQuery.addEventListener( 'change', mqHandle, false )
  
  function mqHandle(mq) {
    if (!mq.matches) {
      $( '#js-gnav-link' ).removeClass( '-active' )
      $( '#js-gnav' ).fadeOut();
    }
  }
})

$('a[href^="#"]').click(function(){
  var speed = 500;//スクロールスピード
  var href= $(this).attr("href");
  var target = $(href == "#" || href == "" ? 'html' : href);
  var position = target.offset().top;
  $("html, body").animate({scrollTop:position}, speed, "swing");
  return false;
});
