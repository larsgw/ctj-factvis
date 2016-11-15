function main () {
  var u = window
	    .location
	    .href
	    
	    .split( '#' )
	    .shift()
	    .split( '?' )
	    .slice( 1 )
	    .join( '?' )
    
    , d = JSON.parse( decodeURIComponent(escape( atob( u ) )) )
  
  $( 'body > main > section > form [data-replace]' ).each( ( _, v ) => {
    v = $( v )
    v.html( get( d, v.data( 'replace' ) ) )
  } )
  
  $( 'body > main > section > form [data-attr]' ).each( ( _, v ) => {
    v = $( v )
    var i = v.data( 'attr' ).split( ',' )
    v.attr(
      i.shift(),
      i.join( ',' )
	.split( '+' )
	.map( v => v.charAt( 0 ) === '$' ? get( d, v.slice( 1 ) ) : v )
	.join( '' )
    )
  } )
}

function get ( o, n ) {
  var r = o
    , a = n.split( '.' )
    , l = a.pop()
  a.forEach( v => { o[ v ] ? r = o[ v ] : {} } )
  return r[ l ]
}

function check ( e, p ) {
  console.log( p )
}

function loader () {
  return $( '<div class="loader"></div>' )
}

function load ( e ) {
  $( e )
    .before( loader() )
    .attr( 'disabled', 'disabled' )
}

function unload ( e ) {
  $( e )
    .removeAttr( 'disabled' )
    .prev( '.loader' ).remove()
}