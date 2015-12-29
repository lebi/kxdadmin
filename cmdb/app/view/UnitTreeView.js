
define(['jquery','underscore','backbone','UnitList'],
	function ($,_,Backbone,UnitList) {

	/*
	*	单位选择单位视图，在页面第一次加载时就创建。
	*/
	var UnitTreeView=Backbone.View.extend({
		events:{
			'click .tree-icon':'toggle',
			'click .unit-li>a':'choose',
			'click #unit-choose':'unitChoose'
		},
		el:$('#unit-modal'),
		template:_.template($('#unit-nav-temp').html()),
		initialize:function () {
			this.unitList=new UnitList();
			this.unitList.on('reset',this.render,this);
			this.unitList.fetch({reset: true});
		},
		render:function () {
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
			$('.unit-tree').append(this.template({trees:this.tree.children,parent:0}));
		},
		toggle:function () {
			var parent=$(event.target).closest('.unit-li');
			if(parent.hasClass('active'))
				parent.removeClass('active');
			else
				parent.addClass('active');
		},
		choose:function () {
			this.uid=parseInt($(event.target).closest('a').attr('uid'));
			$('.unit-li>a.choose').removeClass('choose');
			$(event.target).closest('a').addClass('choose');
		},
		showView:function (model) {
			if(model.get('unitId')){
				this.uid=model.get('unitId');
				$('#unit-modal .unit-li>a.choose').removeClass('choose');
				$('#unit-modal .unit-li>a[uid='+this.uid+']').addClass('choose');
			}
			this.$el.modal('show');
			this.model=model;
		},
		unitChoose:function() {
			if(!this.uid){
				alert('请选择单位');
				return;
			}
			this.model.set('unitId',this.uid);
			this.model.set('unit',this.unitList.get(this.uid).get('name'));
			this.$el.modal('hide');
			this.model.trigger('myupdate');
			this.uid=null;
		}
	})
	return UnitTreeView;
})