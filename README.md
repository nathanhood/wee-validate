# Wee Validate

Validate required form fields.

## Usage

```
<form data-ref="form">
	<label for="email">Email Address</label>
	<input type="email" name="email" id="email" data-ref="formField" data-label="Email Address" data-required>
	<button>Submit</button>
</form>
```

```
Wee.validate.init();
```

### Options

**formSelector: 'ref:form'**<br>
Selector for the form.

**inputSelector: 'ref:formField'**<br>
Selector for the form inputs.

**errorClass: 'error'**<br>
Class applied to the input on error.

**errorElementSelector: 'ref:formError'**<br>
Selector for the error element.

**scrollTop: true**<br>
Scroll to the top of the form if there is an error.

**ajaxRequest: false**<br>
Prevents form submission on successful validation.

**onValid**<br>
Callback when form validates. Passes form object as first param.

**onInvalid**<br>
Callback when form is invalid.