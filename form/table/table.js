Vue.component("n-form-table", {
	props: {
		// a json schema component stating the definition
		schema: {
			type: Object,
			required: false
		}
	},
	template: "#n-form-table",
	data: function() {
		return {
			labels: []
		}
	},
	computed: {
		definition: function() {
			return nabu.utils.vue.form.definition(this);
		},
		mandatory: function() {
			return nabu.utils.vue.form.mandatory(this);
		}
	},
	methods: {
		validate: function() {
			return nabu.utils.vue.form.validateChildren(this);
		}
	},
	events: {
		'$vue.child.added': function(child) {
			if (child.label) {
				this.labels.push({ 
					name: child.label,
					component: child
				});
			}
			else if (child.labels) {
				this.labels.splice(0, this.labels.length);
				nabu.utils.arrays.merge(this.labels, child.labels);
			}
		}
	}
});