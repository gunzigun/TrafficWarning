 ////使用对象来建立摄像头的各种控制
	function camera() {
			//属性
			var thiz = this;
			thiz.id;
			thiz.key;
			thiz.cam_divid;
			thiz.camip;
		    thiz.user;	
			thiz.pwd;
			thiz.swtch;
			thiz.img;
			thiz.src;
			thiz.camType;
			thiz.saddr="zhiyun360.com:8002";
			
			//云服务初始化
			thiz.initZCloud = function(id,key){
				thiz.id = id;
				thiz.key = key;
			}
			//设置服务器地址
			thiz.setServerAddr = function(saddr){
				thiz.saddr=saddr;
			}
			//摄像头初始化
			thiz.initCamera=function(camid, user, pwd,camtype){
				thiz.camid = camid;
				thiz.user = user;
				thiz.pwd = pwd;
				thiz.img = new Image();
				thiz.camType = camtype;
			}
			
			//设置视频图像显示的标签id
			thiz.setDiv = function(divID)
			{
				thiz.cam_divid = divID;
				//$("#" + divID).hide();
			}
			//在线处理函数
			thiz.handOnLine = function(cal)
			{
				//判断摄像头是否在线
				if(thiz.camType=="H3-Series")
				{
					thiz.src= "http://"+thiz.camip + "/tmpfs/auto.jpg?" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.src= "http://"+thiz.camip + '/snapshot.cgi?user='+thiz.user+'&pwd='+thiz.pwd+ "&" + (new Date()).getTime() + Math.random(); 
				}
				$("#"+thiz.cam_divid).attr("src", thiz.src);
				$("#"+thiz.cam_divid).error(function () {//图像加载失败
                        thiz.swtch  = 0;//表明离线
					console.log("加载失败");
						cal(thiz.swtch);//回调函数
                    });
				$("#"+thiz.cam_divid).load(function () {//图像加载成功
                        thiz.swtch  = 1;//表明在线
						cal(thiz.swtch);//回调函数
                    });
			}
			//检查是否在线
			thiz.checkOnline= function(cal)
			{
				//处理摄像头IP地址内外网问题
				var ip = (thiz.camid).substring((thiz.camid).indexOf(":")+1);
				if(ip.indexOf(":")== -1)//处理域名地址
				{
					var RequestUrl = "http://"+thiz.saddr+"/ipcamera/address?camera_id="+ip+"&user="+thiz.user+"&pwd="+thiz.pwd+"&type="+thiz.camType;	
					$.ajax({
					type: "GET",
					url: RequestUrl,
					dataType:"text",
					success: function(data) {
						thiz.camip=data;
						thiz.handOnLine(function(data){cal(data);});
						}
					});
				}
				else//处理IP地址
				{
					thiz.camip=ip;
					thiz.handOnLine(function(data){cal(data);});
				}
			}

			//改变分辨率(H3系列摄像头默认为：640*352)
			thiz.setResolution=function(val)
			{
				var cmd;
				if(thiz.camType=="F-Series")
				{
					if(val=="640_480") cmd=32;
					if(val=="320_240") cmd=8;
					if(val=="160_120") cmd=2;
					thiz.img.src = "http://"+thiz.camip + "/camera_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&param=0&value=" + cmd;
				}
				else if(thiz.camType=="F3-Series")
				{
					if(val=="640_480") cmd=0;
					if(val=="320_240") cmd=1;
					thiz.img.src = "http://"+thiz.camip + "/camera_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&param=0&value=" + cmd;
				}
				else if(thiz.camType=="H3-Series")
				{
					if(val=="640_352") cmd=1;
					if(val=="320_176") cmd=2;
					thiz.img.src = "http://"+thiz.camip + "/cgi-bin/hi3510/param.cgi?cmd=setmobilesnapattr&-msize="+cmd+"&-usr="+thiz.user+"&-pwd="+thiz.pwd;
				}
				else
				{}
			}
            //预装载
            thiz.preload=function() {  
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/tmpfs/auto.jpg?" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/snapshot.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
            }
            //更改摄像头ip地址
            thiz.changesrc=function() {
                thiz.img.src = thiz.img.src;
                preload();
                setTimeout(changesrc, 200);
            }
            //视频图像刷新
            thiz.update=function() {         
                var imgObj = document.getElementById(thiz.cam_divid);
                imgObj.src = thiz.img.src;
                if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/tmpfs/auto.jpg?" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/snapshot.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
            }
            //加载错误处理
            thiz.takeError=function() {
				console.log("takeError");
                if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/tmpfs/auto.jpg?" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/snapshot.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
            }
            //开始加载
            thiz.startonload=function() {
                if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/tmpfs/auto.jpg?" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/snapshot.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				//console.log("xxx", thiz.img.src);
                thiz.img.onerror = thiz.takeError;
                thiz.img.onload = thiz.update;

            }
			
            //视频开
            thiz.openVideo=function() {
			$("#" + thiz.cam_divid).show();
                    if (navigator.appName.indexOf("Microsoft IE Mobile") != -1) {
                        preload();
                        changesrc();
                        return;
                    }
                    thiz.startonload();
            }
            //视频关闭
            thiz.closeVideo=function()
            {
				$("#" + thiz.cam_divid).hide();
				if(thiz.camType == "H3-Series")
				{
					thiz.StopSubmmit();
				}
				else
				{
					setTimeout(function(){thiz.ptzHorizonStopSubmit()},10);//水平停止
					thiz.ptzVerticalStopSubmit();//垂直停止
				}
                thiz.img.onerror = null;
                thiz.img.onload = null;
            }

            //向上
            thiz.ptzUpSubmit=function() { 
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=1&-act=up&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=0&onestep=1&" + (new Date()).getTime() + Math.random();
				}
            }
            //向下
            thiz.ptzDownSubmit=function() {
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=1&-act=down&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=2&onestep=1&" + (new Date()).getTime() + Math.random();
				}
            }
            //向左
            thiz.ptzLeftSubmit=function() {
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=1&-act=left&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=4&onestep=1&" + (new Date()).getTime() + Math.random();
				}
			}
            //向右
            thiz.ptzRightSubmit=function() {
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=1&-act=right&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=6&onestep=1&" + (new Date()).getTime() + Math.random();
				}
			}
            //水平巡逻停止(F、F3系列)
            thiz.ptzHorizonStopSubmit=function() {
                thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=29&onestep=1&" + (new Date()).getTime() + Math.random();
            }
            //垂直巡逻停止(F、F3系列)
            thiz.ptzVerticalStopSubmit=function() {
                thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=27&onestep=1&" + (new Date()).getTime() + Math.random();
            }
			
			//摄像头停止转动（针对H3-Serials系列）
			thiz.StopSubmmit=function(){
				thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=stop&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd;	
			}
			
            thiz.src_ChangeH=function()
            {
                thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=28&onestep=0&" + (new Date()).getTime() + Math.random()
            }
            thiz.src_ChangeV=function() {
                thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=26&onestep=0&" + (new Date()).getTime() + Math.random()
            }
            //水平巡逻
            thiz.ptzHorizonSubmit=function() {
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=hscan&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.ptzVerticalStopSubmit();
					setTimeout(function(){thiz.src_ChangeH()}, 500);
				}
            }
            
            //垂直巡逻
            thiz.ptzVerticalSubmit=function() {  
				if(thiz.camType == "H3-Series")
				{
					thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=vscan&" + "-usr=" + thiz.user + "&-pwd=" + thiz.pwd + "&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.ptzHorizonStopSubmit();
					setTimeout(function(){thiz.src_ChangeV()}, 500);
				}
            }
            
            //360度巡逻
            thiz.ptzVHSubmit=function() {
				if(thiz.camType == "H3-Series")
				{
					//thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=vscan&" + (new Date()).getTime() + Math.random();
					//thiz.img.src = "http://"+thiz.camip + "/web/cgi-bin/hi3510/ptzctrl.cgi?-step=0&-act=hscan&" + (new Date()).getTime() + Math.random();
				}
				else
				{
					thiz.img.src = "http://"+thiz.camip + "/decoder_control.cgi?user=" + thiz.user + "&pwd=" + thiz.pwd + "&" + "&command=28&onestep=0&" + (new Date()).getTime() + Math.random();
					setTimeout(function(){thiz.src_ChangeV()}, 500);
				}
            }
			
			//截屏
			thiz.snapshot = function()
			{
				var imgURL = $("#"+thiz.cam_divid).attr("src");
				var oPop = window.open(imgURL,"mysnapshot","width=640,height=480,top=100,left=400");   
				/*for(; oPop.document.readyState != "complete";)   
					{ 
						if(oPop.document.readyState == "complete"){
							oPop.document.execCommand('SaveAs',true,'D://a.jpg'); 
							break;
						}
					} 
				//oPop.document.execCommand("SaveAs"); 
				//oPop.document.execCommand('SaveAs',false,'D://a.jpg'); 
				*/
				//setTimeout(function(){oPop.close();},2000); 
			}
			
			//开始录像
			thiz.startRecord = function(){}
			
			//停止录像
			thiz.stopRecord = function(){}
			
			//暂停录像
			thiz.pauseRecord = function(){}
        }