var User=Backbone.Model.extend({
	urlRoot:'/webserviceAPI/auth/login',
	defaults:{
		'username':null,
		'password':null
	}
})

var BodyView=Backbone.View.extend({
	el:$('body'),
	events:{
		'click #reset':'reset',
		'click #login':'login',
		'keyup input[name=password]':'submit'
	},
	initialize:function () {
		this.readSalt();
		setInterval(this.readSalt,1000*60);
	},
	readSalt:function () {
		$.getJSON('/webserviceAPI/auth/salt',function (result) {
			$.cookie('salt',result.result);
		})
	},
	submit:function () {
		if(event.keyCode==13)
			this.login();
	},
	login:function () {
		var username=$('input[name=username]').val();
		var password=$('input[name=password]').val();
		if(username==''||password==''){
			alert('用户名密码不能为空');
			return;
		}
		// var encodeSalt=CryptoJS.MD5(CryptoJS.MD5(password).toString()+$.cookie('salt')).toString();
		var encodeSalt=CryptoJS.MD5(password).toString();
		var user=new User({username:username,password:encodeSalt});
		user.save().done(function (result) {
			if(result.errorMsg!=null){
				alert(result.errorMsg);
				return;
			}
			console.log(result);
			_.each(result.result,function (obj) {
				$.cookie(obj.uri,obj.permit);
			})
			window.location.href='admin';
		})
	},
	reset:function () {
		$('input').val('');
	}
})

$(function () {
	var Body=new BodyView();
})