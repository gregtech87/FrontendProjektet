
async function fetchDataGet(url, credentials) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            }
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            return response;
        }
    } catch (error) {
        console.error('Error: ', error);
    }

    // return response;
    // let data = await response.json();
    // console.log('TESTING: ', data)
}

async function fetchDataDelete(url, credentials) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${credentials}`
            }
        })
            .then(response => response.text())
            .then(data => {
                deleteMessageFromBackend = data;
            })
    } catch (error) {
        console.error('Error: ', error);
    }
}