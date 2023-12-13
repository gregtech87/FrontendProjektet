let username;
let password;

async function login() {
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;
    const url = 'http://localhost:8585/api/v1/customers';
    const base64 = btoa(`${username}:${password}`);


    const response = await fetchDataGet(url, base64);
    let data = await response.json();
    console.log('TESTING: ', data);

    data.forEach(customer => {
        console.log(customer);
        let customerRole;
        if (customer.userName === username) {
            let role = customer.authority;
            if (role.length > 6) {
                customerRole = role.substring(5);
            }
            console.log(customerRole);
            renderPage(customerRole.toLowerCase());
        }
    });
}