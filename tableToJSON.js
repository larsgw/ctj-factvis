var fs      = require( 'fs'         )
  , et      = require( 'elementtree')
  
  , progress= require( 'progress'   )

              require( 'colors'     )

// BEGIN Utilities
Array.prototype.last = function () {
  return this[ this.length - 1 ]
}
// END

var project = 'data/0'
  , output  = 'data/test'
  , file    = 'data_2'
  , minify  = false
  
  , outputData = {
    articles: {}
  }

// Get PMC* directories in project folder
var directories = fs.readdirSync( project )
                    .filter( function ( v ) { return /^PMC\d+$/.test( v ) } )

  // Make progress bar
  , dirProgress = new progress( '[:bar] Dir :current/:total: :dir (eta :etas)', {
      complete: '='.green,
      width: 30,
      total: directories.length
    } )

// For every directory...
for ( var dirIndex = 0; dirIndex < directories.length; dirIndex++ ) {
  
  var directory = directories[ dirIndex ]
    
    , metadata = JSON.parse( fs.readFileSync(
          [ project, directory, 'eupmc_result.json' ].join('/')
        , 'utf8' )
      )
    , tables = getTables( directory )
  
  outputData.articles[ directory ] = {
    title    : metadata.title
  , authors  : metadata.authorString
  , doi      : metadata.doi
  , abstract : metadata.abstractText || ''
  , journal  : metadata.journalInfo[ 0 ].journal[ 0 ].title[ 0 ]
  , tables   : tables
  }
  
  dirProgress.tick( {
    dir: directory
  } )
}

function getTables ( dir ) {
  var file   = [ project, dir, 'fulltext.xml' ].join('/')
  
  if ( !fs.existsSync( file ) )
    return []
  
  var xml    = fs.readFileSync( file, 'utf8' )
    
    , doc    = et.parse( xml )
    , tables = doc.findall( './/table' )
    
    , out = []
  
  for ( var table of tables ) {
    
    var data     = []
      
      , props
      
      , headRows = table.findall( './thead/tr' )
      , mainHeadRow= headRows.shift()
      
    if ( mainHeadRow ) {
      props = parsePropRow( mainHeadRow._children )
      
      headRows.forEach( ( headRow, headRowIndex ) => {
	var propRow = parsePropRow( headRow._children )
	
	propRow.forEach( ( prop, propIndex ) => {
	  props[ propIndex ].mods.push( prop )
	} )
      } )
      
    } else {
      props = 
	(
	  // Last
	  out.last()
	||
	  // or Empty array
	  { props: [] }
	)
	  .props
	  .slice( 0,
	    table.findall( './/tr' )[ 0 ]._children.length
	  )
    }
      
    table.findall( './tbody/tr' ).forEach( ( bodyRow, bodyRowIndex ) => {
      
      var bodyCells= bodyRow.findall( './td' )
	, expVals  = props.slice( 1 )
      
	, objCell  = bodyCells.shift() || {}
	, objName  = getText( objCell )
	, objProps = []
      
      if ( !objName )
	objName = ( data.last() || { name: '' } ).name
      
      expVals.forEach( ( prop, propIndex ) => {
	var value = bodyCells[ propIndex ] ?
	  getText( bodyCells[ propIndex ] )
	:
	  ''
	
	objProps.push( {
	  name: prop.name
	, unit: prop.unit
	, mods: prop.mods
	, value: value
	} )
      } )
      
      data.push( {
	name: objName
      , props: objProps
      } )
    } )
    
    data.props = props
    
    out.push( data )
  }
  
  return out
}

function parsePropRow ( row ) {
  var res = []
  
  row.forEach( headCell => {
    var colspan = headCell.attrib.colspan || 1
      , text    = getText( headCell )
      , match   = text.match( /(.+?)(?:\s+\(([^)]+)\)|, (.+)$)?$/ ) || []
      , name    = match[ 1 ] || ''
      , unit    = match[ 2 ] || match[ 3 ] || ''
    
    while ( colspan-- )
      res.push( {
	name: name.trim()
      , unit: unit.trim()
      , mods: []
      } )
  } )
  
  return res
}

function getText ( elm, bool ) {
  return ( ''
//   + ( bool ? '<' + elm.tag + '>' : '' )
  + ( elm.text || '' )
  + ( elm._children ? elm._children.map( v => getText( v, true  )).join( '' ) : '' )
  + ( bool ? elm.tail || '' : '' )
//   + ( bool ? '</' + elm.tag + '>' : '' )
  ).replace( /\s+/, ' ' )
}

function getJSON ( string ) {
  if ( minify )
    return JSON.stringify( string )
  else
    return JSON.stringify( string, null, 2 )
}

try {
  console.log( 'Saving output...' )
  
  fs.writeFileSync( [ output, file + '.json' ].join( '/' ), getJSON( outputData ) )
  
  console.log( 'Saving output succeeded!' )
} catch ( e ) {
  console.error( 'Saving output failed:', e.toString() )
}