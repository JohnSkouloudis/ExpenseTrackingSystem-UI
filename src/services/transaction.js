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