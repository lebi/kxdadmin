define(['jquery','underscore','backbone','RightNavView'],
	function ($,_,Backbone,RightNavView) {

	var WrapperView=Backbone.View.extend({
		el:$('.page-wrapper'),
		initialize:function (obj) {
			this.fileRightNav=obj.nav;
		},
		changeMode:function () {
			var mode=$('.file-type select').val();
			switch (mode){
				case 'ini':
					this.editor.session.setMode("ace/mode/coffee");
					break;
				case 'xml':
					this.editor.session.setMode("ace/mode/xml");
					break;
				case 'diff':
					this.editor.session.setMode("ace/mode/perl");
					break;
			}
		},
		search:function(){
			var str=$('input[name=search]').val();
			this.editor.find(str,{regExp:true},true);
		},
		keypressSearch:function(){
			if(event.keyCode==13)
				this.search();
		},
		replace:function(){
			var origin=$('input[name=origin]').val();
			var revise=$('input[name=revise]').val();
			this.editor.replace(revise,{needle:origin});
		},
		replaceAll:function(){
			var origin=$('input[name=origin]').val();
			var revise=$('input[name=revise]').val();
			this.editor.replaceAll(revise,{needle:origin});
		},
		searchAll:function(){
			var str=$('input[name=search]').val();
			this.editor.findAll(str,{needle:str,regExp:true},true);
		},
		fitFileType:function (path) {
			var fileType=path.match(/\.(\w+)$/)[1];
			switch (fileType){
				case 'xml':
					$('.file-type select option[value=xml]').prop('selected',true);
					break;
				default:
					$('.file-type select option[value=ini]').prop('selected',true);
					break;
			}
			$('.file-type select').trigger('change')
		}
	})
	return WrapperView;
})