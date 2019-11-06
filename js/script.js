var local={
    id_address:config['id'],
    key_address:config['key'],
    server_address:config['server'],
    'camera' : {
        'camera_1' :config['camera']['camera_1'],
        'camera_2' : config['camera']['camera_2'],
        'camera_3' : config['camera']['camera_3'],
        'camera_4' : config['camera']['camera_4'],
        'camera_5' : config['camera']['camera_5'],
        'camera_6' : config['camera']['camera_6'],
        'camera_7' : config['camera']['camera_7'],
        'camera_8' : config['camera']['camera_8'],
        'camera_9' : config['camera']['camera_9'],
    },
    "macs" : [
        {"macid" : "mac_id_1","macval" : config["macs"][0]},
        {"macid" : "mac_id_2","macval" : config["macs"][1]},
        {"macid" : "mac_id_3","macval" : config["macs"][2]},
    ]
}
// 定义二维码生成div
var qrcode;

//模态框相关事件
var modal = {
    saveIDKEY : function () {
        var connect_staste = $("#id_confirm").text();
        local.id_address = $("#id_address").val();
        local.key_address = $("#key_address").val();
        local.server_address = $("#server_address").val();
        page.storeStorage();
        //message_show("id、key保存成功！");
        console.log(!rtc._connect, connect_staste);
        if(!rtc._connect && connect_staste=="连接"){
            on_get_aid_akey();
        }else if(rtc._connect && connect_staste=="断开"){
            rtc.disconnect();
        }
    },
    saveCamera : function () {
        var serial = $("#camera_select").val();
        console.log(serial);
        local['camera'][serial]['addr'] = $("#camera_addr").val();
        local['camera'][serial]['type'] = $("#camera_type").val();
        local['camera'][serial]['user'] = $("#camera_user").val();
        local['camera'][serial]['pw'] = $("#camera_pw").val();
        local['camera'][serial]['gps'] = $("#camera_gps").val();
        page.storeStorage();
        message_show("摄像头"+serial+"设置成功！");
    },
    camera_change : function (){
        var serial = $("#camera_select").val();
        console.log(serial);
        $("#camera_addr").val(local['camera'][serial]['addr']);
        $("#camera_type").val(local['camera'][serial]['type']);
        $("#camera_user").val(local['camera'][serial]['user']);
        $("#camera_pw").val(local['camera'][serial]['pw']);
        $("#camera_gps").val(local['camera'][serial]['gps']);
    },
    $cur_qr : {},
    share : function (e) {
        var txt="", title, input, obj;
        if(e.id=="download"){
            if(e.title =="hide"){
                $("#downloadDiv").removeClass("hidden");
                $(e).attr("title", "show").addClass("hin-set-show");
            }
            else{
                $("#downloadDiv").addClass("hidden");
                $(e).attr("title", "hide").removeClass("hin-set-show");
            }
        }else{
            if(e.id=="id_share"){
                obj = {
                    "id" : $("#id_address").val(),
                    "key" : $("#key_address").val(),
                    "server" : $("#server_address").val(),
                }
                title = "IDKey";
                modal.$cur_qr = $("#idShareSpan");
            }
            else{
                obj = {
                    "addr" : $("#camera_addr").val(),
                    "type" : $("#camera_type").val(),
                    "user" : $("#camera_user").val(),
                    "pw" : $("#camera_pw").val(),
                }
                title = "MAC设置";
                modal.$cur_qr = $("#cameraShareSpan");
            }
            var newHeight  = parseInt($("#myModal .modal-content").height()) - 2 * parseInt($(".modal-in-footer:visible").height()) - 15;
            qrcode = new QRCode(document.getElementById("qrDiv"), {
                width : 150,
                height : 150
            });
            txt = JSON.stringify(obj);
            qrcode.makeCode(txt);
            $("#qrDiv").css("height" , newHeight);
            var state = modal.$cur_qr.text() == "分享" ? "off" : "on" ;
            if(state=="off"){
                $("#qrDiv").removeClass("hidden");
                modal.$cur_qr.text("收起");
            }
            else{
                $("#qrDiv").addClass("hidden").find("canvas").remove().end().find("img").remove();
                modal.$cur_qr.text("分享");
            }
        }
    },
    cur_scan : '',
    scan : function (e) {
        modal.cur_scan = $(e).data("scan");
        if (window.droid) {
            window.droid.requestScanQR("scanQR");
        }else{
            message_show("扫码只在安卓系统下可用！");
        }
    },
    sendOrder : function () {
        var text = $("#order_mes").val();
        if(rtc._connect){
            rtc.sendMessage("FF:FF:FF:FF:FF:FF:FF:FF", "["+text+"]");
            message_show("成功发送指令："+text);
            console.log("成功发送指令："+text);
            data2alarm(text);
        }else{
            message_show("未连接，请连接后重试！");
        }
    },
    reset : function () {
        $("#order_mes").val(" ").focus();
        message_show("指令输入已重置！");
    },
    del_ids : [],
    delReadyMac : function (e) {
        var state = $(e).data("state");
        if(state=="notready"){
            $(e).text("完成");
            $(".mac-input").find("span").addClass("mac-active");
            $(".mac-active").on("click",$(".mac-active"), modal.delMac);
        }else{
            $(".mac-ready").remove();
            for(var i in modal.del_ids){
                var cur_id = modal.del_ids[i];
                for(var j in local["macs"]){
                    if(cur_id==local["macs"][j]["macid"]){
                        local["macs"].splice(j,1);
                    }
                }
                console.log("当前的mac "+JSON.stringify(local["macs"]));
            }
            page.storeStorage();
            $(".mac-active").off("click");
            $(e).text("删除");
            $(".mac-input").find("span").removeClass("mac-active");
        }
        $(e).data("state", state=="notready" ? "ready" : "notready");
    },
    // 点击删除图标进入待删除状态
    delMac : function (e) {
        //console.log(e);
        //console.log("this="+this);
        var $parents = $(this).parents(".input-group");
        var del_mac_id = $parents.find("input").attr("id");
        if($.inArray(del_mac_id, modal.del_ids)<0){
            modal.del_ids.push(del_mac_id);
        }
        console.log("当前待删除的mac id="+modal.del_ids);
        if($parents.hasClass("mac-ready")){
            $parents.removeClass("mac-ready");
        }else{
            $parents.addClass("mac-ready");
        }

    },
    getMacs : function () {
        // console.log("获取macs信息："+JSON.stringify(local["macs"]));
        if(local["macs"]){
            console.log("获取macs信息："+JSON.stringify(local["macs"]));
            // console.log(eval(local["macs"]));
            var list = '';
            for(var i in local["macs"]){
                list = list + strTplList.temp(local["macs"][i]);
                userRecords.innerHTML = list;
            }
        }
    },
    addMac : function () {
        if(local["macs"]){
            // console.log(local["macs"]);
            var index = local["macs"].length+1;
            var newMac = {
                "macid" : "mac_id_"+index,
                "macval" : ""
            }
            local["macs"].push(newMac);
            modal.getMacs();
            page.storeStorage();
        }
    },
    saveMac : function (e) {
        var mac_id = $(e).attr("id");
        var mac_val = $(e).val();
        console.log(mac_val);
        for(var i in local["macs"]){
            if(local["macs"][i]["macid"] == mac_id){
                local["macs"][i]["macval"] = mac_val;
            }
        }
        page.storeStorage();
    },
    checkGps : function(){
        $(".camera_gps").addClass("camera_gps_active");
        setTimeout(function () {
            $(".camera_gps").removeClass("camera_gps_active");
        },1000)
    }
}

