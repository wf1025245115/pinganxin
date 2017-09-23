(function($) {
	$.widget("ui.mouse", {
		_init: function() {
		    var options = this.options;
            this.element.each(function() {
                
                $(this).unbind("contextmenu");
                $(this).bind("contextmenu",function(){
                    if (event != null) {
	                    event.returnValue= !(options.contextmenu == false);
	                    event.cancelBubble=true;
                    }
                    return !(options.contextmenu == false);
                });
               
            });
		},

		destroy: function(){
			$.widget.prototype.destroy.apply(this);
			this.element.unbind('.mouse');
		}
	});

	$.extend($.ui.mouse, {
		defaults: {
			contextmenu:false       //右键菜单
		},

		load:function(){
			$("[pa_ui_name*='mouse']").each(function(index){
				$.pa_ui.widget.init(this);
				
				var options={},option;	
				option = $(this).attr('pa_ui_mouse_contextmenu');
				if(typeof option != 'undefined'){
					options['contextmenu'] = (option==='true');
				}			

				$(this).mouse(options);
				$.pa_ui.widget.inited(this);
			});
		}
	});

    //根据属性调用接口
	if($.pa_ui.lazyLoad){
		$(document).ready( function(){
			$.ui.mouse.load();
		});
	}
	else{
		$.ui.mouse.load();
	}
})(jQuery);