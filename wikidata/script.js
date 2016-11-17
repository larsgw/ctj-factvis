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
  var w = $( 'body > main' )
  
  w.find( 'section > form, header li' )
    .filter( '.active' )
    .removeClass( 'active' )
    .addClass( 'complete' )
  
  var c = w.find( 'section > form, header li' )
	    .filter( ':nth-child(' + n + ')' ) 
            .addClass( 'active' )
	    .filter( 'form' )
  
  if ( c.is( '[data-load]' ) )
    check( c )
}

function object ( v, i ) {
  var b = /^Q\d+$/.test( v )
  
  if ( !b )
    $id( i ).html( v + ' is not a Wikidata ID.' )
  else
    d._source.identifiers.wikidata = v
  
  return b
}

function clean ( s ) {
  return s.trim().replace( /\s+/, ' ' )
}

function $id ( i ) {
  return $( '#' + i )
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

function check ( e ) {
  var a1 = e.data( 'load' ).split( ',' )
    , l  = $id( a1.shift() )
    , q  = getText( d, a1.join( ',' ) )
  
  load( e, l )
  
  setTimeout( function do_callback () {
    var b = false
      , c = Object.assign( {}, d, { r: { id: q } } )
      , a = $( e ).data( 'response' ).split( ',' )
      , r = a.shift()
      , s = a.join( ',' ).split( '|' )
      
        s = s[ !b * 1 ] || s[ 0 ]
    
    $id( r ).html( getText( c, s ) )
    
    unload( e, l )
    
  }, 1000 )
}

function loader () {
  return $( '<div class="loader"></div>' )
}

function load ( e, l ) {
  e
  .attr( 'disabled', 'disabled' )
  .find( l )
    .html( loader() )
}

function unload ( e, l ) {
  e
  .removeAttr( 'disabled' )
  .find( l )
  .find( '.loader' ).remove()
}
