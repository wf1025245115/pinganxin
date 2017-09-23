<%@ page language="java" import="java.util.*" pageEncoding="UFT-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
<link rel="stylesheet" href="../../css/ui.css" type="text/css" />
<link type="text/css" rel="Stylesheet" href="../../CSS/tabs.css" />
<link type="text/css" rel="Stylesheet" href="../../CSS/datepicker.css" />
<link type="text/css" rel="Stylesheet" href="../../CSS/dialog.css" />

<script language="javascript" type="text/javascript"
	src="js/jQuery1.3.js"></script>
<script language="javascript" type="text/javascript"
	src="js/jquery-ui-1.7.1.js"></script>
<script language="javascript" type="text/javascript"
	src="js/pa_ui.js"></script>
<script language="javascript" type="text/javascript"
	src="js/ui.js"></script>

</head>
<body class="page">
<!--content begin-->
<div class="sitemappath">当前位置： <span class="root parent">公共设置</span>
<span class="separator">>></span><span class="current">邮件模板管理</span>>><span
	class="current">新增邮件模板</span></div>
	
<!--content end-->
<div class="formcontent">
<form name="searchform" action="#" method="post">

<div>
<div class="title2 margin">邮件模板：</div>
<table class="table_form">
	<tr>
		<td class="td_title" align="left" width="10%">模板名称</td>
		<td><input type="text"/></td>
	</tr>
	<tr>
		<td class="td_title" align="left" width="10%">模板内容</td>
		<td>
			<textarea rows="3" cols="50"></textarea>
		</td>
	</tr>
	<tr>
		<td class="td_title" align="left" width="10%">模板说明</td>
		<td colspan="3">
			<textarea rows="3" cols="50"></textarea>
		</td>
	</tr>
</table>
</div>

<div class="textcenter margin"><input type="button" id="saveId"
	value="保存" class="button btn_xs" /> <input type="button" id="backId"
	value="返回" class="button btn_xs" />
</div>
</form>
</div>

<script language="javascript" type="text/javascript">
	//保存
	$("#saveId").click( function() {
		alert("保存成功");
		window.location.href = "searchEmailModel.jsp";
	});

	//返回
	$("#backId").click( function() {
		window.history.back();
	});

</script>

</body>
</html>
