
define(['jquery','underscore','backbone','cookie','UnitList'],
	function ($,_,Backbone,cookie,UnitList) {

	var UnitNavView=Backbone.View.extend({
		el:$('.unit-nav'),
		template:_.template($('#unit-nav-temp').html()),
		events:{
			'click .tree-icon':'toggle',
			'click .unit-li>a':'choose',
			'click .remove':'remove'
		},
		initialize:function () {
			this.unitList=new UnitList();
			this.unitList.on('reset',this.render,this);
			var self=this;
			this.unitList.fetch({reset: true}).done(function () {
				var uid=$.cookie('unitChoose');
				window.location.href="#detail?"+uid;
			});
		},
		/*
		*	@tips: 	root's layer is '/{id}'
		*			if parent's id is 5 and it's layer is /1/4/5
		*			it's children's layer is /1/4/5/{id}
		*/
		render:function () {
			console.log('units update');
			var stack=[];
			this.tree={children:[]};
			var self=this;
			this.unitList.each(function (u) {
				var obj=u.toJSON();
				obj.children=[];
				if(stack.length==0){
					self.tree.children.push(obj);
					stack.push(obj);
				}else{
					while(stack.length!=0){
						var peek=stack[stack.length-1];
						var reg=new RegExp('^'+peek.layer+'/');
						if(reg.test(obj.layer)){
							peek.children.push(obj);
							stack.push(obj);
							break;
						}else{
							stack.pop();
						}
					}
					if(stack.length==0){
						self.tree.children.push(obj);
						stack.push(obj);
					}
				}
			})
			this.$el.children('ul').remove();
			this.$el.append(this.template({trees:this.tree.children,parent:0}));
			var uid=$.cookie('unitChoose');
			if(uid)
				$('.unit-li>a[uid='+uid+']').addClass('choose');
			else
				$($('.unit-li>a').get(0)).addClass('choose');
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');

			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		},
		choose:function () {
			var uid=$(event.target).attr('uid');
			$.cookie('unitChoose',uid);
			$('.unit-li>a.choose').removeClass('choose');
			$(event.target).closest('a').addClass('choose');
		},
		remove:function () {
			var uid=$(event.target).closest('a').attr('uid');
			var self=this;
			this.unitList.get(uid).destroy().done(function () {
				if($.cookie('unitChoose')==uid)
					$.cookie('unitChoose',0);
				self.unitList.trigger('reset');
			})
			.fail(function(data) {
				if(data.status==409)
					alert("删除失败，该单位有子单位或包含子资产");
			})
		}
	})
	return UnitNavView;
})