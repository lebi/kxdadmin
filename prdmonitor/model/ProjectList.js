define(['collection','Project'],function (MyCollection,Project) {

	var ProjectList=MyCollection.extend({
		model:Project,
		url:"/demo/project/list"
	})
	return ProjectList;
})