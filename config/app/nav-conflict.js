var ConflictList=MyModel.extend({
	url:'/svnserviceAPI/component/conflict',
	defaults:{
		list:null,
		comment:null,
		force:false,
		revision:null
	}
})
var ConflictNavView=Backbone.View.extend({
	template:_.template($('#conflict-temp').html()),
	initialize:function(){
		this.conflictList=new ConflictList({revision:$.cookie('working-revision')});
		var self=this;
		DBManager.manager.getAmbiguous('.*',function (result) {
			var arr=new Array()
			for(var i in result){
				arr.push(result[i]);
			}
			this.conflictList.set('list',arr);
			this.conflictList.save()
			.done(function(data){
				self.render(data);
			})
		},this);
	},
	render:function(data){
		$('.right-nav').empty();
		$('.right-nav').append(this.template({fileList:data.result}));
		this.$el=$('.version-list');
		this.delegateEvents();
	}
})

