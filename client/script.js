
/*************************************************
 * TEMPLATE FUNCTIONS
 *************************************************/

function onSignIn(user) {
  const authData = user.getAuthResponse()
  storeAuthData(authData)
}

function addFormToDocument() {
  const form = document.getElementById('form-container');

  const amexInput = document.createElement('input')
  amexInput.type = 'file';
  amexInput.name = 'amex';

  const usaaInput = document.createElement('input');
  usaaInput.type = 'file';
  usaaInput.name = 'usaa';

  const submitInput = document.createElement('input');
  submitInput.type = 'submit';
  submitInput.value = 'Submit';

  // form.appendChild(titleInput);
  form.appendChild(amexInput);
  form.appendChild(usaaInput);
  form.appendChild(submitInput);
  
  const inputs = [].slice.call(document.getElementsByTagName('input'));
  inputs.forEach((input) => {
    const newNode = document.createTextNode(input.name);
    form.insertBefore(newNode, input);
  })

}

/*************************************************
 * API CALLS
 *************************************************/

function storeAuthData(data) {
  fetch('/api/auth', { 
    method: 'post',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
  .then((res) => {
    res.json().then((data) => {
      if (data) {
        addFormToDocument();
      }
    })
  })
  .catch((err) => (console.log('Fetch Error', err)));
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

