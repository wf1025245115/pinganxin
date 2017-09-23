$(document).ready( function(){
    var miniHeight = 650;//iframe页面最小高度;
    //调整iframe页面自适应高度
    if(self!=null && self.frameElement!=null) {        
        var targWin =$( $(self)[0].parent.document.all( $(self).attr("frameElement").id ) );              
        if(targWin != null && targWin.length>0){        	
            var height = Math.max(self.document.body.scrollHeight,self.document.body.offsetHeight);            
            if (targWin[0].contentDocument && targWin[0].contentDocument.documentElement.offsetHeight){  
                height = Math.max(targWin[0].contentDocument.documentElement.offsetHeight ,targWin[0].contentDocument.documentElement.scrollHeight);                  
            }     
            
            if(height < miniHeight){
                height = miniHeight;
            } //不小于 
            else{
                //height+=5;     
            }
            targWin.height(height);//targWin.style.pixelHeight = HeightValue;            
        }
    }  
    //tab页面跳转
    $(".pa_ui_tabs ul.tabs>li a[src]").each(function() {
        var anchor = $(this);
        anchor.bind("click",function() {
            $("#ifFrame").attr("src", $(this).attr("src"));
        } );
    }); 
    
     // switch
    $(".pa_ui_tabs #switch").click(function(){
        $(this).toggleClass("open");
        $(this).toggleClass("close");
        $("#topbar").toggle();
    });
    
    //修补ie6下,iframe宽度问题   
    if ($.browser.msie && $.browser.version < 7) {
        $(window).resize(function(){
            //$("#iframepage").width($("#iframebox").width());            
        }).resize();
    }
});