import api from '../services/api'

export function getUserBudget() {
  return api.get('/budget/get')
}