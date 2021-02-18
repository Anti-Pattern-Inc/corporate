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
