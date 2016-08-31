  var corpora = {
    'tjmind' : {
      'title' : 'Letters of Thomas Jefferson',
      'k' : [20, 40, 60, 80],
      'description' : 'To understand Jefferson from a distance of two centuries requires attention to all his interests and concerns. Here we present 881 of his letters, together with his Memoirs, as curated by his grandson, Thomas Jefferson Randolph.' 
    },
    'tjmind-proposal' : {
      'title' : 'Letters and Retirement Library of Thomas Jefferson',
      'k' : [20, 40, 60, 80],
      'description' : 'A voracious bibliophile, Thomas Jefferson\'s love of reading sheds new light on his many interests and concerns. Here, for the first time, we present a portion of his Retirement Library, together with his letters and memoirs they influenced.' }
  };

var taTimeout;
var remoteSourceFn = function(base_url) {
  return function(query, process) {
    if (taTimeout)
      clearTimeout(taTimeout);
    this.$menu.find('.active').removeClass('active');
    taTimeout = setTimeout(function () {
      $.getJSON(base_url + 'docs.json?q=' + encodeURIComponent(query), function(data) {
        labels = [];
        mapped = {};
        $.each(data, function(i, item) {
          mapped[item.label] = item;
          labels.push(item.label);
        });
      
        process(labels);
    })}, 300);
  } };

  
var localSourceFn = function(data){ 
    return function(query, process) {
      labels = [];
      mapped = {};
      $.each(data, function(i, item) {
        mapped[item.label] = item;
        labels.push(item.label);
      });
        
      process(labels);
      this.$menu.find('.active').removeClass('active');
    };
  };

var changeCorpora = function(corpus) {
  if (typeof(corpus) != 'string')
    corpus = $('#selectCorpora').val();
  if ($('.typeahead').data('typeahead'))
    $('.typeahead').data('typeahead').source = [];
  
  if (!corpus) {
    $('#doc').attr('placeholder', 'Click button on right to select random document →');
    $('#doc').attr('disabled', true);
    return;
  } else{
    // set all values
    var url = 'http://inphodata.cogs.indiana.edu/' + corpus + '/';
    
    $('#hidden_id').val('');
    $('#doc').val('');
    $('#selectCorpora').val(corpus)
    $('#topics').empty();
    $('#corpusTitle').html(corpora[corpus].title);
    $('#corpusDescription').html(corpora[corpus].description);
    if (corpora[corpus].more)
      $('#corpusDescription').append($('<a>').attr('href', url).text(' Read more ...'));
    
    $('#doc').attr('placeholder', 'Type to match document titles...');
    $('#doc').removeAttr('disabled');

    // Add the proper topic dropdown
    $.each(corpora[corpus].k, function(i, n) {
      $('#topics').append($('<li>').append($('<a>', {'href' : 'javascript:visualize("' + corpus + '",' + n + ')'})
       .text(' ' + n + ' Topics')));
      console.log(corpus, i, n)
    });
    
    // Initialize Typeahead
    
    initTypeahead(url);
  }
};

$.each(corpora, function(key, value) {
  $('#selectCorpora')
   	.append($('<option>', { value : key})
   		.text(value.title));
});

var random = function(items) {
  return items[Math.floor(Math.random()*items.length)];
};

$('#randomCorpus').click(function() {
  changeCorpora(random(Object.keys(corpora)));
});

$('#selectCorpora').change(changeCorpora);

$('#randomDoc').click(function() {
  if ($('#selectCorpora').val() == '')
    changeCorpora(random(Object.keys(corpora)));
  var corpus = $('#selectCorpora').val();
  var url = 'http://inphodata.cogs.indiana.edu/' + corpus + '/';
      
  $.getJSON(url + 'docs.json?random=1', function(rand) {
      $('#hidden_id').val(rand[0].id);
      $('#doc').val(rand[0].label);
  });
});

var visualize = function(corpus, k) {
  // build url
  var url = 'http://inphodata.cogs.indiana.edu/'
  url += corpus + '/' + k + '/';
  url += "?doc=" + encodeURIComponent($("#hidden_id").val()) ;
  // go to url
  window.location = url;
}

          
var initTypeahead = function(url) {
  if ($('.typeahead').data('typeahead')) {
    //$('.typeahead').typeahead('destroy');
    $('.typeahead').data('typeahead').source =remoteSourceFn(url);
  }
  else
    $(".typeahead").typeahead({items: 12,
      source: remoteSourceFn(url),
      updater: function(item) {
        if (!item) return this.$element.val();
        else $('#hidden_id').val(mapped[item].id);
        return item;
      },
      sorter: function(items) {
        var query = this.query;
        items = items.sort();
        var start = items.filter(function(item) { return item.lastIndexOf(query, 0) == 0;});
        var elsewhere = items.filter(function(item) { return item.lastIndexOf(query, 0) != 0;});
        return start.concat(elsewhere);
        }});
  };