var page={
    id : "",
    loadPage : function (outPage) {
        var pageId = page.id = outPage ? outPage : window.location.hash.slice(2);
        //console.log("pageid="+pageId);
        $("#"+ pageId+"Li").addClass("active").siblings("li").removeClass("active");
        $("#"+ pageId).removeClass("hidden").siblings("div").addClass("hidden");
        if(pageId=="Map"){
            $(".contents").removeClass("camera-on");
        }else{
            $(".contents").addClass("camera-on");
        }
    },
    loadFirstPage : function () {
        var href = window.location.href;
        var newHref = href.substring(href.length,href.length-4);
        if(newHref == "html"){
            //page.homeRouter();
            window.location.href = window.location.href+"#/Map";
        }
    },
    //获取本地localStorage缓存数据
    get_localStorage : function () {
        if(localStorage["smartTraffic"]){
            local = JSON.parse(localStorage.getItem("smartTraffic"));
            console.log("local="+localStorage["smartTraffic"]);
            for(var i in local){
                console.log("i="+i);
                if(i=="camera"){
                    $("#camera_addr").val(local['camera']['camera_1']['addr']);
                    $("#camera_type").val(local['camera']['camera_1']['type']);
                    $("#camera_user").val(local['camera']['camera_1']['user']);
                    $("#camera_pw").val(local['camera']['camera_1']['pw']);
                    $("#camera_gps").val(local['camera']['camera_1']['gps']);
                    //page.getCameraGps();
                }
                else if(local[i]!="" && typeof local[i]=="string"){
                    var $dom = $("#"+i);
                    if($dom.is('input')){
                        $dom.val(local[i]);
                    }else{
                        $dom.text(local[i]);
                    }
                    //console.log("i="+i+";;  data:"+local[i]);
                }
            }
        }else {
            page.getConfig();
        }
        modal.getMacs();
        setTimeout(function () {
            page.getCameraGps();
        },500)
        on_get_aid_akey();
    },
    getCameraGps : function () {
        for(var i in local['camera']){
            var gpsArr = local['camera'][i]['gps'].split(",");
            console.log("每个camera对象对应的摄像头GPS："+gpsArr);
            var index = i.split("_")[1];
            console.log("index="+index);
            update_locaiton(gpsArr[1], gpsArr[0], index);
        }

    },
    storeStorage : function () {
        localStorage.setItem("smartTraffic", JSON.stringify(local));
    },
    getConfig : function () {
        $("#id_address").val(config["id"]);
        $("#key_address").val(config["key"]);
        $("#server_address").val(config["server"]);
        $("#camera_addr").val(config['camera']['camera_1']['addr']);
        $("#camera_type").val(config['camera']['camera_1']['type']);
        $("#camera_user").val(config['camera']['camera_1']['user']);
        $("#camera_pw").val(config['camera']['camera_1']['pw']);
        $("#camera_gps").val(config['camera']['camera_1']['gps']);
    },
    clearStorage : function () {
        localStorage.removeItem("smartTraffic");
        alert("localStorage已清除!")
        window.location.reload();
    }
}

