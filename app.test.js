const request = require("supertest")
const app = require("./app")

describe("Test server", () => {
  test("When request default should response the GET method with home page", done => {
    request(app)
      .get("/")
      .then(response => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })

  test("It should response with login page", done => {
    request(app)
      .get("/login")
      .then(response => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })
    
  test("It should response with register page", done => {
    request(app)
      .get("/register")
      .then(response => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })
})

