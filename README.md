# Wee Validate

Form validation for required fields, emails, credit cards, and cvv’s.

## Getting Started

1. Add a data-ref of `form` to the form and a data-ref of `formField` to fields you want validated
2. Add `data-required` to all required fields

The default error message is **"This field is required"**. If you want to customize the error message, add a data-label with a value that corresponds to the name of your field (i.e. `data-label="Email Address"` to output "Email Address is required.").

### Additional validation

To validate specific field types, add a data-type from the list below (e.g. `data-type=“email”`). Current field type validation includes:

- email
- creditCard
- cvv

## Init

```
<form data-ref="form">
	<label for="email">Email Address</label>
	<input type="text" name="email" id="email" data-ref="formField" data-label="Email Address" data-required>
	<button>Submit</button>
</form>
```

```
Wee.validate.init();
```

### Options

**formSelector: `'ref:form'`**<br>
Selector for the form.

**ajaxRequest: `false`**<br>
Prevents form submission on successful validation.

**onValid**<br>
Callback when form validates. Passes the form as the first param.

**onInvalid**<br>
Callback when form is invalid.

In addition, the `init` method includes all the options available to the [isValid](#isValid) method.

## isValid

Checks for errors and applies flash messages. Returns boolean. Useful when you are using Wee history to submit your forms. For example:

```
$.history.bind({
	submit: 'ref:form'
}, {
	begin: function() {
		return Wee.validate.isValid();
	}
});
```

### Options

**fieldSelector: `'ref:formField'`**<br>
Selector for the form field.

**errorClass: `'-error'`**<br>
Class applied to the input on error.

**errorSelector: `'ref:formError'`**<br>
Selector for the error element.

**scrollTop: `0`**<br>
A pixel position (100px) or selector (‘ref:form’) for the window to scroll to if the form contains errors. To disable this feature, set it to false.

## bindFields

Clears form fields on focus.

### Options

**fieldSelector: `'ref:formField'`**<br>
Selector for the form field.

**errorClass: `'-error'`**<br>
Class applied to the input on error.

**errorSelector: `'ref:formError'`**<br>
Selector for the error element.

## Destroy

Destroys all bound events.

```
Wee.validate.destroy();
```