const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let taskArray=[]
let finalContacts =[];
let finalContactsForEdit=[];

function getOwners(task) {
    let owners = [];
    if (!task.owner || task.owner.length === 0) {
        owners.push("Max Mustermann");
    } else {
        for (let i = 0; i < task.owner.length; i++) {
            let owner = task.owner[i];
            owners.push(`${owner.firstName} ${owner.lastName}`);
        }
    }

    return owners.join(" ");
}


