//定义pa_ui
jQuery.pa_ui || (function($){
	jQuery.pa_ui = {
		version:30,
		build:'20091207',
		/*debug的话autoLoadJs会引入.source.js*/
		isDebug:false,
		/*是否自动加载js/css*/
		autoLoadJs:true,
		autoLoadCss:false,
		lazyLoad:true,
		theme:'default'
		};
})(jQuery);

/*pa_ui_name和文件名的对应，文件为pa_ui_***.js or pa_ui_***.source.js*/
if($.pa_ui.isDebug){
	$.pa_ui.fileMapping = {
		dialog:['dialog','dialog'],
		accordion:['accordion','accordion'],
		tabs:['tabs','tabs'],
		popuptrigger: ['popup',''],
		tooltip:['tooltip',''],
		table:['table,datepicker','table,datepicker'],
		exinput:['input',''],
		datepicker:['datepicker','datepicker'],
		birthday_year:['birthday,validator','validator,datepicker'],
		birthday_month:['birthday,validator','validator,datepicker'],
		birthday_day:['birthday,validator','validator,datepicker'],
		insuranceinterval:['datepicker,insuranceinterval','datepicker'],
		popupyear:['ymd','datepicker'],
		popupmonth:['ymd','datepicker'],
		popupday:['ymd','datepicker'],
		keyboard:['keyboard','keyboard'],
		validator:['validator','validator'],
		validcode:['validcode', ''],
		tree:['tree','tree'],
		radio:['radio','select'],
		checkbox:['checkbox','select'],
		dropselect: ['dropselect','select'],
		dropinput:['dropinput','select'],
		dropbox: ['dropbox','select'],
		casselect:['casselect','select'],
		stars:['stars','select'],
		pagebar:['pagebar','pagebar'],
		slider:['slider','slider'],
		gallery:['gallery', ''],
		eximage:['image','image'],
		exscroll:['scroll',''],
		roller:['roller',''],
		gotop:['totop',''],
		shadowtext:['shadowtext','shadowtext'],
		ajaxlink:['ajaxlink',''],
		virframe:['virframe',''],
		autocomplete:['autocomplete','autocomplete'],
		menu:['menu','menu'],
		mouse:['mouse','mouse'],
		autoexpand:['autoexpand','autoexpand']
	};
}
else{
	$.pa_ui.fileMapping = {
		dialog:['dialog','dialog'],
		accordion:['accordion','accordion'],
		tabs:['tabs','tabs'],
		popuptrigger: ['misc',''],
		tooltip:['misc',''],
		table:['misc,date','table,datepicker'],
		exinput:['misc',''],
		datepicker:['date','datepicker'],
		birthday_year:['date,validator','validator,datepicker'],
		birthday_month:['date,validator','validator,datepicker'],
		birthday_day:['date,validator','validator,datepicker'],
		insuranceinterval:['date','datepicker'],
		popupyear:['date','datepicker'],
		popupmonth:['date','datepicker'],
		popupday:['date','datepicker'],
		keyboard:['misc','keyboard'],
		validator:['validator','validator'],
		validcode:['validator', ''],
		tree:['tree','tree'],
		radio:['misc','select'],
		checkbox:['misc','select'],
		dropselect: ['misc','select'],
		dropinput:['misc','select'],
		dropbox: ['misc','select'],
		casselect:['misc','select'],
		stars:['misc','select'],
		pagebar:['misc','pagebar'],
		slider:['misc','slider'],
		gallery:['misc', ''],
		eximage:['misc','gallery'],
		exscroll:['misc','scroll'],
		roller:['misc','scroll'],
		gotop:['misc',''],
		shadowtext:['misc','tooltip'],
		ajaxlink:['misc',''],
		virframe:['misc',''],
		autocomplete:['autocomplete','autocomplete'],
		menu:['menu','menu'],
		mouse:['mouse','mouse'],
		autoexpand:['autoexpand','autoexpand']
	};
}

