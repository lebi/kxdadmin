define(['require','jquery','underscore','backbone','AssetTypeList','Asset','AssetRouter','TimePicker'],
	function (require,$,_,Backbone,AssetTypeList,Asset,AssetRouter,TimePicker) {
		// console.log(new AssetRouter.AssetRouter());
	/*
	*	编辑资产信息，可以选择单位和资产类型。
	*/
	var AssetEditView=Backbone.View.extend({
		el:$('.content'),
		template:_.template($('#asset-edit-temp').html()),
		events:{
			//绑定资产属性的值
			'change .asset-edit input':'bindValue',
			//选择资产类型，修改该类型相应属性
			'change .asset-edit select':'bindType',
			//保存资产
			'click .asset-edit #save':'save',
			//跳出单位选择框
			'click .asset-edit #unit':'unitShow'
		},
		initialize:function () {
			this.asset=new Asset();
			this.asset.on('myupdate',this.render,this);

			this.typeList=new AssetTypeList();
			this.typeList.on('sync',this.render,this);
			this.typeList.fetch();
		},
		//由router调用，当选择的资产改变时，更新资产模型
		changeModel:function (id) {
			var self=this;
			this.asset.set('id',id);
			this.asset.fetch().done(function () {
				self.asset.trigger('myupdate');
			})
		},
		render:function () {
			console.log(this.asset);
			this.$el.empty()
			this.$el.append(this.template({
				asset:this.asset.attributes,
				typeList:this.typeList
			}));
			$('.datetimepicker').remove();
			$(".form_datetime").datetimepicker({
	        	format: "yyyy-mm-dd",
	        	autoclose:true,
	        	startView: 4, 
	        	minView: 2,
	        });

		},
		/*
		*	当使用timepicker选择日期时，event是点击事件。
		*/
		bindValue:function () {
			if(event.type=='click'){
				var apply=$('input[name=applyTime]',this.$el).val();
				var purchase=$('input[name=purchaseTime]',this.$el).val()
				this.asset.set('applyTime',apply?apply:null);
				this.asset.set('purchaseTime',purchase?purchase:null);
				return;
			}
			var name=$(event.target).attr('name');
			var value=$(event.target).val();
			var keys=this.asset.keys();

			if(name!='extend'&&keys.indexOf(name)>=0){
				this.asset.set(name,value);
			}else{
				var extend=this.asset.get('properties');
				for(var i in extend){
					if(extend[i].name==name)
						extend[i].value=value;
				}
			}
		},
		bindType:function () {
			var tid=$(event.target).val();
			if(confirm("改变资产类型会删除原有的扩展属性信息，确认改变？")){
				var model=this.asset;
				var self=this;
				//更新资产的类型和扩展属性
				$.ajax({
					method:'POST',
					url:'/cmdbAPI/asset/type',
					data:{id:model.get('id'),typeId:tid},
					success:function (data) {
						model.set('typeDetail',data.result);
						self.setAssetType(model,data.result);
						model.trigger('myupdate');
					}
				})
			}else{
				$(event.target).val(this.asset.get('typeDetail').id);
			}
		},
		save:function () {
			if(!(this.asset.get('name')&&this.asset.get('code'))){
				alert('名称和编码不能为空');
				return;
			}
			if(!(this.asset.get('unitId')&&this.asset.get('typeId'))){
				alert('为选择单位和资产类型');
				return;
			}
			var dom=$(event.target);
			this.asset.save().done(function () {
				$(dom).after(" <span id='save-hint'> <i class='icon-ok-sign'></i> 保存成功</span>");
				setTimeout(function () {
					$('#save-hint').remove();
				},1500);
			})
		},
		/*
		*	当资产类型改变后，将类型的相应信息绑定到资产上，包括类型的属性列表，属性名和属性ID
		*/
		setAssetType:function (model,type) {
			model.set('properties',[])
			_.each(type.properties,function (p) {
				model.get('properties').push({
					id:null,
					code:p.code,
					name:p.name,
					value:'',
					assetId:model.get('id'),
					pid:p.id
				});
			})
			model.set('typeId',type.id);
			model.set('type',type.name);
		},
		unitShow:function () {
			require('AssetRouter').unit.showView(this.asset);
		}
	})
	return AssetEditView;
})