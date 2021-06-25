// start with IIFE: ()()
((mongoService, mongodb, { url1, ID1, pw1, url2, db_paypaltesting, url3 }) => {
    // mongodb = MongoClient
    const mongoLocalString = url1 + ID1 + ':' + pw1 + '@' + url2
        + db_paypaltesting + url3;

    const connectionString = process.env.MongoConnectionString ||
        mongoLocalString || "mongodb://localhost:27017/paypaltesting";

    options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }

    const Connect = (cb) => {
        mongodb.connect(connectionString, options, (err, client) => {
            // Connect = MongoClient.connect(url, function(err, client) {...
            // db = client, hence "const db = client.db(dbName);" becomes:
            // const actualDB = db.db(dbName)
            console.log('Mongo Atlas connecting...');
            // if (err) {
            //     console.error(err)
            // } else {
            //     console.log(db.db('paypaltesting'));
            //     return (db.db('paypaltesting'), () => {
            //         db.close();
            //     });
            cb(err, client.db(db_paypaltesting), () => {
                client.close();
            });
        });
    }

    mongoService.Create = (colName, createObj, cb) => {
        Connect((err, db, close) => {

            console.log('Mongo Atlas connected');
            console.log('colName:', colName, 'createObj:', createObj);
            //Here MongoDB didn't automatically create the database (3-4/2:10)

            console.log(db.s.namespace);
            db.collection(colName).insertOne(createObj, (err, results) => {
                console.log(results.ops[0]);
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Read = (colName, creadObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).find(creadObj).toArray((err, results) => {
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Update = (colName, findObj, updateObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).update(findObj, { $set: updateObj }, (err, results) => {
                // $set is to ask MongoDB to just update the item and not deleting the entire file
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Delete = (colName, findObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).remove(findObj, (err, results) => {
                cb(err, results);
                return close();
            });
        });
    };

})
    (
        module.exports,
        require('mongodb').MongoClient,
        require('../../../../configVar.json').mongoDB
    );