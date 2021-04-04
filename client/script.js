
/*************************************************
 * TEMPLATE FUNCTIONS
 *************************************************/

function onSignIn(user) {
  const authData = user.getAuthResponse()
  this.storeAuthData(authData)
    .then((res) => res.json())
    .then((data) => {
      const formElem = document.getElementById('uploadForm');
      const hasInputs = [].slice.call(formElem.children).length > 0;
      if (data && !hasInputs) {
        addFormToDocument();
      }
    })
    .catch((err) => (console.log('Fetch Error', err)));
}

function addFieldToForm(form, field) {
  const { name, innerText } = field;
  const inputEl = document.createElement('input')
  const labelEl = document.createElement('div')
  inputEl.type = 'file';
  inputEl.name = name;
  labelEl.innerText = innerText;

  form.appendChild(labelEl);
  form.appendChild(inputEl);
}

function addFormToDocument() {
  const form = document.getElementById('uploadForm');
  const fields = [
    { name: 'amex', innerText: 'American Express' },
    { name: 'chase', innerText: 'Chase' },
    { name: 'usaa', innerText: 'USAA' }
  ];

  fields.forEach((field) => addFieldToForm(form, field));

  // Submit Button
  const submitInput = document.createElement('input');
  submitInput.type = 'submit';
  submitInput.value = 'Submit';

  form.appendChild(submitInput);
}

/*************************************************
 * API CALLS
 *************************************************/

function storeAuthData(data) {
  return fetch('/api/auth', { 
    method: 'post',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
}

function updateSpreadsheet(event) {
  console.log('form', document.forms);
  fetch('/api/updateSpreadsheet', { 
    method: 'post',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({})
  })
  .then((res) => {
    console.log('RES: ', res);
  })
}

function createSpreadSheet(accessToken, title) {
  fetch('/api/createSpreadsheet', { 
    method: 'post',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ accessToken, title })
  })
  .then((res) => {
    res.json().then((data) => {
      console.log('data', data);
    })
  })
}


// TODO: Add spreadsheet control handlers.

