define(['jquery','underscore','backbone','ConflictList'],
	function ($,_,Backbone,ConflictList) {
	
	var ConflictNavView=Backbone.View.extend({
		el:$('.right-nav'),
		template:_.template($('#conflict-temp').html()),
		initialize:function(){
		},
		//获取文件冲突，先获取本地更改，将本地更改文件列表和本地版本和服务器比较，获取发生冲突的文件列表.
		createView:function () {
			this.conflictList=new ConflictList({revision:$.cookie('working-revision')});
			this.$el.empty();
			this.$el.append('<div class="conflict-hint"><span>正在检查冲突</span></div>')
			var self=this;
			DBManager.manager.getAmbiguous('.*',function (result) {
				var arr=new Array()
				for(var i in result){
					arr.push(result[i]);
				}
				this.conflictList.set('list',arr);
				this.conflictList.save({},{wait:false})
				.done(function(data){
					data=data.result;
					$.cookie('conflict-revision',data.revision);
					self.render(data.list);
				})
			},this);
		},
		render:function(data){
			this.$el.empty();
			this.$el.append(this.template({fileList:data}));
		}
	})

	return ConflictNavView;
})