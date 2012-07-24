/*
* composable JavaScript Library v0.0.1
* https://github.com/kchard/composable
*
* Copyright (c) 2012 Kevin Chard
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
* and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
* THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
* 
*/
(function( context, $ ) {

	var framework = (function() {
			
		var factory = function(defn, specs) {
		
			var factories = [];
			
			if(!specs) {
				specs = {};
			}
			
			var create = function internalCreate(context) {
				
				if(!context.data) {
					context.data = {};
				}
				
				var component = defn(specs, context);
				if(factories && factories.length > 0) {
					for(var i = 0; i < factories.length; i++) {
						$.extend(component, factories[i].create(context));
					}
				} 
				
				context.factory = internalCreate;
				context.target = component;
				
				return component;
			};
			
			var and = function(factory) {
				factories.push(factory);
				return this;
			};
			
			var that = { 
					create: create,
					and: and
			};
			
			return that;
		};
			
		var multiViewFactory = function(component, specs) {
		
			var viewFactories = [];
			
			var standardFactory = factory(component, specs);
			var standardCreate = standardFactory.create;
			
			var withView = function(viewFactory) {
				viewFactories.push(viewFactory);
				return this;
			};
			
			var create = function(context) {

				var renders = [];
				for(var i = 0; i < viewFactories.length; i++) {
					renders.push(viewFactories[i].create(context).render);
				}
				
				var compositeRender = function(model) {
					for(var i = 0; i < renders.length; i++) {
						renders[i]();
					}
				};
				
				var compositeView = factory(view, {render: compositeRender});
				
				var composite = standardCreate.call(standardFactory.and(compositeView), context);
				return composite;
			};
			
			standardFactory.withView = withView;
			standardFactory.create = create;
			
			return standardFactory;
		};
		
		var jsonResource = function(specs, context) {
		
			var baseUrl = specs.baseUrl || "/";
			
			var getBaseUrl = function() {
				return baseUrl;
			};
			
			var fetch = function(success, error) {
				var xmlRequest = $.ajax({
					url: url(),
					type: "GET",
					dataType: "json"
				}).done(function(data) {context.data = data;})
				  .done(success)
				  .fail(error);
			};
			
			var save = function(success, error) {
				var xmlRequest = $.ajax({
					url: url(),
					type: context.data.id ? "PUT" : "POST",
					contentType: "application/json",
					dataType: "json",
					data: JSON.stringify(context.data)
				}).done(success)
				  .fail(error);
			};
			
			var destroy = function(success, error) {
				var xmlRequest = $.ajax({
					url: url(),
					type: "DELETE",
					dataType: "json"
				}).done(success)
				  .fail(error);
			};
			
			var url = function() {
				var url = context.data.id ? baseUrl + "/" + context.data.id : baseUrl;
				return url;
			};
			
			var getData = function() {
				return context.data;
			};
			
			var that = {
				getData: getData,
				getBaseUrl: getBaseUrl,
				fetch: fetch,
				save: save,
				destroy: destroy
			};
	
			return that;
		};
		
		var jsonResourceFactory = function(specs) {
			return factory(jsonResource, specs);
		};
		
		var model = function(specs, context) {

			var validate = specs.validate || function() {};
			var errors = {};
			
			var get = function(key) {
				if(Object.prototype.toString.apply(context.data) === '[object Array]') {
					return context.factory({data: context.data[key]});
				}
				return context.data[key];
			};
			
			var set = function(key, value) {
				
				var errorMessage = validate(key, value);
				if(errorMessage) {
					errors[key] = errorMessage;
				} else {
					delete errors[key];
				}
				
				context.data[key] = value;
				
				return errorMessage;
			};
			
			var setAll = function(props, exclude) {
				for(key in props) {
					if(!exclude || (exclude && exclude.indexOf(key) === -1)) {
						set(key, props[key]);
					}
				}
				
				return errors;
			};
			
			var isValid = function() {
				var count = 0;
				for(var key in errors) {
					count++;
				}
				
				return count === 0;
			};
			
			var each = function(callback) {
				return $.each(context.data, callback);
			};
			
			var that = {
				each: each,
				get: get,
				set: set,
				setAll: setAll,
				errors: errors,
				isValid: isValid
			};
			
			return that;
		};
		
		var modelFactory = function(specs) {
			return factory(model, specs);
		};
		
		var view = function(specs, context) {
			
			var internalInit = specs.init || function() {};
			var internalRender = specs.render || function() {};
			
			var render = function() {
				internalRender(context.target);
			};
			
			var that = {
				render: render
			};
			
			internalInit(context.target);
			
			return that;
		};
		
		var viewFactory = function(specs) {
			return factory(view, specs);
		};
		
		var uiComponent = function(specs, context) {
			
			var refresh = function(success, error) {
				var component = context.target;
				if(component.fetch) {
					component.fetch(function() {
						if(component.render) {
							component.render();
						} 
						
						if(success) {
							success();
						}
					}, error);
				} else {
					if(component.render) {
						component.render();
					}
					
					if(success) {
						success();
					}
				}
			};
			
			return {refresh: refresh};
		};
		
		var uiComponentFactory = function(componentFactory) {
			var factory = multiViewFactory(uiComponent, {});
			if(componentFactory) {
				factory.and(componentFactory);
			} 
			
			return factory;
		};
		
		return {
			factory: {def: factory},
			multiViewFactory: {def: multiViewFactory},
			resource: {def: jsonResourceFactory},
			model: {def: modelFactory},
			view: {def: viewFactory},
			def: uiComponentFactory
		};
		
	})();
	
	window.Composable = framework;

})( window, $ );