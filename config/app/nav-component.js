var ComponentNavView=RightNavView.extend({
	events:{
		'click .version-item':'chooseVersion'
	},
	template:_.template($('#component-nav-temp').html()),
	renderVersion:function (){
		var id=$('.version-list>.active').attr('revision');
			//console.log('render version');
		var revision=this.logList.get(id)
		if(BodyView.wrapper)
			BodyView.wrapper.remove();
		BodyView.wrapper=new ComponentView(revision,this.path);
	},
	hasCache:function () {
		// DBManager.manager.getAmbiguous(this.path+'.*',function (result) {
		// 	if(result){
		// 		this.chooseEdit();
		// 	}else{
		// $('.new-cache').addClass('hide');
		$($('.version-item').get(0)).addClass('active');
		this.renderVersion();
		// 	}
		// },this);
	},
})