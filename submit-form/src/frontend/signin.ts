import { checkComplexity } from '../shared/password-rules';
import { checkUsername } from '../shared/username-rules';
import { FieldError } from './field-error';

const passwordField = document.getElementById('password') as HTMLInputElement;
const passwordInvalidLabel = document.getElementById(
	'invalid-password'
) as HTMLElement;

const emailField = document.getElementById('email') as HTMLInputElement;
const emailInvalidLabel = document.getElementById(
	'invalid-email'
) as HTMLElement;

const submitBtn = document.getElementById('form-submit');

const errors = new FieldError();

function updateSubmitButton(): void {
	if (
		errors.isEmtpy() &&
		emailField.value.length &&
		passwordField.value.length
	) {
		submitBtn?.classList.remove('btn-disabled');
	} else {
		submitBtn?.classList.add('btn-disabled');
	}
}

emailField.addEventListener('input', () => {
	const usernameFailures = checkUsername(emailField.value);
	if (usernameFailures.length) {
		const formattedErrors = usernameFailures.join('<br>');
		errors.set('invalid-email', emailField, emailInvalidLabel, formattedErrors);
	} else {
		errors.remove('invalid-email', emailField, emailInvalidLabel);
	}
	updateSubmitButton();
});

passwordField.addEventListener('input', () => {
	const passwordFailures = checkComplexity(passwordField.value);
	if (passwordFailures.length) {
		const formattedErrors = passwordFailures.join('<br>');
		errors.set(
			'invalid-password',
			passwordField,
			passwordInvalidLabel,
			formattedErrors
		);
	} else {
		errors.remove('invalid-password', passwordField, passwordInvalidLabel);
	}
	updateSubmitButton();
});
