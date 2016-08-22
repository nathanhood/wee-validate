Wee.fn.make('validate', {
	_construct: function() {
		this.namespace = 'formValidator';
		this.fieldSelector = 'ref:formField';
		this.errorClass = '-error';
		this.errorSelector = 'ref:formError';

		this.messages = {
			email: 'email',
			creditCard: 'credit cart number',
			cvv: 'cvv',
			zip: 'zip code',
			phone: 'phone number (e.g. 123-456-7890)'
		};

		this.regex = {
			email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			creditCard: /^[\d\-\s]+$/,
			cvv: /^[0-9]{3,4}$/,
			zip: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
			phone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
		};
	},

	/**
	 * Init validation via form submission
	 *
	 * @param {object} options
	 * @param {string} [options.formSelector=ref:form]
	 * @param {boolean} [options.ajaxRequest=false]
	 * @param {(Array|function|string)} [options.onValid] - Callback when form validates. Passes form as first param.
	 * @param {(Array|function|string)} [options.onInvalid] - Callback when form is invalid.
	 */
	init: function(options) {
		var scope = this,
			conf = $.extend({
				formSelector: 'ref:form',
				ajaxRequest: false
			}, options),
			validCallback = conf.onValid,
			invalidCallback = conf.onInvalid;

		scope.bindFields(conf);

		$(conf.formSelector).on('submit.' + this.namespace, function(e, el) {
			if (! scope.isValid(conf)) {
				if (invalidCallback) {
					invalidCallback();
				}

				e.preventDefault();
			} else {
				if (validCallback) {
					validCallback(el);
				}
			}

			if (conf.ajaxRequest) {
				e.preventDefault();
			}
		});
	},

	/**
	 * Check for validation errors
	 *
	 * @param {object} options
	 * @param {string} [options.fieldSelector=this.fieldSelector]
	 * @param {string} [options.errorClass=this.errorClass]
	 * @param {string} [options.errorSelector=this.errorSelector]
	 * @param {(boolean|number|selector)} [options.scrollTop=0]
	 * @return {boolean}
	 */
	isValid: function(options) {
		var scope = this,
			priv = scope.$private,
			valid = true,
			conf = $.extend({
				fieldSelector: this.fieldSelector,
				errorClass: this.errorClass,
				errorSelector: this.errorSelector,
				scrollTop: 0
			}, options),
			errorClass = conf.errorClass,
			scrollTop = conf.scrollTop,
			$fields = $(conf.fieldSelector);

		// Clear out errors fields
		$fields.removeClass(errorClass)
			.siblings('label')
			.removeClass(errorClass);

		$(conf.errorSelector).remove();

		$fields.filter('[data-required]').each(function(el) {
			var $el = $(el),
				val = $el.val();

			// Check for a value
			if (! val) {
				conf.model = {
					message: ($el.attr('data-label') ?
						$el.data('label') :
						'This field') + ' is required.'
				};

				valid = priv.insertError($el, conf);
			} else if ($el.attr('data-type')) {
				var type = $el.data('type');

				if (! scope.regex[type].test(val) || (type === 'creditCard' && ! priv.isValidCreditCard(val))) {
					conf.model = {
						message: 'Please enter a valid ' + scope.messages[type] + '.'
					};

					valid = priv.insertError($el, conf);
				}
			}
		});

		// Scroll to a number or element
		if (! valid && scrollTop !== false) {
			$(Wee._body).tween({
				scrollTop: typeof scrollTop == 'number' ?
					scrollTop :
					$(scrollTop).offset().top
			});
		}

		return valid;
	},

	/**
	 * Bind form error clearing for fields
	 *
	 * @param {object} options
	 * @param {string} [options.selector=this.fieldSelector]
	 * @param {string} [options.errorClass=this.errorClass]
	 * @param {string} [options.errorSelector=this.errorSelector]
	 */
	bindFields: function(options) {
		var conf = $.extend({
				selector: this.fieldSelector,
				errorClass: this.errorClass,
				errorSelector: this.errorSelector
			}, options),
			errorClass = conf.errorClass;

		$(conf.selector).filter('[data-required]').on('focus.' + this.namespace, function(e, el) {
			$(el).removeClass(errorClass)
				.siblings()
				.removeClass(errorClass)
				.siblings(conf.errorSelector)
				.remove();
		});
	},

	/**
	 * Destroy all validate methods
	 */
	destroy: function() {
		$.events.off(false, '.' + this.namespace);
	}
}, {
	/**
	 * Check for a valid credit card number
	 *
	 * @private
	 * @param {number} number
	 * @returns {boolean}
	 */
	isValidCreditCard: function(number) {
		var len = number.length,
			bit = 1,
			sum = 0,
			val;

		while (len) {
			val = parseInt(number.charAt(--len), 10);
			sum += (bit ^= 1) ? [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][val] : val;
		}

		return sum && sum % 10 === 0;
	},

	/**
	 * Insert form errors
	 *
	 * @private
	 * @param {object} $el
	 * @param {object} conf
	 * @returns {boolean}
	 */
	insertError: function($el, conf) {
		var errorClass = conf.errorClass,
			view = '<span class="form-error" data-ref="formError">{{ message }}</span>',
			model = conf.model;

		$el.addClass(errorClass)
			.siblings('label')
			.addClass(errorClass);

		if ($el.next('label').length) {
			$el.after($.view.render(view, model));
		} else {
			$el.parent()
				.append($.view.render(view, model));
		}

		return false;
	}
});