function addcss(css){
   var head = document.getElementsByTagName('head')[0];
   var s = document.createElement('style');
   s.setAttribute('type', 'text/css');
   if (s.styleSheet) {
       s.styleSheet.cssText = css;
   } else {
       s.appendChild(document.createTextNode(css));
   }
   head.appendChild(s);
}
var Rater = function(min = 0, max = 5, parent = null, icon_empty = 'rater-default-empty', icon_full = 'rater-default-full', remove_text = "", remove_icon = ""){
  this.min = min;
  this.max = max;
  this.never_chose = true;
  this.chosen = null;
  this.parent = parent;
  this.icon_full = icon_full;
  this.icon_empty = icon_empty;
  this.removeSelected = function(){
    this.never_chose = true;
    this.chosen = null;
  };
  this.createStars = function(){
      var stars = [];
      var totalStars = "";
      var max = this.max;
      var min = this.min;
      var count = max - min + 1;
      if(min === 0) count--;
      var icon_full = this.icon_full;
      var icon_empty = this.icon_empty;

      for(var i=1; i<=count; i++)
      {
          stars.push($.parseHTML( "<i class='"+icon_empty+" rater' rater-value='"+ i +"'></i>" ));
          totalStars += stars[i];
      }
      var container = $.parseHTML("<div class='rater-container'></div>");
      $(container).insertAfter(this.parent);
      for(var i=0; i<stars.length; i++)
      {
        $(stars[i]).appendTo(container);
      }

      var remove_icon_container = "";
      if(remove_icon!="")
      {
        remove_icon_container = "<i class='"+ remove_icon +"'></i>";
      }
      remove_icon = $.parseHTML(remove_icon_container);
      var remove_rating = $.parseHTML("<span class='rater-remove'></span>");
      remove_text = $.parseHTML("<span>"+remove_text+"</span>");
      $(remove_rating).append(remove_icon).append(remove_text);
      $(remove_rating).insertAfter(container);
      $(container).css('display','inline');
      $('i.rater').css('cursor','pointer');
      $('span.rater-remove').css({'cursor': 'pointer', 'color': '#337ab7', 'margin-left': '5px'});
      var self = this;
      //Track mousemovement on parent of stars
      //Restore stars to right state depending on chosen rating
      //when user leaves i.rater items
      $(container).mousemove(function(e){
        if(!self.never_chose)
        {
          $(this).find('i.rater').each(function(){
            $(self.chosen).prevAll().addBack().removeClass(icon_empty).addClass(icon_full);
            $(self.chosen).nextAll().addBack().removeClass(icon_full).addClass(icon_empty);
            $(self.chosen).removeClass(icon_empty).addClass(icon_full);
          });
        }
      }).mouseleave(function(){
        if(!self.never_chose)
        {
          $(this).find('i.rater').each(function(){
            $(self.chosen).prevAll().addBack().removeClass(icon_empty).addClass(icon_full);
            $(self.chosen).nextAll().addBack().removeClass(icon_full).addClass(icon_empty);
            $(self.chosen).removeClass(icon_empty).addClass(icon_full);
          });
        }
      })
      $(container).find('i.rater').each(function(index){
        //Track mousemovement stop event bubbling to parent.
        $(this).mousemove(function(e){
          e.stopPropagation();
        }).mouseenter(function(e){
          //Track mouseenter & select stars until they reach the mouse's current target
            $(this).prevAll().addBack().removeClass(icon_empty).addClass(icon_full);
            $(this).nextAll().addBack().removeClass(icon_full).addClass(icon_empty);
            $(this).removeClass(icon_empty).addClass(icon_full);
        }).mouseleave(function(e){
          //Track mouseleave & deselect star (except if there is already a rating ,so don't deselect the first star)
          $(this).prevAll().addBack().removeClass(icon_full).addClass(icon_empty);
          if(!self.never_chose && index === 0){
            $(this).removeClass(icon_empty).addClass(icon_full);
          }
        }).click(function(e){
          //Track mouseclick & select all the stars until they reach the mouse's current target
          self.chosen = $(this);
          self.never_chose = false;
          var chosen_value = $(self.chosen).attr('rater-value');
          $(self.parent).val(chosen_value);
          $(this).prevAll().addBack().removeClass(icon_empty).addClass(icon_full);
        });
      });

      // Track mouseclick & remove all the selected stars
      $(remove_rating).click(function(){
        self.removeSelected();
        $(container).find('i.rater').each(function(){
          $(this).removeClass(icon_full).addClass(icon_empty);
          $(self.parent).val("");
        });
      });
  };
}
var raters = [];
$(document).ready(function(){
  //Search the DOM for Rater elements
  $('.rater').each(function(){
    var min = $(this).attr('min');
    var max = $(this).attr('max');

    if(!min || !$.isNumeric(min) || min < 0) min = 0;
    if(!max || !$.isNumeric(max) || max < 0) max = 5;
    min = Number.parseInt(min);
    max = Number.parseInt(max);
    //Make input hidden
    var parent = $(this).clone().attr('type','hidden');
    parent.insertAfter(this).prev().remove();
    //Initialize raters
    if($(parent).attr('icon-full')==null)
    {
      icon_full = 'rater-default-full';
      var css = "i.rater-default-empty:before{ content: '\\2606'; font-size: 1em;} i.rater-default-full:before{ content: '\\2605'; font-size: 1em;}";
      addcss(css);
    }
    else {
      icon_full = $(parent).attr('icon-full');
    }
    if($(parent).attr('icon-empty')==null)
    {
      icon_empty = 'rater-default-empty';
      var css = "i.rater-default-empty:before{ content: '\\2606'; font-size: 1em;} i.rater-default-full:before{ content: '\\2605'; font-size: 1em;}";
      addcss(css);
    }
    else {
      icon_empty = $(parent).attr('icon-empty');
    }
    var remove_text = "";
    var remove_icon = "";
    if($(parent).attr('remove-text')!=null)
    {
      remove_text = $(parent).attr('remove-text');
    }
    if($(parent).attr('remove-icon')!=null)
    {
      remove_icon = $(parent).attr('remove-icon');
    }
    raters.push(new Rater(min, max, parent, icon_empty, icon_full, remove_text, remove_icon).createStars());
  });

});
