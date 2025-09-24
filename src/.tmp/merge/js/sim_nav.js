define(['vendor/jquery','statistics'], function($,stats) {
  return {
    setOnPopstate: function (cb) {
      $(window).on('popstate', function(e) {
        if(cb){
         return cb(window.history.state);
        }
        window.location.reload();
      });
    },
    change_page: function(url,options){
      if(window.history.pushState){
        window.history.pushState(options, '', url);
      }
    }
  };
});
