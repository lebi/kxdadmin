define(['jquery','underscore','backbone','ComponentFileEntryCollection'],
	function ($,_,Backbone,ComponentFileEntryCollection) {

	var ComponentView=Backbone.View.extend({
		el:$('.page-wrapper'),
		template:_.template($('#component-temp').html()),
		initialize:function(){
		},
		createView:function (revision,path) {
			if(!revision)return;
			this.revision=revision;
			this.path=path;
			this.fileList=new ComponentFileEntryCollection();

			this.fileList.on('update',this.render,this);
			this.fileList.fetch({data:{v:revision.get('revision'),path:this.path}});
		},
		render:function () {
			this.$el.empty();
			$('.page-wrapper').append(this.template({fileList:this.fileList,path:this.path}));
		}
	})
	return ComponentView
})