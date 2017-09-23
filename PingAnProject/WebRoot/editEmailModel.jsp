<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>数据科技运营管理系统</title>
    <link rel="stylesheet" href="css/ui.css" type="text/css" />
    <link type="text/css" rel="Stylesheet" href="css/tabs.css" />
    <link type="text/css" rel="Stylesheet" href=css/datepicker.css" />
    <link type="text/css" rel="Stylesheet" href="css/dialog.css" />

    <script language="javascript" type="text/javascript" src="js/jQuery1.3.js"></script>

    <script language="javascript" type="text/javascript" src="js/jquery-ui-1.7.1.js"></script>

    <script language="javascript" type="text/javascript" src="js/pa_ui.js"></script>

    <script language="javascript" type="text/javascript" src="js/ui.js"></script>

    <script language="javascript" type="text/javascript" src="js/pa_ui_dialog.js"></script>

    <script language="javascript" type="text/javascript" src="js/pa_ui_validator.js"></script>

</head>
<!-- 黄龙飞   huanglongfei -->
<body class="page">
    <!--content begin-->
    <div class="sitemappath">
        当前位置： <span class="root parent">公共设置</span> <span class="separator">>></span><span
            class="current">邮件模板管理</span>>><span class="current">修改邮件模板</span></div>
    <!--content end-->
    <div class="formcontent">
        <form id="searchform"  method="post" pa_ui_name="validator"
            pa_ui_valid_onsubmit="true" pa_ui_valid_isalert="true">
            <div>
                <div class="title2 margin">
                    邮件模板：</div>
                <table class="table_form">
                    <tr>
                        <td class="td_title" align="left" width="10%">
                            模板名称</td>
                        <td>
                            <input type="text" name='templateName' value='协议终止提醒邮件模板2' maxlength="18" style="width: 50%;"
                                pa_ui_name="validator" pa_ui_valid_predefine="english,plusint" pa_ui_valid_rules="{required:{error:'请输入模板名称。'}}" />
                        </td>
                    </tr>
                    <tr>
                        <td class="td_title" align="left" width="10%">
                            模板内容</td>
                        <td>
                            <input type="text" name='templateContent' value='您好，**服务项目于**年**月**日**新增，请进入***地址审批。'
                                maxlength="18" style="width: 50%;"   pa_ui_name="validator"  pa_ui_valid_rules="{required:{error:'请输入模板内容。'}}"
                                />
                        </td>
                    </tr>
                    <tr>
                        <td class="td_title" align="left" width="10%">
                            模板说明</td>
                        <td colspan="3">
                            <textarea rows="3" name="templateRemark">新增服务项目成功后，系统自动发提醒邮件至审核人邮箱</textarea>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="textcenter margin">
                <input type="submit" id="saveId" value="保存" class="button btn_xs" />
                <input type="button" id="backId" value="返回" class="button btn_xs" /></div>
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
