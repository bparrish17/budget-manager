
/*************************************************
 * TEMPLATE FUNCTIONS
 *************************************************/

function onSignIn(user) {
  const authData = user.getAuthResponse()
  storeAuthData(authData)
}

function addFormToDocument() {
  const form = document.getElementById('form-container');
  // const titleInput = document.createElement('input')
  // titleInput.type = 'text';
  // titleInput.name = 'title'

  const fileInput = document.createElement('input')
  fileInput.type = 'file';
  fileInput.name = 'file';

  const submitInput = document.createElement('input');
  submitInput.type = 'submit';
  submitInput.value = 'Submit';

  // form.appendChild(titleInput);
  form.appendChild(fileInput);
  form.appendChild(submitInput);
  
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

