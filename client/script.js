
/*************************************************
 * TEMPLATE FUNCTIONS
 *************************************************/

function onSignIn(user) {
  const authData = user.getAuthResponse()
  this.storeAuthData(authData)
    .then((res) => res.json())
    .then((data) => {
      if (data) {
        newAddFormToDocument();
      }
    })
    .catch((err) => (console.log('Fetch Error', err)));
}

function newAddFormToDocument() {
  const form = document.getElementById('form-container');

  // Amex Input
  const amexInput = document.createElement('input')
  const amexLabel = document.createElement('div')
  amexInput.type = 'file';
  amexInput.name = 'amex';
  amexLabel.innerText = 'American Express';

  // USAA input
  const usaaInput = document.createElement('input');
  const usaaLabel = document.createElement('div');
  usaaInput.type = 'file';
  usaaInput.name = 'usaa';
  usaaLabel.innerText = 'USAA';

  // Submit Button
  const submitInput = document.createElement('input');
  submitInput.type = 'submit';
  submitInput.value = 'Submit';

  form.appendChild(amexLabel);
  form.appendChild(amexInput);
  form.appendChild(usaaLabel);
  form.appendChild(usaaInput);
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

function updateSpreadsheet(accessToken, title) {
  fetch('/api/updateSpreadsheet', { 
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

