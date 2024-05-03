import axios from "axios"

// POST Access Token

const createAccessToken = async (req,res) => {

    const url = 'https://api.sandbox.paymetrust.net/v1/oauth/login'
    const data = {
        "api_key":"string",
        "api_password": "string"
    }

    await axios.post(url,data, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then()
}


// POST Web Payment transaction initialization

const initiatePaiement = async (req,res) => {
    const url = 'https://api.sandbox.paymetrust.net/v1/payment'
    const data = {
        "currency": "XOF",
        "payment_method": "OM",
        "merchant_transaction_id": "MY-ORDER-ID-08082106",
        "amount": 100,
        "success_url": "https://8cbbcb8d08d6.ngrok.io",
        "failed_url": "https://8cbbcb8d08d6.ngrok.io/cancel/",
        "notify_url": "https://8cbbcb8d08d6.ngrok.io/notification",
        "lang": "fr",
        "designation": "Donation for REZ NGO",
        "client_first_name" : "John",
        "client_last_name" : "Doe",
        "client_phone_number" : "+2250707000000",
        "client_email" : "john.doe@gmail.com"
    }

    await axios.post(url,data, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then()
}


// GET Payment Status

const getPaiementStatus = async (req,res) => {
    const url = "https://api.sandbox.paymetrust.net/v1/payment/{payment_token}"

    axios.get(url)
}

/* const add = async () => {
    const trs = await Transaction.find({})
    console.log(trs[0]);
    trs.forEach(async tr => {
        tr.typeOfTransaction = "Loyer Payé"
        await tr.save()
    })
}

add()
 */