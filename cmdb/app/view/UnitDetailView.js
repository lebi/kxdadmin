define(['jquery','underscore','backbone','Unit'],
	function ($,_,Backbone,Unit) {

	var UnitDetailView=Backbone.View.extend({
		el:$('.detail-wrapper'),
		template:_.template($('#unit-detail-temp').html()),
		initialize:function (id,callback) {
			this.unitDetail=new Unit({id:id});
			this.unitDetail.on('change',this.render,this);
			this.unitDetail.fetch({wait:true});
			callback(this.unitDetail);
		},
		createView:function (id) {
			this.unitDetail.attributes.id=id;
			// this.unitDetail.set('id',id);
			var self=this;
			this.unitDetail.fetch().done(function  () {
				self.unitDetail.trigger('chooseChange');
			})
		},
		render:function () {
			this.$el.empty()
			this.$el.append(this.template({detail:this.unitDetail}));
		}
	})

	/*	@Variables: detail:和detailView的detail相绑定，当detailView的值改变，就会触发chooseChange。
	*				detailTemp:这个更改后的unit缓存，和input等相绑定，修改触发myupdate。
	*				propertyTemp:新属性缓存，和modal框绑定，在选择添加后将属性添加到detailTemp中，并将其初始化。
	*/
	var UnitEditView=Backbone.View.extend({
		el:$('.manage-wrapper'),
		events:{
			'change .unit-manage input':'bindValue',
			'change #property-modal input':'bindProperty',
			'click #add-property':'addProperty',
			'click #save':'save'
		},
		template:_.template($('#unit-edit-temp').html()),
		/*
		*   @Usage: 初始化detail,detailTemp,propertyTemp。
		*/
		initialize:function (detail,active,unitList) {
			this.unitList=unitList;
			this.active=active;

			this.detail=detail;
			this.detail.on('chooseChange',this.changeDetail,this);

			this.detailTemp=this.detail.clone();
			this.detailTemp.on('myupdate',this.render,this);

			this.propertyTemp={code:'',description:'',value:'',name:''};

			this.render();
		},
		/*
		*   @Usage: 当view的功能改变时（从添加变成编辑或反之），重新初始化值。
		*/
		setDetail:function (detail) {
			this.detail=detail;
			this.detail.on('chooseChange',this.changeDetail,this);
			this.detailTemp=this.detail.clone();
			this.detailTemp.on('myupdate',this.render,this);

			this.propertyTemp={code:'',description:'',value:'',name:''};

			this.render();
		},
		/*
		*   @Usage: 当单位列表选择其他单位时，修改本地缓存，并重新渲染页面。
		*/
		changeDetail:function () {
			this.detailTemp.set(this.detail.toJSON());
			this.detailTemp.trigger('myupdate');
		},
		/*
		*   @Usage: tab栏选择的是单位管理时，选择渲染view，否则返回。
		*/
		render:function () {
			// console.log(this.detailTemp);

			if(this.active.now!='edit')return;
			this.getParent();
			$('.manage-wrapper').empty();
			$('.manage-wrapper').append(this.template({detail:this.detailTemp,parent:this.parent}));
		},
		/*
		*   @Usage: 根据pid，获取父单位的对象。
		*/
		getParent:function () {
			var pid=this.detail.get('parent');
			var parent=this.unitList.get(pid);
			if(!parent){
				parent=new Unit({id:0});
			}
			this.parent=parent;
		},
		/*
		*   @Usage: 绑定input和detailTemp。有基本熟悉和扩展属性两种情况。
		*/
		bindValue:function () {
			var name=$(event.target).attr('name');
			var value=$(event.target).val();

			var keys=this.detailTemp.keys();
			if(name!='extend'&&keys.indexOf(name)>=0){
				this.detailTemp.set(name,value);
			}else{
				var extend=this.detailTemp.get('extend');
				for(var i in extend){
					if(extend[i].name==name)
						extend[i].value=value;
				}
			}
			// console.log(this.detail);
			// console.log(this.detailTemp);
		},
		/*
		*   @Usage: 绑定modal和propertyTemp。
		*/
		bindProperty:function () {
			var name=$(event.target).attr('name');
			this.propertyTemp[name]=$(event.target).val();
		},
		/*
		*   @Usage: 将propertyTemp添加到detailTemp中。并将propertyTemp重置。
		*/
		addProperty:function () {
			var name=this.propertyTemp.name;
			if(!name){
				alert("属性不能为空");
				return;
			}
			for(var i in this.detailTemp.get('extend')){
				if(this.detailTemp.get('extend')[i].name==name){
					alert("该属性已存在");
					return;
				}
			}
			this.detailTemp.get('extend').push(this.propertyTemp);
			this.propertyTemp={code:'',description:'',value:'',name:''};
			this.detailTemp.trigger('myupdate');
			$('.modal-backdrop').remove();
		},
		/*
		*   @Usage: 将detail保存，detail.set会出发detail的change，使detailView也改变。
		*			将navView.unitList更新。
		*/
		save:function () {
			if(!(this.detailTemp.get('name')&&this.detailTemp.get('code'))){
				alert('名称编码不能为空');
				return;
			}

			var self=this;
			var dom=$(event.target);
			this.detailTemp.save().done(function () {
				self.detail.set(self.detailTemp.toJSON());
				self.unitList.fetch({reset: true});
				$(dom).after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1500);
			})
			.fail(function () {
				$(dom).after(" <span id='save-hint' class='fail'> <i class='icon-remove'></i> 保存失败</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1500);
			})
		}
	})
	return UnitDetailView;
})