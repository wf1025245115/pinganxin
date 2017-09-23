<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
   <head>
<!-- 黄龙飞   huanglongfei -->
<link type="text/css" rel="stylesheet" href="css/ui.css" />
<link type="text/css" rel="Stylesheet" href="css/tabs.css" />
<link type="text/css" rel="Stylesheet" href="css/datepicker.css" />
<link type="text/css" rel="Stylesheet" href="css/dialog.css" />

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
<span class="separator">  >></span><span class="current">公告栏管理</span> >><span
	class="current">维护公告栏</span></div>
<!--content end-->
<div class="formcontent">
<form id="searchform" action="" method="post">
<div class="blueborder">
<div class="title2 margin">查询公告栏</div>
<table class="table_search margin">
	<tr>
		<td width="100px" class="form_text">公告标题:</td>
		<td width="120px"><input type="text" id="serviceItem"
			style="width: 120px" /></td>
		<td width="100px" class="form_text">创建时间:</td>
		<td><input type="text" name="date" id="f_date_b"
			pa_ui_name="datepicker" class="datepicker" readonly="readonly"
			pa_ui_datepicker_ifformat="%Y-%m-%d"
			pa_ui_datepicker_button="f_trigger_b"
			pa_ui_datepicker_singleclick="true" pa_ui_datepicker_step="1" /> <img
			src="images/calen_pic.gif" class="trigger" id="f_trigger_b"
			title="时间选择" /></td>
		<td width="70">到</td>
		<td><input type="text" name="date" id="f_date_b"
			pa_ui_name="datepicker" class="datepicker" readonly="readonly"
			pa_ui_datepicker_ifformat="%Y-%m-%d"
			pa_ui_datepicker_button="f_trigger_b2"
			pa_ui_datepicker_singleclick="true" pa_ui_datepicker_step="1" /> <img
			src="images/calen_pic.gif" class="trigger" id="f_trigger_b2"
			title="时间选择" /></td>

		<td width="100px" class="form_text">公告状态:</td>
		<td>
			<select style="width: 120px;">
				<option>请选择</option>
				<option>未启用</option>
				<option>使用中</option>	
				<option>已过期</option>
			</select>
		</td>
	</tr>
</table>
<div class="textcenter margin">
	<input type="button" id="submitId" value="查 询" class="button btn_xs" />
	<input type="button" id="add" value="新  增" class="button btn_xs" />
</div>
</div>
<div class="margin title2">公告栏列表</div>
<table class="table_list">
	<thead>
		<tr>
			<th width="5%">序号</th>
			<th width="13%">信息标题</th>
			<th width="8%">启用日期</th>
			<th width="8%">过期日期</th>
			<th width="11%">创建日期</th>
			<th width="8%">创建人</th>
			<th width="11%">最后更新时间</th>
			<th width="8%">最后更新人</th>
			<th width="8%">公告状态</th>
			<th width="18%">操作</th>
		</tr>
	</thead>
	<tbody id="tabValue">
		<tr>
			<td>1</td>
			<td>每周5请大家准时参加项目周例会</td>
			<td>2010-7-1</td>
			<td>2011-7-1</td>
			<td>2011-6-1 15:17:38</td>
			<td>huanglf</td>
			<td>2010-7-10 15:17:38</td>
			<td>xiaolili</td>
			<td>未启用</td>
			<td>
				<input type="button" id="detailId" value="详细信息" class="button btn_xs" />
				<input type="button" id="editId" value="修  改" class="button btn_xs" />
				<input type="button" id="deleteId" value="删  除" class="button btn_xs" />
			</td>
		</tr>
		<tr>
			<td>2</td>
			<td>下午讨论协议管理的界面原型</td>
			<td>2010-7-1</td>
			<td>2011-7-1</td>
			<td>2011-6-1 15:17:38</td>
			<td>huanglf</td>
			<td>2010-7-10 15:17:38</td>
			<td>xiaolili</td>
			<td>使用中</td>
			<td>
				<input type="button" id="detailId" value="详细信息" class="button btn_xs" />
				<input type="button" id="editId" value="修  改" class="button btn_xs" />
				<input type="button" id="deleteId" value="删  除" class="button btn_xs" />
			</td>
		</tr>
	</tbody>
</table>
<table width="100%">
	<tr>
		<td align="right"><a href="#">首页</a> <a href="#">上一页</a> <a
			href="#">下一页</a> <a href="#">末页</a> <select name="select">
			<option selected>1</option>
			<option>2</option>
			<option>3</option>
			<option>4</option>
			<option>5</option>
			<option>6</option>
			<option>7</option>
			<option>8</option>
			<option>9</option>
			<option>10</option>
		</select> 当前页 1/10</td>
	</tr>
</table>
</form>
</div>

<script type="text/javascript">
	//新增
	$("#add").click(function(){
		window.location.href = "addNoticeColumn.jsp";
	});
	
	//查询方法
	$("#submitId").live("click", function() {
		alert("查询成功");
	});

	//详细信息
	$("#detailId").live("click", function() {
		window.location.href = "detailNoticeColumn.jsp";
	});
	
	//修改
	$("#editId").live("click", function() {
		window.location.href = "editNoticeColumn.jsp";
	});

	//删除
	$("#deleteId").live("click", function() {
		if (confirm('是否要删除？')) {
			$(this).parent().parent().remove();
			alert("删除成功。");
		}
	});
</script>

</body>
</html>
