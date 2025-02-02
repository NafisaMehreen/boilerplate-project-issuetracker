const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let issue1;
let issue2;

suite("Functional tests", () => {

    test("Create an issue with every field: POST request to /api/issues/{project}", (done) => { 
        chai.request(server)
            .post("/api/issues/test")
            .set("content-type", "application/json")
            .send({
                issue_title: "Issue 1",
                issue_text: "Functional test",
                created_by: "fCC",
                assigned_to: "Dom",
                status_text: "Not done",
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                issue1 = res.body;
                assert.exists(res.body._id, "ID should exist");
                assert.equal(res.body.issue_title, "Issue 1");
                assert.equal(res.body.assigned_to, "Dom");
                assert.equal(res.body.created_by, "fCC");
                assert.equal(res.body.status_text, "Not done");
                assert.equal(res.body.issue_text, "Functional test");
                done();
            });
    });

    test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
        chai.request(server)
            .post("/api/issues/test")
            .set("content-type", "application/json")
            .send({
                issue_title: "Issue 2",
                issue_text: "Functional test",
                created_by: "fCC"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.exists(res.body._id, "ID should exist");
                issue2 = res.body;
                assert.equal(res.body.issue_title, "Issue 2");
                assert.equal(res.body.issue_text, "Functional test");
                assert.equal(res.body.created_by, "fCC");
                done();
            });
    });

    test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
        chai.request(server)
            .post("/api/issues/test")
            .set("content-type", "application/json")
            .send({
                issue_title: "",
                issue_text: "",
                created_by: "fCC"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "required field(s) missing");
                done();
            });
    });

    test("View issues on a project: GET request to /api/issues/{project}", (done) => {
        chai.request(server)
            .get("/api/issues/test")
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, "Response should be an array");
                done();
            });
    });

    test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
        chai.request(server)
            .get("/api/issues/test")
            .query({ _id: issue1._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, "Response should be an array");
                assert.equal(res.body[0].issue_title, issue1.issue_title);
                assert.equal(res.body[0].issue_text, issue1.issue_text);
                done();
            });
    });

    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
        chai.request(server)
            .get("/api/issues/test")
            .query({
                issue_title: issue1.issue_title,
                issue_text: issue1.issue_text
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body, "Response should be an array");
                assert.equal(res.body[0].issue_title, issue1.issue_title);
                assert.equal(res.body[0].issue_text, issue1.issue_text);
                done();
            });
    });

    test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
        chai.request(server)
            .put("/api/issues/test")
            .send({
                _id: issue1._id,       
                issue_title: "Updated title"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, issue1._id);
                done();
            });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}',(done)=> {
        chai.request(server)
            .put("/api/issues/test")
            .send({
                _id: issue1._id,
                issue_title: "update",
                issue_text: "update",
            })
            .end((err,res)=> {
                assert.equal(res.status, 200);
                assert.equal(res.body.result,"successfully updated");
                assert.equal(res.body._id, issue1._id);
                done();
            })
    })

    test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
        chai.request(server)
            .put("/api/issues/test")
            .send({
                issue_title: "random",
                issue_text: "random"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });

    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
        chai.request(server)
            .put("/api/issues/test")
            .send({ _id: issue1._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "no update field(s) sent");
                done();
            });
    });

    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
        chai.request(server)
            .put("/api/issues/test")
            .send({
                _id: "invalidID123",
                issue_title: "update"
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not update");
                done();
            });
    });

    test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server)
            .delete("/api/issues/test")
            .send({ _id: issue1._id })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully deleted");
                done();
            });
    });

    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server)
            .delete("/api/issues/test")
            .send({ _id: "invalidID123" })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not delete");
                done();
            });
    });

    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server)
            .delete("/api/issues/test")
            .send({})
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });
    });

});
