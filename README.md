Collection of packages to interact with CorvusPay from javascript/typescript. 
## Packages
- core - common functionality
- nodeapi - nodejs client for talking to the corvuspay api
- form - form builder for creating payment requests

### Form builder quickstart:
`npm install @cyf0e/corvusjs-form`
Initialize the form builder
```typescript
const corvusForm = new CorvusFormService({ 
      endpoint: 'endpoint',  
     storeId: 1234,  
      version: "1.4",  
      secretKey: 'mysecret',  
});
```
You can then use it to create a payment:
```typescript
corvusForm.mandatory({
        require_complete: false,
        amount: 5,
        cart: 'cart',
        currency: "EUR",
        language: "hr",
        order_number: '123456',
      })
```
and `consume` the payment to sign it and clear the builder
```typescript
const requestJson=corvusForm.consume() //the request is signed and cleared, we can now build another payment
```
To better understand building requests for the payment, please read the CorvusPay integration manual.


### Nodejs API quickstart:
`npm install @cyf0e/corvusjs-nodeapi`
Initialize client with your credentials provided by CorvusPay
```typescript
const client=new CorvusAPI({
      privateKeyPath: privateKey,
      certificatePath: clientCert,
      passphrase: '123',
      endpoint: 'endpoint',
      version: '1.4',
      storeId: 123,
      secretKey: 'secret',
    });
```
Then you can use it to make API calls. Read the CorvusPay integration manual for a detailed explanation of every api endpoint.
```typescript
const transaction = await client.checkTransactionStatus({
        order_number: corvusOrderNumber,
        currency_code: "978",
        timestamp: client.getCurrentTimestamp(),
});
```

### Contributing
Feel free to submit a pull request or open an issue if you run into any bugs.
