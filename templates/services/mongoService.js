// start with IIFE: ()()
((mongoService, mongodb) => {
    const connectionString = process.env.MongoConnectionString ||
        "mongodb://localhost:27017/paypaltesting";

    const Connect = (cb) => {
        mongodb.connect(connectionString, (err, db) => {

            return cb(err, db, () => { db.close(); });
        });
    };

    mongoService.Create = (colName, createObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).insert(createObj, (err, results) => {
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
        require('mongodb')
    );