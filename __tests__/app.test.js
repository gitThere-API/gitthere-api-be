require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('adds 2 locations to Jon\'s favorite list POST and GET', async () => {

      const expectation = [
        {
          id: 4,
          name: 'home',
          lat: '45.5162545',
          lng: '-122.6770558',
          address: '121 SW Salmon St, Portland, OR',
          owner_id: 2
        },
        {
          id: 5,
          name: 'work',
          lat: '45.4839101',
          lng: '-122.678486',
          address: '97202',
          owner_id: 2
        },

      ];

      await fakeRequest(app)
        .post('/api/favorites')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/favorites')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test.skip('deletes 1 location from Jon\'s favorite list DELETE', async () => {

      const expectation = [
        {
          id: 4,
          name: 'home',
          lat: '45.5162545',
          lng: '-122.6770558',
          address: '121 SW Salmon St, Portland, OR',
          owner_id: 2
        }
      ];

      await fakeRequest(app)
        .delete('/api/favorites/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('fetch Spin data GET', async () => {

      const expectation = [
        {
          'lat': expect.anything(),
          'lon': expect.anything()
        }

      ];

      const data = await fakeRequest(app)
        .get('/api/spin?lat=45.523&lon=-122.670')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation[0]);
    });

    test('fetch lime data GET', async () => {

      const expectation = [
        {
          'lat': expect.anything(),
          'lon': expect.anything()
        }

      ];

      const data = await fakeRequest(app)
        .get('/api/lime?lat=45.523&lon=-122.670')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation[0]);
    });

    test('fetch nike data GET', async () => {

      const expectation = [
        {
          'lat': expect.anything(),
          'lon': expect.anything()
        }

      ];

      const data = await fakeRequest(app)
        .get('/api/nike?lat=45.523&lon=-122.670')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation[0]);
    });

    test('fetch trimet data GET', async () => {

      const expectation =
      {
        'req': {
          'method': 'GET',
          'url': 'https://developer.trimet.org/ws/V1/stops?appID=34A6C0CDCBCCC7E4749932EA5&ll=45.523,-122.670&feet=1000',
          'headers': {}
        },
        'header': {
          'date': expect.anything(),
          'vary': 'Accept-Encoding',
          'content-encoding': 'gzip',
          'content-type': 'text/xml',
          'access-control-allow-origin': '*',
          'connection': 'close',
          'transfer-encoding': 'chunked',
          'strict-transport-security': 'max-age=31536000'
        },
        'status': 200,
        'text': expect.anything()
      }
        ;

      const data = await fakeRequest(app)
        .get('/api/trimet?lat=45.523&lng=-122.670')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('fetch trimet stop data GET', async () => {

      const expectation =
      {
        'req': {
          'method': 'GET',
          'url': 'https://developer.trimet.org/ws/v2/arrivals?appID=34A6C0CDCBCCC7E4749932EA5&locIDs=7098',
          'headers': {}
        },
        'header': {
          'date': expect.anything(),
          'vary': 'Accept-Encoding',
          'content-encoding': 'gzip',
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'connection': 'close',
          'transfer-encoding': 'chunked',
          'strict-transport-security': 'max-age=31536000'
        },
        'status': 200,
        'text': expect.anything()
      }
        ;

      const data = await fakeRequest(app)
        .get('/api/trimet/detail?locid=7098')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});

