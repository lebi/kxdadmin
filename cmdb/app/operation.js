require.config({
	paths:{
		jquery:'../../lib/jquery-1.11.3.min',
		underscore:'../../lib/underscore-min',
		backbone:'../../lib/backbone',
		cookie:'../../lib/jquery.cookie',
		bootstrap:'../../lib/bootstrap.min',
		model:'../../js/base-model',
		collection:'../../js/base-collection',
	}
})

define(['underscore','backbone','cookie'],function (_,Backbone,cookie) {
	var OperationNavView=Backbone.View.extend({
		el:$('.operation-nav'),
		template:_.template($('#operation-nav-temp').html()),
		events:{
			'click .unit-li>a>span':'edit',
			'click .tree-icon':'toggle'
		},
		initialize:function () {
			this.render();
			this.edit=new OperationEditView();
		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template());
		},
		edit:function () {
			this.edit.render();
		},
		toggle:function () {
			var li=$(event.target).closest('.unit-li');
			if(li.hasClass('active'))
				li.removeClass('active');
			else
				li.addClass('active')
		}
	})

	var OperationEditView=Backbone.View.extend({
		el:$('.operation-edit'),
		template:_.template($('#operation-edit-temp').html()),
		initialize:function () {

		},
		render:function () {
			this.$el.empty();
			this.$el.append(this.template());
		}
	})

	new OperationNavView()
})