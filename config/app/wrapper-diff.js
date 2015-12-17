define('model','wrapper',function(){
	var DiffEntry=MyModel.extend({
		url:'/svnserviceAPI/file/diff',
		defaults:{
			fileA:null,
			rA:null,
			fileB:null,
			rB:null,
			diff:null
		}
	})

	var DiffView=WrapperView.extend({
		events:{
			'change .file-type select':'changeMode'
		},
		initialize:function (fileA,rA,fileB,rB) {
			this.model=new DiffEntry({fileA:fileA,rA:rA,fileB:fileB,rB:rB});
			this.model.on('change',this.render,this);
			this.model.save().fail(function(data){
				alert('参数错误，文件不存在');
				// console.log(data);
			})
		},
		render:function () {
			//console.log(this.model);
			var temp=_.template($('#diff-temp').html());
			$('.page-wrapper').append(temp({detail:this.model}));
			this.editor = ace.edit("diff")
		    this.editor.setTheme('ace/theme/vibrant_ink')
		    this.editor.setReadOnly(true);
		    var XMLMode = require("ace/mode/perl").Mode;
		    this.editor.session.setMode(new XMLMode());
		    this.editor.setShowPrintMargin(false)
			this.$el=$('.diff-board');
			this.delegateEvents();
		}
	})
})
