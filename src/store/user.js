

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

export function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

export function isExpired() {
  const token = getToken();
  if (!token) return true; 

  const decoded = parseJwt(token);
  if (!decoded.exp) return true; 
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

