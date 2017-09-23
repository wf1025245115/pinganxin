(function($) {
	$.widget("ui.validator", {
		_init: function() {
			//form validate
			if(this.element.is('form')){
				this.form = this.element[0];
				this._buildForm();
			}
			//element validate
			else{
				//form级别的配置
				this.form = this._myForm();
				this._buildElement();
				this._initTip();
			}

			if(this.form){
				this._setFormSettings({
					form:this.form,
					summaryBox:this.options.summaryBox,
					errors:0
				});
			}
		},

		destroy: function(){
			$.widget.prototype.destroy.apply(this);
			this.element.unbind('.validator');
		},

		_buildForm:function(){
			var self = this;
			//自动校验
			if(this.options.triggerOnSubmit){
				$(this.form).bind('submit.validator',function(){
					if(self.checkForm()){
						return true;
					}
					else{
						return false;
					}
				});
			}
		},

		_buildElement:function(){
		    var _this=this;
			/*预定义类型*/
			if (this.options.preDefine){
				var preDefine = this._getPreDefine(this.options.preDefine);
				//错误消息可以改写
				//2010-7-23 lilei232
				/*
				$.each(preDefine,function(i,n){
				    $.extend(n,{
					    show:_this.options.show,
					    focus:_this.options.focus,
					    empty:_this.options.empty,
					    error:_this.options.error,
					    correct:_this.options.correct
				    });
				});*/
				this.options.preDefine =preDefine;
			}

			//检查校验规则
			if(this.options.rules){
				for(var validateType in this.options.rules){
					if(!this._isSupportType(validateType)){
						delete this.options.rules[validateType];
					}
				}
				
				//有必填字段，空触发校验
				if(this.options.rules.required){
					this.options.triggerOnEmpty = true;
				}
			}

			//增加校验事件
			this._event();
		},

		_getFormSettings : function(){
			form = this.form;
			if(form==null){
				return null;
			}
			return $.data(form,'validateSettings');
		},
		
		_setFormSettings : function(formOptions){
			var self = this;
			var settings = {
				focusError:false
			};
			formOptions = formOptions || {};
			$.extend(settings, formOptions);
			
			//每个form保存一个
			$.data(settings.form,'validateSettings',settings);
		},

		//元素对应的form
		_myForm:function(){
			var $form = this.element.parents("form:first");

			if ($form.length > 0){
				return $form[0];
			}
			else{
				return null;
			}
		},

		/*是否支持的校验类型*/
		_isSupportType : function(validateType){
			var srcTag = this.element.attr('tagName');
			var stype = this.element.attr('type');

			switch(validateType){
				case "init":
					return true;
				case "required":
					return true;
				case "input":
				case 'min':
				case 'max':
				case 'minLen':
				case 'maxLen':
					if (srcTag == "INPUT" || srcTag == "TEXTAREA" || srcTag == "SELECT"){
						return true;
					}
					else{
						return false;
					}
				case "compare":
					if (srcTag == "INPUT" || srcTag == "TEXTAREA"){
						if (stype == "checkbox" || stype == "radio"){
							return false;
						}
						else{
							return true;
						}
					}
					return false;
				case "ajax":
					if (stype == "text" || stype == "textarea" || stype == "file" || stype == "password" || stype == "select-one"){
						return true;
					}
					else{
						return false;
					}
				case "regex":
					if (srcTag == "INPUT" || srcTag == "TEXTAREA"){
						if (stype == "checkbox" || stype == "radio"){
							return false;
						}
						else{
							return true;
						}
					}
					return false;
				case "exFunction":
					return true;
				case "passwordRate":
					return true;
			}
		},

		/*设定校验规则*/
		rules:function(rules){
			if(rules){
				this.options.rules = rules;

				for(var validateType in this.options.rules){
					if(!this._isSupportType(validateType)){
						delete this.options.rules[validateType];
					}
				}
				
				//有必填字段，空触发校验
				if(this.options.rules.required){
					this.options.triggerOnEmpty = true;
				}
			}
		},

		/*预先定义的类型*/
		_getPreDefine: function(preDefineType){
		    //2010-7-23 lilei232
		    var preDefines=[];
		    $.each(preDefineType,function(i,n){		        
		        var pd = $.ui.validator.preDefines[n];
			    if(pd){
			        pd.rules.error = pd.error;
				    preDefines.push(pd);
			    }
		    });
			if(preDefines.length>0)
			    return preDefines;
			return null;
		},
		
		/*绑定校验事件*/
		_event:function(){
			//focusin focusout keyup", ":text, :password, :file, select, textarea", delegate)
			//click", ":radio, :checkbox", delegate);

			var self = this;
			/*需要绑定校验的元素*/
			var $element = self.element;

			if(self.checkable()){
				$element = self.findByName();
			}

			//focus
			if($element.is(':text,:password,:file,textarea')){
				//注册获得焦点的事件。改变提示对象的文字和样式，保存原值
				$element.bind('focus.validator',function(event){
					if(self.options.disabled){
						return;
					}

					//页面有元素要focus，不是自己，不继续
					if(pageValidator.focusElement && pageValidator.focusElement != self.element[0]){
						setTimeout(function(){pageValidator.focusElement.focus();},0);
						return false;
					}

					//上次是否校验失败，如果失败，直接显示错误信息
					if(self.lastValidateResult && !self.lastValidateResult.isValid){
						self.showMessage(self.lastValidateResult);
						self.setElState(self.options.cssElError);
					}
					else{
						self.setTipState(self.options.cssFocus,self.options.focus,self.options.cssParFocus);
						self.setElState(self.options.cssElFocus);
					}
					//清除上次校验错误
					self.lastValidateResult = null;
				});
			}

			var event = '';
			if(self.element.is(':text,:password,:file,textarea')){
				event = this.options.triggerEvent;
			}
			else if(self.element.is(':radio,:checkbox')){
				event = 'click';
			}
			else if(self.element.is('select')){
				event = 'change';
			}
			event = $.map(event.split(' '),function(item){return item + '.validator';}).join(' ');

			//注册事件进行校验，改变提示对象的文字和样式；出错就提示处理
			$element.bind(event, function(event){
				if(self.options.disabled){
					return;
				}

				self.setElState('');
				var rules = self.options.rules;
				//页面有元素要focus，不是自己
				if(pageValidator.focusElement && pageValidator.focusElement != self.element[0]){
					setTimeout(function(){pageValidator.focusElement.focus();},0);
					return false;
				}

				//是否空，空是否触发校验
				if(self.getLength()<=0 && !self.options.triggerOnEmpty){
					//校验成功
					self._trigger('empty',event,null);
					self.setElState(self.options.cssElEmpty);
					self.setTipState(self.options.cssEmpty,self.options.empty,self.options.cssParEmpty);
					return false;
				}

				//是否空，空是否触发校验事件，此参数仅用于元素的事件
				if(self.getLength()<=0 && !self.options.eventOnEmpty){
					self.setElState(self.options.cssElShow);
					self.setTipState(self.options.cssShow,self.options.show,self.options.cssParShow);					
					return false;
				}

				var isValid = self.check();
				//触发校验事件
				if(isValid){
					//校验成功
					self._trigger('correct',event,null);
					self.setElState(self.options.cssElCorrect);
				}
				else{
					//校验失败
					self._trigger('error',event,null);
					self.setElState(self.options.cssElError);
				}

				self.showMessage();

				//自动获得焦点
				if(self.options.focusError){
					pageValidator.focusElement = null;
					if(!isValid){
						pageValidator.focusElement = self.element[0];
						//setTimeout(function(){self.element[0].focus();},0);
					}
				}
			});
		},

		//初始化的
		_initTip: function(){
			//tip
			var tip = $([]);
			if(typeof this.options.tipBox === 'function'){
				tip = this.options.tipBox(this.element);
			}
			else if(this.options.tipBox){
				tip = $(this.options.tipBox);
				if(tip.length<=0){
					tip = $('#'+this.options.tipBox);
				}
			}
			this.tipBox = tip;

			//alsoTip
			var alsoTip = $([]);
			if(typeof this.options.parBox === 'function'){
				alsoTip = this.options.parBox(this.element);
			}
			else {
				if(this.options.parBox){
					alsoTip = this.element.parents(this.options.parBox);
				}
				else{
					alsoTip = this.element.parents('div:first');
				}
			}
			this.alsoTip = alsoTip;

			//初始化显示信息
			this.setTipState(this.options.cssShow,this.options.show,this.options.cssParshow);
			$(this.element).addClass(this.options.cssElShow);
		},
		
		//设置显示信息
		setTipState: function(showclass,showmsg,cssParshow){		
			var css = this.options.cssShow + ' ' +
				this.options.cssFocus + ' ' +
				this.options.cssEmpty + ' ' +
				this.options.cssCorrect + ' ' +
				this.options.cssError + ' ' + 
				this.options.cssLoading;

			var tipDiv = this.tipBox.children('.pa_ui_valid_tip');
			if(tipDiv.length<=0){
				tipDiv = $('<div></div>').addClass('pa_ui_valid_tip').appendTo(this.tipBox);
			}

			if(showmsg==null || typeof showmsg == 'undefined' || showmsg==''){
				tipDiv.hide();
			}
			else{
				tipDiv.show();
				tipDiv.removeClass(css);
				tipDiv.addClass(showclass );
				tipDiv.html( showmsg );
			}

			css = this.options.cssParFocus + ' ' + 
				this.options.cssParError + ' ' + 
				this.options.cssParCorrect + ' ' + 
				this.options.cssParEmpty + ' ' +
				this.options.cssParShow;
			this.alsoTip.removeClass(css).addClass(cssParshow);
		},

		setElState:function(c){
			var cs = this.options.cssElFocus + ' ' 
				+ this.options.cssElError + ' ' 
				+ this.options.cssElCorrect + ' ' 
				+ this.options.cssElEmpty + ' '
				+ this.options.cssElShow;
			this.element.removeClass(cs).addClass(c);
		},
		/*
		setPassWordState:function(c){
			var cs = ;
			this.element.removeClass(cs).addClass(c);
		},*/
		
		//验证单个是否验证通过
		check : function(){
			if(this.element.is('form')){
				return this.checkForm();
			}
			
			var self = this;
			var element = this.element[0];

			//if disable validate, return true
			if(self.options.disabled){
				return true;
			}

			//before valid
			var callback=true;;
			if(this.options.beforeValid){
				if(typeof this.options.beforeValid === 'function'){
					callback = this.options.beforeValid(element);
				}
				else{
					callback = eval( this.options.beforeValid + '(element)' );
				}
			}
			//停止校验
			if(!callback){
				return false;
			}

			var validateResult = {};
			validateResult.isValid = true;
			validateResult.errorMsg = "";	   //自定义错误信息

			//空不触发校验
			if(this.getLength()<=0 && !this.options.triggerOnEmpty){
				validateResult.isValid = true;
				return validateResult;
			}

			//没有校验规则
			var rules = this.options.rules;
			var preDefine = this.options.preDefine;
			if(rules==null && (preDefine==null || preDefine.length<=0 ) ){
				validateResult.isValid = true;
				return validateResult;
			}
			
			var allRules = [];
			allRules.push(rules);
			if(preDefine!=null && preDefine.length>0){
			    $.each(preDefine,function(i,n){
			        allRules.push(n.rules);
			    });
            }
			//开始循环校验
			var _this = this;
			$.each(allRules,function(i,n){	
			    rules = n;		
			    var flag = true;
			    for ( var validateType in rules){
				    var method = $.ui.validator.methods[validateType];
				    var param = rules[validateType];

				    validateResult.method = validateType;
				    if(method){
					    validateResult.isValid = method.call(_this.element[0],param);
				    }
    				
				    if(validateResult.isValid === 'pending'){
				        flag = false;
					    break;
				    }
				    else if(!validateResult.isValid) {
					    validateResult.isValid = false;
					    validateResult.errorMsg = param.error ? param.error : _this.options.error?_this.options.error:rules.error;
					    flag = false;
					    break;
				    }
				    else{
					    validateResult.isValid = true;
				    }
			    }
			    
			    if(!flag){
			        return false;
			    }
			});

			self.lastValidateResult=validateResult;

			//end valid
			callback=true;
			if(this.options.endValid){
				if(typeof this.options.endValid === 'function'){
					callback = this.options.endValid(element,validateResult.isValid);
				}
				else{
					callback = eval( this.options.endValid + '(element,validateResult.isValid)');
				}
			}
			//停止校验
			if(!callback){
				return;
			}

			return validateResult.isValid;
		},

		//验证所有需要验证的对象，并返回是否验证成功。
		checkForm : function (validatorgroup){   
			var self = this;
			form = self.form;

			var isValid = true;
			var firstElement = null; //定位到第一个错误元素
			var validateResult,setting;

			//before valid
			var callback=true;;
			if(this.options.beforeValid){
				if(typeof this.options.beforeValid === 'function'){
					callback = this.options.beforeValid(self.form);
				}
				else{
					callback = eval( this.options.beforeValid + '(self.form)' );
				}
			}
			//停止校验
			if(!callback){
				return;
			}

			var summary = $('<ul></ul>');
			var formSettings = this._getFormSettings();
			var $elements = $(this.formElements(form));

			var alertResult = "";   //2009-12-17 lilei232 alert message
			formSettings.errorCount = 0;
			$elements.each(function(i,elem){ 
				if(!$(elem).validator('check')){
					isValid = false;

					if(firstElement==null){
						firstElement = elem;
					}

					formSettings.errorCount++;
				}
				
				validateResult = $(elem).validator('showMessage').validator('getResult');

				if(validateResult && !validateResult.isValid){
					$('<li></li>').html(validateResult.errorMsg).appendTo(summary);
					alertResult += validateResult.errorMsg +"\n"; //2009-12-17 lilei232 alert message
				}
			});

			//summary
			
			 //2009-12-17 lilei232 alert message
			if(formSettings.errorCount>0 && this.options.isalert) {
				alert(alertResult);
			}
			if(formSettings.errorCount>0 && formSettings.summaryBox){
				$('#'+formSettings.summaryBox).empty().addClass('pa_ui_valid_summaryerror').append(summary);
			}
			else{
				$('#'+formSettings.summaryBox).removeClass('pa_ui_valid_summaryerror').empty();
			}

			//end valid
			callback=true;
			if(this.options.endValid){
				if(typeof this.options.endValid === 'function'){
					callback = this.options.endValid(self.form,isValid);
				}
				else{
					callback = eval( this.options.endValid + '(self.form,isValid)' );
				}
			}
			//停止校验
			if(!callback){
				return;
			}

			if(!isValid){
				if(firstElement && formSettings.focusError){
					pageValidator.focusElement = firstElement;
					setTimeout(function(){firstElement.focus();},0);
				}
			}

			return isValid;
		},

		showMessage : function(validateResult){
			var self = this;
			validateResult = validateResult || self.lastValidateResult;

			tipBox = this.options.tipBox;
			if(validateResult == null || typeof validateResult == 'undefined' || tipBox == null){
				return;
			}
			
			var isValid = validateResult.isValid;
			var msg='',css='';
			
			if(isValid === 'pending'){

			}
			else if (!isValid){		
				css = this.options.cssError;
				var cssPar = this.options.cssParError;
				msg = (validateResult.errorMsg ? validateResult.errorMsg : this.options.error);
				this.setTipState(css,msg,cssPar);
			}
			else{		
				//验证成功后,如果没有设置成功提示信息,则给出默认提示,否则给出自定义提示;允许为空,值为空的提示
				if(this.getLength()<=0){
					this.setTipState(this.options.cssEmpty,this.options.empty,this.options.cssParEmpty);
				}
				else{
					this.setTipState(this.options.cssCorrect,this.options.correct,this.options.cssParCorrect);
				}
			}
		},

		/*返回最后一次校验结果*/
		getResult: function(){
			return this.lastValidateResult;
		},
		
		checkable: function() {
			return /radio|checkbox/i.test(this.element[0].type);
		},
		
		/*same name in a form*/
		findByName: function() {
			var form = this.form;
			var name = this.element[0].name;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},

		//获取元素的长度
		getLength : function(){
			var element = this.element[0];
			switch( element.nodeName.toLowerCase()){
				case 'select':
					return $("option:selected", element).length;
				case 'input':
					if( this.checkable() )
						return this.findByName().filter(':checked').length;
			}

			value = $(element).val();
			var len=0;
			if (this.options.wordWidth > 1){
				for (var i = 0; i < value.length; i++){
					if (value.charCodeAt(i) >= 0x4e00 && value.charCodeAt(i) <= 0x9fa5){ 
						len += this.options.wordWidth;
					}
					else{
						len++;
					}
				}
			}
			else{
				len = value.length;
			}

			return len;
		},

		//获得元素的值
		getValue:function(dataType,value){
			dataType = dataType || 'string';

			if(dataType == 'date'){
				if($.pa_ui.validator.isDate(value)){
					value = $.pa_ui.converter.toDate(value);
				}
			}
			else if(dataType == 'number'){
				if($.pa_ui.validator.isNumeric(value)){
					value = Number(value).valueOf();
				}
			}
			return value;
		},

		//form参加校验的全部元素
		formElements:function(form,validatorgroup){
			return $([]).add(form.elements)
			.filter(function(){
				if($(this).data('validator') == null){
					return false;
				}
				return true;
			})
			.not(":submit, :reset, :image, [disabled]");
		}
	});

	$.extend($.ui.validator, {
		getter:'check getResult',
		defaults: {
			tipBox:'',
			parBox:'',
			isalert :false,	 //2009-12-17 lilei232 添加属性，是否在checkform的时候alert错误
			triggerEvent:"blur",
			rules:null,
			triggerOnEmpty:false,
			eventOnEmpty:true,
			focusError:false, //错误是否自动获得焦点
			triggerOnSubmit:true, //form 是否提交自动认证
			cssShow:'pa_ui_validator_onshow', //状态样式
			cssFocus:'pa_ui_validator_onfocus',
			cssCorrect:'pa_ui_validator_oncorrect',
			cssError:'pa_ui_validator_onerror',
			cssEmpty:'pa_ui_validator_onempty',
			cssLoading:'pa_ui_validator_onload',
			
			cssElEmpty:'pa_ui_element_normal', //元素状态
			cssElShow:'pa_ui_element_normal',
			cssElFocus:'pa_ui_element_focus',
			cssElCorrect:'pa_ui_element_correct',
			cssElError:'pa_ui_element_error',

			cssParShow:'pa_ui_validator_parshow', //父元素状态，也可支持非父元素
			cssParFocus:'pa_ui_validator_parfocus',
			cssParCorrect:'pa_ui_validator_parcorrect',
			cssParEmpty:'pa_ui_validator_parempty',
			cssParError:'pa_ui_validator_parerror',

			cssPassword:'pa_ui_validator_password',  //密码强度样式
			beginValid:function(){return true;},
			endValid:function(){return true;}			
		},
		methods: {
			required:function(param){
				var element = this;
				var instance = $.data(element,'validator');

				var isValid = false;
				switch( element.nodeName.toLowerCase() ) {
					case 'select':
						var options = $("option:selected", element);
						isValid =  options.length > 0 && ( element.type == "select-multiple" || ($.browser.msie && !(options[0].attributes['value'].specified) ? options[0].text : options[0].value).length > 0);
						break;
					case 'input':
						if ( instance.checkable() ){
							isValid = instance.getLength() > 0;
							break;
						}
					default:
						isValid =  $.trim($(element).val()).length > 0;
				}
				return isValid;
			},

			min:function(param){
				var element = this;
				var instance = $.data(element,'validator');
				
				var dataType = instance.options.dataType;
				var val = $(element).val();
				var min = param.value;

				val = instance.getValue(dataType,val);
				min = instance.getValue(dataType,min);

				return val >= min;
			},

			max:function(param){
				var element = this;
				var instance = $.data(element,'validator');
				var dataType = instance.options.dataType;

				var val = $(element).val();
				var max = param.value;

				val = instance.getValue(dataType,val);
				max = instance.getValue(dataType,max);

				return val <= max;
			},

			minLen:function(param){
				var element = this;
				var instance = $.data(element,'validator');
				var minLen = param.value;

				val = instance.getLength();
				minLen = instance.getValue('number',minLen);

				return val >= minLen;
			},

			maxLen:function(param){
				var element = this;
				var instance = $.data(element,'validator');
				var maxLen = param.value;

				val = instance.getLength();
				maxLen = instance.getValue('number',maxLen);

				return val <= maxLen;
			},
			
			regex:function(param){
				var element = this;
				var regexpress = param.value;
				return (new RegExp(regexpress)).test($(element).val().replace(/\s/ig,''));
			},

			//函数校验。返回true/false表示校验是否成功;返回字符串表示错误信息，校验失败;如果没有返回值表示处理函数，校验成功
			exFunction:function(param){
				var element = this;
				var $element = $(this);
				var rtn = false;

				if(typeof param.name === 'string'){
					rtn = eval( param.name + '($element.val(),element)' );
				}
				else{
					rtn = param.name($element.val(),element);
				}
				if(rtn != undefined){
					if(typeof rtn == "string"){
						isValid = false;
						param.error = rtn;
					}
					else{
						isValid = rtn;
					}
				}
				else{
					isValid = rtn;
				}
				return isValid;
			},

			//ajax校验
			ajax : function(param){
				var element = this;
				var instance = $.data(element,'validator');
				var tipBox = instance.options.tipBox;
				var $element = $(this);

				var data = {};
				data[element.name] = $(element).val();
				var msg = param.loading ? param.loading : '正在加载...';
				instance.setTipState(instance.options.cssLoading,msg);
				$.ajax({
					url: param.url,
					mode: "abort",
					cache: false,
					dataType: "json",
					data: data,
					success: function(response) {
						if(response.isValid){
							param.isValid = true;
							instance.setTipState(instance.options.cssCorrect,instance.options.correct,instance.options.cssParCorrect);
						}
						else{
							param.isValid = false;
							instance.setTipState(instance.options.cssError, response.error || instance.options.error);
						}
					}
				});
				return "pending";
			},

			compare : function(param){
				var element = this;
				var instance = $.data(element,'validator');
				var dataType = instance.options.dataType;

				var val = $(element).val();
				var compareValue = $('#'+param.element).val();

				val = instance.getValue(dataType,val);
				compareValue = instance.getValue(dataType,compareValue);
				
				var operator = param.operator || '=';
				var isValid = false;

				switch(operator){
					case "=":
						if(val == compareValue){isValid = true;}
						break;
					case "!=":
						if(val != compareValue){isValid = true;}
						break;
					case ">":
						if(val > compareValue){isValid = true;}
						break;
					case ">=":
						if(val >= compareValue){isValid = true;}
						break;
					case "<": 
						if(val < compareValue){isValid = true;}
						break;
					case "<=":
						if(val <= compareValue){isValid = true;}
						break;
				}
				return isValid;
			},

			passwordRate: function(param){
				
				var element = this;
				var instance = $.data(element,'validator');
				var pwsBox = instance.options.pwsBox;
				var pwd = $(element).val();
				var level = getLevel(pwd);

				//定义对应的消息提示
				var msg=new Array(4);
				msg[0]="太短";
				msg[1]="弱";
				msg[2]="中";
				msg[3]="强";

				$('#'+pwsBox).empty();
				var pwddiv = $('#'+pwsBox).append('<div class="level'+level+'"></div>');
				var pwdmessagediv = $('#'+pwsBox).append('<div class="pwdmsg'+level+'">'+msg[level]+'</div>');
				
				pwddiv.addClass('pa_ui_valid_pwdbox');
				
				
				//定义检测函数,返回0/1/2/3分别代表无效/差/一般/强
				function getLevel(pwd) {
					var reg1=/(^[a-z]{4,8}$)|(^[0-9]{4,8}$)/;
					var reg2=/^[A-Za-z]+[0-9]+[A-Za-z0-9]*|[0-9]+[A-Za-z]+[A-Za-z0-9]*$/;
					var reg3= /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{13,})$ /;
					if (pwd.length < 4) {
						return 0;
					}
					if (reg1.test(pwd)) {
						return 1;
					}
					if (reg2.test(pwd) && pwd.length >8) {
						return 2;
					}
					if (pwd.match(/(.[^a-z0-9])/ig) && pwd.length >12){
					   return 3;
					}
					else {
						return 1;
					}
				}
				//return isValid;
			}
		},
		//内置的校验
		preDefines:{
			integer:{
				show:'请正确输入整数',
				focus:'请正确输入整数',
				empty:'请正确输入整数',
				correct:'输入正确',
				error:'请正确输入整数',
				rules:{
					regex:{value:'^-?\\d*$',trim:'2'}
				}
			},
			email:{
				show:'请输入正确的E-mail格式，并带有@符号，不区分大小写。',
				focus:'请输入正确的E-mail格式，并带有@符号，不区分大小写。',
				empty:'请输入正确的E-mail格式，并带有@符号，不区分大小写。',
				correct:'输入正确',
				error:'请输入正确的E-mail格式，并带有@符号，不区分大小写，请检查后重新输入。',
				rules:{
					regex:{value:'^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$',trim:'2'}
				}
			},
			url:{
				show:'请正确输入url地址',
				focus:'请正确输入url地址',
				empty:'请正确输入url地址',
				correct:'输入正确',
				error:'请正确输入url地址',
				rules:{
					regex:{value:'^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&=]*)?$'}
				}
			},
			postcode:{
				show:'邮政编码只能为6位数字，有助于更快邮寄或快递。',
				focus:'邮政编码只能为6位数字，请正确填写。',
				empty:'邮政编码只能为6位数字，不能为空。',
				correct:'输入正确',
				error:'邮政编码只能为6位数字，请检查后重新输入。',
				rules:{
					regex:{value:/^\d{6}$/,trim:'2'}
				}
			},
			mobile:{
				show:'手机号码只能为11位数字。',
				focus:'手机号码只能为11位数字，请正确填写。',
				empty:'手机号码只能为11位数字，不能为空。',
				correct:'输入正确',
				error:'手机号码只能为11位数字，请重新输入。',
				rules:{
					regex:{value:/^(13|15|18)[0-9]{9}$/,trim:'2'}
				}
			},
			idcard:{
				show:'请输入身份证号码',
				focus:'请输入身份证号码',
				empty:'请输入身份证号码',
				correct:'输入正确',
				error:'请输入身份证号码',
				rules:{
					exFunction:{name:'pa_ui_validator_checkidcard',trim:'2'}
				}
			},
			currency:{
				show:'输入的货币格式不正确',
				focus:'请输入',
				empty:'请输入',
				correct:'输入正确',
				error:'输入的货币格式不正确',
				rules:{
					regex:{value:/^\d+(\.\d+)?$/,trim:'2'}
				}
			},
			plusint:{
				show:'输入的数字应该为正数',
				focus:'请输入正数',
				empty:'请输入正数',
				correct:'输入正确',
				error:'输入的数字应该为正数',
				rules:{
					regex:{value:/^\d+$/,trim:'2'}
				}
			},
			negativeint:{
				show:'输入的数字应该为负数',
				focus:'请输入负数',
				empty:'请输入负数',
				correct:'输入正确',
				error:'输入的数字应该为负数',
				rules:{
					regex:{value:/^[-]?\d+$/,trim:'2'}
				}
			},
			double:{
				show:'输入的数字应该为双精度类型',
				focus:'请输入双精度类型数字',
				empty:'请输入双精度类型数字',
				correct:'输入正确',
				error:'输入的数字应该为双精度类型',
				rules:{
					regex:{value:/^[-\+]?\d{1,15}(\.\d{1,2})?$/,trim:'2'}
				}
			},
			plusdouble:{
				show:'输入的数字应该为正数双精度类型',
				focus:'请输入正数双精度类型数字',
				empty:'请输入正数双精度类型数字',
				correct:'输入正确',
				error:'输入的数字应该为正数双精度类型',
				rules:{
					regex:{value:/^[+]?\d{1,15}(\.\d{1,2})?$/,trim:'2'}
				}
			},
			ip:{
				show:'输入的IP不正确',
				focus:'请输入IP',
				empty:'请输入IP',
				correct:'输入正确',
				error:'输入的IP不正确',
				rules:{
					regex:{value:/^([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3})$/,trim:'2'}
				}
			},
			english:{
				show:'只能输入英文字母',
				focus:'请输入英文字母',
				empty:'请输入英文字母',
				correct:'输入正确',
				error:'只能输入英文字母',
				rules:{
					regex:{value:/^[A-Za-z]+$/,trim:'2'}
				}
			},
			chinese:{
				show:'只能输入中文',
				focus:'请输入中文',
				empty:'请输入中文',
				correct:'输入正确',
				error:'只能输入中文',
				rules:{
					regex:{value:/^[\u0391-\uFFE5]+$/,trim:'2'}
				}
			},
			englishandnum:{
				show:'输入的字符职能包含英文字母和数字',
				focus:'请输入英文字母或者数字',
				empty:'请输入英文字母或者数字',
				correct:'输入正确',
				error:'输入的字符职能包含英文字母和数字',
				rules:{
					regex:{value:/^[0-9A-Za-z]+$/,trim:'2'}
				}
			},
			remark:{
				show:'备注不能多于250个字符',
				focus:'请输入备注',
				empty:'请输入备注',
				correct:'输入正确',
				error:'备注不能多于250个字符',
				rules:{
					regex:{value:/^.{0,250}$/,trim:'2'}
				}
			},
			date:{
				show:'时间格式不正确',
				focus:'请输入正确的时间格式:yyyy-MM-dd',
				empty:'请输入正确的时间格式:yyyy-MM-dd',
				correct:'输入正确',
				error:'时间格式不正确,格式为:yyyy-MM-dd',
				rules:{
					regex:{value:/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})/,trim:'2'}
				}
			},
			time:{
				show:'日期格式不正确',
				focus:'请输入正确的日期格式:yyyy-MM-dd HH:mm',
				empty:'请输入正确的日期格式:yyyy-MM-dd HH:mm',
				correct:'输入正确',
				error:'日期格式不正确,格式为:yyyy-MM-dd HH:mm',
				rules:{
					regex:{value:/^(0[1-9]|[1][0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9])$/,trim:'2'}
				}
			},
			timestamp:{
				show:'日期格式不正确',
				focus:'请输入正确的日期格式:yyyy-MM-dd HH:mm:ss',
				empty:'请输入正确的日期格式:yyyy-MM-dd HH:mm:ss',
				correct:'输入正确',
				error:'日期格式不正确,格式为:yyyy-MM-dd HH:mm:ss',
				rules:{
					regex:{value:/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/,trim:'2'}
				}
			}
		},
		loadMe:function(){
			$("[pa_ui_name*='validator']").each(function(index){
				$.pa_ui.widget.init(this);
				
				var options={},option;

				/*内置校验类型*/
				option = $(this).attr('pa_ui_valid_predefine');
				if(typeof option != 'undefined'){
				    //2010-7-23 lilei232
					options['preDefine'] = option.split(",");
				}

				/*错误消息显示的元素*/
				option = $(this).attr('pa_ui_valid_tipbox');
				if(typeof option != 'undefined'){
					options['tipBox'] = option;
				}
				
				
				/*错误消息显示的元素*/
				option = $(this).attr('pa_ui_valid_isalert');
				if(typeof option != 'undefined'){
					options['isalert'] = (option==='true');
				}
				
				

				/*密码强度显示的元素*/
				option = $(this).attr('pa_ui_valid_passwordbox');
				if(typeof option != 'undefined'){
					options['pwsBox'] = option;
				}


				/*错误消息集中显示*/
				option = $(this).attr('pa_ui_valid_summarybox');
				if(typeof option != 'undefined'){
					options['summaryBox'] = option;
				}
				
				/*数据类型，可以为number/date/string三种，用于比较大小*/
				option = $(this).attr('pa_ui_valid_datatype');
				if(typeof option != 'undefined'){
					options['dataType'] = option;
				}
				
				/*显示提示消息*/
				option = $(this).attr('pa_ui_valid_show');
				if(typeof option != 'undefined'){
					options['show'] = option;
				}
				
				/*获得焦点消息*/
				option = $(this).attr('pa_ui_valid_focus');
				if(typeof option != 'undefined'){
					options['focus'] = option;
				}
				
				/*错误消息*/
				option = $(this).attr('pa_ui_valid_error');
				if(typeof option != 'undefined'){
					options['error'] = option;
				}
				
				/*为空消息，如果可以为空的话*/
				option = $(this).attr('pa_ui_valid_empty');
				if(typeof option != 'undefined'){
					options['empty'] = option;
				}

				/*正确提示消息*/
				option = $(this).attr('pa_ui_valid_correct');
				if(typeof option != 'undefined'){
					options['correct'] = option;
				}		
				
				/*是否宽字符，一个字算两个长度*/
				option = $(this).attr('pa_ui_valid_wordwidth');
				if(typeof option != 'undefined'){
					options['wordWidth'] = $.pa_ui.converter.toInt(option)>0 ? $.pa_ui.converter.toInt(option) : 1;
				}
				
				/*值空是否触发校验*/
				option = $(this).attr('pa_ui_valid_triggeronempty');
				if(typeof option != 'undefined'){
					options['triggerOnEmpty'] = (option==='true');
				}
				
				/*校验失败是否获得焦点*/
				option = $(this).attr('pa_ui_valid_focuserror');
				if(typeof option != 'undefined'){
					options['focusError'] = (option==='true');
				}

				/*校验规则*/
				option = $(this).attr('pa_ui_valid_rules');
				if(typeof option != 'undefined'){
					options['rules'] =$(this).metadata({type:'attr',name:'pa_ui_valid_rules',single:'pa_ui_valid_rules'});
				}		

				/*校验控件组，一组控件一次校验，用于一个页面有多个form的情况*/
				option = $(this).attr('pa_ui_valid_group');
				if(typeof option != 'undefined'){
					options['group'] = option;
				}

				/*判断是否是在失去焦点后再做验证还是在按键的时候做验证*/
				option = $(this).attr('pa_ui_valid_event');
				if( option == 'keyup'){
					options['triggerEvent'] = option;
				}

				/*callback*/
				option = $(this).attr('pa_ui_valid_beforevalid');
				if(typeof option != 'undefined'){
					options['beforeValid'] = option;
				}
				option = $(this).attr('pa_ui_valid_endvalid');
				if(typeof option != 'undefined'){
					options['endValid'] = option;
				}
				
				/*提交是否自动校验*/
				option = $(this).attr('pa_ui_valid_onsubmit');
				if(typeof option != 'undefined'){
					options['triggerOnSubmit'] = option==='true';
				}
				
				
				
				/*密码强度的样式*/
				option = $(this).attr('pa_ui_valid_csspassword');
				if(typeof option != 'undefined'){
					options['cssPassword'] = option;
				}

				/*元素本身四种状态的样式*/
				option = $(this).attr('pa_ui_valid_csselcorrect');
				if(typeof option != 'undefined'){
					options['cssElCorrect'] = option;
				}
				option = $(this).attr('pa_ui_valid_csselerror');
				if(typeof option != 'undefined'){
					options['cssElError'] = option;
				}
				option = $(this).attr('pa_ui_valid_csselfocus');
				if(typeof option != 'undefined'){
					options['cssElFocus'] = option;
				}
				option = $(this).attr('pa_ui_valid_csselshow');
				if(typeof option != 'undefined'){
					options['cssElShow'] = option;
				}
				/*tipbox五种状态的样式*/
				option = $(this).attr('pa_ui_valid_cssshow');
				if(typeof option != 'undefined'){
					options['cssShow'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssfocus');
				if(typeof option != 'undefined'){
					options['cssFocus'] = option;
				}
	  			option = $(this).attr('pa_ui_valid_csscorrect');
				if(typeof option != 'undefined'){
					options['cssCorrect'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssempty');
				if(typeof option != 'undefined'){
					options['cssEmpty'] = option;
				}
				option = $(this).attr('pa_ui_valid_csserror');
				if(typeof option != 'undefined'){
					options['cssError'] = option;
				}
				/*父元素的五种状态样式*/
				option = $(this).attr('pa_ui_valid_cssparshow');
				if(typeof option != 'undefined'){
					options['cssParShow'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssparempty');
				if(typeof option != 'undefined'){
					options['cssParEmpty'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssparcorrect');
				if(typeof option != 'undefined'){
					options['cssParCorrect'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssparerror');
				if(typeof option != 'undefined'){
					options['cssParError'] = option;
				}
				option = $(this).attr('pa_ui_valid_cssparfocus');
				if(typeof option != 'undefined'){
					options['cssParFocus'] = option;
				}

				/*用户指定父元素的div，class*/
				option = $(this).attr('pa_ui_valid_parbox');
				if(typeof option != 'undefined'){
					options['parBox'] = option;
				}

				$(this).validator(options);
				$.pa_ui.widget.inited(this);
			});
		}
	});

	//页面级别的校验对象，保存页面级别的属性和函数
	var pageValidator = {
		inValids:[], //校验错误的元素
		focusElement:null, //错误后聚焦的元素
		currentForm:null, //当前校验的form
		currentElement:null //当前校验的元素
	};

	if($.pa_ui.lazyLoad){
		$(document).ready( function(){
			$.ui.validator.loadMe();
		});
	}
	else{
		$.ui.validator.loadMe();
	}

	/*内置的校验函数-身份证*/
	function pa_ui_validator_checkidcard(idcard, v){
		var Errors=new Array( 
			true, 
			"身份证号码位数不对!", 
			"身份证号码出生日期超出范围或含有非法字符!", 
			"身份证号码校验错误!", 
			"身份证地区非法!" 
		); 
		var area={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"} 
		var Y,JYM; 
		var S,M; 
		var idcard_array = new Array(); 
		idcard_array = idcard.split(""); 
		//地区检验 
		if(area[parseInt(idcard.substr(0,2))]==null) return Errors[4]; 
		//身份号码位数及格式检验 
		switch(idcard.length){ 
			case 15: 
				if ( (parseInt(idcard.substr(6,2))+1900) % 4 == 0 || ((parseInt(idcard.substr(6,2))+1900) % 100 == 0 && (parseInt(idcard.substr(6,2))+1900) % 4 == 0 )){ 
					ereg=/^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;//测试出生日期的合法性 
				} else { 
					ereg=/^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;//测试出生日期的合法性 
				} 
				if(ereg.test(idcard)){
					return Errors[0]; 
				}
				else{
					return Errors[2]; 
				}
				break; 
			case 18: 
				//18位身份号码检测 
				//出生日期的合法性检查 
				//闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9])) 
				//平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8])) 
				if ( parseInt(idcard.substr(6,4)) % 4 == 0 || (parseInt(idcard.substr(6,4)) % 100 == 0 && parseInt(idcard.substr(6,4))%4 == 0 )){ 
					ereg=/^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;//闰年出生日期的合法性正则表达式 
				}
				else { 
					ereg=/^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;//平年出生日期的合法性正则表达式 
				} 
				if(ereg.test(idcard)){//测试出生日期的合法性 
					//计算校验位 
					S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 
					+ (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 
					+ (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 
					+ (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 
					+ (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 
					+ (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 
					+ (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 
					+ parseInt(idcard_array[7]) * 1 
					+ parseInt(idcard_array[8]) * 6 
					+ parseInt(idcard_array[9]) * 3 ; 
					Y = S % 11; 
					M = "F"; 
					JYM = "10X98765432"; 
					M = JYM.substr(Y,1);//判断校验位 
					if(M == idcard_array[17]){
						return Errors[0]; //检测ID的校验位 
					}
					else{
						return Errors[3]; 
					}
				} 
				else{
					return Errors[2]; 
				}
				break; 
			default: 
				return Errors[1]; 
				break; 
		} 

		return true;
	}

	function pa_ui_validator_checktelphone(o, v){

	}

	function pa_ui_validator_checkdynaphone(o, v){

	}

	function pa_ui_validator_checkcity(o, v){

	}
})(jQuery);