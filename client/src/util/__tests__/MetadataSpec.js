/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import MetadataSingleton from '../Metadata';

const Metadata = MetadataSingleton.__proto__.constructor;


describe('Metadata', function() {

  describe('init', function() {

    it('should initialize', function() {

      // given
      const metadata = new Metadata();

      const name = 'name',
            version = 'version';

      // when
      metadata.init({
        name,
        version
      });

      // then
      expect(metadata).to.have.property('name').equal(name);
      expect(metadata).to.have.property('version').equal(version);

      expect(window.appVersion).to.equal(version);
    });

  });

});
