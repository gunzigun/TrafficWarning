var WSNCamera = function(myZCloudID, myZCloudKey) {
	var myCamera;
	
	thiz = this;
	thiz.uid = myZCloudID;
	thiz.key = myZCloudKey;
	thiz.saddr = "zhiyun360.com:8002";
	
	thiz.myCamera = myCamera = new camera();
	
	thiz.setIdKey = function(uid, key) {
		thiz.uid = uid;
		thiz.key = key;
		myCamera.initZCloud(myZCloudID, myZCloudKey);		
	};
	//云服务初始化
	thiz.initZCloud = function(myZCloudID, myZCloudKey)
	{
		myCamera.initZCloud(myZCloudID, myZCloudKey);
	}
	//设置服务器地址
	thiz.setServerAddr = function(saddr)
	{
		if (saddr.search(":")<0) {
			saddr += ":8002";
		}
		myCamera.setServerAddr(saddr);
		thiz.saddr = saddr;
	}
	//摄像头初始化
	thiz.initCamera=function(myCameraIP, user, pwd,camtype){
		myCamera.initCamera(myCameraIP, user, pwd,camtype);
	}
	thiz.handOnLine = function (cal) {
		myCamera.handOnLine(cal)
	}
	
	//将视频图像在指定标签id显示
	
	thiz.setDiv = function(divID){
		myCamera.setDiv(divID);
	}
	
	//检查是否在线
	thiz.checkOnline =function(cal)
	{
		myCamera.checkOnline(function(data){cal(data);})
	}
	
	thiz.capture = function(cb)
			{
				var cid = myCamera.camip;//.substr(7); //http://
				console.log("即将拍照：摄像头配置如下：", cid, myCamera.user, myCamera.pwd, myCamera.camType);
				var RequestUrl = "http://"+thiz.saddr+"/ipcamera/snapshot?feed_id="+thiz.uid+"&camera_id="+cid+"&user="+myCamera.user+"&pwd="+myCamera.pwd+"&type="+myCamera.camType;	
				console.log(RequestUrl);
				$.ajax({
					type: "POST",
					url: RequestUrl,
					beforeSend: function (xhr) {
                   		xhr.setRequestHeader("X_APIKEY", thiz.key);
           		    },
					success: function(data) {
						console.log(data);
						if (cb) {
							cb(data);
						}
					}
				});
			}
			
	//改变分辨率:F系列 val="160_120",160*120;val="320_240",320*240;val="640_480",640*480
	//           F3系列 val="320_240",320*240;val="640_480",640*480
	//           H3系列 val="320_176",320*176;val="640_352",640*352
	this.setResolution = function(val)
	{
		myCamera.setResolution(val);
	}
	//打开摄像头
	this.openVideo=function() 
	{
		myCamera.openVideo();
	}
	
	//关闭摄像头
	this.closeVideo=function() 
	{
		myCamera.closeVideo();
	}

	//摄像头控制
	this.control=function(cmd) 
	{	
		if(cmd=="UP") myCamera.ptzUpSubmit(); //向上
		if(cmd=="DOWN") myCamera.ptzDownSubmit(); //向下
		if(cmd=="LEFT") myCamera.ptzLeftSubmit();	//向左
		if(cmd=="RIGHT") myCamera.ptzRightSubmit();	//向右
		if(cmd=="HPATROL") myCamera.ptzHorizonSubmit();	//水平扫航
		if(cmd=="VPATROL") myCamera.ptzVerticalSubmit();	//垂直扫航
		if(cmd=="360PATROL") myCamera.ptzVHSubmit();	//360°扫航
	}
	
	//截屏
	this.snapshot=function()
	{
		myCamera.snapshot();
	}
}