//扩展pa_ui
(function($){
	$.extend($.pa_ui,{
		/*帮助类*/
		util:{
			log:function(message){
				var mainDivId = "pa_ui_log";
				var contentDivId = "pa_ui_log_content";
				var buttonDivId = "pa_ui_log_button";
				var divLog = $("#" + mainDivId);
				if(divLog.length <= 0){
					$("body").append("<div id='" + mainDivId + "'></div>");
					divLog = $("#" + mainDivId);
				}

				var content = divLog.find("textarea:first").val() || "";
				content = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + (new Date().getDate()) +
					' ' + (new Date().getHours()) + ":" + (new Date().getMinutes()) + ":" + (new Date().getSeconds()) +
					' ' + (new Date().getMilliseconds()) +
					': ' + message + '\r\n' +
					content;
					
				var html = '<div id="' + contentDivId + '" class="pa_ui_log_content">' +
					'<textarea>' + content + '</textarea>' +
					'</div>' + 
					'<div id="' + buttonDivId + '" class="pa_ui_log_button">' +
					'<button onclick="$(\'#' + mainDivId +'\').remove();">关闭</button>' +
					'<button onclick="$(\'#' + contentDivId +'\').children(\'textarea\').val(\'\')">清除</button>' +
					'</div>';  //button div

				divLog.html(html);
			},

			logAll:function(object){
				if(object == null | object == undefined){
					this.log(object);
				}
				for(var key in object){
					this.log(key + "	" + object[key]);
				}
			},
			
			timeMillis:function(s) {
				if ($isEmpty(s)) return 0; 
				var date = s.split("-"); 
				return new Date(date[0],date[1],date[2],0,0,0).getTime();
			},

			safeId:function(id){
				id = id.replace(/:/g,'\\\:');
				id = id.replace(/\./g,'\\\.');
				return id;
			}
		},

		/*ui通用*/
		ui:{
			getCenter:function(el){
				var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
				var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();
				var left = (viewWidth - $(el).outerWidth())/2;
				var top = (viewHeight - $(el).outerHeight())/2
				return {'left':left,'top':top};
			},
			
			select:{
				init:function(el){
					$.pa_ui.ui.select.removeAll(el);
				},

				add:function(el,value,text){
					var item = new Option(text,value);
					el.options.add(item);
				},

				remove:function(el,index){
					el.options.remove(index);
				},

				removeAll:function(el){
					el.options.length=0;
				}
			}
		},
		
		/*加载器*/
		loader:{
			loadJs:function(file){
				var head = document.getElementsByTagName('head').item(0);
				script = document.createElement('script');
				script.src = file;
				script.type = 'text/javascript';
				head.appendChild(script);
			},

			loadCss:function(file){
				var head = document.getElementsByTagName('head').item(0);
				css = document.createElement('link');
				css.href = file;
				css.rel = 'stylesheet';
				css.type = 'text/css';
				head.appendChild(css);
			}
		},

		/*校验*/
		validator:{
			isInt:function(s){return true;},
			isEmpty:function(s) {if (s == null) return true; return (s.length == 0); },
			isBlank:function(s) {if (s == null) return true; return (s.trim().length == 0); },
			isNumeric:function(s) {var matches = /^[0-9]*$/; return (matches.test(s));},
			isCharNum:function(s) {var matches = /^[0-9a-zA-Z]*$/; return (matches.test(s));},
			isEmail:function(s) {var matches = /^[_\.0-9a-zA-Z\-]+@([_0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,3}$/;	return (matches.test(s));},
			isFloat:function(s) {var matches = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/; return (matches.test(s));},
			isPhone:function(s) {var matches=/^[0-9-;,]*$/; return (matches.test(s));},
			isMobile:function(s) {var matches=/^1[3-5]\d{9}$/; return (matches.test(s));},
			isInteger:function(s) {var matches = /^\d+$/; if (!matches.test(s) || parseInt(s,10)==0) return false; return true;},
			isHttpUrl:function(s) {var matches= /^http[s]?:\/\/[\w-]+(\.[\w-]+)+([\w-\.\/?%&=]*)?$/; return matches.test(s);},
			isDate:function(s) {
				var matches = /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/; 
				if(!matches.test(s))
					return false; 
				s = s.replace(/\-/g,'/');
				var ss = s.split('/');
				
				$.each(ss,function(i){
					ss[i] = ss[i].replace(/^0+/g,'');
				});

				if(ss[2] && (parseInt(ss[1])>0 && parseInt(ss[1])<13) && (parseInt(ss[2])>0 && parseInt(ss[2])<32) ){
					return true;
				}
				else{
					return false;
				}
			}
		},

		/*转换*/
		converter:{
			toInt : function(s) {
				var i = parseInt(s);
				return (isNaN(i)) ? 0 : i;
			},
			toFloat: function(s){
				var i = parseFloat(s);
				return (isNaN(i)) ? 0 : i;
			},
			toDate:function(s){
				if($.pa_ui.validator.isDate(s)){
					s = s.replace(/\-/ig,'/');
					var ss = s.split('/');
				
					$.each(ss,function(i){
						ss[i] = ss[i].replace(/^0+/g,'');
					});

					if(ss[2] && (parseInt(ss[1])>0 && parseInt(ss[1])<13) && (parseInt(ss[2])>0 && parseInt(ss[2])<32) ){
						return new Date(parseInt(ss[0]),parseInt(ss[1])-1,parseInt(ss[2]));
					}
					else{
						return null;
					}
				}
				else{
					return null;
				}
			}
		},

		/*widget相关*/
		widget:{
			inited:function(el){
				$.pa_ui.widget.initedCount++;

				if($.pa_ui.widget.initedCount>=$.pa_ui.widget.count){
					if(!$.pa_ui.widget.triggered){
						$('body').trigger('pawidgetloaded');
						$.pa_ui.widget.triggered = true;
					}
				}
			},

			init:function(el){
				$.pa_ui.widget.initingCount++;
			},
			
			count:0,
			initedCount:0,
			initingCount:0,
			triggered:false
		},
		
		/*加载*/
		loading:function(message,options){
			var _overlayWidth=function(){
				// handle IE 6
				if ($.browser.msie && $.browser.version < 7) {
					var scrollWidth = Math.max(
						document.documentElement.scrollWidth,
						document.body.scrollWidth
					);
					var offsetWidth = Math.max(
						document.documentElement.offsetWidth,
						document.body.offsetWidth
					);

					if (scrollWidth < offsetWidth) {
						return $(window).width() + 'px';
					} else {
						return scrollWidth + 'px';
					}
				// handle "good" browsers
				} else {
					return $(document).width() + 'px';
				}
			};

			var _overlayHeight=function(){
				// handle IE 6
				if ($.browser.msie && $.browser.version < 7) {
					var scrollHeight = Math.max(
						document.documentElement.scrollHeight,
						document.body.scrollHeight
					);
					var offsetHeight = Math.max(
						document.documentElement.offsetHeight,
						document.body.offsetHeight
					);

					if (scrollHeight < offsetHeight) {
						return $(window).height() + 'px';
					} else {
						return scrollHeight + 'px';
					}
				// handle "good" browsers
				} else {
					return $(document).height() + 'px';
				}
			};

			var _overlayResize=function(){
				this.overlay.css({
					width: 0,
					height: 0
				}).css({
					width: this._overlayWidth(),
					height: this._overlayHeight()
				});
			};

			var _close=function(){
				$message.remove();
				$overlay.remove();
				$(window).unbind('resize.loading');
				
				clearTimeout(onceTimer);
				clearInterval(multiTimer);
				if(typeof options.close === 'function'){
					options.close.call();
				}
			}

			var $message = $('<div></div>').addClass('pa_ui_loading').css({position:'absolute'}).html(message).appendTo('body');
			$message.css({'left':$.pa_ui.ui.getCenter($message[0]).left,'top':$.pa_ui.ui.getCenter($message[0]).top});
			//居中
			var $overlay = $('<div></div>').addClass('pa_ui_loading_overlay').css({position:'absolute'}).appendTo(document.body);
			$overlay.css({width:_overlayWidth(),height:_overlayHeight()});

			var onceTimer=null,multiTimer;
			//何时关闭 定时关闭/外部函数如果返回true关闭；
			if(options.interval && $.pa_ui.validator.isInt(options.interval)){
				onceTimer = setTimeout(_close,options.interval);
			}
			else{
				if(options.whenClose && typeof options.whenClose ==='function'){
					multiTimer = setInterval(function(){
						if(options.whenClose.call()===true){
							_close();
						}
					},500);
				}
			}

		},

		randomId:100000
	});
})(jQuery);

//自动加载需要的文件
(function($){
	var usedWidgets = new Array();
	var needJsFiles = new Array();
	var needCssFiles = [];

	var path = '/ui30/js/';

	if($.pa_ui.lazyLoad){
		$(document).ready(function(){
			if($.pa_ui.autoLoadJs){
				var src = $("script[src*=pa_ui.js]").attr("src");
				if(src){
					path = src.substring(0,(src.indexOf('/pa_ui.js'))) + '/';
					//定义了theme
					if(src.indexOf('?theme=')>-1 || src.indexOf('&theme=')>-1){
						theme = src.substring(src.indexOf('theme=')+6,src.length);
						if(theme.indexOf('&')>-1){
							theme = theme.substring(0,theme.indexOf('&'));
						}

						if(theme){
							$.pa_ui.theme = theme;
						}
					}
				}

				//如果定义了pa_ui_theme变量，覆盖此处定义
				if(typeof pa_ui_theme != 'undefined' && pa_ui_theme.length>0){
					$.pa_ui.theme = pa_ui_theme;
				}

				usedWidgets.push('dialog');
				$('[pa_ui_name]').each(function(){
					var ui_names = $(this).attr('pa_ui_name').split(',');
					for(var i=0;i<ui_names.length;i++){
						var ui_name = ui_names[i];
						if(ui_name==null || ui_name.length<=0){
							continue;
						}
						if($.inArray(ui_name,usedWidgets)==-1){
							usedWidgets.push(ui_name);
						}
					}
				});
				
				for(var i=0;i<usedWidgets.length;i++){
					if(usedWidgets[i]){
						if(!$.pa_ui.fileMapping[usedWidgets[i]]){
							alert('使用了不存在的pa_ui_name='+usedWidgets[i]);
							return;
						}
						var files = $.pa_ui.fileMapping[usedWidgets[i]][0].split(',');
						$.each(files,function(){
							if(this!=null && this.length>0){
								if($.inArray((this+''),needJsFiles)==-1){
									needJsFiles.push((this+''));
								}
							}
						});

						files = $.pa_ui.fileMapping[usedWidgets[i]][1].split(',');
						$.each(files,function(){
							if(this!=null || this.length>0){
								if($.inArray((this+''),needCssFiles)==-1){
									needCssFiles.push((this+''));
								}
							}
						});
					}
				}

				for(var i=0;i<needJsFiles.length;i++){
					var file = path + 'pa_ui_' + needJsFiles[i];
					if($.pa_ui.isDebug){
						file += '.source';
					}
					file += '.js';
					$.pa_ui.loader.loadJs(file);
				}

				
				if($.pa_ui.autoLoadCss){
					//js path 转到 css path
					path = path.replace(/\/js\/$/,'/themes/') + $.pa_ui.theme + '/';
					var file = path + 'pa_ui.css';
					$.pa_ui.loader.loadCss(file);
					/*只需要一个css文件
					needCssFiles.push('dialog');
					for(var i in needCssFiles){
						file = path + 'pa_ui_' + needCssFiles[i] + '.css';
						$.pa_ui.loader.loadCss(file);
					}
					*/
				}
			}
		});
	}
	else{
		if($.pa_ui.autoLoadJs){
			var scripts = document.getElementsByTagName("script");
			var src;
			for(var i=0;i<scripts.length;i++){
				if(scripts[i].src.indexOf('pa_ui.js')>0){
					src = scripts[i].src;
					break;
				}
			}
			if(src){
				path = src.substring(0,(src.indexOf('/pa_ui.js'))) + '/';
				//定义了theme
				if(src.indexOf('?theme=')>-1 || src.indexOf('&theme=')>-1){
					theme = src.substring(src.indexOf('theme=')+6,src.length);
					if(theme.indexOf('&')>-1){
						theme = theme.substring(0,theme.indexOf('&'));
					}

					if(theme){
						$.pa_ui.theme = theme;
					}
				}
			}

			//如果定义了pa_ui_theme变量，覆盖此处定义
			if(typeof pa_ui_theme != 'undefined' && pa_ui_theme.length>0){
				$.pa_ui.theme = pa_ui_theme;
			}

			usedWidgets.push('dialog');
			$('[pa_ui_name]').each(function(){
				var ui_names = $(this).attr('pa_ui_name').split(',');
				for(var i=0;i<ui_names.length;i++){
					var ui_name = ui_names[i]+'';
					if(ui_name==null || ui_name.length<=0){
						continue;
					}
					if($.inArray(ui_name,usedWidgets)==-1){
						usedWidgets.push(ui_name);
					}
				}
			});
			
			for(var i=0;i<usedWidgets.length;i++){
				if(usedWidgets[i]){
					if(!$.pa_ui.fileMapping[usedWidgets[i]]){
						alert('使用了不存在的pa_ui_name='+usedWidgets[i]);
						return;
					}
					var files = $.pa_ui.fileMapping[usedWidgets[i]][0].split(',');
					$.each(files,function(){
						if(this!=null && this.length>0){
							if($.inArray((this+''),needJsFiles)==-1){
								needJsFiles.push((this+''));
							}
						}
					});

					files = $.pa_ui.fileMapping[usedWidgets[i]][1].split(',');
					$.each(files,function(){
						if(this!=null || this.length>0){
							if($.inArray((this+''),needCssFiles)==-1){
								needCssFiles.push((this+''));
							}
						}
					});
				}
			}

			for(var i=0;i<needJsFiles.length;i++){
				var file = path + 'pa_ui_' + needJsFiles[i];
				if($.pa_ui.isDebug){
					file += '.source';
				}
				file += '.js';
				$.pa_ui.loader.loadJs(file);
			}

			
			if($.pa_ui.autoLoadCss){
				//js path 转到 css path
				path = path.replace(/\/js\/$/,'/themes/') + $.pa_ui.theme + '/';
				var file = path + 'pa_ui.css';
				$.pa_ui.loader.loadCss(file);
				/*只需要一个css文件
				needCssFiles.push('dialog');
				for(var i in needCssFiles){
					file = path + 'pa_ui_' + needCssFiles[i] + '.css';
					$.pa_ui.loader.loadCss(file);
				}
				*/
			}
		}
	}
})(jQuery);

//通用plugin
(function($){
	/*cookie操作*/
	$.cookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options = $.extend({}, options); // clone object since it's unexpected behavior if the expired property were changed
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			// NOTE Needed to parenthesize options.path and options.domain
			// in the following expressions, otherwise they evaluate to undefined
			// in the packed version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};

	/*metadata*/
	$.extend({
		metadata : {
			defaults : {
				type: 'class',
				name: 'metadata',
				cre: /({.*})/,
				single: 'metadata'
			},
			setType: function( type, name ){
				this.defaults.type = type;
				this.defaults.name = name;
			},
			get: function( elem, opts ){
				var settings = $.extend({},this.defaults,opts);
				// check for empty string in single property
				if ( !settings.single.length ) settings.single = 'metadata';

				var data = $.data(elem, settings.single);
				// returned cached data if it already exists
				if ( data ) return data;

				data = "{}";

				var getData = function(data) {
					if(typeof data != "string") return data;

					if( data.indexOf('{') < 0 ) {
						data = eval("(" + data + ")");
					}
				}

				var getObject = function(data) {
					if(typeof data != "string") return data;

					data = eval("(" + data + ")");
					return data;
				}

				if ( settings.type == "html5" ) {
					var object = {};
					$( elem.attributes ).each(function() {
						var name = this.nodeName;
						if(name.match(/^data-/)) name = name.replace(/^data-/, '');
						else return true;
						object[name] = getObject(this.nodeValue);
					});
				} 
				else {
					if ( settings.type == "class" ) {
						var m = settings.cre.exec( elem.className );
						if ( m ){
							data = m[1];
						}
					} 
					else if ( settings.type == "elem" ) {
						if( !elem.getElementsByTagName ) return;
						var e = elem.getElementsByTagName(settings.name);
						if ( e.length ){
							data = $.trim(e[0].innerHTML);
						}
					} 
					else if ( elem.getAttribute != undefined ) {
						var attr = elem.getAttribute( settings.name );
						if ( attr ){
							data = attr;
						}
					}
					object = getObject(data.indexOf("{") < 0 ? "{" + data + "}" : data);
				}

				$.data( elem, settings.single, object );
				return object;
			}
		}
	});

	/**
	 * Returns the metadata object for the first member of the jQuery object.
	 *
	 * @name metadata
	 * @descr Returns element's metadata object
	 * @param Object opts An object contianing settings to override the defaults
	 * @type jQuery
	 * @cat Plugins/Metadata
	 */
	$.fn.metadata = function( opts ){
	  return $.metadata.get( this[0], opts );
	};

	/**对IE6的fixed补丁*/
	$.fn.xFixed = function(params){  
		var defaults = {
			openMode:'absolute'
		};
		var o = $.extend(defaults,params);
		var done = false;
		//如果是IE6  
		if(($.browser.msie&&$.browser.version=='6.0')){  
			done = true;  
		}	  
		var paraPostion = o.openMode;
		return this.each(function(i,o){
			var $this = $(this);  
			if(paraPostion == 'absolute'){
				$this.css({position:'absolute'});
			}
			else {
				if(done) {  
					$this.css({position:'absolute'});   
				}  
				else {
					$this.css({position:'fixed'});  
				} 
			}
		});
	};

	/*ie6 iframe补丁*/
	$.fn.bgiframe = function(s) {
		// This is only for IE6
		if ( $.browser.msie &&  $.browser.version=="6.0" ) {  //if ( $.browser.msie && /6.0/.test(navigator.userAgent) ) {
			s = $.extend({
				top	 : 'auto', // auto == .currentStyle.borderTopWidth
				left	: 'auto', // auto == .currentStyle.borderLeftWidth
				width   : 'auto', // auto == offsetWidth
				height  : 'auto', // auto == offsetHeight
				opacity : true,
				src	 : 'javascript:false;'
			}, s || {});
			var prop = function(n){return n&&n.constructor==Number?n+'px':n;},
				html = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+
						   'style="display:block;position:absolute;z-index:-1;'+
							   (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
							   'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
							   'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
							   'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
							   'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
						'"/>';
			return this.each(function() {
				if ( $('> iframe.bgiframe', this).length == 0 )
					this.insertBefore( document.createElement(html), this.firstChild );
			});
		}
		return this;
	};

	/*iframe自动高度*/
	$.fn.autosizeiframe = function(){
		return this.each(function(){
			try{
				var iframe = this;
				var bHeight = iframe.contentWindow.document.body.scrollHeight;
				var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
				var height = Math.max(bHeight, dHeight);
				iframe.height =  height;
			}
			catch(e){

			}
		});
	};
	/*输入框选择*/
	$.widget('ui.selection',{		
			_init: function() {
			},

			get:function(){
				var e = this.element[0];
				return (

					/* mozilla / dom 3.0 */
					('selectionStart' in e && function() {
						var l = e.selectionEnd - e.selectionStart;
						return { begin: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
					}) ||

					/* exploder */
					(document.selection && function() {

						e.focus();

						var r = document.selection.createRange();
						if (r == null) {
							return { begin: 0, end: e.value.length, length: 0 }
						}

						var re = e.createTextRange();
						var rc = re.duplicate();
						re.moveToBookmark(r.getBookmark());
						rc.setEndPoint('EndToStart', re);

						return { begin: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
					}) ||

					/* browser not supported */
					function() {
						return { begin: 0, end: e.value.length, length: 0 };
					}

				)();
			},

			set:function(){
			},
			
			replace: function(){
			},

			destroy: function(){
				
			}
		}
	);

	$.extend($.ui.selection,{
		getter:'get',
		defauts:{
		}
	});

	/*元素自动覆盖*/
	$.widget("ui.cover",{
		_init:function(){
			var self = this;
			this.coverBox = $('<div></div>').addClass('pa_ui_cover_box').appendTo('body');
			this.coverDiv = $('<div></div>').addClass('pa_ui_cover').appendTo(self.coverBox);
			this.contentDiv = $('<div></div>').addClass('pa_ui_cover_content').html(self.options.message||'').appendTo(self.coverDiv);
			this.coverBox
				.width(this.element.outerWidth())
				.height(this.element.outerHeight())
				.css("top",this.element.offset().top)
				.css("left",this.element.offset().left);
			
			self.show(this.options.message);
			return self;
		},

		show:function(message){
			this.contentDiv.html(message);
			this.coverBox.show();
			return this;
		},

		close:function(){
			this.coverBox.hide();
			return this;
		},

		destroy:function(){
			this.element.removeData('cover');
			this.coverBox.remove();
			return this;
		}
	});
	/*弹出*/
	$.widget("ui.popup", {
		_init: function(){
			var self = this;

			this.offset = {top:0,left:0};
			
			this.container = $('<div class="pa_ui_popup_container"></div>')
				.hide()
				.css({position:"absolute"})
				.append(self.element.show())
				.bgiframe()
				.appendTo("body");

			//位置，默认居中
			var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
			var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();
			var left = (viewWidth - self.container.outerWidth())/2;
			var top = (viewHeight - self.container.outerHeight())/2
			//如果指定了停靠位置
			if(self.options.anchor && self.options.anchor.id){
				var $anchor = typeof self.options.anchor.id == "string" ? $("#"+self.options.anchor.id) : $(self.options.anchor.id);
				left = $anchor.offset().left;
				top = $anchor.offset().top + $anchor.outerHeight();
			
				var width = self.container.outerWidth();
				if((width + left) > viewWidth){
						var left = left - width + $anchor.outerWidth();
						if(left<0) left=0;
				}
			}

			this.offset.left = left;
			this.offset.top = top;

			self.container.css({"left":left,"top":top});
			self._isOpen = false;

			var triggerClose = this.options.triggerClose;
			if(triggerClose=='click'){
				$(document).bind('click.' + self.widgetName,function(event){
					//self.close();
				});
			}
			else if(triggerClose=='mouseout'){
				self.container.bind('mouseout.' + self.widgetName,function(event){
					//self.close();
				});
			}

			//resize
			$(window).bind('resize.popup',function(){
				self._resetPos();
			});

			return this;
		},
		
		moveToTop:function(){
			var self = this;
			self.container.css('z-index', $.ui.popup.maxZ++);
			return self;			
		},

		_adjustPos:function(){
			var self = this;
			var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
			var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();
			
			var width = this.container.outerWidth();

			if((width + this.offset.left) > viewWidth){
				this.offset.left = this.offset.left - width;
				if(self.options.anchor && self.options.anchor.id){
					var $anchor = typeof self.options.anchor.id == "string" ? $("#"+self.options.anchor.id) : $(self.options.anchor.id);
					self.offset.left = self.offset.left + $anchor.outerWidth();
				}
				if(this.offset.left<0) this.offset.left=0;
			}
			this.container.css({"left":this.offset.left,"top":this.offset.top});
		},

		/*如果选择了停靠*/
		_resetPos:function(){
			var self = this;
			if(self.options.anchor && self.options.anchor.id){
				var $anchor = typeof self.options.anchor.id == "string" ? $("#"+self.options.anchor.id) : $(self.options.anchor.id);
				self.offset.left = $anchor.offset().left;
				self.offset.top = $anchor.offset().top + $anchor.outerHeight();
				self.container.css({"left":self.offset.left,"top":self.offset.top});
			}
		},

		//事件是否在pop内发生
		containEvent:function(event){
			var contain = false;
			var el = $(event.target);
			while(el.size()>0){
				if(el[0] == this.container[0]){
					contain = true;
					break;
				}
				else{
					el = el.parent();
				}
			}

			return contain;
		},

		open: function(o){
			if(this._isOpen) return this;

			this.overlay = this.options.modal ? this._overlay() : null;
			var self = this;
			$.extend(self.options,o);
			self._resetPos();
			self._adjustPos();
			self.container.show();		
			self.moveToTop();
			self._isOpen = true;
			return self;
		},

		_overlay:function(){
			var $overlay = $('<div></div>').addClass('pa_ui_popup_overlay').appendTo(document.body)
				.css({width:this._overlayWidth(),height:this._overlayHeight()});

			return $overlay;
		},

		_overlayWidth:function(){
			// handle IE 6
			if ($.browser.msie && $.browser.version < 7) {
				var scrollWidth = Math.max(
					document.documentElement.scrollWidth,
					document.body.scrollWidth
				);
				var offsetWidth = Math.max(
					document.documentElement.offsetWidth,
					document.body.offsetWidth
				);

				if (scrollWidth < offsetWidth) {
					return $(window).width() + 'px';
				} else {
					return scrollWidth + 'px';
				}
			// handle "good" browsers
			} else {
				return $(document).width() + 'px';
			}
		},

		_overlayHeight:function(){
			// handle IE 6
			if ($.browser.msie && $.browser.version < 7) {
				var scrollHeight = Math.max(
					document.documentElement.scrollHeight,
					document.body.scrollHeight
				);
				var offsetHeight = Math.max(
					document.documentElement.offsetHeight,
					document.body.offsetHeight
				);

				if (scrollHeight < offsetHeight) {
					return $(window).height() + 'px';
				} else {
					return scrollHeight + 'px';
				}
			// handle "good" browsers
			} else {
				return $(document).height() + 'px';
			}
		},

		_overlayResize:function(){
			this.overlay.css({
				width: 0,
				height: 0
			}).css({
				width: this._overlayWidth(),
				height: this._overlayHeight()
			});
		},

		isOpen: function() {
			return this._isOpen;
		},

		top:function(t){
			this.offset.top = t;
		},

		left:function(l){
			this.offset.left = l;
		},

		close: function(){
			var self = this;
			self.container.hide().css({"left": 0, "top" : 0});
			self._isOpen = false;
		},

		destroy:function(){
			var self = this;
			self.element.unbind('remove');
			self.container.remove();
			$(window).unbind('.popup');
		}
	});

	$.extend($.ui.popup,{
		getter:"isOpen containEvent",
		defaults:{
			offsetX:0,
			offsetY:0,
			anchor:{id:null},
			modal:false, //是否模态，增加overlap
			triggerClose:null //何时关闭，null-不关闭，click-点击外部关闭，mouseout，鼠标移出关闭
		},
		
		maxZ:1000
	});

	//debug 标志
	if($.pa_ui.isDebug){
		$(document).ready(function(){
			$(document.body).append('using version:' + $.pa_ui.version + ' build:' + $.pa_ui.build);
		});
	}

	//widget 计数
	$(document).ready(function(){
		$('[pa_ui_name]').each(function(){
			var c = $(this).attr('pa_ui_name').split(',').length;
			$.pa_ui.widget.count+=c;
		});
	});
})(jQuery);