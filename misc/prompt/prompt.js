if (!nabu) { var nabu = {}; }
if (!nabu.utils) { nabu.utils = {}; }
if (!nabu.utils.vue) { nabu.utils.vue = {}; }

nabu.utils.vue.prompt = function(render) {
	var content = document.createElement("div");
	content.setAttribute("class", "n-prompt-content");
	
	var root = document.createElement("div");
	root.setAttribute("class", "n-prompt");
	document.body.appendChild(root);
	
	var container = document.createElement("div");
	container.setAttribute("class", "n-prompt-container");
	root.appendChild(container);
	
	container.appendChild(content);
	
	escapeListener = function(event) {
		if (event.keyCode == 27) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.reject();
		}
	};
	document.addEventListener("keydown", escapeListener);

	container.addEventListener("click", function(event) {
		if (event.target == container || event.target == content) {
			document.body.removeChild(root);
			document.removeEventListener("keydown", escapeListener);
			promise.reject();
		}
	});
	
	var promise = new nabu.utils.promise();
	this.$render({ target: content, content: render, activate: function(component) {
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
		var component = Vue.extend({ template: "#n-confirm" });
		return new component({ data: parameters});
	});
};

Vue.mixin({
	computed: {
		$prompt: function() { return nabu.utils.vue.prompt },
		$confirm: function() { return nabu.utils.vue.confirm }
	}
});