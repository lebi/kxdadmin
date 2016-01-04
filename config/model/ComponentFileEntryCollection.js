define(['jquery','underscore','backbone','collection','ComponentFileEntry'],function ($,_,Backbone,MyCollection,ComponentFileEntry) {
	var ComponentFileEntryCollection=MyCollection.extend({
		model:ComponentFileEntry,
		url:'/svnserviceAPI/list/component'
	})
	return ComponentFileEntryCollection;
})