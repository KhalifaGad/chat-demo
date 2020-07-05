const mongoose= require('mongoose');
// connectDB: responsible for database connection using mongoose,
// @param(dbURL): url for database
module.exports=function connectDB(dbURL) {
  return mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });
}

