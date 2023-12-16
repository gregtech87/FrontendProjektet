
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
    let deleteMessageFromBackend;
    try {
        await fetch(url, {
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
return deleteMessageFromBackend;
}

function fetchDataPost(url, credentials, formData) {
    try {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server if needed
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Error: ', error);
    }
}