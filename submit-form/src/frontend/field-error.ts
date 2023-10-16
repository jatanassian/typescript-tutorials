export class FieldError {
	// A Set is like a hashmap with key/value pair except with don't have a value, we only have the keys
	errors: Set<string> = new Set<string>();

	set(
		errKey: string,
		inputField: HTMLInputElement,
		label: HTMLElement,
		labelText: string
	): void {
		inputField.classList.add('input-error');
		label.classList.remove('hidden');
		label.innerHTML = labelText;
		this.errors.add(errKey);
	}

	remove(errKey: string, field: HTMLInputElement, label: HTMLElement): void {
		field.classList.remove('input-error');
		label.classList.add('hidden');
		this.errors.delete(errKey);
	}

	isEmtpy(): boolean {
		return this.errors.size === 0;
	}
}
