(function($) {
	$.widget("ui.autoexpand", {
		_init: function(){
			var self = this;
			this.handle = $(this.element);
	        this.content = $(self.options.target);
	        if(this.handle==null || this.content ==null || this.content.length<=0 )
	        {
	            return;
	        }
			this._initCss();

			this.handle.bind("click", function() {
			    if(self.flag) {			    
			        self.hide();
			    } else {
			        self.show();
			    }
			});
		},

		/*特殊处理初始化样式*/
		_initCss:function(){
			var self = this;			
			if(self.options.expanded) {
			    this.show();
			} else {
			    this.hide();
			}			
		},
		
		show:function() {
		    this.content.show();
		    this.handle.addClass(this.options.cssExpand).removeClass(this.options.cssCollapse);
		    this.flag = true;
		},
		
		hide:function() {
		    this.content.hide();
		    this.handle.addClass(this.options.cssCollapse).removeClass(this.options.cssExpand);
		    this.flag = false;
		}

		
	});

	$.extend($.ui.autoexpand,{
		defaults:{
			target : null,
			cssCollapse: "expanded",
			cssExpand: "collapsed",
			expanded : true
		},
		load:function(){
			$('[pa_ui_name*=autoexpand]').each(function(){
				$.pa_ui.widget.init(this);
				var options={};
				if($(this).attr('pa_ui_autoexpand_target')!=null && $(this).attr('pa_ui_autoexpand_target').length>0){
					options['target'] = $(this).attr('pa_ui_autoexpand_target');
				}
				if($(this).attr('pa_ui_autoexpand_cssCollapse')!=null && $(this).attr('pa_ui_autoexpand_cssCollapse').length>0){
					options['pa_ui_autoexpand_cssCollapse'] = $(this).attr('pa_ui_autoexpand_cssCollapse');
				}
				if($(this).attr('pa_ui_autoexpand_cssExpand')!=null && $(this).attr('pa_ui_autoexpand_cssExpand').length>0){
					options['pa_ui_autoexpand_cssExpand'] = $(this).attr('pa_ui_autoexpand_cssExpand');
				}
				if($(this).attr('pa_ui_autoexpand_expanded')!=null && $(this).attr('pa_ui_autoexpand_expanded').length>0){
					options['pa_ui_autoexpand_expanded'] = ($(this).attr('pa_ui_autoexpand_expanded')=="true");
				}
				$(this).autoexpand(options);
				$.pa_ui.widget.inited(this);
			});
		}
	});

	if($.pa_ui.lazyLoad){
		$(document).ready(function(){
			$.ui.autoexpand.load();
		});
	}
	else{
		$.ui.autoexpand.load();
	}
})(jQuery);
