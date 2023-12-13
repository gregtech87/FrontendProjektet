
function fetchdata() {
    let user = 'lasse';
    let password = 'lasse';
    let url = 'http://localhost:8585/api/v1/customers';
    let url2 = 'http://localhost:8585/api/v1/username';

    const base64 = btoa(`${user}:${password}`);

    //GET
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${base64}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Success: ", data);
        })
        .catch(error => {
            console.error('Error: ', error);
        })


    fetch(url2, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${base64}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {

            console.log("Success: ", data);
        })
        .catch(error => {
            console.error('Error: ', error);
        })


}