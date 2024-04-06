let textFieldCounter = 1;

function addTextField() {
  const textFieldContainer = document.getElementById('text-fields-container');
  const textField = document.createElement('div');
  textField.classList.add('form-group');
  textField.innerHTML = `
    <label for="text-field-${textFieldCounter}">Text Field ${textFieldCounter}</label>
    <input type="text" class="form-control" id="text-field-${textFieldCounter}" name="text-field-${textFieldCounter}" required>
  `;
  textFieldContainer.appendChild(textField);
  textFieldCounter++;
}

document.getElementById('dynamic-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  // You can process the form data here as needed
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
});
