define(['jquery','underscore','backbone','WrapperView','FileConflict'],
	function ($,_,Backbone,WrapperView,FileConflict) {

	var ConflictEditView=WrapperView.extend({
		el:$('.page-wrapper'),
		events:{
			'change #conflict-board .file-type select':'changeMode',
			'click #conflict-board #search':'search',
			'keypress #conflict-board input[name=search]':'keypressSearch',
			'click #conflict-board #replace':'replace',
			'click #conflict-board #replace-all':'replaceAll',
			'click #conflict-board #search-all':'searchAll',
			'click #conflict-board .resolve':'resolve'
		},
		template:_.template($('#conflict-editor-temp').html()),
		initialize:function(obj){
			this.conflictRightNav=obj.nav;
		},
		createView:function (path) {
			this.path=path;
			DBManager.manager.getOne(this.path,this.render,this)
		},
		render:function (data) {
			this.data=data;
			this.$el.empty();
			var detail=new FileConflict({path:data.path,content:data.content,action:data.action,resolve:data.resolve});
			var self=this;
			detail.save().done(function(result){
				self.$el.append(self.template({data:data,result:result.result}));
		    	self.editor = ace.edit("conflict")
		    	self.editor.setTheme('ace/theme/vibrant_ink')
		    	self.editor.session.setMode("ace/mode/xml");
		    	self.editor.setShowPrintMargin(false)
			})
		},
		/*
		*	@Usage: 	after user edit the conflict, set it resolved.
		*				save the data in indexDB, update data's date,content and resolve.
		*/
		resolve:function(){
			this.data.date=new Date().getTime();
			this.data.content=this.editor.session.getDocument().getValue();
			this.data.resolve=1;
			var doing="<span class='save-doing'><i class='icon-refresh'/> 正在保存</span>";
			var success="<span class='save-success'><i class='icon-ok-sign'/> 已保存</span>";
			var fail="<span class='save-fail'><i class='icon-warning-sign'/> 保存失败</span>";
			var self=this;
			DBManager.manager.update(this.data,function () {
				$('.save-message').html(success);
				setTimeout(function () {
					$('.save-message').html('');
				},1000)
				self.conflictRightNav.createView();
			});
			$('.save-message').html(doing);
		}
	})
	return ConflictEditView;
})