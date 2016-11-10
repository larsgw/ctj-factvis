var fs      = require( 'fs'         )
  
  , progress= require( 'progress'   )
              require( 'colors'     )

// BEGIN Utilities
Array.prototype.last = function () {
  return this[ this.length - 1 ]
}
// END

var project = 'data/0'
  , output  = 'data/0'
  , file    = 'facts'
  , minify  = true
  
  , factID  = 'aaaaaaaaaa'
  , abc     = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_'
  
  , outputData = []

function incrementFactID () {
  var f = function ( str ) {
    var rest     = str.slice( 0, -1 )
      , lastChar = str.slice( -1 )
      ,  newChar = abc[ abc.indexOf( lastChar ) + 1 ]
    return newChar ?
      rest + newChar
    :
      f( rest ) + abc[ 0 ]
  }
  
  return factID = f( factID )
}

var dirIDMap = {}

main:
{
  var tables = [ project, 'tables.min.json' ].join('/')
  
  if ( !fs.existsSync( tables ) )
    break main
  
  var json = JSON.parse( fs.readFileSync( tables, 'utf8' ) )
    
    , dirs = json.articles
    , dirProgress = new progress( '[:bar] Dir :current/:total: :dir (eta :etas)', {
	complete: '='.green,
	width: 30,
	total: Object.keys( dirs ).length
      } )
      
      // Default fact object
    , data     = {
      _source: {
        identifiers: {}
      }
    }
  
  for ( var dirName in dirs ) {
    
    var docID = dirIDMap.hasOwnProperty( dirName ) ?
      dirIDMap[ dirName ]
    :
      dirIDMap[ dirName ] = incrementFactID()
      , dir   = dirs[ dirName ]
    
    data._source.cprojectID = dirName
    data._source.documentID = docID
    
    for ( var table of dir ) {
      data._source.identifiers.article = table.type
      
      for ( var object of table.data ) {
	data._id = incrementFactID()
	data._source.term = object.name
	
	for ( var prop of object.props ) {
	  var fact = JSON.parse( JSON.stringify( data ) )
	    , value = prop.value
	  
	  delete prop.value
	  
	  /*prop.identifiers = {
	    wikidata: wdid
	  }*/
	  
	  if ( prop.hasOwnProperty( 'unit' ) )
	    prop.unit = prop.unit.replace( /([A-Za-z])(.?\d+)/, '$1<sup>$2</sup>' )
	  
	  fact._source.prop = prop
	  fact._source.value= value
	  
	  outputData.push( fact )
	}
      }
    }
    
    dirProgress.tick( {
      dir: dirName
    } )
  }

}

function getJSON ( string ) {
  if ( minify )
    return JSON.stringify( string )
  else
    return JSON.stringify( string, null, 2 )
}

try {
  console.log( 'Saving output...' )
  
  var cap = 5000
  
  for ( var i = 0; i < Math.ceil( outputData.length/cap ); i++ ) {
    var string = outputData.slice( i * cap, ( i + 1 ) * cap ).map( getJSON ).join( '\n' )
    fs.writeFileSync( [ output, file + '_' + ( i + 1 ) + '.json' ].join( '/' ), string )
  }
  
  /*var string = outputData.slice( 0, 500 ).map( getJSON ).join( '\n' )
  fs.writeFileSync( [ output, file + '_' + 0 + '.json' ].join( '/' ), string )*/
  
  console.log( 'Saving output succeeded!' )
} catch ( e ) {
  console.error( 'Saving output failed:', e.toString() )
}