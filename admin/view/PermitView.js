define(['jquery','underscore','backbone','RoleList','UnitList','PermitList'],function ($,_,Backbone,RoleList,UnitList,PermitList) {

	var PermitView=Backbone.View.extend({
		events:{
			'click #permit-admin .delete-permit':'delete',
			'change #permit-admin input':'search'
		},
		el:$('.tool-wrapper'),
		template:_.template($('#permit-admin-temp').html()),
		initialize:function (show) {
			this.show=show;
			this.permitList=new PermitList();
			this.unitList=new UnitList();
			this.roleList=new RoleList();

			this.permitList.on('update',this.render,this);
			this.unitList.on('update',this.render,this);

			this.unitList.fetch();
			this.search={username:'',rolename:'',unitname:''};
		},
		showView:function () {
			this.permitList.fetch();
			this.roleList.fetch();
		},
		render:function () {
			if(this.show.target!='permit') return;
			if(this.unitList.length>0){
				var self=this;
				this.permitList.each(function (permit) {
					permit.set('unitname',self.unitList.get(permit.get('unit')).get('name'));
				})
			}
			var search=this.search;
			var list=this.permitList.reduce(function (memo,p) {
				var reg=new RegExp('.*'+search.username+'.*');
				if(!reg.test(p.get('username')))
					return memo;

				reg=new RegExp('.*'+search.rolename+'.*');
				if(!reg.test(p.get('rolename')))
					return memo;

				reg=new RegExp('.*'+search.unitname+'.*');
				if(!reg.test(p.get('unitname')))
					return memo;
				memo.add(p)
				return memo
			},new Backbone.Collection())
			this.$el.html(this.template({permitList:list,search:this.search}));
		},
		delete:function () {
			var id=$(event.target).closest('tr').attr('pid');
			this.permitList.get(id).destroy();
		},
		search:function () {
			var name=$(event.target).attr('name');
			this.search[name]=$(event.target).val();
			this.render();
		}
	})

	return PermitView;
})