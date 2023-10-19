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
	if (errors.isEmtpy()) {
		submitBtn?.classList.remove('btn-disabled');
	} else {
		submitBtn?.classList.add('btn-disabled');
	}
}

emailField.addEventListener('input', () => {
	updateSubmitButton();
});

passwordField.addEventListener('input', () => {
	updateSubmitButton();
});
