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

export function getSubcategories(parentName) {
  return api.get(`/category/${parentName}`)
}

export function getTransactionDetails(transactionId) {
  return api.get(`/transactions/details/${transactionId}`)
}

export function exportToCSV(startDate, endDate){
  return api.get(`/transactions/exportToCsv?startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob'
  })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error('Failed to export transactions:', error);
      throw error;
    });
}

export async function getRecentTransactions(accountId,page, pageSize) {

  try {
    const response = await api.get(`/transactions/${accountId}/${page}?size=${pageSize}&sortByDate=true`)
    return response
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    throw error
  }
}

export function getTransactionsByDateRange(accountId, startDate, endDate) {
  return api.get(`/transactions/${accountId}`, {
    params: { startDate, endDate }
  })
}

export function getScheduledTransactions(){
  return api.get('/transactions/scheduledTransactions/all')

}

export function deleteScheduledTransaction(scheduledTransactionId) {
    return api.delete(`/transactions/scheduledTransactions/delete/${scheduledTransactionId}`)
}

export function createScheduledTransaction(formData) {
  return api.post('/transactions/scheduledTransactions/add', formData)
}