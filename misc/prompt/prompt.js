if (!nabu) { var nabu = {}; }
if (!nabu.utils) { nabu.utils = {}; }
if (!nabu.utils.vue) { nabu.utils.vue = {}; }

nabu.utils.vue.prompt = function(render, parameters) {
	
	var root = document.createElement("div");
	root.setAttribute("class", "n-prompt");
	document.body.appendChild(root);
	
	var container = document.createElement("div");
	container.setAttribute("class", "n-prompt-container");
	root.appendChild(container);
	
	escapeListener = function(event) {
		if (event.keyCode == 27) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.reject();
		}
	};
	document.addEventListener("keydown", escapeListener);

	root.addEventListener("click", function(event) {
		if (event.target == container) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.reject();
		}
	});
	
	var promise = new nabu.utils.promise();
	
	if (parameters && parameters.slow) {
		this.$render({ target: container, content: new nabu.views.cms.core.Loader() });
	}
	
	this.$render({ target: container, content: render, activate: function(component) {
		component.$resolve = function(object) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.resolve(object);
		};
		component.$reject = function(object) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.reject(object);
		}
	}});
	return promise;
};

// parameters are:
// - message: the message to show
// - type: question, warning, error
// - ok: the text for the ok button
// - cancel: the text for the cancel button
nabu.utils.vue.confirm = function(parameters) {
	return nabu.utils.vue.prompt.bind(this)(function() {
		var component = Vue.extend({ 
			template: "#n-confirm",
			data: function() {
				return {
					title: null,
					ok: null,
					cancel: null,
					type: null,
					message: null,
					rejectable: true
				}
			},
			methods: {
				resolve: function() {
					this.$resolve();
				}
			}
		});
		return new component({ data: parameters });
	});
};

nabu.utils.vue.wait = function(parameters) {
	return nabu.utils.vue.prompt.bind(this)(function() {
		var component = Vue.extend({ 
			template: "#n-confirm",
			data: function() {
				return {
					title: null,
					ok: null,
					cancel: null,
					type: null,
					message: null,
					rejectable: false,
					failed: false,
					result: null
				}
			},
			activate: function(done) {
				var self = this;
				parameters.promise.then(function(result) {
					nabu.utils.objects.merge(self, parameters.success);
					self.result = result;
					done();
				}, function(result) {
					nabu.utils.objects.merge(self, parameters.failure);
					self.failed = true;
					self.result = result;
					done();
				});
			},
			methods: {
				resolve: function() {
					if (this.failed) {
						this.$reject(this.result);
					}
					else {
						this.$resolve(this.result);
					}
				}
			}
		});
		return new component({ data: parameters});
	}, { slow: true });
};

Vue.mixin({
	computed: {
		$prompt: function() { return nabu.utils.vue.prompt },
		$confirm: function() { return nabu.utils.vue.confirm },
		$wait: function() { return nabu.utils.vue.wait }
	}
});