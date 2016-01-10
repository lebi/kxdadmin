define(['jquery','underscore','backbone','WrapperView','DiffEntry'],
	function ($,_,Backbone,WrapperView,DiffEntry) {
	var DiffView=WrapperView.extend({
		template:_.template($('#diff-temp').html()),
		events:{
			'change #diff-board .file-type select':'changeMode'
		},
		initialize:function () {
		},
		createView:function (fileA,rA,fileB,rB) {
			this.model=new DiffEntry({fileA:fileA,rA:rA,fileB:fileB,rB:rB});
			this.model.on('change',this.render,this);
			this.model.save().fail(function(data){
				alert('参数错误，文件不存在');
				// console.log(data);
			})
		},
		render:function () {
			console.log('diff');
			this.$el.empty()
			this.$el.append(this.template({detail:this.model}));
			this.editor = ace.edit("diff")
		    this.editor.setTheme('ace/theme/vibrant_ink')
		    this.editor.setReadOnly(true);
		    this.editor.session.setMode("ace/mode/perl");
		    this.editor.setShowPrintMargin(false)
		}
	})

	return DiffView;
})