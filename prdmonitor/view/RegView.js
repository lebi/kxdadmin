define(['jquery','underscore','backbone','cookie','bootstrap','util'],
	function ($,_,Backbone,cookie,bootstrap,util) {
/*************************************************************************************************************************************************/
//
//															this view show the details of a regular expression
//																edit thie view to update the regualr expression
//																		and update it's parameters 
//																
//
/*************************************************************************************************************************************************/
	var RegView=Backbone.View.extend({
		el:$('.service'),
		events:{
			'click .edit-reg':'renderEdit',
			'click .save-reg':'saveReg',
			'click .add-param':'addParam',
			'click .cancel-reg':'cancelEdit',
			'keyup input[name=regexp]':'printMatch',
			'keyup input[name=paramCal]':'printMatch',
			'click input[name=datatype]':'printOutput'
		},
		permissions:{
			'.edit-reg':'/kxdadmin/chart/reg/U'
		},
		initialize:function (regModel) {
			this.model=regModel;
			if(this.model.get('host')==null&&this.model.get('service')!=null)
				this.model.url='/demo/chart/reg/service';
			var temp=_.template($("#service-temp").html());
			$('.setting-list').append(temp({reg:this.model}));
			this.$el=$('#service'+this.model.get('objectId'));
			this.delegateEvents();
			this.delegatePermissions();
		},
		renderEdit:function () {
			var next=this.$el.next();
			var temp=_.template($("#edit-temp").html());
			this.$el.remove();
			if (next.length!=0) 
				$(next).before(temp({reg:this.model}));
			else
				$('.setting-list').append(temp({reg:this.model}));
			this.$el=$('#service'+this.model.get('objectId'));
			this.delegateEvents();
			this.printMatch();
		},
		saveReg:function() {
			var regexp=$('input[name=regexp]',this.$el).val();
			var datatype=$('input[name=datatype]:checked').attr('value');
			var param="";
			var rule="";
			$('input[name=param]',this.$el).each(function (){
				if($(this).val()!="")
					param+=$(this).val()+";";
			})
			$('input[name=paramCal]',this.$el).each(function (){
				if($(this).val()!="")
					rule+=$(this).val()+";";
			})

			param=param.substr(0,param.length-1);
			rule=rule.substr(0,rule.length-1);

			this.model.set('dataType',datatype);
			this.model.set('reg',regexp);
			this.model.set('parameters',param);
			this.model.set('parametersCal',rule);
			var self=this;
			this.model.save()
			.done(function (model){
				self.model.set('id',model.result.id);
				var next=self.$el.next();
				var temp=_.template($("#service-temp").html());
				console.log(self.$el);
				self.$el.remove();
				if (next.length!=0) 
					$(next).before(temp({reg:self.model}));
				else
					$('.setting-list').append(temp({reg:self.model}));
				self.$el=$('#service'+self.model.get('objectId'));
				self.delegateEvents();
			})
		},
		addParam:function() {
			$('.param-input',this.$el).append('<input class="form-control content-input" name="param">');
			$('.paramCal-input',this.$el).append('<input class="form-control content-input" name="paramCal">');
		},
		cancelEdit:function() {			
			var next=this.$el.next();
			var temp=_.template($("#service-temp").html());
			this.$el.remove();
			if (next.length!=0) 
				$(next).before(temp({reg:this.model}));
			else
				$('.setting-list').append(temp({reg:this.model}));
			this.$el=$('#service'+this.model.get('objectId'));
			this.delegateEvents();
		},
		printMatch:function () {
			$('span[name=output]').empty();
			var paramList=new Array();
			var ruleList=new Array();
			$('input[name=param]',this.$el).each(function (){
				paramList.push($(this).val());
			})
			
			$('input[name=paramCal]',this.$el).each(function (){
				ruleList.push($(this).val());
			})

			var output=$('.outputdata',this.$el).text()
			var reg=new RegExp($('input[name=regexp]').val());
			for(var i=0;i<paramList.length;i++){
				var result=reg.calculate(output,ruleList[i]);
				$('span[name=output]').append(paramList[i]+":"+result+"; ");
			}
		},
		printOutput:function() {
			var datatype=$('input[name=datatype]:checked').attr('value');
			if(datatype==0)
				$('.outputdata',this.$el).html(this.model.get('perfdata'));
			else
				$('.outputdata',this.$el).html(this.model.get('output'));
		}
	})
	return RegView;
})