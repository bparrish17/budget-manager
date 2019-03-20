function onSignIn(user) {
  const test = user.getAuthResponse()
  console.log('test: ', test);
  var profile = user.getBasicProfile();
  console.log('profile   : ', profile);
}

function test() {
  console.log('test');
}


// TODO: Add spreadsheet control handlers.

