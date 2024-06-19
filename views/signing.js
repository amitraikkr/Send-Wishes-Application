// Function to toggle between forms
function toggleForms(formToShow) {
  console.log(`Toggling to ${formToShow} form`);

  // Hide all forms
  document.getElementById('sign-in-form').style.display = 'none';
  document.getElementById('sign-up-form').style.display = 'none';
  document.getElementById('confirmation-form').style.display = 'none';

  // Clear all messages
  document.getElementById('sign-in-message').innerText = '';
  document.getElementById('sign-in-message').style.display = 'none';
  document.getElementById('sign-up-message').innerText = '';
  document.getElementById('sign-up-message').style.display = 'none';
  document.getElementById('confirmation-message').innerText = '';
  document.getElementById('confirmation-message').style.display = 'none';

  // Clear all text boxes
  document.getElementById('sign-in-username').value = '';
  document.getElementById('sign-in-password').value = '';
  document.getElementById('sign-up-password').value = '';
  document.getElementById('sign-up-email').value = '';
  document.getElementById('confirmation-code').value = '';

  // Show the selected form
  if (formToShow === 'sign-in') {
      document.getElementById('sign-in-form').style.display = 'block';
  } else if (formToShow === 'sign-up') {
      document.getElementById('sign-up-form').style.display = 'block';
  } else if (formToShow === 'confirm-sign-up') {
      document.getElementById('confirmation-form').style.display = 'block';
  }
}

// AWS Cognito configuration
const poolData = {
  UserPoolId: 'XXXXXXXXXXXX', // Your user pool id here
  ClientId: 'XXXXXXXXXXXXXX' // Your client id here
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Helper function to display messages
function displayMessage(elementId, message, resetPasswordButton = false) {
  const messageElement = document.getElementById(elementId);
  messageElement.innerText = message;
  messageElement.style.display = 'block';
}

// Sign In function
document.getElementById('sign-in-button').addEventListener('click', () => {
  console.log('Sign In button clicked');

  const username = document.getElementById('sign-in-username').value;
  const password = document.getElementById('sign-in-password').value;

  console.log("Username:", username);
  console.log("Password:", password);

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: username,
      Password: password,
  });

  const userData = {
      Username: username,
      Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
          console.log('access token + ' + result.getAccessToken().getJwtToken());
          displayMessage('sign-in-message', 'Sign in successful!');
          // Redirect or perform actions upon successful sign in
          window.location.href = 'home.html';  
      },
      onFailure: (err) => {
          console.error("Authentication failed:", err);
          displayMessage('sign-in-message', err.message || JSON.stringify(err), true);
      },
  });
});

// Sign Up function
document.getElementById('sign-up-button').addEventListener('click', () => {
  console.log('Sign Up button clicked');

  const username = document.getElementById('sign-up-username').value;
  const password = document.getElementById('sign-up-password').value;
  const email = document.getElementById('sign-up-email').value;

  const attributeList = [];

  const dataEmail = {
      Name: 'email',
      Value: email,
  };

  const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
          console.error("Sign Up failed:", err);
          displayMessage('sign-up-message', err.message || JSON.stringify(err));
          return;
      }
      const cognitoUser = result.user;
      console.log('User name is ' + cognitoUser.getUsername());
      displayMessage('sign-up-message', 'Sign up successful! Please check your email for confirmation code.');
      toggleForms('confirm-sign-up');
  });
});

// Confirm Sign Up function
document.getElementById('confirm-sign-up-button').addEventListener('click', () => {
  console.log('Confirm Sign Up button clicked');

  const username = document.getElementById('sign-up-username').value;
  const confirmationCode = document.getElementById('confirmation-code').value;

  console.log("Username:", username);
  console.log("Confirmation Code:", confirmationCode);

  const userData = {
      Username: username,
      Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
          console.error("Confirmation failed:", err);
          displayMessage('confirmation-message', err.message || JSON.stringify(err));
          return;
      }
      console.log('Call result: ' + result);
      displayMessage('confirmation-message', 'Confirmation successful! You can now sign in.');
      toggleForms('sign-in');
  });
});

// Attach toggle function to toggle links
document.getElementById('toggle-sign-up').addEventListener('click', () => {
  toggleForms('sign-up');
});
document.getElementById('toggle-sign-in').addEventListener('click', () => {
  toggleForms('sign-in');
});