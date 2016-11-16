var d

function main () {
  var u = window
	    .location
	    .href
	    
	    .split( '#' )
	    .shift()
	    .split( '?' )
	    .slice( 1 )
	    .join( '?' )
    
     
  d = JSON.parse( decodeURIComponent(escape( atob( u ) )) )
  
  $( 'body > main > section > form [data-replace]' ).each( ( _, v ) => {
    v = $( v )
    v.html( getText( d, v.data( 'replace' ) ) )
  } )
  
  $( 'body > main > section > form [data-attr]' ).each( ( _, v ) => {
    v = $( v )
    var i = v.data( 'attr' ).split( ',' )
    v.attr(
      i.shift(),
      getText( d, i.join( ',' ) )
    )
  } )
  
  goto( 1 )
}

function goto ( n ) {
  var c = $( 'body > main > section > form.active' )
            .removeClass( 'active' )
            .addClass( 'complete' )
            .parent()
            .find( ':nth-child(' + n + ')' ) 
              .addClass( 'active' )
    , l = c.data( 'load' )
  
  check( c, l, false )
}

function clean ( s ) {
  return s.trim().replace( /\s+/, ' ' )
}

function get ( o, n ) {
  var r = o
    , a = n.split( '.' )
    , l = a.pop()
  a.forEach( v => { o[ v ] ? r = o[ v ] : {} } )
  return r[ l ]
}

function getText ( o, s ) {
  return clean( s )
    .split( '+' )
    .map( v => v.charAt( 0 ) === '$' ? get( o, v.slice( 1 ) ) : v )
    .join( '' )
}

function check ( e, p, l ) {
  if ( l )
    load( e )
  
  setTimeout( function do_callback () {
    var b = true
      , c = Object.assign( {}, d, { r: { id: p } } )
      , a = ( $( e ).data( 'response' ) || '' ).split( ',' )
      , r = a.shift( '' )
      , s = a.join( ',' ).split( ':' )
    
        s = s[ !b ] || s[ 0 ]
    
    $( '#' + r ).html( getText( c, s ) )
    
    if ( l )
      unload( e )
    
  }, 1000 )
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
