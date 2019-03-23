
function onSignIn(user) {
  const authData = user.getAuthResponse()
  var profile = user.getBasicProfile();
  console.log('auth: ', authData);
  console.log('profile: ', profile);
  storeAuthData(authData)
}

function storeAuthData(data) {
  fetch('/api/auth', { 
    method: 'post',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data)
  })
  .then((res) => {
    res.json().then((data) => {
      if (data) {
        const token = data['access_token'];
        const title = 'AHHHHHH'
        console.log(token, title);
        createSpreadSheet(token, title);
      }
    })
  })
  .catch(function(err) {
    console.log('Fetch Error', err);
  });
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

