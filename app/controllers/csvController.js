const csv = require("csvtojson");
const csvuser = require("../model/csvModel");
class csvController {
  async getFile(req, res) {
    try {
      const data = await csvuser.find({});
      res.status(200).json({ message: "Get", data: data });
    } catch (error) {
      console.log(error);
    }
  }
  async addcsvFile(req, res) {
    try {
      let userdata = [];
      csv()
        .fromFile(req.file.path)
        .then(async (response) => {
          for (let i = 0; i < response.length; i++) {
            console.log("jsjk", response);
            userdata.push({
              name: response[i].name,
              email: response[i].email,
              mobile: response[i].mobile,
            });
            console.log("userdata", userdata);
          }
          const result = await csvuser.insertMany(userdata);
          res
            .status(200)
            .json({ message: "csv upload successull", data: result });
        });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new csvController();
