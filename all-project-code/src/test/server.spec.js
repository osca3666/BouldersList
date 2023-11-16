const server = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const pgp = require('pg-promise')();

const dbTest = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const dbt = pgp(dbTest);
const { assert, expect } = chai;

chai.should();
chai.use(chaiHttp);

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', (done) => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });


  it('positive: /login - Login successful', async () => {
    const uniqueUsername = `TestUser_${Date.now()}`;
    const registrationResponse = await chai
      .request(server)
      .post('/register')
      .send({ username: uniqueUsername, password: 'test' });

    expect(registrationResponse).to.have.status(200);
    expect(registrationResponse.body.status).to.equals('success');
    assert.strictEqual(registrationResponse.body.message, 'User registered successfully.');

    const loginResponse = await chai
      .request(server)
      .post('/login')
      .send({ username: uniqueUsername, password: 'test' });

    expect(loginResponse).to.have.status(200);
    expect(loginResponse.body.status).to.equals('success');
    assert.strictEqual(loginResponse.body.message, 'Welcome!');

 
    await dbt.none('DELETE FROM users WHERE username = $1', [uniqueUsername]);
  });


  it('negative: /login - User not found', async () => {
    const nonExistentUsername = `NonExistentUser_${Date.now()}`;
    const response = await chai
      .request(server)
      .post('/login')
      .send({ username: nonExistentUsername, password: 'password' });

    expect(response).to.have.status(400);
    expect(response.body.status).to.equals('error');
    assert.strictEqual(response.body.error, 'Incorrect username or password. If you do not have an account, please register.');
  });


  it('positive: /register - Successful registration', async () => {
    const uniqueUsername = `TestUser_${Date.now()}`;
    const response = await chai
      .request(server)
      .post('/register')
      .send({ username: uniqueUsername, password: 'test' });

    expect(response).to.have.status(200);
    expect(response.body.status).to.equals('success');
    assert.strictEqual(response.body.message, 'User registered successfully.');


    await dbt.none('DELETE FROM users WHERE username = $1', [uniqueUsername]);
  });


  it('negative: /register - Duplicate username', async () => {
    const duplicateUsername = 'DuplicateUser';
    // Register the user once
    const firstRegistration = await chai
      .request(server)
      .post('/register')
      .send({ username: duplicateUsername, password: 'password' });


    const secondRegistration = await chai
      .request(server)
      .post('/register')
      .send({ username: duplicateUsername, password: 'password' });

    expect(secondRegistration).to.have.status(400);
    expect(secondRegistration.body.status).to.equals('error');
    assert.strictEqual(secondRegistration.body.message, 'Registration failed. Username already exists.');

   
    await dbt.none('DELETE FROM users WHERE username = $1', [duplicateUsername]);
  });
});
