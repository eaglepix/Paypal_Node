const { response } = require('express');

((squatchPurchaseRepo, paypal, ObjectID, mongoService, paymentService, subService) => {

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
                    return cb(err);
                } else {
                    return cb(null, results);
                }
            }
        );
    };

    squatchPurchaseRepo.ExecuteOrder = (payerID, orderID, cb) => {
        paymentService.ExecutePayment(payerID, orderID, (err, response) => {
            return cb(err, response);
        });
    };

    squatchPurchaseRepo.CancelOrder = (orderID, cb) => {
        mongoService.Delete('paypal_orders', { _id: new ObjectID(orderID) }, (err, results) => {
            return cb(err, results);
        });
    };

    squatchPurchaseRepo.GetOrder = (orderID, cb) => {
        mongoService.Read('paypal_orders', { _id: new ObjectID(orderID) }, (order_err, paymentObj) => {
            if (order_err) {
                return cb(order_err);
            } else {
                paymentService.GetPayment(paymentObj[0].OrderDetails.id, (err, results) => {
                    return cb(err, results);
                })
            };
        });
    };

    squatchPurchaseRepo.RefundOrder = (orderID, cb) => {
        squatchPurchaseRepo.GetOrder = (order_err, order) => {
            if (order_err) {
                return cb(order_err);
            }
            const saleID = order.tramsaction[0].related_resources[0].sale.id;
            const refundPrice = Number(order.tramsactions[0].amount.total);

            paymentService.RefundPayment(saleID, refundPrice, (err, refund) => {
                cb(err, refund);
            });
        };
    };

    squatchPurchaseRepo.BuyRecurring = (planName, description, setUpFee, cb) => {
        let planObj = {
            PlanID: ''
        };
        mongoService.Create('paypal_plans', planObj, (err, results) => {
            const returnUrl = 'http://localhost:8080/recurring_success/' + results.insertedIds[0];
            const cancelUrl = 'http://localhost:8080/recurring_cancel/' + results.insertedIds[0];

            const chargeModels = [
                subService.CreateChargeModelObj(0, 'TAX'),
                subService.CreateChargeModelObj(0, 'SHIPPING')
            ];
            const paymentDefinitionsArray = [
                subService.CreatePaymentDefinitionsObj(
                    "Squatch Maintained Habitat REental", 10, 'REGULAR',
                    chargeModels, 12, 'MONTH', 1
                )
            ];
            const billingPlanAttributes = subService.CreateBillingPlanAttributesObj(
                planName, description, 'YES', cancelUrl, returnUrl, 'fixed', 0,
                paymentDefinitionsArray
            );

            subService.CreatePlan(billingPlanAttributes, (err, newPlan) => {
                mongoService.Update('paypal_plans', { _id: results.insertedIds[0] },
                    { PlanID: newPlan.id }, (err, results) => {
                        subService.UpdatePlanState(newPlan.id, 'ACTIVE', (err, u_results) => {
                            const shippingObj = subService.CreateBillingShippingObj(
                                '1 Boulder', '', 'Boulder', 'CO', 80301, 'US'
                            );
                            const agreementObj = subService.CreateBillingAgreementAttributesObj(
                                'Squatch Maintained Agreement',
                                'Maintained Squatch Habitat Description',
                                new Date(Date.now() + (5000 * 50)),
                                newPlan.id,
                                'PAYPAL',
                                shippingObj
                            );
                            subService.CreateAgreement(agreementObj, (err, response) => {
                                for (let i = 0; i < response.links.length; i++) {
                                    if (response.links[i].rel == 'approval_url') {
                                        return cb(err, response.links[i].href);
                                    }
                                };
                            });
                        });
                    });
            });
        });
    };

    squatchPurchaseRepo.ExecuteRecurring = (token, cb) => {
        subService.ExecuteAgreement(token, (err, results) => {
            return cb(err, results);
        });
    };

    squatchPurchaseRepo.GetRecurringDetails = (agreementID, cb) => {
        subService.GetAgreement(agreementID, (err, results) => {
            return cb(err, results);
        });
    };


})(
    module.exports,
    require('paypal-rest-sdk'),
    require('mongodb').ObjectId,
    require('../services/mongoService'),
    require('../services/paymentService')
        require('../services/subscriptionService')

);