var mac2location = {};
var strTplList;
var userRecords;
var alarm_arr = [];
var openCamera = null;
var rtc = new WSNRTConnect();
rtc.onConnect = onConnect;
rtc.onConnectLost = onConnectLost;
rtc.onmessageArrive = onmessageArrive;
rtc._connect = false;

var camera_states = {
    "camera_1" : {},
    "camera_2" : {},
    "camera_3" : {},
    "camera_4" : {},
    "camera_5" : {},
    "camera_6" : {},
    "camera_7" : {},
    "camera_8" : {},
    "camera_9" : {},
}
var small_camera_arr = [];
$(function(){

    // 模板字符内容
    // var strTplList =$('#tplList').html();
    strTplList = document.getElementById('tplList').innerHTML;
    userRecords = document.querySelector("#macIn");
    // 简易模板方法
    String.prototype.temp = function(obj) {
        return this.replace(/\$\w+\$/gi, function(matchs) {
            return obj[matchs.replace(/\$/g, "")] || '';
        });
    };

    page.get_localStorage();
    var routes = {
        '/Map': page.loadPage,
        '/Monitor': page.loadPage,
    };
    var router = Router(routes);
    router.configure();
    router.init();
    page.loadFirstPage();

    var camera_state = 0;
    var last_big_camera = 0;
    var small_camera = 0;

    //分情况：
    //1.第一次点x，则记录当前摄像头编号为x，开关文字：开启；
    //2.第二次点x，则关闭当前大屏，开关文字：开启

    $("#channel").on("click" ,"li" , function () {
        var index = $(this).text();
        if(last_big_camera!=index){
            $(this).addClass("active").siblings("li").removeClass("active");
            $(".camera-c-title").text(index);
            last_big_camera = index;
            $(".camera-info").addClass("camera-info-active");
            $("#camera_switch").removeClass("hidden").button("reset").text("开启");
        }
        // 点击的是已打开的频道，将关闭摄像头
        else{
            // 关闭当前大摄像头
            $(this).removeClass("active");
            last_big_camera = 0;
            $(".camera-info").removeClass("camera-info-active");
            $("#camera_switch").addClass("hidden").text("开启");
            //$("#camera").attr("src", "");
            if(!$.isEmptyObject(camera_states["camera_"+index])){
                console.log("关闭大屏：切换显示");
                camera_states["camera_"+index].setDiv(source_small_camera_id);
            }
        }
    })

    //摄像头
    var camera_cfg = {};
    var openCamera = null;
    var cwTitle = null;
    var sendConnectCamera = -1;
    var source_small_camera_id;
    var cur_operate = "";
//打开摄像头
    function check_online(){
        if(!rtc._connect){
            message_show("服务未连接，请连接后重试！");
            console.log("摄像头开启验证数据是否连接："+rtc._connect);
            return false;
        }else{
            return true;
        }
    }

    function open_video(index, id) {
        var ca = $("#camera_addr").val();
        var type = $("#camera_type").val();
        var user = $("#camera_user").val();
        var pwd = $("#camera_pw").val();
        //var myipcamera = new WSNCamera();
        camera_states["camera_"+index] = new WSNCamera();
        openCamera = camera_states["camera_"+index];
        camera_states["camera_"+index].setDiv(id);//设置图像显示的位置
        console.log(ca,type,user,pwd, id,cur_operate);
        camera_states["camera_"+index].setServerAddr("zhiyun360.com:8002");
        camera_states["camera_"+index].initCamera(ca, user, pwd,type); //摄像头初始化
        sendConnectCamera= index;
        $("#"+id).siblings("img").attr("src","img/loading.gif").addClass("img-loading");
        camera_states["camera_"+index].checkOnline(function(state){
            console.log('camera online',state);
            if(state == 1){
                if (camera_states["camera_"+index]) {
                    camera_states["camera_"+index].openVideo();//打开摄像头并显示
                    if($.inArray(index, small_camera_arr)){
                        small_camera_arr.push(index);
                    }
                    if(id.indexOf("_")>-1){
                        $("#"+id).addClass("img-full").show().siblings("img").hide();
                    }
                    if(id=="camera"){
                        $("#camera_switch").button("reset").text("关闭");
                    }
                    $("#camera_switch").addClass("openDivImg");
                }else{
                    $("#camera_switch").removeClass("openDivImg");
                }
            }
            else{
                message_show("摄像头["+index+"]断开！");
                $("#cam_"+index).data("state", "off");
                if(camera_states["camera_"+index]){
                    camera_states["camera_"+index].closeVideo();
                }
                camera_states["camera_"+index] = null;
                $("#camera_"+index).hide().siblings("img").attr("src","img/camera1.jpg").removeClass("img-loading").show();
                //message_show("关闭当前摄像头"+index);
                small_camera = 0;
                $(".openDiv").removeClass("active");
                var targetImg = $("#cam_"+index).siblings("img");
                targetImg.attr("id");
                $("#"+id).removeClass("img-full");
                $("#camera_switch").removeClass("openDivImg");
                openCamera = null;
            }
        });
        //保存摄像头信息
        cam  = {
            addr:ca,
            type:type,
            user:user,
            pwd:pwd
        };
        camera_cfg[cwTitle] = cam;
    }
    
    //摄像头块左下角开关事件
    $(".openDiv").on("click", function () {
        if(check_online()){
            var targetImg = $(this).siblings(".cameraBlock2");
            var index = $(this).parent(".modalImgDiv").data("title");
            var id = targetImg.attr("id");
            var cur_state = $(this).data("state");
            if (cur_state=="off") {
                cur_operate = "open";
                message_show("打开摄像头"+index+"，请等待……");
                open_video(index, id);
                $(this).data("state", "on");
                small_camera = index;
                $(this).addClass("active");
            }
            else { //关闭摄像头
                cur_operate = "close";
                $(this).data("state", "off");
                if(!$.isEmptyObject(camera_states["camera_"+index])){
                    console.log("即将关闭小屏摄像头："+index);
                    camera_states["camera_"+index].closeVideo();
                    console.log("小屏摄像头数组移除前："+small_camera_arr);
                    if($.inArray(index, small_camera_arr)>-1){
                        small_camera_arr.splice(index);
                    }
                    console.log("小屏摄像头数组移除后："+small_camera_arr);
                }
                console.log("恢复当前摄像头原图片："+index);
                camera_states["camera_"+index] = null;
                $("#camera_"+index).siblings("img").attr("src","img/camera1.jpg").removeClass("img-loading").show();
                message_show("关闭当前摄像头"+index);
                small_camera = 0;
                $(".openDiv").removeClass("active");
                $("#"+id).removeClass("img-full");
            }
        }
    })

    //设置窗口展开和收起事件
    $("#myModal").on("show.bs.modal", function () {
        $(".set-box").addClass("set-box-active");
    })
        .on("hide.bs.modal", function () {
            $(".set-box").removeClass("set-box-active");
        })
    //$("#myModal").modal("show");
    //
    //$(".openDiv").removeAttr("disabled");

    // 摄像头大图下开启或关闭
    $("#camera_switch").click(function(){
        if(check_online()){
            var index = $(".camera-c-title").text();
            var big_camera_btn = $(this).text();
            $(this).button('loading');
            source_small_camera_id = "camera_"+index;
            // 点击开启大屏
            if (big_camera_btn=="开启") {
                console.log("开大屏");
                cur_operate = "open";
                // 将当前选中的摄像头画面转移到大屏上
                // 如果当前摄像头对象已开，只重设显示div
                if(!$.isEmptyObject(camera_states["camera_"+index])){
                    console.log("对象非空，切换显示：camera_"+index);
                    // 表示对应的小屏摄像头已开启，此处只setDiv
                    camera_states["camera_"+index].setDiv("camera");
                    $("#camera").show();
                    $("#camera_switch").button("reset").text("关闭");
                }
                //如果当前摄像头对象为空，即未开，打开摄像头
                else{
                    // 对应小屏未开启，将在此大屏开启
                    console.log("开启摄像头");
                    open_video(index, "camera");
                }
                //$(".openDiv").css('background-image','url("img/on.png")');
                //$("#camera-imgs").addClass("camer-pic");
            }
            else { //关闭大屏
                console.log("关大屏");
                //如果对应小屏为开，则切换摄像头显示div
                var isSmallOpen = $("#cam_"+index).data("state")=="on";
                console.log("当前大屏对应的小屏是否为开："+isSmallOpen);
                if(isSmallOpen){
                    console.log("小屏为开：切换到小屏显示");
                    camera_states["camera_"+index].setDiv(source_small_camera_id);
                }
                // 如果对应小屏为关，则关闭当前摄像头
                else{
                    cur_operate = "close";
                    console.log("小屏为关，彻底关闭大屏摄像头");
                    camera_states["camera_"+index].closeVideo();
                    camera_states["camera_"+index] = null;
                }
                $("#channel li").removeClass("active");
                $(".camera-info").removeClass("camera-info-active");
                $(this).addClass("hidden").text("开启");
                last_big_camera = 0;
                $("#camera").attr("src","");
                //last_camera = 0;
                //setTimeout(function(){
                //    $("#camera-imgs").attr("src", "img/camera.jpg").css("display", "block").removeClass("full-screen");
                //}, 1000);
                //$(".openDiv").css('background-image','url"(../../img/off.png)"');
                //$("#camera-imgs").removeClass("camer-pic");
            }
        }
    });

    //data2alarm("0xab");
    //data2alarm("0xbc");

    // 摄像头出现警报时点击即解除


    // mac删除事件
    $(".mac-active").on("click", function (e) {

    })
    //清楚缓存
    $("#clear").click(function(){

    })
    //版本升级按钮
    $("#setUp").click(function(){
        message_show("当前已是最新版本!!")
    })
})

