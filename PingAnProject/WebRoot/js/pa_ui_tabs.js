/*tabs*/
(function($){
	//定义tabs widget
	$.widget("ui.tabs", {
		  //初始化
		  _init: function() {
			if (this.options.deselectable !== undefined) {
				this.options.collapsible = this.options.deselectable;
			}
			
			this.leftIndex = 0; //当前显示的左边第一个tab序号，一般是0，向左滚动的话会有变化；
			this.rightIndex = 0; //当前显示的右边li的序号，滚动的话就会变化
			this._tabify(true);

			//
		},
		 //data设值
		_setData: function(key, value) {
			if (key == 'selected') {
				if (this.options.collapsible && value == this.options.selected) {
					return;
				}
				this.select(value);
			}
			else {
				this.options[key] = value;
				if (key == 'deselectable') {
					this.options.collapsible = value;
				}
				this._tabify();
			}
		},
		//格式化ID
		_tabId: function(a) {
			return a.title && a.title.replace(/\s/g, '_').replace(/[^A-Za-z0-9\-_:\.]/g, '') ||
				this.options.idPrefix + $.data(a);
		},
		//格式化Hash数据
		_sanitizeSelector: function(hash) {
			return hash.replace(/:/g, '\\:');
		},
		//UI方法
		_ui: function(tab, panel) {
			return {
				tab: tab,
				panel: panel,
				index: this.anchors.index(tab)
			};
		},
		//清空复位
		_cleanup: function() {
			// 恢复所有初始值
			this.lis.filter('ui-state-processing=0').attr('ui-state-processing', '1')
					.find('span:data(label.tabs)')
					.each(function() {
						var el = $(this);
						el.html(el.data('label.tabs')).removeData('label.tabs');
					});
		},

		//支持滚动特性
		_scrollable: function(obj){
			var self = this;

			//增加移动按钮，都处于不可用状态
			self.appendLeft = $('.pa_ui_tabs_scrollleft',self.element[0]);
			if(self.appendLeft.length==0){
				self.appendLeft = $(this.options.appendleft).insertBefore(self.list);
			}
			self.appendLeft.addClass('pa_ui_disabled pa_ui_tabs_disabledleft');

			self.appendRight = $('.pa_ui_tabs_scrollright',self.element[0]);
			if(self.appendRight.length<=0){
				self.appendRight = $(this.options.appendright).insertBefore(self.list);
			}
			self.appendRight.addClass('pa_ui_disabled pa_ui_tabs_disabledright');

			if(this.options.scrollEvent === 'click'){
				self.appendLeft.bind('click.tabs', function(){
					self.scroll('l');
				});
				
				self.appendRight.bind('click.tabs', function(){
					self.scroll('r');
				});
			}
			else if(this.options.scrollEvent === 'mouseover'){
				var timer=null;
				self.appendLeft.bind('mouseover.tabs', function(){
					timer = setInterval(function(){self.scroll('l');},self.options.scrollInterval);
				}).bind('mouseout.tabs',function(){
					clearInterval(timer);
				});

				self.appendRight.bind('mouseover.tabs', function(){
					timer = setInterval(function(){self.scroll('r');},self.options.scrollInterval);
				}).bind('mouseout.tabs',function(){
					clearInterval(timer);
				});
			}
		},

		//滚动
		scroll:function(orientation){
			var self = this;
			var maxWidth,w,totalW;
			if(orientation==='l'){
				//可显示最大宽度
				maxWidth = self.list.parent().innerWidth();
				maxWidth = maxWidth - self.appendLeft.outerWidth({margin:true}) - self.appendRight.outerWidth({margin:true});

				w=0;
				totalW=0;

				//已经向左移动的距离
				oleft = self.list.css('left');//self.list.position().left;
				if(oleft=='auto'){
					oleft = 0;
				}
				else{
					oleft = oleft.replace('px','');
					oleft = $.pa_ui.converter.toInt(oleft);
				}
				oleft = -1 * oleft;
				self.leftIndex=-1;
				//最左侧显示的tab index,
				for(var i=0;i<=self.maxIndex;i++){
					w += self.lis.eq(i).outerWidth({margin:true});
					if(w > oleft){
						break;
					}
					else if(w == oleft){
						break;
					}
					self.leftIndex = i;	
				}

				//如果超过最大宽度，表示可以移动
				if(self.leftIndex >= 0){
					//self.leftIndex--;
					w=0;
					for(var i=0;i<=self.leftIndex;i++){
						w+= self.lis.eq(i).outerWidth({margin:true});
					}
					
					w=-1*w;
					self.list.css('left',w+'px');
				}
				
				if(self.leftIndex<0){
					self.list.css('left',0);
					self.appendLeft.addClass('pa_ui_disabled pa_ui_tabs_disabledleft');
				}	

				//右侧是否可以移动
				w=0;
				for(var i=(self.leftIndex<0?0:self.leftIndex);i<=self.maxIndex;i++){
					w += self.lis.eq(i).outerWidth({margin:true});
					if(w > maxWidth){
						self.appendRight.removeClass('pa_ui_disabled pa_ui_tabs_disabledright');
						break;
					}
				}
			}
			else{
				maxWidth = self.list.parent().width();
				maxWidth = maxWidth - self.appendLeft.outerWidth({margin:true}) - self.appendRight.outerWidth({margin:true});
				w=0;
				totalW=0;

				//已经向左移动的距离
				oleft = self.list.css('left');//self.list.position().left;
				if(oleft=='auto'){
					oleft = 0;
				}
				else{
					oleft = oleft.replace('px','');
					oleft = $.pa_ui.converter.toInt(oleft);
				}
				
				self.rightIndex=self.maxIndex;
				//最右侧显示的tab index
				w = oleft;

				for(var i=0;i<=self.maxIndex;i++){
					w += self.lis.eq(i).outerWidth({margin:true});
					if(w > maxWidth){
						break;
					}
					self.rightIndex = i;
				}

				//如果超过最大宽度，表示可以移动
				if(self.rightIndex < self.maxIndex){
					self.rightIndex++;
					w=0;
					for(var i=0;i<=self.rightIndex;i++){
						w+= self.lis.eq(i).outerWidth({margin:true});
					}

					//最大：显示的右侧最后一个在最右侧，左移的最大宽度是总宽度-可见宽度
					var ww = 00;
					for(var i=0;i<=self.maxIndex;i++){
						ww += self.lis.eq(i).outerWidth({margin:true});
					}
				
					w = Math.min(w,ww);
					w = w - maxWidth;
					w=-1*w;
					self.list.css('left',w+'px');

					self.appendLeft.removeClass('pa_ui_disabled pa_ui_tabs_disabledleft');
					//self.select(self.leftIndex);
				}
				if(self.rightIndex>=self.maxIndex){
					self.appendRight.addClass('pa_ui_disabled pa_ui_tabs_disabledright');
				}
			}
		},

		//业务处理方法
		_tabify: function(init) {

			this.list = this.element.find('ul:first');
			this.lis = $('li:has(a[href])', this.list);
			this.anchors = this.lis.map(function() { return $('a', this)[0]; });
			this.panels = $([]);
			
			//2009-12-17 lilei232 追加数组，缓存anchors上的href，用于等href指向多个Dom元素时的初始化显示隐藏
			var targethref = [];

			var self = this, o = this.options;

			//不根据宽度设定是否需要滚动，使用设定值。
			if (this.options.scroll){
				this._scrollable(this.list);
			}
			
			self.maxIndex=self.lis.length-1;

			var fragmentId = /^#.+/;
			this.anchors.each(function(i, a) {
				var href = $(a).attr('href');	
				// 格式化href的格式
				var hrefBase = href.split('#')[0], baseEl;
				if (hrefBase && (hrefBase === location.toString().split('#')[0] ||
						(baseEl = $('base')[0]) && hrefBase === baseEl.href)) {
					href = a.hash;
					a.href = href;
				}

				// 内置标签
				if (fragmentId.test(href)) {
					self.panels = self.panels.add(self._sanitizeSelector(href));
					//2009-12-17 lilei232 追加href
					targethref.push(href);
				}
				
				//href中是链接地址的格式化处理
				else if (href != '#'){ // 防止载入网页本身如果href只是“＃”
					if ($(a).parents('li:first').attr('pa_ui_url_type') != 'ajax'){
					   $.data(a, 'origin.link', $(a).clone());
					}else{
					   $.data(a, 'origin.link', '1');
					}
				  
					$.data(a, 'href.tabs', href);		
					$.data(a, 'load.tabs', href.replace(/#.*$/, ''));
				  
					var id = self._tabId(a);
					$.data(document.body, 'aaaa', '1');
					a.href = '#' + id;
					$.data(a,'old.link', id);
					var $panel = $('#' + id);
					if (!$panel.length) {
						$panel = $(o.panelTemplate).attr('id', id).addClass('pa_ui_tabs_panel')
							.insertAfter(self.panels[i - 1] || self.list);
						$panel.data('destroy.tabs', true);
					}
					self.panels = self.panels.add($panel);
					//2009-12-17 lilei232 追加dom id
					targethref.push('#' + id);
				}
				// 无效的标签href
				else {
					o.disabled.push(i);
				}
			});

			if (init) {
				// 前期加载
				this.panels.addClass('pa_ui_tabs_panel');
				var selectclass = this.options.selectedclass;
				// 选择标签
				// 使用选项卡:
				// 1. 从URL的标识符
				// 2. 从 selected 属性的 <li>
				if (o.selected === undefined) {
					if (location.hash) {
						this.anchors.each(function(i, a) {
							if (a.hash == location.hash) {
								o.selected = i;
								return false; // 跳出
							}
						});
					}
					
					if (typeof o.selected != 'number' && this.lis.filter('.'+selectclass).length) {
						o.selected = this.lis.index(this.lis.filter('.'+selectclass));
					}
					o.selected = o.selected || 0;
				}
				else if (o.selected === null) {
					o.selected = -1;
				}

				//默认为第一个标签...
				o.selected = ((o.selected >= 0 && this.anchors[o.selected]) || o.selected < 0) ? o.selected : 0;

				o.disabled = $.unique(o.disabled.concat(
					$.map(this.lis.filter('pa_ui_state_disabled=0'),
						function(n, i) { return self.lis.index(n); } )
				)).sort();

				if ($.inArray(o.selected, o.disabled) != -1) {
					o.disabled.splice($.inArray(o.selected, o.disabled), 1);
				}

				// 被选择标签焦点处理
				this.panels.addClass('pa_ui_tabs_hide');
				this.lis.removeClass(selectclass);
				if (o.selected >= 0 && this.anchors.length) {
						
					//2009-12-17 lilei232 将通过索引设置初始化显示的dom元素（不支持href指向多个dom），修改为根据selector设置
					//this.panels.eq(o.selected).removeClass('pa_ui_tabs_hide');
					//this.lis.eq(o.selected).addClass(selectclass);
					var href = targethref[o.selected];
					this.panels.filter(href).removeClass('pa_ui_tabs_hide');
					this.lis.eq(o.selected).addClass(selectclass);
					

					self.element.queue("tabs", function() {
						self._trigger('show', null, self._ui(self.anchors[o.selected], self.panels[o.selected]));
					});
					
					if(o.selected>0){
						this._fixTab();
					}
					this.load(o.selected);
				}

				if(o.scroll){
					//处理左右滚动状态是否可用，计算不滚动的状态下，最多可以显示的index
					var maxWidth = self.list.parent().innerWidth();
					maxWidth = maxWidth - self.appendLeft.outerWidth({margin:true}) - self.appendRight.outerWidth({margin:true});

					var w=0,maxIndex=0;
					for(var i=0;i<=self.maxIndex;i++){
						w += self.lis.eq(i).outerWidth({margin:true});
						if(w > maxWidth){
							break;
						}
						maxIndex= i;	
					}
					if(o.selected > maxIndex){
						self.appendLeft.removeClass('pa_ui_disabled pa_ui_tabs_disabledleft');
					}
					else{
						self.appendRight.removeClass('pa_ui_disabled pa_ui_tabs_disabledright');
					}
				}

				// 避免IE6中出现内存溢出问题
				$(window).bind('unload', function() {
					self.lis.add(self.anchors).unbind('.tabs');
					self.lis = self.anchors = self.panels = null;
				});
			}
			else {
				o.selected = this.lis.index(this.lis.filter('.'+selectclass));
			}

			//处理标签是否选中
			for (var i = 0, li; (li = this.lis[i]); i++) {
				if ($.inArray(i, o.disabled) != -1 &&
					!$(li).hasClass(selectclass)){
					$(li).attr("pa_ui_state_disabled", "0");
				}
				else{
				   $(li).attr("pa_ui_state_disabled", "1");
				}
			}

			// 如果不从缓存取就重置
			if (o.cache === false) {
				this.anchors.removeData('cache.tabs');
			}

			// event事件
			this.lis.add(this.anchors).unbind('.tabs');

			if (o.event != 'mouseover') {
				var addState = function(state, el) {
					if (el.is(':not(pa_ui_state_disabled=0)')) {
						el.attr('pa_ui_state_' + state, '0');
					}
				};
				var removeState = function(state, el) {
					el.attr('pa_ui_state_' + state, '1');
				};
				this.lis.bind('mouseover.tabs', function() {
					addState('hover', $(this));
				});
				this.lis.bind('mouseout.tabs', function() {
					removeState('hover', $(this));
				});
				this.anchors.bind('focus.tabs', function() {
					addState('focus', $(this).closest('li'));
				});
				this.anchors.bind('blur.tabs', function() {
					removeState('focus', $(this).closest('li'));
				});
			}

			// 动画效果
			var hideFx, showFx;
			if (o.fx) {
				if ($.isArray(o.fx)) {
					hideFx = o.fx[0];
					showFx = o.fx[1];
				}
				else {
					hideFx = showFx = o.fx;
				}
			}

			// 重置某些遗留下来的风格动画和防止IE的ClearType错误
			function resetStyle($el, fx) {
				$el.css({ display: '' });
				if ($.browser.msie && fx.opacity) {
					$el[0].style.removeAttribute('filter');
				}
			}
			
			// 显示标签
			var showTab = showFx ?
				function(clicked, $show) {
					$(clicked).closest('li').addClass(selectclass);
					$show.hide().removeClass('pa_ui_tabs_hide')
						.animate(showFx, showFx.duration || 'normal', function() {
							resetStyle($show, showFx);
							self._trigger('show', null, self._ui(clicked, $show[0]));
						});
				}:function(clicked, $show) {
					$(clicked).closest('li').addClass(selectclass);
					$show.removeClass('pa_ui_tabs_hide');
					self._fixTab();
					self._trigger('show', null, self._ui(clicked, $show[0]));
				};

			// 隐藏标签, $show是可选参数...
			var hideTab = hideFx ?
				function(clicked, $hide) {
					$hide.animate(hideFx, hideFx.duration || 'normal', function() {
						self.lis.removeClass(selectclass);
						$hide.addClass('pa_ui_tabs_hide');
						resetStyle($hide, hideFx);
						self.element.dequeue("tabs");
					});
				} :
				function(clicked, $hide, $show) {
					self.lis.removeClass(selectclass);
					$hide.addClass('pa_ui_tabs_hide');
					self.element.dequeue("tabs");
				};

			// 避免重复前tabifying ...
			this.anchors.bind(o.event + '.tabs', function() {
				var el = this, $li = $(this).closest('li'), $hide = self.panels.filter(':not(.pa_ui_tabs_hide)'),
						$show = $(self._sanitizeSelector(this.hash));
			  
				// 如果标签已选取，而不是失效和禁用，调返回false到此为止
				// 检查是否按处理返回false，不执行失效标签
				if (($li.hasClass(selectclass) && !o.collapsible) ||
					self._trigger('select', null, self._ui(this, $show[0])) === false) {
					this.blur();
					return false;
				}

				o.selected = self.anchors.index(this);
			   
				var oldurl = $.data(document.body, 'aaaa');

				 if (oldurl != '1')
				 {  
				   $('#'+oldurl).attr('href', '#'+oldurl).attr('target', '');
				   $('#'+oldurl).parents('li:first').removeClass(selectclass).attr('ui_state_focus', '0');
				 }

				self.abort();

				if (o.collapsible) {
					if ($li.hasClass(selectclass)) {
						o.selected = -1;

						self.element.queue("tabs", function() {
							hideTab(el, $hide);
						}).dequeue("tabs");
						
						this.blur();
						return false;
					}
					else if (!$hide.length) {
						self.element.queue("tabs", function() {
							showTab(el, $show);
						});

						self.load(self.anchors.index(this));
						
						this.blur();
						return false;
					}
				}
			   
				if ($show.length) {
					if ($hide.length) {
						self.element.queue("tabs", function() {
							hideTab(el, $hide);
						});
					}
					self.element.queue("tabs", function() {
						showTab(el, $show);
					});

					self.load(self.anchors.index(this));
				}
				else {
					throw 'jQuery UI Tabs: Mismatching fragment identifier.';
				}
				if ($.browser.msie) {
					this.blur();
				}

			});

			// 禁用单击事件
			this.anchors.bind('click.tabs', function(){return false;});
		},

		//修正标签显示，如果有滚动的话，可能左侧/右侧被挡住
		_fixTab : function() {
			var self = this;
			var o = self.options;
			if(!self.options.scroll) return;

			//滚动条隐藏的宽度
			var leftHide = self.lis.parent().position().left;
			//左侧是否被挡住了
			var w =0;
			for(var i=0;i<o.selected;i++){
				w += self.lis.eq(i).outerWidth({margin:true});
			}
			//如果当前的标签之前的全部标签宽度比lefthide还小，就有左侧被挡住；
			if(w < Math.abs(leftHide)){
				//self.appendLeft.click();
				self.list.css('left',-1*w);
			}
			else{
				//如过包括当前标签在内的全部宽度比lefthide + 外部div 宽度大，就是右侧被挡；
				w += self.lis.eq(o.selected).outerWidth({margin:true});
				var maxWidth = self.list.parent().width() - self.appendLeft.outerWidth({margin:true}) - self.appendRight.outerWidth({margin:true});
				if (w > (maxWidth+Math.abs(leftHide))){
					w = -1*(w-maxWidth)
					self.list.css('left',w);
				}
			}
		},

		destroy: function() {
			var o = this.options;

			this.abort();
			
			this.element.unbind('.tabs')
				.removeData('tabs');

			this.anchors.each(function() {
				var href = $.data(this, 'href.tabs');
				if (href) {
					this.href = href;
				}
				var $this = $(this).unbind('.tabs');
				$.each(['href', 'load', 'cache'], function(i, prefix) {
					$this.removeData(prefix + '.tabs');
				});
			});

			this.lis.unbind('.tabs').add(this.panels).each(function() {
				if ($.data(this, 'destroy.tabs')) {
					$(this).remove();
				}
				else {
					$(this).attr('pa_ui_state_disabled', '1');
					$(this).removeClass([
						o.selectedclass,
						'pa_ui_tabs_panel',
						'pa_ui_tabs_hide'
					].join(' '));
				}
			});

		},
		//增加
		add: function(url, label, index) {
			if (index === undefined) {
				index = this.anchors.length; // 设置一个默认值
			}

			var self = this, o = this.options,
				$li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label)),
				id = !url.indexOf('#') ? url.replace('#', '') : this._tabId($('a', $li)[0]);

			$li.data('destroy.tabs', true);

			var $panel = $('#' + id);
			if (!$panel.length) {
				$panel = $(o.panelTemplate).attr('id', id).data('destroy.tabs', true);
			}
			$panel.addClass('pa_ui_tabs_panel pa_ui_tabs_hide');

			if (index >= this.lis.length) {
				$li.appendTo(this.list);
				$panel.appendTo(this.list[0].parentNode);
			}
			else {
				$li.insertBefore(this.lis[index]);
				$panel.insertBefore(this.panels[index]);
			}

			o.disabled = $.map(o.disabled,
				function(n, i) { return n >= index ? ++n : n; });

			this._tabify();

			if (this.anchors.length == 1) { 
				$li.addClass(this.options.selectedclass);
				$panel.removeClass('pa_ui_tabs_hide');
				this.element.queue("tabs", function() {
					self._trigger('show', null, self._ui(self.anchors[0], self.panels[0]));
				});

				this.load(0);
			}

			// callback
			this._trigger('add', null, this._ui(this.anchors[index], this.panels[index]));
		},
		//移除标签
		remove: function(index) {
			var o = this.options, $li = this.lis.eq(index).remove(),
				$panel = this.panels.eq(index).remove();

			if ($li.hasClass(this.options.selectedclass) && this.anchors.length > 1) {
				this.select(index + (index + 1 < this.anchors.length ? 1 : -1));
			}

			o.disabled = $.map($.grep(o.disabled, function(n, i) { return n != index; }),
				function(n, i) { return n >= index ? --n : n; });

			this._tabify();

			// callback
			this._trigger('remove', null, this._ui($li.find('a')[0], $panel[0]));
		},
		//启用标签
		enable: function(index) {
			var o = this.options;
			if ($.inArray(index, o.disabled) == -1) {
				return;
			}

			this.lis.eq(index).attr('pa_ui_state_disabled', '1');
			o.disabled = $.grep(o.disabled, function(n, i) { return n != index; });

			// callback
			this._trigger('enable', null, this._ui(this.anchors[index], this.panels[index]));
		},
		//禁用标签
		disable: function(index) {
			var self = this, o = this.options;
			if (index != o.selected) { // 不能失效一个已经选择的标签
				this.lis.eq(index).attr('pa_ui_state_disabled', '0');

				o.disabled.push(index);
				o.disabled.sort();

				// callback
				this._trigger('disable', null, this._ui(this.anchors[index], this.panels[index]));
			}
		},

		//单击标签,此事件触发
		select: function(index) {
			if (typeof index == 'string') {
				index = this.anchors.index(this.anchors.filter('[href$=' + index + ']'));
			}
			else if (index === null) { //为空处理
				index = -1;
			}
			if (index == -1 && this.options.collapsible) {
				index = this.options.selected;
			}

			this.anchors.eq(index).trigger(this.options.event + '.tabs');
		},

		//HREF为URL时以AJAX的处理
		load: function(index) {

			var self = this, o = this.options, a = this.anchors.eq(index)[0], url = $.data(a, 'load.tabs');

			this.abort();
			if (!url || this.element.queue("tabs").length !== 0 && $.data(a, 'cache.tabs')) {
				this.element.dequeue("tabs");			
				return;
			}

			var url_type = this.lis.eq(index);
			var murl = $.data(a,"origin.link");
			var ourl = url_type.find('a[href]:first').attr('href');
			 
			if(murl != '1'){
				var target = murl.attr('target');
				if(target == '_blank'){
					if($.browser.msie){
						murl.appendTo("body").hide();
						murl[0].click();
					}
					else{
						//self._cleanup();
						//url_type.removeClass(this.options.selectedclass);
						//$.data(document.body, 'aaaa', ourl.substring(1));
						//url_type.find('a[href]:first').attr('id', ourl.substring(1));
						//url_type.find('a[href]:first').attr('href', url).attr('target','_blank').trigger('click');
						window.open(murl.attr('href'));
					}
				}
				else{
					location.href = murl.attr('href');
				}

				self.element.dequeue("tabs");
				return;
			}
				 
			this.lis.eq(index).attr('ui-state-processing', '0');

			if (o.spinner) {
				var span = $('span', a);
				span.data('label.tabs', span.html()).html(o.spinner);
			}
			
			this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
				url: url,
				success: function(r, s) {
					if($.data(a,"origin.link") == '1' && url_type.attr('pa_ui_url_type') == 'ajax'){
					$(self._sanitizeSelector(a.hash)).html(r);
					}
					
					self._cleanup();

					if (o.cache) {
						$.data(a, 'cache.tabs', true);
					}

					// callbacks
					self._trigger('load', null, self._ui(self.anchors[index], self.panels[index]));
					try {
						o.ajaxOptions.success(r, s);
					}
					catch (e) {}

					self.element.dequeue("tabs");  //当前标签被选中状态
				}
			}));
			 },
	  //终止所有正在运行的标签AJAX请求和动画
		abort: function() {
			this.element.queue([]);
			this.panels.stop(false, true);

			if (this.xhr) {
				this.xhr.abort();
				delete this.xhr;
			}

			this._cleanup();

		},
		//变更URL
		url: function(index, url) {
			this.anchors.eq(index).removeData('cache.tabs').data('load.tabs', url);
		},
		//取得对象长度
		length: function() {
			return this.anchors.length;
		}

	});

	//默认值
	$.extend($.ui.tabs, {
		getter: 'length',
		defaults: {
			ajaxOptions: { async: true },
			cache: false,
			collapsible: false,
			disabled: [],
			event: 'click',
			selectedclass:'focus',
			fx: null, // e.g. { height: 'toggle', opacity: 'toggle', duration: 200 }
			idPrefix: 'pa_ui_tabs_',
			panelTemplate: '<div></div>',
			spinner: '<em>Loading&#8230;</em>',
			selectedclass: 'focus',
			tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a></li>',
			length: '', //总长度
			appendleft: '<a class="pa_ui_tabs_scrollleft"></a>',
			appendright: '<a class="pa_ui_tabs_scrollright"></a>',
			scrollEvent:'click',
			scrollInterval:500
		},
		load:function(){
			$("[pa_ui_name*=tabs]").each(function(index){
				$.pa_ui.widget.init(this);
				var options = {},option;
				var self = this;
				//切换选项卡的事件
				option = $(this).attr("pa_ui_tabs_event");
				if(option){
					options['event'] = $(this).attr("pa_ui_tabs_event");
				}
				//当前选择的选项卡样式
				option = $(this).attr("pa_ui_tabs_focus");
				if(option){
					options['selectedclass'] = $(this).attr("pa_ui_tabs_focus");
				}
				//选项卡选中事件
				option = $(this).attr("pa_ui_tabs_select");
				if(option){
					options['select'] = eval(option);
				}
				//初始化选中
				option = $(this).attr("pa_ui_tabs_selectedindex");
				if(option){
					options['selected'] = $.pa_ui.converter.toInt(option);
				}

				//是否滚动
				option = $(this).attr('pa_ui_tabs_scroll');
				if(option){
					options['scroll'] = (option == 'true');
				}

				//滚动事件，click,mouseover
				option = $(this).attr('pa_ui_tabs_scrollevent');
				if(option){
					options['scrollEvent'] = option;
				}

				//滚动间隔时间，毫秒数
				option = $(this).attr('pa_ui_tabs_scrollinterval');
				if(option){
					options['scrollInterval'] = $.pa_ui.converter.toInt(option);
				}

				$(this).tabs(options);
				$.pa_ui.widget.inited(this);
				
				
				//修正高度
				//$(this).find("div.pa_ui_tabs_content>.content>.leftborder").height($(this).find("div.pa_ui_tabs_content>.content").height());
				//$(this).find("div.pa_ui_tabs_content>.content>.rightborder").height($(this).find("div.pa_ui_tabs_content>.content").height());
			});
		}
	});

	//根据属性调用接口
	if($.pa_ui.lazyLoad){
		$(document).ready( function(){
			$.ui.tabs.load();
		});
	}
	else{
		$.ui.tabs.load();
	}
})(jQuery);

