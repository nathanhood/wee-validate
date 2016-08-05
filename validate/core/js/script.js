Wee.fn.make('validate', {
	_construct: function() {
		this.namespace = 'formValidator';
	},

	/**
	 * Init validation
	 *
	 * @param {object} options
	 * @param {string} [options.formSelector=ref:form] - Selector for the form.
	 * @param {string} [options.inputSelector=ref:formField] - Selector for the form inputs.
	 * @param {string} [options.errorClass=-error] - Class applied to the input on error.
	 * @param {string} [options.errorElementSelector=ref:formError] - Selector for the error element.
	 * @param {string} [options.view=<span class="form-error" data-ref="formError">{{ label ? label : "This field" }} is required.</span>] - The view template or reference to a template to output the error.
	 * @param {boolean} [options.scrollTop=true] - Scroll to the top of the form if there is an error.
	 * @param {boolean} [options.ajaxRequest=false] - Prevents form submission on successful validation.
	 * @param {(Array|function|string)} [options.onValid] - Callback when form validates. Passes form object as first param.
	 * @param {(Array|function|string)} [options.onInvalid] - Callback when form is invalid.
	 */
	init: function(options) {
		var settings = $.extend({
				formSelector: 'ref:form',
				inputSelector: 'ref:formField',
				errorClass: '-error',
				errorElementSelector: 'ref:formError',
				view: '<span class="form-error" data-ref="formError">{{ label ? label : "This field" }} is required.</span>',
				scrollTop: true,
				ajaxRequest: false
			}, options),
			errorClass = settings.errorClass,
			errorElementSelector = settings.errorElementSelector,
			validCallback = settings.onValid,
			invalidCallback = settings.onInvalid;

		$(settings.inputSelector).on('focus.' + this.namespace, function(e, el) {
			$(el).removeClass(errorClass)
				.siblings()
				.removeClass(errorClass)
				.siblings(errorElementSelector)
				.remove();
		});

		$(settings.formSelector).on('submit.' + this.namespace, function(e, el) {
			var $el = $(el),
				$fields = $el.find('[data-required]');

			// Clear out all errors
			$fields.removeClass(errorClass)
				.siblings('label')
				.removeClass(errorClass);
			$(errorElementSelector).remove();

			if (
				$fields.map(function(el) {
					return $(el).val() === '';
				}).length > 0
			) {
				$fields.each(function(el) {
					var $el = $(el);

					// If an item's value is empty, add the error after the input
					if (! $el.val()) {
						var view = settings.view,
							model = {
								label: $el.attr('data-label') ? $el.data('label') : ''
							};

						$el.addClass(errorClass)
							.siblings('label')
							.addClass(errorClass);

						// Check if the next item is a label
						if ($el.next('label').length) {
							$el.after($.view.render(view, model))
						} else {
							$el.parent()
								.append($.view.render(view, model));
						}
					}
				});

				if (settings.scrollTop) {
					$(Wee._body).tween({
						scrollTop: $el.offset().top
					});
				}

				if (invalidCallback) {
					invalidCallback();
				}

				e.preventDefault();
			} else {
				if (validCallback) {
					validCallback($el);
				}
			}

			if (settings.ajaxRequest) {
				e.preventDefault();
			}
		});
	},

	/**
	 * Destroy all validate methods
	 */
	destroy: function() {
		$.events.off(false, '.' + this.namespace);
	}
});