const { billingPlan } = require('paypal-rest-sdk');

((subService, paypal, mongoService) => {

    subService.CreateBillingPlanAttributesObj = (planName, description,
        autobill, cancelUrl, returnUrl, planType, setUpFee, paymentDefiniationsArray) => {

        const billingPlanAttributes = {
            name: planName,
            description: description,
            type: planType,
            merchant_preferences: {
                auto_bill_amount: autobill,
                cancel_url: cancelUrl,
                return_url: returnUrl,
                initial_fail_amount_action: 'CONTINUE',
                max_fail_attempts: '1',
                setup_fee: {
                    currency: 'USD',
                    value: setUpFee
                }
            },
            payment_definitions: paymentDefiniationsArray
        };

        return billingPlanAttributes;
    };

    subService.CreateChargeModelObj = (amount, type) => {
        let CreateChargeModelObj = {
            amount: {
                currency: 'USD',
                value: amount
            },
            type: type
        };
        return CreateChargeModelObj;
    };

    subService.CreatePaymentDefinitionsObj = (name, price, type,
        chargeModels, cycles, frequency, interval) => {

        for (let i = 0; i < chargeModels.length; i++) {
            price += chargeModels[i].amount.value;
        }
        let paymentDefinitionsObj = {
            amount: {
                currency: 'USD',
                value: price
            },
            charge_models: chargeModels,
            cycles: cycles,
            frequency: frequency,
            frequency_interval: interval,
            name: name,
            type: type
        };
        return paymentDefinitionsObj;

    };

    subService.CreateBillingShippingObj = (addrOne, addrTwo,
        city, state, postal, countrycode) => {

        const billingObj = {
            line1: addrOne,
            line2: addrTwo,
            city: city,
            state: state,
            postal_code: postal,
            country_code: countrycode
        };
        return billingObj;
    };

    subService.CreateBillingAgreementAttributesObj = (name, description,
        startDate, planID, paymentMethod, shippingObj) => {

        let billingAgreementArributesObj = {
            name: name,
            description: description,
            start_date: startDate,
            plan: {
                id: planID
            },
            payer: {
                payment_method: paymentMethod
            },
            shipping_address: shippingObj
        };
        return billingPlanAttributes;
    };

    subService.CreateAgreementUpdateAttributesObj = (name, description,
        shippingObj) => {

        let updateArributesObj = {
            op: "replace",
            path: "/",
            value: {
                description: description,
                name: name,
                shipping_address: shippingObj
            }
        };
        return updateArributesObj;
    };

    subService.CreatePlan = (billingPlanAttributes, cb) => {
        paypal.billingPlan.create(billingPlanAttributes, (err, billingPlan) => {
            return cb(err, billingPlan);
        });
    };

    subService.GetPlan = (billingPlanID, cb) => {
        paypal.billingPlan.get(billingPlanID, (err, billingPlan) => {
            return cb(err, billingPlan);
        });
    };

    subService.UpdatePlanState = (billingPlanID, status, cb) => {
        let billing_plan_update_attributes = [{
            op: "replace",
            path: "/",
            value: { state: status }
        }];
        paypal.billingPlan.update(billingPlanID, billing_plan_update_attributes, (err, response) => {
            return cb(err, response);
        });
    };

    subService.CreateAgreement = (billingAgreementArributes, cb) => {
        paypal.billingAgreement.create(billingAgreementArributes, (err, billingAgreement) => {
            return cb(err, billingAgreement);
        });
    };

    subService.CancelAgreement = (billingAgreementID, cancelNote, cb) => {
        let cancel_note = {
            note: cancelNote
        };
        paypal.billingAgreement.cancel(billingAgreementID, cancel_note, (err, response) => {
            return cb(err, response);
        });
    };

    subService.GetAgreement = (agreementID, cb) => {
        paypal.billingAgreement.get(agreementID, (err, billingAgreement) => {
            return cb(err, billingAgreement);
        });
    };

    subService.ExecuteAgreement = (paymentToken, cb) => {
        paypal.billingAgreement.execute(paymentToken, {}, (err, billingAgreement) => {
            return cb(err, billingAgreement);
        });
    };

    subService.UpdateAgreement = (billingAgreementID, 
        billing_agreement_update_attributes, cb) => {
        paypal.billingAgreement.update(billingAgreementID, 
            billing_agreement_update_attributes, (err, response) => {
            return cb(err, response);
        });
    };


}) (
    module.exports,
    require('paypal-rest-sdk'),
    require('../services/mongoService')
)