//自动连接
function on_get_aid_akey() {
    var server = local["server_address"].indexOf("28080")<0 ? local["server_address"]+":28080" : local["server_address"];
    if (local["id_address"] && local["key_address"]) {
        console.log("连接：",local["id_address"],local["key_address"],server);
        rtc.setServerAddr(server);
        rtc.setIdKey(local["id_address"], local["key_address"]);
        rtc.connect();
    }
}

//连接函数
function onConnect(){
    message_show('已连接到'+local["id_address"]);
    console.log("连接成功！");
    rtc._connect=true;
    camera.connect = 1;
    $("#id_confirm").text("断开");
    for(var i in config["macs"]){
        rtc.sendMessage(config["macs"], "{TYPE=?,A0=?,A1=?}")
    }
    console.log("发送查询：{TYPE=?,A0=?,A1=?}"+config["macs"]);
}

//连接失败函数
function onConnectLost(){
    message_show('实时连接断开');
    rtc._connect = false;
    //setTimeout(rtc.connect, 3000);
    camera.connect = 0;
    $("#id_confirm").text("连接");
}

var convertor = null;

//测试生成车辆坐标
//114.417041,30.484091 光谷天地
//114.399649,30.491436 中南民大
//114.363861,30.482971 华中农大
/*
setTimeout(function () {
    console.log("更新第1个点：双港地铁站");
	onmessageArrive("00:12:4B:00:07:16:55:43", "{A0=115.868142,A1=28.749309}")
},2000)

setTimeout(function () {
    console.log("更新第2个点：文渊阁");
	onmessageArrive("00:12:4B:00:07:16:55:43", "{A0=115.871466,A1=28.745794}")
},4000)

setTimeout(function () {
    console.log("更新第3个点：寝室22栋");
	onmessageArrive("00:12:4B:00:07:16:55:43", "{A0=115.874817,A1=28.739016}")
},6000)
*/

