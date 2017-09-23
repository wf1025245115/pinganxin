(function($) {
	$.widget("ui.menu",{
		_init:function() {
			if(this.element<=0){
				return;
			}
			var options = this.options|| {};
			var $this = this.element;

			// Set default values
			options.speed = options.speed || null;
			options.layout = options.layout || "horizontal";
			options.rootclass = options.rootclass || "pa_ui_menu_root";
			options.roothoverclass = options.roothoverclass || "pa_ui_menu_root_hover";
			options.subclass = options.subclass || "pa_ui_menu_sub";
			options.subhoverclass = options.subhoverclass || "pa_ui_menu_sub_hover";
			options.animatedirection = options.animatedirection || "vertical";
			options.allowopacity = options.allowopacity || false;

		   
		   this._initClass($this,options);
		   
			
			return this;
		},
		_initClass:function($this, options) {
			
			//样式设置
			var maxZi = 1000;
			
			
			//根
			if(options.rootclass) {				
				$this.addClass(options.rootclass);
			}
			//子
			if(options.subclass) {
				$this.find("ul").addClass(options.subclass);
			}
			
			$this.find("li").css("position","relative");
			$this.find("ul").css("position","absolute");
			
			$this.find("ul").show();
			setPos();
			$this.find("ul").bgiframe();
			$this.find("ul").hide();
			
			function setPos() {
				
				//第一级子菜单			
				if(options.layout=="horizontal") {
					//水平
					$this.children("li").css("float","left");
					//水平时，子菜单在自己的下方
					$this.children("li").children("ul").each(function(){
						var sub = $(this);
						setBottomPos(sub);
					});
				} else if(options.layout=="vertical") {
					//垂直
					$this.children("li").css("float","none");
					//垂直时，子菜单在自己的右侧
					$this.children("li").children("ul").each(function(){
						var sub = $(this);
						setRightPos(sub);
					});
				}
				//第二级以后的子菜单，都在上一级的右边
				$this.children("li").children("ul").find("ul").each(function(){
					var sub = $(this);
					setRightPos(sub);
				});
			}
			
			function setBottomPos($element) {
				var sub = $($element);
				var parent = sub.parent();
				var pos = findPos(parent.get());
				var height = parent.height();
				var width = parent.width();
				sub.css({					   
					top : (pos.y +height ) + "px",
					left: (pos.x) + "px",
					"z-index" : parseInt( parent.css("z-index"),maxZi)||maxZi+1
					
				});
				sub.children("li").children("a").css("width",width);
			}
			
		   function setRightPos($element) {
				var sub = $($element);
				var parent = sub.parent();
				var pos = findPos(parent.get());
				var width = parent.width();
				sub.css({					   
					top: (pos.y ) + "px",
					left:(pos.x+width) + "px",						
					"z-index" : parseInt( parent.css("z-index"),maxZi)||maxZi+1
				});
				sub.children("li").children("a").css("width",width);
			}
			
			
			function findPos(obj) {
				var curleft = obj.offsetLeft || 0;
				var curtop = obj.offsetTop || 0;
				while (obj = obj.offsetParent) {
					curleft += obj.offsetLeft
					curtop += obj.offsetTop
				}
				return {x:curleft,y:curtop};
			}
			
			
			$this.find("li").hover(function(){				
				setPos();
				if(options.speed) {
					var animate = {height:"show"};
					if(options.animatedirection=="horizontal") {
						animate = {width:"show"};
					}
					if(options.allowopacity) {
						animate["opacity"] = "show";
					}
					$(this).find("ul:first").animate(animate, options.speed);
				} else {
					$(this).find("ul:first").show();
				}
				if(options.roothoverclass)
				{
					setTimeout($(this).addClass(options.roothoverclass),100);
				}
			},
			function(){				
				if(options.speed) {
					var animate = {height:"hide"};
					if(options.animatedirection=="horizontal") {
						animate = {width:"hide"};
					}
					
					if(options.allowopacity) {
						animate["opacity"] = "hide";
					}
					$(this).find("ul:first").animate(animate, options.speed);
				} else {
					$(this).find("ul:first").hide();
				}
				if(options.roothoverclass)
				{
					setTimeout($(this).removeClass(options.roothoverclass),100);
				}
			});
			
		}
			 
	} );

	$.extend($.ui.menu,{
		defaults :{
			speed : null,							   //速度
			layout : "horizontal",					  //根菜单的排列形式：水平horizontal，垂直vertical，未设置notset
			rootclass : "pa_ui_menu_root",			  //根菜单的Class，作用在ul上
			hoverclass : "pa_ui_menu_hover",			//菜单的HoverClass，作用在li上
			subclass : "pa_ui_menu_sub",				//子菜单的Class，作用在ul上		   
			animatedirection : "vertical",			  //菜单显示隐藏动画的方向，vertical垂直显示隐藏，horizontal水平显示隐藏
			allowopacity : false						//菜单显示隐藏动画是否透明度更改，默认否
			
		},
		load:function(){
			var inited=false;
			if(!inited){
				$("[pa_ui_name*=menu]").each(function(){
					var options = {};
					var $this = $(this);

					if($this.attr("pa_ui_menu_speed")){
						options["speed"] = $this.attr("pa_ui_menu_speed") ;
					}
					if($this.attr("pa_ui_menu_layout")){
						options["layout"] = $this.attr("pa_ui_menu_layout") ;
					}
					if($this.attr("pa_ui_menu_rootclass")){
						options["rootclass"] = $this.attr("pa_ui_menu_rootclass") ;
					}
					if($this.attr("pa_ui_menu_hoverclass")){
						options["hoverclass"] = $this.attr("pa_ui_menu_hoverclass") ;
					}
					  if($this.attr("pa_ui_menu_subclass")){
						options["subclass"] = $this.attr("pa_ui_menu_subclass") ;
					}
					if($this.attr("pa_ui_menu_animatedirection")){
						options["animatedirection"] = $this.attr("pa_ui_menu_animatedirection") ;
					}
					if($this.attr("pa_ui_menu_allowopacity")=="true"){
						options["allowopacity"] = true ;
					}
					$this.menu(options);
					$.pa_ui.widget.inited(this);
				});
			}
		}
	});

	if($.pa_ui.lazyLoad){
		$(document).ready(function(){
			$.ui.menu.load();
		});
	} else{
		$.ui.menu.load();
	}
 
})(jQuery);

