define(['jquery','underscore','backbone','TypeList','Role','RoleOperation'],function ($,_,Backbone,TypeList,Role,RoleOperation) {

	/*
	* The view to show roles list, edit role's permit and add new role;
	* @Attr:roleList,resourceList,roleindex;
	*/


	var RoleAdminView=Backbone.View.extend({
		el:$('.tool-wrapper'),
		events:{
			'click #role-admin .module-name':'tableSlide',
			'click #role-admin .cancel-submit':'hideSubmit',
			'click #role-admin #permission-submit':'roleSubmit',
			'click #role-admin .edit-role':'editRole',
			'click #role-admin #add-new-role':'addRole',
			'click #role-admin .edit-operation':'editOperation',
			'click #role-admin .delete-role':'deleteRole',
			'change #role-admin .role-admin-form input':'bindRole',
			'click #role-admin .op-remove':'removeOperation',
			'click #role-admin .op-add':'addOperation',
			'click #role-admin .op-slide-up':'opSlideUp'
		},
		initialize:function (roleList,show) {
			this.roleList=roleList;
			this.typeList=new TypeList();
			this.typeList.fetch();

			this.show=show;
			this.roleindex=null;

			this.typeList.on('update',this.render,this);
			this.roleList.on('update',this.render,this);
		},
		showView:function () {
			this.roleList.fetch();
		},
		render:function () {
			if(this.show.target!='role') return;
			this.$el.empty();
			var temp=_.template($('#role-admin-temp').html());
			this.$el.append(temp({roleList:this.roleList,typeList:this.typeList}));
		},
		tableSlide:function (event) {
			var target=event.target;
			var table=$(target).parent().find('.checkbox');
			var icon=$(target).find('i');
			var display=table.css('display');
			if(display=='none'){
				table.slideDown('fast');
				icon.removeClass('icon-double-angle-down').addClass('icon-double-angle-up');
			}else{
				table.slideUp('fast');
				icon.removeClass('icon-double-angle-up').addClass('icon-double-angle-down');
			}
		},
		bindRole:function () {
			var name=$(event.target).attr('name');
			this.editrole.set(name,$(event.target).val());
		},
		hideSubmit:function  (event) {
			$('.role-admin-form').slideUp('fast');
		},
		addRole:function() {
			this.editrole=new Role();
			$('.role-admin-form input',this.$el).val('');
			$('.role-admin-form').slideDown('fast');
		},
		editRole:function () {
			$('.module-list input[type=checkbox]').prop('checked',false);

			var index=$(event.target).closest('tr').attr('rid');
			this.editrole=this.roleList.get(index);
			$('.role-admin-form input[name=name]',this.$el).val(this.editrole.get('name'));
			$('.role-admin-form input[name=code]',this.$el).val(this.editrole.get('code'));
			$('.role-admin-form').slideDown('fast');
		},
		roleSubmit:function () {
			if(!(this.editrole.get('name')&&this.editrole.get('code'))){
				alert('输入不能为空');
				return;
			}
			var self=this;
			this.editrole.save().done(function (result){
				var role=self.editrole.clone();
				if(result.errorMsg==null){
					self.roleList.add(role);
					self.roleList.trigger('update');
				}
					
			});
			$('.role-admin-form').slideUp('fast');
		},
		deleteRole:function () {
			var i=$(event.target).closest('tr').attr('rid');
			this.roleList.get(i).destroy();
		},
		removeOperation:function () {
			var rid=$('#operation-view').attr('rid');
			var oid=$(event.target).closest('.badge').attr('oid');
			var roleOp=new RoleOperation({id:oid});
			var self=this;
			roleOp.destroy().done(function () {
				self.updateOpView(rid);
			})
		},
		addOperation:function () {
			var rid=$('#operation-view').attr('rid');
			var operation=$(event.target).closest('.badge').attr('operation');
			var roleOp=new RoleOperation({role:rid,operation:operation});
			var self=this;
			roleOp.save().done(function () {
				self.updateOpView(rid);
			})
		},
		updateOpView:function (rid) {
			var self=this;
			var role=this.roleList.get(rid);
			role.fetch().done(function () {
				self.roleList.add(role);
				var temp=_.template($('#operation-temp').html());
				$('#operation-list').html(temp({typeList:self.typeList,role:role}));
			})
		},
		editOperation:function () {
			var rid=$(event.target).closest('tr').attr('rid');
			var temp=_.template($('#operation-temp').html());
			$('#operation-list').html(temp({typeList:this.typeList,role:this.roleList.get(rid)}));
			$('#operation-list').slideDown('fast');
		},
		opSlideUp:function () {
			console.log(event.target)
			$('#operation-list').slideUp('fast');
		}
	})
	return RoleAdminView;
})