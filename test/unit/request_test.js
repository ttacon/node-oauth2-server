'use strict';

/**
 * Module dependencies.
 */

const Request = require('../../lib/request');
const InvalidArgumentError = require('../../lib/errors/invalid-argument-error');
const should = require('chai').should();

/**
 * Test `Request`.
 */

function generateBaseRequest() {
  return {
    query: {
      foo: 'bar'
    },
    method: 'GET',
    headers: {
      bar: 'foo'
    },
    body: {
      foobar: 'barfoo'
    }
  };
}

describe('Request', function() {
  it('should throw on missing args', function () {
    const args = [
      [undefined, InvalidArgumentError, 'Missing parameter: `headers`'],
      [null, InvalidArgumentError, 'Missing parameter: `headers`'],
      [{}, InvalidArgumentError, 'Missing parameter: `headers`'],
      [{ headers: { }}, InvalidArgumentError, 'Missing parameter: `method`'],
      [{ headers: {}, method: 'GET' }, InvalidArgumentError, 'Missing parameter: `query`'],
    ];

    args.forEach(([value, error, message]) => {
      try {
        new Request(value);
      } catch (e) {
        e.should.be.instanceOf(error);
        e.message.should.equal(message);
      }
    });
  });
  it('should instantiate with a basic request', function() {
    const originalRequest = generateBaseRequest();

    const request = new Request(originalRequest);
    request.headers.should.eql(originalRequest.headers);
    request.method.should.eql(originalRequest.method);
    request.query.should.eql(originalRequest.query);
    request.body.should.eql(originalRequest.body);
  });

  it('should allow a request to be passed without a body', function() {
    const originalRequest = generateBaseRequest();
    delete originalRequest.body;

    const request = new Request(originalRequest);
    request.headers.should.eql(originalRequest.headers);
    request.method.should.eql(originalRequest.method);
    request.query.should.eql(originalRequest.query);
    request.body.should.eql({});
  });

  it('should throw if headers are not passed to the constructor', function() {
    const originalRequest = generateBaseRequest();
    delete originalRequest.headers;

    (function() {
      new Request(originalRequest);
    }).should.throw('Missing parameter: `headers`');
  });

  it('should throw if query string isn\'t passed to the constructor', function() {
    const originalRequest = generateBaseRequest();
    delete originalRequest.query;

    (function() {
      new Request(originalRequest);
    }).should.throw('Missing parameter: `query`');
  });

  it('should throw if method isn\'t passed to the constructor', function() {
    const originalRequest = generateBaseRequest();
    delete originalRequest.method;

    (function() {
      new Request(originalRequest);
    }).should.throw('Missing parameter: `method`');
  });

  it('should convert all header keys to lowercase', function() {
    const originalRequest = generateBaseRequest();
    originalRequest.headers = {
      Foo: 'bar',
      BAR: 'foo'
    };

    const request = new Request(originalRequest);
    request.headers.foo.should.eql('bar');
    request.headers.bar.should.eql('foo');
    should.not.exist(request.headers.Foo);
    should.not.exist(request.headers.BAR);
  });

  it('should include additional properties passed in the request', function() {
    const originalRequest = generateBaseRequest();
    originalRequest.custom = {
      newFoo: 'newBar'
    };

    originalRequest.custom2 = {
      newBar: 'newFoo'
    };

    const request = new Request(originalRequest);
    request.headers.should.eql(originalRequest.headers);
    request.method.should.eql(originalRequest.method);
    request.query.should.eql(originalRequest.query);
    request.body.should.eql(originalRequest.body);
    request.custom.should.eql(originalRequest.custom);
    request.custom2.should.eql(originalRequest.custom2);
  });

  it('should include additional properties passed in the request', function() {
    const originalRequest = generateBaseRequest();
    originalRequest.custom = {
      newFoo: 'newBar'
    };

    originalRequest.custom2 = {
      newBar: 'newFoo'
    };

    const request = new Request(originalRequest);
    request.headers.should.eql(originalRequest.headers);
    request.method.should.eql(originalRequest.method);
    request.query.should.eql(originalRequest.query);
    request.body.should.eql(originalRequest.body);
    request.custom.should.eql(originalRequest.custom);
    request.custom2.should.eql(originalRequest.custom2);
  });

  it('should allow getting of headers using `request.get`', function() {
    const originalRequest = generateBaseRequest();

    const request = new Request(originalRequest);
    request.get('bar').should.eql(originalRequest.headers.bar);
  });

  it('should allow getting of headers using `request.get`', function() {
    const originalRequest = generateBaseRequest();

    const request = new Request(originalRequest);
    request.get('bar').should.eql(originalRequest.headers.bar);
  });

  it('should allow getting of headers using `request.get`', function() {
    const originalRequest = generateBaseRequest();

    const request = new Request(originalRequest);
    request.get('bar').should.eql(originalRequest.headers.bar);
  });

  it('should validate the content-type', function() {
    const originalRequest = generateBaseRequest();
    originalRequest.headers['content-type'] = 'application/x-www-form-urlencoded';
    originalRequest.headers['content-length'] = JSON.stringify(originalRequest.body).length;

    const request = new Request(originalRequest);
    request.is('application/x-www-form-urlencoded').should.eql('application/x-www-form-urlencoded');
  });

  it('should return false if the content-type is invalid', function() {
    const originalRequest = generateBaseRequest();
    originalRequest.headers['content-type'] = 'application/x-www-form-urlencoded';
    originalRequest.headers['content-length'] = JSON.stringify(originalRequest.body).length;

    const request = new Request(originalRequest);
    request.is('application/json').should.eql(false);
  });
});