/*
setTimeout(function () {
    console.log("更新第2个点111：？？？");
	onmessageArrive("123", "{A0=114.417001,A1=30.484001}")
},1500)

setTimeout(function () {
	console.log("更新第2个点222：中南民大");
    onmessageArrive("123", "{A0=114.399649,A1=30.491436}")
},2000)

setTimeout(function () {
    console.log("更新第3个点111：华中农大");
    onmessageArrive("234", "{A0=114.363861,A1=30.482971}")
},2000)
*/

//数据接收函数
function onmessageArrive(mac, dat) {
    //console.log(mac+" >>> "+dat);
    if (dat[0]=='{' && dat[dat.length-1]=='}') {
        dat = dat.substr(1, dat.length-2);
        var its = dat.split(',');
        for (var i=0; i<its.length; i++) {
			//console.log("坐标"+i+":"+its[i]);
            var it = its[i].split('=');
            if (it.length == 2) {
                var tag = it[0];
                var val = it[1];
				//console.log("tag"+i+":"+tag);
				//console.log("val"+i+":"+val);
                var lng,lat;
                if($.inArray(mac, config["macs"])>-1){
					if(tag=="A0"){
                        lng = parseFloat(val);
                    }
                    if(tag=="A1"){
                        lat = parseFloat(val);
                    }
                }
            }
        }
        var index = $.inArray(mac, config["macs"]);
        if(!mac2location[mac]){
            mac2location[mac] = [0,0];
            console.log("mac地址："+mac);
            if($("#mapMes").text()=="暂无信息"){
                $("#mapMes").empty();
            }
            $("#mapMes").append("<span id='mac_"+index+"'><\/span>");
            //$("#"+mac).text("小车坐标："+lng+"，"+lat);
        }
        if(mac2location[mac][0]!=lng || mac2location[mac][1]!=lat){
            lng = lng ? lng :mac2location[mac][0];
            lat = lat ? lat :mac2location[mac][1];
            mac2location[mac] = [lng, lat];
            //console.log("即将插入信息",mac,lng,lat);
            if(lng!=0 && lat!=0){
                console.log("更新坐标信息：",index, lng, lat,mac);
                $("#mac_"+index).text("小车"+(index+1)+"坐标："+lng+"，"+lat);
                update_locaiton(lat,lng,mac);
            }
        }
        //if (!mac2type[mac]) { //如果没有获取到TYPE值，主动去查询
        //    rtc.sendMessage(mac, "{TYPE=?,A0=?,A1=?,A2=?,A3=?,A4=?,A5=?,A6=?,A7=?,D1=?}");
        //}
    }
}

