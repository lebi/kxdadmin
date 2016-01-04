/*
*	@author:Huangyan
*	@Date:2016.1.4
*/
define(['jquery','underscore','backbone','ChangeList'],
	function ($,_,Backbone,ChangeList) {

	//显示本地已更改的文件列表
	var ComponentChangeView=Backbone.View.extend({
		el:$('.page-wrapper'),
		template:_.template($('#component-change-temp').html()),
		events:{
			'click #component-change-list .commit':'commitChanges',
			'click #component-change-list .cancel':'deleteChange',
			'change #component-change-list .checkbox input':'checkChange'
		},
		initialize:function () {
			this.map={};		//restore check map
			this.fileList;		//restore all changes in indexDB
		},
		createView:function (bodyView) {
			this.bodyView=bodyView;
			DBManager.manager.getAmbiguous('.*',function (result) {
				this.fileList=result;
				this.render();
				for(var i in this.fileList){
					this.map[i]=true;
				}
			},this)
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template({fileList:this.fileList}));
		},
		commitChanges:function () {
			var list=new Array();
			for(var file in this.fileList){
				if(this.map[file]){
					list.push(this.fileList[file]);
				}
			}
			var comment=$('textarea',this.$el).val();
			var changeList=new ChangeList({list:list,comment:comment,revision:$.cookie('working-revision')});
			var self=this;

			var num1=0;
			var num2=0;
			for(var i in self.map)
				if(self.map[i])
					num1++;
			if(num1==0){
				alert('未选择文件');
				return;
			}
			changeList.save().done(function (result) {
				if(result.result==-1){
					alert('存在冲突，请解决');
					return;
				}
				//提交选中的文件
				for(var i in self.map){
					if(self.map[i]){
						DBManager.manager.delete(i,function () {
							num2++;
							if(num1==num2){
								$.cookie('working-revision',0);
								window.location.reload();
							}
						});
					}
				}
				
			})
			.fail(function () {
				$('.save-message',this.$el).html("<span class='save-fail'><i class='icon-refresh'/> 提交失败</span>");
			})
			$('.save-message',this.$el).html("<span class='save-doing'><i class='icon-refresh'/> 正在提交</span>");
		},
		//当删除某更改时，若原action是add，需要将文件从文件树中删除。
		//				若action是delete，需要将文件添加到文件树中。
		deleteChange:function () {
			var li=$(event.target).closest('li');
			var action=li.attr('action');
			var kind=li.attr('kind');
			var path=li.attr('path');
			var self=this;
			DBManager.manager.delete(path,function () {
				li.remove();
				if(action=='add'){
					self.bodyView.fileList.removeUnique(path);
				}else if(action=='delete'){
					self.bodyView.fileList.addUnique({path:path,kind:kind,name:path.split('/').peek()});
				}
			});
		},
		checkChange:function () {
			var path=$(event.target).closest('li').attr('path');
			if($(event.target).prop('checked')){
				this.map[path]=true;
			}else{
				this.map[path]=false;
			}
		}
	})
	return ComponentChangeView;
})