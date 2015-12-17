
var WrapperView=Backbone.View.extend({
	changeMode:function () {
		var mode=$('.file-type select').val();
		switch (mode){
			case 'ini':
	    		var coffeeMode = require("ace/mode/coffee").Mode;
				this.editor.session.setMode(new coffeeMode());
				break;
			case 'xml':
	    		var xmlMode = require("ace/mode/xml").Mode;
				this.editor.session.setMode(new xmlMode());
				break;
			case 'diff':
	    		var perlMode = require("ace/mode/perl").Mode;
				this.editor.session.setMode(new perlMode());
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