// 添加车辆标志物
function addMarker(point,xiaocheIcon,index,mac)
{	
	// 清楚之前的标志物
	var allOverlay = map.getOverlays();
    for (var i = 0; i < allOverlay.length; i++) 
	{
        if (allOverlay[i].toString() == "[object Marker]") 
		{
			//console.log(allOverlay[i].getLabel());
            if (allOverlay[i].getLabel() != null)
			{
				if(allOverlay[i].getLabel().getContent() == mac)
				{
					map.removeOverlay(allOverlay[i]);
					//console.log(allOverlay[i])
				}
			}
        }
	}

    var marker = new BMap.Marker(point,{icon:xiaocheIcon});
	//if(index>0)
	{
        var myLabel = new BMap.Label(index,
            {position : point,offset:new BMap.Size(20,-10)}
        )
        myLabel.setStyle({
            color : "red",
            fontSize : "12px",
            height : "20px",
            lineHeight : "20px",
            fontFamily:"微软雅黑",
            border: "none",
            background : "transparent"
        })
		myLabel.setContent(mac);
        marker.setLabel(myLabel);
    }
    map.addOverlay(marker);
	
}

// 更新车辆坐标
function update_locaiton(lat,lng,mac){
    if (lat>0.000001 && lng>0.000001) {
        console.log("--------------------------",lng, lat);
        var point = new BMap.Point(lng, lat);  // 创建点坐标
        if (convertor == null) {
            convertor = new BMap.Convertor();
        }
        var pointArr = [];
        pointArr.push(point);
        var test = mac ? "test" : "xxx";
        console.log("test = "+test);
        console.log("mac是否存在：(取反)"+mac);
        var xiaocheIcon;
        var macIsIndex = mac.indexOf(":")<0;
        var index =  macIsIndex ? mac : 0;
        xiaocheIcon = macIsIndex ? new BMap.Icon("img/camera_gps.png", new BMap.Size(30,30)) : new BMap.Icon("img/Prompt.png", new BMap.Size(30,30))
        //console.log(xiaocheIcon);
		
		var point = new BMap.Point(lng, lat);  // 创建点坐标
		
		//坐标转换完之后的回调函数
        translateCallback = function (data){
			addMarker(data.points[0],xiaocheIcon,index,mac);
			//map.addControl(new BMap.NavigationControl());
			if($.inArray(mac, config["macs"])==0){    // 对第一个mac地址对应的坐标定义为地图中点
				map.centerAndZoom(data.points[0], 20);                 // 初始化地图，设置中心点坐标和地图级别
			}
            console.log(data.points[0]);
        };
		convertor.translate(pointArr,1,5,translateCallback)
		
    }
}

