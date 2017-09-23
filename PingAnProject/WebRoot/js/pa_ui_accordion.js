(function($) {
	$.widget("ui.accordion", {
		_init: function(){
			var self = this;
			this.origin = this.element;
			if(this.element[0].tagName.toLowerCase()!='ul'){
				this.element = this.element.find('ul:eq(0)');
			}

			//平安特别处理
			this._initCss();

			//expand one node
			var node = this.origin.attr('pa_ui_expand_node');
			if(node){
				//expand all
				if(node=='0'){
					self.element.children(self.options.childTag).addClass(self.options.cssExpand).removeClass(self.options.cssCollapse);
				}
				else if(node=='-1'){
					self.element.children(self.options.childTag).addClass(self.options.cssCollapse).removeClass(self.options.cssExpand);
				}
				else{
					self.expand(node);
				}
			}
			else{
				var nodeId = this.origin.attr('pa_ui_expand_id');
				if(nodeId){
					this.element.children(self.options.childTag).each(function(index,item){
						if(item.id == nodeId){
							node = (index+1) + '';
						}
						else{
							$(self.options.childTag,item).each(function(i,j){
								if(j.id == nodeId){
									node = (index+1) + '.' + (i+1);
								}
							});
						}
					});

					if(node){
						self.expand(node);
					}
				}
			}

			self._bindElement(this.element);
			
			//all
			var allId = this.origin.attr("pa_ui_all_id");
			if(allId != null && allId.length>0){
				$("#"+allId).bind("click.accordion",function(){
					if($(this).attr('checked')==1){
						self.element.children(self.options.childTag).removeClass(self.options.cssCollapse).addClass(self.options.cssExpand);
					}
					else{
						self.element.children(self.options.childTag).removeClass(self.options.cssExpand).addClass(self.options.cssCollapse);
					}
				});
			}
		},

		/*特殊处理初始化样式*/
		_initCss:function(){
			var self = this;
			this.element.children(self.options.childTag).each(function(){
				if(!$(this).hasClass(self.options.cssExpand) &&
					!$(this).hasClass(self.options.cssCollapse)){
					if($(this).children('ul:hidden').size()>0){
						$(this).addClass(self.options.cssCollapse);
					}
					else{
						$(this).addClass(self.options.cssExpand);
					}
				}
			});
		},

		expand:function(node){
			var self = this;
			//最多两级
			var nodes = node.split('.');
			var parentEl = this.element;
			for(var i=0;i<nodes.length;i++){
				node = $.pa_ui.converter.toInt(nodes[i]);
				if(node>0){
					node--;

					parentEl.children(self.options.childTag).addClass(self.options.cssCollapse)
						.removeClass(self.options.cssExpand).removeClass('focus');
					var expandNode = parentEl.children(self.options.childTag+':eq('+node+')');
					expandNode.addClass(self.options.cssExpand).removeClass(self.options.cssCollapse);
					if(!self.origin.hasClass('pa_ui_clicked')){
						self.origin.addClass('pa_ui_clicked');
					}

					//最后一个级别
					if(i==nodes.length-1){
						expandNode.addClass('focus');
					}

					parentEl = $(self.options.contentTag,expandNode).eq(0);
					//expandNode.children(self.options.contentTag).children(self.options.thirdChildTag).removeClass('focus');
					//expandNode.children(self.options.contentTag).children(self.options.thirdChildTag).eq(node).addClass('focus');
				}
			}
			return this;
		},

		//绑定元素
		_bindElement:function(el){
			var self = this;
			var singleTriggerClass=this.origin.attr('pa_ui_single_class');
			el.children(this.options.childTag).each(function(){
				//标题部分
				$(self.options.titleTag,this).eq(0)
				.bind('click.accordion',function(event){
					//表示已经点击过了
					if(!self.origin.hasClass('pa_ui_clicked')){
						self.origin.addClass('pa_ui_clicked');
					}
					var $target = $(event.target);
					while($target.size()>0 && $target[0] != this){
						$target = $target.parent();
					}
					if($target.size()<=0){
						$target = $(this);
					}

					var $li = $target.parents(self.options.childTag+':first');

					//当前所有同级别子节点
					$li.parent().children(self.options.childTag).each(function(){
						if($target.parent()[0]!=this){
							$(this).removeClass(self.options.cssExpand).addClass(self.options.cssCollapse);
						}
					});

					//remove all focus
					self.element.find('.focus').removeClass('focus');

					$li.toggleClass(self.options.cssCollapse).toggleClass(self.options.cssExpand).addClass('focus');
					//remove all focus
					
					self._trigger('expand',null,{ui:self,li:$li});
				});
			
				//关闭
				$(this).find("."+ singleTriggerClass+':first')
				.bind('click.accordion',function(event){
					$(this).parents(self.options.childTag + ':first').removeClass(self.options.cssExpand).addClass(self.options.cssCollapse);
					return false;
				});

				//下一级别内容
				var c = $(self.options.contentTag,this);
				if(c.size()<=0){
					return;
				}
				else{
					self._bindElement(c);
				}
			});	
		},
		
		_clickTitle:function(event){
			var self = this;

		}
	});

	$.extend($.ui.accordion,{
		defaults:{
			childTag : 'li',
			titleTag : 'div',
			contentTag : 'ul',
			cssCollapse: "expand",
			cssExpand: "collapse"
		},
		load:function(){
			$('[pa_ui_name*=accordion]').each(function(){
				$.pa_ui.widget.init(this);
				var options={};
				if($(this).attr('pa_ui_first_tag')!=null && $(this).attr('pa_ui_first_tag').length>0){
					options['childTag'] = $(this).attr('pa_ui_first_tag');
				}
				if($(this).attr('pa_ui_title_tag')!=null && $(this).attr('pa_ui_title_tag').length>0){
					options['titleTag'] = $(this).attr('pa_ui_title_tag');
				}
				if($(this).attr('pa_ui_content_tag')!=null && $(this).attr('pa_ui_content_tag').length>0){
					options['contentTag'] = $(this).attr('pa_ui_content_tag');
				}
				$(this).accordion(options);
				$.pa_ui.widget.inited(this);
			});
		}
	});

	if($.pa_ui.lazyLoad){
		$(document).ready(function(){
			$.ui.accordion.load();
		});
	}
	else{
		$.ui.accordion.load();
	}
})(jQuery);