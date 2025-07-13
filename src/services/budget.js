import api from '../services/api'

export function getUserBudget() {
  return api.get('/budget/get')
}

export function updateUserBudget(budget) {
  return api.put('/budget/update', budget)  

}

export function createUserBudget(budget) {
  return api.post('/budget/create', budget)
}
export function deleteUserBudget() {
  return api.delete('/budget/delete')
}