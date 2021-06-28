
((express, server, bodyParser, fs, squatchPurchaseRepo) => {

    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(express.static('pub'));

    server.get('/', (req, res) => {
        fs.readFile('./templates/home.html', (err, results) => {
            res.send(results.toString());
        });
    });

    server.get('/success/:orderID', (req, res) => {
        const orderID = req.params.orderID;
        const payerID = req.query.PayerID;

        squatchPurchaseRepo.ExecuteOrder(payerID, orderID, (err, successID) => {
            if (err) {
                res.json(err)
            } else {
                res.send('<h1>Order Placed</h1>Please save your order confirmation number: <h3>' + successID + '</h3>');
            }
        })
    });

    server.get('/cancel/:orderID', (req, res) => {
        const orderID = req.params.orderID;

        squatchPurchaseRepo.CancelOrder(orderID, (err, results) => {
            if (err) {
                res.send('There was an error removing this order')
            } else {
                res.redirect('/');
            }
        })
    });

    server.get('/orderdetails/:orderID', (req, res) => {
        const orderID = req.params.orderID;
        squatchPurchaseRepo.GetOrder(orderID, (err, results) => {
            if (err) {
                res.json(err);
            } else {
                res.json(results);
            }
        });
    });

    server.get('/refund/:orderID', (req, res) => {
        const orderID = req.params.orderID;
        squatchPurchaseRepo.RefundOrder(orderID, (err, refund) => {
            if (err) {
                res.json(err);
            } else {
                res.json(refund);
            }
        });
    });

    server.get('/recurring_success/:planID', (req, res) => {
        const planID = req.params.planID;
        const token = req.query.token;

        squatchPurchaseRepo.ExecuteRecurring(planID, token, (err, results) => {
            if (err) {
                res.json(err);
            } else {
                res.json(results);
            }
        });
    });

    server.get('/recurring_cancel/:planID', (req, res) => {
        const planID = req.params.planID;

    });

    server.get('/recurring_orderdetails/:agreementID', (req, res) => {
        const agreementID = req.params.agreementID;

        squatchPurchaseRepo.GetRecurringDetails(agreementID, (err, recurring_orderdetails) => {
            if (err) {
                res.json(err);
            } else {
                res.json(recurring_orderdetails);
            }
        });
    });

    server.post('/buysingle', (req, res) => {
        const quantity = req.body.Quantity;
        let purchaseName = 'Single Squatch Habitat';
        let purchasePrice = 10.00;
        let taxPrice = 0;
        let shippingPrice = 0;
        let description = 'Single Habitat Sasquatch Starter Kit';

        squatchPurchaseRepo.BuySingle(purchaseName, purchasePrice, taxPrice, shippingPrice,
            quantity, description, (err, url) => {
                if (err) {
                    res.json(err);
                } else {
                    res.redirect(url);
                }
            });
    });

    server.post('/buyrecurring', (req, res) => {
        squatchPurchaseRepo.BuyRecurring(
            'Squatch Plan',
            'Recurring Squatch Plan',
            0, (err, plan) => {
                if (err) {
                    res.json(err)
                } else {
                    res.redirect(plan)
                }
            }
        );
    });


    server.listen(8080, 'localhost', (err) => {
        console.log(err || 'Server online');
    });
})
    (require('express'),
        require('express')(),
        require('body-parser'),
        require('fs'),
        require('./repos/squatchPurchaseRepo')
    )