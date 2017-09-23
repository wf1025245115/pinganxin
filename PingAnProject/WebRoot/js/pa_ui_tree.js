(function($) {
$.widget("ui.tree", {
	_init: function() {
		this.originelement = this.element;
		if(this.element[0].tagName.toLowerCase()!='ul'){
			this.element = this.element.find('ul:eq(0)');
		}   
		this.element.data("options",this.options);   
		if (this.options.url){
			this.load('source', this.element[0]);
		}
		else{
			this.treeview();
		}
	},

	destroy: function() {
		$.widget.prototype.destroy.apply(this, arguments);
	},

	load: function(root, child){
		var shtml='', self = this;
		var url = this.options.url;
		$.getJSON(url, {root: root}, function(response) {
			function createNode(parent) {	
				var current = $("<li/>").html('<div>'+this.text+'</div>');
				if (this.hasChildren || this.children && this.children.length) {
					shtml += '<li><div>'+this.text+'</div><ul>';
					var branch = $("<ul/>").appendTo(current);
					if (this.children && this.children.length) {
						$.each(this.children, createNode, [branch])
					}
					shtml +='</ul></li>';
				}
				else{
					shtml += '<li>'+this.text+'</li>';
				}
			}
			$.each(response, createNode, [child]);
			self.element.html(shtml);
			self.treeview();
		});
	},

	prepareBranches: function() {
		if (!this.options.prerendered) {
			// 标记树已经结束
			this.filter(":last-child:not(ul)").addClass(self.options.last);
			// 标记已经被关闭的树节点
			this.filter((self.options.collapsed ? "" : "." + this.options.closed ) + ":not(." + this.options.open + ")").find(">ul").hide();
		}
		// 返回所有的。。节点
		return this.filter(":has(>ul)");
	},

	applyClasses: function(o) {
		var self = this;
		var hclass = self.options.hover;
		$(o).filter(":has(>ul):not(:has(>a))").find(">span").click(function(event) {
				self.toggler.apply($(this).next());
			}).add( $("a", this) ).hover(function() {
				$(this).addClass(hclass);
			}, function() {
				$(this).removeClass(hclass);
			});
			
		if (!this.options.prerendered) {
			// 首先内置处理
			$(o).filter(":has(>ul:hidden)")
				.addClass(self.options.expandable).toggleClass(self.options.last, false).addClass(self.options.lastExpandable).end();
						
			// 展开的节点处理
			$(o).not(":has(>ul:hidden)")
				.addClass(self.options.collapsable).toggleClass(self.options.last, false).addClass(self.options.lastCollapsable).end();
				
            // 创建点击标记
			$(o).prepend("<div class=\"" + self.options.title + "\"/>").find("div." + self.options.title).each(function() {
				var classes = "";
				$.each($(this).parent().attr("class").split(" "), function() {
					classes += this + "-title ";
				});
				$(o).addClass( classes );
			});
		}
			// apply event to title
		$(o).find("div." + self.options.title).click( self.toggler );
	},

	_expandOne: function(o, val){
		var tmpval = val;
		var index = val.indexOf('.');
		if (index > 0){
			tmpval = val.split('.')[0];
			val = val.substring(index+1);
		}
		$(o[tmpval-1]).removeClass(this.options.collapse).filter(":has(ul)").addClass(this.options.expand);//$(o[tmpval-1]).removeClass(this.options.collapse).addClass(this.options.expand);
		$(o[tmpval-1]).children('ul:first').show();
		if (index >0){
			return this._expandOne($(o[tmpval-1]).children('ul:first').children('li'),val);
		}
	},

	_initClass: function(element,options){
	    var o = this.options || options;
		this.options =o;
	    $(element).find(">li").addClass("root_level");
		$(element).find("li:last-child>ul").addClass("last_ul");
		if($(element).find(">li").length>1){
		    $(element).find(">li:first").addClass("first");
		    $(element).find(">li:last").addClass("last");		    
		}
		else{
		    $(element).find(">li").addClass("only");
		}
		
		this._initChildrenClass(element);
	},
	
	_initChildrenClass: function(element){
		
		var self = this;
		var o = this.options;		
		var $lis = $(element).children("li");
		       
		$lis.each(function(){  		  
			$(this).find("li").removeClass('last').removeClass('first').removeClass("lastest").removeClass("last_level");  
		    $(this).find("li:last-child").addClass('last');
		    $(this).find("li:first-child").addClass('first');
		   
			if($(this).children('ul:first').length > 0){
			    if(o.refresh==true){
			    }
			    else{
				    if (o.expandNode == '-1'){
					    $(this).removeClass(o.collapse).removeClass('last_level').addClass(o.expand);			
					    $(this).children("ul:first").show();
				    }
				    else{
					    $(this).removeClass(o.expand).removeClass('last_level').addClass(o.collapse);
					    $(this).children("ul:first").hide();
				    }
				}

				$(this).children('div:first').addClass(o.title);
				//if ($(this).children('ul:first').children('li').children('div').length>0){				
					return self._initChildrenClass($(this).children('ul:first'));
				//}
			}
			else{
			   $(this).removeClass(o.expand).removeClass(o.collapse);	
			   $(this).filter(":not('.root_level')").addClass('last_level');
			   $(this).filter("li:last-child").addClass('lastest');
			}
						
		});

		if(o.expandNode != '-1' && o.expandNode != '0'){
			this._expandOne($lis, o.expandNode);//this._expandOne(tobj, o.expandNode);
		}
	},
		
	treeview: function() {
		var el = this.element[0], self = this; o = this.options;
		//移出全部class
		self.element.find("li").each(function(){
			$(this).removeClass(o.expand).removeClass(o.collapse);//.addClass('last_level');
		});		
		
		this._initClass(el);	
     
		if (o.add) {
			return el.trigger("add", [o.add]);
		}

		if ( o.toggle ) {
			var callback = o.toggle;
			o.toggle = function() {
				return callback.apply($(this).parent()[0], arguments);
			};
		}

		$(el).addClass("treeview");

		var branches = $(el).find("li").tree('prepareBranches');
		this.applyClasses(branches);

		// 如果控制选项被设置，创建标签并显示
		if ( o.control ) {
			self.options.treeController(this, o.control);
			$(o.control).show();
		}

		return $(o).bind("add", function(event, branches) {
			$(branches).prev()
				.removeClass(this.options.last)
				.removeClass(this.options.lastCollapsable)
				.removeClass(this.options.lastExpandable)
				.find(">.title")
				.removeClass(this.options.lastCollapsableHitarea)
				.removeClass(this.options.lastExpandableHitarea);
			this.applyClasses($(branches).find("li").andSelf().tree('prepareBranches'));
		});
	},

	// 切换事件
	toggler: function() {
		var obj = $(this).parent().find(".title").parent('li:first');

		if ($(obj).hasClass('expand')){  
			$(obj).removeClass('expand').addClass('collapse');
		}
		else{
			$(obj).removeClass('collapse').addClass('expand');
		}
		// 切换选择区域
		$($(this).parent().find(">.title").parent().find( ">ul" )).each(function(){
			$(this).toggle();
			/*
			if(self.options.toggle){
				self.toggler.apply(this, arguments);
			}
			*/
		});
	}
	

});

$.fn.addTreeNode = function(targetControl,node){
    if(targetControl==null || node==null)
        return;
    targetControl = this.find(targetControl);
    var parent = targetControl;
    var options = this.data("options");
    if(targetControl.is("li")){
        parent = targetControl.children("ul");
	    if(parent==null || parent.length==0){		    
		    targetControl.filter(function(){return $(this).children().is("div")==false;}).wrapInner("<div></div>");
		    targetControl.children("div:first").addClass(options.title).click( $.ui.tree.prototype.toggler );
		    parent=$("<ul></ul>")
		    targetControl.append(parent);		
	    }
	    var html = $("<li></li>  ");
	    html.text(node)	;	
	    $(parent).append(html);
	} 
	else if(targetControl.is("ul")){
	    var html = $("<li></li>  ");
	    html.text(node)	;	
	    $(parent).append(html);
	}
	options.refresh=true;
    $.ui.tree.prototype._initClass(this,options);
}

$.fn.removeTreeNode = function(targetControl){
    if(targetControl==null)
        return;
    targetControl = this.find(targetControl);  
    var options = this.data("options");
    if(targetControl.is("li")){
        var parent = targetControl.parent("ul");
	    if(parent!=null && parent.children("li").length>1){		    
		    targetControl.remove();
	    }
	    else if(parent!=null && parent.children("li").length<=1){		    
		    targetControl.remove();
		    if($(parent)!=$(this)){
                parent.siblings("div." + options.title).unbind("click",$.ui.tree.prototype.toggler);
                parent.remove();
		    }
	    }	  
	    options.refresh=true;
	    $.ui.tree.prototype._initClass(this,options);
	}
}

//设定默认属性
$.extend($.ui.tree, {
	defaults: {
		event: 'click',   //事件类型
		cookieId: '',
		add: '',
		url:'',
		toggle: '',
		collapsed: true,
		prerendered: true,
		persist: "location",
		expandNode:'0',
		expand: 'expand',
		collapse: 'collapse',
		title: "title",
		hover: 'hover',
		open: "open",
		closed: "closed",
		url: '',
		expandable: "expandable",
		expandableHitarea: "expandable-title",
		lastExpandableHitarea: "lastExpandable-title",
		collapsable: "collapsable",
		collapsableHitarea: "collapsable-title",
		lastCollapsableHitarea: "lastCollapsable-title",
		lastCollapsable: "lastCollapsable",
		lastExpandable: "lastExpandable",
		last: "last"
	},
	loadMe:function(){
		$("[pa_ui_name*=tree]").each(function(index){
			$.pa_ui.widget.init(this);

			var options={},option;
			option = $(this).attr('pa_ui_tree_dataurl');
			if(option){
				options['url'] = option;
			}
			/*0全折叠，-1 全展开 1.2.3展开指定节点*/
			option = $(this).attr('pa_ui_tree_expandnode') || $(this).attr('pa_ui_tree_style');
			if(option){
				options['expandNode'] = option;
			}

			$(this).tree(options);

			$.pa_ui.widget.inited(this);
		});	
	}
});


//自动调用
if($.pa_ui.lazyLoad){
	$(document).ready( function(){
		$.ui.tree.loadMe();
	});
}
else{
	$.ui.tree.loadMe();
}

})(jQuery);