var table
  , hash  = getHash()
  
  , colormap = {}
  , column= [ 'wdhref', 'pmid', 'term', 'prop', 'value', 'ftid' ]
  , desc  = {
    pmid: function (title) {return(
      '<strong>' + title + '</strong> is an article identifier issued by <a href="https://www.ncbi.nlm.nih.gov/pmc/">Pubmed Central</a>. '+
      '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/' + title + '">Here\'s the article</a>'
    )}
  , wdid: function (title) {return(
      '<strong>' + title + '</strong> is an object identifier issued by <a href="https://wikidata.org">Wikidata</a>. ' +
      '<a href="https://wikidata.org/wiki/' + title + '">Here\'s the object</a>'
    )}
  , ftid: function (title) {return(
      '<strong>' + title + '</strong> is a fact identifier issued by the <a href="http://contentmine.org">ContentMine</a>.'
    )}
  }

window.onhashchange = checkHash

function getHash () {
  var param = decodeURIComponent( window.location.hash.replace( /^#/, '' ) )
    , parts = param.split( '=' )
  
  return {
    key: parts[ 0 ],
    val: parts[ 1 ]
  }
}

function clearFilter() {
  $('#desc,#backButton').hide()
  window.location.hash = ''
}

function checkHash() {
  hash = getHash()
  
  var index
    , value
    , columns = true
    , title   = hash.val||hash.key
    , text
  
  table
    .search( '' )
    .columns().search( '' )
  
  if ( hash.val ) {
      index = [ column.indexOf( hash.key ) ]
    , value = hash.val
    
    if (title&&desc.hasOwnProperty(hash.key)) text = desc[ hash.key ]( title )
  } else if ( hash.key ) {
    if ( /^PMC\d+$/.test( hash.key ) ) {
      index = [ column.indexOf( 'pmid' ) ]
    , value = hash.key
    
      if ( title ) text = desc[ 'pmid' ]( title )
    } else if ( /^Q\d+$/.test( hash.key ) ) {
      index = [ 2, 3, 4 ]
    , value = hash.key
    
      if ( title ) text = desc[ 'wdid' ]( title )
    } else {
      columns = false
    , index = [ 2, 3, 4 ]
    , value = hash.key
    }
  }
  
  if ( columns )
    table.column.apply( undefined, index ).search( value )
  
  if ( title&&text ) {
    $('#desc-title').html(title)
    $('#desc-text').html(text)
    $('#desc,#backButton').show()
  }
  
  table.draw()
}

function loadFile(num) {
  $.get('sample/sample_'+(num||1)+'.json', function CB_loadDefault(file) {
    receivedText(file)
  }).fail((err) => {
    var e = {}
    e.target = {}
    e.target.result = err.responseText
    receivedText(e)
  })
}

function receivedText(e) {
  lines = e.target.result.split('\n');
  var newArr = []
  
  for(var line = 0; line < lines.length; line++){
    try{
      var obj = JSON.parse(lines[line])
      obj._source.term  = _.escape( obj._source.term  )
      obj._source.value = _.escape( obj._source.value )
      
      if (obj._source.prop.name)
	obj._source.prop.name = _.escape( obj._source.prop.name )
      
      if (obj._source.prop.unit)
	obj._source.prop.unit = _.escape( obj._source.prop.unit )
      
      newArr.push(obj)
    } catch(e) {
      console.log(e)
    }
  }
  
  var html = ''
  
  function factID ( ftid ) {
    return (
      '<a href="#ftid=' + ftid + '">' +
	'<i class="material-icons">link</i><span style="font-size:0;">' + ftid +
      '</span></a>'
    )
  }

  $('#front-loading-matter').css('display', 'none')

  newArr.forEach( function CB_eachFact(value, index) {
    html +=
    '<tr>' +
      '<td class="wdhref"><a class="m-i-b" title="Add to Wikidata" href="wikidata?' +
	btoa( unescape(encodeURIComponent( JSON.stringify( value ) )) ) +
      '"></td>' +
      
      '<td class="pmid"><span><a href="#pmid='+value._source.cprojectID+'">'+ value._source.cprojectID+'</td>' +
      
      '<td class="term"><span>' +
	( typeof value._source.identifiers.wikidata === 'string' ?
	  '<a class="wdid" href="#' + value._source.identifiers.wikidata + '">' +
	    value._source.term +
	    '<span>' + value._source.identifiers.wikidata + '</span>' +
	  '</a>'
	:
	  value._source.term
	) +
      '</span></td>' +
      
      '<td class="prop"><span>' +
	value._source.prop.name +
	( Array.isArray(value._source.prop.mods) ?
	  ' (' + value._source.prop.mods.map(function(v){return _.escape(v.name)}).join(', ') + ')'
	: '' ) +
      '</td>' +
      
      '<td class="value"><span data-unit="'+
	( value._source.prop.unit ? value._source.prop.unit : '' ) +
      '">' + value._source.value + '</td>' +
      
      '<td class="ftid"><span>'+ factID(value._id) +'</td>' +
    '</tr>';
  })
  
  $('tbody').append(html)
  
  if ( $.fn.dataTable.isDataTable( '#mytable' ) ) {
    table = $('#mytable').DataTable();
  } else {
    table = $('#mytable').DataTable( {
      ordering  : true
    , order     : [ [ 1, 'asc' ], [ 5, 'asc' ] ]
    , autoWidth : false
    , columnDefs: [
	{ targets: 0, width:  '56px' }
      , { targets: 1, width: '110px' }
      , { targets: 2, width: '220px' }
      , { targets: 3, width: '160px' }
      ]
    , search: {
	caseInsensitive: false
      }
    , dom:
	"<'row r-control'<'col-sm-6 c-length'l><'col-sm-6 c-search'f>>" +
	"<'row r-table'<'col-sm-12'tr>>" +
	"<'row r-page'<'col-sm-5 c-info'i><'col-sm-7 c-pagination'p>>"
    } );
  }
  
  $('#mytable_filter input').on( 'input' , function () {
    window.location.hash = table.search()
  } )
  
  $('#mytable').css('display', 'table')
  
  $('#mytable_filter label').append(
    ' <button onclick="clearFilter()">Clear Filter</button>'
  )
  
  checkHash()
}