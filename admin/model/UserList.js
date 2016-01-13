define(['collection','User'],function (MyCollection,User) {
	var UserList=MyCollection.extend({
		model:User,
		url:'/webserviceAPI/admin/user'
	})
	return UserList;
})