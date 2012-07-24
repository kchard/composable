composable.js
==========

**A javascript library used to create composable components for building client side applications**

The composable.js library is intended allow developers to quickly define and compose components used to build client side applications. With composable.js, building apps is as easy as:

1. Define a model factory

2. Define a resource factory

3. Define a view factory

4. Compose factories to build composite objects that provide the functionality for the application

The central design pricipal of composable.js is that each facet of the application (model, resource, view, etc...) can be developed and tested independently and then composed to create a single object with as much or as little functionality as is needed.
 

Getting Started
---------------

	var personModelFactory = Composable.model.def({validate: function(key, value) { console.log(key + "->" + value); }});
	var personResourceFactory = Composable.resource.def({baseUrl: "/service/person"});
	var personViewFactory = Composable.view.def({render: function(model) { console.log(model); }});

	var compositeFactory = Composable.def(personModelFactory).and(personResourceFactory).withView(personViewFactory);
	
	var people = compositeFactory.create({});
	
	//Populate the model with the data defined at the resource and render the view
	people.refresh();
	
	//Log each person's name
	people.each(function(index, person) {
		console.log(person.get("name"));
	});
	
	//Update the first persons name, persist it to the server, and render the view
	var person = people.get("0");
	person.set("name", "Kevin");
	person.save(function() {
		people.render();
	});
	
	