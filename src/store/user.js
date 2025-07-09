

const TOKEN_KEY = 'token';
const USER_ID = 'userId';


export function setUserData(token, userId) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID, userId);
}


export function getToken() {

   return localStorage.getItem(TOKEN_KEY);

}

export function getUserId() {
  return localStorage.getItem(USER_ID);
}


export function clearUserData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID);
}


export function isAuthenticated() {
  return !!getToken();
}

