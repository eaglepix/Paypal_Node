((configRepo) => {

    configRepo.SetConfig = (paypal) => {
        const config = {
            host: 'api.sandbox.paypal.com',
            port: '',
            client_id: '',
            client_secret: ''
        };

        paypal.configure(config);
    }

})
    (
        module.exports
    );