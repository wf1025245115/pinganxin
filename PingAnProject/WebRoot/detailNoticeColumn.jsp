<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
<link rel="stylesheet" href="css/ui.css" type="text/css" />
<link type="text/css" rel="Stylesheet" href="CSS/tabs.css" />
<link type="text/css" rel="Stylesheet" href="CSS/datepicker.css" />
<link type="text/css" rel="Stylesheet" href="CSS/dialog.css" />

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
<span class="separator">>></span><span class="current">公告栏管理</span>>><span
	class="current">查看公告栏</span></div>
	
<!--content end-->
<div class="formcontent">
<form name="searchform" action="#" method="post">

<div>
<div class="title2 margin">公告栏：</div>
<table class="table_form">
	<tr>
		<td class="td_title">消息标题</td>
		<td colspan="3">项目例会</td>
	</tr>
	<tr>
		<td class="td_title">消息内容</td>
		<td colspan="3">每天早上9：05开项目例会</td>
	</tr>
	<tr>
		<td class="td_title">消息备注</td>
		<td colspan="3">请大家准时参加</td>
	</tr>
	<tr>
		<td class="td_title">启用日期</td>
		<td>2010-7-1</td>
		<td class="td_title">过期日期</td>
		<td>2011-7-1</td>
	</tr>
</table>
</div>

<div class="textcenter margin"><input type="button" id="backId"
	value="返回" class="button btn_xs" />
</div>
</form>
</div>

<script language="javascript" type="text/javascript">
	//返回
	$("#backId").click( function() {
		window.history.back();
	});
</script>

</body>
</html>
