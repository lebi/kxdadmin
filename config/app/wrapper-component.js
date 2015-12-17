
var ComponentFileEntry=MyModel.extend({
	defaults:{
		path:null,
		revision:null,
		name:null,
		time:null,
		author:null,
		comment:null
	}
})

var ComponentFileEntryCollection=MyCollection.extend({
	model:ComponentFileEntry,
	url:'/svnserviceAPI/list/component'
})

//$el:$('.component-content')
var ComponentView=Backbone.View.extend({
	initialize:function(revision,path){
		//console.log('comp view')
		if(!revision)return;
		this.revision=revision;
		this.path=path;
		this.fileList=new ComponentFileEntryCollection();

		this.fileList.on('update',this.render,this);
		this.fileList.fetch({data:{v:revision.get('revision'),path:this.path}});
	},
	render:function () {
		var temp=_.template($('#component-temp').html());
		$('.page-wrapper').append(temp({fileList:this.fileList,path:this.path}));
		this.$el=$('#component-file-list');
		this.delegateEvents();
	}
})