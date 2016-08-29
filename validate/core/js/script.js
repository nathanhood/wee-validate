Wee.fn.make('validate', {
	_construct: function() {
		this.conf = {
			ajaxRequest: false,
			errorClass: '-error',
			errorSelector: 'ref:formError',
			fieldSelector: 'ref:formField',
			formSelector: 'ref:form',
			namespace: 'formValidator',
			scrollTop: 0
		};

		this.messages = {
			email: 'email',
			creditCard: 'credit card number',
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

		Wee.$chain('label', function() {
			var $label = this.siblings('label');

			if (! $label.length) {
				$label = this.closest('label');
			}

			return $label;
		})
	},

	/**
	 * Init validation via form submission
	 *
	 * @param {object} options
	 * @param {string} [options.formSelector=this.conf.formSelector]
	 * @param {boolean} [options.ajaxRequest=this.conf.ajaxRequest]
	 * @param {function} [options.onValid] - Callback when form validates. Passes form as first param.
	 * @param {function} [options.onInvalid] - Callback when form is invalid.
	 */
	init: function(options) {
		var scope = this,
			conf = scope.extendConfig(options),
			validCallback = conf.onValid,
			invalidCallback = conf.onInvalid;

		scope.bindFields();

		$(conf.formSelector).on('submit.' + conf.namespace, function(e, el) {
			if (! scope.isValid()) {
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
	 * @param {string} [options.fieldSelector=this.conf.fieldSelector]
	 * @param {string} [options.errorClass=this.conf.errorClass]
	 * @param {string} [options.errorSelector=this.conf.errorSelector]
	 * @param {(boolean|number|selector)} [options.scrollTop=0]
	 * @return {boolean}
	 */
	isValid: function(options) {
		var scope = this,
			priv = scope.$private,
			valid = true,
			conf = scope.extendConfig(options),
			errorClass = conf.errorClass,
			scrollTop = conf.scrollTop,
			$fields = $(conf.fieldSelector),
			getMsg = priv.getMessage;

		// Clear out errors fields
		$fields.removeClass(errorClass)
			.label()
			.removeClass(errorClass);

		$(conf.errorSelector).remove();

		$fields.filter('[data-required]').each(function(el) {
			var $el = $(el),
				val = $el.val();

			// Check for a value
			if (! val) {
				valid = priv.insertError($el, getMsg('required', $el.data('label')));
			} else if ($el.attr('data-type')) {
				var type = $el.data('type');

				// Check for valid input
				if (! scope.regex[type].test(val) || (type === 'creditCard' && ! priv.isValidCreditCard(val))) {
					valid = priv.insertError($el, getMsg('invalid', scope.messages[type]));
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
	 * @param {string} [options.selector=this.conf.fieldSelector]
	 * @param {string} [options.errorClass=this.conf.errorClass]
	 * @param {string} [options.errorSelector=this.conf.errorSelector]
	 */
	bindFields: function(options) {
		var conf = this.extendConfig(options),
			errorClass = conf.errorClass;

		$(conf.fieldSelector).filter('[data-required]')
			.on('focus.' + conf.namespace, function(e, el) {
				var $el = $(el);

				$el.removeClass(errorClass)
					.label()
					.removeClass(errorClass);

				$el.siblings(conf.errorSelector)
					.remove();
			});
	},

	/**
	 * Destroy all validate methods
	 */
	destroy: function() {
		$.events.off(false, '.' + this.conf.namespace);
	}
}, {
	extendConfig: function(options) {
		this.conf = $.extend(this.conf, options);

		return this.conf;
	},

	/**
	 * Check for a valid credit card number
	 * https://en.wikipedia.org/wiki/Luhn_algorithm
	 * https://gist.github.com/ShirtlessKirk/2134376
	 *
	 * @private
	 * @param {number} number
	 * @returns {boolean}
	 */
	isValidCreditCard: function(number) {
		var dblSum = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
			position = number.length,
			bit = 1,
			sum = 0,
			val;

		while (position) {
			// Ensure base10 (standard human readable) version of number
			val = parseInt(number.charAt(--position), 10);

			sum += (bit ^= 1) ? dblSum[val] : val;
		}

		return sum && sum % 10 === 0;
	},

	/**
	 * Insert form errors
	 *
	 * @private
	 * @param {object} $el
	 * @param {string} msg
	 * @returns {boolean}
	 */
	insertError: function($el, msg) {
		var errorClass = this.conf.errorClass;

		$el.addClass(errorClass)
			.label()
			.addClass(errorClass);

		if ($el.next('label').length) {
			$el.after(msg);
		} else {
			$el.parent().append(msg);
		}

		return false;
	},

	/**
	 * Generate validation message to be displayed to user
	 *
	 * @param {string} type
	 * @param {string} [field]
	 * @returns {string}
	 */
	getMessage: function(type, field) {
		var data = {
			type: type,
			errorSelector: this.conf.errorSelector
		};

		if (field) {
			data.field = field;
		}

		return $.view.render('validate.error', data);
	}
});