// this directive adds functionality to a component so it autocloses if you click anywhere else
// additionally you can add specific "auto-close" attributes to certain elements inside that should also close the element
Vue.directive("auto-close", {
	bind: function(element, binding) {
		element["$n-auto-close-listener"] = function(event) {
			var close = event.target != element && !element.contains(event.target);
			if (!close && element.contains(event.target)) {
				var find = event.target;
				while (find != element) {
					if (find.hasAttribute("auto-close")) {
						close = true;
						break;
					}
					find = find.parentNode;
				}
			}
			if (close && binding.value) {
				binding.value();
			}
		};
		window.addEventListener("click", element["$n-auto-close-listener"]);
	},
	unbind: function(element) {
		if (element["$n-auto-close-listener"]) {
			console.log("Removing auto-close event listener");
			window.removeEventListener("click", element["$n-auto-close-listener"]);
		}
	}
});