((squatchPurchaseRepo, paypal, ObjectID, mongoService, paymentService) => {
    squatchPurchaseRepo.BuySingle = (purchaseName, purchasePrice, taxPrice,
        shippingPrice, itemCount, description, cb) => {

        let transactionsArray = [];
        for (let i = 0; i < itemCount; i++) {
            let itemObj = paymentService.CreateItemObj(purchaseName, purchasePrice, 1);
            transactionsArray.push(itemObj);
        }
        let transactionItemObj = [paymentService.CreateTransactionObj(
            taxPrice, shippingPrice, description, transactionsArray
        )];

        paymentService.CreateWithPaypal(transactionItemObj,
            'http://localhost:8080/success',
            'http://localhost:8080/cancel', (err, results) => {
                if (err) {
                    return cb(err)
                } else {
                    return cb(null, results);
                }
            }
        );
    }
})
    (
        module.exports,
        require('paypal-rest-sdk'),
        require('mongodb').ObjectId,
        require('../services/mongoService'),
        require('../services/paymentService')
    );