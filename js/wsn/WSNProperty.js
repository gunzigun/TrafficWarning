function WSNProperty(myZCloudID, myZCloudKey) {
	var thiz = this;
	thiz.aid = myZCloudID;
	thiz.xKey = myZCloudKey;
	thiz.saddr = "zhiyun360.com:8080";
	
	thiz.setIdKey = function(uid, key) {
		thiz.uid = uid;
		thiz.key = key;		
	};
	
	thiz.initZCloud = function(uid, key) {
		thiz.uid = uid;
		thiz.key = key;		
	};
	
	thiz.setServerAddr = function(addr) {
		thiz.saddr = addr;
	};
	
	thiz.get = function(){
		var cb =null;
		var name = null;
		
		if (arguments.length == 1) {cb = arguments[0];}
		else {name = arguments[0]; cb = arguments[1];}
			
		var url = "http://"+thiz.saddr+"/v2/feeds/"+thiz.aid+"/propertys";
		if (name) {
			url = url + "/"+name;
		}
		$.ajax({
			type: "GET",
	    	url: url,
	    	dataType:"text",
	    	beforeSend: function( xhr ) {
				xhr.setRequestHeader("X-ApiKey", thiz.xKey);
			},
	    	success: function(data) {
	        	cb(data);
	    	},error : function (a, b, c) {
				console.log("error", a, b, c);
			}
    	});
	};
	thiz.put = function(name,value, cb) {
		var url = "http://"+thiz.saddr+"/v2/feeds/"+thiz.aid+"/propertys/"+name;
		$.ajax({
			type: "PUT",
	    	url: url,
	    	dataType:"text",
	    	data:value,
	    	beforeSend: function( xhr ) {
				xhr.setRequestHeader("X-ApiKey", thiz.xKey);
			},
	    	success: function(data) {
	        	cb(data);
	    	}
    	});	
	};
}