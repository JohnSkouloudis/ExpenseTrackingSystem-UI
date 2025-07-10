import api from './api' 


// Get data for Pie chart
export async function getCategoriesSummary() {
  try {
    const response = await api.get('/transactions/summary')
    return response.data
  } catch (error) {
    console.error('Failed to fetch category summary:', error)
    throw error
  }
}

export async function getPaginatedTransactions(accountId,page, pageSize) {

  try {
    const response = await api.get(`/transactions/${accountId}/${page}?size=${pageSize}`)
    return response
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    throw error
  }
}

export async function getTransactions(accountId) {
  try {
    const response = await api.get(`/transactions/${accountId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    throw error
  }

}

export function addTransaction(formData) {
  return api.post('/transactions/add', formData)
}
  
export function getAllCategories() {
  return api.get('/category/all')
}