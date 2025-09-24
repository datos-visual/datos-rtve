define(['vendor/jquery'], function($) {
  var filas = [];
  $('.g1, .g2').each(function(i,a){
    filas.push({
      el: a,
      pos_top: $(a).offset().top
    });
  });
  $(window).on('scroll',function(e){
    if(filas[0] && window.pageYOffset + window.innerHeight > filas[0].pos_top){
      process(filas.shift().el);
    }
  });
  function process(el){
    var $img = $('.ima',el),
        $social = $('.socialBox',el);
    $img.length && $img.each(function(i,a){
      var $a = $(a);
      if(a.offsetWidth > 400){
        var src = $a.attr('src').match(/(.+)?/)[1]
        if(src)$a.children().attr('src', src);
      }
    });
    $social.length && $social.each(function(i,a){
      var $a = $(a);
      $.getJSON($a.data('stats_url'))
        .done(function(data){
          for(i in data){
            $('.'+i, $a).text(data[i]);
          }
        })
        .fail(function(){
          console.log('Error stats');
        });
    });
  }
});
