const { expect } = require("chai");
const sinon = require("sinon");
const client = require("../db");
const webDB = require("../webDatabaseController");
const webCont = require("../webcontroller");

describe("verifyNino", () => {
  it("Adds NINO to the SQL query", () => {
    const queryStub = sinon.stub(client, "query");
    queryStub.resolves({ rowCount: 0 });
    webDB.verifyNino("JM113747D");
    queryStub.calledWith(`SELECT id, nino FROM claimants  
        WHERE claimants.nino = JM113747D`);
  });
});

describe("verifyDOB", () => {
  it("Should correctly format the DOB entered to match database", () => {
    expect(webCont.verifyDOB('26', '02', '1982')).to.eql(26021982);
  });
});
