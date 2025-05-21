document.getElementById('recForm').onsubmit = async function(e){
    e.preventDefault();
    const email = this.email.value;
    const orderId = this.orderId.value;
    const sku = this.sku.value;
    const data = {
        "products": [ { "sku": sku, "quantity": 1 } ],
        "orderId": orderId,
        "email": email
    };
    document.getElementById('output').innerHTML = "Loading...";
    try {
        const resp = await fetch(
            'https://services-staging.stacktome.com/api/recommendations/v1/templates/3/recommendations?apikey=fSKNKExtPdLC8YFXbXH80euskf6SVcR8',
            { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }
        );
        if(!resp.ok) throw new Error('HTTP '+resp.status);
        // дальше ваш парсинг
    } catch(err){
        document.getElementById('output').innerHTML = 'Error: '+err;
    }
};
