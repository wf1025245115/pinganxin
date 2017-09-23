jQuery.ui.dialog || (function($) {
	var setDataSwitch = {
		dragStart: "start.draggable",
		drag: "drag.draggable",
		dragStop: "stop.draggable",
		maxHeight: "maxHeight.resizable",
		minHeight: "minHeight.resizable",
		maxWidth: "maxWidth.resizable",
		minWidth: "minWidth.resizable",
		resizeStart: "start.resizable",
		resize: "drag.resizable",
		resizeStop: "stop.resizable"
	};
	
	$.widget("ui.dialog", {
		_init: function() {
			this.originalTitle = this.element.attr('title');
			//最大化/最小化临时保存的内容
			this.originPosition=null;

			var self = this,
			options = this.options,
			title = options.title || this.originalTitle || '',
			titleId = $.ui.dialog.getTitleId(this.element),
			uuid = (this.uuid=$.ui.dialog.uuid++),
			uiDialog = (this.uiDialog = $('<div/>'))
				.appendTo(document.body)
				.hide()
				.addClass(options.dialogClass)
				.css({
					position: options.openMode,
					overflow: 'hidden',
					zIndex: options.zIndex
				})
				//.xFixed({openMode:options.openMode})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(event) {
					(options.closeOnEscape && event.keyCode
						&& event.keyCode == $.ui.keyCode.ESCAPE && self.close(event));
				})
				.attr({
					role: 'dialog',
					'aria-labelledby': titleId
				})
				.mousedown(function(event) {
					self.moveToTop(true, event);
				}),
			/*2009-12-22 lilei232 修改dialog的dom结构*/
			uiDialogContent = this.uiDialogContent = this.element.wrapInner('<div class="pa_ui_dialog_content_content"></div>')
				.show()
				.removeAttr('title')
				.addClass('pa_ui_dialog_content')
				.appendTo(uiDialog),
			uiDialogContentRight =this.uiDialogContentRight= $('<div></div>')
				.addClass('pa_ui_dialog_content_right')
				.prependTo(uiDialogContent),
			uiDialogContentLeft =this.uiDialogContentLeft= $('<div></div>')
				.addClass('pa_ui_dialog_content_left')
				.prependTo(uiDialogContent),			
			uiDialogTitlebar = (this.uiDialogTitlebar = $('<div></div>'))
				.addClass('pa_ui_dialog_titlebar')
				.prependTo(uiDialog),			
			uiDialogTitlebarButton = $('<div></div>')
				.addClass('pa_ui_dialog_titlebar_button')
				.prependTo(uiDialogTitlebar),
			uiDialogTitlebarRight = $('<div></div>')
				.addClass('pa_ui_dialog_title_right')
				.prependTo(uiDialogTitlebar),
			uiDialogTitlebarClose = $('<a href="javascript:void(0)"/>')     //2009-12-24 lilei232 href=""修改为href="javascript:void(0)" IE6下导致页面跳转
				.addClass('pa_ui_dialog_titlebar_close')
				.attr('title',options.closeText)
				.attr('role', 'button')
				.mousedown(function(ev) {
					ev.stopPropagation();
				})
				.click(function(event) {
					self.close(event);
					return false;
				}),
			uiDialogTitlebarMin = $('<a href="javascript:void(0)"/>')
				.addClass('pa_ui_dialog_titlebar_min')
				.attr('role', 'button')
				.attr('title',options.minText)
				.mousedown(function(ev) {
					ev.stopPropagation();
				})
				.click(function(event) {
					return self.min();
				}),
			uiDialogTitlebarMax = $('<a href="javascript:void(0)"/>')
				.addClass('pa_ui_dialog_titlebar_max')
				.attr('role', 'button')
				.attr('title',options.maxText)
				.mousedown(function(ev) {
					ev.stopPropagation();
				})
				.click(function(event) {
					return self.max();
				}),
			uiDialogTitle = $('<div></div>')
				.addClass('pa_ui_dialog_title')
				.attr('id', titleId)
				.html(title)
				.prependTo(uiDialogTitlebar),			
			uiDialogTitlebarLeft = $('<div></div>')
				.addClass('pa_ui_dialog_title_left')
				.prependTo(uiDialogTitlebar);

			if(options.minimize){
				uiDialogTitlebarMin.appendTo(uiDialogTitlebarButton);
			}
			if(options.maximize){
				uiDialogTitlebarMax.appendTo(uiDialogTitlebarButton);
			}
			uiDialogTitlebarClose.appendTo(uiDialogTitlebarButton);
			
			$('<div><div class="pa_ui_dialog_footer_left"></div><div class="pa_ui_dialog_footer_right"></div></div>').addClass('pa_ui_dialog_footer').appendTo(uiDialog);

			uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();
			(options.draggable && $.fn.draggable && this._makeDraggable());
			(options.resizable && $.fn.resizable && this._makeResizable());
			this._isOpen = false;
			(options.bgiframe && $.fn.bgiframe && uiDialog.bgiframe());
			(options.autoOpen && this.open());
		},
		//新增加方法用于修正dialog内部的宽度高度
		setContnetHeightWidth:function() {
		    var height = this.uiDialogContent.find(".pa_ui_dialog_content_content").height();
		    this.uiDialogContentRight.height(height);
			this.uiDialogContentLeft.height(height);
			this.uiDialogContent.height(height);
			
			this.uiDialogContent.find(".pa_ui_dialog_content_content").width(this.uiDialog.width()-this.uiDialogContentRight.width()-this.uiDialogContentLeft.width());						
		},
		isOpen: function() {
			return this._isOpen;
		},
		open: function() {
			if (this._isOpen) { return; }
			var options = this.options,
				uiDialog = this.uiDialog;
			this.overlay = options.modal ? new $.ui.dialog.overlay(this) : null;

			//other frame overlay
			if(options.frameOverlay){
				this._frameOverlay(true);
			}

			(uiDialog.next().length && uiDialog.appendTo('body'));
			this._size();
			this._position(options.position);
			uiDialog.show(options.show);
			
			this.setContnetHeightWidth();
			

			//title
			if(uiDialog.find('.pa_ui_dialog_title').html()==''){
				setTimeout(function(){
					try{
						var iframe = uiDialog.find('iframe');
						if(iframe.length>0){
							iframe = iframe[0];
							var doc = iframe.document;
							if(iframe.contentDocument){
								doc = iframe.contentDocument;
							}
							else if(iframe.contentWindow){
								doc = iframe.contentWindow.document;
							}
							uiDialog.find('.pa_ui_dialog_title').html(doc.title);
						}
					}
					catch(ex){
					}
				},200);
			}

			this.moveToTop(true);
			// prevent tabbing out of modal dialogs
			(options.modal && uiDialog.bind('keypress.dialog', function(event) {
				if (event.keyCode != $.ui.keyCode.TAB) {
					return;
				}
				var tabbables = $(':tabbable', this),
					first = tabbables.filter(':first')[0],
					last  = tabbables.filter(':last')[0];
				if (event.target == last && !event.shiftKey) {
					setTimeout(function() {
						first.focus();
					}, 1);
				}
				else if (event.target == first && event.shiftKey) {
					setTimeout(function() {
						last.focus();
					}, 1);
				}
			}));
			// set focus to the first tabbable element in the content area or the first button
			// if there are no tabbable elements, set focus on the dialog itself
			$([])
				.add(uiDialog.find('.pa_ui_dialog_content :tabbable:first'))
				.add(uiDialog.find('.pa_ui_dialog_buttonpane :tabbable:first'))
				.add(uiDialog)
				.filter(':first')
				.focus();
			this._trigger('open');
			this._isOpen = true;

			$.ui.dialog.dialogs.push(this.element);
			if(this.options.modal){
				$.ui.dialog.modalDialogs.push(this.element);
			}
			$.ui.dialog.currentDialog = this.element;
		},
		// 移动到最上面
		moveToTop: function(force, event) {
			if ((this.options.modal && !force)
				|| (!this.options.stack && !this.options.modal)) {
				return this._trigger('focus', event);
			}
			
			if (this.options.zIndex > $.ui.dialog.maxZ) {
				$.ui.dialog.maxZ = this.options.zIndex;
			}
			(this.overlay && this.overlay.$el.css('z-index',1000));// $.ui.dialog.overlay.maxZ = ++$.ui.dialog.maxZ));
			//Save and then restore scroll since Opera 9.5+ resets when parent z-Index is changed.
			//  http://ui.jquery.com/bugs/ticket/3193
			var saveScroll = { scrollTop: this.element.attr('scrollTop'), scrollLeft: this.element.attr('scrollLeft') };
			this.uiDialog.css('z-index', ++$.ui.dialog.maxZ);
			this.element.attr(saveScroll);
			this._trigger('focus', event);
			
			//设定当前dialog
			$.ui.dialog.currentDialog = this.element;
		},
		//最小化
		min:function(){
			var self = this;
			if(self.uiDialog.hasClass(self.options.dialogClass)){
				self.uiDialog.removeClass(self.options.dialogClass).addClass(self.options.dialogClass+'_min');
				self.uiDialogContent.hide();
				self.originPosition=self.uiDialog.position();
				$.ui.dialog.minDialogs.push(self.element);
				
				var left = 0;
				for(var i=0;i<$.ui.dialog.minDialogs.length;i++){
					if($.ui.dialog.minDialogs[i]==self.element){
						
					}
					else{
						var l = $.ui.dialog.minDialogs[i].dialog('getPosition')[0];
						var t = $.ui.dialog.minDialogs[i].dialog('getPosition')[1];
						var w = $.ui.dialog.minDialogs[i].dialog('getDimension')[0]
						if(left == l){
							left += w;
						}
					}
				}
				self.uiDialog.css('left',left).css('top','').css('bottom','3px');
			}
			else if(self.uiDialog.hasClass(self.options.dialogClass+'_min')){
				self.uiDialog.removeClass(self.options.dialogClass+'_min').addClass(self.options.dialogClass);
				self.uiDialogContent.show();
				self.uiDialog.css('left',self.originPosition.left).css('top',self.originPosition.top);
				
				for(var i=0;i<$.ui.dialog.minDialogs.length;i++){
					if($.ui.dialog.minDialogs[i]==self.element){
						$.ui.dialog.minDialogs.splice(i,1);
						break;
					}
				}
			}
			//2009-12-23 lilei232 修正最大/最小化时，不能直接最小/最大化
			else if(self.uiDialog.hasClass(self.options.dialogClass+'_max')){
			    this.max();
			    this.min();
			}
			
			//2009-12-23 lilei232
			this.setContnetHeightWidth();
			return false;
		},

		//最大化
		max:function(){
			var self = this;
			if(self.uiDialog.hasClass(self.options.dialogClass)){
				self.uiDialog.removeClass(self.options.dialogClass).addClass(self.options.dialogClass+'_max');
				self.originPosition=self.uiDialog.position();
				self.originDimensions=self.getDimension();
				var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
				var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();
				self.uiDialog.css('left','0').css('top','0');
			}
			else if(self.uiDialog.hasClass(self.options.dialogClass+'_max')){
				self.uiDialog.removeClass(self.options.dialogClass+'_max').addClass(self.options.dialogClass);
				self.uiDialog.css('left',self.originPosition.left).css('top',self.originPosition.top);
					//.css('width',self.originDimensions[0]).css('height',self.originDimensions[1]);
			}
			//2009-12-23 lilei232 修正最大/最小化时，不能直接最小/最大化
			else if(self.uiDialog.hasClass(self.options.dialogClass+'_min')){
			    this.min();
			    this.max();
			}
			
			//2009-12-23 lilei232
			this.setContnetHeightWidth();
			return false;
		},

		close: function(event) {
			var self = this;
			if (false === self._trigger('beforeclose', event)) {
				return;
			}

			//从当前页面的集合中remove，并且把最后一个设定为当前dialog
			for(var i=0;i<$.ui.dialog.dialogs.length;i++){
				if($.ui.dialog.dialogs[i]==this.element){
					$.ui.dialog.dialogs.splice(i,1);
					break;
				}
			}
			for(var i=0;i<$.ui.dialog.modalDialogs.length;i++){
				if($.ui.dialog.modalDialogs[i]==this.element){
					$.ui.dialog.modalDialogs.splice(i,1);
					break;
				}
			}
			if($.ui.dialog.dialogs && $.ui.dialog.dialogs.length){
				$.ui.dialog.currentDialog = $.ui.dialog.dialogs[$.ui.dialog.dialogs.length-1];
			}
			else{
				$.ui.dialog.currentDialog = null;
			}

			//overlay
			(self.overlay && self.overlay.destroy.call(self));

			//other frames overlay
			if(self.options.frameOverlay){
				this._frameOverlay(false);
			}

			self.uiDialog.unbind('keypress.dialog');
			(self.options.hide
				? self.uiDialog.hide(self.options.hide, function() {
					self._trigger('close', event);
				})
				: self.uiDialog.hide() && self._trigger('close', event));
			$.ui.dialog.overlay.resize();
			self._isOpen = false;

			this.destroy();
		},
		destroy: function() {
			(this.overlay && this.overlay.destroy.call(this));
			this.uiDialog.hide();
			this.element
				.unbind('.dialog')
				.removeData('dialog')
				.removeClass('pa_ui_dialog_content')
				.hide().appendTo('body');	
			//IE6下面的问题，有时候会带来意想不到的问题
			if(!(jQuery.browser.msie && jQuery.browser.version<7))
			    this.uiDialog.remove();
			(this.originalTitle && this.element.attr('title', this.originalTitle));
		},
		getDimension : function() {
			return [this.uiDialog.outerWidth(),this.uiDialog.outerHeight()];
		},
		getPosition : function(){
			return [this.uiDialog.offset().left,this.uiDialog.offset().top];
		},
		_makeDraggable: function() {
			var self = this,
				options = this.options,
				heightBeforeDrag;
			this.uiDialog.draggable({
				cancel: '.pa_ui_dialog_content',
				handle: '.pa_ui_dialog_titlebar',
				containment: 'document',
				start: function() {
					heightBeforeDrag = options.height;
					$(this).height($(this).height()).addClass("pa_ui_dialog_dragging");
					(options.dragStart && options.dragStart.apply(self.element[0], arguments));
				},
				drag: function() {
					(options.drag && options.drag.apply(self.element[0], arguments));
				},
				stop: function() {
					$(this).removeClass("pa_ui_dialog_dragging").height(heightBeforeDrag);
					(options.dragStop && options.dragStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
		},
		_makeResizable: function(handles) {
			handles = (handles === undefined ? this.options.resizable : handles);
			var self = this,
				options = this.options,
				resizeHandles = typeof handles == 'string'
					? handles
					: 'n,e,s,w,se,sw,ne,nw';
			this.uiDialog.resizable({
				cancel: '.pa_ui_dialog_content',
				alsoResize: this.element,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				minWidth: options.minWidth,
				minHeight: options.minHeight,
				start: function() {
					$(this).addClass("pa_ui_dialog_resizing");
					(options.resizeStart && options.resizeStart.apply(self.element[0], arguments));
				},
				resize: function() {
					(options.resize && options.resize.apply(self.element[0], arguments));
				},
				handles: resizeHandles,
				stop: function() {
					$(this).removeClass("pa_ui_dialog_resizing");
					options.height = $(this).height();
					options.width = $(this).width();
					(options.resizeStop && options.resizeStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
		},
		_position: function(pos) {
			var wnd = $(window), doc = $(document),
				pTop = doc.scrollTop(), pLeft = doc.scrollLeft(),
				minTop = pTop;
			if ($.inArray(pos, ['center','top','right','bottom','left']) >= 0) {
				pos = [
					pos == 'right' || pos == 'left' ? pos : 'center',
					pos == 'top' || pos == 'bottom' ? pos : 'middle'
				];
			}
			if (pos.constructor != Array) {
				pos = ['center', 'middle'];
			}
			if (pos[0].constructor == Number) {
				pLeft += pos[0];
			} else {
				switch (pos[0]) {
					case 'left':
						pLeft += 0;
						break;
					case 'right':
						pLeft += wnd.width() - this.uiDialog.outerWidth();
						break;
					default:
					case 'center':
						pLeft += (wnd.width() - this.uiDialog.outerWidth()) / 2;
				}
			}
			if (pos[1].constructor == Number) {
				pTop += pos[1];
			} 
			else {
				switch (pos[1]) {
					case 'top':
						pTop += 0;
						break;
					case 'bottom':
						pTop += wnd.height() - this.uiDialog.outerHeight();
						break;
					default:
					case 'middle':
						pTop += (wnd.height() - this.uiDialog.outerHeight()) / 2;
				}
			}
			// prevent the dialog from being too high (make sure the titlebar
			// is accessible)
			pTop = Math.max(pTop, minTop);

			//如果多个dialog，判断是否有重叠的
			if($.ui.dialog.dialogs){
				for(var i=0;i<$.ui.dialog.dialogs.length;i++){
					pTop += 20;
					pLeft += 20;
				}
			}
			this.uiDialog.css({top: pTop, left: pLeft});
		},
		_setData: function(key, value){
			(setDataSwitch[key] && this.uiDialog.data(setDataSwitch[key], value));
			switch (key) {
				case "closeText":
					this.uiDialogTitlebarCloseText.text(value);
					break;
				case "minText":
					this.uiDialogTitlebarMinText.text(value);
					break;
				case "maxText":
					this.uiDialogTitlebarMaxText.text(value);
					break;
				case "dialogClass":
					this.uiDialog
						.removeClass(this.options.dialogClass)
						.addClass(value);
					break;
				case "draggable":
					(value
						? this._makeDraggable()
						: this.uiDialog.draggable('destroy'));
					break;
				case "height":
					this.uiDialog.height(value);
					break;
				case "position":
					this._position(value);
					break;
				case "resizable":
					var uiDialog = this.uiDialog,
						isResizable = this.uiDialog.is(':data(resizable)');
					// currently resizable, becoming non-resizable
					(isResizable && !value && uiDialog.resizable('destroy'));
					// currently resizable, changing handles
					(isResizable && typeof value == 'string' &&
						uiDialog.resizable('option', 'handles', value));
					// currently non-resizable, becoming resizable
					(isResizable || this._makeResizable(value));
					break;
				case "title":
					$(".pa_ui_dialog_title", this.uiDialogTitlebar).html(value || '&nbsp;');
					break;
				case "width":
					this.uiDialog.width(value);
					break;
			}
			$.widget.prototype._setData.apply(this, arguments);
		},
		_size: function() {
			/* If the user has resized the dialog, the .ui_dialog and .ui_dialog_content
			 * divs will both have width and height set, so we need to reset them
			 */
			var options = this.options;
			// reset content sizing
			this.element.css({
				height: 0,
				minHeight: 0,
				width: 'auto'
			});

			$('iframe[role=iframe]',this.uiDialogContent).css('height','0');
			// reset wrapper sizing
			// determine the height of all the non-content elements
			var nonContentHeight = this.uiDialog.css({
					height: 'auto',
					width: options.width
				})
				.height();

			this.element
				.css({
					minHeight: Math.max(options.minHeight - nonContentHeight, 0),
					height: options.height == 'auto'
						? 'auto'
						: Math.max(options.height - nonContentHeight, 0)
				});

			//内部iframe要调整高度
			$('iframe[role=iframe]',this.uiDialogContent).css('height',this.element.css('height'));
		},

		/*如果有frame，需要遮挡*/
		_frameOverlay:function(overlay){
			if(!this.otherFrames){
				this.otherFrames = this._allFrames();
			}
			if(this.options.frameOverlay){
				if(overlay){			
					for(var i =0;i<this.otherFrames.length;i++){
						var w = this.otherFrames[i];
						w.$ && w.$.ui && w.$.ui.dialog && w.$.ui.dialog.overlay(null);
					}
				}
				else{					
					for(var i =0;i<this.otherFrames.length;i++){
						var w = this.otherFrames[i];
						//本页面的模态窗口全部关闭才能close desotry
						$.ui.dialog.modalDialogs.length == 0 && w.$ && w.$.ui && w.$.ui.dialog.overlay.destroy(this);
					}
				}
			}
		},

		_allFrames:function(){
			var fs = [];
			
			if(top.frames && top.frames.length>0){
				for(var i=0;i<top.frames.length;i++){
					var f = top.frames[i];
					if(f.frames.length<=0){
						fs.push(f);
					}
					else{
						for(var j=0;j<f.frames.length;j++){
							var ff = f.frames[j];
							fs.push(ff);
						}
					}
				}
			}

			return fs;
		}
	});
	
	$.extend($.ui.dialog, {
		defaults: {
			autoOpen: true,
			bgiframe: true,
			closeOnEscape: true,
			closeText: '关闭',
			minimize:false,
			minText:'最小化',
			maximize:false,
			maxText:'最大化',
			dialogClass: 'pa_ui_dialog',
			draggable: true,
			hide: null,
			height: 'auto',
			maxHeight: false,
			maxWidth: false,
			minHeight: 5,
			minWidth: 5,
			modal: false,
			frameOverlay:'', //是否在其余frame出现遮罩层
			position: 'center',
			resizable: false,
			openMode:'absolute',
			show: null,
			stack: true,
			title: '',
			zIndex: 1000
		},
		getter: 'isOpen getDimension getPosition',

		uuid: 0,
		maxZ: 0,

		getTitleId: function($el) {
			return 'pa_ui_dialog_title_' + ($el.attr('id') || ++this.uuid);
		},

		overlay: function(dialog) {
			this.$el = $.ui.dialog.overlay.create(dialog);
		},
		
		dialogs:[],
		minDialogs:[],
		modalDialogs:[],
		currentDialog:null
	});
	
	$.extend($.ui.dialog.overlay, {
		instance:null,
		dialogInstances : [],
		maxZ: 0,
		events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
			function(event) { return event + '.dialog_overlay'; }).join(' '),
		create: function(dialog) {
			if (this.instance == null) {
				// prevent use of anchors and inputs
				// we use a setTimeout in case the overlay is created from an
				// event that we're going to be cancelling (see #2804)
				setTimeout(function() {
					$(document).bind($.ui.dialog.overlay.events, function(event) {
						var dialogZ = $(event.target).parents('.pa_ui_dialog').css('zIndex') || 0;
						return (dialogZ > $.ui.dialog.overlay.maxZ);
					});
				}, 1);

				// allow closing by pressing the escape key
				$(document).bind('keydown.dialog_overlay', function(event) {
					(dialog.options.closeOnEscape && event.keyCode
							&& event.keyCode == $.ui.keyCode.ESCAPE && dialog.close(event));
				});

				// handle window resize
				$(window).bind('resize.dialog_overlay', $.ui.dialog.overlay.resize);

				$el = $('<div></div>').appendTo(document.body)
					.addClass('pa_ui_dialog_overlay').css({
						width: this.width(),
						height: this.height()
					});

				($.fn.bgiframe && $el.bgiframe());

				this.instance = $el;
			}
			else{
				$el = this.instance;
			}

			if(dialog){
				this.dialogInstances.push(dialog.uuid);
			}

			return this.instance;
		},
		destroy: function(dialog) {
			if(this.dialogInstances){
				for(var i=0;i<this.dialogInstances.length;i++){
					if(this.dialogInstances[i]==dialog.uuid){
						this.dialogInstances.splice(i,1);
						break;
					}
				}
			}
			if ((this.dialogInstances && this.dialogInstances.length === 0 && this.instance)
				|| (!this.dialogInstances && this.instance))
				{
				$([document, window]).unbind('.dialog_overlay');
				this.instance.remove();
				this.instance=null;
			}
		},

		height: function() {
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

		width: function() {
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

		resize: function() {
			/* If the dialog is draggable and the user drags it past the
			 * right edge of the window, the document becomes wider so we
			 * need to stretch the overlay. If the user then drags the
			 * dialog back to the left, the document will become narrower,
			 * so we need to shrink the overlay to the appropriate size.
			 * This is handled by shrinking the overlay before setting it
			 * to the full document size.
			 */

			if(this.instance){
				this.instance.css({
					width: 0,
					height: 0
				}).css({
					width: $.ui.dialog.overlay.width(),
					height: $.ui.dialog.overlay.height()
				});
			}
		}
	});
	
	$.extend($.ui.dialog.overlay.prototype, {
		destroy: function() {
			$.ui.dialog.overlay.destroy(this);
		}
	});
})(jQuery);

(function($){
	$.pa_ui.dialog = {
		open : function(options){
			var $dialog;
			if(options.url){
				$dialog=$('<div></div>').html('<iframe frameBorder="no" role="iframe" width="100%" src="' + options.url + '"></iframe>').appendTo('body');
			}
			else if(options.message){
				$dialog=$('<div></div>').html(options.message)
			}
			else if(options.element){
				$dialog = $('#'+options.element);
			}
			else{
				return null;
			}

			options.autoOpen = true;
			$dialog.dialog(options);
			return $dialog;
		},

		close : function(dialog){
			var d = dialog || $.ui.dialog.currentDialog;
			if(d){
				d.dialog('close');
			}
		}
	}
})(jQuery);
