$(document).ready(function(){
  console.log("Loaded document");

  $('#search-button').click(function(){
    var input = $('#search-input').val()
    $.ajax({
      url: '/search?q='+input,
      success: function(json){
        $('#panels').empty();
        for (var i = 0; i < json.length; i++){
          var j = json[i];

          try {
            if (j.error) console.error("Unable to fetch " + j.url+ ": "+j.error);
            else {
              console.log("Loading " +j.iframe);
            //  $('#panels').append("<div class='panel' title='"+j.url+"'> "+ j.html+ "</div>");
             $('#panels').append("<div class='panel'>"+
                "<a class='open' target='_blank' href='"+j.url+"'> Open</a>"+
                "<iframe  src='"+j.iframe+ "'></iframe>"+
              "</div>");
            }
          } catch(e){
            console.error("Unable to load URL "+j.url+ ": " +e);
          }

        }
      }
    })
  })
})
