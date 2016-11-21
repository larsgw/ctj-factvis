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
  console.log(a,l)
  a.forEach( v => {
    console.log(r,v)
    r = !(
      [ undefined, null ].indexOf( r[ v ] ) > -1
    ) ?
      r[ v ]
    :
      {}
  } )
  var v = r[ l ]
  console.log(o,r,l,v)
  return v === undefined ? null : v
}

function getText ( o, s ) {
  return clean( s )
    .split( '+' )
    .map( v => v.charAt( 0 ) === '$' ? get( o, v.slice( 1 ) ) : v )
    .map( v => [
      'string'
    ].indexOf( typeof v ) > -1 ? v : JSON.stringify( v ) )
    .join( '' )
}

function check ( e ) {
  console.log('-'.repeat(10))
  
  var a1 = e.data( 'load' ).split( ',' )
    , l  = $id( a1.shift() )
    , a2 = getText( d, a1.join( ',' ) ).split( ':' )
    , t  = a2.shift()
    , q  = getText( d, a2.join( ':' ) )
  
  load( e, l )
  
  var callback = function ( b, rd ) {
    //console.log(b,rd)
    var c = Object.assign( {}, { d: d }, { r: rd } )
      , a = $( e ).data( 'response' ).split( ',' )
      , r = a.shift()
      , s = a.join( ',' ).split( '|' )
      
        s = s[ !b * 1 ] || s[ 0 ]
    
    $id( r )
      .data( 'response-status', b ? 'ok' : 'ko' )
      .html( getText( c, s ) )
    
    unload( e, l )
  }
  
  switch ( t ) {
    case 'PMC':
      getFile(
	wdQuery( 'SELECT ?id WHERE{?id wdt:P932"' + q.match( /PMC(\d+)/ )[ 1 ] + '"}' )
      , function ( b, r ) {
	  var b = b, r = r
	  
	  if ( b && r ) {
	    if ( r.results.bindings.length )
	      r = r.results.bindings[ 0 ].id.value.match( /(Q\d+)$/ )[ 1 ]
	    else b = false, r = null
	  } else b = false, r = null
	  
	  if ( b )
	    d._source.documentWDID = r
	  
	  callback( b, r )
	}
      )
      break;
    
    case 'obj':
    case 'prop':
    case 'val':
      //var b = !!JSON.parse( '{"a":' + q + '}' ).a
      callback( !!q, q )
      break;
    
    default:
      unload( e, l )
      break;
  }
}

function getFile ( u, c ) {
  $.get( {
    url: u
  , success: function ( d ) { ( c )( true, d ) }
  } ).fail( function () { ( c )( false, null ) } )
}

function wdQuery ( q ) {
  return (
    'https://query.wikidata.org/sparql?format=json&query=' +
    encodeURIComponent(
      '\nPREFIX wd: <http://www.wikidata.org/entity/>\nPREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
      q
    )
  )
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
