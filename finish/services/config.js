((configRepo)=>{
  configRepo.SetConfig = (paypal)=>{
    console.log("Config Hit");
    var config = {
      "host" : "api.sandbox.paypal.com",
      "port" : "",
      "client_id" : "",  // your paypal serverlication client id
      "client_secret" : "" // your paypal serverlication secret id
    }
    paypal.configure(config);
  };
})
(
  module.exports
);
