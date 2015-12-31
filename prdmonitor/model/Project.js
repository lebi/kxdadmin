define(['model'],function (MyModel) {
	var Project=MyModel.extend({
		urlRoot:"/demo/project",
		defaults:{
			"id":null,
			"name":null,
			"status":null
		},
	})
	return Project;
})