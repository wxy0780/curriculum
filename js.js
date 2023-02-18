var data = ""
var initDataTimeInterval = undefined;
var nowShowDay = new Date();
//初始化数据
function initData(d){
    var rev = [];
    while(d.indexOf("\n") != -1){
        var nl = [];
        nl[0] = d.slice(0,d.indexOf("\t"));
        d = d.slice(d.indexOf("\t")+1);
        nl[1] = Number(d.slice(0,d.indexOf("\t")));
        d = d.slice(d.indexOf("\t")+1);
        nl[2] = Number(d.slice(0,d.indexOf("\t")));
        d = d.slice(d.indexOf("\t")+1);
        nl[3] = d.slice(0,d.indexOf("\t"));
        d = d.slice(d.indexOf("\t")+1);
        nl[4] = d.slice(0,d.indexOf("\n"));
        d = d.slice(d.indexOf("\n")+1);
        rev.push(nl);
    }
    return rev;
}
//格式化时间
function formTime(e){
    return parseInt(e[1] / 100) + ':' +  (e[1] % 100) + '~' + parseInt(e[2] / 100) + ':' +  (e[2] % 100);
}
//剩余时间文本
function waitTimeOut(e) {
    var nt = new Date();
    var aimTime = new Date();
    var d = e[0];
    aimTime.setFullYear(d.slice(0,d.indexOf("-")));
    d = d.slice(d.indexOf("-")+1);
    aimTime.setMonth(d.slice(0,d.indexOf("-"))-1);
    d = d.slice(d.indexOf("-")+1);
    aimTime.setDate(d);
    aimTime.setHours(parseInt(e[1]/100));
    aimTime.setMinutes(e[1]%100);
    aimTime.setSeconds(0);
    if(aimTime.getTime() >= nt.getTime()){
        //还未开始
        var dt = aimTime.getTime() - nt.getTime();
        if(dt < 60000){
            return {
                't':"即将开始",
                'b':"planClass"
            };
        }else if(dt<3600000){
            return {
                't':parseInt(dt/60000)+"分钟后",
                'b':"planClass"
            };
        }else if(dt<84600000){
            return {
                't':parseInt(dt/3600000)+"小时后",
                'b':"planClass"
            };
        }else if(dt<2592000000){
            return {
                't':parseInt(dt/84600000)+"天后",
                'b':"planClass"
            };
        }else if(dt<31104000000){
            return {
                't':parseInt(dt/2592000000)+"月后",
                'b':"planClass"
            };
        }else{
            return {
                't':parseInt(dt/31104000000)+"年后",
                'b':"planClass"
            };
        }
    }else{
        //已经开始,判断是否结束
        aimTime.setHours(parseInt(e[2]/100));
        aimTime.setMinutes(e[2]%100);
        if(aimTime.getTime() >= nt.getTime()){
            //正在进行
            return {
                't':"正在进行",
                'b':"onClass"
            };
        }
    }
    return {
        't':"结束",
        'b':"end"
    };
}
//刷新时间显示
function timeFreah(d){
    var e = waitTimeOut(d[0]);
    if(e.b != "planClass"){
        $("#cardList>.card.first.beforeClass").addClass(e.b).removeClass("beforeClass");
    }
    if(e.b == "end"){
        //已经结束，删除并重新渲染
        d = d.slice(1);
        showCard(d);
        return;
    }
    $("#cardList>.card.first .remain").text(e.t);
}
//显示当天安排
function showCard(d) {
    //结束定时器
    if(initDataTimeInterval != undefined){
        clearInterval(initDataTimeInterval);
    }
    //清理
    $("#cardList>.card,#cardList>.title").remove();
    $(".noClass").hide();
    //判断是否有安排
    if(d.length < 1){
        //无事
        $(".noClass").show();
        $("#cardList").append('<div class="title">今日计划</div>');
        return;
    }
    //当前
    $("#cardList").append('<div class="title">当前计划</div>');
    var e = waitTimeOut(d[0]);
    if(e.b == "planClass"){
        e.b = "beforeClass";
    }
    if(e.b == "end"){
        //已经结束，删除并重新渲染
        d = d.slice(1);
        showCard(d);
        return;
    }
    $("#cardList").append('<div class="first card '+e.b+' left"><div><div class="object">'+d[0][3]+'</div><div class="time">'+formTime(d[0])+'</div></div><div><div class="place">'+d[0][4]+'</div><div class="remain">'+e.t+'</div></div></div>');
    //当天剩余计划
    if(d.length > 1){
        $("#cardList").append('<div class="title">今日其他计划</div>');
    }
    for(var i=1;i<d.length;i++){
        e = waitTimeOut(d[i]);
        $("#cardList").append('<div class="card '+e.b+' left"><div><div class="object">'+d[i][3]+'</div><div class="time">'+formTime(d[i])+'</div></div><div><div class="place">'+d[i][4]+'</div><div class="remain">'+e.t+'</div></div></div>');
    }
    //启动定时器
    initDataTimeInterval = setInterval(() => {
        timeFreah(d);
    }, 10000);
}
//显示完整安排
function _showCard(d) {
    //结束定时器
    if(initDataTimeInterval != undefined){
        clearInterval(initDataTimeInterval);
    }
    //清理
    $("#cardList>.card,#cardList>.title").remove();
    $(".noClass").hide();
    $("#cardList").append('<div class="title">'+(nowShowDay.getFullYear()+"-"+(nowShowDay.getMonth()+1)+"-"+(nowShowDay.getDate()))+'的计划</div>');
    //判断是否有安排
    if(d.length < 1){
        //无事
        $(".noClass").show();
        return;
    }
    var e;
    //当天计划
    for(var i=0;i<d.length;i++){
        e = waitTimeOut(d[i]);
        $("#cardList").append('<div class="card '+e.b+' left"><div><div class="object">'+d[i][3]+'</div><div class="time">'+formTime(d[i])+'</div></div><div><div class="place">'+d[i][4]+'</div><div class="remain">'+e.t+'</div></div></div>');
    }
}
//获取指定天的安排
function getPlan(date){
    //结束定时器
    if(initDataTimeInterval != undefined){
        clearInterval(initDataTimeInterval);
    }
    var lis = initData(data);
    var thisDay = [];
    //提取当天的安排
    lis.forEach(e => {
        if(e[0] == date){
            thisDay.push(e);
        }
    });
    //判断是否是当天安排
    var d = new Date();
    var aimList = [];
    if ((d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()))==date) {
        //删除过时安排
        var nowTime = (d.getHours()*100) + d.getMinutes();
        //nowTime = 1820;
        thisDay.forEach(e => {
            if(e[2] > nowTime){
                aimList.push(e);
            }
        });
    }else{
        aimList = thisDay;
    }
    //排序
    for(var i=1;i<aimList.length;i++){
        for(var j=0;j<aimList.length-i;j++){
            if(aimList[j][1] > aimList[j+1][1]){
                var b = aimList[j];
                aimList[j] = aimList[j+1];
                aimList[j+1] = b;
            }
        }
    }
    if ((d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()))==date) {
        showCard(aimList);
    }else{
        _showCard(aimList);
    }
    return 0;
    var findPlace = ("\n"+data).indexOf("\n"+date+"\t");
    //判断是否安排
    if(findPlace != -1){
        //有安排
        //过滤安排
        var b = data;
        var nowPlan = "";
        while(findPlace != -1){
            b = b.slice(findPlace);
            var buf = b.slice(b.indexOf("\t")+1,b.indexOf("\n"));
            nowPlan += buf + "\n";
            b = b.slice(b.indexOf("\n"));
            findPlace = ("\n"+b).indexOf("\n"+date+"\t");
        }
        //过滤结束项
        todayPlan = nowPlan;
        showCard();
    }else{
        //无事
        $("#cardList>.card").remove();
        $(".noClass").show();
    }
}

//开始
function start() {
    getPlan(nowShowDay.getFullYear()+"-"+(nowShowDay.getMonth()+1)+"-"+(nowShowDay.getDate()));
}
//上一天
$("#beforeDay").click(function(){
    nowShowDay.setDate(nowShowDay.getDate()-1);
    start();
});
//下一天
$("#nextDay").click(function(){
    nowShowDay.setDate(nowShowDay.getDate()+1);
    start();
});

//检查数据并开始
if(localStorage != undefined){
    if(localStorage.getItem("data") != null){
        //本地有有效数据
        data = localStorage.getItem("data");
        start();
    }
}

//获取网络数据
$.get("data.txt",function (d) {
    if(d != data){
        //数据有更新
        data = d;
        if(localStorage != undefined){
            localStorage.setItem("data",d);
        }
        start();
    }
});
