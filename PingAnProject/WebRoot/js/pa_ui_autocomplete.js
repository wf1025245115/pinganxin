(function($) {
	$.widget("ui.autocomplete",{
		_init:function() {
			if(this.element<=0){
				return;
			}
			var options = this.options|| {};
			var $this =this.$this= this.element;
			var data = this.data;

			options.data = ((typeof data == "object") && (data.constructor == Array)) ? data : null;

			// Set default values
			options.inputClass = options.inputClass || "pa_ui_ac_input";
			options.resultsClass = options.resultsClass || "pa_ui_ac_results";
			options.lineSeparator = options.lineSeparator || "\n";
			options.cellSeparator = options.cellSeparator || "|";
			options.minChars = options.minChars || 1;
			options.delay = options.delay || 400;
			options.matchCase = options.matchCase || false;
			options.matchSubset = options.matchSubset || true;
			options.matchContains = options.matchContains || true;
			options.cacheLength = options.cacheLength || 1;
			options.mustMatch = options.mustMatch || false;
			options.param = options.param || "q";
			options.extraParams = options.extraParams || {};
			options.loadingClass = options.loadingClass || "pa_ui_ac_loading";
			options.selectFirst = options.selectFirst || false;
			options.bold = options.bold || false;
			options.selectOnly = options.selectOnly || false;
			options.maxItemsToShow = options.maxItemsToShow || -1;
			options.autoFill = options.autoFill || false;
			options.width = parseInt(options.width, 10) || 0;
			
			if(this.element.length>1){
				this.element.each(function(i){
					var input = $(this);
					autocomplete(input, options);
				});		   
			} else {
				this._initClass(this.element[0],options);
			}
			return this;
		},
		_initClass:function(input, options){
			//插件初始化
			var me = this;			
			var $input = $(input).attr("autocomplete", "off");
			var options = this.options;

			if (options.inputClass) {
				$input.addClass(options.inputClass);
			}

			// 创建结果容器
			var results = $("<div></div>")[0];

			var $results = $(results);
			//样式
			$results.hide().addClass(options.resultsClass).css("position", "absolute");
			if( options.width > 0 ) {
				$results.css("width", options.width);
			}

			// 添加到body
			$("body").append(results);

			input.autocompleter = me;

			//定义变量
			var timeout = null;
			var prev = "";
			var active = -1;
			var cache = {};
			var keyb = false;
			var hasFocus = false;
			var lastKeyPressCode = null;

			// 初始化 cache
			function flushCache(){
				cache = {};
				cache.data = {};
				cache.length = 0;
			};

			flushCache();

			if( options.data != null ){
				var sFirstChar = "", stMatchSets = {}, row = [];

				// url非字符串时，设置cacheLength
				if( typeof options.url != "string" ) 
					options.cacheLength = 1;

				// 遍历数组并创建一个查找结构
				for( var i=0; i < options.data.length; i++ ){
					// 如果行是一个字符串，产生一个数组，否则
					row = ((typeof options.data[i] == "string") ? [options.data[i]] : options.data[i]);

					// 长度为零，不添加
					if( row[0].length > 0 ){
						// 第一个字符
						sFirstChar = row[0].substring(0, 1).toLowerCase();
						// 如果没有，现做一个
						if( !stMatchSets[sFirstChar] ) {
							stMatchSets[sFirstChar] = [];
						}
						// 字符串
						stMatchSets[sFirstChar].push(row);
					}
				}

				// 添加到cache
				for( var k in stMatchSets ){
					// 长度
					options.cacheLength++;
					// 添加到cache
					addToCache(k, stMatchSets[k]);
				}
			}

			$input.keydown(function(e) {
				// 最后一个按键
				lastKeyPressCode = e.keyCode;
				switch(e.keyCode) {
					case 38: // up
						e.preventDefault();
						moveSelect(-1);
						break;
					case 40: // down
						e.preventDefault();
						moveSelect(1);
						break;
					case 9:  // tab
					case 13: // return
						if( selectCurrent() ){
							//确保要blur
							$input.get(0).blur();
							e.preventDefault();
						}
						break;
					default:
						active = -1;
						if (timeout) {
							clearTimeout(timeout);
						}
						timeout = setTimeout(function(){
							onChange();
						}, options.delay);
						break;
				}
			})
			.focus(function(){
				// 跟踪是否获取焦点，如果不再具有焦点不处理
				hasFocus = true;
			})
			.blur(function() {
				// 失去焦点，隐藏结果
				hasFocus = false;
				hideResults();
			});

			hideResultsNow();

			function onChange() {
				// 忽略按键[del] [shift] [capslock]
				if( lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) ) {
					return $results.hide();
				}
				var v = $input.val();
				if (v == prev) {
					return;
				}
				prev = v;
				if (v.length >= options.minChars) {
					$input.addClass(options.loadingClass);
					requestData(v);
				} else {
					$input.removeClass(options.loadingClass);
					$results.hide();
				}
			};
			function moveSelect(step) {
				var lis = $("li", results);
				if (!lis) 
					return;
				active += step;

				if (active < 0) {
					active = 0;
				} else if (active >= lis.size()) {
					active = lis.size() - 1;
				}

				lis.removeClass("pa_ui_ac_over");

				$(lis[active]).addClass("pa_ui_ac_over");

				// IE的特殊行为
				// if (lis[active] && lis[active].scrollIntoView) {
				// 	lis[active].scrollIntoView(false);
				// }

			};

			function selectCurrent() {
				var li = $("li.pa_ui_ac_over", results)[0];
				if (!li) {
					var $li = $("li", results);
					if (options.selectOnly) {
						if ($li.length == 1) 
							li = $li[0];
					} else if (options.selectFirst) {
						li = $li[0];
					}
				}
				if (li) {
					selectItem(li);
					return true;
				} else {
					return false;
				}
			};

			function selectItem(li) {
				if (!li) {
					li = document.createElement("li");
					li.extra = [];
					li.selectValue = "";
				}
				var v = $.trim(li.selectValue ? li.selectValue : li.innerHTML);
				input.lastSelected = v;
				prev = v;
				$results.html("");
				$input.val(v);
				hideResultsNow();
				if (options.onItemSelect) {
					setTimeout(function() { 
					    options.onItemSelect(li) 
					}, 1);
				}
			};

			// 选择一个输入字符串的一部分
			function createSelection(start, end){
				// 获得对输入元素的引用
				var field = $input.get(0);
				if( field.createTextRange ){
					var selRange = field.createTextRange();
					selRange.collapse(true);
					selRange.moveStart("character", start);
					selRange.moveEnd("character", end);
					selRange.select();
				} else if( field.setSelectionRange ){
					field.setSelectionRange(start, end);
				} else {
					if( field.selectionStart ){
						field.selectionStart = start;
						field.selectionEnd = end;
					}
				}
				field.focus();
			};

			// 向input中填入第一个
			function autoFill(sValue){
				// 如果最后一个案件是退格键，不自动填入
				if( lastKeyPressCode != 8 ){
					// 填入
					$input.val($input.val() + sValue.substring(prev.length));
					// 选择不是由用户输入的部分（所以下一个字符将删除）
					createSelection(prev.length, sValue.length);
				}
			};

			function showResults() {
				// 得到的输入的位置，现在（如果DOM改变位置）
				var pos = findPos(input);
				// 要么使用指定的宽度，或表单元素上自动计算的结果
				var iWidth = (options.width > 0) ? options.width : $input.width();
				// 重定位
				$results.css({
					width: parseInt(iWidth) + "px",
					top: (pos.y + input.offsetHeight) + "px",
					left: pos.x + "px"
				}).show();
			};

			function hideResults() {
				if (timeout) {
					clearTimeout(timeout);
				}
				timeout = setTimeout(hideResultsNow, 200);
			};

			function hideResultsNow() {
				if (timeout) {
					clearTimeout(timeout);
				}
				$input.removeClass(options.loadingClass);
				if ($results.is(":visible")) {
					$results.hide();
				}
				if (options.mustMatch) {
					var v = $input.val();
					if (v != input.lastSelected) {
						selectItem(null);
					}
				}
			};

			function receiveData(q, data) {
				if (data) {
					$input.removeClass(options.loadingClass);
					results.innerHTML = "";

					// 如果失去焦点，或者如果没有匹配的，不会显示下拉结果集
					if( !hasFocus || data.length == 0 ) {
						return hideResultsNow();
					}

                    if ($.browser.msie) {
						//将IFRAME添加修补IE下select的bug
						$results.append(document.createElement('iframe'));
					}
					results.appendChild(dataToDom(q,data));
					// 自动填入
					if( options.autoFill && ($input.val().toLowerCase() == q.toLowerCase()) ) {
						autoFill(data[0][0]);
					}
					showResults();
				} else {
					hideResultsNow();
				}
			};

			function parseData(data) {
				if (!data) {
					return null;
				}
				var parsed = [];
				var rows = data.split(options.lineSeparator);
				for (var i=0; i < rows.length; i++) {
					var row = $.trim(rows[i]);
					if (row) {
						parsed[parsed.length] = row.split(options.cellSeparator);
					}
				}
				return parsed;
			};

			function dataToDom(q,data) {
				var ul = document.createElement("ul");
				var num = data.length;

				// 限制最大数量
				if( (options.maxItemsToShow > 0) && (options.maxItemsToShow < num) ) {
					num = options.maxItemsToShow;
				}

				for (var i=0; i < num; i++) {
					var row = data[i];
					if (!row) {
						continue;
					}
					var li = document.createElement("li");
					if (options.formatItem) {
						li.innerHTML = options.formatItem(row, i, num);						
					} else {
						if(options.bold) {
							li.innerHTML = row[0].replace(q,"<b>"+q+"</b>");
						} else {
							li.innerHTML = row[0];
						}						
					}
					li.selectValue = row[0];
					
					var extra = null;
					if (row.length > 1) {
						extra = [];
						for (var j=1; j < row.length; j++) {
							extra[extra.length] = row[j];
						}
					}
					li.extra = extra;
					ul.appendChild(li);
					$(li).hover(function() { 
						$("li", ul).removeClass("pa_ui_ac_over"); 
						$(this).addClass("pa_ui_ac_over"); 
						active =jQuery.inArray($(this)[0],$.makeArray($("li",ul)));// $("li", ul).indexOf($(this).get(0)); 
					},function() { 
						$(this).removeClass("pa_ui_ac_over"); 
					}
					).click(function(e) { 
						e.preventDefault(); 
						e.stopPropagation(); 
						selectItem(this); 
					});
				}
				return ul;
			};

			function requestData(q) {
				if (!options.matchCase) q = q.toLowerCase();
					var data = options.cacheLength ? loadFromCache(q) : null;
				// 接收缓存的数据
				if (data) {
					receiveData(q, data);
				// 如果有url，尝试ajax请求新数据
				} else if( (typeof options.url == "string") && (options.url.length > 0) ){
					$.get(makeUrl(q), function(data) {
						data = parseData(data);
						addToCache(q, data);
						receiveData(q, data);
					});
				// 没有数据，取消loadingclass
				} else {
					$input.removeClass(options.loadingClass);
				}
			};

			function makeUrl(q) {
				var url = options.url + "?" + options.param +"=" + encodeURI(q);
				for (var i in options.extraParams) {
					url += "&" + i + "=" + encodeURI(options.extraParams[i]);
				}
				return url;
			};

			function loadFromCache(q) {
				if (!q) 
					return null;
				if (cache.data[q]) 
					return cache.data[q];
				if (options.matchSubset) {
					for (var i = q.length - 1; i >= options.minChars; i--) {
						var qs = q.substr(0, i);
						var c = cache.data[qs];
						if (c) {
							var csub = [];
							for (var j = 0; j < c.length; j++) {
								var x = c[j];
								var x0 = x[0];
								if (matchSubset(x0, q)) {
									csub[csub.length] = x;
								}
							}
							return csub;
						}
					}
				}
				return null;
			};

			function matchSubset(s, sub) {
				if (!options.matchCase) 
					s = s.toLowerCase();
				var i = s.indexOf(sub);
				if (i == -1) 
					return false;
				return i == 0 || options.matchContains;
			};

			this.flushCache = function() {
				flushCache();
			};

			this.setExtraParams = function(p) {
				options.extraParams = p;
			};

			this.findValue = function(){
				var q = $input.val();
				if (!options.matchCase) 
					q = q.toLowerCase();
				var data = options.cacheLength ? loadFromCache(q) : null;
				if (data) {
					findValueCallback(q, data);
				} else if( (typeof options.url == "string") && (options.url.length > 0) ){
					$.get(makeUrl(q), function(data) {
						data = parseData(data)
						addToCache(q, data);
						findValueCallback(q, data);
					});
				} else {
				// no matches
					findValueCallback(q, null);
				}
			};

			function findValueCallback(q, data){
				if (data) 
					$input.removeClass(options.loadingClass);

				var num = (data) ? data.length : 0;
				var li = null;

				for (var i=0; i < num; i++) {
					var row = data[i];

					if( row[0].toLowerCase() == q.toLowerCase() ){
						li = document.createElement("li");
						
						
						if (options.formatItem) {
						    li.innerHTML = options.formatItem(row, i, num);						
					    } else {
						    if(options.bold) {
							    li.innerHTML = row[0].replace(q,"<b>"+q+"</b>");
						    } else {
							    li.innerHTML = row[0];
						    }						
					    }
					    li.selectValue = row[0];
    					/*
						if (options.formatItem) {
							li.innerHTML = options.formatItem(row, i, num);
							li.selectValue = row[0];
						} else {
							li.innerHTML = row[0];
							li.selectValue = row[0];
						}
						*/
						var extra = null;
						if( row.length > 1 ){
							extra = [];
							for (var j=1; j < row.length; j++) {
								extra[extra.length] = row[j];
							}
						}
						li.extra = extra;
					}
				}

				if( options.onFindValue )
					setTimeout(function() {
						options.onFindValue(li)
					}, 1);
			};

			function addToCache(q, data) {
				if (!data || !q || !options.cacheLength) 
					return;
				if (!cache.length || cache.length > options.cacheLength) {
					flushCache();
					cache.length++;
				} else if (!cache[q]) {
					cache.length++;
				}
				cache.data[q] = data;
			};

			function findPos(obj) {
				var curleft = obj.offsetLeft || 0;
				var curtop = obj.offsetTop || 0;
				while (obj = obj.offsetParent) {
					curleft += obj.offsetLeft
					curtop += obj.offsetTop
				}
				return {x:curleft,y:curtop};
			}
		}	
	} );

	$.extend($.ui.autocomplete,{
		defaults :{
			url : null,								//ajax url
			data : null,							//初始化数据
			inputClass :  "pa_ui_ac_input",		 	//输入框class
			resultsClass :   "pa_ui_ac_results",	//列表class
			lineSeparator :   "\n",				 	//结果集合的分割符号，例如ajax返回1111\n2222\n3333\n，则结果集合自动分割为数组["1111","2222","3333"]
			cellSeparator :   "|",				  	//单个结果内部的分割符号，如果是复杂对象集合：111|22|33\n222|33|44，则结果集合自动分割为数组[["111","22","33"],["222","33","44"]]
			minChars :   1,						 	//ajax请求的最小字符输入数量
			delay :   400,						  	//延迟请求时间，单位：毫秒
			bold : false,						   	//是否关键字加粗
			matchCase :   false,					//区分大小写
			matchSubset :   true,
			matchContains :   true,					//从缓存中读取时是否只包含该关键字即可（true）或者必须是关键字开头的（false）
			cacheLength :   1,					  	//缓存数量
			mustMatch :   false,					//表示必须匹配条目，也就是在文本框里输入的内容，必须是data参数里的数据，如果不匹配，文本框就被清空
			param : "q",							//url上参数的name
			extraParams :   {},					 	//url额外的参数
			loadingClass :   "pa_ui_ac_loading",	//加载数据时候input的class
			selectFirst :   false,				  	//回车自动选择第一个
			selectOnly :   false,				   	//只有一个结果时，返回该结果
			maxItemsToShow :   -1,				  	//max表示列表里的条目数
			autoFill :   false,					 	//自动填充
			width :   0,							//宽度
			formatItem : null,					  	//绑定的自定义填充函数，参数：row该数据项, i数据项在结果集中的索引, num结果集数目
			onItemSelect : null,					//选中后的触发事件，参数li选中的该行
			onFindValue : null					  	//找到值后的触发事件，参数li选中的该行
		},
		load:function(){
			var inited=false;
			if(!inited){
				$("[pa_ui_name*=autocomplete]").each(function(){
					//$.pa_ui.widget.init(this);

					var options = {};
					var $this = $(this);

					if($this.attr("pa_ui_autocomplete_autoFill")==="true"){
						options["autoFill"] = true ;
					}
					if($this.attr("pa_ui_autocomplete_bold")==="true"){
						options["bold"] = true ;
					}
					if($this.attr("pa_ui_autocomplete_url")){
						options["url"] = $this.attr("pa_ui_autocomplete_url");
					}
					if($this.attr("pa_ui_autocomplete_width")){
						options["width"] = parseInt($this.attr("pa_ui_autocomplete_width"),0);
					}
					if($this.attr("pa_ui_autocomplete_resultsClass")){
						options["resultsClass"] = $this.attr("pa_ui_autocomplete_resultsClass");
					}
					if($this.attr("pa_ui_autocomplete_lineSeparator")){
						options["lineSeparator"] = $this.attr("pa_ui_autocomplete_lineSeparator");
					}
					if($this.attr("pa_ui_autocomplete_cellSeparator")){
						options["cellSeparator"] = $this.attr("pa_ui_autocomplete_cellSeparator");
					}
					if($this.attr("pa_ui_autocomplete_minChars")){
						options["minChars"] = parseInt($this.attr("pa_ui_autocomplete_minChars"),1);
					}
					if($this.attr("pa_ui_autocomplete_delay")){
						options["delay"] = parseInt($this.attr("pa_ui_autocomplete_delay"),400);
					}
					if($this.attr("pa_ui_autocomplete_param")){
						options["param"] = $this.attr("pa_ui_autocomplete_param");
					}
					if($this.attr("pa_ui_autocomplete_maxItemsToShow")){
						options["maxItemsToShow"] = parseInt($this.attr("pa_ui_autocomplete_maxItemsToShow"),-1);
					}
					$this.autocomplete(options);
					$.pa_ui.widget.inited(this);
				});
			}
		}
	});

	if($.pa_ui.lazyLoad){
		$(document).ready(function(){
			$.ui.autocomplete.load();
		});
	} else{
		$.ui.autocomplete.load();
	}
 
})(jQuery);