document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();

        var username = document.querySelector('input[name="username"]').value;
        var password = document.querySelector('input[name="password"]').value;

        window.chrome.webview.postMessage({
            action: 'login',
            username: username,
            password: password
        });
    });
});

function handleLoginResult(success) {
    if (success) {
        window.chrome.webview.postMessage({ action: 'navigateToDashboard' });
    } else {
        console.log("Login failed");
        // Handle failed login in the UI
    }
}

function handleLoginResult(success) {
    const inputField = document.getElementsByClassName('inputpass')[0]
    const inputUser = document.getElementsByClassName('inputuser')[0]
    
    if (success) {
      console.log("Login successful")
      inputField.classList.remove("input-error")
      inputUser.classList.remove("input-error")
      inputField.value = ''
      inputUser.value = ''
    } else {
      console.log("Login failed")
      inputField.value = ''
      inputField.classList.add("input-error")
      inputUser.classList.add("input-error")
    }
}