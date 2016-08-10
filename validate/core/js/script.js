Wee.fn.make('validate', {
	_construct: function() {
		this.namespace = 'formValidator';
		this.selector = 'ref:formField';
		this.errorClass = '-error';
		this.errorSelector = 'ref:formError';
	},

	/**
	 * Init validation via form submission
	 *
	 * @param {object} options
	 * @param {string} [options.formSelector=ref:form] - Selector for the form.
	 * @param {boolean} [options.ajaxRequest=false] - Prevents form submission on successful validation.
	 * @param {(Array|function|string)} [options.onValid] - Callback when form validates. Passes form object as first param.
	 * @param {(Array|function|string)} [options.onInvalid] - Callback when form is invalid.
	 */
	init: function(options) {
		var scope = this,
			settings = $.extend({
				formSelector: 'ref:form',
				ajaxRequest: false
			}, options),
			validCallback = settings.onValid,
			invalidCallback = settings.onInvalid;

		scope.bindFields(settings);

		$(settings.formSelector).on('submit.' + this.namespace, function(e, el) {
			scope.clear(settings);

			if (! scope.isValid(settings)) {
				if (invalidCallback) {
					invalidCallback();
				}

				e.preventDefault();
			} else {
				if (validCallback) {
					validCallback($(el));
				}
			}

			if (settings.ajaxRequest) {
				e.preventDefault();
			}
		});
	},

	/**
	 * Check for validation errors
	 *
	 * @param {object} options
	 * @param {string} [options.selector=ref:formField] - Selector for the form field.
	 * @param {string} [options.errorClass=-error] - Class applied to the field on error.
	 * @param {string} [options.errorSelector=ref:formError] - Selector for the error element.
	 * @param {string} [options.view=<span class="form-error" data-ref="formError">{{ label ? label : "This field" }} is required.</span>] - The view template or reference to a template to output the error.
	 * @param {(boolean|number|selector)} [options.scrollTop=0] - Scroll point if there are errors.
	 * @return {boolean}
	 */
	isValid: function(options) {
		var settings = $.extend({
				selector: this.selector,
				errorClass: this.errorClass,
				errorSelector: this.errorSelector,
				view: '<span class="form-error" data-ref="formError">{{ label ? label : "This field" }} is required.</span>',
				scrollTop: 0
			}, options),
			errorClass = settings.errorClass,
			$fields = $(settings.selector).filter('[data-required]'),
			scrollTop = settings.scrollTop;

		// Clear out existing errors
		this.clear(settings);

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
						$el.after($.view.render(view, model));
					} else {
						$el.parent()
							.append($.view.render(view, model));
					}
				}
			});

			if (scrollTop !== false) {
				$(Wee._body).tween({
					scrollTop: typeof scrollTop == 'number' ? scrollTop : $(scrollTop).offset().top
				});
			}

			return false;
		}

		return true;
	},

	/**
	 * Clear out form errors
	 *
	 * @param {object} options
	 * @param {string} [options.errorClass=-error] - Class applied to the field on error.
	 * @param {string} [options.errorSelector=ref:formError] - Selector for the error element.
	 */
	clear: function(options) {
		var settings = $.extend({
				errorClass: this.errorClass,
				errorSelector: this.errorSelector
			}, options),
			errorClass = settings.errorClass,
			$fields = $(settings.selector).filter('[data-required]');

		$fields.removeClass(errorClass)
			.siblings('label')
			.removeClass(errorClass);

		$(settings.errorSelector).remove();
	},

	/**
	 * Bind form error clearing for fields
	 *
	 * @param {object} options
	 * @param {string} [options.selector=ref:formField] - Selector for the form field.
	 * @param {string} [options.errorClass=-error] - Class applied to the field on error.
	 * @param {string} [options.errorSelector=ref:formError] - Selector for the error element.
	 */
	bindFields: function(options) {
		var settings = $.extend({
				selector: this.selector,
				errorClass: this.errorClass,
				errorSelector: this.errorSelector
			}, options),
			errorClass = settings.errorClass;

		$(settings.selector).filter('[data-required]').on('focus.' + this.namespace, function(e, el) {
			$(el).removeClass(errorClass)
				.siblings()
				.removeClass(errorClass)
				.siblings(settings.errorSelector)
				.remove();
		});
	},

	/**
	 * Destroy all validate methods
	 */
	destroy: function() {
		$.events.off(false, '.' + this.namespace);
	}
});