// 生成摄像头警报
function data2alarm(data){
    if(data && config["alarm"][data]){
        console.log(data, config["alarm"][data]);
        var index = config["alarm"][data];
        console.log("发现警报："+index+"号摄像头");
        $("#monitorNav").addClass("alarm-active");
        $(".modalImgDiv:eq("+(index-1)+")").addClass("alarm-active").on("click", releaseAlarm);
        if($.inArray(index, alarm_arr)<0){
            alarm_arr.push(index);
        }
    }
}

function releaseAlarm(e){
    var $dom = $(e.target);
    if($dom.hasClass("modalImgDiv")){
        var index = $dom.data("title");
        console.log("解除警报："+index);
        $dom.removeClass("alarm-active");
        var num = $.inArray(index, alarm_arr);
        if(num>-1){
            alarm_arr.splice(num,1);
        }
        if(alarm_arr.length==0){
            $("#monitorNav").removeClass("alarm-active");
        }
    }
}


// 扫描处理函数
function scanQR(scanData){
    //将原来的二维码编码格式转换为json。注：原来的编码格式如：ID:12345,KEY:12345,SERVER:12345
    var dataJson = {};
    if (scanData[0]!='{'){
        var data = scanData.split(',');
        for(var i=0;i<data.length;i++){
            var newdata = data[i].split(":");
            dataJson[newdata[0].toLocaleLowerCase()] = newdata[1];
        }
    }else{
        dataJson = JSON.parse(scanData);
    }
    if( modal.cur_scan == "id"){
        if(dataJson['id']){
            if(dataJson['id'])
                $("#id_address").val(dataJson['id']);
            if(dataJson['key'])
                $("#key_address").val(dataJson['key']);
            if(dataJson['server'])
                $("#server_address").val(dataJson['server']);
        }
        $("#key_address").val(dataJson['key']);
        if(dataJson['server'] && dataJson['server']!=''){
            $("#server_address").val(dataJson['server']);
        }
    }else if(modal.cur_scan=="secure_camera"){
        if(dataJson['addr'])
            $("#camera_addr").val(dataJson['addr']);
        if(dataJson['type'])
            $("#camera_type").val(dataJson['type']);
        if(dataJson['user'])
            $("#camera_user").val(dataJson['user']);
        if(dataJson['pw'])
            $("#camera_pw").val(dataJson['pw']);
    }
}
//消息弹出函数
var message_timer = null;
function message_show(t) {
    if (message_timer) {
        clearTimeout(message_timer);
    }
    message_timer = setTimeout(function(){
        $("#toast").removeClass("toast_show");
    }, 2000);
    $("#toast_txt").text(t);
    $("#toast").addClass("toast_show");
}