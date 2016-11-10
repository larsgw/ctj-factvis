var table
  , hash  = getHash()
  
  , colormap = {}
  , column= [ 'pmid', 'term', 'prop', 'value', 'ftid' ]
  , desc  = {
    pmid: function (title) {return(
      '<strong>'+title + '</strong> is an article identifier issued by <a href="https://www.ncbi.nlm.nih.gov/pmc/">Pubmed Central</a>. '+
      '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/' + title + '">Here\'s the article</a>'
    )}
  , ftid: function (title) {return(
      '<strong>'+title + '</strong> is a fact identifier issued by the <a href="http://contentmine.org">ContentMine</a>.'
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
      index = column.indexOf( hash.key )
    , value = hash.val
    
    if (title&&desc.hasOwnProperty(hash.key)) text = desc[ hash.key ]( title )
  } else if ( hash.key ) {
    if ( /^PMC\d+$/.test( hash.key ) ) {
      index = column.indexOf( 'pmid' )
    , value = hash.key
    
      if ( title ) text = desc[ 'pmid' ]( title )
    } else {
      columns = false
      table.columns( 1, 2, 3 ).search( hash.key )
    }
  }
  
  if ( columns )
    table.column( index ).search( value )
  
  if ( title&&text ) {
    $('#desc-title').html(title)
    $('#desc-text').html(text)
    $('#desc,#backButton').show()
  }
  
  table.draw()
}

// function getColorNumber (cmid) {
//   var dictionary = cmid.split('.')[1].split(/[0-9]/)[0]
//   if (!(dictionary in colormap)) {
//     var newColorValue=Math.max(1, ... _.values(colormap))+1
//     if (Number.isInteger(newColorValue)) {
//       colormap[dictionary] = newColorValue
//     }
//   }
//   return colors[colormap[dictionary]]
// }

function loadFile(num) {
//   var num = $('#sample_number').val() || '1'
  
  $.get('sample/sample_'+(num||1)+'.json', function CB_loadDefault(file) {
    receivedText(file)
  }).fail((err) => {
    var e = {}
    e.target = {}
    e.target.result = err.responseText
    receivedText(e)
  })
}

/*function loadDefault() {
  $.get('data/0/facts_1.json', function CB_loadDefault(file) {
    receivedText(file)
  }).fail((err) => {
    var e = {}
    e.target = {}
    e.target.result = err.responseText
    receivedText(e)
  })
}*/

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
//       console.log(e)
    }
  }
  
  var html = ''
  
  /*function contentmineID (cmid) {
    return (
      '<a href="#cmid='+cmid+'">'+
	'<div class="icon"></div>' +
	'<span>' + cmid + '</span>' +
      '</a>'
    )
  }*/
  
  function factID ( ftid ) {
    return (
      '<a href="#ftid=' + ftid + '">' +
	'<i class="material-icons">link</i><span style="font-size:0;">' + ftid +
      '</span></a>'
    )
  }
  
  /*function wikidataID (wid) {
    if (wid)
      return ( '<a href="#wdid='+wid+'">'+wid+'</a>' )
    else
      return ''
  }
  
  function removeXML (str) {
    return str/*.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&?(#x)?.+?;/g,'')*//*.replace(
      /^[^<]*>|<.+?>|<[^>]*$/g,
      ' '
    )
  }

  function prependEnWiki (name) {
    return 'https://en.wikipedia.org/wiki/'+name
  }

  //return the value of the property of the string name if the target is an item
  function returnTargetOfProperty (response, wid, pid, cb) {
    try {
      var target = response.entities[wid].claims[pid][0].mainsnak.datavalue.value.amount
      if(response.entities[wid].claims[pid][0].mainsnak.datatype == "wikibase-item") {

      }
      cb(target)
    }
    catch (err) {}
  }

  function getWikiBaseItem (wid, cb) {
    $.ajax({
      url: wdk.getEntities(wid),
      jsonp: "callback",
      dataType: "jsonp",
      success: cb
    })
  }*/

  function createdRowFunc (row, data, dataIndex) {
//     var color = getColorNumber(data[0])
//     $(row).find('td.cmid .icon').css('background-color', color)
//     var wid = $(data[5]).text()
//     if (wid) {
//       getWikiBaseItem(wid, function (response) {
// 	  var title = response.entities[wid].sitelinks.enwiki.title
// 	  if (title) {
// 	    var url = prependEnWiki(title)
// 	    var html = ` <a href="${url}"><img src="W_icon.png" alt="wikipedia_icon"</a>`//
// 	    $(row).find('td.term').append(html)
// 	  }
// 	  returnTargetOfProperty(response, wid, 'P1082', function (target) {
// 	    if (target) $(row).find('td.term img').attr('title',`Population of: ${target}`)
// 	  })
// 	})
//     }
  }

  $('#front-loading-matter').css('display', 'none')

  $.each(newArr, function CB_eachFact(index, value) {
    html +=
    '<tr>' +
      '<td class="pmid"><span><a href="#pmid='+value._source.cprojectID+'">'+ value._source.cprojectID+'</td>' +
      
      '<td class="term"><span data-type="' +
	( value._source.identifiers.article.name ? value._source.identifiers.article.name : '' ) +
      '">'+ value._source.term + '</td>' +
      
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
    , order     : [ [ 0, 'asc' ], [ 4, 'asc' ] ]
//     , createdRow: createdRowFunc
    , autoWidth : false
    , columnDefs: [
	{ targets: 0, width: '110px' }
      , { targets: 1, width: '300px' }
      , { targets: 2, width: '200px' }
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
  
  clearFilter()
}

// $(loadDefault)