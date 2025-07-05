const TOKEN_KEY = 'token';

// Set token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Get token
export function getToken() {

   return localStorage.getItem(TOKEN_KEY);

}


export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}


export function isAuthenticated() {
  return !!getToken();
}

