import api from "./api";
import { getUserId } from "../store/user";

export function getPaginatedAccounts( page, pageSize) {
    const userId = getUserId();
    return api.get(`/accounts/${userId}/${page}?size=${pageSize}`);
}

export function addAccount(accountName,balance){
    return api.post("/accounts/add", 
        {
        "id": null,
        "balance": balance,
        "accountName": accountName,
        "userId": null
        }

    );
}

export function getUserAccounts() {
    const userId = getUserId();
    return api.get(`/accounts/${userId}`);
}