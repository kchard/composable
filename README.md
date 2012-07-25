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
	
API
==========
##Interfaces:
The library depends on two key abstractions to define and create components. A **component** is defined by implementing a function that accepts a **spec**ification and a **context**. The specification should be an object that consists of properties that are invariant with respect to component instance creation. The context should be an object that consists of properties that are specific to each component instance. The result of invoking a component function should be an instance of the component. A **factory** is defined by implementing a function that accepts a **component** definition and a  **spec**ification. The result of invoking the a factory definition function will be a new factory that can be composed with other factories or used to create instances of components.

###component( specs, context )
&nbsp;&nbsp;**returns** - an instance of a component with the given specification and context

###factory( component, specs )
&nbsp;&nbsp;**returns** - an instance of a factory for a component with the given specification

&nbsp;&nbsp;**and( factory )** - returns a new composite factory

&nbsp;&nbsp;**create( context )** - returns a new instance of a component with the given context


##Components:
The library defines three component types used to create an application. They are model, resource, and view. 

###model
A model can be defined by passing a validation function as part of the specification. This function will be called each time a property is set on the model. Instances of a model component can be created by passing a context which can contain a data property. 

&nbsp;&nbsp;**each( callback )** - invokes the callback (function( key, value)) for each item in the model

&nbsp;&nbsp;**get( key )** - return the property with given key

&nbsp;&nbsp;**set( key, value )** - set the property with the given key

&nbsp;&nbsp;**setAll( props, exclude)** - sets all properties from the props object with the expception of keys supplied in the exclude array

&nbsp;&nbsp;**errors** - a map of errors associated with property keys

&nbsp;&nbsp;**isValid( )** - returns true if there are no errors

###resource
A resource can be defined by passing a baseUrl property as part of the specification. This property will be used to interact with a JSON over HTTP web service. Instances of a resource component can be created by passing a context which can contain a data property. 

&nbsp;&nbsp;**getData()** - returns the data associated with this components context

&nbsp;&nbsp;**getBaseUrl()** - returns the url used to communicate with server side web services

&nbsp;&nbsp;**fetch( success, error )** - populate the context.data property with the resource fetched from the server. If the context.data has an id property, it is appended to the baseUrl
 
&nbsp;&nbsp;**save( success, error )** - save or update the resource on the server. If the context.data does not has an id property POST is used to create a new resource, else PUT is used to update a resource
 
&nbsp;&nbsp;**destroy( success, error )** - deletes the resource on the server. If the context.data has an id property, it is appended to the baseUrl

###view
A view can be defined by passing a render function as part of the specification. This function will be called passing the context.model property. Instances of a view component can be created by passing a context which can contain a model property. 

&nbsp;&nbsp;**render()** - calls the render function supplied as part of the specification passing it the model

###uiComponent
A uiComponent is a specialized component that adds some conveniece methods to a composite component

&nbsp;&nbsp;**refresh()** - if the component is a resource and view, this method fetches the data and renders the view. if this component is only a view, it is rendered

##Factories:
The library defines several factory implementations used to create the framework components as well as allowing for extenion by defining new types of components.

**Composable.factory.def( component, specs )** - returns a standard factory to produce the component with the given specifications. This is useful to create new composable factories that can be combined with existing factory types

**Composable.multiViewFactory.def( component, specs )** - returns a factory to produce the component with the given specifications. In addition to standard composability, this factory allows multiple view factories to be composed. 

**Composable.resource.def( spec )** - returns a standard factory for producing resource instances with the given spec

**Composable.model.def( spec )** - returns a standard factory for producing model instances with the given spec

**Composable.view.def( spec )** - returns a standard factory for producing view instances with the given spec

**Composable.def( factory )** - returns a multiViewFactory that is the composition of a uiComponent factory and the supplied factory 

