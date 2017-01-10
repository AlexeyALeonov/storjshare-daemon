'use strict';

const utils = require('../lib/utils');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const {expect} = require('chai');

describe('module:utils', function() {

  describe('#_isValidPayoutAddress', function() {

    it('should return true for valid mainnet', function() {
      expect(utils._isValidPayoutAddress(
        '1ATyTAjFpeU2RrwVzk9YEa2vxQJos4xdqX'
      )).to.equal(true);
    });

    it('should return true for valid testnet', function() {
      expect(utils._isValidPayoutAddress(
        '2MsP1UsraqLpY7A1ZeegT7H7okWWkBbk2AS'
      )).to.equal(true);
    });

    it('should return false for invalid address', function() {
      expect(utils._isValidPayoutAddress(
        '1234 Fake Street'
      )).to.equal(false);
    });

  });

  describe('#_isValidDirectory', function() {

    it('should return the the result of existsSync', function() {
      let existsSync = sinon.stub(utils, 'existsSync').returns(true);
      expect(utils._isValidDirectory('some/directory/path')).to.equal(true);
      existsSync.restore();
    });

    it('should return the the result of existsSync', function() {
      let existsSync = sinon.stub(utils, 'existsSync').returns(false);
      expect(utils._isValidDirectory('some/directory/path')).to.equal(false);
      existsSync.restore();
    });

  });

  describe('#_isValidSize', function() {

    it('should return true for positive numbers', function() {
      expect(utils._isValidSize(1)).to.equal(true);
    });

    it('should return false for 0 or less', function() {
      expect(utils._isValidSize(0)).to.equal(false);
      expect(utils._isValidSize(-1)).to.equal(false);
    });

    it('should return false for undefined', function() {
      expect(utils._isValidSize()).to.equal(false);
    });

  });

  describe('#validate', function() {

    it('should not throw if valid', function() {
      let _isValidDirectory = sinon.stub(
        utils,
        '_isValidDirectory'
      ).returns(true);
      expect(function() {
        utils.validate({
          paymentAddress: '2MsP1UsraqLpY7A1ZeegT7H7okWWkBbk2AS',
          storagePath: 'some/directory/path',
          storageAllocation: '1KB'
        });
      }).to.not.throw(Error);
      _isValidDirectory.restore();
    });

    it('should throw if not valid', function() {
      let _isValidDirectory = sinon.stub(
        utils,
        '_isValidDirectory'
      ).returns(false);
      expect(function() {
        utils.validate({
          paymentAddress: '2MsP1UsraqLpY7A1ZeegT7H7okWWkBbk2AS',
          storagePath: 'some/directory/path',
          storageAllocation: '1KB'
        });
      }).to.throw(Error);
      _isValidDirectory.restore();
    });

  });

  describe('#validateAllocation', function() {

    it('should callback null if valid', function(done) {
      let getFreeSpace = sinon.stub(
        utils,
        'getFreeSpace'
      ).callsArgWith(1, null, 1024);
      let getDirectorySize = sinon.stub(
        utils,
        'getDirectorySize'
      ).callsArgWith(1, null, 512);
      utils.validateAllocation({
        storageAllocation: '512B',
        storagePath: 'some/directory/path'
      }, function(err) {
        getFreeSpace.restore();
        getDirectorySize.restore();
        expect(err).to.equal(null);
        done();
      });
    });

    it('should callback error if cannot get size', function(done) {
      let getFreeSpace = sinon.stub(
        utils,
        'getFreeSpace'
      ).callsArgWith(1, null, 1024);
      let getDirectorySize = sinon.stub(
        utils,
        'getDirectorySize'
      ).callsArgWith(1, new Error('Failed to get size'));
      utils.validateAllocation({
        storageAllocation: '512B',
        storagePath: 'some/directory/path'
      }, function(err) {
        getFreeSpace.restore();
        getDirectorySize.restore();
        expect(err.message).to.equal('Failed to get size');
        done();
      });
    });

    it('should callback error if invalid', function(done) {
      let getFreeSpace = sinon.stub(
        utils,
        'getFreeSpace'
      ).callsArgWith(1, null, 512);
      let getDirectorySize = sinon.stub(
        utils,
        'getDirectorySize'
      ).callsArgWith(1, null, 512);
      utils.validateAllocation({
        storageAllocation: '2048B',
        storagePath: 'some/directory/path'
      }, function(err) {
        getFreeSpace.restore();
        getDirectorySize.restore();
        expect(err.message).to.equal('Invalid storage size');
        done();
      });
    });

  });

  describe('#existsSync', function() {

    it('should return true if statSync success', function() {
      let _utils = proxyquire('../lib/utils', {
        fs: {
          statSync: sinon.stub().returns({})
        }
      });
      expect(_utils.existsSync('some/directory/path')).to.equal(true);
    });

    it('should return false if statSync false', function() {
      let _utils = proxyquire('../lib/utils', {
        fs: {
          statSync: sinon.stub().throws(new Error(''))
        }
      });
      expect(_utils.existsSync('some/directory/path')).to.equal(false);
    });

  });

});
